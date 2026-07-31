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
    convId: null,
    convTitle: '',
    _naming: false,
    hintMode: false,
    hintBox: null,
  },

  init() {
    this.bindTabs();
    this.bindTheme();
    this.bindSettings();
    this.bindConv();
    this.renderScenes();
    this.renderToday();
    this.renderWords();
    this.renderProfile();
    this.bindChat();
    this.bindWords();
    this.bindCardActions();
    this.loadTtsVoices();

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
        this.newConv();
        wrap.querySelectorAll('.scene-chip').forEach(c => c.classList.toggle('active', c === chip));
      });
    });
  },

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
      sceneId: this.state.sceneId,
      history: this.state.chatHistory,
      updated: Date.now(),
    };
  },
  newConv() {
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
    if (this.state.chatHistory.length) this.saveConversation(this.currentConv());
    const conv = this.listConversations().find(c => c.id === id);
    if (!conv) return;
    this.state.convId = conv.id;
    this.state.convTitle = conv.title || '';
    this.state.sceneId = conv.sceneId || this.state.sceneId;
    this.state.chatHistory = conv.history || [];
    this.state.autoTurn = 0;
    document.querySelectorAll('.scene-chip').forEach(c => c.classList.toggle('active', c.dataset.scene === this.state.sceneId));
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
      const scene = SCENES.find(s => s.id === c.sceneId);
      return `
      <div class="conv-item ${c.id === this.state.convId ? 'active' : ''}" data-id="${c.id}">
        <div class="ci-main">
          <div class="ci-title">${this.esc(c.title || '新会话')}</div>
          <div class="ci-meta">${this.esc(scene ? scene.name : (c.sceneId || ''))} · ${(c.history || []).length} 条 · ${this.fmtTime(c.updated)}</div>
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
    if (this.state.chatHistory.length) this.saveConversation(this.currentConv());
  },
  loadChatState() {
    const list = this.listConversations();
    if (list.length) {
      const conv = [...list].sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
      this.state.convId = conv.id;
      this.state.convTitle = conv.title || '';
      this.state.sceneId = conv.sceneId || this.state.sceneId;
      this.state.chatHistory = conv.history || [];
      document.querySelectorAll('.scene-chip').forEach(c => c.classList.toggle('active', c.dataset.scene === this.state.sceneId));
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
    if (this.state.hintMode) {
      await this.sendChineseHint(text);
    } else {
      await this.sendText(text);
    }
  },

  async sendText(text, opts = {}) {
    const scene = SCENES.find(s => s.id === this.state.sceneId);
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
      // 自动命名：对话有 2 条消息且还没标题时，让模型起个名
      if (!this.state.convTitle && this.state.chatHistory.length >= 2) {
        this.nameConversation();
      }
    } catch (e) {
      typing.remove();
      const host = API.base.includes('deepseek.com') ? 'deepseek' : API.base.includes('opencode.ai') ? 'opencode' : API.base;
      const label = '⚠️ [' + scene.name + ' / ' + Settings.get('chatModel', 'deepseek-v4-flash') + ' @' + host + '] ' + (e.message || '出错了');
      const div = this.appendMsg('assistant', label);
      const actions = div.querySelector('.msg-actions');
      if (actions) {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'msg-chip-btn';
        retryBtn.textContent = '🔄 重试';
        retryBtn.onclick = () => this.retryLast(scene);
        actions.appendChild(retryBtn);
      }
      this.saveChatState();
    }
    this.state.chatBusy = false;
    this.el('reviewPanel').classList.add('hidden');
  },

  /* 重试：清掉最后一条错误消息，用最后一条用户消息再跑一次 */
  async retryLast(scene) {
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
      <div class="sg-head">💡 可以这样说</div>
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
    this.toast('已加入表达积累 🌱');
  },
  enterHintMode(box) {
    this.state.hintMode = true;
    this.state.hintBox = box;
    const input = this.el('chatInput');
    input.placeholder = '用中文写你想表达的意思…';
    input.focus();
    this.el('chatSendBtn').textContent = '📝';
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
    const scene = SCENES.find(s => s.id === this.state.sceneId);
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
        this.appendMsg('assistant', '💡 ' + sug.better + (sug.reason ? '\n' + sug.reason : ''));
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
    // API 提供商预设
    const PROVIDERS = {
      deepseek: { base: 'https://api.deepseek.com/v1/chat/completions', models: ['deepseek-v4-flash', 'deepseek-v4-pro'] },
      opencode: { base: 'https://opencode.ai/zen/go/v1/chat/completions', models: ['deepseek-v4-flash', 'mimo-v2.5', 'deepseek-v4-pro'] },
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
    bind('setApiBase', 'apiBase', 'https://api.deepseek.com/v1/chat/completions');
    bind('setAutoSpeak', 'autoSpeak');
    bind('setReadReply', 'readReply');
    bind('setRate', 'rate');
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

  /* TTS 引擎检测 + 音色列表 */
  async loadTtsVoices() {
    const status = this.el('ttsStatus');
    if (!status) return;
    const plugin = window.Capacitor?.Plugins?.TextToSpeech;
    if (TTS.engine === 'ready') {
      status.textContent = '内置引擎 ✓（Piper 离线美音）';
    } else if (TTS.engine === 'loading') {
      status.textContent = '内置引擎加载中…';
    } else if (plugin) {
      status.textContent = '系统原生引擎（内置引擎不可用）';
    } else {
      status.textContent = '浏览器引擎（备用）';
    }
    try {
      if (!plugin) return;
      const res = await plugin.getSupportedVoices();
      const voices = res.voices || [];
      const sel = this.el('setVoice');
      if (!voices.length) {
        sel.innerHTML = '<option value="-1">默认音色</option>';
      } else {
        const display = [...voices].sort((a, b) => {
          const ae = (a.lang || '').toLowerCase().startsWith('en') ? 0 : 1;
          const be = (b.lang || '').toLowerCase().startsWith('en') ? 0 : 1;
          return ae - be;
        });
        sel.innerHTML = '<option value="-1">默认音色</option>' + display.map(v => {
          const idx = voices.indexOf(v);
          const name = v.name || v.voiceURI || ('voice ' + idx);
          const tag = v.localService === false ? ' (在线)' : '';
          return `<option value="${idx}">${name}${tag} · ${v.lang || ''}</option>`;
        }).join('');
      }
      const cur = Settings.get('voiceIdx', -1);
      if (sel.querySelector(`option[value="${cur}"]`)) sel.value = String(cur);
      sel.addEventListener('change', () => Settings.set('voiceIdx', parseInt(sel.value, 10)));
    } catch (e) {
      console.log('loadTtsVoices fail', e);
    }
    const installBtn = this.el('ttsInstallBtn');
    if (installBtn && !installBtn.dataset.bound) {
      installBtn.dataset.bound = '1';
      installBtn.addEventListener('click', async () => {
        try {
          await plugin.openInstall();
        } catch {
          this.toast('系统设置 → 语音与输入 → 文字转语音');
        }
      });
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
