/* tts.js — 朗读：内置 Piper 引擎(离线WASM) → 原生TTS插件 → speechSynthesis
   内置引擎音质最好且完全离线；加载失败自动降级 */
const TTS = {
  voice: null,
  rate: 0.95,
  supported: true,
  usingNative: false,
  engine: 'none',        // 'loading' | 'ready' | 'unavailable'
  audioCtx: null,
  queue: [],
  playing: false,

  init() {
    this.rate = Settings.get('rate', 0.95);
    this.usingNative = !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech);
    this.initEngine();
    this.initSystemVoices();
  },

  /* 内置离线引擎（Piper VITS WASM，美音女声） */
  async initEngine() {
    try {
      if (!window.PiperTTS) { this.engine = 'unavailable'; return; }
      this.engine = 'loading';
      await window.PiperTTS.init({
        modelUrl: 'tts-engine/model.onnx',
        modelJsonUrl: 'tts-engine/model.onnx.json',
        phonemizeWasm: 'tts-engine/piper_phonemize.wasm',
        phonemizeData: 'tts-engine/piper_phonemize.data',
        ortWasmDir: 'tts-engine/',
      });
      this.engine = 'ready';
    } catch (e) {
      console.log('piper engine fail, fallback to system', e);
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

    // 1) 内置引擎
    if (this.engine === 'ready') {
      return new Promise((resolve) => {
        this.queue.push({ text, rate, resolve });
        this.pumpQueue();
      });
    }
    if (this.engine === 'loading') {
      // 等引擎加载完再走内置，最多等 8 秒
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

    // 2) 降级：系统引擎
    return this.speakSystem(text, rate);
  },

  pumpQueue() {
    if (this.playing || !this.queue.length || this.engine !== 'ready') return;
    const item = this.queue.shift();
    this.playing = true;
    const timeout = setTimeout(() => {
      this.playing = false;
      item.resolve(false);
      this.pumpQueue();
    }, 30000);
    window.PiperTTS.synthesize(item.text, item.rate)
      .then(res => {
        clearTimeout(timeout);
        if (res) {
          this.playSamples(res.samples, res.sampleRate);
          this._onPlayDone = () => {
            this.playing = false;
            item.resolve(true);
            this.pumpQueue();
          };
        } else {
          this.playing = false;
          item.resolve(false);
          this.pumpQueue();
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        this.playing = false;
        item.resolve(false);
        this.pumpQueue();
      });
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
      source.onended = () => { if (this._onPlayDone) this._onPlayDone(); };
      source.start();
    } catch (e) {
      console.log('play fail', e);
      if (this._onPlayDone) this._onPlayDone();
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
    if (this.playing && this.audioCtx) {
      try { this.audioCtx.suspend(); } catch {}
      this.playing = false;
    }
    if (this.usingNative) {
      try { window.Capacitor.Plugins.TextToSpeech.stop(); } catch {}
    }
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch {}
    }
  },
};
