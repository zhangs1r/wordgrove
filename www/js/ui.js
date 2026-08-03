/* ui.js — 渲染 + 交互 */
const Icons = {
  sprout: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12"/><path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z"/><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M9 22h6"/></svg>',
  tree: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V8"/><path d="M12 4 6 10h12l-6-6z"/><path d="M7 14h10l-5-5-5 5z"/><path d="M8 18h8l-4-4-4 4z"/></svg>',
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
  house: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 3l9 8.5"/><path d="M5 10v11h14V10"/><path d="M9.5 21v-6h5v6"/></svg>',
  };

const UI = {
  state: {
    tab: 'today',

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
    wordMap: new Map(),       // 🔴 v1.1：word 小写 → 完整对象（对话内嵌复习卡用）
    // 🔴 v1.2.3：复习卡队列——多个待复习词按顺序一张张展示（评级→看释义→点"知道了"→下一张）
    reviewQueue: [],
    reviewActive: false,
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
    this.loadTtsVoices();
    this.loadChatState(); // 启动时加载最近会话（仅此一次；之后会话状态由 newConv/switchConv/startRp 管理）
    FarmActivity.start();
    this.bindFarm();
    this.showOnboarding();   // 🔴 v1.1.1：新手指引（勾"不再提示"后永不显示）
    Agent.refreshForgetWords(); // 🔴 v1.2.9：启动即刷新忘词榜/随机词池（否则冷启动后旧绘画继续聊，提示词里没有最新复习词）
    // 🔴 v1.2.7：复习卡队列看门狗——卡片被 DOM 重建意外移除（回滚/重生成/切页）时，
    //   3 秒内自动解锁队列继续弹下一张（防队列卡死不显示）
    setInterval(() => {
      if (this.state.reviewActive && this._activeCard && !this._activeCard.isConnected) {
        this._activeCard = null;
        this.state.reviewActive = false;
        this.pumpReviewQueue();
      }
    }, 3000);
    // 🔴 v1.2.1：自动检查更新移到 app.js（等原生版本号就绪后再比较，防止误报）

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

  /* 🔴 v1.1.1：新手指引（🔴 v1.2.16 改为 5 页轮播；force=true 时设置页可随时重看，不改变"不再提示"） */
  showOnboarding(force) {
    const modal = this.el('onboardModal');
    if (!modal) return;
    if (!force && Settings.get('onboardDone', false)) return;
    const noMore = this.el('onboardNoMore');
    if (noMore) noMore.checked = false;
    this._onboardInit();
    modal.classList.remove('hidden');
    const mask = modal.querySelector('.modal-mask');
    if (mask) mask.onclick = () => this._onboardClose();
  },
  _onboardInit() {
    const slides = document.querySelectorAll('#onboardSlides .onboard-slide');
    const dots = this.el('onboardDots');
    const prev = this.el('onboardPrev');
    const next = this.el('onboardNext');
    const start = this.el('onboardStart');
    if (!slides.length || !dots || !prev || !next || !start) return;
    if (this._obBound) return; // 已初始化过（设置页重看时不重复绑定）
    this._obBound = true;
    dots.innerHTML = Array.from(slides).map((_, i) => `<span class="ob-dot${i === 0 ? ' on' : ''}" data-i="${i}"></span>`).join('');
    const show = (i) => {
      const cur = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach((s, k) => s.classList.toggle('on', k === cur));
      dots.querySelectorAll('.ob-dot').forEach((d, k) => d.classList.toggle('on', k === cur));
      prev.classList.toggle('hidden', cur === 0);
      next.classList.toggle('hidden', cur === slides.length - 1);
      start.classList.toggle('hidden', cur !== slides.length - 1);
    };
    prev.onclick = () => show([...slides].findIndex(s => s.classList.contains('on')) - 1);
    next.onclick = () => show([...slides].findIndex(s => s.classList.contains('on')) + 1);
    dots.querySelectorAll('.ob-dot').forEach(d => d.addEventListener('click', () => show(parseInt(d.dataset.i, 10))));
    start.onclick = () => this._onboardClose();
  },
  _onboardClose() {
    const modal = this.el('onboardModal');
    const noMore = this.el('onboardNoMore');
    if (noMore && noMore.checked) Settings.set('onboardDone', true);
    if (modal) modal.classList.add('hidden');
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
    const tabMap = { today: Icons.sprout, garden: Icons.house, chat: Icons.chat, tavern: Icons.mug, words: Icons.book, settings: Icons.gear }; // 🔴 v1.2.1：小院 tab 图标 树→房子
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
    if (tab === 'garden') this.renderGardenFull();
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
  /* 奖励提示（轻量 toast） */
  rewardToast(r, label) {
    if (!r || (!r.acorns && !r.growth)) return;
    const parts = [];
    if (r.acorns) parts.push(r.acorns + ' 木果');
    if (r.growth) parts.push('成长 +' + r.growth);
    this.toast(label + '：' + parts.join(' · '));
  },

  async renderGarden() {
    const st = await Farm.load();
    await Farm.ensureImgs();
    const seasonNames = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
    this.el('gardenMonth').textContent = st.month + '月';
    this.el('gardenPoints').textContent = st.points;
    this.el('gardenStage').textContent = 'Lv' + (st.stage + 1);
    this.el('gardenPoints2').textContent = st.points;
    this.el('gardenStage2').textContent = 'Lv' + (st.stage + 1);
    const now = FARM.now();
    this.el('todayVeggieDate').textContent = now.getMonth() + 1 + '月' + now.getDate() + '日';
    this.el('todayVeggieSeason').textContent = seasonNames[FARM.seasonOf(now.getMonth() + 1)] || '';
    const cta = this.el('gardenCta');
    const today = now.getDate();
    const planted = st.planted[today];
    if (!planted) {
      cta.innerHTML = `<span>今天还没学习——学一点，<b>${today} 号格</b>就会长出<b>${FARM.CROP_DEFS[FARM.monthCrop(st.month, today)].name}</b></span>`;
    } else {
      cta.innerHTML = `<span>今天已种下 <b>${FARM.CROP_DEFS[planted].name}</b> · 再学 <b>${Math.max(0, FARM.GROW_PER_STAGE * (st.stage + 1) - st.totalEarned)}</b> 积分全院升级</span>`;
    }
    this.paintTodayVeggie(st);
    this.renderMonthDecor(st);
    this.renderDashboards();
  },
  /* 今日植被大图：作物成熟帧放大 + 季节草地底（🔴 v1.2.1：恢复 v1.2 之前的 canvas 版——房子 SVG 是给 tab 栏小院图标的，改错位置已还原） */
  paintTodayVeggie(st) {
    const cv = this.el('todayVeggieCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const C = 220;
    const now = FARM.now();
    const today = now.getDate();
    const season = FARM.seasonOf(now.getMonth() + 1);
    ctx.clearRect(0, 0, C, C);
    ctx.imageSmoothingEnabled = false;
    // 季节草地底
    const grass = Farm._imgs['grass_' + season] || null;
    if (grass) {
      ctx.drawImage(grass, 0, 0, 32, 32, 0, 0, C, C);
    } else {
      ctx.fillStyle = season === 'winter' ? '#E8EDE8' : '#9CCC65';
      ctx.fillRect(0, 0, C, C);
    }
    // 今天高亮描边
    ctx.strokeStyle = '#FAC75E';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, C - 8, C - 8);
    // 今日作物（成熟帧 = 第三帧）
    const crop = st.planted[today];
    const nameEl = this.el('todayVeggieName');
    const subEl = this.el('todayVeggieSub');
    if (crop && Farm._imgs.crops && FARM.CROP_DEFS[crop]) {
      const def = FARM.CROP_DEFS[crop];
      const sx = def.x * 96 + 64; // 成熟帧
      const size = 190;
      ctx.drawImage(Farm._imgs.crops, sx, 0, 32, 32, (C - size) / 2, (C - size) / 2, size, size);
      nameEl.textContent = def.name;
      subEl.textContent = '今日已种下 · 学习就能收获';
    } else {
      // 未学习：画一个小种子 + 提示
      nameEl.textContent = FARM.CROP_DEFS[FARM.monthCrop(st.month, today)].name;
      subEl.textContent = '今天还没学习——学一点就种下';
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('待播种', C / 2, C / 2 + 5);
      ctx.textAlign = 'left';
    }
  },
  /* 本月限定装饰：当月 sprite + 名称 + 已购标记 */
  renderMonthDecor(st) {
    const row = this.el('monthDecorRow');
    if (!row) return;
    const monthDefs = FARM.MONTH_DECOR[st.month] || {};
    const keys = Object.keys(monthDefs);
    if (!keys.length) {
      row.innerHTML = '<div class="month-decor-empty">本月没有限定装饰</div>';
      return;
    }
    const owned = st.owned || [];
    row.innerHTML = keys.map(k => {
      const dc = monthDefs[k];
      const img = Farm._imgs['decor_' + k];
      const ownedMark = owned.includes(k) ? '<span class="month-decor-owned">已买</span>' : '';
      return `<div class="month-decor-item">
        <div class="month-decor-img">${img ? `<img src="assets/decor/${k}.png" alt="">` : `<span class="month-decor-ph">${dc.name[0]}</span>`}</div>
        <div class="month-decor-name">${dc.name}${ownedMark}</div>
      </div>`;
    }).join('');
  },
  renderDashboards() {
    const p = Profile.load();
    const streak = p.streak || 0;
    const stats = this.el('dashStats');
    if (stats) {
      stats.innerHTML = `
        <div class="stat-card"><div class="stat-num">${p.wordsLearned || 0}</div><div class="stat-label">累计学词</div></div>
        <div class="stat-card"><div class="stat-num">${p.sessions || 0}</div><div class="stat-label">对话局数</div></div>
        <div class="stat-card"><div class="stat-num">${streak}</div><div class="stat-label">连击天数</div></div>
        <div class="stat-card"><div class="stat-num" id="dashBalance">…</div><div class="stat-label">API 余额</div></div>`;
      this.loadBalance();
    }
    // 排行榜（原有逻辑：忘词/表达/常犯错）
    const ranks = this.el('dashRanks');
    if (ranks) {
      const forget = Agent.forgetWords ? Agent.forgetWords() : [];
      const exprs = (Settings.get('expressions', []) || []).slice(-5).reverse();
      const errs = (Profile.load().mistakes || []).slice(0, 5);
      ranks.innerHTML = `<div class="rank-col"><div class="rank-head">忘词最多</div>${forget.slice(0, 5).map(w => `<div class="rank-item" data-rw="${this.esc(w)}">${this.esc(w)}</div>`).join('') || '<div class="rank-item muted">暂无</div>'}</div>
        <div class="rank-col"><div class="rank-head">常用表达</div>${exprs.map(e => `<div class="rank-item">${this.esc(e.en || '')}</div>`).join('') || '<div class="rank-item muted">暂无</div>'}</div>
        <div class="rank-col"><div class="rank-head">常犯错</div>${errs.map(e => `<div class="rank-item">${this.esc(e || '')}</div>`).join('') || '<div class="rank-item muted">暂无</div>'}</div>`;
      ranks.querySelectorAll('[data-rw]').forEach(b => b.addEventListener('click', () => this.showWordQuery(b.dataset.rw)));
    }
  },
  bindFarm() {
    const cv = this.el('farmCanvas');
    if (cv) cv.addEventListener('click', (e) => this.gardenTap(e));
    const shop = this.el('gardenShopBtn');
    if (shop) shop.addEventListener('click', () => this.gardenOpenShop());
    const hist = this.el('gardenHistBtn');
    if (hist) hist.addEventListener('click', () => this.gardenOpenHistory());
    const drawer = this.el('farmDrawer');
    if (drawer) drawer.addEventListener('click', (e) => this.gardenDrawerClick(e));
    const gdrawer = this.el('gardenDrawer');
    if (gdrawer) gdrawer.addEventListener('click', (e) => this.gardenDrawerClick(e));
    const fmask = this.el('farmMask');
    if (fmask) fmask.addEventListener('click', () => this.farmDrawerClose());
    // 🔴 v0.37 修复：编辑模式的拖拽层覆盖在 canvas 上，点击落在层上、传不到 canvas
    // → 点击绑定在编辑层上（仅编辑模式生效，且只响应点到层本身=空白处）
    const editLayer = this.el('gardenEditLayer');
    if (editLayer) editLayer.addEventListener('click', (e) => {
      if (!this._gardenEdit) return;
      if (e.target !== editLayer) return; // 点到装饰/按钮上不处理
      this.gardenEditPlace(e);
    });
    // 月历花园整页版（v0.34）
    const fcv = this.el('gardenFullCanvas');
    if (fcv) fcv.addEventListener('click', (e) => this.gardenFullTap(e));
    const fshop = this.el('gardenFullShopBtn');
    if (fshop) fshop.addEventListener('click', () => this.gardenOpenShop());
    const fhist = this.el('gardenFullHistBtn');
    if (fhist) fhist.addEventListener('click', () => this.gardenOpenHistory());
    // v0.40：顶部"编辑"按钮——直接进编辑模式（可拖动/旋转/缩放已有装饰）
    const fedt = this.el('gardenFullEditBtn');
    if (fedt) fedt.addEventListener('click', () => this.gardenEditStart(null));
    const goGarden = this.el('todayGoGardenBtn');
    if (goGarden) goGarden.addEventListener('click', () => this.switchTab('garden'));
    // 装饰栏/编辑模式（v0.36）
    const trayShop = this.el('gardenTrayShopBtn');
    if (trayShop) trayShop.addEventListener('click', () => this.gardenOpenShop());
    const editSave = this.el('gardenEditSave');
    if (editSave) editSave.addEventListener('click', () => this.gardenEditSave());
    const editCancel = this.el('gardenEditCancel');
    if (editCancel) editCancel.addEventListener('click', () => this.gardenEditExit(true));
  },

  /* ---------- 月历花园整页版（v0.34 第六 tab） ---------- */
  async renderGardenFull() {
    const st = await Farm.load();
    await Farm.ensureImgs();
    GardenFull._imgs.crops = Farm._imgs.crops || null;
    this.el('gardenFullMonth').textContent = st.month + '月';
    const seasonNames = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
    this.el('gardenFullSeason').textContent = seasonNames[FARM.seasonOf(st.month)] || '';
    this.el('gardenFullPoints').textContent = st.points;
    this.el('gardenFullStage').textContent = 'Lv' + (st.stage + 1);
    const cv = this.el('gardenFullCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    // 历史视图（_gardenView 复用现有逻辑）
    const view = this._gardenView;
    if (view) {
      this.el('gardenFullMonth').textContent = view.month + '月';
      this.el('gardenFullSeason').textContent = seasonNames[FARM.seasonOf(view.month)] || '';
      this.el('gardenFullPoints').textContent = view.totalEarned != null ? view.totalEarned : st.points;
      this.el('gardenFullStage').textContent = 'Lv' + ((view.stage || 0) + 1);
      await GardenFull.paint(ctx, { state: st, year: view.year, month: view.month, planted: view.planted, decor: view.decor, stage: view.stage, readonly: true });
      // v0.39：历史月份也有自己独立的装饰图层，可编辑
      this.renderGardenTray(view);
    } else {
      await GardenFull.paint(ctx, { state: st });
      this.renderGardenTray(st); // 装饰栏（当前月）
    }
  },
  gardenFullTap(e) {
    const cv = this.el('gardenFullCanvas');
    const st = Farm._state;
    if (!st) return;
    // 编辑模式优先：历史月份也能编辑装饰
    if (this._gardenEdit) {
      this.gardenEditPlace(e);
      return;
    }
    if (this._gardenView) {
      this.toast(this._gardenView.year + ' 年 ' + this._gardenView.month + ' 月（已封存）——装饰可以改，作物锁定');
      return;
    }
    const day = GardenFull.hitDay(cv, e);
    if (day == null) {
      this.toast('点到空地了——点田格子看详情');
      return;
    }
    this.gardenDayMenu(day);
  },

  /* ---------- 装饰栏 + 编辑模式（v0.36 / v0.40 仓库全局共用 + 历史月独立图层 + 旋转缩放） ---------- */
  /* 当前编辑目标的数据源：历史月 = view.decor，当前月 = st.decor */
  decorSource() {
    const st = Farm._state;
    if (this._gardenView) return { list: this._gardenView.decor || (this._gardenView.decor = []), isView: true };
    return { list: st.decor, isView: false };
  },
  /* 🔴 v0.41：装饰品全局共用一个仓库——某类型在所有月份（当前+历史）已摆总数 */
  placedTotal(type) {
    const st = Farm._state;
    let n = (st.decor || []).filter(d => d.type === type).length;
    for (const h of st.history || []) {
      n += (h.decor || []).filter(d => d.type === type).length;
    }
    return n;
  },
  renderGardenTray(src) {
    const items = this.el('gardenTrayItems');
    if (!items) return;
    const st = Farm._state;
    const owned = st.owned || [];
    if (!owned.length) {
      items.innerHTML = '<div class="garden-tray-empty">还没有装饰——点商店买一个，就能摆进小院</div>';
      return;
    }
    // 当前视图的摆放数据（历史月独立图层）
    const placedList = src && src.decor ? src.decor : (this._gardenView ? (this._gardenView.decor || []) : st.decor);
    const counts = {};
    for (const k of owned) counts[k] = (counts[k] || 0) + 1;
    const placedCount = {};
    for (const d of placedList) placedCount[d.type] = (placedCount[d.type] || 0) + 1;
    const monthTag = this._gardenView ? this._gardenView.month : st.month;
    items.innerHTML = Object.keys(counts).map(k => {
      const name = (FARM.DECOR[k] || {}).name || (FARM.MONTH_DECOR[monthTag] || {})[k]?.name || k;
      const img = Farm._imgs['decor_' + k];
      const total = counts[k];
      const here = placedCount[k] || 0;          // 本视图（月）已摆
      const usedAll = this.placedTotal(k);       // 全局已摆（含其他月份）
      const left = Math.max(0, total - usedAll); // 仓库剩余可摆
      const isAllPlaced = left <= 0;
      return `<div class="garden-tray-item ${isAllPlaced ? 'placed' : ''}" data-traydecor="${k}">
        <div class="tray-img">${img ? `<img src="assets/decor/${k}.png" alt="">` : `<span class="month-decor-ph">${name[0]}</span>`}</div>
        <div class="tray-name">${name}${total > 1 ? ' ×' + total : ''}</div>
        <div class="tray-sub">${here > 0 ? '本月已摆 ' + here + ' · ' : ''}${left > 0 ? '可摆 ' + left : '已全摆'}</div>
      </div>`;
    }).join('');
    items.querySelectorAll('[data-traydecor]').forEach(el => {
      el.addEventListener('click', () => this.gardenEditStart(el.dataset.traydecor));
    });
  },
  /* 进入编辑模式：选一个装饰开始摆放（当前月 / 历史月都可）；type 为空 = 只编辑已有装饰（顶部"编辑"按钮） */
  async gardenEditStart(type) {
    const st = await Farm.load();
    if (type && !st.owned.includes(type)) { this.toast('还没有这个装饰'); return; }
    const src = this.decorSource();
    let canAdd = false;
    if (type) {
      // 🔴 v0.41：可新增数 = 仓库总数 - 全局已摆（含其他月份）
      const ownedCount = st.owned.filter(k => k === type).length;
      canAdd = this.placedTotal(type) < ownedCount;
    }
    this._gardenEdit = {
      type: type || null,
      canAdd,
      placing: null, // 正在新摆的 {type,x,y}
      snapshot: src.list.map(d => ({ ...d })), // 快照当前布局
    };
    const layer = this.el('gardenEditLayer');
    const bar = this.el('gardenEditBar');
    layer.classList.remove('hidden');
    bar.classList.remove('hidden');
    const monthLabel = this._gardenView ? this._gardenView.month + '月（历史）' : '本月';
    this.el('gardenFullHint').textContent = type
      ? '编辑 ' + monthLabel + ' 装饰：拖动调整，点空地摆放' + (this._gardenEdit.canAdd ? '新的「' + this.decorName(type) + '」' : '') + '，旋转↻ 缩放±'
      : '编辑 ' + monthLabel + ' 装饰：拖动/旋转/缩放已有装饰，点装饰栏可新增';
    this.gardenEditRenderLayer();
    this.toast(type ? (this._gardenEdit.canAdd ? '点小院空地摆放，可拖动/旋转/缩放' : '拖动调整位置，可旋转/缩放') : '编辑模式：拖动已有装饰调整');
  },
  gardenEditRenderLayer() {
    const layer = this.el('gardenEditLayer');
    if (!layer) return;
    const src = this.decorSource();
    const frame = layer.parentElement; // garden-full-frame
    const frameRect = frame.getBoundingClientRect();
    const scaleX = frameRect.width / 1024, scaleY = frameRect.height / 1536;
    // canvas 渲染尺寸 110（1024 坐标系）→ 屏幕像素；编辑层必须一致（v0.39 修复大小偏差）
    const base = 110 * scaleX;
    // 已摆的全部装饰（新摆的直接入数组，无需 placing concat）
    const all = src.list || [];
    layer.innerHTML = all.filter(d => d.x != null && d.y != null).map(d => {
      const s = base * (d.scale || 1);
      // 旋转只作用在 img 上（按钮保持正向）
      const rot = d.angle ? `transform:rotate(${d.angle}deg)` : '';
      return `<div class="edit-decor" data-editid="${d.id || 'new'}" data-editdecor="${d.type}" style="left:${d.x * scaleX}px;top:${d.y * scaleY}px;width:${s}px;height:${s}px;transform:translate(-50%,-50%)">
        <img src="assets/decor/${d.type}.png" alt="" style="${rot}">
        ${d.id ? `<button class="edit-decor-del" data-delid="${d.id}">✕</button>` : ''}
        ${d.id ? `<button class="edit-decor-rot" data-rotid="${d.id}">↻</button>` : ''}
        ${d.id ? `<button class="edit-decor-szin" data-szid="${d.id}" data-dir="in">+</button>
        <button class="edit-decor-szout" data-szid="${d.id}" data-dir="out">−</button>` : ''}
        ${d.id ? `<button class="edit-decor-zup" data-zid="${d.id}" data-dir="up">▲</button>
        <button class="edit-decor-zdown" data-zid="${d.id}" data-dir="down">▼</button>` : ''}
      </div>`;
    }).join('');
    // 拖动绑定
    layer.querySelectorAll('.edit-decor').forEach(el => this.gardenEditBindDrag(el));
    // 删除按钮
    layer.querySelectorAll('[data-delid]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.delid;
        const src2 = this.decorSource();
        src2.list = src2.list.filter(d => d.id !== id);
        if (src2.isView) this._gardenView.decor = src2.list;
        else Farm._state.decor = src2.list;
        this.gardenEditRenderLayer();
      });
    });
    // 旋转按钮（每次 45°）
    layer.querySelectorAll('[data-rotid]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.rotid;
        const src2 = this.decorSource();
        const found = src2.list.find(d => d.id === id);
        if (found) found.angle = ((found.angle || 0) + 45) % 360;
        this.gardenEditRenderLayer();
      });
    });
    // 缩放按钮
    layer.querySelectorAll('[data-szid]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.szid;
        const src2 = this.decorSource();
        const found = src2.list.find(d => d.id === id);
        if (found) {
          const cur = found.scale || 1;
          found.scale = Math.min(3, Math.max(0.5, +(btn.dataset.dir === 'in' ? cur * 1.2 : cur / 1.2).toFixed(2)));
        }
        this.gardenEditRenderLayer();
      });
    });
    // 🔴 v0.42：图层顺序（数组顺序 = z 顺序，后摆的在上层；▲置顶/▼置底一层）
    layer.querySelectorAll('[data-zid]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.zid;
        const src2 = this.decorSource();
        const idx = src2.list.findIndex(d => d.id === id);
        if (idx < 0) return;
        const [item] = src2.list.splice(idx, 1);
        if (btn.dataset.dir === 'up') src2.list.push(item);          // 置顶（数组末尾 = 最上层）
        else src2.list.unshift(item);                                 // 置底（数组开头 = 最下层）
        if (src2.isView) this._gardenView.decor = src2.list;
        else Farm._state.decor = src2.list;
        this.gardenEditRenderLayer();
      });
    });
  },
  gardenEditBindDrag(el) {
    let dragging = false;
    const layer = this.el('gardenEditLayer');
    const frame = layer.parentElement;
    const move = (cx, cy) => {
      const frameRect = frame.getBoundingClientRect();
      const x = (cx - frameRect.left) / frameRect.width * 1024;
      const y = (cy - frameRect.top) / frameRect.height * 1536;
      el.style.left = (x / 1024 * frameRect.width) + 'px';
      el.style.top = (y / 1536 * frameRect.height) + 'px';
      return { x, y };
    };
    el.addEventListener('pointerdown', (e) => {
      if (e.button === 2 || e.target.closest('.edit-decor-del,.edit-decor-rot,.edit-decor-szin,.edit-decor-szout,.edit-decor-zup,.edit-decor-zdown')) return;
      e.preventDefault(); e.stopPropagation();
      dragging = true;
      let id = el.dataset.editid;
      const type = el.dataset.editdecor;
      const src = this.decorSource();
      const p = move(e.clientX, e.clientY);
      if (id === 'new') {
        // 老数据无 id 的装饰：拖动时补 id，避免被当成"新摆"复制
        const found = src.list.find(d => d.x != null && d.y != null && !d.id && d.type === type);
        if (found) { found.id = Farm.newDecorId(); id = found.id; el.dataset.editid = id; found.x = p.x; found.y = p.y; }
      } else {
        const found = src.list.find(d => d.id === id);
        if (found) { found.x = p.x; found.y = p.y; }
      }
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      e.preventDefault(); e.stopPropagation();
      const p = move(e.clientX, e.clientY);
      const id = el.dataset.editid;
      const src = this.decorSource();
      if (id === 'new') {
        this._gardenEdit.placing.x = p.x; this._gardenEdit.placing.y = p.y;
      } else {
        const found = src.list.find(d => d.id === id);
        if (found) { found.x = p.x; found.y = p.y; }
      }
    });
    const up = (e) => {
      if (!dragging) return;
      dragging = false;
      const p = move(e.clientX, e.clientY);
      const id = el.dataset.editid;
      const src = this.decorSource();
      if (id === 'new') {
        this._gardenEdit.placing.x = p.x; this._gardenEdit.placing.y = p.y;
      } else {
        const found = src.list.find(d => d.id === id);
        if (found) { found.x = p.x; found.y = p.y; }
      }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  },
  /* 编辑模式：点 canvas 空白处摆放当前装饰（新的一份，直接带 id 入数组——否则无 id 无法编辑/拖动会复制） */
  gardenEditPlace(e) {
    if (!this._gardenEdit) return;
    if (!this._gardenEdit.type) { this.toast('先点装饰栏选一个装饰再摆放'); return; }
    if (!this._gardenEdit.canAdd) {
      this.toast('拖动已有的装饰调整位置吧');
      return;
    }
    const cv = this.el('gardenFullCanvas');
    const rect = cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 1024;
    const y = (e.clientY - rect.top) / rect.height * 1536;
    // 🔴 v0.42：直接生成带 id 的装饰入数组（与已摆装饰同等对待，可旋转/缩放/删除）
    const src = this.decorSource();
    src.list.push({ id: Farm.newDecorId(), type: this._gardenEdit.type, x, y, angle: 0, scale: 1 });
    if (src.isView) this._gardenView.decor = src.list;
    else Farm._state.decor = src.list;
    this._gardenEdit.canAdd = false;
    this.gardenEditRenderLayer();
    this.toast('已放这里，可拖动/旋转/缩放，或点保存');
  },
  decorName(type) {
    const st = Farm._state;
    const monthTag = this._gardenView ? this._gardenView.month : st.month;
    return (FARM.DECOR[type] || {}).name || (FARM.MONTH_DECOR[monthTag] || {})[type]?.name || type;
  },
  /* 保存布局（当前月 → st.decor；历史月 → 该月自己的 decor 图层） */
  async gardenEditSave() {
    if (!this._gardenEdit) return;
    const st = await Farm.load();
    const src = this.decorSource();
    // 已摆的全部装饰（新摆的直接在数组里了）；老数据无 id 的兜底补 id
    const layout = (src.list || []).map(d => ({ ...d, id: d.id || Farm.newDecorId() }));
    if (src.isView) {
      // 历史月：更新自己图层的 decor（作物不动）
      this._gardenView.decor = layout;
      const idx = (st.history || []).findIndex(h => h.year === this._gardenView.year && h.month === this._gardenView.month);
      if (idx >= 0) st.history[idx].decor = layout;
      await Farm.save();
      this.gardenEditExit();
      this.toast('历史 ' + this._gardenView.month + ' 月装饰已保存 ✓');
      await this.renderGardenFull();
    } else {
      await Farm.saveDecorLayout(layout);
      this.gardenEditExit();
      this.toast('布局已保存 ✓');
      await this.renderGardenFull();
    }
  },
  /* 取消编辑（恢复快照）/ 退出编辑（保存后调用，不恢复） */
  gardenEditExit(restore) {
    if (restore && this._gardenEdit && this._gardenEdit.snapshot) {
      const src = this.decorSource();
      src.list = this._gardenEdit.snapshot.map(d => ({ ...d }));
      if (src.isView) this._gardenView.decor = src.list;
      else Farm._state.decor = src.list;
    }
    this._gardenEdit = null;
    const layer = this.el('gardenEditLayer');
    const bar = this.el('gardenEditBar');
    if (layer) layer.classList.add('hidden');
    if (bar) bar.classList.add('hidden');
    this.el('gardenFullHint').textContent = '学习种下今天的作物 · 点格子看详情';
    if (layer) layer.innerHTML = '';
  },
  gardenTap(e) {
    const cv = this.el('farmCanvas');
    const st = Farm._state;
    if (!st) return;
    if (this._gardenView) {
      this.toast(this._gardenView.year + ' 年 ' + this._gardenView.month + ' 月（已封存）');
      return;
    }
    const day = Farm.hitDay(cv, e, st.year, st.month);
    if (day == null) return;
    if (this._gardenMode) {
      this.gardenPlace(day);
      return;
    }
    this.gardenDayMenu(day);
  },
  async gardenPlace(day) {
    const mode = this._gardenMode;
    if (!mode) return;
    const st = await Farm.load();
    if (st.decor.some(x => x.day === day && x.type === mode.type)) {
      this.toast('这天已经放了 ' + (FARM.DECOR[mode.type] ? FARM.DECOR[mode.type].name : ''));
      return;
    }
    const r = await Farm.placeDecor(mode.type, day);
    if (r.ok) {
      this.toast('已放在 ' + day + ' 号');
      this._gardenMode = null;
      this.farmDrawerClose();
      await this.renderGarden();
    } else {
      this.toast(r.msg || '无法放置');
    }
  },
  async gardenDayMenu(day) {
    const st = await Farm.load();
    const d = this.gardenDrawerEl();
    const crop = st.planted[day];
    let html = `<div class="fd-head">${day} 号</div><div class="fd-list">`;
    if (crop && FARM.CROP_DEFS[crop]) {
      const def = FARM.CROP_DEFS[crop];
      html += `<div class="fd-item"><span class="fd-name">${def.name} · ${st.stage >= 2 ? '已成熟' : '阶段 ' + (st.stage + 1) + '/3'}</span></div>`;
    } else {
      html += `<div class="fd-item"><span class="fd-name">${day} 号还没学——今天学习就能种下 ${FARM.CROP_DEFS[FARM.monthCrop(st.month, day)].name}</span></div>`;
    }
    html += `<div class="fd-item"><span class="fd-name">装饰摆在小院空地上——底部「我的装饰」里点选摆放</span></div>`;
    html += `<button class="btn btn-ghost" data-act="close">关闭</button></div>`;
    d.innerHTML = html;
    this.farmDrawerOpen();
  },
  /* 商店：带 sprite 预览 + 拥有数量（v0.37 不限购买次数） */
  async gardenOpenShop() {
    const st = await Farm.load();
    const d = this.gardenDrawerEl();
    const owned = st.owned || [];
    const ownedCount = {};
    for (const k of owned) ownedCount[k] = (ownedCount[k] || 0) + 1;
    const item = (k, dc, monthTag) => {
      const img = Farm._imgs['decor_' + k];
      const have = ownedCount[k] || 0;
      const isMonthOnly = monthTag && !FARM.DECOR[k]; // 当月限定（无通用定义）
      const price = dc.price != null ? dc.price : (isMonthOnly ? 30 : 15);
      return `<div class="shop-item">
        <div class="shop-img">${img ? `<img src="assets/decor/${k}.png" alt="">` : `<span class="month-decor-ph">${(dc.name || k)[0]}</span>`}</div>
        <div class="shop-info">
          <div class="shop-name">${dc.name}${monthTag ? ' <span class="shop-month-tag">当月限定</span>' : ''}</div>
          <div class="shop-price">${price} 积分 · 拥有 ${have} 个</div>
        </div>
        <button class="btn btn-primary btn-sm" data-buydecor="${k}">买</button>
      </div>`;
    };
    const common = Object.keys(FARM.DECOR).map(k => item(k, FARM.DECOR[k], false)).join('');
    const monthDefs = FARM.MONTH_DECOR[st.month] || {};
    const month = Object.keys(monthDefs).map(k => item(k, monthDefs[k], true)).join('');
    d.innerHTML = `<div class="fd-head">商店（本月积分 ${st.points}） <button class="icon-btn-sm" data-act="close">✕</button></div>
      <div class="fd-scroll">
        <div class="fd-sec">通用装饰</div>${common}
        <div class="fd-sec">${st.month} 月限定（下月下架）</div>${month || '<div class="fd-item"><span class="fd-name">本月限定已售罄</span></div>'}
        <div class="fd-item"><span class="fd-name" style="font-size:11px;color:var(--muted)">可重复购买——买几个就能摆几个，去小院底部「我的装饰」点选摆放</span></div>
      </div>`;
    this.farmDrawerOpen();
  },
  async gardenOpenHistory() {
    const st = await Farm.load();
    const d = this.gardenDrawerEl();
    const hist = st.history || [];
    if (!hist.length) {
      d.innerHTML = `<div class="fd-head">历史院子 <button class="icon-btn-sm" data-act="close">✕</button></div>
        <div class="fd-scroll"><div class="fd-item"><span class="fd-name">还没有封存的院子——月底自动封存</span></div></div>`;
      this.farmDrawerOpen();
      return;
    }
    const rows = hist.map((h, i) => `<div class="fd-item"><span class="fd-name">${h.year} 年 ${h.month} 月 · ${Object.keys(h.planted || {}).length} 天有学习</span><button class="btn btn-primary btn-sm" data-viewhist="${i}">查看</button></div>`).join('');
    d.innerHTML = `<div class="fd-head">历史院子（${hist.length}） <button class="icon-btn-sm" data-act="close">✕</button></div>
      <div class="fd-scroll">${rows}<div class="fd-item"><span class="fd-name">点查看回到当前月</span><button class="btn btn-ghost btn-sm" data-viewhist="back">返回</button></div></div>`;
    this.farmDrawerOpen();
  },
  async gardenDrawerClick(e) {
    const btn = e.target.closest('[data-act],[data-buydecor],[data-rmdecor],[data-viewhist]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'close') { this.farmDrawerClose(); return; }
    if (btn.dataset.buydecor) {
      const type = btn.dataset.buydecor;
      const r = await Farm.buyDecor(type);
      if (!r.ok) { this.toast(r.msg || '购买失败'); return; }
      this.farmDrawerClose();
      this.toast('已购买「' + this.decorName(type) + '」');
      if (this.state.tab === 'garden') {
        await this.renderGardenFull();
        await this.gardenEditStart(type); // 买完直接进编辑模式，点小院摆放
      } else {
        await this.renderGarden();
      }
      return;
    }
    if (btn.dataset.rmdecor) {
      const type = btn.dataset.rmdecor;
      await Farm.removeDecor(type);
      await this.renderGarden();
      if (this.state.tab === 'garden') await this.renderGardenFull();
      return;
    }
    if (btn.dataset.viewhist) {
      const v = btn.dataset.viewhist;
      const refreshView = async () => {
        if (this.state.tab === 'garden') await this.renderGardenFull();
        else await this.renderGarden();
      };
      if (v === 'back') { this._gardenView = null; this.farmDrawerClose(); await refreshView(); return; }
      const st = await Farm.load();
      const h = (st.history || [])[parseInt(v, 10)];
      if (h) {
        this._gardenView = h;
        this.farmDrawerClose();
        await refreshView();
      }
      return;
    }
  },
  /* 当前 tab 对应的抽屉元素（today 用 farmDrawer，garden 用 gardenDrawer——v0.36 修复重复 id bug） */
  gardenDrawerEl() {
    return this.state.tab === 'garden' ? this.el('gardenDrawer') : this.el('farmDrawer');
  },
  farmDrawerOpen() {
    const d = this.gardenDrawerEl();
    const m = this.el('farmMask');
    if (d) d.classList.remove('hidden');
    if (m) m.classList.remove('hidden');
  },
  farmDrawerClose() {
    const d = this.gardenDrawerEl();
    const m = this.el('farmMask');
    if (d) d.classList.add('hidden');
    if (m) m.classList.add('hidden');
  },

  /* 奖励提示（轻量 toast） */
  rewardToast(r, label) {
    if (!r || !r.pts) return;
    this.toast(label + '：+' + r.pts + ' 积分');
  },
  /* 对话奖励：会话内用户英文累计词数达到 24/48/72 档各发一次（每日最多 3 次） */
  async chatRewardTick() {
    try {
      const total = this.state.chatHistory
        .filter(m => m.role === 'user')
        .reduce((n, m) => n + ((m.content.match(/[a-zA-Z]+/g) || []).length), 0);
      for (let i = 0; i < 3; i++) {
        if (total >= 24 * (i + 1)) {
          const r = await Farm.addPoints('chat', { key: this.state.convId + ':t' + i, pts: 3, maxDay: 3 });
          if (r) this.rewardToast(r, '对话');
        }
      }
    } catch (e) {}
  },

  /* ============ 言木小院 v0.33（月历花园） ============ */
  _gardenMode: null,   // 放置模式 {type}
  _gardenView: null,   // 历史查看 {year, month, planted, decor, stage}

  async renderToday() {
    await this.renderGarden();
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
    // 🔴 v1.2.8 用户拍板去掉 SRS：今日重点复习 = 忘词榜前几（常忘的优先）+ 随机挑几个（广覆盖）
    const reviewWrap = this.el('todayReviewList');
    if (reviewWrap) {
      const forgotSorted = [...words].sort((a, b) => (b.forgot || 0) - (a.forgot || 0));
      const top = forgotSorted.filter(w => (w.forgot || 0) > 0).slice(0, 5);
      // 随机补几个（排除已选，保证每天覆盖不同词）
      const rest = forgotSorted.filter(w => !top.includes(w));
      const shuffled = rest.sort(() => Math.random() - 0.5).slice(0, 3);
      const picks = [...top, ...shuffled];
      const cntEl = this.el('todayReviewCount');
      if (cntEl) cntEl.textContent = picks.length ? picks.length + ' 个' : '';
      reviewWrap.innerHTML = picks.length
        ? picks.map(w => `<button class="tag-chip rank" data-rw2="${this.esc(w.word)}">${this.esc(w.word)}${(w.forgot || 0) > 1 ? ` <span style="opacity:.6">×${w.forgot}</span>` : ''}</button>`).join('')
        : '<p class="rank-empty">还没有重点词——聊着聊着，复习卡就来了</p>';
      reviewWrap.querySelectorAll('[data-rw2]').forEach(b => b.addEventListener('click', () => this.showWordQuery(b.dataset.rw2, '')));
    }
    const forgotTop = words.filter(w => (w.forgot || 0) > 0).sort((a, b) => (b.forgot || 0) - (a.forgot || 0)).slice(0, 5);
    const exps = Settings.get('expressions', []);
    const expTop = exps.slice(-5).reverse(); // 🔴 v1.1：取最新 5 条（原来 slice(0,5) 取最旧，与看板不一致）
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

  /* ---------- 对话 ---------- */
  /* （场景系统已移除，对话直接进日常模式） */

  /* ================= 会话管理 ================= */
  listConversations() {
    return Settings.get('conversations', []);
  },
  saveConversation(conv) {
    // 🔴 v1.2.7 防御：普通内容（!isRp）不允许覆盖已存在的 RP 绘画记录
    //   用户实测：用世界卡开第二个绘画后，第一个绘画的记录变成普通对话的内容（普通内容写进了 RP id）
    const all = this.listConversations();
    const prev = all.find(c => c.id === conv.id);
    if (prev && prev.isRp && !conv.isRp) {
      console.warn('拒绝普通会话覆盖 RP 绘画记录', conv.id);
      return;
    }
    // 🔴 v1.1：LRU 上限 40 个（超了丢最旧），防 localStorage 无限增长逼近配额
    let list = all.filter(c => c.id !== conv.id);
    list.push(conv);
    if (list.length > 40) {
      list = list.sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 40);
    }
    Settings.set('conversations', list);
  },
  deleteConversation(id) {
    Settings.set('conversations', this.listConversations().filter(c => c.id !== id));
  },
  currentConv() {
    // 🔴 v1.1.1：convId 为空时生成并固化到 state（原来每次调用生成新 id → 同段对话可分裂成多条）
    if (!this.state.convId) {
      this.state.convId = 'c_' + Date.now();
      this.state.convTitle = '';
    }
    return {
      id: this.state.convId,
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
    this.resetReviewQueue(); // 🔴 v1.2.3：新会话重置复习卡队列
    this.updateRpRoleTag(); // 🔴 v1.2.3：新建普通会话 → 隐藏角色标签
    this.renderConvTitle();
    this.renderChatHistory();
    this.el('reviewPanel').classList.add('hidden');
    this.el('reviewPanel').innerHTML = '';
    this.closeConvModal();
  },
  switchConv(id) {
    // 🔴 v0.43：切到 RP 话题时不再提示"退出角色扮演"——只有切到普通会话才真正退出
    if (this.state.rpBusy) { this.toast('正在生成中，稍等…'); return; } // 🔴 v1.1：回合中禁止切换（防结果写进别的会话/丢失）
    const target = this.listConversations().find(c => c.id === id);
    if (!target) return;
    if (this.state.rpMode) {
      if (target.isRp) {
        this.saveChatState(); // 保存当前 RP 绘画，然后直接覆盖为新的 RP 会话
      } else {
        this.exitRp(); // 切到普通会话才退出
      }
    }
    if (this.state.chatHistory.length) this.saveConversation(this.currentConv());
    const conv = target;
    if (conv.isRp) {
      // 恢复剧场绘画
      const w = this.listWorlds().find(x => x.id === conv.worldId) || null;
      if (!w) {
        // 🔴 v1.1：世界卡被删了 → 明确提示并退出，不让会话静默死
        this.toast('这个世界卡已删除，无法继续剧场');
        this.state.rpMode = false;
        this.state.rpWorld = null;
        this.state.rpChars = [];
        this.state.rpHistory = [];
        this.state.rpRoster = {};
        this.state.rpActiveChars = [];
        this.state.convId = conv.id;
        this.state.convTitle = conv.title || '剧场（世界卡已删除）';
        this.state.chatHistory = conv.history || [];
        this.updateRpRoleTag(); // 🔴 v1.2.2
        this.renderConvTitle();
        this.renderChatHistory();
        this.closeConvModal();
        return;
      }
      this.state.rpMode = true;
      this.state.rpWorld = w;
      this.state.rpChars = (w && w.roles) || [];
      this.state.rpRoster = {};
      ((w && w.roles) || []).forEach(r => { this.state.rpRoster[r.name] = r.gender === 'male' ? 'm' : 'f'; });
      // 🔴 v1.2.7：恢复会话里持久化的 player（之前写死 null → 切回绘画角色标签消失）
      this.state.rpPlayer = conv.player || null;
      this.state.rpStep = 'play';
      // 🔴 v1.1：优先恢复会话里持久化的卡司（side 角色不丢），否则从世界卡重建
      this.state.rpActiveChars = (conv.activeChars && conv.activeChars.length)
        ? conv.activeChars
        : (((w && w.roles) || []).map(r => ({ name: r.name, gender: r.gender })));
      // 🔴 v0.41：保留 voice/options 字段（还原旁白音色和选项）；同时从历史重建 roster（新角色音色）
      this.state.rpHistory = (conv.history || []).map(m => ({ role: m.role, content: m.content, name: m.name || '', voice: m.voice || '', options: m.options || null }));
      for (const m of this.state.rpHistory) {
        if (m.name && !this.state.rpRoster[m.name]) this.state.rpRoster[m.name] = 'f';
      }
      if (conv.roster) this.state.rpRoster = { ...this.state.rpRoster, ...conv.roster }; // 🔴 v1.1：恢复持久化音色表
      this.state.convId = conv.id;
      this.state.convTitle = conv.title || (w ? w.name : '剧场');
      this.state.autoTurn = 0;
      this.updateRpRoleTag(); // 🔴 v1.2.2：恢复 RP 会话后显示扮演角色
      this.renderConvTitle();
      this.renderChatHistory();
      this.closeConvModal();
      return;
    }
    this.state.convId = conv.id;
    this.state.convTitle = conv.title || '';
    this.state.chatHistory = conv.history || [];
    this.state.autoTurn = 0;
    this.resetReviewQueue(); // 🔴 v1.2.3：切会话重置复习卡队列
    this.updateRpRoleTag(); // 🔴 v1.2.3：切到普通会话 → 隐藏角色标签（标签绑定绘画标题）
    this.renderConvTitle();
    this.renderChatHistory();
    this.closeConvModal();
  },
  renderConvTitle() {
    this.el('convTitle').textContent = this.state.convTitle || '新会话';
  },
  renderConvList() {
    // 🔴 v0.43：幽灵会话修复——旧数据可能有无 id 的会话（点击/删除都匹配不上），先补 id
    const list = this.listConversations();
    let fixed = false;
    list.forEach(c => { if (!c.id) { c.id = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7); fixed = true; } });
    if (fixed) Settings.set('conversations', list);
    const sorted = [...list].sort((a, b) => (b.updated || 0) - (a.updated || 0));
    const wrap = this.el('convList');
    if (!list.length) {
      wrap.innerHTML = '<p class="empty-sub" style="text-align:center;padding:28px 0">还没有保存的会话</p>';
      return;
    }
    wrap.innerHTML = sorted.map(c => {
      return `
      <div class="conv-item ${c.id === this.state.convId ? 'active' : ''}" data-id="${c.id}">
        <div class="ci-main">
          <div class="ci-title">${this.esc(c.title || '新会话')}</div>
          <div class="ci-meta">${c.isRp ? '剧场 · ' : ''}${(c.history || []).length} 条 · ${this.fmtTime(c.updated)}</div>
        </div>
        <div class="ci-actions">
          <button class="ci-edit" data-edit="${c.id}" title="重命名">✎</button>
          <button class="ci-del" data-del="${c.id}">✕</button>
        </div>
      </div>`;
    }).join('');
    wrap.querySelectorAll('.conv-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.dataset.del) return;
        if (e.target.dataset.edit) return;
        this.switchConv(item.dataset.id);
      });
    });
    // 🔴 v0.41：会话重命名
    wrap.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.edit;
        const conv = this.listConversations().find(c => c.id === id);
        if (!conv) return;
        const name = prompt('给这个会话起个名字：', conv.title || '');
        if (name == null) return;
        const title = name.trim();
        conv.title = title;
        this.saveConversation(conv);
        if (this.state.convId === id) {
          this.state.convTitle = title || (conv.isRp && this.state.rpWorld ? this.state.rpWorld.name : '');
          this.renderConvTitle();
        }
        this.renderConvList();
        this.toast(title ? '已重命名' : '已清除名字');
      });
    });
    wrap.querySelectorAll('.ci-del').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const id = e.target.dataset.del;
        // 🔴 v1.1：生成中禁止删除当前会话（防结果写进已删会话）
        if (id === this.state.convId && this.state.rpBusy) { this.toast('正在生成中，稍等…'); return; }
        this.deleteConversation(id);
        if (id === this.state.convId) {
          // 🔴 v0.42：彻底清空当前会话状态（含 RP），否则下次 saveChatState 会把 id=null 的 RP 历史写回去，删了又回来
          // 🔴 v1.1：连 rpPlayer/rpRoster/rpActiveChars/rpStep 一起清（旧代码只清了部分，RP 状态残留会干扰下次 startRp）
          this.state.convId = null;
          this.state.convTitle = '';
          this.state.chatHistory = [];
          this.state.rpMode = false;
          this.state.rpHistory = [];
          this.state.rpWorld = null;
          this.state.rpChars = [];
          this.state.rpPlayer = null;
          this.state.rpRoster = {};
          this.state.rpActiveChars = [];
          this.state.rpStep = '';
          this.resetReviewQueue(); // 🔴 v1.2.3
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

  /* 对话持久化：按会话保存（localStorage conversations 数组）
     🔴 v1.1：内部 try/catch——配额满时降级为不持久化（避免把本地存储错误误当 API 错误） */
  saveChatState() {
    try {
      if (this.state.rpMode) {
        // RP 绘画保存进会话历史（可回看/切换；下次"开始角色扮演"仍是新局）
        // 🔴 v0.41：voice 和 options 都要存，切回会话时才能还原旁白音色和选项
        // 🔴 v1.1：activeChars/roster 随会话持久化（否则切走再切回，side 角色从卡司消失、音色变女声）
        if (this.state.rpHistory.length) {
          this.saveConversation({
            id: this.state.convId,
            title: this.state.convTitle || (this.state.rpWorld ? this.state.rpWorld.name : '剧场'),
            history: this.state.rpHistory.map(m => ({ role: m.role, content: m.content, name: m.name || '', voice: m.voice || '', options: m.options || null })),
            isRp: true,
            worldId: this.state.rpWorld ? this.state.rpWorld.id : '',
            activeChars: this.state.rpActiveChars || [],
            roster: this.state.rpRoster || {},
            // 🔴 v1.2.7：player 随会话持久化——否则切走再切回 rpPlayer=null，角色标签消失
            player: this.state.rpPlayer || null,
            updated: Date.now(),
          });
        }
        return;
      }
      if (this.state.chatHistory.length) this.saveConversation(this.currentConv());
    } catch (e) {
      console.warn('saveChatState 失败（存储可能已满）', e);
      this.toast('存储空间已满，本次对话记录未保存');
    }
  },
  loadChatState() {
    // 角色扮演不自动恢复：每次"开始角色扮演"都是全新会话
    Settings.remove('rpState');
    const list = this.listConversations().filter(c => !c.isRp);
    if (list.length) {
      // 🔴 v1.1：幽灵会话补丁也覆盖启动加载路径（renderConvList 只修打开列表时）
      let conv = [...list].sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
      if (!conv.id) {
        conv.id = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        this.saveConversation(conv);
      }
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
      this.state.rpHistory.forEach((m, i) => {
        if (m.role === 'user') this.appendMsg('user', m.content, { idx: i });
        // 🔴 v1.1：恢复时优先用消息里存的 voice（角色消息 v1.1 起也带 voice），否则走 dialogueVoice 推断
        // 🔴 v1.2.2：恢复历史不弹复习卡（noReview）
        else if (m.name) this.appendRpChar(m.name, m.content, m.voice || this.dialogueVoice({ name: m.name }), i, true);
        // 🔴 v0.41：旁白用保存的 voice（默认取设置里的旁白音色），否则切回会话会变默认女声
        else this.appendMsg('assistant', m.content, { idx: i, voice: m.voice || Settings.get('narratorVoice', 'f'), noReview: true });
      });
      // 🔴 v0.41：恢复最后一条 assistant 的选项（继续/分支按钮）
      const lastOpts = [...this.state.rpHistory].reverse().find(m => m.options && m.options.length);
      this.appendRpOptions(lastOpts ? lastOpts.options : []);
      area.scrollTop = area.scrollHeight;
      return;
    }
    if (!this.state.chatHistory.length) {
      area.innerHTML = `<div class="chat-placeholder" id="chatPlaceholder"><div class="empty-emoji">${Icons.chat}</div><p>开始一段日常对话，或去剧场角色扮演</p></div>`;
      return;
    }
    this.state.chatHistory.forEach((m, i) => {
      this.appendMsg(m.role === 'user' ? 'user' : 'assistant', m.content, { idx: i, noReview: true });
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
      // 🔴 v0.43：回滚/重新生成按钮放在「我的输入」（user 消息）上：
      //   旧输入 → 只有回滚（删掉这条及以下所有上下文）；最新输入 → 只有重新生成（按这条重新生成）
      const hArr = this.state.rpMode ? this.state.rpHistory : this.state.chatHistory;
      let lastUserIdx = -1;
      for (let i = hArr.length - 1; i >= 0; i--) { if (hArr[i].role === 'user') { lastUserIdx = i; break; } }
      const isUser = role === 'user';
      const isLastUser = isUser && idx === lastUserIdx && hArr.length > 0;
      const rbBtn = isUser && !isLastUser ? `<button class="msg-chip-btn" data-rb="${idx}" title="回滚到此（删除这条及以下）">${Icons.undo}</button>` : '';
      const rgBtn = isUser && isLastUser ? `<button class="msg-chip-btn" data-rg title="重新生成">${Icons.refresh}</button>` : '';
      const actions = `<div class="msg-actions">${readBtn}<button class="msg-chip-btn" data-sel="${this.esc(text)}" title="查单词">${Icons.search}</button><button class="msg-chip-btn" data-sent="${this.esc(text)}" title="查这句">${Icons.chat}</button>${rbBtn}${rgBtn}</div>`;
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
      const rbBtnEl = div.querySelector('[data-rb]');
      if (rbBtnEl) rbBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.rollbackMsg(parseInt(rbBtnEl.dataset.rb, 10));
      });
      const rgBtnEl = div.querySelector('[data-rg]');
      if (rgBtnEl) rgBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.regenerateMsg();
      });
    }
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    // 🔴 v1.1：对话内嵌复习卡——AI 回复里出现该复习的词时，消息下方自动弹卡
    // 🔴 v1.2.2：普通对话 + RP 旁白都弹；恢复历史（noReview）不弹，防切会话时旧消息刷卡
    if (role === 'assistant' && !opts.typing && !opts.noReview) {
      this.maybeEmbedReviewCard(text, div);
    }
    return div;
  },

  /* ============ 🔴 v1.1 对话内嵌复习卡（🔴 v1.2.13 复用高亮结果） ============
   * 🔴 v1.2.13：不再自己跑一遍词形匹配——消息 div 里的 .tap-word.hl（高亮词）就是
   *   renderMsgText 已经匹配好的生词本词（大小写/词形/不规则全部处理过）：
   *   "高亮什么就弹什么"，高亮和弹卡永远一致，杜绝"高亮正常但卡片不弹"。
   * 顺序：评级（忘了/模糊/记得）→ 展开释义 → 点"知道了" → 下一张；全部看完自动关闭
   * 防骚扰：每消息最多 3 个入队 + 队列内去重（同一时刻不重复弹同一词） */
  maybeEmbedReviewCard(text, div) {
    try {
      if (Settings.get('reviewCard', true) === false) return; // 🔴 v1.1.1：设置里可关
      if (!div || !div.isConnected) return;
      if (!this.state.wordMap.size) {
        // 🔴 v1.2.11：词表没就绪（加载失败/未完成）→ 触发重载，本次先跳过（避免永不再弹）
        this.loadWordsSet();
        return;
      }
      let added = 0;
      const seen = new Set();
      div.querySelectorAll('.tap-word.hl').forEach(el => {
        if (added >= 3) return; // 🔴 v1.2.3：每条消息最多入队 3 个，防排队轰炸
        // 🔴 v1.2.14：与高亮一致剥离词尾撇号（Carnival's → carnival）
        const raw = (el.dataset.w || '').toLowerCase().replace(/['’]s$/, '').replace(/['’]$/, '');
        if (!raw || seen.has(raw)) return;
        seen.add(raw);
        // 词库原词优先，词形变形（running→run）用 stemCands 兜底找原形
        let w = this.state.wordMap.get(raw) || null;
        if (!w) {
          for (const c of this.stemCands(raw)) {
            w = this.state.wordMap.get(c);
            if (w) break;
          }
        }
        if (!w) return;
        if (this.state.reviewQueue.some(q => q.id === w.id)) return;
        this.state.reviewQueue.push({ id: w.id, word: w.word, div });
        added++;
      });
      this.pumpReviewQueue();
    } catch (e) { /* 弹卡失败不影响对话 */ }
  },
  /* 🔴 v1.2.3：切会话/新会话/退出 RP 时重置复习卡队列（旧卡片/队列不带到新会话）
     🔴 v1.2.8：_earlyDay/_earlyCount（未到期提前配额）不重置——是跨会话的每日全局配额 */
  resetReviewQueue() {
    this.state.reviewQueue = [];
    this.state.reviewActive = false;
  },
  /* 🔴 v1.2.3：按顺序弹卡——同一时间只展示一张，看完（评级+知道了）再下一张 */
  pumpReviewQueue() {
    if (this.state.reviewActive) return;
    if (!this.state.reviewQueue.length) return;
    const item = this.state.reviewQueue.shift();
    // 🔴 v1.2.14：触发消息 div 被移除（切会话/回滚/DOM 重建）时不再静默跳过——
    //   卡片挂到对话区末尾继续弹（否则队列里的词永远不出现，用户"点知道后没后续"）
    if (!item.div || !item.div.isConnected) {
      const area = this.el('chatArea');
      if (area) item.div = area; // 挂到对话区末尾
      else { this.pumpReviewQueue(); return; }
    }
    // 🔴 v1.2.4：用 item.word 查 wordMap（之前用 item.id 永远匹配不上 → 卡片全被跳过，普通/RP 都不弹）
    // 🔴 v1.2.12：🔴 大小写实锤——wordMap 的 key 是小写，item.word 是词库原词；
    //   首字母大写的词（如 "Clipboard"）has() 永远 false → 卡片被静默跳过！
    //   高亮（renderMsgText）用 lower 匹配所以正常，弹卡却用原词查 → 高亮正常但卡片不弹
    if (!this.state.wordMap.has(String(item.word).toLowerCase())) {
      this.pumpReviewQueue();
      return;
    }
    this.state.reviewActive = true;
    this.renderReviewCard(item.div, this.state.wordMap.get(String(item.word).toLowerCase()));
  },
  renderReviewCard(anchor, w) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.dataset.wid = w.id;
    const remain = this.state.reviewQueue.length;
    card.innerHTML = `
      <div class="rc-head"><span class="rc-word">${this.esc(w.word)}</span>${w.phonetic ? `<span class="rc-phonetic">${this.esc(w.phonetic)}</span>` : ''}<span class="rc-tip">${remain ? `还有 ${remain} 张 · ` : ''}这个词还记得吗？</span></div>
      <div class="rc-body hidden"><div class="rc-meaning">${this.esc(w.meaning || '')}</div>${w.example ? `<div class="rc-example">${this.esc(w.example)}</div>` : ''}</div>
      <div class="rc-actions">
        <button class="rc-btn rc-forgot" data-g="0">忘了</button>
        <button class="rc-btn rc-blur" data-g="1">模糊</button>
        <button class="rc-btn rc-ok" data-g="2">记得</button>
      </div>`;
    card.querySelectorAll('.rc-btn').forEach(btn => {
      btn.addEventListener('click', () => this.reviewCardGrade(card, w, parseInt(btn.dataset.g, 10)));
    });
    anchor.appendChild(card);
    this._activeCard = card; // 🔴 v1.2.7：看门狗引用（卡片被 DOM 重建意外移除时自动解锁队列）
  },
  async reviewCardGrade(card, w, grade) {
    if (card.dataset.done) return; // 防连点
    card.dataset.done = '1';
    card.querySelectorAll('.rc-btn').forEach(b => b.disabled = true);
    // 🔴 v1.2.8 用户拍板去掉 SRS：评级只维护忘次计数（忘词榜的依据），不再重排期
    try {
      const fresh = await Words.get(w.id);
      if (fresh) {
        if (grade === 0) {
          await Words.update(w.id, { forgot: (fresh.forgot || 0) + 1, peak: Math.max(fresh.peak || 0, (fresh.forgot || 0) + 1) });
        } else if (grade === 2 && (fresh.forgot || 0) > 0) {
          await Words.update(w.id, { forgot: (fresh.forgot || 0) - 1 });
        }
      }
    } catch (e) {}
    try { Agent.refreshForgetWords(); } catch (e) {}
    try { Profile.touchStreak(); } catch (e) {}
    try {
      const r = await Farm.addPoints('reviewcard', { key: w.id, pts: 2, maxDay: 8 });
      if (r) this.rewardToast(r, '复习');
    } catch (e) {}
    // 反馈态：展开释义 + "知道了"按钮（🔴 v1.2.3：点它切下一张）
    const mark = grade === 0 ? '😕' : grade === 1 ? '🤔' : '✓';
    const msg = grade === 0 ? '忘了——它会进忘词榜，多见面几次就记住了' : grade === 1 ? '模糊——有点印象，继续多见面' : '记得——记牢了，继续保持';
    card.querySelector('.rc-body').classList.remove('hidden');
    const actions = card.querySelector('.rc-actions');
    actions.innerHTML = `<span class="rc-done">${mark} ${msg}</span><button class="rc-btn rc-ok rc-know">知道了</button>`;
    card.classList.add('rc-done');
    actions.querySelector('.rc-know').addEventListener('click', () => {
      card.remove();
      this._activeCard = null; // 🔴 v1.2.7：清看门狗引用
      this.state.reviewActive = false;
      this.pumpReviewQueue(); // 🔴 v1.2.3：下一张；队列空了自动关闭
    });
  },
  /* 🔴 v1.1：回滚/重生成后按剩余历史重建角色册（被删回合引入的 side 角色不再残留） */
  rebuildRpCast() {
    const base = (this.state.rpChars || []).map(r => ({ name: r.name, gender: r.gender === 'male' ? 'male' : 'female' }));
    const roster = {};
    (this.state.rpChars || []).forEach(r => { roster[r.name] = r.gender === 'male' ? 'm' : 'f'; });
    const names = new Set();
    for (const m of this.state.rpHistory || []) {
      if (m.name) names.add(m.name);
    }
    for (const n of names) {
      if (!base.some(c => c.name === n)) base.push({ name: n, gender: (this.state.rpRoster || {})[n] === 'm' ? 'male' : 'female' });
    }
    this.state.rpActiveChars = base;
    this.state.rpRoster = roster;
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
    // 🔴 v1.2.9：每轮发送前刷新忘词榜/随机池——提示词里的复习词始终是最新的（隔了很久的会话继续聊也一样）
    await Agent.refreshForgetWords().catch(() => {});
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
      await this.chatRewardTick();
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
  /* 🔴 v1.2.2：RP 台词纠正卡（语法/表达/角色契合）——挂到传入的用户消息下（🔴 v1.2.4：直接传 div） */
  async maybeSuggestRp(line, userDiv) {
    try {
      const sug = await Agent.suggestRp(line, this.state.rpWorld, this.state.rpPlayer, this.state.rpHistory);
      if (!sug) return;
      const div = (userDiv && userDiv.isConnected) ? userDiv : this.el('chatArea').querySelector('.msg-me:last-of-type');
      if (div && div.isConnected) this.renderSuggestion(div, sug, 'rp');
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
      <div class="sg-head">${Icons.bulb} ${mode === 'rp' ? '台词可以这样说（更符合你的角色）' : '可以这样说'}</div>
      <div class="sg-better">${this.esc(sug.better || '')}</div>
      ${sug.reason ? `<div class="sg-reason">${this.esc(sug.reason)}</div>` : ''}
      <div class="sg-actions">
        <button class="msg-chip-btn sg-ok">采纳 ✓</button>
        <button class="msg-chip-btn sg-no">${mode === 'rp' ? '忽略' : '不采纳，写中文'}</button>
      </div>`;
    box.querySelector('.sg-ok').addEventListener('click', () => this.adoptSuggestion(sug.better, box));
    box.querySelector('.sg-no').addEventListener('click', () => {
      if (mode === 'rp') { box.remove(); return; } // 🔴 v1.2.2：RP 里"忽略"只关卡片
      this.enterHintMode(box);
    });
  },
  async adoptSuggestion(better, box) {
    if (!better) return;
    const list = Settings.get('expressions', []);
    list.push({ en: better, at: Date.now() });
    Settings.set('expressions', list.slice(-50));
    try {
      // 🔴 v1.1：幂等 key 规范化（trim + 去标点），同一表达大小写/标点差异不再重复得分
      const ekey = String(better || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '') || ('expr' + Date.now());
      const r = await Farm.addPoints('expr', { key: ekey, pts: 2, maxDay: 3 });
      if (r) this.rewardToast(r, '表达');
    } catch (e) {}
    // 🔴 v1.2.7：采纳后把消息内容真正更新为 better 版本（原来只记录表达，切走再切回还是错误原文）
    try {
      const msgDiv = box.closest('.msg');
      if (msgDiv) {
        const enEl = msgDiv.querySelector('.msg-en');
        if (enEl) {
          enEl.innerHTML = this.renderMsgText(better);
          this.bindTapWords(msgDiv);
        }
        // 同步更新历史记录（普通对话 chatHistory / RP 的 rpHistory），切回会话/恢复时是修正版
        if (this.state.rpMode) {
          const lastUser = [...this.state.rpHistory].reverse().find(m => m.role === 'user');
          if (lastUser) lastUser.content = better;
          this.saveChatState();
        } else {
          const lastUser = [...this.state.chatHistory].reverse().find(m => m.role === 'user');
          if (lastUser) lastUser.content = better;
          this.saveChatState();
        }
      }
    } catch (e) {}
    box.innerHTML = `<div class="sg-done">✓ 已记入表达积累：${this.esc(better)}</div>`;
    TTS.speak(better);
    if (this.state.hintMode) this.exitHintMode(); // 🔴 v1.2.2：RP 模式没进 hintMode，不重置输入框
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
      } else {
        this.toast('复盘完成');
      }
      // 🔴 v1.1：复盘积分移到分支外——手动/自动复盘都发分；有生词也不跳过（之前 else-if 导致"有生词就没分"）
      try {
        const rp = !!this.state.rpMode;
        const r = await Farm.addPoints('review', { key: this.state.convId + ':' + (this.state.chatHistory.length || this.state.rpHistory.length || 0) + ':' + Date.now(), pts: rp ? 8 : 6, maxDay: 2 });
        if (r) this.rewardToast(r, '复盘');
      } catch (e) {}
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
    // 点句子 → 详情（含标签编辑）；🔴 v0.42：句子列表不绑定 bindTapWords——点句子先进详情，详情里才能点单词
    sentWrap.querySelectorAll('.sent-item').forEach(item => item.addEventListener('click', async e => {
      if (e.target.closest('.wi-say') || e.target.closest('.wi-del') || e.target.closest('[data-rm]') || e.target.closest('.tag-input')) return;
      const s = this.listSentences().find(x => x.id === item.dataset.id);
      if (s) this.showSentenceDetail(s);
    }));
  },

  /* 句子详情：文本/翻译/上下文/标签编辑 */
  showSentenceDetail(s) {
    const body = this.el('wordModalBody');
    this.el('wordModalTitle').textContent = '句子';
    body.innerHTML = `
      <div class="wd-ex">${this.renderMsgText(s.text)}</div>
      <div class="wd-meaning">${this.esc(s.cn || '')}</div>
      ${s.note ? `<div class="wd-note">${this.esc(s.note)}</div>` : ''}
      ${s.expand ? `<div class="wd-row"><span class="wd-key">🔁 类似说法</span> ${this.esc(s.expand)}</div>` : ''}
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
    const row = (k, v) => v ? `<div class="wd-row"><span class="wd-key">${k}</span> ${this.renderMsgText(String(v))}</div>` : ''; // 🔴 v1.2.3：英文可点嵌套查询
    const rows = row('词根', w.root) + row('搭配', w.collocations) + row('同义', w.synonyms) + row('反义', w.antonyms)
      + (w.note ? `<div class="wd-note">${this.esc(w.note)}</div>` : '');
    body.innerHTML = `
      <div class="wd-word">${this.esc(w.word)}${w.phonetic ? ` <span class="wi-phon">${this.esc(w.phonetic)}</span>` : ''}<button class="wi-say wd-say" data-say="${this.esc(w.word)}">${this.sayIcon()}</button></div>
      ${w.pos ? `<div class="wd-pos">${this.esc(w.pos)}</div>` : ''}
      <div class="wd-meaning">${this.esc(w.meaning || '（暂无释义）')}</div>
      ${w.example ? `<div class="wd-ex">${this.renderMsgText(w.example)}</div>` : ''}
      ${w.exampleCn ? `<div class="wd-excn">${this.esc(w.exampleCn)}</div>` : ''}
      ${w.usage ? row('📌 语境用法', w.usage) : ''}${w.family ? row('🌱 词族', w.family) : ''}${w.expand ? row('🔁 举一反三', w.expand) : ''}
      ${rows}
      <div class="wd-meta">来源：${this.esc(src)} · ${this.fmtDate(w.created)}${(w.forgot || 0) > 0 ? ` · 忘了 ${w.forgot} 次` : ''}${(w.peak || w.forgot || 0) > 1 ? ` · 历史最高忘 ${w.peak || w.forgot} 次` : ''}</div>
      ${w.ctx ? `<div class="si-ctx">收藏场景：${this.esc(w.ctx)}</div>` : ''}
      ${this.tagEditorHtml(w.tags)}
      <button class="btn btn-ghost btn-sm btn-block" id="wdEnrich" style="margin-top:10px">${Icons.search} 补全/刷新详情</button>
      <div id="wdEnrichResult" class="wd-result"></div>`;
    this.el('wordModal').classList.remove('hidden');
    // 🔴 v1.2.3：生词本详情里的单词也可点（嵌套查询）+ 朗读按钮
    this.bindTapWords(body);
    body.querySelectorAll('.wd-say').forEach(b => this.addSpeakListener(b, b.dataset.say));
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
    // 🔴 v1.1.1：英语水平选择（注入提示词控制词汇难度）
    const lv = this.el('setLevel');
    if (lv) {
      lv.value = Settings.get('level', 'cet6');
      lv.addEventListener('change', () => Settings.set('level', lv.value));
    }
    // 🔴 v1.1.1：对话内嵌复习卡开关
    const rc = this.el('setReviewCard');
    if (rc) {
      rc.checked = Settings.get('reviewCard', true) !== false;
      rc.addEventListener('change', () => Settings.set('reviewCard', rc.checked));
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
  /* 🔴 v0.44：收藏场景更详细——来源 + 角色/场景 + 最近 2 条上下文 */
  currentCtx() {
    let where = '';
    if (this.state.rpMode) {
      where = '剧场《' + (this.state.rpWorld ? this.state.rpWorld.name : '未命名') + '》';
      if (this.state.rpPlayer && this.state.rpPlayer.name) where += ' · 扮演 ' + this.state.rpPlayer.name;
    } else {
      where = this.state.convTitle || '日常对话';
    }
    const h = this.state.rpMode ? this.state.rpHistory : this.state.chatHistory;
    const recent = [];
    for (let i = h.length - 1; i >= 0 && recent.length < 2; i--) {
      const m = h[i];
      if (m.role !== 'assistant' || typeof m.content !== 'string' || m.content.length < 2) continue;
      const who = m.name ? m.name + '：' : '';
      recent.unshift(who + m.content.replace(/\s+/g, ' ').slice(0, 80));
    }
    return recent.length ? where + ' · ' + recent.join(' / ') : where;
  },

  /* ---------- 生词/句子笔记本 ---------- */
  async loadWordsSet() {
    try {
      const list = await Words.list();
      this.state.wordSet = new Set(list.map(w => (w.word || '').toLowerCase()));
      // 🔴 v1.1：同时建 wordMap（word 小写 → 完整对象），对话内嵌复习卡直接取词
      const map = new Map();
      for (const w of list) map.set((w.word || '').toLowerCase(), w);
      this.state.wordMap = map;
    } catch (e) {
      // 🔴 v1.2.11：加载失败（IndexedDB 偶发错误）→ 5 秒后自动重试，否则 wordMap 永远为空，
      //   对话/RP 里复习卡永不弹（静默失败的坑——之前失败后没有任何恢复机制）
      console.warn('loadWordsSet 失败，5 秒后重试', e);
      setTimeout(() => this.loadWordsSet(), 5000);
    }
  },
  refreshWordsSet() { this.loadWordsSet(); },
  /* 🔴 v1.2.8：增强词形还原——studies→study, studied→study, running→run, making→make,
     boxes→box, watched→watch, stopped→stop…（原来缺双写辅音/ied 规则，导致变形词匹配不到不弹卡） */
  stemCands(w) {
    const s = String(w || '').toLowerCase();
    return [
      s,
      s.replace(/ies$/, 'y'),        // studies→study
      s.replace(/ied$/, 'y'),        // studied→study
      s.replace(/es$/, ''),          // boxes→box / watches→watch
      s.replace(/s$/, ''),           // apples→apple
      s.replace(/ing$/, ''),         // eating→eat
      s.replace(/ing$/, 'e'),        // making→make
      s.replace(/(.)\1ing$/, '$1'),  // running→run
      s.replace(/ed$/, ''),          // played→play
      s.replace(/ed$/, 'e'),         // danced→dance
      s.replace(/(.)\1ed$/, '$1'),   // stopped→stop
    ];
  },
  matchStem(base, set) {
    return this.stemCands(base).some(c => set.has(c));
  },
  /* 渲染消息文本：生词高亮 + 单词可点击查询（先切词再转义，避免 HTML 实体被误当单词） */
  renderMsgText(text) {
    const set = this.state.wordSet || new Set();
    const parts = String(text || '').split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/);
    return parts.map(part => {
      if (part && /^[A-Za-z]/.test(part)) {
        // 🔴 v1.2.14：匹配前剥离词尾撇号（Carnival's → carnival / don't 保留词干），
        //   否则带撇号的词高亮不上、弹卡也没有
        const lower = part.toLowerCase().replace(/['’]s$/, '').replace(/['’]$/, '');
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
        // 🔴 v1.1.1：查词带整句语境（AI 识别固定搭配/惯用法，即使搭配另一部分离得远）
        // 🔴 v1.2.3：查词卡片里的单词 → 以所在行（例句/用法/词族等）为语境，支持无限嵌套查询
        const msgEl = el.closest('.msg') || el.closest('.wd-ex, .wd-row, .wd-ctx, .wd-meaning');
        const ctx = msgEl ? ((msgEl.querySelector('.msg-en') || msgEl).textContent || '') : '';
        this.showWordQuery(el.dataset.w, ctx);
      });
    });
  },
  /* 查词：AI 详细释义 + 自动入生词本 */
  /* 查词：AI 老师式讲解（带整句语境 → 识别固定搭配/用法）+ 自动入生词本
     🔴 v1.1.1：ctx = 单词所在的整条消息（语境），AI 结合语境讲用法/举一反三 */
  async showWordQuery(word, ctx) {
    if (this._queryBusy) return;
    this._queryBusy = true;
    try {
      const body = this.el('wordModalBody');
      if (!body) return;
      body.innerHTML = `<div class="wd-word">${this.esc(word)}</div><div class="wd-result" style="margin-top:10px">查询中…</div>`;
      this.el('wordModalTitle').textContent = '查词';
      this.el('wordModal').classList.remove('hidden');
      const d = await Agent.queryWord(word, ctx);
      const existing = await Words.list();
      const exist = existing.find(w => (w.word || '').toLowerCase() === word.toLowerCase());
      const inSet = !!exist;
      if (!inSet) {
        try {
          const r = await Farm.addPoints('word', { key: word.toLowerCase() + ':' + FARM.dayKey(FARM.now()), pts: 2, maxDay: 10 });
          if (r) this.rewardToast(r, '查词');
        } catch (e) {}
      }
      if (inSet) {
        // 又忘了 → 合并本次上下文 + 忘记次数 +1 + 历史最高值更新；补全新字段
        const ctxNow = this.currentCtx();
        const ctxNew = exist.ctx ? exist.ctx + '\n▸ 又忘了（' + this.fmtDate(Date.now()) + '）：' + ctxNow : ctxNow;
        const nextForgot = (exist.forgot || 0) + 1;
        const upd = { ctx: ctxNew.slice(0, 600), forgot: nextForgot, peak: Math.max(exist.peak || exist.forgot || 0, nextForgot) };
        if (!exist.usage && d.usage) upd.usage = d.usage;
        if (!exist.family && d.family) upd.family = d.family;
        if (!exist.expand && d.expand) upd.expand = d.expand;
        await Words.update(exist.id, upd);
        this.refreshWordsSet();
      } else {
        await Words.add({
          word: d.word, phonetic: d.phonetic || '', meaning: d.meaning || '',
          example: (d.examples && d.examples[0] ? d.examples[0].en : '') || '',
          exampleCn: (d.examples && d.examples[0] ? d.examples[0].cn : '') || '',
          source: 'query', ctx: this.currentCtx(), tags: ['查词'],
          root: d.root || '', collocations: d.collocations || '', synonyms: d.synonyms || '', antonyms: d.antonyms || '', note: d.note || '',
          usage: d.usage || '', family: d.family || '', expand: d.expand || '',
        });
        this.refreshWordsSet();
      }
      const ctxBlock = ctx ? `<div class="wd-ctx">📖 语境：<span class="wd-ctx-hl">${this.renderMsgText(String(ctx).slice(0, 160))}${String(ctx).length > 160 ? '…' : ''}</span></div>` : '';
      body.innerHTML = ctxBlock + this.renderWordDetail(d, inSet ? '已在生词本（忘了 ' + ((exist.forgot || 0) + 1) + ' 次）' : '已加入生词本')
        + (inSet ? `<button id="wdRemember" class="btn btn-ghost btn-sm btn-block" style="margin-top:10px">✓ 这次记住了（忘次 -1）</button>` : '');
      // 🔴 v1.2.3：查词卡片里点任意英文单词 → 嵌套继续查；朗读按钮
      this.bindTapWords(body);
      body.querySelectorAll('.wd-say').forEach(b => this.addSpeakListener(b, b.dataset.say));
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
    // 🔴 v1.2.3：英文内容用 renderMsgText 渲染——解释里的单词也能点，不断嵌套查询；
    //            单词旁加朗读按钮
    const exs = (d.examples || []).map(x => `<div class="wd-ex">${this.renderMsgText(x.en)}</div><div class="wd-excn">${this.esc(x.cn)}</div>`).join('');
    const row = (k, v) => v ? `<div class="wd-row"><span class="wd-key">${k}</span> ${this.renderMsgText(String(v))}</div>` : '';
    return `
      <div class="wd-word">${this.esc(d.word)} ${d.phonetic ? `<span class="wi-phon">${this.esc(d.phonetic)}</span>` : ''}<button class="wi-say wd-say" data-say="${this.esc(d.word)}">${this.sayIcon()}</button></div>
      ${d.pos ? `<div class="wd-pos">${this.esc(d.pos)}</div>` : ''}
      ${savedNote ? `<div class="wd-meta" style="color:var(--primary)">${savedNote}</div>` : ''}
      <div class="wd-meaning">${this.esc(d.meaning || '')}</div>
      ${row('📌 语境用法', d.usage)}
      ${row('🌱 词族', d.family)}
      ${row('🔁 举一反三', d.expand)}
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
  /* 🔴 v0.43：回滚 = 删掉这条 user 消息及以下所有上下文（包括这条）；选项跟着重新渲染 */
  rollbackMsg(idx) {
    if (this.state.rpMode) {
      if (idx < 0 || idx > this.state.rpHistory.length) return;
      this.state.rpHistory = this.state.rpHistory.slice(0, idx);
      this.rebuildRpCast(); // 🔴 v1.1：被删回合引入的 side 角色不再残留
    } else {
      if (idx < 0 || idx > this.state.chatHistory.length) return;
      this.state.chatHistory = this.state.chatHistory.slice(0, idx);
    }
    this.saveChatState();
    this.renderChatHistory();
    // 🔴 v1.2.15：回滚后提示下一步（选项可能随被删回合丢失，只剩继续/自己输入）
    if (this.state.rpMode) this.toast('已回滚——可输入新内容，或点"继续"让故事推进');
    else this.toast('已回滚到这条之前');
  },
  /* 重新生成：删除最后一条 AI 回复（RP 删整个最后一轮），重新生成（失败恢复，不丢记录） */
  async regenerateMsg() {
    if (this.state.chatBusy || this.state.rpBusy) { this.toast('正在生成中…'); return; }
    const isRp = this.state.rpMode;
    const h = isRp ? this.state.rpHistory : this.state.chatHistory;
    const last = h[h.length - 1];
    if (!last) { this.toast('没有可重新生成的内容'); return; }
    let removed;
    if (isRp) {
      // 删除最后一轮（最后一条 user 之后的所有 AI 输出），保留 user，避免重放时 user 重复
      const lastUserIdx = h.map(m => (m.role === 'user' ? 1 : 0)).lastIndexOf(1);
      const keepTo = lastUserIdx >= 0 ? lastUserIdx + 1 : 0;
      removed = h.slice(keepTo);
      this.state.rpHistory = h.slice(0, keepTo);
      this.rebuildRpCast(); // 🔴 v1.1：被删回合引入的 side 角色不再残留
    } else {
      // 🔴 v1.1：最后一条是 user（上一轮生成失败，没有 AI 回复）→ 直接重跑这条，不删
      if (last.role === 'user') {
        await this.sendText(last.content, { alreadyInHistory: true, skipSuggest: true });
        return;
      }
      removed = [h[h.length - 1]];
      this.state.chatHistory = h.slice(0, -1);
    }
    this.renderChatHistory();
    try {
      if (isRp) {
        const lastUser = this.state.rpHistory[this.state.rpHistory.length - 1];
        await this.rpRound(lastUser && lastUser.role === 'user' ? lastUser.content : 'continue', { regen: true });
      } else {
        const lastUser = [...this.state.chatHistory].reverse().find(m => m.role === 'user');
        if (lastUser) await this.sendText(lastUser.content, { alreadyInHistory: true, skipSuggest: true });
        else { this.state.chatHistory = this.state.chatHistory.concat(removed); this.renderChatHistory(); this.toast('没有可重新生成的内容'); }
      }
    } catch (e) {
      // 生成失败：把删掉的整轮放回来，避免"点一下少一条、多点几下全没了"
      if (isRp) this.state.rpHistory = this.state.rpHistory.concat(removed);
      else this.state.chatHistory = this.state.chatHistory.concat(removed);
      this.renderChatHistory();
      this.toast('重新生成失败：' + (e.message || e).slice(0, 60));
    }
  },

  /* ---------- 句子本 ---------- */
  listSentences() { return Settings.get('sentences', []); },
  /* 🔴 v0.42：同一句子不重复加入（同 text 更新原条目） */
  saveSentence(s) {
    const l = this.listSentences();
    const exist = l.find(x => x.text === s.text);
    if (exist) {
      const idx = l.indexOf(exist);
      l[idx] = { ...exist, ...s, id: exist.id, at: exist.at };
    } else {
      l.unshift(s);
    }
    Settings.set('sentences', l.slice(0, 500));
  },
  removeSentence(id) { Settings.set('sentences', this.listSentences().filter(x => x.id !== id)); },

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
    });
    document.addEventListener('scroll', () => this.exitSelectMode(), true);
  },

  /* 选句翻译：点卡片菜单查询 → 入句子本（🔴 v1.1.1：输出加 expand 类似说法） */
  async translateSelection(text) {
    const body = this.el('wordModalBody');
    body.innerHTML = `<div class="wd-ex">${this.esc(text)}</div><div class="wd-result" style="margin-top:10px">翻译中…</div>`;
    this.el('wordModalTitle').textContent = '查句';
    this.el('wordModal').classList.remove('hidden');
    try {
      const r = await Agent.queryText(text);
      // 🔴 v0.42：翻译为空说明模型没返回有效结果——不保存进句子本，提示重试（否则句子本里存空翻译）
      if (!r.cn) {
        body.innerHTML = `<div class="wd-ex">${this.esc(text)}</div><div class="wd-result" style="color:var(--danger)">翻译失败，请重试</div>`;
        return;
      }
      const s = { id: 's_' + Date.now(), text, cn: r.cn, note: r.note, expand: r.expand || '', source: 'query', ctx: this.currentCtx(), tags: ['查句'], at: Date.now() };
      this.saveSentence(s);
      body.innerHTML = `
        <div class="wd-ex">${this.esc(text)}</div>
        <div class="wd-meaning">${this.esc(r.cn || '')}</div>
        ${r.note ? `<div class="wd-note">${this.esc(r.note)}</div>` : ''}
        ${r.expand ? `<div class="wd-row"><span class="wd-key">🔁 类似说法</span> ${this.esc(r.expand)}</div>` : ''}
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
    // 🔴 v1.2.16：设置页随时重看新手指引（force=true 不改变"不再提示"）
    const reopen = this.el('onboardReopen');
    if (reopen) reopen.addEventListener('click', () => this.showOnboarding(true));
    this.el('importBtn').addEventListener('click', () => this.el('importFile').click());
    const updBtn = this.el('checkUpdateBtn');
    if (updBtn) updBtn.addEventListener('click', () => this.checkUpdate());
    // 🔴 v1.1：开发者设置面板已移除（v0.35 测试后门，正式版不携带）
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
    if (this.state.rpBusy) { this.toast('正在生成中，稍等…'); return; } // 🔴 v1.1：防双开
    // 🔴 v1.1.1：已在 RP 中再开新 RP → 先保存当前绘画（原来直接覆盖，旧会话丢最后一轮）
    if (this.state.rpMode && this.state.rpHistory.length) this.saveChatState();
    this.state.rpBusy = true; // 🔴 v1.1：选角阶段也占用（rpOfferRoles 期间用户输入会并发竞态）
    try {
      const w = this.currentWorld();
      if (!w) { this.toast('先选择或生成一个世界卡'); this.switchTab('tavern'); return; }
      // 🔴 v1.2.9：开新绘画前刷新忘词榜/随机池（提示词里带最新复习词）
      await Agent.refreshForgetWords().catch(() => {});
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
      this.resetReviewQueue(); // 🔴 v1.2.3：新会话重置复习卡队列
      this.state.convId = 'c_' + Date.now() + '_rp';
      // 🔴 v1.1.1：RP 话题命名去重——同一天同一世界卡开多次 → "世界名 · 8/3"、"世界名 · 8/3 (2)"、"世界名 · 8/3 (3)"
      let rpTitle = w.name + ' · ' + new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
      const sameTitle = this.listConversations().filter(c => c.isRp && c.title === rpTitle).length;
      if (sameTitle > 0) rpTitle = rpTitle + ' (' + (sameTitle + 1) + ')';
      this.state.convTitle = rpTitle;
      this.renderConvTitle();
      this.updateRpRoleTag(); // 🔴 v1.2.2：选角阶段显示"世界：XX（选角中…）"
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
    } finally {
      this.state.rpBusy = false; // 🔴 v1.1：任何异常都复位，防永久锁死
    }
  },
  async sendRpText(text) {
    const w = this.state.rpWorld;
    const chars = this.state.rpChars;
    if (!w || !chars.length || this.state.rpBusy) return;
    const isContinueInput = /^(continue|继续|自己来|你来|你自己来|go on|let it continue|\.\.\.?|…)$/i.test(text.trim());
    // ---- 选角阶段 ----
    if (this.state.rpStep === 'choose' || this.state.rpStep === 'custom') {
      // 🔴 v1.1：选角阶段点"继续"是无效操作（没有角色描述），拦截并提示
      if (isContinueInput) { this.toast('请先选择角色或描述你想扮演的人'); return; }
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
        if (!player || !player.name) throw new Error('角色卡为空');
        this.state.rpPlayer = player;
        this.state.rpRoster[player.name] = player.gender === 'male' ? 'm' : 'f';
        this.updateRpRoleTag(); // 🔴 v1.2.2：选角完成，输入区显示扮演角色
        this.state.rpStep = 'intro';
        this.el('chatInput').placeholder = 'Say something… 或输入"继续"';
        const intro = await Agent.rpOpenIntro(w, player, this.state.rpRoster);
        if (intro.narration) {
          const nv = Settings.get('narratorVoice', 'f');
          this.appendMsg('assistant', intro.narration, { voice: nv });
          this.state.rpHistory.push({ role: 'assistant', name: '', content: intro.narration, voice: nv, options: intro.options || null });
        }
        this.appendRpOptions(intro.options.length ? intro.options : ['继续']);
        this.saveChatState();
        this.state.rpStep = 'play';
      } catch (e) {
        // 🔴 v1.1：选角/开场失败保持 choose 阶段并重发选项（不再无感知跳进 play）
        this.toast('选角/开场失败，请重试：' + (e.message || e).slice(0, 60));
        this.state.rpStep = 'choose';
        this.state.rpPlayer = null;
        if (this.state.rpPendingRoles && this.state.rpPendingRoles.length) {
          this.appendRpOptions(this.state.rpPendingRoles.map(o => `扮演 ${o.name}：${o.desc}`).concat(['自定义：我想扮演……']));
        }
      } finally {
        this.state.rpBusy = false;
      }
      return;
    }
    // ---- 游玩阶段 ----
    this.state.rpBusy = true;
    // 🔴 v1.2.9：每轮发送前刷新忘词榜/随机池——隔了很久的绘画继续聊，提示词也是最新复习词
    await Agent.refreshForgetWords().catch(() => {});
    let userMsg = text;
    let userDiv = null;
    // 🔴 v1.2.15：user 消息先入历史再渲染——否则渲染时"最后一条 user"判定
    //   不包含本条 → 最新输入显示成"回滚"而不是"重新生成"（普通对话是先 push 的，RP 漏了）
    //   continue 不入历史（不污染上下文/积分轮次计数）
    //   中文输入：先 push 原始中文（按钮判定正确），翻译完成后把历史条目更新为英文（重生成直接重跑英文）
    let histIdx = -1;
    if (!isContinueInput) histIdx = this.state.rpHistory.push({ role: 'user', content: userMsg }) - 1;
    try {
      // 中文 → 翻译（全英语规则）
      if (/[\u4e00-\u9fa5]/.test(text)) {
        const tip = this.appendMsg('assistant', '', { typing: true });
        try {
          const en = await Agent.translateToEnglish(text);
          tip.remove();
          if (!en) {
            this.toast('翻译失败，已按原文继续');
            userDiv = this.appendMsg('user', text);
          } else {
            userDiv = this.appendMsg('user', '（中文）' + text + '\n→ ' + en);
            userMsg = en;
            if (histIdx >= 0) this.state.rpHistory[histIdx].content = en; // 历史同步为实际输入
          }
        } catch {
          tip.remove();
          this.toast('翻译失败，已按原文继续');
          userDiv = this.appendMsg('user', text);
        }
      } else {
        userDiv = this.appendMsg('user', text);
      }
      await this.rpRound(userMsg, { pushed: true });
      // 🔴 v1.2.2：RP 台词检查（语法/表达/角色契合）——异步出纠正卡，不阻塞剧情
      // 🔴 v1.2.3：触发条件放宽到 ≥3 个英文词（之前 4 词有些短句不查）
      // 🔴 v1.2.4：直接传 userDiv（不再查询 .msg-me，避免选择器落空）
      if (!isContinueInput && userMsg && /[a-zA-Z]/.test(userMsg) && (userMsg.match(/[a-zA-Z]+/g) || []).length >= 3) {
        this.maybeSuggestRp(userMsg, userDiv);
      }
    } finally {
      this.state.rpBusy = false; // 🔴 v1.1：任何异常都复位，防永久锁死
    }
  },
  /* 一轮 RP：子 Agent 逐角色推理 → 导演汇总 → 渲染 */
  async rpRound(userMsg, opts = {}) {
    const w = this.state.rpWorld;
    const chars = this.state.rpActiveChars && this.state.rpActiveChars.length ? this.state.rpActiveChars : this.state.rpChars;
    const isContinue = !userMsg || /^(continue|继续|自己来|你来|你自己来|go on|let it continue|\.\.\.?|…)$/i.test(userMsg.trim());
    if (userMsg && !isContinue && !opts.regen && !opts.pushed) this.state.rpHistory.push({ role: 'user', content: userMsg });
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
      // 🔴 v1.2.15：空 beat 校验——切 App/网络中断导致响应截断时 rpDirect 会兜底出空内容，
      //   直接渲染会出现"只有继续按钮、没有旁白和对话"的幽灵回合；视为失败抛错，用户可 ↻ 重新生成
      if (!beat || (!beat.narration && !(beat.dialogue || []).length)) {
        throw new Error('这轮生成内容为空（可能是网络中断导致响应不完整），请点 ↻ 重新生成');
      }
      typing.remove();
      const nv = Settings.get('narratorVoice', 'f');
      // 🔴 v1.1：每轮先清掉历史里所有旧 options（导演这轮没给选项时，不能残留上一轮的过期选项）
      for (const m of this.state.rpHistory) { if (m.options) m.options = null; }
      if (beat.narration) this.state.rpHistory.push({ role: 'assistant', content: beat.narration, voice: nv });
      for (const d of beat.dialogue || []) this.state.rpHistory.push({ role: 'assistant', name: d.name, content: d.line, voice: this.dialogueVoice(d) }); // 🔴 v1.1：角色消息也带 voice（切回会话音色不丢）
      this.state.rpHistory = this.state.rpHistory.slice(-200); // v0.41：放宽截断（原来 60 条，聊多了前面的记录会丢）
      // 🔴 v0.41：选项记到最近一条 assistant 消息（切回会话时可恢复）
      if (beat.options && beat.options.length) {
        for (let i = this.state.rpHistory.length - 1; i >= 0; i--) {
          if (this.state.rpHistory[i].role === 'assistant') {
            this.state.rpHistory[i].options = beat.options;
            break;
          }
        }
      }
      if (beat.narration) this.appendMsg('assistant', beat.narration, { voice: nv });
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
      if (!isContinue && userMsg && (userMsg.match(/[a-zA-Z]+/g) || []).length >= 8) {
        try {
          const roundN = this.state.rpHistory.filter(m => m.role === 'user').length;
          const r = await Farm.addPoints('rp', { key: this.state.convId + ':r' + roundN, pts: 3, maxDay: 3 });
          if (r) this.rewardToast(r, '剧场');
        } catch (e) {}
      }
    } catch (e) {
      typing.remove();
      this.appendMsg('assistant', '⚠️ RP 出错：' + (e.message || e));
      // 🔴 v1.1：本轮是用户输入且失败时，提示可重新生成（user 消息保留在历史里，regenerate 支持从 user 结尾重跑）
      if (!isContinue && userMsg && !opts.regen) {
        this.toast('这轮生成失败，可点 ↻ 重新生成重试');
      }
    }
  },
  appendRpChar(name, line, voice, idxArg, noReview) {
    const area = this.el('chatArea');
    const ph = this.el('chatPlaceholder'); if (ph) ph.remove();
    const div = document.createElement('div');
    div.className = 'msg msg-ai msg-rp-char';
    const mark = voice === 'm' ? '♂ ' : '♀ ';
    const idx = idxArg !== undefined ? idxArg : this.state.rpHistory.length;
    div.innerHTML = `<div class="msg-rp-name">${mark}${this.esc(name)}</div><div class="msg-en">${this.renderMsgText(line)}</div><div class="msg-actions"><button class="msg-chip-btn" data-say="${this.esc(line)}" data-voice="${voice || 'f'}" title="朗读">${this.sayIcon()}</button><button class="msg-chip-btn" data-sel="${this.esc(line)}" title="查单词">${Icons.search}</button><button class="msg-chip-btn" data-sent="${this.esc(line)}" title="查这句">${Icons.chat}</button></div>`;
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
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    // 🔴 v1.2.2：RP 角色消息也弹对话复习卡（忘了/模糊/记得）；恢复历史（noReview）不弹
    if (!noReview) this.maybeEmbedReviewCard(line, div);
    return div;
  },
  /* 角色 → 音色 */
  charVoice(c) { return c && c.gender === 'male' ? 'm' : 'f'; },
  /* 台词音色：固定角色按世界卡 gender；新角色按绘画名册（首次出现定性别，后续导演给了 gender 可纠正）
     🔴 v1.1：gender 显式时优先（覆盖 roster 缓存——之前 roster 一旦写死'f'就永远女声） */
  dialogueVoice(d) {
    if (d.gender === 'male' || d.gender === 'female') {
      if (d.name) (this.state.rpRoster || {})[d.name] = d.gender === 'male' ? 'm' : 'f';
      return d.gender === 'male' ? 'm' : 'f';
    }
    const c = this.state.rpChars.find(x => x.name === d.name);
    if (c) return this.charVoice(c);
    const roster = this.state.rpRoster || {};
    if (roster[d.name]) return roster[d.name];
    return 'f';
  },

  appendRpOptions(options) {
    const area = this.el('chatArea');
    const ph = this.el('chatPlaceholder');
    if (ph) ph.remove();
    // 🔴 v0.42：先移除旧选项（选完选项/新回合推进时旧按钮要消失，只剩新的）
    area.querySelectorAll('.rp-options').forEach(el => el.remove());
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
  /* 🔴 v1.2.2：会话标题下显示当前扮演角色（🔴 v1.2.4：只显示角色，不显示世界；选角中不显示） */
  updateRpRoleTag() {
    const tag = this.el('rpRoleTag');
    if (!tag) return;
    if (this.state.rpMode && this.state.rpPlayer && this.state.rpPlayer.name) {
      tag.textContent = '🎭 扮演 ' + this.state.rpPlayer.name;
      tag.classList.remove('hidden');
    } else {
      tag.classList.add('hidden');
    }
  },

  /* 退出 RP：回到普通场景对话 */
  exitRp() {
    if (this.state.rpBusy) { this.toast('正在生成中，稍等…'); return; } // 🔴 v1.1：回合中禁止退出
    this.saveChatState(); // 先保存绘画
    this.state.chatHistory = []; // 清空普通残留，避免切会话时把旧内容存进 RP 会话
    this.state.rpMode = false;
    this.state.rpWorld = null;
    this.state.rpChars = [];
    this.state.rpHistory = [];
    // 🔴 v1.1.1：退出后清空会话身份（原来残留 RP 的 convId → 退出后不点"新话题"直接普通对话，
    //            saveChatState 会以 RP id 保存普通对话，把 RP 记录覆盖成普通对话内容——用户"话题记录串了"的根因）
    this.state.convId = null;
    this.state.convTitle = '';
    this.state.rpPlayer = null;
    this.state.rpRoster = {};
    this.state.rpActiveChars = [];
    this.state.rpStep = '';
    this.resetReviewQueue(); // 🔴 v1.2.3
    this.el('chatInput').placeholder = '输入英文…';
    this.renderConvTitle();
    this.updateRpRoleTag(); // 🔴 v1.2.2：退出 RP 隐藏角色标签
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
  /* 检查版本更新
     🔴 v1.1.1：auto=true（启动自动检查）→ 有新版本弹 updateModal 显示更新日志 + 确认下载；
                auto=false（设置页手动）→ 保持内联显示 */
  async checkUpdate(auto) {
    const cur = (this.el('versionLabel').textContent || '').replace(/^v/, '');
    const fetchLatest = async () => {
      try {
        // 优先仓库根 version.json（raw CDN 国内可达，8s 超时）
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const resp = await fetch('https://raw.githubusercontent.com/zhangs1r/wordgrove/main/version.json', { signal: ctrl.signal, headers: { Accept: 'application/json' } });
        clearTimeout(timer);
        if (!resp.ok) throw new Error('http ' + resp.status);
        const j = await resp.json();
        return { latest: String(j.version || '').replace(/^v/, ''), notes: j.notes || '', url: j.url || '' };
      } catch (e) {
        // 回退 GitHub API
        const resp = await fetch('https://api.github.com/repos/zhangs1r/wordgrove/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
        if (!resp.ok) throw new Error('github ' + resp.status);
        const j = await resp.json();
        const apk = (j.assets || []).find(a => a.name.endsWith('.apk'));
        return { latest: (j.tag_name || '').replace(/^v/, ''), notes: (j.body || '').replace(/^##\s*.*\n?/, '').slice(0, 400), url: apk ? apk.browser_download_url : '' };
      }
    };
    try {
      const { latest, notes, url } = await fetchLatest();
      if (!latest || latest === cur) {
        if (!auto) {
          const info = this.el('updateInfo');
          if (info) { info.classList.remove('hidden'); info.innerHTML = `已是最新版（v${this.esc(cur)}）`; }
        }
        return;
      }
      const download = () => {
        if (!url) { this.toast('暂无下载链接，请到 GitHub release 页'); return; }
        try { location.href = 'https://ghproxy.net/' + url; }
        catch (e) { try { location.href = url; } catch (e2) { this.toast('请在浏览器打开链接下载'); } }
      };
      if (auto) {
        // 启动自动检查：弹窗显示更新日志 + 确认下载
        const modal = this.el('updateModal');
        const notesEl = this.el('updateNotes');
        if (!modal || !notesEl) return;
        notesEl.innerHTML = `<div class="upd-title">新版本 <b>v${this.esc(latest)}</b>（当前 v${this.esc(cur)}）</div><div class="upd-notes-body">${this.esc(notes || '（无更新日志）')}</div>`;
        modal.classList.remove('hidden');
        this.el('updateGoBtn').onclick = () => { modal.classList.add('hidden'); download(); };
        this.el('updateCancelBtn').onclick = () => modal.classList.add('hidden');
        const mask = modal.querySelector('.modal-mask');
        if (mask) mask.onclick = () => modal.classList.add('hidden');
        return;
      }
      const info = this.el('updateInfo');
      if (!info) return;
      info.classList.remove('hidden');
      info.innerHTML = `发现新版本 <b>v${this.esc(latest)}</b>（当前 v${this.esc(cur)}）<br><span style="opacity:.75;font-size:11px;line-height:1.5">${this.esc(notes || '')}</span><br><button id="dlApkBtn" class="btn btn-primary btn-sm" style="margin-top:8px">下载安装包</button>`;
      const dl = info.querySelector('#dlApkBtn');
      if (dl) dl.addEventListener('click', download);
    } catch (e) {
      if (!auto) {
        const info = this.el('updateInfo');
        if (info) { info.classList.remove('hidden'); info.textContent = '检查失败：网络无法访问更新源'; }
      }
    }
  },

  exportData() {
    Words.list().then(async words => {
      const farmState = await Farm.txGet('garden');
      // 🔴 v1.1：导出补全会话/句子/表达/世界卡（原来只有词库+画像+设置+小院，备份不完整）
      const data = {
        words, profile: Profile.load(), settings: {
          apiBase: Settings.get('apiBase', ''), chatModel: Settings.get('chatModel', ''), buildModel: Settings.get('buildModel', ''),
        },
        farm: farmState || undefined,
        conversations: Settings.get('conversations', []),
        sentences: Settings.get('sentences', []),
        expressions: Settings.get('expressions', []),
        worldCards: Settings.get('worldCards', []),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'englishapp-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  },

  /* 🔴 v1.1：导入 farm 的 schema 校验——数值钳制防 NaN 腐化、类型检查防脏数据 */
  _sanitizeFarm(f) {
    const num = (v, max) => { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0; };
    const now = FARM.now();
    const st = {
      id: 'garden',
      year: num(f.year, 9999) || now.getFullYear(),
      month: num(f.month, 12) || now.getMonth() + 1,
      points: num(f.points, 999999),
      totalEarned: num(f.totalEarned, 9999999),
      dayPoints: num(f.dayPoints, FARM.POINT_DAY_LIMIT),
      day: typeof f.day === 'string' ? f.day : FARM.dayKey(now),
      planted: (f.planted && typeof f.planted === 'object' && !Array.isArray(f.planted)) ? f.planted : {},
      stage: Math.min(2, num(f.stage, 2)),
      decor: Array.isArray(f.decor) ? f.decor.filter(d => d && (FARM.DECOR[d.type] || (FARM.MONTH_DECOR[st.month] || {})[d.type])).map(d => ({ id: d.id || Farm.newDecorId(), type: d.type, x: num(d.x, 1024), y: num(d.y, 1536), angle: num(d.angle, 360), scale: Math.max(0.5, Math.min(3, num(d.scale, 3) || 1)) })) : [],
      owned: Array.isArray(f.owned) ? f.owned.filter(t => FARM.DECOR[t] || (FARM.MONTH_DECOR[st.month] || {})[t]) : [],
      dayCounts: (f.dayCounts && typeof f.dayCounts === 'object') ? f.dayCounts : {},
      sealed: false,
      history: Array.isArray(f.history) ? f.history.slice(0, 36) : [],
    };
    return st;
  },

  async importData(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.words && Array.isArray(data.words)) {
        let n = 0;
        for (const w of data.words) {
          if (!w || !w.word) continue;
          const exist = await Words.findByWord(w.word);
          if (exist) continue;
          await Words.add({ word: String(w.word).slice(0, 80), phonetic: w.phonetic || '', meaning: w.meaning || '',
            example: w.example || '', exampleCn: w.exampleCn || '', source: w.source || 'import' });
          n++;
        }
        // 🔴 v1.1：画像合并导入（不整体覆盖——旧备份缺新字段会清掉 streak/wordsLearned）
        if (data.profile && typeof data.profile === 'object') {
          Profile.save({ ...Profile.load(), ...data.profile });
        }
        // 🔴 v1.1：farm 导入带 schema 校验与数值钳制（手改 JSON 注入任意积分/NaN 腐化都拦掉）
        if (data.farm && data.farm.id) {
          const st = this._sanitizeFarm(data.farm);
          Farm._state = st;
          Farm._migrateDecor(st);
          await Farm.save();
        }
        // 🔴 v1.1：补全会话/句子/表达/世界卡导入
        if (Array.isArray(data.conversations)) Settings.set('conversations', data.conversations.slice(0, 40));
        if (Array.isArray(data.sentences)) Settings.set('sentences', data.sentences.slice(0, 500));
        if (Array.isArray(data.expressions)) Settings.set('expressions', data.expressions.slice(0, 50));
        if (Array.isArray(data.worldCards)) Settings.set('worldCards', data.worldCards.slice(0, 50));
        this.toast(`导入 ${n} 个词` + (data.farm ? '，小院已恢复' : ''));
        this.refreshWordsSet();
        Agent.refreshForgetWords();
        this.renderWords();
        if (this.state.tab === 'garden') this.renderGardenFull();
      } else {
        this.toast('备份文件格式不对（缺少 words）');
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
