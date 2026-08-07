/* ============ 音频缓存（IndexedDB，独立库） ============ */
const AudioCache = {
  db: null,
  limitMB: Settings.get('audioCacheMB', 100),
  init() { this.open().catch(() => {}); },
  async open() {
    if (this.db) return this.db;
    this.db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('audioCache', 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('audio')) {
          req.result.createObjectStore('audio');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.db;
  },
  key(text, rate, voice) { return (voice || 'n') + '|' + rate + '|' + text; },
  /* Float32 samples → Int16 buffer（省一半空间） */
  _pack(samples) {
    const i16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      i16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return i16.buffer;
  },
  _unpack(buf) {
    const i16 = new Int16Array(buf);
    const f32 = new Float32Array(i16.length);
    for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
    return f32;
  },
  async get(text, rate, voice) {
    try {
      const db = await this.open();
      const rec = await new Promise((resolve) => {
        const req = db.transaction('audio', 'readonly').objectStore('audio').get(this.key(text, rate, voice));
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (!rec || rec.v !== 2) return null; // 旧格式（Float32）作废
      return this._unpack(rec.data);
    } catch { return null; }
  },
  async put(text, rate, voice, samples) {
    try {
      const db = await this.open();
      const buf = this._pack(samples);
      await new Promise((resolve) => {
        const tx = db.transaction('audio', 'readwrite');
        tx.objectStore('audio').put({ data: buf, size: buf.byteLength, at: Date.now(), v: 2 }, this.key(text, rate, voice));
        tx.oncomplete = resolve;
        tx.onerror = () => resolve();
      });
      this.trim();
    } catch {}
  },
  /* 超限按最旧淘汰 */
  async trim() {
    try {
      const db = await this.open();
      const limit = this.limitMB * 1024 * 1024;
      const entries = await new Promise((resolve) => {
        const out = [];
        const cur = db.transaction('audio', 'readonly').objectStore('audio').openCursor();
        cur.onsuccess = () => {
          const c = cur.result;
          if (c) { out.push({ key: c.key, size: c.value.size || 0, at: c.value.at || 0 }); c.continue(); }
          else resolve(out);
        };
        cur.onerror = () => resolve(out);
      });
      let total = entries.reduce((s, e) => s + e.size, 0);
      if (total <= limit) return;
      entries.sort((a, b) => a.at - b.at);
      const tx = db.transaction('audio', 'readwrite');
      const store = tx.objectStore('audio');
      for (const e of entries) {
        if (total <= limit) break;
        total -= e.size;
        store.delete(e.key);
      }
    } catch {}
  },
  async usage() {
    try {
      const db = await this.open();
      return await new Promise((resolve) => {
        let count = 0, bytes = 0;
        const cur = db.transaction('audio', 'readonly').objectStore('audio').openCursor();
        cur.onsuccess = () => {
          const c = cur.result;
          if (c) { count++; bytes += (c.value.size || 0); c.continue(); }
          else resolve({ count, bytes });
        };
        cur.onerror = () => resolve({ count: 0, bytes: 0 });
      });
    } catch { return { count: 0, bytes: 0 }; }
  },
  async clear() {
    try {
      const db = await this.open();
      await new Promise((resolve) => {
        const tx = db.transaction('audio', 'readwrite');
        tx.objectStore('audio').clear();
        tx.oncomplete = resolve;
        tx.onerror = () => resolve();
      });
    } catch {}
  },
};

/* ============ TTS 引擎 ============ */
const TTS = {
  voice: null,
  rate: 0.95,
  supported: true,
  usingNative: false,
  engine: 'none',        // 'loading' | 'ready' | 'unavailable'
  audioCtx: null,
  queue: [],
  playing: false,
  worker: null,
  synthId: 0,
  pendingCount: 0,
  onPending: null,       // 回调：合成开始/结束（true/false）

  init() {
    this.rate = Settings.get('rate', 0.95);
    this.usingNative = !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech);
    AudioCache.init();
    this.initEngine();
    this.initSystemVoices();
  },

  /* 内置离线引擎（Piper VITS WASM，Web Worker 运行） */
  initEngine() {
    try {
      if (typeof Worker === 'undefined') { this.engine = 'unavailable'; return; }
      this.engine = 'loading';
      this.worker = new Worker('tts-engine/tts-worker.js');
      this.worker.onmessage = (e) => {
        const d = e.data;
        if (d.type === 'ready') {
          this.engine = 'ready';
          this.pumpQueue();
        } else if (d.type === 'result') {
          this._onResult(d.id, d.samples, d.sampleRate);
        } else if (d.type === 'error') {
          this._onError(d.id, d.message);
        }
      };
      this.worker.onerror = (e) => {
        console.log('tts worker error', e.message);
        this.engine = 'unavailable';
        this._drainFail();
      };
      this.worker.postMessage({
        type: 'init',
        modelUrls: { n: './model.onnx', f: './model.onnx', m: './modelMale.onnx' },
        modelJsons: { n: './model.onnx.json', f: './model.onnx.json', m: './modelMale.onnx.json' },
        phonemizeWasm: './piper_phonemize.wasm',
        phonemizeData: './piper_phonemize.data',
        ortWasmDir: './',
      });
    } catch (e) {
      console.log('tts worker create fail', e);
      this.engine = 'unavailable';
    }
  },

  /* 系统引擎音色（降级用） */
  initSystemVoices() {
    if ('speechSynthesis' in window) {
      const pick = () => {
        const voices = speechSynthesis.getVoices();
        this.voice =
          voices.find(v => v.lang === 'en-US' && /natural|neural|samantha|aria|zira|google us english/i.test(v.name)) ||
          voices.find(v => v.lang === 'en-US') ||
          voices.find(v => v.lang.startsWith('en')) ||
          null;
      };
      pick();
      speechSynthesis.onvoiceschanged = pick;
    }
  },

  async speak(text, opts = {}) {
    if (!text) return false;
    const rate = opts.rate ?? this.rate;
    const voice = opts.voice || 'n'; // n=旁白(女), f=女声, m=男声

    // 同一句正在读 → 再点取消
    if (this.playing && this._currentText === text) {
      this.stopCurrent();
      return true;
    }
    // 别的句子在读 → 打断，播新的
    if (this.playing) {
      this.stopCurrent();
    }

    if (this.engine === 'ready') {
      return new Promise((resolve) => {
        this.queue.push({ text, rate, voice, resolve });
        this.pumpQueue();
      });
    }
    if (this.engine === 'loading') {
      // 🔴 修复"朗读读成乱七八糟"第二根因：原来每个请求各自等 8 秒后并发降级系统 TTS——
      //   多个 speakSystem 同时跑，speechSynthesis.cancel() 互相打架/声音叠读；
      //   现在 loading 期间所有请求进同一个队列，ready 后统一走 Piper 顺序合成；
      //   只有引擎真正不可用（20 秒看门狗）才一次性降级
      return new Promise((resolve) => {
        this.queue.push({ text, rate, voice, resolve });
        this._loadingFallbackTimer = this._loadingFallbackTimer || setTimeout(() => {
          this._loadingFallbackTimer = null;
          if (this.engine !== 'ready' && this.queue.length) {
            this.engine = 'unavailable';
            this._drainFail();
          }
        }, 20000);
      });
    }
    return this.speakSystem(text, rate);
  },

  pumpQueue() {
    if (this.playing || !this.queue.length || this.engine !== 'ready' || !this.worker) return;
    const item = this.queue.shift();
    // 🔴 修复"单词朗读读成乱七八糟"：所有 item 出队时统一分配合成 id（缓存命中路径也必须分配）——
    //   原来只有合成路径有 id，缓存项的 this._current.id 是 undefined → _onResult 的 id 校验
    //   `this._current.id != null` 对缓存项失效：被打断的旧合成结果到达时会打到缓存项上，
    //   播错音频 + 把旧音频写进新词的 AudioCache 缓存 → 之后点该词永远读错内容
    item.id = ++this.synthId;
    this.playing = true;
    this._current = item;
    this._pending(true);
    // 命中缓存直接播放，不再合成
    AudioCache.get(item.text, item.rate, item.voice).then((cached) => {
      if (!this.playing || this._current !== item) return; // 已被 stop 打断
      if (cached) {
        clearTimeout(this._synthTimer);
        this._pending(false);
        // 🔴 v1.1：playing 保持 true 直到播放结束（原来这里提前置 false → 播放中再点不触发打断 → 音频重叠）
        this._currentText = item.text;
        this.playSamples(new Float32Array(cached), 22050, () => this._finishItem(item, true));
        return;
      }
      this.worker.postMessage({ type: 'synth', id: item.id, text: item.text, rate: item.rate, voice: item.voice });
      // 兜底超时
      this._synthTimer = setTimeout(() => {
        if (this.playing && this._current === item) {
          this._pending(false);
          this._finishItem(item, false);
        }
      }, 30000);
    });
  },

  /* 🔴 统一完成路径：只有当前项才清播放状态；被替换/打断的旧项只 settle 不碰状态
     （旧播放的 onended 晚到时若误清新任务状态 → 新句子播放中 playing=false → 再点不打断 → 音频重叠） */
  _finishItem(item, ok) {
    const isCurrent = this._current === item;
    if (isCurrent) {
      this._currentText = null;
      this.playing = false;
      this._current = null;
    }
    item.resolve(ok);
    if (isCurrent) this.pumpQueue();
  },

  _onResult(id, samples, sampleRate) {
    // 🔴 无条件 id 校验（缓存项现在也有 id）：旧合成结果（被打断的任务）到达时直接丢弃，不能打到新 item 上
    if (!this._current || id !== this._current.id) return;
    clearTimeout(this._synthTimer);
    this._pending(false);
    const item = this._current;
    if (samples && samples.length) {
      AudioCache.put(item.text, item.rate, item.voice, samples); // 存入缓存（不阻塞播放）
      // 🔴 v1.1：playing 保持 true 直到播放结束（原来合成完成就置 false → 播放中再点不打断 → 音频重叠）
      this._currentText = item.text;
      this.playSamples(samples, sampleRate, () => this._finishItem(item, true));
    } else {
      this._finishItem(item, false);
    }
  },

  _onError(id, message) {
    console.log('tts synth error', message);
    // 🔴 无条件 id 校验同 _onResult（旧任务的错误不打到新任务上）
    if (!this._current || id !== this._current.id) return;
    clearTimeout(this._synthTimer);
    this._pending(false);
    const item = this._current;
    this._finishItem(item, false);
  },

  _drainFail() {
    // worker 挂了：清空队列，全部降级系统引擎
    clearTimeout(this._synthTimer);
    this._pending(false);
    if (this.playing && this._current) {
      const item = this._current;
      this.playing = false;
      this._current = null;
      item.resolve(this.speakSystem(item.text, item.rate));
    }
    while (this.queue.length) {
      const it = this.queue.shift();
      it.resolve(this.speakSystem(it.text, it.rate));
    }
  },

  _pending(on) {
    if (on) this.pendingCount++;
    else this.pendingCount = Math.max(0, this.pendingCount - 1);
    if (this.onPending) this.onPending(this.pendingCount > 0);
  },

  playSamples(samples, sampleRate, onDone) {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const buffer = this.audioCtx.createBuffer(1, samples.length, sampleRate);
      buffer.getChannelData(0).set(samples);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      source.onended = () => { if (this._source === source) this._source = null; if (onDone) onDone(); };
      // 🔴 v1.1：保留 source 引用——stop 时 source.stop() 会触发 onended → 播放中的 speak() promise 正常 settle（suspend 不会触发）
      this._source = source;
      source.start();
    } catch (e) {
      console.log('play fail', e);
      this._source = null;
      if (onDone) onDone();
    }
  },

  /* 系统引擎：原生 TTS 插件优先，fallback speechSynthesis */
  async speakSystem(text, rate) {
    const r = rate || this.rate; // 🔴 防御：调用方漏传 rate 时用默认（否则 u.rate=undefined 报 non-finite）
    if (this.usingNative) {
      try {
        const plugin = window.Capacitor.Plugins.TextToSpeech;
        const voiceIdx = Settings.get('voiceIdx', -1);
        // 🔴 先停掉之前的（插件默认可能排队不打断 → 点单词却先听上一句长文本）
        try { plugin.stop(); } catch {}
        this.playing = true;
        this._currentText = text;
        await plugin.speak({
          text, lang: 'en-US', rate: r, pitch: 1.0, volume: 1.0,
          ...(voiceIdx >= 0 ? { voice: voiceIdx } : {}),
        });
        this._currentText = null;
        this.playing = false;
        return true;
      } catch (e) {
        console.log('native TTS fail, fallback', e);
        this._currentText = null;
        this.playing = false;
      }
    }
    if (!('speechSynthesis' in window)) return false;
    return new Promise(resolve => {
      try { speechSynthesis.cancel(); } catch {}
      // 🔴 系统引擎也纳入 playing 状态：打断/同句再点取消/防并发叠读
      this.playing = true;
      this._currentText = text;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (this.voice) u.voice = this.voice;
      u.rate = r;
      u.onend = () => {
        if (this._currentText === text) { this._currentText = null; this.playing = false; }
        resolve(true);
      };
      u.onerror = () => {
        if (this._currentText === text) { this._currentText = null; this.playing = false; }
        resolve(false);
      };
      const keepAlive = setInterval(() => {
        if (!speechSynthesis.speaking) clearInterval(keepAlive);
        else { speechSynthesis.pause(); speechSynthesis.resume(); }
      }, 10000);
      speechSynthesis.speak(u);
    });
  },

  stopCurrent() {
    // 🔴 v1.1：清队列时逐个 resolve（否则未开始项的 promise 永不 settle → 朗读按钮永久卡三点）
    while (this.queue.length) {
      const it = this.queue.shift();
      it.resolve(false);
    }
    clearTimeout(this._synthTimer);
    this._pending(false);
    if (this.playing) {
      this.playing = false;
      if (this._current) { this._current.resolve(false); this._current = null; }
    }
    this._currentText = null;
    // 🔴 v1.1：source.stop() 触发 onended → 播放中 speak() 的 promise settle（suspend 不会触发 onended）
    if (this._source) { try { this._source.stop(); } catch {} this._source = null; }
    if (this.audioCtx) { try { this.audioCtx.suspend(); } catch {} }
    if (this.usingNative) {
      try { window.Capacitor.Plugins.TextToSpeech.stop(); } catch {}
    }
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch {}
    }
  },

  stop() {
    this.stopCurrent();
  },
};
