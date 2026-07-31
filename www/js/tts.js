/* tts.js — 本地语音朗读（speechSynthesis，系统 TTS 引擎） */
const TTS = {
  voice: null,
  rate: 0.95,
  supported: 'speechSynthesis' in window,

  init() {
    if (!this.supported) return;
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
    this.rate = Settings.get('rate', 0.95);
  },

  speak(text, opts = {}) {
    return new Promise(resolve => {
      if (!this.supported || !text) return resolve(false);
      try { speechSynthesis.cancel(); } catch {}
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (this.voice) u.voice = this.voice;
      u.rate = opts.rate ?? this.rate;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      // 解决 Chrome 系长文本静默 bug
      const keepAlive = setInterval(() => {
        if (!speechSynthesis.speaking) clearInterval(keepAlive);
        else { speechSynthesis.pause(); speechSynthesis.resume(); }
      }, 10000);
      speechSynthesis.speak(u);
    });
  },

  stop() {
    if (this.supported) { try { speechSynthesis.cancel(); } catch {} }
  },
};
