/* ============ 音频缓存（IndexedDB，独立库） ============ */
const AudioCache = {
  db: null,
  limitMB: Settings.get('audioCacheMB', 20),
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
  key(text, rate) { return rate + '|' + text; },
  async get(text, rate) {
    try {
      const db = await this.open();
      return await new Promise((resolve) => {
        const req = db.transaction('audio', 'readonly').objectStore('audio').get(this.key(text, rate));
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    } catch { return null; }
  },
  async put(text, rate, data) {
    try {
      const db = await this.open();
      await new Promise((resolve) => {
        const tx = db.transaction('audio', 'readwrite');
        tx.objectStore('audio').put({ data, size: data.byteLength, at: Date.now() }, this.key(text, rate));
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
        modelUrl: './model.onnx',
        modelJsonUrl: './model.onnx.json',
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

    if (this.engine === 'ready') {
      return new Promise((resolve) => {
        this.queue.push({ text, rate, resolve });
        this.pumpQueue();
      });
    }
    if (this.engine === 'loading') {
      return new Promise((resolve) => {
        const t0 = Date.now();
        const wait = () => {
          if (this.engine === 'ready') {
            this.queue.push({ text, rate, resolve });
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
    AudioCache.get(item.text, item.rate).then((cached) => {
      if (!this.playing || this._current !== item) return; // 已被 stop 打断
      if (cached) {
        clearTimeout(this._synthTimer);
        this._pending(false);
        this.playing = false;
        this._current = null;
        this.playSamples(new Float32Array(cached), 22050, () => { item.resolve(true); this.pumpQueue(); });
        return;
      }
      const id = ++this.synthId;
      this.worker.postMessage({ type: 'synth', id, text: item.text, rate: item.rate });
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
      AudioCache.put(item.text, item.rate, samples.buffer); // 存入缓存（不阻塞播放）
      this.playSamples(samples, sampleRate, () => { item.resolve(true); this.pumpQueue(); });
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

  stop() {
    this.queue = [];
    clearTimeout(this._synthTimer);
    this._pending(false);
    if (this.playing && this.audioCtx) {
      try { this.audioCtx.suspend(); } catch {}
      this.playing = false;
      if (this._current) { this._current.resolve(false); this._current = null; }
    }
    if (this.usingNative) {
      try { window.Capacitor.Plugins.TextToSpeech.stop(); } catch {}
    }
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch {}
    }
  },
};
