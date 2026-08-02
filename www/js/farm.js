/* farm.js — 言木小院 v0.33：月历花园
 * 核心：一个月的小院 = 一个月的日历。每天学习 → 当天格子种下作物；月积分买当月装饰；月底封存成历史。
 * 原则不变：学习驱动家园，家园不反过来索取时间；月积分只由学习产出，月末清空。
 */

const FARM = {
  POINT_DAY_LIMIT: 40,   // 月积分每日上限（≈1200/月，接近 1000 概念）
  GROW_PER_STAGE: 40,    // 当月累计积分每 40 分，全月作物升一阶段（0/1/2）

  MONTH_SEASON: ['winter','winter','spring','spring','spring','summer','summer','summer','autumn','autumn','autumn','winter'],
  // 每季作物池（当月按日期轮换；对应 crops.png 中的 3 帧组索引 0-16）
  SEASON_CROPS: {
    spring: ['strawberry','tomato','bean','melon','potato'],
    summer: ['corn','pepper','grape','melon','tomato'],
    autumn: ['pumpkin','cranberry','grape','corn','bean'],
    winter: ['potato','starfruit','banana','pineapple','cranberry'],
  },
  // crops.png 每 96px 一种作物：{ x: 帧组索引, 名称中文 }
  CROP_DEFS: {
    potato:     { x: 0,  name: '土豆' },
    starfruit:  { x: 1,  name: '杨桃' },
    tomato:     { x: 2,  name: '番茄' },
    corn:       { x: 3,  name: '玉米' },
    pumpkin:    { x: 4,  name: '南瓜' },
    melon:      { x: 5,  name: '甜瓜' },
    bean:       { x: 6,  name: '四季豆' },
    bean2:      { x: 7,  name: '架豆' },
    pepper:     { x: 8,  name: '辣椒' },
    tomato2:    { x: 9,  name: '小番茄' },
    grape:      { x: 10, name: '葡萄' },
    banana:     { x: 11, name: '香蕉' },
    strawberry: { x: 12, name: '草莓' },
    pineapple:  { x: 13, name: '菠萝' },
    hop:        { x: 14, name: '啤酒花' },
    cranberry:  { x: 15, name: '蔓越莓' },
    pineapple2: { x: 16, name: '凤梨' },
  },
  // 通用装饰（月积分价格；x/y 为程序化绘制用——后续换 AI sprite）
  DECOR: {
    bench:  { name: '长椅',   price: 30 },
    lamp:   { name: '路灯',   price: 45 },
    pot:    { name: '花盆',   price: 20 },
    fence:  { name: '围栏',   price: 12 },
    stone:  { name: '石头',   price: 8 },
    windmill: { name: '风车', price: 60 },
  },
  // 月度限定装饰（AI 生成 sprite；v0.36 起每月 2 个，按原规划表）
  MONTH_DECOR: {
    1:  { lantern: { name: '灯笼' }, snowman: { name: '雪人' } },
    2:  { flower_lamp: { name: '花灯' }, heart_ornament: { name: '桃心摆件' } },
    3:  { kite: { name: '风筝' }, swing: { name: '秋千' } },
    4:  { sakura_umbrella: { name: '樱花伞' }, picnic_mat: { name: '野餐垫' } },
    5:  { flower_wreath: { name: '花环' }, watering_can: { name: '洒水壶' } },
    6:  { firefly_jar: { name: '萤火虫罐' }, wind_chime: { name: '风铃' } },
    7:  { seashell: { name: '贝壳' }, beach_umbrella: { name: '沙滩伞' } },
    8:  { star_lamp: { name: '星星灯' }, cicada_tree: { name: '蝉鸣树' } },
    9:  { scarecrow: { name: '稻草人' }, leaf_pile: { name: '落叶堆' } },
    10: { pumpkin_lantern: { name: '南瓜灯' }, spider_web: { name: '蛛网' } },
    11: { campfire: { name: '篝火' }, ginkgo_fan: { name: '银杏扇' } },
    12: { santa_sock: { name: '圣诞袜' }, fairy_lights: { name: '彩灯' } },
  },

  dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  /* 🔴 全局日期源：开发者设置可模拟日期（devDate={y,m,d}），正式版删除此逻辑后自动回真实时间 */
  now() {
    const dv = Settings.get('devDate', null);
    if (dv && dv.y && dv.m && dv.d) return new Date(dv.y, dv.m - 1, dv.d, 12, 0, 0);
    return new Date();
  },
  seasonOf(month) { return this.MONTH_SEASON[month - 1]; },
  monthCrop(month, day) {
    const pool = this.SEASON_CROPS[this.seasonOf(month)];
    return pool[(day - 1) % pool.length];
  },
  daysInMonth(year, month) { return new Date(year, month, 0).getDate(); },
  firstWeekday(year, month) { return new Date(year, month - 1, 1).getDay(); }, // 0=周日
};

