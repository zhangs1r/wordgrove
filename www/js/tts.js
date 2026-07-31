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
      return new Promise((resolve) => {
        const t0 = Date.now();
        const wait = () => {
          if (this.engine === 'ready') {
            this.queue.push({ text, rate, voice, resolve });
            this.pumpQueue();
          } else if (this.engine === 'unavailable' || Date.now() - t0 > 8000) {
            resolve(this.speakSystem(text, rate));
          } else {
            setTimeout(wait, 150);
          }
        };
        wait();
      });
    }
    return this.speakSystem(text, rate);
  },

  pumpQueue() {
    if (this.playing || !this.queue.length || this.engine !== 'ready' || !this.worker) return;
    const item = this.queue.shift();
    this.playing = true;
    this._current = item;
    this._pending(true);
    // 命中缓存直接播放，不再合成
    AudioCache.get(item.text, item.rate, item.voice).then((cached) => {
      if (!this.playing || this._current !== item) return; // 已被 stop 打断
      if (cached) {
        clearTimeout(this._synthTimer);
        this._pending(false);
        this.playing = false;
        this._current = null;
        this._currentText = item.text;
        this.playSamples(new Float32Array(cached), 22050, () => {
          this._currentText = null;
          item.resolve(true); this.pumpQueue();
        });
        return;
      }
      const id = ++this.synthId;
      this.worker.postMessage({ type: 'synth', id, text: item.text, rate: item.rate, voice: item.voice });
      // 兜底超时
      this._synthTimer = setTimeout(() => {
        if (this.playing && this._current === item) {
          this._pending(false);
          this.playing = false;
          this._current = null;
          item.resolve(false);
          this.pumpQueue();
        }
      }, 30000);
    });
  },

  _onResult(id, samples, sampleRate) {
    if (!this._current) return;
    clearTimeout(this._synthTimer);
    this._pending(false);
    this.playing = false;
    const item = this._current;
    this._current = null;
    if (samples && samples.length) {
      AudioCache.put(item.text, item.rate, item.voice, samples); // 存入缓存（不阻塞播放）
      this._currentText = item.text;
      this.playSamples(samples, sampleRate, () => {
        this._currentText = null;
        item.resolve(true); this.pumpQueue();
      });
    } else {
      item.resolve(false);
      this.pumpQueue();
    }
  },

  _onError(id, message) {
    console.log('tts synth error', message);
    if (!this._current) return;
    clearTimeout(this._synthTimer);
    this._pending(false);
    this.playing = false;
    const item = this._current;
    this._current = null;
    item.resolve(false);
    this.pumpQueue();
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
      source.onended = () => { if (onDone) onDone(); };
      source.start();
    } catch (e) {
      console.log('play fail', e);
      if (onDone) onDone();
    }
  },

  /* 系统引擎：原生 TTS 插件优先，fallback speechSynthesis */
  async speakSystem(text, rate) {
    if (this.usingNative) {
      try {
        const plugin = window.Capacitor.Plugins.TextToSpeech;
        const voiceIdx = Settings.get('voiceIdx', -1);
        await plugin.speak({
          text, lang: 'en-US', rate, pitch: 1.0, volume: 1.0,
          ...(voiceIdx >= 0 ? { voice: voiceIdx } : {}),
        });
        return true;
      } catch (e) {
        console.log('native TTS fail, fallback', e);
      }
    }
    if (!('speechSynthesis' in window)) return false;
    return new Promise(resolve => {
      try { speechSynthesis.cancel(); } catch {}
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (this.voice) u.voice = this.voice;
      u.rate = rate;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      const keepAlive = setInterval(() => {
        if (!speechSynthesis.speaking) clearInterval(keepAlive);
        else { speechSynthesis.pause(); speechSynthesis.resume(); }
      }, 10000);
      speechSynthesis.speak(u);
    });
  },

  stopCurrent() {
    this.queue = [];
    clearTimeout(this._synthTimer);
    this._pending(false);
    if (this.playing) {
      this.playing = false;
      if (this._current) { this._current.resolve(false); this._current = null; }
    }
    this._currentText = null;
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
