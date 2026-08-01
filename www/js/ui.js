/* ui.js — 渲染 + 交互 */
const Icons = {
  sprout: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12"/><path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z"/><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M9 22h6"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  review: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg>',
  mug: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8H7l-1.2-5h12.4L17 8z"/><path d="M17 8c0 2.5-2.2 4.5-5 4.5S7 10.5 7 8"/><path d="M12 12.5V19"/><path d="M8 22h8"/></svg>',
  book: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>',
  undo: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
  more: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
  earth: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  pen: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  };

const UI = {
  state: {
    tab: 'today',
    dueQueue: [],
    cardIndex: 0,

    busy: false,
    dark: false,
    chatBusy: false,
    chatHistory: [],
    chatTitle: '',
    reviewing: false,
    autoTurn: 0,
    building: false,
    convId: null,
    convTitle: '',
    _naming: false,
    hintMode: false,
    hintBox: null,
    genType: 'world',
    rpMode: false,
    rpWorld: null,
    rpChars: [],
    rpHistory: [],
    rpBusy: false,
    wordSet: new Set(),
    _queryBusy: false,
    tagFilter: '',
    rpPlayer: null,
    rpRoster: {},
    rpStep: '',
    rpPendingRoles: [],
    rpActiveChars: [],
  },

  init() {
    this.injectIcons();
    this.bindTabs();
    this.bindTheme();
    this.bindSettings();
    this.bindAudioCache();
    this.bindConv();
    this.bindTavern();
    this.bindMsgDismiss();
    this.loadWordsSet();
    Agent.refreshForgetWords();
    this.renderToday();
    this.renderWords();
    this.renderProfile();
    this.bindChat();
    this.bindWords();
    this.bindCardActions();
    this.loadTtsVoices();
    this.loadChatState(); // 启动时加载最近会话（仅此一次；之后会话状态由 newConv/switchConv/startRp 管理）

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

  /* 朗读按钮：SVG 喇叭 + 点击反馈（生成三点 → 播放声波） */
  sayIcon() {
    return '<svg class="ic-say" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<path d="M11 5 6 9H2v6h4l5 4V5z"/>'
      + '<path d="M15.5 8.5a5 5 0 0 1 0 7"/>'
      + '<path d="M18.5 5.5a9 9 0 0 1 0 13"/>'
      + '</svg>';
  },
  addSpeakListener(btn, text, voice) {
    if (!btn) return;
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (btn.dataset.busy) return;
      btn.dataset.busy = '1';
      btn.classList.add('tts-btn-loading');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span class="tts-dots"><span></span><span></span><span></span></span>';
      await TTS.speak(text, { voice });
      btn.classList.remove('tts-btn-loading');
      btn.innerHTML = orig;
      delete btn.dataset.busy;
    });
  },

  /* 静态 SVG 图标注入（tab/标题/关闭按钮） */
  injectIcons() {
    const tabMap = { today: Icons.sprout, chat: Icons.chat, tavern: Icons.mug, words: Icons.book, settings: Icons.gear };
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const icon = tabMap[btn.dataset.tab];
      if (icon) {
        const el = btn.querySelector('.tab-icon');
        if (el) el.innerHTML = icon;
      }
    });
    const btnMap = {
      convListBtn: Icons.menu, convNewBtn: Icons.plus,
      tavernClose: Icons.x, genClose: Icons.x, wordClose: Icons.x, convClose: Icons.x,
      tavernHeadIcon: Icons.mug, worldHeadIcon: Icons.earth, charHeadIcon: Icons.user,
      emptyToday: Icons.sprout, emptyChat: Icons.chat, emptyWords: Icons.book,
      apiKeyClearBtn: Icons.x,
      chatReviewBtn: Icons.review,
    };
    Object.entries(btnMap).forEach(([id, svg]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = svg;
    });
    const bm = document.querySelector('.brand-mark');
    if (bm) bm.innerHTML = Icons.sprout;
  },

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
    if (tab === 'tavern') this.renderTavern();
    if (tab === 'settings') this.renderProfile();
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
    const p = Profile.load();
    const streak = p.streak || 0;

    // 数据卡：学词 / 对话局数 / 连击 / API 余额
    const stats = this.el('dashStats');
    if (stats) {
      stats.innerHTML = `
        <div class="stat-card"><div class="stat-num">${p.wordsLearned || 0}</div><div class="stat-label">累计学词</div></div>
        <div class="stat-card"><div class="stat-num">${p.sessions || 0}</div><div class="stat-label">对话局数</div></div>
        <div class="stat-card"><div class="stat-num">${streak}</div><div class="stat-label">连击天数</div></div>
        <div class="stat-card"><div class="stat-num" id="dashBalance">…</div><div class="stat-label">API 余额</div></div>`;
      this.loadBalance();
    }

    // 排行榜：忘词 / 表达 / 常犯错
    const words = await Words.list();
    const forgotTop = words.filter(w => (w.forgot || 0) > 0).sort((a, b) => (b.forgot || 0) - (a.forgot || 0)).slice(0, 5);
    const exps = Settings.get('expressions', []);
    const expTop = exps.slice(0, 5);
    const mistakes = (p.mistakes || []).slice(0, 5);
    const ranks = this.el('dashRanks');
    if (ranks) {
      const chips = (arr, fn) => arr.length ? `<div class="rank-chips">${arr.map(fn).join('')}</div>` : '<p class="rank-empty">暂无数据</p>';
      ranks.innerHTML = `
        <div class="rank-block">
          <div class="rank-title">${Icons.sprout} 最常忘的词</div>
          ${chips(forgotTop, w => `<button class="tag-chip rank" data-rw="${this.esc(w.word)}">${this.esc(w.word)} · 忘${w.forgot}</button>`)}
        </div>
        <div class="rank-block">
          <div class="rank-title">${Icons.bulb} 最近积累的表达</div>
          ${chips(expTop, e => `<span class="tag-chip">${this.esc(typeof e === 'string' ? e : (e.en || e.better || ''))}</span>`)}
        </div>
        <div class="rank-block">
          <div class="rank-title">${Icons.chat} 常犯的口语错误</div>
          ${chips(mistakes, m => `<span class="tag-chip">${this.esc(m.pat)}${m.count > 1 ? ' · ' + m.count : ''}</span>`)}
        </div>`;
      ranks.querySelectorAll('[data-rw]').forEach(b => b.addEventListener('click', () => this.showWordQuery(b.dataset.rw)));
    }

  },

  /* API 余额（缓存 5 分钟） */
  async loadBalance() {
    const el = this.el('dashBalance');
    if (!el) return;
    const cached = Settings.get('balanceCache', null);
    if (cached && Date.now() - cached.at < 5 * 60 * 1000) { el.textContent = cached.text; return; }
    if (!API.configured()) { el.textContent = '未配置'; return; }
    try {
      const b = await API.getBalance();
      const text = b && b.total ? b.total : '—';
      el.textContent = text;
      Settings.set('balanceCache', { at: Date.now(), text });
    } catch { el.textContent = '—'; }
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
            <button class="card-say-btn" id="cardSay">${this.sayIcon()}</button>
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
    this.addSpeakListener(this.el('cardSay'), word.word);
    const sayBack = this.el('cardSayBack');
    if (sayBack) this.addSpeakListener(sayBack, word.word + '. ' + (word.example || ''));
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
      emoji.innerHTML = Icons.sprout;
      p1.textContent = '还没有生词';
      sub.textContent = '去聊一局，或者粘贴一段英文建卡';
    } else {
      emoji.innerHTML = Icons.sprout;
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
        // 记得 → 清除一次忘记次数
        if (parseInt(btn.dataset.grade, 10) >= 3 && (w.forgot || 0) > 0) {
          await Words.update(w.id, { forgot: (w.forgot || 0) - 1 });
          Agent.refreshForgetWords();
        }
        this.state.cardIndex++;
        const next = this.state.dueQueue[this.state.cardIndex];
        if (next) this.showCard(next);
        else {
          await this.renderToday();
          if (this.state.dueQueue.length === 0) {
            this.toast('今天任务完成');
            Profile.touchStreak();
            this.el('todayGoal').textContent = '复习完了，去聊一局吧';
          }
        }
      });
    });
    const goChat = this.el('goChatBtn');
    if (goChat) goChat.addEventListener('click', () => this.switchTab('chat'));
  },

  /* ---------- 对话 ---------- */
  /* （场景系统已移除，对话直接进日常模式） */

  /* ================= 会话管理 ================= */
  listConversations() {
    return Settings.get('conversations', []);
  },
  saveConversation(conv) {
    const list = this.listConversations().filter(c => c.id !== conv.id);
    list.push(conv);
    Settings.set('conversations', list);
  },
  deleteConversation(id) {
    Settings.set('conversations', this.listConversations().filter(c => c.id !== id));
  },
  currentConv() {
    return {
      id: this.state.convId || ('c_' + Date.now()),
      title: this.state.convTitle || '',
      history: this.state.chatHistory,
      updated: Date.now(),
    };
  },
  newConv() {
    if (this.state.rpMode) { this.exitRp(); return; }
    // 旧会话有内容就保存
    if (this.state.chatHistory.length) this.saveConversation(this.currentConv());
    this.state.convId = 'c_' + Date.now();
    this.state.convTitle = '';
    this.state.chatHistory = [];
    this.state.autoTurn = 0;
    this.renderConvTitle();
    this.renderChatHistory();
    this.el('reviewPanel').classList.add('hidden');
    this.el('reviewPanel').innerHTML = '';
    this.closeConvModal();
  },
  switchConv(id) {
    if (this.state.rpMode) this.exitRp(); // 切会话前退出角色扮演，避免状态错乱
    if (this.state.chatHistory.length) this.saveConversation(this.currentConv());
    const conv = this.listConversations().find(c => c.id === id);
    if (!conv) return;
    if (conv.isRp) {
      // 恢复剧场绘画
      const w = this.listWorlds().find(x => x.id === conv.worldId) || null;
      this.state.rpMode = true;
      this.state.rpWorld = w;
      this.state.rpChars = (w && w.roles) || [];
      this.state.rpRoster = {};
      ((w && w.roles) || []).forEach(r => { this.state.rpRoster[r.name] = r.gender === 'male' ? 'm' : 'f'; });
      this.state.rpPlayer = null;
      this.state.rpStep = 'play';
      this.state.rpActiveChars = ((w && w.roles) || []).map(r => ({ name: r.name, gender: r.gender }));
      this.state.rpHistory = (conv.history || []).map(m => ({ role: m.role, content: m.content, name: m.name || '' }));
      this.state.convId = conv.id;
      this.state.convTitle = conv.title || (w ? w.name : '剧场');
      this.state.autoTurn = 0;
      this.renderConvTitle();
      this.renderChatHistory();
      this.closeConvModal();
      return;
    }
    this.state.convId = conv.id;
    this.state.convTitle = conv.title || '';
    this.state.chatHistory = conv.history || [];
    this.state.autoTurn = 0;
    this.renderConvTitle();
    this.renderChatHistory();
    this.closeConvModal();
  },
  renderConvTitle() {
    this.el('convTitle').textContent = this.state.convTitle || '新会话';
  },
  renderConvList() {
    const list = this.listConversations().sort((a, b) => (b.updated || 0) - (a.updated || 0));
    const wrap = this.el('convList');
    if (!list.length) {
      wrap.innerHTML = '<p class="empty-sub" style="text-align:center;padding:28px 0">还没有保存的会话</p>';
      return;
    }
    wrap.innerHTML = list.map(c => {
      return `
      <div class="conv-item ${c.id === this.state.convId ? 'active' : ''}" data-id="${c.id}">
        <div class="ci-main">
          <div class="ci-title">${this.esc(c.title || '新会话')}</div>
          <div class="ci-meta">${c.isRp ? '剧场 · ' : ''}${(c.history || []).length} 条 · ${this.fmtTime(c.updated)}</div>
        </div>
        <button class="ci-del" data-del="${c.id}">✕</button>
      </div>`;
    }).join('');
    wrap.querySelectorAll('.conv-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.dataset.del) return;
        this.switchConv(item.dataset.id);
      });
    });
    wrap.querySelectorAll('.ci-del').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const id = e.target.dataset.del;
        this.deleteConversation(id);
        if (id === this.state.convId) {
          this.state.convId = null;
          this.state.convTitle = '';
          this.state.chatHistory = [];
          this.renderConvTitle();
          this.renderChatHistory();
        }
        this.renderConvList();
      });
    });
  },
  openConvModal() {
    this.el('convModal').classList.remove('hidden');
    this.renderConvList();
  },
  closeConvModal() {
    this.el('convModal').classList.add('hidden');
  },
  bindConv() {
    this.el('convListBtn').addEventListener('click', () => this.openConvModal());
    this.el('convNewBtn').addEventListener('click', () => this.newConv());
    this.el('convClose').addEventListener('click', () => this.closeConvModal());
    this.el('convMask').addEventListener('click', () => this.closeConvModal());
  },
  fmtTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }
    return (d.getMonth() + 1) + '/' + d.getDate();
  },

  resetChat() {
    this.newConv();
  },

  /* 对话持久化：按会话保存（localStorage conversations 数组） */
  saveChatState() {
    if (this.state.rpMode) {
      // RP 绘画保存进会话历史（可回看/切换；下次"开始角色扮演"仍是新局）
      if (this.state.rpHistory.length) {
        this.saveConversation({
          id: this.state.convId,
          title: this.state.convTitle || (this.state.rpWorld ? this.state.rpWorld.name : '剧场'),
          history: this.state.rpHistory.map(m => ({ role: m.role, content: m.content, name: m.name || '' })),
          isRp: true,
          worldId: this.state.rpWorld ? this.state.rpWorld.id : '',
          updated: Date.now(),
        });
      }
      return;
    }
    if (this.state.chatHistory.length) this.saveConversation(this.currentConv());
  },
  loadChatState() {
    // 角色扮演不自动恢复：每次"开始角色扮演"都是全新会话
    Settings.remove('rpState');
    const list = this.listConversations().filter(c => !c.isRp);
    if (list.length) {
      const conv = [...list].sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
      this.state.convId = conv.id;
      this.state.convTitle = conv.title || '';
        this.state.chatHistory = conv.history || [];
    } else {
      this.state.convId = 'c_' + Date.now();
      this.state.chatHistory = [];
    }
    this.renderConvTitle();
    this.renderChatHistory();
  },
  renderChatHistory() {
    const area = this.el('chatArea');
    area.innerHTML = '';
    if (this.state.rpMode) {
      if (!this.state.rpHistory.length) {
        area.innerHTML = `<div class="chat-placeholder" id="chatPlaceholder"><div class="empty-emoji">${Icons.mug}</div><p>选择世界和角色，开始你的故事</p></div>`;
        return;
      }
      for (const m of this.state.rpHistory) {
        if (m.role === 'user') this.appendMsg('user', m.content);
        else if (m.name) this.appendRpChar(m.name, m.content, this.dialogueVoice({ name: m.name }), i);
        else this.appendMsg('assistant', m.content);
      }
      this.appendRpOptions([]);
      area.scrollTop = area.scrollHeight;
      return;
    }
    if (!this.state.chatHistory.length) {
      area.innerHTML = `<div class="chat-placeholder" id="chatPlaceholder"><div class="empty-emoji">${Icons.chat}</div><p>开始一段日常对话，或去剧场角色扮演</p></div>`;
      return;
    }
    this.state.chatHistory.forEach((m, i) => {
      this.appendMsg(m.role === 'user' ? 'user' : 'assistant', m.content, { idx: i });
    });
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
      const v = opts.voice || 'n';
      const readBtn = role === 'assistant' ? `<button class="msg-chip-btn" data-say="${this.esc(text)}" data-voice="${v}" title="朗读">${this.sayIcon()}</button>` : '';
      const hLen = this.state.rpMode ? this.state.rpHistory.length : this.state.chatHistory.length;
      const idx = opts.idx !== undefined ? opts.idx : hLen - 1;
      const isLastAi = role === 'assistant' && idx === hLen - 1;
      const actions = `<div class="msg-actions">${readBtn}<button class="msg-chip-btn" data-sel="${this.esc(text)}" title="查单词">${Icons.search}</button><button class="msg-chip-btn" data-sent="${this.esc(text)}" title="查这句">${Icons.chat}</button><button class="msg-chip-btn" data-rb="${idx}" title="回滚到此">${Icons.undo}</button>${isLastAi ? `<button class="msg-chip-btn" data-rg title="重新生成">${Icons.refresh}</button>` : ''}</div>`;
      div.innerHTML = `<div class="msg-en">${this.renderMsgText(text)}</div>${cn}${actions}`;
      this.bindTapWords(div);
      if (role === 'assistant') {
        const sb = div.querySelector('[data-say]');
        if (sb) this.addSpeakListener(sb, sb.dataset.say, sb.dataset.voice || 'n');
      }
      const selBtn = div.querySelector('[data-sel]');
      if (selBtn) selBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSelectMode(div, text);
      });
      const sentBtn = div.querySelector('[data-sent]');
      if (sentBtn) sentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.translateSelection(text);
      });
      const rbBtn = div.querySelector('[data-rb]');
      if (rbBtn) rbBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.rollbackMsg(parseInt(rbBtn.dataset.rb, 10));
      });
      const rgBtn = div.querySelector('[data-rg]');
      if (rgBtn) rgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.regenerateMsg();
      });
    }
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
  },

  async sendMessage() {
    const input = this.el('chatInput');
    const text = input.value.trim();
    if (!text || this.state.chatBusy || this.state.rpBusy) return;
    if (!API.configured()) { this.toast('先到设置里填 API Key'); this.switchTab('settings'); return; }
    input.value = '';
    input.style.height = 'auto';
    if (this.state.rpMode) {
      await this.sendRpText(text);
    } else if (this.state.hintMode) {
      await this.sendChineseHint(text);
    } else {
      await this.sendText(text);
    }
  },

  async sendText(text, opts = {}) {
    let userDiv = null;
    if (!opts.alreadyInHistory) {
      this.state.chatHistory.push({ role: 'user', content: text });
      userDiv = this.appendMsg('user', text);
    }
    // 表达建议：异步检查，不阻塞对话主线
    if (!opts.alreadyInHistory && !opts.skipSuggest) {
      this.maybeSuggest(text, userDiv);
    }

    this.state.chatBusy = true;
    const typing = this.appendMsg('assistant', '', { typing: true });
    try {
      const reply = await Agent.run(null, this.state.chatHistory);
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
      // 自动命名：对话有 2 条消息且还没标题时，让模型起个名
      if (!this.state.convTitle && this.state.chatHistory.length >= 2) {
        this.nameConversation();
      }
    } catch (e) {
      typing.remove();
      const host = API.base.includes('deepseek.com') ? 'deepseek' : API.base.includes('opencode.ai') ? 'opencode' : API.base;
      const label = '⚠️ [' + Settings.get('chatModel', 'deepseek-v4-flash') + ' @' + host + '] ' + (e.message || '出错了');
      const div = this.appendMsg('assistant', label);
      const actions = div.querySelector('.msg-actions');
      if (actions) {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'msg-chip-btn';
        retryBtn.textContent = '🔄 重试';
        retryBtn.onclick = () => this.retryLast();
        actions.appendChild(retryBtn);
      }
      this.saveChatState();
    }
    this.state.chatBusy = false;
    this.el('reviewPanel').classList.add('hidden');
  },

  /* 重试：清掉最后一条错误消息，用最后一条用户消息再跑一次 */
  async retryLast() {
    if (this.state.chatBusy) return;
    const last = this.state.chatHistory[this.state.chatHistory.length - 1];
    if (last && last.role === 'assistant' && typeof last.content === 'string' && last.content.startsWith('⚠️')) {
      this.state.chatHistory.pop();
      const area = this.el('chatArea');
      const lastMsg = area.lastElementChild;
      if (lastMsg) lastMsg.remove();
    }
    const lastUser = [...this.state.chatHistory].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    await this.sendText(lastUser.content, { alreadyInHistory: true });
  },

  /* 会话自动命名 */
  async nameConversation() {
    if (this.state._naming) return;
    this.state._naming = true;
    try {
      const title = await Agent.titleForConversation(this.state.chatHistory);
      if (title) {
        this.state.convTitle = title;
        this.renderConvTitle();
        this.saveChatState();
      }
    } catch {}
    this.state._naming = false;
  },

  /* ---------- 表达建议 ---------- */
  async maybeSuggest(text, userDiv) {
    if (!userDiv || !/[a-zA-Z]/.test(text || '')) return;
    try {
      const sug = await Agent.suggestBetter(this.state.chatHistory);
      if (sug) this.renderSuggestion(userDiv, sug, 'auto');
    } catch {}
  },
  renderSuggestion(userDiv, sug, mode) {
    let box = userDiv.querySelector('.suggest-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'suggest-box';
      userDiv.appendChild(box);
    }
    box.innerHTML = `
      <div class="sg-head">${Icons.bulb} 可以这样说</div>
      <div class="sg-better">${this.esc(sug.better || '')}</div>
      ${sug.reason ? `<div class="sg-reason">${this.esc(sug.reason)}</div>` : ''}
      <div class="sg-actions">
        <button class="msg-chip-btn sg-ok">采纳 ✓</button>
        <button class="msg-chip-btn sg-no">${mode === 'hint' ? '再写一次' : '不采纳，写中文'}</button>
      </div>`;
    box.querySelector('.sg-ok').addEventListener('click', () => this.adoptSuggestion(sug.better, box));
    box.querySelector('.sg-no').addEventListener('click', () => {
      if (mode === 'hint') {
        this.enterHintMode(box);
      } else {
        this.enterHintMode(box);
      }
    });
  },
  adoptSuggestion(better, box) {
    if (!better) return;
    const list = Settings.get('expressions', []);
    list.push({ en: better, at: Date.now() });
    Settings.set('expressions', list.slice(-50));
    box.innerHTML = `<div class="sg-done">✓ 已记入表达积累：${this.esc(better)}</div>`;
    TTS.speak(better);
    this.exitHintMode();
    this.toast('已加入表达积累');
  },
  enterHintMode(box) {
    this.state.hintMode = true;
    this.state.hintBox = box;
    const input = this.el('chatInput');
    input.placeholder = '用中文写你想表达的意思…';
    input.focus();
    this.el('chatSendBtn').innerHTML = Icons.pen;
    this.toast('输入中文，我帮你翻成地道英文');
  },
  exitHintMode() {
    this.state.hintMode = false;
    this.state.hintBox = null;
    const input = this.el('chatInput');
    input.placeholder = '输入英文…';
    this.el('chatSendBtn').textContent = '➤';
  },
  /* 中文求助：不进入对话主线，直接在建议框给地道说法 */
  async sendChineseHint(chinese) {
    this.state.chatBusy = true;
    const typing = this.appendMsg('assistant', '', { typing: true });
    try {
      const sug = await Agent.suggestFromChinese(this.state.chatHistory, chinese);
      typing.remove();
      const lastUserDiv = this.el('chatArea').querySelector('.msg-me:last-of-type');
      let box = this.state.hintBox;
      if (box && box.isConnected) {
        this.renderSuggestion(box.closest('.msg-me') || lastUserDiv || box.closest('.msg'), sug, 'hint');
      } else if (lastUserDiv) {
        this.renderSuggestion(lastUserDiv, sug, 'hint');
      } else {
        this.appendMsg('assistant', 'Better: ' + sug.better + (sug.reason ? '\n' + sug.reason : ''));
      }
      if (sug.better) TTS.speak(sug.better);
    } catch (e) {
      typing.remove();
      this.appendMsg('assistant', '⚠️ 生成建议失败：' + (e.message || '出错了'));
    }
    this.state.chatBusy = false;
  },

  /* ---------- 复盘 ---------- */
  async startReview(auto = false) {
    const history = this.state.rpMode ? this.state.rpHistory : this.state.chatHistory;
    if (history.length < 2) { if (!auto) this.toast('先聊几句再复盘'); return; }
    if (this.state.chatBusy || this.state.reviewing || this.state.rpBusy) return;
    this.state.reviewing = true;
    this.toast(auto ? '聊了 6 轮，AI 自动复盘…' : 'AI 正在复盘…');
    try {
      const review = await Agent.review(history);
      const p = Profile.load();
      p.sessions = (p.sessions || 0) + 1;
      if (review.mistakes) {
        for (const m of review.mistakes) {
          const exist = p.mistakes.find(x => x.pat === m.pattern);
          if (exist) exist.count = (exist.count || 1) + 1;
          else p.mistakes.push({ pat: m.pattern, fix: m.fix, count: 1 });
        }
        p.mistakes = p.mistakes.slice(-10);
        // 表达修正收藏进句子本
        for (const m of review.mistakes) {
          if (!m.pattern || !m.fix) continue;
          this.saveSentence({
            id: 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            text: m.pattern, cn: m.fix, note: m.note || '复盘纠错', source: 'review', ctx: '复盘纠错', tags: ['复盘'], at: Date.now(),
          });
        }
      }
      Profile.save(p);
      this.renderReviewPanel(review);
      if (review.newWords && review.newWords.length) {
        const { added } = await Words.addMany(review.newWords.map(w => ({
          word: w.word, phonetic: w.phonetic || '', meaning: w.meaning || '',
          example: w.example || '', exampleCn: w.exampleCn || '', source: 'review', tags: ['复盘'],
        })));
        if (added > 0) {
          this.toast(`复盘把 ${added} 个词加入了生词本`);
          this.refreshWordsSet();
          Agent.refreshForgetWords();
          if (this.state.rpHistory.length) this.renderChatHistory();
        }
      } else if (auto) {
        this.toast('复盘完成');
      }
      const rpIssues = (review.roleplay || []).filter(r => r && r.issue).length;
      if (rpIssues > 0) this.toast(`复盘发现 ${rpIssues} 处台词不符合角色，看看「角色感」`);

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
    const rp = (review.roleplay || []).filter(r => r && r.issue).map(r => `
      <div class="review-item">
        <div class="ri-word">${this.esc(r.line)}</div>
        <div class="ri-note">${this.esc(r.issue)}<br><span style="opacity:.75">→ ${this.esc(r.better || '')}</span></div>
      </div>`).join('');
    panel.innerHTML = `
      <div class="review-head">
        <h3>${Icons.review} 复盘 <span style="font-weight:400;color:var(--muted);font-size:12px">${this.esc(review.good || '')}</span></h3>
        <button id="reviewCloseBtn" class="icon-btn-sm">${Icons.x}</button>
      </div>
      ${mistakes ? `<div style="font-size:13px;font-weight:700;margin:6px 0">说错/卡壳的地方</div>${mistakes}` : ''}
      ${rp ? `<div style="font-size:13px;font-weight:700;margin:10px 0 6px;color:var(--primary)">角色感（你的台词贴不贴合角色）</div>${rp}` : ''}
      ${words ? `<div style="font-size:13px;font-weight:700;margin:10px 0 6px">已加入生词本</div>${words}` : ''}
      ${!mistakes && !rp && !words ? '<p style="color:var(--muted);font-size:13px">这次没发现明显问题，继续保持</p>' : ''}
    `;
    const closeBtn = panel.querySelector('#reviewCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
    panel.classList.remove('hidden');
  },

  /* ---------- 生词本 ---------- */
  bindWords() {
    this.el('wordClose').addEventListener('click', () => this.el('wordModal').classList.add('hidden'));
    this.el('wordMask').addEventListener('click', () => this.el('wordModal').classList.add('hidden'));
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
            <button class="btn btn-primary" id="buildExtract">${Icons.sprout} 提取生词</button>
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
                this.toast(`加入 ${added} 个词`);
                this.refreshWordsSet();
                Agent.refreshForgetWords();
                res.innerHTML = '';
                this.el('buildText').value = '';
                this.renderWords();
              });
            }
          } catch (e) {
            this.toast('提取失败：' + (e.message || e));
          }
          extract.disabled = false; extract.innerHTML = Icons.sprout + ' 提取生词';
        });
      }
      this.el('buildCancel').addEventListener('click', () => this.el('buildPanel').classList.add('hidden'));
    } else if (panel) panel.classList.add('hidden');
  },

  async renderWords(filter = '') {
    const all = await Words.list();
    const sorted = all.sort((a, b) => b.created - a.created);
    const tagF = this.state.tagFilter || '';
    const list = sorted.filter(w =>
      (!tagF || (w.tags || []).includes(tagF)) &&
      (!filter || w.word.toLowerCase().includes(filter.toLowerCase()) || (w.meaning || '').includes(filter)));
    // 标签筛选条
    const allTags = new Set();
    all.forEach(w => (w.tags || []).forEach(t => allTags.add(t)));
    this.listSentences().forEach(s => (s.tags || []).forEach(t => allTags.add(t)));
    const tagBar = this.el('tagBar');
    if (tagBar) {
      tagBar.innerHTML = `<button class="tag-chip ${!tagF ? 'on' : ''}" data-tag="">全部</button>` +
        [...allTags].map(t => `<button class="tag-chip ${tagF === t ? 'on' : ''}" data-tag="${this.esc(t)}">${this.esc(t)}</button>`).join('');
      tagBar.querySelectorAll('.tag-chip').forEach(b => b.addEventListener('click', () => {
        this.state.tagFilter = b.dataset.tag || '';
        this.renderWords(this.el('wordSearch').value.trim());
      }));
    }
    // 忘记次数排行榜（前 5）
    const forgotList = all.filter(w => (w.forgot || 0) > 0).sort((a, b) => (b.forgot || 0) - (a.forgot || 0)).slice(0, 5);
    const rankWrap = this.el('forgotRank');
    if (rankWrap) {
      rankWrap.innerHTML = forgotList.length
        ? `<div class="forgot-rank-title">最常忘（对话会自然带这些词）</div><div class="forgot-rank">` +
          forgotList.map(w => `<button class="tag-chip rank" data-w="${this.esc(w.word)}">${this.esc(w.word)} · 忘${w.forgot}次</button>`).join('') + `</div>`
        : '';
      rankWrap.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => this.showWordQuery(b.dataset.w)));
    }
    const wrap = this.el('wordList');
    this.el('wordEmpty').classList.toggle('hidden', list.length > 0);
    if (!list.length) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = list.map(w => `
      <div class="word-item ${(w.srs.reps > 0 && w.srs.due > Date.now() + 20 * 864e5) ? 'mastered' : ''}" data-id="${w.id}">
        <div class="wi-main">
          <div class="wi-word">${this.esc(w.word)}${w.phonetic ? `<span class="wi-phon">${this.esc(w.phonetic)}</span>` : ''}</div>
          <div class="wi-meaning">${this.esc(w.meaning)}${w.source === 'review' ? ' <span class="wi-state">· 对话</span>' : w.source === 'build' ? ' <span class="wi-state">· 建卡</span>' : ''}</div>
        </div>
        <button class="wi-say" data-say="${this.esc(w.word)}">${this.sayIcon()}</button>
        <button class="wi-del" data-del="${w.id}">✕</button>
      </div>`).join('');
    wrap.querySelectorAll('.wi-say').forEach(b => this.addSpeakListener(b, b.dataset.say));
    wrap.querySelectorAll('.wi-del').forEach(b => b.addEventListener('click', async e => {
      this.removeWord(e.target.dataset.del);
    }));
    // 点击单词 → 详情
    wrap.querySelectorAll('.word-item').forEach(item => item.addEventListener('click', async e => {
      if (e.target.closest('.wi-say') || e.target.closest('.wi-del')) return;
      const w = all.find(x => x.id === item.dataset.id);
      if (w) this.showWordDetail(w);
    }));

    // 句子本区块（与单词合并展示）
    const sents = this.listSentences().filter(s =>
      (!tagF || (s.tags || []).includes(tagF)) &&
      (!filter || s.text.toLowerCase().includes(filter.toLowerCase()) || (s.cn || '').includes(filter)));
    const sentWrap = this.el('sentList');
    if (!sents.length) { sentWrap.innerHTML = ''; return; }
    sentWrap.innerHTML = `<div class="sent-head">句子本（${sents.length}）</div>` + sents.map(s => `
      <div class="word-item sent-item" data-id="${s.id}">
        <div class="wi-main">
          <div class="wi-word">${this.renderMsgText(s.text)}</div>
          <div class="wi-meaning">${this.esc(s.cn || '')}${s.note ? ` <span class="wi-state">${this.esc(s.note)}</span>` : ''}</div>
          ${s.ctx ? `<div class="si-ctx">${this.esc(s.ctx)}</div>` : ''}
        </div>
        <button class="wi-say" data-say="${this.esc(s.text)}">${this.sayIcon()}</button>
        <button class="wi-del" data-del="${s.id}">✕</button>
      </div>`).join('');
    sentWrap.querySelectorAll('.wi-say').forEach(b => this.addSpeakListener(b, b.dataset.say));
    sentWrap.querySelectorAll('.wi-del').forEach(b => b.addEventListener('click', async e => {
      this.removeSentence(e.target.dataset.del);
      this.renderWords(this.el('wordSearch').value.trim());
    }));
    // 点句子 → 详情（含标签编辑）
    sentWrap.querySelectorAll('.sent-item').forEach(item => item.addEventListener('click', async e => {
      if (e.target.closest('.wi-say') || e.target.closest('.wi-del') || e.target.closest('[data-rm]') || e.target.closest('.tag-input')) return;
      const s = this.listSentences().find(x => x.id === item.dataset.id);
      if (s) this.showSentenceDetail(s);
    }));
    this.bindTapWords(sentWrap);
  },

  /* 句子详情：文本/翻译/上下文/标签编辑 */
  showSentenceDetail(s) {
    const body = this.el('wordModalBody');
    this.el('wordModalTitle').textContent = '句子';
    body.innerHTML = `
      <div class="wd-ex">${this.renderMsgText(s.text)}</div>
      <div class="wd-meaning">${this.esc(s.cn || '')}</div>
      ${s.note ? `<div class="wd-note">${this.esc(s.note)}</div>` : ''}
      ${s.ctx ? `<div class="si-ctx">场景：${this.esc(s.ctx)}</div>` : ''}
      ${this.tagEditorHtml(s.tags)}
    `;
    this.bindTapWords(body);
    this.el('wordModal').classList.remove('hidden');
    this.bindTagEditor(body, s.tags || [], (next) => {
      this.saveSentence({ ...s, tags: next });
      this.renderWords(this.el('wordSearch').value.trim());
      this.showSentenceDetail({ ...s, tags: next });
    });
  },

  /* 标签编辑 UI */
  tagEditorHtml(tags) {
    const chips = (tags || []).map(t => `<span class="tag-chip sm">${this.esc(t)}<b data-rm="${this.esc(t)}">×</b></span>`).join('');
    return `<div class="wd-tags">${chips || '<span style="color:var(--muted);font-size:12px">无标签</span>'}<input class="tag-input" placeholder="＋标签（回车添加）" maxlength="12"></div>`;
  },
  bindTagEditor(container, tags, saveFn) {
    const input = container.querySelector('.tag-input');
    if (input) input.addEventListener('keydown', async e => {
      if (e.key !== 'Enter') return;
      const t = input.value.trim();
      if (!t) return;
      await saveFn([...(tags || []), t]);
    });
    container.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', async e => {
      e.stopPropagation();
      await saveFn((tags || []).filter(x => x !== b.dataset.rm));
    }));
  },

  /* ---------- 单词详情 ---------- */
  async showWordDetail(w) {
    const body = this.el('wordModalBody');
    const srcMap = { agent: 'AI 对话', review: '复盘收藏', build: '一键建卡', manual: '手动添加' };
    const src = w.sourceScene || srcMap[w.source] || w.source || '未知';
    const row = (k, v) => v ? `<div class="wd-row"><span class="wd-key">${k}</span> ${this.esc(v)}</div>` : '';
    const rows = row('词根', w.root) + row('搭配', w.collocations) + row('同义', w.synonyms) + row('反义', w.antonyms)
      + (w.note ? `<div class="wd-note">${this.esc(w.note)}</div>` : '');
    body.innerHTML = `
      <div class="wd-word">${this.esc(w.word)}${w.phonetic ? ` <span class="wi-phon">${this.esc(w.phonetic)}</span>` : ''}</div>
      ${w.pos ? `<div class="wd-pos">${this.esc(w.pos)}</div>` : ''}
      <div class="wd-meaning">${this.esc(w.meaning || '（暂无释义）')}</div>
      ${w.example ? `<div class="wd-ex">${this.esc(w.example)}</div>` : ''}
      ${w.exampleCn ? `<div class="wd-excn">${this.esc(w.exampleCn)}</div>` : ''}
      ${rows}
      <div class="wd-meta">来源：${this.esc(src)} · ${this.fmtDate(w.created)}${(w.forgot || 0) > 0 ? ` · 忘了 ${w.forgot} 次` : ''}${(w.peak || w.forgot || 0) > 1 ? ` · 历史最高忘 ${w.peak || w.forgot} 次` : ''}</div>
      ${w.ctx ? `<div class="si-ctx">收藏场景：${this.esc(w.ctx)}</div>` : ''}
      ${this.tagEditorHtml(w.tags)}
      <button class="btn btn-ghost btn-sm btn-block" id="wdEnrich" style="margin-top:10px">${Icons.search} 补全/刷新详情</button>
      <div id="wdEnrichResult" class="wd-result"></div>`;
    this.el('wordModal').classList.remove('hidden');
    this.bindTagEditor(body, w.tags || [], async (next) => {
      await Words.update(w.id, { tags: next });
      this.renderWords(this.el('wordSearch').value.trim());
      this.showWordDetail({ ...w, tags: next });
    });
    const btn = body.querySelector('#wdEnrich');
    if (btn) {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = '查询中…';
        try {
          const d = await Agent.queryWord(w.word);
          const upd = {
            phonetic: d.phonetic || w.phonetic, pos: d.pos || w.pos, meaning: d.meaning || w.meaning,
            example: (d.examples && d.examples[0] ? d.examples[0].en : '') || w.example,
            exampleCn: (d.examples && d.examples[0] ? d.examples[0].cn : '') || w.exampleCn,
            root: d.root || w.root || '', collocations: d.collocations || w.collocations || '',
            synonyms: d.synonyms || w.synonyms || '', antonyms: d.antonyms || w.antonyms || '', note: d.note || w.note || '',
          };
          await Words.update(w.id, upd);
          const updated = await Words.get(w.id);
          this.el('wordModal').classList.add('hidden');
          this.showWordDetail(updated || { ...w, ...upd });
          this.renderWords(this.el('wordSearch').value.trim());
          this.toast('详情已补全');
        } catch (e) {
          const r = document.getElementById('wdEnrichResult');
          if (r) r.textContent = '查询失败：' + (e.message || e);
          btn.disabled = false;
          btn.innerHTML = Icons.search + ' 补全详情';
        }
      });
    }
    // 自动补全：库里旧卡没有详细字段时，打开详情自动查一次并保存
    if (!w.root && !w.collocations && !w.antonyms) {
      const hint = document.createElement('div');
      hint.className = 'wd-result';
      hint.textContent = '正在补全详细释义…';
      body.appendChild(hint);
      try {
        const d = await Agent.queryWord(w.word);
        const upd = {
          phonetic: d.phonetic || w.phonetic, pos: d.pos || w.pos, meaning: d.meaning || w.meaning,
          example: (d.examples && d.examples[0] ? d.examples[0].en : '') || w.example,
          exampleCn: (d.examples && d.examples[0] ? d.examples[0].cn : '') || w.exampleCn,
          root: d.root || '', collocations: d.collocations || '', synonyms: d.synonyms || '', antonyms: d.antonyms || '', note: d.note || '',
        };
        await Words.update(w.id, upd);
        this.showWordDetail({ ...w, ...upd });
      } catch (e) {
        hint.textContent = '详情补全失败（网络/额度），可点上方按钮重试';
      }
    }
  },
  fmtDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return (d.getMonth() + 1) + '/' + d.getDate();
  },

  /* ---------- 音频缓存 + 配音设置 ---------- */
  bindAudioCache() {
    const sel = this.el('setAudioCache');
    if (sel) {
      sel.value = String(Settings.get('audioCacheMB', 100));
      sel.addEventListener('change', () => {
        const mb = parseInt(sel.value, 10);
        Settings.set('audioCacheMB', mb);
        AudioCache.limitMB = mb;
        AudioCache.trim();
        this.refreshAudioCacheInfo();
        this.toast('缓存上限已更新');
      });
    }
    const nv = this.el('setNarratorVoice');
    if (nv) {
      nv.value = Settings.get('narratorVoice', 'f');
      nv.addEventListener('change', () => Settings.set('narratorVoice', nv.value));
    }
    const fc = this.el('setForgetCount');
    if (fc) {
      fc.value = String(Settings.get('forgetCount', 5));
      fc.addEventListener('change', () => { Settings.set('forgetCount', fc.value); Agent.refreshForgetWords(); });
    }
    const btn = this.el('audioCacheClearBtn');
    if (btn) btn.addEventListener('click', async () => {
      await AudioCache.clear();
      this.refreshAudioCacheInfo();
      this.toast('缓存已清空');
    });
    this.refreshAudioCacheInfo();
  },
  async refreshAudioCacheInfo() {
    const el = this.el('audioCacheInfo');
    if (!el) return;
    const u = await AudioCache.usage();
    el.textContent = `已用 ${(u.bytes / 1024 / 1024).toFixed(1)} MB · ${u.count} 句 · 上限 ${Settings.get('audioCacheMB', 100)} MB`;
  },

  /* 收藏上下文：当前场景/世界 + 最近一句 AI 消息 */
  currentCtx() {
    let where = '';
    if (this.state.rpMode) where = '剧场 · ' + (this.state.rpWorld ? this.state.rpWorld.name : '');
    else where = this.state.convTitle || '对话';
    const h = this.state.rpMode ? this.state.rpHistory : this.state.chatHistory;
    for (let i = h.length - 1; i >= 0; i--) {
      if (h[i].role === 'assistant' && typeof h[i].content === 'string' && h[i].content.length > 3) {
        return where + ' · ' + h[i].content.replace(/\s+/g, ' ').slice(0, 90);
      }
    }
    return where;
  },

  /* ---------- 生词/句子笔记本 ---------- */
  async loadWordsSet() {
    try {
      const list = await Words.list();
      this.state.wordSet = new Set(list.map(w => (w.word || '').toLowerCase()));
    } catch {}
  },
  refreshWordsSet() { this.loadWordsSet(); },
  matchStem(base, set) {
    const cands = [base.replace(/ies$/, 'y'), base.replace(/es$/, ''), base.replace(/s$/, ''), base.replace(/ing$/, ''), base.replace(/ed$/, ''), base.replace(/ed$/, 'e')];
    return cands.some(c => set.has(c));
  },
  /* 渲染消息文本：生词高亮 + 单词可点击查询（先切词再转义，避免 HTML 实体被误当单词） */
  renderMsgText(text) {
    const set = this.state.wordSet || new Set();
    const parts = String(text || '').split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/);
    return parts.map(part => {
      if (part && /^[A-Za-z]/.test(part)) {
        const lower = part.toLowerCase();
        const hit = set.has(lower) || this.matchStem(lower, set);
        return `<span class="tap-word${hit ? ' hl' : ''}" data-w="${this.esc(part)}">${this.esc(part)}</span>`;
      }
      return this.esc(part);
    }).join('');
  },
  bindTapWords(container) {
    container.querySelectorAll('.tap-word').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showWordQuery(el.dataset.w);
      });
    });
  },
  /* 查词：AI 详细释义 + 自动入生词本 */
  async showWordQuery(word) {
    if (this._queryBusy) return;
    this._queryBusy = true;
    try {
      const body = this.el('wordModalBody');
      if (!body) return;
      body.innerHTML = `<div class="wd-word">${this.esc(word)}</div><div class="wd-result" style="margin-top:10px">查询中…</div>`;
      this.el('wordModalTitle').textContent = '查词';
      this.el('wordModal').classList.remove('hidden');
      const d = await Agent.queryWord(word);
      const existing = await Words.list();
      const exist = existing.find(w => (w.word || '').toLowerCase() === word.toLowerCase());
      const inSet = !!exist;
      if (inSet) {
        // 又忘了 → 合并本次上下文 + 忘记次数 +1 + 历史最高值更新
        const ctxNow = this.currentCtx();
        const ctxNew = exist.ctx ? exist.ctx + '\n▸ 又忘了（' + this.fmtDate(Date.now()) + '）：' + ctxNow : ctxNow;
        const nextForgot = (exist.forgot || 0) + 1;
        await Words.update(exist.id, { ctx: ctxNew.slice(0, 600), forgot: nextForgot, peak: Math.max(exist.peak || exist.forgot || 0, nextForgot) });
        this.refreshWordsSet();
      } else {
        await Words.add({
          word: d.word, phonetic: d.phonetic || '', meaning: d.meaning || '',
          example: (d.examples && d.examples[0] ? d.examples[0].en : '') || '',
          exampleCn: (d.examples && d.examples[0] ? d.examples[0].cn : '') || '',
          source: 'query', ctx: this.currentCtx(), tags: ['查词'],
          root: d.root || '', collocations: d.collocations || '', synonyms: d.synonyms || '', antonyms: d.antonyms || '', note: d.note || '',
        });
        this.refreshWordsSet();
      }
      body.innerHTML = this.renderWordDetail(d, inSet ? '已在生词本（忘了 ' + ((exist.forgot || 0) + 1) + ' 次）' : '已加入生词本')
        + (inSet ? `<button id="wdRemember" class="btn btn-ghost btn-sm btn-block" style="margin-top:10px">✓ 这次记住了（忘次 -1）</button>` : '');
      if (inSet) {
        const rb = body.querySelector('#wdRemember');
        if (rb) rb.addEventListener('click', async () => {
          const next = Math.max(0, (exist.forgot || 0) - 1);
          await Words.update(exist.id, { forgot: next });
          Agent.refreshForgetWords();
          rb.disabled = true;
          rb.textContent = next > 0 ? `已记录 ✓（还剩忘次 ${next}）` : '已记录 ✓（不再上榜）';
          this.toast('记住了，忘次 -1');
        });
      }
      Agent.refreshForgetWords();
    } catch (e) {
      const body = this.el('wordModalBody');
      if (body) body.innerHTML = `<div class="wd-result">查询失败：${this.esc(e.message || e)}</div>`;
    } finally {
      this._queryBusy = false;
    }
  },
  renderWordDetail(d, savedNote) {
    const exs = (d.examples || []).map(x => `<div class="wd-ex">${this.esc(x.en)}</div><div class="wd-excn">${this.esc(x.cn)}</div>`).join('');
    const row = (k, v) => v ? `<div class="wd-row"><span class="wd-key">${k}</span> ${this.esc(v)}</div>` : '';
    return `
      <div class="wd-word">${this.esc(d.word)} ${d.phonetic ? `<span class="wi-phon">${this.esc(d.phonetic)}</span>` : ''}</div>
      ${d.pos ? `<div class="wd-pos">${this.esc(d.pos)}</div>` : ''}
      ${savedNote ? `<div class="wd-meta" style="color:var(--primary)">${savedNote}</div>` : ''}
      <div class="wd-meaning">${this.esc(d.meaning || '')}</div>
      ${row('词根', d.root)}${row('搭配', d.collocations)}${row('同义', d.synonyms)}${row('反义', d.antonyms)}
      ${exs}
      ${d.note ? `<div class="wd-note">${this.esc(d.note)}</div>` : ''}
    `;
  },

  /* 删词：同步刷新高亮（对话/句子/忘词榜） */
  async removeWord(id) {
    await Words.remove(id);
    await this.loadWordsSet();
    await Agent.refreshForgetWords();
    this.renderWords(this.el('wordSearch').value.trim());
    if (this.state.chatHistory.length || this.state.rpHistory.length) this.renderChatHistory();
    this.toast('已删除');
  },

  /* 回滚到此消息：删除该条及之后所有（普通对话 / 剧场绘画通用） */
  rollbackMsg(idx) {
    if (this.state.rpMode) {
      if (idx < 0 || idx > this.state.rpHistory.length) return;
      this.state.rpHistory = this.state.rpHistory.slice(0, idx);
    } else {
      if (idx < 0 || idx > this.state.chatHistory.length) return;
      this.state.chatHistory = this.state.chatHistory.slice(0, idx);
    }
    this.saveChatState();
    this.renderChatHistory();
    this.toast('已回滚');
  },
  /* 重新生成：删除最后一条 AI 回复，重新生成 */
  async regenerateMsg() {
    if (this.state.chatBusy || this.state.rpBusy) { this.toast('正在生成中…'); return; }
    if (this.state.rpMode) {
      const h = this.state.rpHistory;
      const last = h[h.length - 1];
      if (!last || last.role !== 'assistant') { this.toast('没有可重新生成的内容'); return; }
      h.pop();
      this.renderChatHistory();
      const lastUser = [...h].reverse().find(m => m.role === 'user');
      await this.rpRound(lastUser ? lastUser.content : 'continue');
    } else {
      const h = this.state.chatHistory;
      const last = h[h.length - 1];
      if (!last || last.role !== 'assistant') { this.toast('没有可重新生成的内容'); return; }
      h.pop();
      this.renderChatHistory();
      const lastUser = [...h].reverse().find(m => m.role === 'user');
      if (lastUser) await this.sendText(lastUser.content, { alreadyInHistory: true, skipSuggest: true });
      else this.toast('没有可重新生成的内容');
    }
  },

  /* ---------- 句子本 ---------- */
  listSentences() { return Settings.get('sentences', []); },
  saveSentence(s) {
    const l = this.listSentences().filter(x => x.id !== s.id);
    l.unshift(s);
    Settings.set('sentences', l.slice(0, 500));
  },
  removeSentence(id) { Settings.set('sentences', this.listSentences().filter(x => x.id !== id)); },

  /* 消息操作菜单：点 ⋯ 弹出（朗读/查词/查这句/回滚/重新生成） */
  showMsgMenu(div, text, info = {}) {
    this.hideMsgMenu();
    const menu = document.createElement('div');
    menu.className = 'msg-menu';
    const items = [];
    if (info.role === 'assistant' && text) items.push(['朗读', () => { TTS.speak(text, info.voice || 'f'); }]);
    items.push(['查单词', () => this.toggleSelectMode(div, text)]);
    items.push(['查这句', () => this.translateSelection(text)]);
    items.push(['回滚到此', () => this.rollbackMsg(info.idx)]);
    if (info.isLastAi) items.push(['重新生成', () => this.regenerateMsg()]);
    menu.innerHTML = items.map(([label]) => `<button class="msg-menu-item">${this.esc(label)}</button>`).join('');
    document.body.appendChild(menu);
    const rect = div.getBoundingClientRect();
    menu.style.bottom = Math.max(8, window.innerHeight - rect.top + 6) + 'px';
    menu.style.right = Math.max(8, window.innerWidth - rect.right + 4) + 'px';
    const btns = menu.querySelectorAll('.msg-menu-item');
    btns.forEach((b, i) => b.addEventListener('click', () => {
      const fn = items[i][1];
      this.hideMsgMenu();
      fn();
    }));
    this._menuEl = menu;
    this._menuDiv = div;
  },
  hideMsgMenu() {
    if (this._menuEl) { this._menuEl.remove(); this._menuEl = null; }
    this._menuDiv = null;
  },

  /* 选词模式：点「查单词」进入，连续点词查，点外部/再点按钮退出 */
  toggleSelectMode(div, text) {
    const on = div.classList.toggle('selecting');
    if (on) {
      this.exitSelectMode();
      div.classList.add('selecting');
      this._selectingDiv = div;
      div.querySelectorAll('[data-sel]').forEach(b => b.classList.add('on'));
      const words = (text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []).length;
      if (!words) { this.toast('这条没有英文单词'); this.exitSelectMode(); return; }
      this.toast('选词模式：点单词连续查词，点外面退出');
    } else {
      this.exitSelectMode();
    }
  },
  exitSelectMode() {
    if (this._selectingDiv) {
      this._selectingDiv.classList.remove('selecting');
      this._selectingDiv.querySelectorAll('[data-sel]').forEach(b => b.classList.remove('on'));
      this._selectingDiv = null;
    }
  },
  bindMsgDismiss() {
    document.addEventListener('click', (e) => {
      if (this._selectingDiv && !e.target.closest('.msg')) this.exitSelectMode();
      if (this._menuEl && !e.target.closest('#msgMenu') && !e.target.closest('[data-more]')) this.hideMsgMenu();
    });
    document.addEventListener('scroll', () => this.exitSelectMode(), true);
  },

  /* 选句翻译：点卡片菜单查询 → 入句子本 */
  async translateSelection(text) {
    const body = this.el('wordModalBody');
    body.innerHTML = `<div class="wd-ex">${this.esc(text)}</div><div class="wd-result" style="margin-top:10px">翻译中…</div>`;
    this.el('wordModalTitle').textContent = '查句';
    this.el('wordModal').classList.remove('hidden');
    try {
      const r = await Agent.queryText(text);
      const s = { id: 's_' + Date.now(), text, cn: r.cn, note: r.note, source: 'query', ctx: this.currentCtx(), tags: ['查句'], at: Date.now() };
      this.saveSentence(s);
      body.innerHTML = `
        <div class="wd-ex">${this.esc(text)}</div>
        <div class="wd-meaning">${this.esc(r.cn || '')}</div>
        ${r.note ? `<div class="wd-note">${this.esc(r.note)}</div>` : ''}
        <div class="wd-meta" style="color:var(--primary)">已加入句子本</div>
      `;
    } catch (e) {
      body.innerHTML = `<div class="wd-result">查询失败：${this.esc(e.message || e)}</div>`;
    }
  },

  /* ---------- 设置 ---------- */
  bindSettings() {
    // API 提供商预设（只用 DeepSeek 官方，国内直连）
    const PROVIDERS = {
      deepseek: { base: 'https://api.deepseek.com/v1/chat/completions', models: ['deepseek-v4-flash', 'deepseek-v4-pro'] },
    };
    const fillModels = (provider) => {
      const chat = this.el('setChatModel');
      const build = this.el('setBuildModel');
      const models = PROVIDERS[provider].models;
      const curChat = Settings.get('chatModel', '');
      const curBuild = Settings.get('buildModel', '');
      chat.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('');
      build.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('');
      chat.value = models.includes(curChat) ? curChat : models[0];
      build.value = models.includes(curBuild) ? curBuild : models[0];
    };
    const providerEl = this.el('setProvider');
    providerEl.value = Settings.get('provider', 'deepseek');
    // 校正历史遗留的 API 地址（provider 与地址不匹配时，按 provider 重置）
    const savedBase = Settings.get('apiBase', '');
    if (savedBase && savedBase.includes('deepseek.com') !== (providerEl.value === 'deepseek')) {
      Settings.set('apiBase', PROVIDERS[providerEl.value].base);
    }
    fillModels(providerEl.value);
    providerEl.addEventListener('change', () => {
      const p = providerEl.value;
      Settings.set('provider', p);
      this.el('setApiBase').value = PROVIDERS[p].base;
      fillModels(p);
      this.toast(p === 'deepseek' ? '已切换 DeepSeek 官方（国内直连）' : '已切换 OpenCode Go（备用）');
    });

    const bind = (id, key, def) => {
      const el = this.el(id);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = Settings.get(key, def !== undefined ? def : true);
        el.addEventListener('change', () => Settings.set(key, el.checked));
      } else if (el.type === 'range') {
        el.value = Settings.get(key, 0.95);
        el.addEventListener('change', () => { Settings.set(key, parseFloat(el.value)); TTS.rate = parseFloat(el.value); });
      } else {
        el.value = Settings.get(key, def || '');
        el.addEventListener('change', () => Settings.set(key, el.value));
      }
    };
    bind('setApiKey', 'apiKey');
    // API key 清空按钮
    const keyClearEl = this.el('setApiKey');
    const keyClearBtn = this.el('apiKeyClearBtn');
    if (keyClearEl && keyClearBtn) {
      const syncClear = () => keyClearBtn.hidden = !keyClearEl.value;
      keyClearEl.addEventListener('input', syncClear);
      keyClearBtn.addEventListener('click', () => {
        Settings.set('apiKey', '');
        keyClearEl.value = '';
        syncClear();
        this.toast('API Key 已清空');
      });
      setTimeout(syncClear, 300);
    }
    bind('setApiBase', 'apiBase', 'https://api.deepseek.com/v1/chat/completions');
    bind('setAutoSpeak', 'autoSpeak');
    bind('setReadReply', 'readReply');
    bind('setRate', 'rate');
    // 语速滑块 + 数值双向同步（可精确输入）
    const rateSlider = this.el('setRate');
    const rateNum = this.el('setRateNum');
    if (rateSlider && rateNum) {
      const clamp = v => Math.min(1.2, Math.max(0.5, Math.round((parseFloat(v) || 0.95) * 20) / 20));
      rateSlider.addEventListener('input', () => { rateNum.value = rateSlider.value; TTS.rate = parseFloat(rateSlider.value); });
      rateNum.addEventListener('change', () => {
        const v = clamp(rateNum.value);
        rateNum.value = v;
        rateSlider.value = v;
        Settings.set('rate', v);
        TTS.rate = v;
      });
      rateNum.addEventListener('keydown', e => { if (e.key === 'Enter') rateNum.blur(); });
    }
    this.el('setChatModel').addEventListener('change', () => Settings.set('chatModel', this.el('setChatModel').value));
    this.el('setBuildModel').addEventListener('change', () => Settings.set('buildModel', this.el('setBuildModel').value));

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
      this.toast('已保存');
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
        res.textContent = '连接成功：' + reply;
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
    const updBtn = this.el('checkUpdateBtn');
    if (updBtn) updBtn.addEventListener('click', () => this.checkUpdate());
  },

  /* ============ 酒馆（世界卡/角色卡） ============ */
  listWorlds() { return Settings.get('worldCards', []); },
  saveWorld(w) { const l = this.listWorlds().filter(x => x.id !== w.id); l.push(w); Settings.set('worldCards', l); },
  deleteWorld(id) { Settings.set('worldCards', this.listWorlds().filter(x => x.id !== id)); },
  currentWorldId() { return Settings.get('currentWorldId', ''); },
  setCurrentWorld(id) { Settings.set('currentWorldId', id); },
  currentWorld() { return this.listWorlds().find(w => w.id === this.currentWorldId()) || null; },
  activeChars() { const w = this.currentWorld(); return w ? (w.roles || []) : []; },

  renderTavern() {
    const w = this.currentWorld();
    this.el('tavernWorldName').textContent = w ? w.name : '未选择世界';
    this.el('tavernWorldDesc').textContent = w ? (w.setting || w.description || '') : '先选择一个世界，或点"AI 生成"创建';
    const roles = w ? (w.roles || []) : [];
    const wrap = this.el('worldRolesList');
    if (!wrap) return;
    if (!roles.length) {
      wrap.innerHTML = '<p class="empty-sub" style="text-align:center;padding:14px 0">这个世界还没有角色——用"AI 生成"重做一个（描述里带上角色）</p>';
      return;
    }
    wrap.innerHTML = roles.map(r => `
      <div class="tavern-char">
        <div class="tavern-char-main">
          <div class="tavern-char-name">${r.gender === 'male' ? '♂' : '♀'} ${this.esc(r.name)} <span class="tavern-char-role">${this.esc(r.role || '')}</span></div>
          <div class="tavern-char-meta">${this.esc((r.persona || '').slice(0, 60))}</div>
        </div>
      </div>`).join('');
  },

  bindTavern() {
    this.el('tavernWorldListBtn').addEventListener('click', () => this.openTavernModal('world'));
    this.el('tavernWorldGenBtn').addEventListener('click', () => this.openGenModal('world'));
    this.el('tavernStartBtn').addEventListener('click', () => this.startRp());
    this.el('tavernClose').addEventListener('click', () => this.el('tavernModal').classList.add('hidden'));
    this.el('tavernMask').addEventListener('click', () => this.el('tavernModal').classList.add('hidden'));
    this.el('genClose').addEventListener('click', () => this.el('genModal').classList.add('hidden'));
    this.el('genMask').addEventListener('click', () => this.el('genModal').classList.add('hidden'));
    this.el('genSubmitBtn').addEventListener('click', () => this.submitGen());
  },

  openTavernModal() {
    this.el('tavernModalTitle').textContent = '世界卡库';
    const body = this.el('tavernModalBody');
    const worlds = this.listWorlds();
    body.innerHTML = (worlds.length ? worlds.map(w => `
        <div class="conv-item ${w.id === this.currentWorldId() ? 'active' : ''}" data-id="${w.id}">
          <div class="ci-main">
            <div class="ci-title">${this.esc(w.name)}</div>
            <div class="ci-meta">${this.esc((w.description || '').slice(0, 40))}</div>
          </div>
          <button class="ci-del" data-del="${w.id}">✕</button>
        </div>`).join('') : '<p class="empty-sub" style="text-align:center;padding:24px 0">还没有世界卡</p>') +
        `<button class="btn btn-ghost btn-sm btn-block" style="margin-top:10px" id="tavernAddWorld">＋ 新建世界卡</button>`;
    body.querySelectorAll('.conv-item').forEach(item => item.addEventListener('click', e => {
      if (e.target.dataset.del) return;
      this.setCurrentWorld(item.dataset.id);
      this.el('tavernModal').classList.add('hidden');
      this.renderTavern();
    }));
    body.querySelectorAll('.ci-del').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      this.deleteWorld(e.target.dataset.del);
      if (e.target.dataset.del === this.currentWorldId()) this.setCurrentWorld('');
      this.openTavernModal();
      this.renderTavern();
    }));
    const addBtn = body.querySelector('#tavernAddWorld');
    if (addBtn) addBtn.addEventListener('click', () => { this.el('tavernModal').classList.add('hidden'); this.openGenModal('world'); });
    this.el('tavernModal').classList.remove('hidden');
  },

  openGenModal(type) {    this.el('tavernModal').classList.remove('hidden');
  },

  openGenModal(type) {
    this.state.genType = type;
    this.el('genModalTitle').textContent = 'AI 生成世界卡';
    this.el('genInput').value = '';
    this.el('genModal').classList.remove('hidden');
    this.el('genInput').focus();
  },

  async submitGen() {
    const desc = this.el('genInput').value.trim();
    if (!desc) { this.toast('先描述一下你的想法'); return; }
    if (!API.configured()) { this.toast('先到设置里填 API Key'); this.switchTab('settings'); return; }
    this.el('genSubmitBtn').disabled = true;
    this.el('genSubmitBtn').textContent = '生成中…';
    try {
      const j = await Agent.generateWorldCard(desc);
      this.saveWorld({ id: 'w_' + Date.now(), name: j.name || 'World', title: j.title || '', description: j.description || '', setting: j.setting || '', rules: j.rules || '', tone: j.tone || '', roles: j.roles || [], at: Date.now() });
      this.setCurrentWorld(this.listWorlds()[this.listWorlds().length - 1].id);
      this.el('genModal').classList.add('hidden');
      this.renderTavern();
      this.toast('生成成功');
    } catch (e) {
      this.toast('生成失败：' + (e.message || e).slice(0, 60));
    }
    this.el('genSubmitBtn').disabled = false;
    this.el('genSubmitBtn').textContent = '生成';
  },

  /* ============ 角色扮演对话（RP） ============ */
  async startRp() {
    const w = this.currentWorld();
    if (!w) { this.toast('先选择或生成一个世界卡'); this.switchTab('tavern'); return; }
    let roles = w.roles || [];
    if (!roles.length) {
      this.toast('这个世界还没有角色，正在自动补齐…');
      this.switchTab('chat');
      try {
        roles = await Agent.fillWorldRoles(w);
        if (!roles.length) throw new Error('empty');
        this.saveWorld({ ...w, roles });
        w.roles = roles;
      } catch (e) {
        this.toast('自动补角色失败：' + (e.message || e).slice(0, 60));
        this.switchTab('tavern');
        return;
      }
    }
    this.state.rpMode = true;
    this.state.rpWorld = w;
    this.state.rpChars = roles;
    this.state.rpActiveChars = roles.map(r => ({ name: r.name, gender: r.gender === 'male' ? 'male' : 'female' }));
    this.state.rpRoster = {};
    roles.forEach(r => { this.state.rpRoster[r.name] = r.gender === 'male' ? 'm' : 'f'; });
    // 保存并清空普通会话，避免残留内容污染 RP 绘画/切换时产生多余会话
    if (this.state.chatHistory.length) this.saveConversation(this.currentConv());
    this.state.chatHistory = [];
    this.state.rpPlayer = null;
    this.state.rpStep = 'choose';
    this.state.rpPendingRoles = [];
    this.state.rpHistory = [];
    this.state.convId = 'c_' + Date.now() + '_rp';
    this.state.convTitle = w.name + ' · ' + new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    this.renderConvTitle();
    this.el('chatInput').placeholder = '选一个角色，或输入"自定义"描述你想扮演的人';
    this.switchTab('chat');
    this.renderChatHistory();
    this.appendMsg('assistant', '世界「' + w.name + '」已加载。你想扮演谁？', { voice: Settings.get('narratorVoice', 'f') });
    try {
      const opts = await Agent.rpOfferRoles(w);
      this.state.rpPendingRoles = opts;
      const labels = opts.map(o => `扮演 ${o.name}：${o.desc}`);
      labels.push('自定义：我想扮演……');
      this.appendRpOptions(labels);
    } catch {
      // API 失败时用世界卡已有角色兜底，保证有推荐选项
      const opts = (w.roles || []).map(r => ({ name: r.name, gender: r.gender, desc: r.persona || r.role || '', persona: r.persona || '' }));
      this.state.rpPendingRoles = opts;
      this.appendRpOptions(opts.map(o => `扮演 ${o.name}：${o.desc}`).concat(['自定义：我想扮演……']));
    }
  },
  async sendRpText(text) {
    const w = this.state.rpWorld;
    const chars = this.state.rpChars;
    if (!w || !chars.length || this.state.rpBusy) return;
    // ---- 选角阶段 ----
    if (this.state.rpStep === 'choose' || this.state.rpStep === 'custom') {
      if (this.state.rpStep === 'choose' && /自定义/.test(text)) {
        this.appendMsg('user', text);
        this.state.rpStep = 'custom';
        this.el('chatInput').placeholder = '描述你想扮演的角色（身份/性格，中文英文都行）';
        this.appendMsg('assistant', '好，描述一下你想扮演的角色（身份、性格，中英文都行）：', { voice: Settings.get('narratorVoice', 'f') });
        return;
      }
      this.appendMsg('user', text);
      this.state.rpBusy = true;
      try {
        let desc = text;
        if (this.state.rpStep === 'choose') {
          const pending = this.state.rpPendingRoles || [];
          const hit = pending.find(o => text.includes(o.name));
          if (hit) desc = `I want to play ${hit.name} (${hit.desc}). ${hit.persona || ''}`;
        }
        const player = await Agent.rpPlayerCard(desc, w);
        this.state.rpPlayer = player;
        this.state.rpRoster[player.name] = player.gender === 'male' ? 'm' : 'f';
        this.state.rpStep = 'intro';
        this.el('chatInput').placeholder = 'Say something… 或输入"继续"';
        const intro = await Agent.rpOpenIntro(w, player, this.state.rpRoster);
        if (intro.narration) {
          this.appendMsg('assistant', intro.narration, { voice: Settings.get('narratorVoice', 'f') });
          this.state.rpHistory.push({ role: 'assistant', name: '', content: intro.narration });
        }
        this.appendRpOptions(intro.options.length ? intro.options : ['继续']);
        this.saveChatState();
        this.state.rpStep = 'play';
      } catch (e) {
        this.toast('开场失败：' + (e.message || e).slice(0, 60));
        this.state.rpStep = 'play';
      }
      this.state.rpBusy = false;
      return;
    }
    this.state.rpBusy = true;
    let userMsg = text;
    // 中文 → 翻译（全英语规则）
    if (/[\u4e00-\u9fa5]/.test(text)) {
      const tip = this.appendMsg('assistant', '', { typing: true });
      try {
        const en = await Agent.translateToEnglish(text);
        tip.remove();
        this.appendMsg('user', '（中文）' + text + '\n→ ' + en);
        userMsg = en;
      } catch {
        tip.remove();
        this.appendMsg('user', text);
      }
    } else {
      this.appendMsg('user', text);
    }
    await this.rpRound(userMsg);
    this.state.rpBusy = false;
  },
  /* 一轮 RP：子 Agent 逐角色推理 → 导演汇总 → 渲染 */
  async rpRound(userMsg) {
    const w = this.state.rpWorld;
    const chars = this.state.rpActiveChars && this.state.rpActiveChars.length ? this.state.rpActiveChars : this.state.rpChars;
    const isContinue = !userMsg || /^(continue|继续|自己来|你来|你自己来|go on|let it continue|\.\.\.?|…)$/i.test(userMsg.trim());
    if (userMsg) this.state.rpHistory.push({ role: 'user', content: userMsg });
        this.saveChatState();
    const typing = this.appendMsg('assistant', '', { typing: true });
    try {
      const results = [];
      const event = isContinue ? '(the player lets the story continue on its own)' : userMsg;
      for (const c of chars) {
        const r = await Agent.rpInferChar(c, w, this.state.rpHistory, event);
        results.push(r);
      }
      const beat = await Agent.rpDirect(w, chars, this.state.rpHistory, isContinue ? '' : userMsg, results);
      typing.remove();
      if (beat.narration) this.state.rpHistory.push({ role: 'assistant', content: beat.narration });
      for (const d of beat.dialogue || []) this.state.rpHistory.push({ role: 'assistant', name: d.name, content: d.line });
      this.state.rpHistory = this.state.rpHistory.slice(-60);
      if (beat.narration) this.appendMsg('assistant', beat.narration, { voice: Settings.get('narratorVoice', 'f') });
      for (const d of beat.dialogue || []) {
        // 新角色加入绘画名册（之后也有子智能体内心活动 + 固定配音）
        if (!this.state.rpChars.find(c => c.name === d.name) && !(this.state.rpActiveChars || []).find(c => c.name === d.name)) {
          this.state.rpActiveChars = [...(this.state.rpActiveChars || []), { name: d.name, gender: d.gender === 'male' ? 'male' : 'female' }];
        }
        this.appendRpChar(d.name, d.line, this.dialogueVoice(d));
      }
      if (beat.options && beat.options.length) this.appendRpOptions(beat.options);
      else this.appendRpOptions([]);
      this.saveChatState();
    } catch (e) {
      typing.remove();
      this.appendMsg('assistant', '⚠️ RP 出错：' + (e.message || e));
    }
  },
  appendRpChar(name, line, voice, idxArg) {
    const area = this.el('chatArea');
    const ph = this.el('chatPlaceholder'); if (ph) ph.remove();
    const div = document.createElement('div');
    div.className = 'msg msg-ai msg-rp-char';
    const mark = voice === 'm' ? '♂ ' : '♀ ';
    const idx = idxArg !== undefined ? idxArg : this.state.rpHistory.length;
    div.innerHTML = `<div class="msg-rp-name">${mark}${this.esc(name)}</div><div class="msg-en">${this.renderMsgText(line)}</div><div class="msg-actions"><button class="msg-chip-btn" data-say="${this.esc(line)}" data-voice="${voice || 'f'}" title="朗读">${this.sayIcon()}</button><button class="msg-chip-btn" data-sel="${this.esc(line)}" title="查单词">${Icons.search}</button><button class="msg-chip-btn" data-sent="${this.esc(line)}" title="查这句">${Icons.chat}</button><button class="msg-chip-btn" data-rb="${idx}" title="回滚到此">${Icons.undo}</button></div>`;
    this.bindTapWords(div);
    const sb = div.querySelector('[data-say]');
    if (sb) this.addSpeakListener(sb, sb.dataset.say, sb.dataset.voice || 'f');
    const selBtn = div.querySelector('[data-sel]');
    if (selBtn) selBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSelectMode(div, line);
    });
    const sentBtn = div.querySelector('[data-sent]');
    if (sentBtn) sentBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.translateSelection(line);
    });
    const rbBtn = div.querySelector('[data-rb]');
    if (rbBtn) rbBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.rollbackMsg(parseInt(rbBtn.dataset.rb, 10));
    });
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
  },
  /* 角色 → 音色 */
  charVoice(c) { return c && c.gender === 'male' ? 'm' : 'f'; },
  /* 台词音色：固定角色按世界卡 gender；新角色按绘画名册（首次出现固定性别） */
  dialogueVoice(d) {
    const c = this.state.rpChars.find(x => x.name === d.name);
    if (c) return this.charVoice(c);
    const roster = this.state.rpRoster || {};
    if (roster[d.name]) return roster[d.name];
    if (d.gender === 'male' || d.gender === 'female') {
      roster[d.name] = d.gender === 'male' ? 'm' : 'f';
      this.state.rpRoster = roster;
      return roster[d.name];
    }
    return 'f';
  },

  appendRpOptions(options) {
    const area = this.el('chatArea');
    const ph = this.el('chatPlaceholder');
    if (ph) ph.remove();
    const div = document.createElement('div');
    div.className = 'rp-options';
    div.innerHTML = (options.length
      ? options.map(o => `<button class="rp-opt">${this.esc(o)}</button>`).join('')
      : '') + `<button class="rp-opt rp-continue">${Icons.play} 继续</button>`;
    div.querySelectorAll('.rp-opt').forEach(b => b.addEventListener('click', () => {
      if (b.classList.contains('rp-continue')) this.sendRpText('continue');
      else this.sendRpText(b.textContent);
    }));
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  },
  /* 退出 RP：回到普通场景对话 */
  exitRp() {
    this.saveChatState(); // 先保存绘画
    this.state.chatHistory = []; // 清空普通残留，避免切会话时把旧内容存进 RP 会话
    this.state.rpMode = false;
    this.state.rpWorld = null;
    this.state.rpChars = [];
    this.state.rpHistory = [];
    this.el('chatInput').placeholder = '输入英文…';
    this.state.convTitle = '';
    this.renderConvTitle();
    this.saveChatState();
    this.renderChatHistory();
    this.toast('已退出角色扮演');
  },

  /* TTS 引擎状态（内置引擎，管理已简化） */
  loadTtsVoices() {
    const status = this.el('ttsStatus');
    if (!status) return;
    if (TTS.engine === 'ready') {
      status.textContent = '内置引擎 ✓（Piper 离线美音）';
    } else if (TTS.engine === 'loading') {
      status.textContent = '内置引擎加载中…';
      setTimeout(() => this.loadTtsVoices(), 800);
    } else if (window.Capacitor?.Plugins?.TextToSpeech) {
      status.textContent = '系统原生引擎（内置引擎不可用）';
    } else {
      status.textContent = '浏览器引擎（备用）';
    }
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

  /* 检查更新：优先读仓库 version.json（raw CDN 国内可达），失败回退 GitHub API；下载走加速镜像 */
  async checkUpdate() {
    const info = this.el('updateInfo');
    if (!info) return;
    info.classList.remove('hidden');
    info.textContent = '检查中…';
    const cur = (this.el('versionLabel').textContent || '').replace(/^v/, '');
    const showNew = (latest, notes, dlUrl) => {
      info.innerHTML = `发现新版本 <b>v${this.esc(latest)}</b>（当前 v${this.esc(cur)}）<br><span style="opacity:.75;font-size:11px;line-height:1.5">${this.esc(notes || '')}</span><br><button id="dlApkBtn" class="btn btn-primary btn-sm" style="margin-top:8px">下载安装包</button>`;
      const dl = info.querySelector('#dlApkBtn');
      if (dl) dl.addEventListener('click', () => {
        if (!dlUrl) { this.toast('暂无下载链接，请到 GitHub release 页'); return; }
        try { location.href = 'https://ghproxy.net/' + dlUrl; }
        catch (e) { try { location.href = dlUrl; } catch (e2) { this.toast('请在浏览器打开链接下载'); } }
      });
    };
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const resp = await fetch('https://raw.githubusercontent.com/zhangs1r/wordgrove/main/version.json', { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      clearTimeout(timer);
      if (!resp.ok) throw new Error('http ' + resp.status);
      const j = await resp.json();
      const latest = String(j.version || '').replace(/^v/, '');
      if (latest && latest !== cur) showNew(latest, j.notes || '', j.url || '');
      else info.innerHTML = `已是最新版（v${this.esc(cur)}）`;
    } catch (e) {
      try {
        const resp = await fetch('https://api.github.com/repos/zhangs1r/wordgrove/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
        if (!resp.ok) throw new Error('github ' + resp.status);
        const j = await resp.json();
        const latest = (j.tag_name || '').replace(/^v/, '');
        const apk = (j.assets || []).find(a => a.name.endsWith('.apk'));
        if (latest && latest !== cur) showNew(latest, (j.body || '').replace(/^##\s*.*\n?/, '').slice(0, 220), apk ? apk.browser_download_url : '');
        else info.innerHTML = `已是最新版（v${this.esc(cur)}）`;
      } catch (e2) {
        info.textContent = '检查失败：网络无法访问更新源';
      }
    }
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
        this.refreshWordsSet();
        Agent.refreshForgetWords();
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
