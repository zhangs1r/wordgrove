/* tts.js — 朗读：内置 Piper 引擎(Web Worker 离线合成) → 原生TTS插件 → speechSynthesis
   合成在 worker 里跑，UI 不卡；合成期间通过 onPending 回调显示"生成音频"动画 */
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
    const id = ++this.synthId;
    this.worker.postMessage({ type: 'synth', id, text: item.text, rate: item.rate });
    // 兜底超时
    this._synthTimer = setTimeout(() => {
      if (this.playing && this._current === item) {
        this._pending(false);
        this.playing = false;
        item.resolve(false);
        this.pumpQueue();
      }
    }, 30000);
  },

  _onResult(id, samples, sampleRate) {
    if (!this._current) return;
    clearTimeout(this._synthTimer);
    this._pending(false);
    this.playing = false;
    const item = this._current;
    this._current = null;
    if (samples && samples.length) {
      this.playSamples(samples, sampleRate);
      this._playDone = () => { item.resolve(true); this.pumpQueue(); };
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

  playSamples(samples, sampleRate) {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const buffer = this.audioCtx.createBuffer(1, samples.length, sampleRate);
      buffer.getChannelData(0).set(samples);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      source.onended = () => { if (this._playDone) this._playDone(); };
      source.start();
    } catch (e) {
      console.log('play fail', e);
      if (this._playDone) this._playDone();
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