const Farm = {
  _state: null,
  _imgs: {},  // 素材缓存

  defaultState() {
    const now = FARM.now();
    return {
      id: 'garden', year: now.getFullYear(), month: now.getMonth() + 1,
      points: 0, totalEarned: 0, dayPoints: 0, day: FARM.dayKey(now),
      planted: {}, stage: 0, decor: [], owned: [],
      sealed: false, history: [],
    };
  },

  /* ============ 装饰（v0.36 坐标制） ============
   * st.owned: 已购买的类型列表（string[]）
   * st.decor: 已摆放 [{type, x, y}]（1024×1536 画布坐标）
   * 旧数据（v0.35 之前 {type, day}）load 时自动迁移：day→锚点坐标
   */
  async load() {
    const now = FARM.now();
    if (!this._state) {
      const s = await this.txGet('garden');
      this._state = s || this.defaultState();
      this._migrateDecor(this._state);
    }
    // 跨月封存
    const st = this._state;
    if (!st.sealed && (st.year !== now.getFullYear() || st.month !== now.getMonth() + 1)) {
      st.sealed = true;
      st.history = st.history || [];
      st.history.unshift({ year: st.year, month: st.month, planted: st.planted, decor: st.decor, owned: st.owned || [], stage: st.stage, totalEarned: st.totalEarned, sealedAt: Date.now() });
      const fresh = this.defaultState();
      fresh.history = st.history.slice(0, 36); // 保留 3 年
      this._state = fresh;
      await this.save();
    }
    return this._state;
  },
  /* 旧装饰数据迁移：{type, day} → {type, x, y}（day 映射到旧 12 锚点）；补 decor id（v0.37 多份支持） */
  _migrateDecor(st) {
    st.owned = st.owned || [];
    if (!Array.isArray(st.decor)) st.decor = [];
    if (st.decor.length && st.decor[0].x != null && st.decor[0].id != null) return; // 已是坐标+id 制
    const anchors = [
      { x: 220, y: 290 }, { x: 420, y: 275 }, { x: 620, y: 280 }, { x: 820, y: 295 },
      { x: 220, y: 1180 }, { x: 420, y: 1200 }, { x: 620, y: 1190 }, { x: 820, y: 1185 },
      { x: 120, y: 800 }, { x: 910, y: 800 }, { x: 140, y: 1380 }, { x: 880, y: 1380 },
    ];
    let i = 0;
    const migrated = [];
    for (const d of st.decor) {
      let x = d.x, y = d.y;
      if (x == null || y == null) {
        const a = anchors[(d.day != null ? d.day - 1 : i) % anchors.length];
        x = a.x; y = a.y;
      }
      migrated.push({ id: d.id || this.newDecorId(), type: d.type, x, y });
      i++;
    }
    st.decor = migrated;
  },
  newDecorId() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },
  async save() { await this.txPut('garden', this._state); },
  async txGet(id) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const r = d.transaction('farm', 'readonly').objectStore('farm').get(id);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  },
  async txPut(id, val) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction('farm', 'readwrite');
      t.objectStore('farm').put(val);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  },

  /* ============ 月积分奖励 ============
   * addPoints(source, { key, pts, maxDay })
   * 幂等键 + 每日上限 + 单事务原子写入；积分只由学习产出
   */
  async addPoints(source, opts) {
    const key = (opts.key == null ? '' : String(opts.key));
    const evId = 'ev_' + source + '_' + key;
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction('farm', 'readwrite');
      const store = t.objectStore('farm');
      const reqEv = store.get(evId);
      reqEv.onsuccess = () => {
        if (reqEv.result) { resolve(null); return; }
        const reqS = store.get('garden');
        reqS.onsuccess = () => {
          let st = reqS.result;
          const now = FARM.now();
          const today = FARM.dayKey(now);
          // 跨月重置（封存旧月）
          if (st && !st.sealed && (st.year !== now.getFullYear() || st.month !== now.getMonth() + 1)) {
            st.sealed = true;
            st.history = st.history || [];
            st.history.unshift({ year: st.year, month: st.month, planted: st.planted, decor: st.decor, stage: st.stage, totalEarned: st.totalEarned, sealedAt: Date.now() });
            const fresh = this.defaultState();
            fresh.history = st.history.slice(0, 36);
            st = fresh;
          }
          if (!st) st = this.defaultState();
          if (st.day !== today) { st.day = today; st.dayPoints = 0; }
          if (opts.maxDay && st.dayPoints >= opts.maxDay) { resolve(null); return; }
          let p = opts.pts || 0;
          if (st.dayPoints + p > FARM.POINT_DAY_LIMIT) p = Math.max(0, FARM.POINT_DAY_LIMIT - st.dayPoints);
          if (p === 0) { resolve(null); return; }
          st.points += p;
          st.totalEarned += p;
          st.dayPoints += p;
          // 每日首学：当天格子种下当月作物
          const dayNum = now.getDate();
          if (!st.planted[dayNum]) {
            st.planted[dayNum] = FARM.monthCrop(st.month, dayNum);
          }
          // 阶段升级
          const newStage = Math.min(2, Math.floor(st.totalEarned / FARM.GROW_PER_STAGE));
          if (newStage !== st.stage) st.stage = newStage;
          store.put(st);
          Farm._state = st; // 同步内存缓存
          store.put({ id: evId, source, key, pts: p, at: Date.now() });
          resolve({ pts: p, stage: st.stage, planted: st.planted[dayNum] || null });
        };
        reqS.onerror = () => reject(reqS.error);
      };
      reqEv.onerror = () => reject(reqEv.error);
      t.onerror = () => reject(t.error);
    });
  },

  /* ============ 装饰 ============ */
  async buyDecor(type) {
    const st = await this.load();
    const def = FARM.DECOR[type] || null;
    const monthDef = FARM.MONTH_DECOR[st.month] || {};
    const mdef = monthDef[type] || null;
    const d = def || mdef;
    if (!d) return { ok: false, msg: '装饰不存在' };
    // 🔴 月度限定装饰定义里没有 price 字段（只有 name）——统一 fallback 30
    const price = d.price != null ? d.price : 30;
    if (st.points < price) return { ok: false, msg: '积分不够（需 ' + price + '）' };
    st.points -= price;
    st.owned.push(type); // v0.37：不限次数，可买多份
    await this.save();
    return { ok: true, type };
  },
  /* 摆放装饰（坐标制）：x,y 为 1024×1536 画布坐标；同类型可摆多份（各带 id） */
  async placeDecor(type, x, y) {
    const st = await this.load();
    if (!st.owned.includes(type)) return { ok: false, msg: '还没有这个装饰，先去商店买' };
    const id = this.newDecorId();
    st.decor.push({ id, type, x: Math.round(x), y: Math.round(y) });
    await this.save();
    return { ok: true, id };
  },
  /* 收起装饰（按 id 移除，仍在 owned 里可再摆） */
  async removeDecor(id) {
    const st = await this.load();
    st.decor = st.decor.filter(d => d.id !== id);
    await this.save();
    return { ok: true };
  },
  /* 保存整体摆放布局（编辑模式点勾时调用，layout 带 id，同类型多份） */
  async saveDecorLayout(layout) {
    const st = await this.load();
    st.decor = layout.map(d => ({ id: d.id || this.newDecorId(), type: d.type, x: Math.round(d.x), y: Math.round(d.y) }));
    await this.save();
    return { ok: true };
  },

  /* ============ 素材加载 ============ */
  async ensureImgs() {
    const names = ['crops', 'grass_spring', 'grass_summer', 'grass_autumn', 'grass_winter'];
    for (const n of names) {
      if (this._imgs[n]) continue;
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { this._imgs[n] = img; resolve(); };
        img.onerror = () => resolve();
        img.src = 'assets/' + n + '.png';
      });
    }
    // 通用装饰 sprite（🔴 v0.34 修复：此前只加载月度装饰，通用装饰一直程序化兜底）
    for (const k of Object.keys(FARM.DECOR)) {
      if (this._imgs['decor_' + k]) continue;
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { this._imgs['decor_' + k] = img; resolve(); };
        img.onerror = () => resolve();
        img.src = 'assets/decor/' + k + '.png';
      });
    }
    // 月度装饰 sprite（懒加载，失败静默用程序化兜底）
    const st = this._state;
    if (st) {
      const monthDefs = FARM.MONTH_DECOR[st.month] || {};
      for (const k of Object.keys(monthDefs)) {
        if (this._imgs['decor_' + k]) continue;
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => { this._imgs['decor_' + k] = img; resolve(); };
          img.onerror = () => resolve();
          img.src = 'assets/decor/' + k + '.png';
        });
      }
    }
  },

  /* ============ Canvas 月历渲染 ============ */
  CELL: 48,
  paintCalendar(ctx, state, opts = {}) {
    const now = FARM.now();
    const year = opts.year != null ? opts.year : state.year;
    const month = opts.month != null ? opts.month : state.month;
    const planted = opts.planted || state.planted;
    const decor = opts.decor || state.decor;
    const stage = opts.stage != null ? opts.stage : state.stage;
    const season = FARM.seasonOf(month);
    const grass = this._imgs['grass_' + season] || null;

    const C = this.CELL;
    const days = FARM.daysInMonth(year, month);
    const wd = FARM.firstWeekday(year, month);
    ctx.clearRect(0, 0, 7 * C, 6 * C);
    ctx.imageSmoothingEnabled = false;

    for (let d = 1; d <= days; d++) {
      const cellIdx = wd + d - 1;
      const cx = (cellIdx % 7) * C;
      const cy = Math.floor(cellIdx / 7) * C;
      // 背景草地
      if (grass) {
        ctx.drawImage(grass, cx, cy, C, C);
      } else {
        ctx.fillStyle = season === 'winter' ? '#E8EDE8' : '#9CCC65';
        ctx.fillRect(cx, cy, C, C);
      }
      // 今天高亮
      const isToday = !opts.readonly && d === now.getDate() && state.year === now.getFullYear() && state.month === now.getMonth() + 1;
      if (isToday) {
        ctx.strokeStyle = '#FAC75E';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cx + 1, cy + 1, C - 2, C - 2);
      }
      // 日期数字（清晰：深色+阴影）
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(String(d), cx + 4, cy + 3);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText(String(d), cx + 3, cy + 2);
      // 格子分隔线
      ctx.strokeStyle = 'rgba(0,0,0,0.07)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + 0.5, cy + 0.5, C - 1, C - 1);
      // 作物（放大绘制保持像素感）
      const crop = planted[d];
      if (crop && this._imgs.crops && FARM.CROP_DEFS[crop]) {
        const def = FARM.CROP_DEFS[crop];
        const sx = def.x * 96 + stage * 32;
        ctx.drawImage(this._imgs.crops, sx, 0, 32, 32, cx + (C - 44) / 2, cy + C - 46, 44, 44);
        // 名称小标（成熟时显示）
        if (stage >= 2) {
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.font = '8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(def.name, cx + C / 2, cy + C - 13);
          ctx.textAlign = 'left';
        }
      }
      // 装饰
      const ds = decor.filter(x => x.day === d);
      for (const de of ds) {
        this.paintDecor(ctx, de.type, cx, cy, C, month);
      }
    }
    // 空格（月末之后）画浅色底
    const total = wd + days;
    for (let i = total; i < 42; i++) {
      const cx = (i % 7) * C;
      const cy = Math.floor(i / 7) * C;
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(cx, cy, C, C);
    }
  },

  /* 装饰绘制：优先 AI sprite（assets/decor/<type>.png），没有则程序化兜底 */
  paintDecor(ctx, type, cx, cy, C, month) {
    const img = this._imgs['decor_' + type];
    const size = 36;
    if (img) {
      ctx.drawImage(img, 0, 0, img.width, img.height, cx + (C - size) / 2, cy + (C - size) / 2 - 4, size, size);
      return;
    }
    // 程序化兜底（简单形状）
    const mx = cx + C / 2, my = cy + C / 2;
    ctx.save();
    switch (type) {
      case 'bench':
        ctx.fillStyle = '#6D4C41'; ctx.fillRect(mx - 14, my + 2, 28, 5);
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(mx - 14, my - 6, 28, 3);
        ctx.fillRect(mx - 13, my + 7, 3, 6); ctx.fillRect(mx + 10, my + 7, 3, 6);
        break;
      case 'lamp':
        ctx.fillStyle = '#455A64'; ctx.fillRect(mx - 1, my - 8, 3, 16);
        ctx.fillStyle = '#FAC75E'; ctx.fillRect(mx - 6, my - 13, 13, 6);
        break;
      case 'pot':
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(mx - 7, my + 4, 14, 6);
        ctx.fillStyle = '#E57373'; ctx.fillRect(mx - 4, my - 6, 8, 7);
        break;
      case 'fence':
        ctx.fillStyle = '#795548'; ctx.fillRect(mx - 15, my - 2, 30, 3);
        ctx.fillRect(mx - 12, my - 8, 3, 13); ctx.fillRect(mx + 9, my - 8, 3, 13);
        break;
      case 'stone':
        ctx.fillStyle = '#9E9E9E'; ctx.fillRect(mx - 8, my - 2, 16, 10);
        ctx.fillStyle = '#BDBDBD'; ctx.fillRect(mx - 8, my - 2, 16, 3);
        break;
      case 'windmill':
        ctx.fillStyle = '#D7CCC8'; ctx.fillRect(mx - 1, my - 8, 3, 14);
        ctx.fillStyle = '#FAC75E'; ctx.beginPath(); ctx.arc(mx + 0.5, my - 8, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(mx - 6, my - 6, 12, 2); ctx.fillRect(mx - 1, my - 12, 2, 12);
        break;
      default:
        ctx.fillStyle = '#FAC75E';
        ctx.fillRect(mx - 5, my - 5, 10, 10);
    }
    ctx.restore();
  },

  /* 点击：像素 → 日期格（返回 day 或 null） */
  hitDay(canvas, e, year, month) {
    const rect = canvas.getBoundingClientRect();
    const C = this.CELL;
    const scale = rect.width / (7 * C);
    const px = Math.floor((e.clientX - rect.left) / scale / C);
    const py = Math.floor((e.clientY - rect.top) / scale / C);
    const idx = py * 7 + px;
    const wd = FARM.firstWeekday(year, month);
    const day = idx - wd + 1;
    if (day >= 1 && day <= FARM.daysInMonth(year, month)) return day;
    return null;
  },
};

/* 有效学习时长追踪：有交互且页面可见时累计，每 3 分钟 +1 月积分（幂等段，防挂机刷） */
const FarmActivity = {
  lastActivity: Date.now(),
  _acc: 0,
  _timer: null,
  start() {
    document.addEventListener('pointerdown', () => { this.lastActivity = Date.now(); }, { passive: true });
    document.addEventListener('keydown', () => { this.lastActivity = Date.now(); });
    this._timer = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - this.lastActivity > 10 * 60 * 1000) return;
      this._acc += 30;
      if (this._acc >= 180) {
        this._acc = 0;
        try {
          const seg = Math.floor(Date.now() / 180000);
          await Farm.addPoints('time', { key: 'seg:' + seg, pts: 1 });
        } catch (e) {}
      }
    }, 30000);
  },
};
