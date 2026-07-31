/* ui.js — 渲染 + 交互 */
const UI = {
  state: {
    tab: 'today',
    dueQueue: [],
    cardIndex: 0,
    sceneId: 'cafe',
    chatHistory: [],
    chatBusy: false,
    reviewing: false,
    autoTurn: 0,
    building: false,
  },

  init() {
    this.bindTabs();
    this.bindTheme();
    this.bindSettings();
    this.renderScenes();
    this.renderToday();
    this.renderWords();
    this.renderProfile();
    this.bindChat();
    this.bindWords();
    this.bindCardActions();

    if (!API.configured()) {
      setTimeout(() => {
        this.toast('先到设置里填 API Key 🔑');
        this.switchTab('settings');
      }, 600);
    }
  },

  /* ---------- 通用 ---------- */
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
  },

  el(id) { return document.getElementById(id); },

  /* ---------- Tab ---------- */
  bindTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
  },
  switchTab(tab) {
    this.state.tab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-page').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
    if (tab === 'today') this.renderToday();
    if (tab === 'words') this.renderWords();
    if (tab === 'settings') this.renderProfile();
    if (tab === 'chat') this.loadChatState();
  },

  /* ---------- 主题 ---------- */
  bindTheme() {
    const saved = Settings.get('theme', 'light');
    document.documentElement.dataset.theme = saved;
    this.el('themeToggle').textContent = saved === 'dark' ? '☀️' : '🌙';
    this.el('themeToggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      Settings.set('theme', next);
      this.el('themeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
    });
  },

  /* ---------- 今日复习 ---------- */
  async renderToday() {
    const due = await Words.due();
    this.state.dueQueue = due;
    this.state.cardIndex = 0;
    const done = await this.countDoneToday();
    const total = done + due.length;
    this.el('ringNum').textContent = total === 0 ? '✓' : done + '/' + total;
    const ring = this.el('ringFg');
    const frac = total === 0 ? 0 : done / total;
    ring.style.strokeDashoffset = 238.8 * (1 - frac);

    const p = Profile.load();
    const streak = p.streak || 0;
    this.el('todayDue').innerHTML = `今天待复习 <b>${due.length}</b> 个词`;
    this.el('todayTip').textContent = streak > 0 ? `已连击 ${streak} 天 🌿 复习完聊一局效果更好` : '复习完聊一局，把新词带回来';

    if (due.length > 0) this.showCard(due[0]);
    else this.showEmptyCard(done === 0 && (p.wordsLearned || 0) === 0);
  },

  async countDoneToday() {
    const all = await Words.list();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const todayDue = all.filter(w => w.srs.due <= Date.now() && w.srs.reps > 0);
    const done = all.filter(w => w.srs.due > Date.now() && w.srs.reps > 0 && w.srs.due < Date.now() + 864e5 * 2 && w.created > start.getTime() - 864e5);
    return done.length;
  },

  showCard(word) {
    this.el('cardEmpty').classList.add('hidden');
    this.el('cardActions').classList.remove('hidden');
    const area = this.el('cardArea');
    const phonetic = word.phonetic ? `<span class="card-phonetic">${word.phonetic}</span>` : '';
    area.innerHTML = `
      <div class="word-card-wrap">
        <div class="word-card" id="wordCard">
          <div class="card-face card-front">
            <div class="card-word">${this.esc(word.word)}</div>
            ${phonetic}
            <button class="card-say-btn" id="cardSay">🔊</button>
            <span class="card-hint">点卡片翻面</span>
          </div>
          <div class="card-face card-back">
            <div class="card-pos">${this.esc(word.pos || '')}</div>
            <div class="card-meaning">${this.esc(word.meaning)}</div>
            ${word.example ? `<div class="card-example">${this.esc(word.example)}</div>
            <div class="card-example-cn">${this.esc(word.exampleCn || '')}</div>` : ''}
            <button class="card-say-btn" id="cardSayBack">🔊</button>
          </div>
        </div>
      </div>`;
    const card = this.el('wordCard');
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    this.el('cardSay').addEventListener('click', e => { e.stopPropagation(); TTS.speak(word.word); });
    const sayBack = this.el('cardSayBack');
    if (sayBack) sayBack.addEventListener('click', e => {
      e.stopPropagation();
      TTS.speak(word.word + '. ' + (word.example || ''));
    });
    if (Settings.get('autoSpeak', true)) setTimeout(() => TTS.speak(word.word), 300);
  },

  showEmptyCard(firstTime = false) {
    this.el('cardEmpty').classList.remove('hidden');
    this.el('cardActions').classList.add('hidden');
    this.el('cardArea').innerHTML = '';
    const emoji = this.el('cardEmpty').querySelector('.empty-emoji');
    const p1 = this.el('cardEmpty').querySelector('p');
    const sub = this.el('cardEmpty').querySelector('.empty-sub');
    if (firstTime) {
      emoji.textContent = '🌱';
      p1.textContent = '还没有生词';
      sub.textContent = '去聊一局，或者粘贴一段英文建卡';
    } else {
      emoji.textContent = '🌿';
      p1.textContent = '今天的词都复习完了';
      sub.textContent = '去聊一局，把新词带回来';
    }
  },

  bindCardActions() {
    document.querySelectorAll('#cardActions .btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const w = this.state.dueQueue[this.state.cardIndex];
        if (!w) return;
        await SRS.applyGrade(w.id, parseInt(btn.dataset.grade, 10));
        this.state.cardIndex++;
        const next = this.state.dueQueue[this.state.cardIndex];
        if (next) this.showCard(next);
        else {
          await this.renderToday();
          if (this.state.dueQueue.length === 0) {
            this.toast('今天任务完成 🌿');
            Profile.touchStreak();
            this.el('todayGoal').textContent = '复习完了，去聊一局吧';
          }
        }
      });
    });
    this.el('goChatBtn').addEventListener('click', () => this.switchTab('chat'));
  },

  /* ---------- 对话 ---------- */
  renderScenes() {
    const wrap = this.el('sceneChips');
    wrap.innerHTML = SCENES.map(s =>
      `<button class="scene-chip ${s.id === this.state.sceneId ? 'active' : ''}" data-scene="${s.id}">${s.name}</button>`
    ).join('');
    wrap.querySelectorAll('.scene-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.state.sceneId = chip.dataset.scene;
        this.resetChat();
        wrap.querySelectorAll('.scene-chip').forEach(c => c.classList.toggle('active', c === chip));
      });
    });
  },

  resetChat() {
    this.state.chatHistory = [];
    this.state.autoTurn = 0;
    Settings.set('chatState', null);
    this.renderChatHistory();
    this.el('reviewPanel').classList.add('hidden');
    this.el('reviewPanel').innerHTML = '';
  },

  /* 对话持久化：切页/重启都能恢复 */
  saveChatState() {
    Settings.set('chatState', { sceneId: this.state.sceneId, history: this.state.chatHistory.slice(-30) });
  },
  loadChatState() {
    const s = Settings.get('chatState', null);
    if (s && s.history && s.history.length) {
      this.state.sceneId = s.sceneId || this.state.sceneId;
      this.state.chatHistory = s.history;
      document.querySelectorAll('.scene-chip').forEach(c => c.classList.toggle('active', c.dataset.scene === this.state.sceneId));
    }
    this.renderChatHistory();
  },
  renderChatHistory() {
    const area = this.el('chatArea');
    area.innerHTML = '';
    if (!this.state.chatHistory.length) {
      area.innerHTML = `<div class="chat-placeholder" id="chatPlaceholder"><div class="empty-emoji">🗣️</div><p>选一个场景，开始 3 分钟对话</p></div>`;
      return;
    }
    for (const m of this.state.chatHistory) {
      this.appendMsg(m.role === 'user' ? 'user' : 'assistant', m.content);
    }
    area.scrollTop = area.scrollHeight;
  },

  bindChat() {
    const input = this.el('chatInput');
    const send = () => this.sendMessage();
    this.el('chatSendBtn').addEventListener('click', send);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 110) + 'px';
    });

    // 开场白：进入对话 tab 时自动来一句
    const observer = new MutationObserver(() => {});
  },

  appendMsg(role, text, opts = {}) {
    const area = this.el('chatArea');
    const placeholder = this.el('chatPlaceholder');
    if (placeholder) placeholder.remove();
    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'msg-me' : 'msg-ai');
    if (opts.typing) {
      div.className += ' msg-typing';
      div.innerHTML = '<i></i><i></i><i></i>';
    } else {
      const cn = opts.cn ? `<div class="msg-cn">${this.esc(opts.cn)}</div>` : '';
      const actions = role === 'assistant' ? `<div class="msg-actions"><button class="msg-chip-btn" data-say="${this.esc(text)}">🔊 朗读</button></div>` : '';
      div.innerHTML = `<div class="msg-en">${this.esc(text)}</div>${cn}${actions}`;
      if (role === 'assistant') {
        div.querySelector('[data-say]')?.addEventListener('click', e => TTS.speak(e.target.dataset.say));
      }
    }
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
  },

  async sendMessage() {
    const input = this.el('chatInput');
    const text = input.value.trim();
    if (!text || this.state.chatBusy) return;
    if (!API.configured()) { this.toast('先到设置里填 API Key'); this.switchTab('settings'); return; }
    input.value = '';
    input.style.height = 'auto';

    const scene = SCENES.find(s => s.id === this.state.sceneId);
    this.state.chatHistory.push({ role: 'user', content: text });
    this.appendMsg('user', text);

    this.state.chatBusy = true;
    const typing = this.appendMsg('assistant', '', { typing: true });
    try {
      const reply = await Agent.run(scene, this.state.chatHistory);
      typing.remove();
      this.state.chatHistory.push({ role: 'assistant', content: reply });
      this.appendMsg('assistant', reply);
      if (Settings.get('readReply', true)) TTS.speak(reply);
      this.saveChatState();
      // 自动复盘：每 6 轮对话自动来一次，不打断下次输入
      this.state.autoTurn++;
      if (this.state.autoTurn >= 6 && !this.state.reviewing) {
        this.startReview(true);
      }
    } catch (e) {
      typing.remove();
      this.appendMsg('assistant', '⚠️ ' + (e.message || '出错了'));
      this.saveChatState();
    }
    this.state.chatBusy = false;
    this.el('reviewPanel').classList.add('hidden');
  },

  /* ---------- 复盘 ---------- */
  async startReview(auto = false) {
    if (this.state.chatHistory.length < 2) { if (!auto) this.toast('先聊几句再复盘'); return; }
    if (this.state.chatBusy || this.state.reviewing) return;
    this.state.reviewing = true;
    this.toast(auto ? '聊了 6 轮，AI 自动复盘…' : 'AI 正在复盘…');
    try {
      const review = await Agent.review(this.state.chatHistory);
      const p = Profile.load();
      p.sessions = (p.sessions || 0) + 1;
      if (review.mistakes) {
        for (const m of review.mistakes) {
          const exist = p.mistakes.find(x => x.pat === m.pattern);
          if (exist) exist.count = (exist.count || 1) + 1;
          else p.mistakes.push({ pat: m.pattern, fix: m.fix, count: 1 });
        }
        p.mistakes = p.mistakes.slice(-10);
      }
      Profile.save(p);
      this.renderReviewPanel(review);
      if (review.newWords && review.newWords.length) {
        const { added } = await Words.addMany(review.newWords.map(w => ({
          word: w.word, phonetic: w.phonetic || '', meaning: w.meaning || '',
          example: w.example || '', exampleCn: w.exampleCn || '', source: 'review',
        })));
        if (added > 0) this.toast(`复盘把 ${added} 个词加入了生词本 🌱`);
      } else if (auto) {
        this.toast('复盘完成 ✅');
      }
    } catch (e) {
      this.toast('复盘失败：' + (e.message || e));
    }
    this.state.reviewing = false;
    this.state.autoTurn = 0;
  },

  renderReviewPanel(review) {
    const panel = this.el('reviewPanel');
    const mistakes = (review.mistakes || []).map(m => `
      <div class="review-item">
        <div class="ri-word">${this.esc(m.pattern)}</div>
        <div class="ri-note">→ ${this.esc(m.fix)}<br><span style="opacity:.7">${this.esc(m.note || '')}</span></div>
      </div>`).join('');
    const words = (review.newWords || []).map(w => `
      <div class="review-item">
        <div class="ri-word">${this.esc(w.word)}</div>
        <div class="ri-note">${this.esc(w.meaning)}</div>
      </div>`).join('');
    panel.innerHTML = `
      <h3>📋 复盘 <span style="font-weight:400;color:var(--muted);font-size:12px">${this.esc(review.good || '')}</span></h3>
      ${mistakes ? `<div style="font-size:13px;font-weight:700;margin:6px 0">说错/卡壳的地方</div>${mistakes}` : ''}
      ${words ? `<div style="font-size:13px;font-weight:700;margin:10px 0 6px">已加入生词本</div>${words}` : ''}
      ${!mistakes && !words ? '<p style="color:var(--muted);font-size:13px">这次没发现明显问题，继续保持</p>' : ''}
    `;
    panel.classList.remove('hidden');
  },

  /* ---------- 生词本 ---------- */
  bindWords() {
    this.el('wordSearch').addEventListener('input', e => this.renderWords(e.target.value.trim()));
    this.el('addWordBtn').addEventListener('click', () => this.toggleBuildPanel());
    this.el('importFile').addEventListener('change', e => this.importData(e.target.files[0]));
  },

  toggleBuildPanel() {
    this.state.building = !this.state.building;
    const panel = this.el('buildPanel');
    if (this.state.building) {
      if (!panel) {
        const div = document.createElement('div');
        div.id = 'buildPanel';
        div.className = 'build-panel';
        div.innerHTML = `
          <textarea id="buildText" placeholder="粘贴英文文本（论文摘要、文章、聊天记录…），AI 会提取生词"></textarea>
          <div class="build-actions">
            <button class="btn btn-primary" id="buildExtract">🌱 提取生词</button>
            <button class="btn btn-ghost" id="buildCancel">取消</button>
          </div>
          <div id="buildResult"></div>`;
        this.el('words-toolbar')?.after(div);
      }
      const panel2 = this.el('buildPanel');
      panel2.classList.remove('hidden');
      const extract = this.el('buildExtract');
      if (extract && !extract.dataset.bound) {
        extract.dataset.bound = '1';
        extract.addEventListener('click', async () => {
          const text = this.el('buildText').value.trim();
          if (!text) { this.toast('先粘贴文本'); return; }
          extract.disabled = true; extract.textContent = '提取中…';
          try {
            const words = await Agent.buildCards(text);
            const res = this.el('buildResult');
            if (!words.length) { res.innerHTML = '<p style="color:var(--muted);font-size:13px">没提取到生词</p>'; }
            else {
              res.innerHTML = words.map(w => `
                <div class="review-item">
                  <div class="ri-word">${this.esc(w.word)} <span style="font-weight:400;color:var(--muted);font-size:12px">${this.esc(w.phonetic || '')}</span></div>
                  <div class="ri-note">${this.esc(w.meaning)}</div>
                </div>`).join('') +
                `<button class="btn btn-primary" id="buildAddAll" style="margin-top:10px;width:100%">＋ 全部加入生词本</button>`;
              this.el('buildAddAll').addEventListener('click', async () => {
                const { added } = await Words.addMany(words.map(w => ({
                  word: w.word, phonetic: w.phonetic || '', meaning: w.meaning || '',
                  example: w.example || '', exampleCn: w.exampleCn || '', source: 'build',
                })));
                this.toast(`加入 ${added} 个词 🌱`);
                res.innerHTML = '';
                this.el('buildText').value = '';
                this.renderWords();
              });
            }
          } catch (e) {
            this.toast('提取失败：' + (e.message || e));
          }
          extract.disabled = false; extract.textContent = '🌱 提取生词';
        });
      }
      this.el('buildCancel').addEventListener('click', () => this.el('buildPanel').classList.add('hidden'));
    } else if (panel) panel.classList.add('hidden');
  },

  async renderWords(filter = '') {
    const all = await Words.list();
    const sorted = all.sort((a, b) => b.created - a.created);
    const list = filter ? sorted.filter(w =>
      w.word.toLowerCase().includes(filter.toLowerCase()) || (w.meaning || '').includes(filter)) : sorted;
    const wrap = this.el('wordList');
    this.el('wordEmpty').classList.toggle('hidden', list.length > 0);
    if (!list.length) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = list.map(w => `
      <div class="word-item ${(w.srs.reps > 0 && w.srs.due > Date.now() + 20 * 864e5) ? 'mastered' : ''}" data-id="${w.id}">
        <div class="wi-main">
          <div class="wi-word">${this.esc(w.word)}${w.phonetic ? `<span class="wi-phon">${this.esc(w.phonetic)}</span>` : ''}</div>
          <div class="wi-meaning">${this.esc(w.meaning)}${w.source === 'review' ? ' <span class="wi-state">· 对话</span>' : w.source === 'build' ? ' <span class="wi-state">· 建卡</span>' : ''}</div>
        </div>
        <button class="wi-say" data-say="${this.esc(w.word)}">🔊</button>
        <button class="wi-del" data-del="${w.id}">✕</button>
      </div>`).join('');
    wrap.querySelectorAll('.wi-say').forEach(b => b.addEventListener('click', e => TTS.speak(e.target.dataset.say)));
    wrap.querySelectorAll('.wi-del').forEach(b => b.addEventListener('click', async e => {
      await Words.remove(e.target.dataset.del);
      this.renderWords(this.el('wordSearch').value.trim());
    }));
  },

  /* ---------- 设置 ---------- */
  bindSettings() {
    const bind = (id, key, isSelect) => {
      const el = this.el(id);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = Settings.get(key, true);
        el.addEventListener('change', () => {
          Settings.set(key, el.checked);
          if (key === 'autoSpeak') { /* nothing */ }
        });
      } else if (el.type === 'range') {
        el.value = Settings.get(key, 0.95);
        el.addEventListener('change', () => { Settings.set(key, parseFloat(el.value)); TTS.rate = parseFloat(el.value); });
      } else {
        el.value = Settings.get(key, isSelect ? (key === 'chatModel' ? 'deepseek-v4-flash' : 'mimo-v2.5') : '');
        el.addEventListener('change', () => Settings.set(key, el.value));
      }
    };
    bind('setApiKey', 'apiKey');
    bind('setChatModel', 'chatModel', true);
    bind('setBuildModel', 'buildModel', true);
    bind('setApiBase', 'apiBase');
    bind('setAutoSpeak', 'autoSpeak');
    bind('setReadReply', 'readReply');
    bind('setRate', 'rate');

    const keyInput = this.el('setApiKey');
    keyInput.addEventListener('change', () => { API.key = keyInput.value; });

    // 保存按钮：一次性写入全部 AI 配置
    this.el('saveAiBtn').addEventListener('click', () => {
      const key = this.el('setApiKey').value.trim();
      const base = this.el('setApiBase').value.trim();
      Settings.set('apiKey', key);
      Settings.set('apiBase', base);
      Settings.set('chatModel', this.el('setChatModel').value);
      Settings.set('buildModel', this.el('setBuildModel').value);
      API.loadConfig();
      this.toast('已保存 ✅');
    });

    // 测试连接
    this.el('testAiBtn').addEventListener('click', async () => {
      const key = this.el('setApiKey').value.trim();
      const base = this.el('setApiBase').value.trim();
      if (!key) { this.toast('先填 API Key'); return; }
      API.key = key; API.base = base;
      const res = this.el('testResult');
      res.className = 'test-result';
      res.textContent = '测试中…';
      this.el('testAiBtn').disabled = true;
      try {
        const reply = await API.test();
        res.className = 'test-result ok';
        res.textContent = '✅ 连接成功：' + reply;
        Settings.set('apiKey', key);
        Settings.set('apiBase', base);
        API.loadConfig();
      } catch (e) {
        res.className = 'test-result err';
        res.textContent = '❌ ' + (e.message || e);
      }
      this.el('testAiBtn').disabled = false;
    });

    this.el('exportBtn').addEventListener('click', () => this.exportData());
    this.el('importBtn').addEventListener('click', () => this.el('importFile').click());
  },

  renderProfile() {
    const p = Profile.load();
    const lines = [
      `水平：${p.level}`,
      `对话局数：${p.sessions || 0}`,
      `累计学词：${p.wordsLearned || 0}`,
      `连击：${p.streak || 0} 天`,
    ];
    if (p.mistakes && p.mistakes.length) {
      lines.push('常犯：' + p.mistakes.slice(0, 3).map(m => m.pat).join(' / '));
    }
    this.el('profileView').textContent = lines.join('\n');
  },

  exportData() {
    Words.list().then(async words => {
      const data = { words, profile: Profile.load(), settings: {
        apiBase: Settings.get('apiBase', ''), chatModel: Settings.get('chatModel', ''), buildModel: Settings.get('buildModel', ''),
      }};
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'englishapp-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  },

  async importData(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.words && Array.isArray(data.words)) {
        let n = 0;
        for (const w of data.words) {
          const exist = await Words.findByWord(w.word);
          if (exist) continue;
          await Words.add({ word: w.word, phonetic: w.phonetic || '', meaning: w.meaning || '',
            example: w.example || '', exampleCn: w.exampleCn || '', source: w.source || 'import' });
          n++;
        }
        if (data.profile) Profile.save(data.profile);
        this.toast(`导入 ${n} 个词`);
        this.renderWords();
      }
    } catch (e) {
      this.toast('导入失败：' + e.message);
    }
    this.el('importFile').value = '';
  },

  /* ---------- 工具 ---------- */
  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
};
