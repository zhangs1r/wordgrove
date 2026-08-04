/* farm.js — 言木小院 v0.33：月历花园
 * 核心：一个月的小院 = 一个月的日历。每天学习 → 当天格子种下作物；月积分买当月装饰；月底封存成历史。
 * 原则不变：学习驱动家园，家园不反过来索取时间；月积分只由学习产出，月末清空。
 */

const FARM = {
  POINT_DAY_LIMIT: 50,   // 每日积分上限（v1.0：全勤月 ≈1500 分 = 4 个限定 500 + 剩 1000 买普通）
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
    // 🔴 v1.0 通用装饰扩充（种类更多，搭配更丰富）
    tree:  { name: '小树',   price: 40 },
    flower_bed: { name: '花坛', price: 35 },
    fountain: { name: '喷泉', price: 80 },
    gazebo: { name: '凉亭', price: 90 },
    birdhouse: { name: '鸟屋', price: 18 },
    mushroom: { name: '蘑菇', price: 10 },
    hay_bale: { name: '草垛', price: 15 },
    mailbox: { name: '信箱', price: 22 },
    stone_lantern: { name: '石灯笼', price: 50 },
    flower_basket: { name: '花篮', price: 25 },
  },
  // 月度限定装饰（AI 生成 sprite；v0.36 起每月 2 个，按原规划表）
  // 🔴 v0.43 积分设计：限定装饰 price=150（比普通装饰 8~60 贵，体现稀缺）；
  //   每日上限 40 分 → 全勤月 ≈1200 分 = 买完 2 个限定(300) + 剩 900 买普通装饰（可买 15~100 个）
  // 🔴 v1.0 每月再增 2 个限定（price=100，比 150 档便宜一点但仍是限定），每月 4 个限定共 500 分
  MONTH_DECOR: {
    1:  { lantern: { name: '灯笼', price: 150 }, snowman: { name: '雪人', price: 150 }, ice_lamp: { name: '冰灯', price: 100 }, sled: { name: '雪橇', price: 100 } },
    2:  { flower_lamp: { name: '花灯', price: 150 }, heart_ornament: { name: '桃心摆件', price: 150 }, rose_bouquet: { name: '玫瑰束', price: 100 }, chocolate_box: { name: '巧克力盒', price: 100 } },
    3:  { kite: { name: '风筝', price: 150 }, swing: { name: '秋千', price: 150 }, willow_tree: { name: '柳树', price: 100 }, forsythia: { name: '迎春花', price: 100 } },
    4:  { sakura_umbrella: { name: '樱花伞', price: 150 }, picnic_mat: { name: '野餐垫', price: 150 }, camellia: { name: '山茶花', price: 100 }, bamboo: { name: '竹笋', price: 100 } },
    5:  { flower_wreath: { name: '花环', price: 150 }, watering_can: { name: '洒水壶', price: 150 }, rose_arch: { name: '玫瑰拱门', price: 100 }, beehive: { name: '蜂箱', price: 100 } },
    6:  { firefly_jar: { name: '萤火虫罐', price: 150 }, wind_chime: { name: '风铃', price: 150 }, lotus: { name: '荷花', price: 100 }, dragonfly: { name: '蜻蜓', price: 100 } },
    7:  { seashell: { name: '贝壳', price: 150 }, beach_umbrella: { name: '沙滩伞', price: 150 }, palm_tree: { name: '椰树', price: 100 }, lifebuoy: { name: '救生圈', price: 100 } },
    8:  { star_lamp: { name: '星星灯', price: 150 }, cicada_tree: { name: '蝉鸣树', price: 150 }, watermelon: { name: '西瓜', price: 100 }, sunflower: { name: '向日葵', price: 100 } },
    9:  { scarecrow: { name: '稻草人', price: 150 }, leaf_pile: { name: '落叶堆', price: 150 }, maple_tree: { name: '枫树', price: 100 }, grain_stack: { name: '谷堆', price: 100 } },
    10: { pumpkin_lantern: { name: '南瓜灯', price: 150 }, spider_web: { name: '蛛网', price: 150 }, bat: { name: '蝙蝠', price: 100 }, ghost: { name: '幽灵', price: 100 } },
    11: { campfire: { name: '篝火', price: 150 }, ginkgo_fan: { name: '银杏扇', price: 150 }, torch: { name: '火把', price: 100 }, ginkgo_tree: { name: '银杏树', price: 100 } },
    12: { santa_sock: { name: '圣诞袜', price: 150 }, fairy_lights: { name: '彩灯', price: 150 }, christmas_tree: { name: '圣诞树', price: 100 }, gingerbread: { name: '姜饼人', price: 100 } },
  },

  dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  /* 🔴 v1.1：开发者模拟日期已移除（正式版不携带测试后门），统一真实时间 */
  now() { return new Date(); },
  seasonOf(month) { return this.MONTH_SEASON[month - 1]; },
  monthCrop(month, day) {
    // 🔴 v0.43 随机种植：每天从当月季节作物池随机选一种（不用固定轮换）；
    //   用 day 做种子伪随机，保证同一天稳定（重进不换）
    const pool = this.SEASON_CROPS[this.seasonOf(month)];
    const seed = (month * 31 + day) * 2654435761 % 100000;
    return pool[seed % pool.length];
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
      dayCounts: {}, // 🔴 v1.1：各来源当日发放次数（maxDay 语义修复）
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
      let s = null;
      // 🔴 v1.2.36：IndexedDB 读失败（事务 reject/存储异常）也走备份兜底——原来只兜 null 不兜错误，
      //   读失败直接 throw 会让今日页/小院整块炸掉，备份一次都没被咨询
      try { s = await this.txGet('garden'); } catch (e) { console.warn('farm load txGet failed, fallback backup', e); }
      const fromBackup = this._fromBackup();
      // 🔴 v1.2.6：IndexedDB 读不到 → 从 localStorage 备份恢复（防更新后数据丢失），再没有才新建
      this._state = s || fromBackup || this.defaultState();
      if (!s && fromBackup) { try { await this.txPut('garden', this._state); } catch (e) {} }
      this._state.dayCounts = this._state.dayCounts || {}; // 🔴 v1.1 旧数据迁移
      this._migrateDecor(this._state);
    }
    // 跨月封存（统一走 sealState，load 与 addPoints 共用同一条路径）
    const st = this._state;
    if (!st.sealed && (st.year !== now.getFullYear() || st.month !== now.getMonth() + 1)) {
      this._state = this.sealState(st);
      await this.save();
    }
    return this._state;
  },
  /* 🔴 v1.1：跨月封存统一入口——积分跨月结转 + 已购装饰跨月保留 + 历史深拷贝 + 保留 36 个月
     🔴 v1.2.36：封存前查重（时钟回拨/并发 load 曾产生重复历史月条目） */
  sealState(st) {
    st.sealed = true;
    st.history = st.history || [];
    // 同一年月已存在 → 只更新不重复 unshift（防时钟回拨/并发 load 双封存）
    const dup = st.history.findIndex(h => h.year === st.year && h.month === st.month);
    const entry = { year: st.year, month: st.month, planted: st.planted, decor: JSON.parse(JSON.stringify(st.decor || [])), owned: (st.owned || []).slice(), stage: st.stage, totalEarned: st.totalEarned, sealedAt: Date.now() };
    if (dup >= 0) st.history[dup] = entry;
    else st.history.unshift(entry);
    const fresh = this.defaultState();
    fresh.points = st.points || 0;
    fresh.owned = (st.owned || []).slice();
    fresh.history = st.history.slice(0, 36);
    return fresh;
  },
  /* 旧装饰数据迁移：{type, day} → {type, x, y}（day 映射到旧 12 锚点）；补 decor id/angle/scale（v0.39 多份+旋转+缩放） */
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
      migrated.push({ id: d.id || this.newDecorId(), type: d.type, x, y, angle: d.angle || 0, scale: d.scale || 1 });
      i++;
    }
    st.decor = migrated;
    // 历史月份装饰也补 id/angle/scale
    for (const h of st.history || []) {
      if (!Array.isArray(h.decor)) { h.decor = []; continue; }
      if (h.decor.length && h.decor[0].x != null && h.decor[0].id != null) continue;
      const hm = [];
      let hi = 0;
      for (const d of h.decor) {
        let x = d.x, y = d.y;
        if (x == null || y == null) {
          const a = anchors[(d.day != null ? d.day - 1 : hi) % anchors.length];
          x = a.x; y = a.y;
        }
        hm.push({ id: d.id || this.newDecorId(), type: d.type, x, y, angle: d.angle || 0, scale: d.scale || 1 });
        hi++;
      }
      h.decor = hm;
    }
  },
  newDecorId() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },
  /* ============ 持久化（🔴 v1.2.6：双保险——IndexedDB + localStorage 备份）
   * 现象：用户每次更新版本后"今天获取的积分和植物"消失——IndexedDB 数据在覆盖安装/WebView
   * 清理时可能丢失或读失败，load() 读到 null 会用 defaultState 覆盖写，数据永久丢失。
   * 修复：每次 save() 同步写一份到 localStorage('farm_backup')；load() 读 IndexedDB 失败/为 null
   * 时自动从备份恢复并写回 IndexedDB；_addPointsTx 读不到 garden 记录时用内存缓存/备份兜底，不再直接覆盖。
   * 🔴 v1.2.36：save() 也进串行队列（历史月装饰保存/导入/封存保存曾与 in-flight 奖励事务交错丢更新） */
  save() {
    return this._enqueue(async () => {
      await this.txPut('garden', this._state);
      try { localStorage.setItem('farm_backup', JSON.stringify(this._state)); } catch (e) {}
    });
  },
  /* 🔴 v1.2.36：备份恢复前过 sanitize（防篡改/脏数据绕过导入门槛直达渲染层） */
  _fromBackup() {
    try {
      const raw = localStorage.getItem('farm_backup');
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || s.id !== 'garden') return null;
      return this.sanitize(s);
    } catch { return null; }
  },
  /* ============ 状态清洗（🔴 v1.2.36：从 ui.js 迁移 + 全面增强，导入/备份恢复共用）
   * 数值钳制防 NaN 腐化；decor/owned 白名单（任意月份的限定装饰都合法，跨月恢复不丢）；
   * history 逐月递归清洗；planted 校验作物名；id 重建防属性注入；dayCounts 导入即清空（新起点）。 */
  sanitize(f) {
    const num = (v, max) => { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0; };
    const now = FARM.now();
    // 任意月份的限定装饰 + 通用装饰都算合法（v0.43 设计：已购限定装饰跨月保留）
    const validDecor = (t) => {
      if (!t || typeof t !== 'string') return false;
      if (FARM.DECOR[t]) return true;
      for (let m = 1; m <= 12; m++) if ((FARM.MONTH_DECOR[m] || {})[t]) return true;
      return false;
    };
    const cleanDecor = (list) => Array.isArray(list)
      ? list.filter(d => d && validDecor(d.type) && Number.isFinite(Number(d.x)) && Number.isFinite(Number(d.y)))
        .map(d => ({ id: (typeof d.id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(d.id)) ? d.id : this.newDecorId(), type: String(d.type), x: num(d.x, 1024), y: num(d.y, 1536), angle: num(d.angle, 360), scale: Math.max(0.5, Math.min(3, num(d.scale, 3) || 1)) }))
      : [];
    const cleanHistory = (list) => Array.isArray(list)
      ? list.slice(0, 36).map(h => {
          if (!h || typeof h !== 'object') return null;
          const planted = (h.planted && typeof h.planted === 'object' && !Array.isArray(h.planted)) ? {} : {};
          if (h.planted && typeof h.planted === 'object' && !Array.isArray(h.planted)) {
            for (const [d, c] of Object.entries(h.planted)) {
              if (/^\d{1,2}$/.test(d) && FARM.CROP_DEFS[c]) planted[d] = c;
            }
          }
          return { year: num(h.year, 9999), month: num(h.month, 12) || 1, planted, decor: cleanDecor(h.decor), owned: Array.isArray(h.owned) ? h.owned.filter(validDecor) : [], stage: Math.min(2, num(h.stage, 2)), totalEarned: num(h.totalEarned, 9999999), sealedAt: num(h.sealedAt, Date.now()) };
        }).filter(Boolean)
      : [];
    const planted = {};
    if (f.planted && typeof f.planted === 'object' && !Array.isArray(f.planted)) {
      for (const [d, c] of Object.entries(f.planted)) {
        if (/^\d{1,2}$/.test(d) && FARM.CROP_DEFS[c]) planted[d] = c;
      }
    }
    return {
      id: 'garden',
      year: num(f.year, 9999) || now.getFullYear(),
      month: num(f.month, 12) || now.getMonth() + 1,
      points: num(f.points, 999999),
      totalEarned: num(f.totalEarned, 9999999),
      dayPoints: num(f.dayPoints, FARM.POINT_DAY_LIMIT),
      day: typeof f.day === 'string' ? f.day : FARM.dayKey(now),
      planted,
      stage: Math.min(2, num(f.stage, 2)),
      decor: cleanDecor(f.decor),
      owned: Array.isArray(f.owned) ? f.owned.filter(validDecor) : [],
      // 🔴 v1.2.36：dayCounts 导入即清空——残留"今天已发满"的计数会锁死当天来源（P3-21）
      dayCounts: {},
      sealed: false,
      history: cleanHistory(f.history),
    };
  },
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
   * 幂等键 + 每日次数上限(maxDay) + 全局日上限(50 分) + 单事务原子写入；积分只由学习产出
   * 🔴 v1.1：maxDay 语义修复——按 source 统计当日发放次数（dayCounts），不再与分值 dayPoints 混用；
   *          所有读-改-写操作进串行队列（_enqueue），消除与 buyDecor/save 的并发丢更新
   */
  _queue: Promise.resolve(),
  _enqueue(fn) {
    const run = this._queue.then(fn, fn);
    this._queue = run.catch(() => {});
    return run;
  },
  async addPoints(source, opts) {
    const key = (opts.key == null ? '' : String(opts.key));
    const evId = 'ev_' + source + '_' + key;
    return this._enqueue(() => this._addPointsTx(source, evId, opts));
  },
  _addPointsTx(source, evId, opts) {
    return (async () => {
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
            // 🔴 v1.2.6：garden 记录读不到 → 内存缓存/备份兜底，绝不直接 defaultState 覆盖（防丢积分）
            if (!st) st = Farm._state || this._fromBackup() || this.defaultState();
            // 跨月封存（统一 sealState）
            if (st && !st.sealed && (st.year !== now.getFullYear() || st.month !== now.getMonth() + 1)) {
              st = this.sealState(st);
            }
            if (!st) st = this.defaultState();
            st.dayCounts = st.dayCounts || {};
            if (st.day !== today) { st.day = today; st.dayPoints = 0; st.dayCounts = {}; }
            // 🔴 v1.1：maxDay = 当日发放次数上限（按 source 独立统计）
            if (opts.maxDay && (st.dayCounts[source] || 0) >= opts.maxDay) { resolve(null); return; }
            let p = opts.pts || 0;
            if (st.dayPoints + p > FARM.POINT_DAY_LIMIT) p = Math.max(0, FARM.POINT_DAY_LIMIT - st.dayPoints);
            if (p === 0) { resolve(null); return; }
            // 🔴 v1.2.36：烧键修复——被日上限截断（p < 全额）时不写幂等记录！
            //   否则 chat/rp 档位键（永久键）被烧成小分值、该档永不再发（最勤奋的用户最常触发）；
            //   次数照计（dayCounts++ 防无限重试拿剩余额度），但键保留，下次全新触发可拿全额
            const truncated = p < (opts.pts || 0);
            st.points += p;
            st.totalEarned += p;
            st.dayPoints += p;
            st.dayCounts[source] = (st.dayCounts[source] || 0) + 1;
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
            try { localStorage.setItem('farm_backup', JSON.stringify(st)); } catch (e) {} // 🔴 v1.2.6：事务内同步备份
            if (!truncated) {
              store.put({ id: evId, source, key, pts: p, at: Date.now() });
              // 🔴 v1.2.36：ev_ 幂等记录定期清理（180 天前的键只占空间，防重放不需要永久保留）
              try {
                const cutoff = Date.now() - 180 * 864e5;
                const cur = store.openCursor(IDBKeyRange.bound('ev_', 'ev_\uffff'));
                cur.onsuccess = () => { const c = cur.result; if (c) { if ((c.value && c.value.at) < cutoff) c.delete(); c.continue(); } };
              } catch (e) {}
            }
            resolve({ pts: p, stage: st.stage, planted: st.planted[dayNum] || null });
          };
          reqS.onerror = () => reject(reqS.error);
        };
        reqEv.onerror = () => reject(reqEv.error);
        t.onerror = () => reject(t.error);
      });
    })();
  },

  /* ============ 装饰 ============ */
  async buyDecor(type) {
    return this._enqueue(async () => {
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
    });
  },
  /* 摆放装饰（坐标制）：x,y 为 1024×1536 画布坐标；同类型可摆多份（各带 id） */
  async placeDecor(type, x, y) {
    return this._enqueue(async () => {
      const st = await this.load();
      if (!st.owned.includes(type)) return { ok: false, msg: '还没有这个装饰，先去商店买' };
      // 🔴 v1.1：全局库存校验下沉到数据层（可摆 = 总库存 - 全局已摆），UI 层绕过也拦得住
      const ownedCount = st.owned.filter(t => t === type).length;
      if (this.placedTotal(type) >= ownedCount) return { ok: false, msg: '这个装饰已经摆满了' };
      const id = this.newDecorId();
      st.decor.push({ id, type, x: Math.round(x), y: Math.round(y) });
      await this.save();
      return { ok: true, id };
    });
  },
  /* 收起装饰（按 id 移除，仍在 owned 里可再摆） */
  async removeDecor(id) {
    return this._enqueue(async () => {
      const st = await this.load();
      st.decor = st.decor.filter(d => d.id !== id);
      await this.save();
      return { ok: true };
    });
  },
  /* 保存整体摆放布局（编辑模式点勾时调用，layout 带 id，同类型多份，保留 angle/scale）
     🔴 v1.2.36：保存前做全局库存复核（layout 中某类型数量 + 其他位置已摆 > 已购数 → 拒绝），
     原来校验只在 placeDecor 一条路径，主摆放路径 gardenEditPlace→saveDecorLayout 完全绕过 */
  async saveDecorLayout(layout) {
    return this._enqueue(async () => {
      const st = await this.load();
      const chk = this._checkLayoutStock(layout, null);
      if (!chk.ok) return { ok: false, msg: '「' + this.decorName(chk.type) + '」超出库存（可摆 ' + chk.max + ' 个），先收几个再保存' };
      st.decor = layout.map(d => ({ id: d.id || this.newDecorId(), type: d.type, x: Math.round(d.x), y: Math.round(d.y), angle: d.angle || 0, scale: d.scale || 1 }));
      await this.save();
      return { ok: true };
    });
  },
  /* 🔴 v1.2.36：全局库存复核——layout（正在编辑的视图）各类型数量 + 其他位置已摆数 ≤ 已购数
   * view 传入时表示编辑的是历史月（排除该月自己的已摆），null 表示当前月 */
  _checkLayoutStock(layout, view) {
    const st = this._state;
    if (!st) return { ok: true };
    const counts = {};
    for (const d of layout || []) counts[d.type] = (counts[d.type] || 0) + 1;
    const other = {};
    const addList = (list) => { for (const de of list || []) other[de.type] = (other[de.type] || 0) + 1; };
    if (view) {
      addList(st.decor);
      for (const h of st.history || []) {
        if (!(h.year === view.year && h.month === view.month)) addList(h.decor);
      }
    } else {
      for (const h of st.history || []) addList(h.decor);
    }
    for (const t of Object.keys(counts)) {
      const ownedCount = (st.owned || []).filter(x => x === t).length;
      const avail = ownedCount - (other[t] || 0);
      if (counts[t] > avail) return { ok: false, type: t, max: Math.max(0, avail) };
    }
    return { ok: true };
  },
  decorName(type) {
    const st = this._state;
    const m = st ? st.month : new Date().getMonth() + 1;
    return (FARM.DECOR[type] || {}).name || (FARM.MONTH_DECOR[m] || {})[type]?.name || type;
  },
  /* 全局已摆数（当前月 + 所有历史月）——🔴 v1.1 从 ui.js 下沉，数据层/UI 层共用 */
  placedTotal(type) {
    const st = this._state;
    if (!st) return 0;
    let n = 0;
    for (const de of st.decor || []) if (de.type === type) n++;
    for (const h of st.history || []) for (const de of (h.decor || [])) if (de.type === type) n++;
    return n;
  },
  /* 🔴 v1.1.1：当天植物的生长状态 = 当天积分进度（dayPoints / 50 上限）
   *   <1/3 → 种子(0)，<2/3 → 发芽(1)，≥2/3 → 长成(2)——今天学得多，院子就茂盛 */
  dayStage(st) {
    const ratio = ((st && st.dayPoints) || 0) / FARM.POINT_DAY_LIMIT;
    return ratio >= 2 / 3 ? 2 : ratio >= 1 / 3 ? 1 : 0;
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

/* 有效学习时长追踪：有交互且页面可见时累计，每 3 分钟 +1 月积分（幂等段，防挂机刷）
   🔴 v1.1：忽略 keydown 自动重复（长按不再刷活跃）、宽限期 10 分钟→3 分钟、时长每日上限 20 分 */
const FarmActivity = {
  lastActivity: Date.now(),
  _acc: 0,
  _timer: null,
  start() {
    if (this._timer) return; // 🔴 v1.1 幂等，防重复初始化泄漏定时器
    document.addEventListener('pointerdown', () => { this.lastActivity = Date.now(); }, { passive: true });
    document.addEventListener('keydown', (e) => { if (!e.repeat) this.lastActivity = Date.now(); });
    this._timer = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - this.lastActivity > 3 * 60 * 1000) return;
      this._acc += 30;
      if (this._acc >= 180) {
        this._acc = 0;
        try {
          const seg = Math.floor(Date.now() / 180000);
          await Farm.addPoints('time', { key: 'seg:' + seg, pts: 1, maxDay: 20 });
        } catch (e) {}
      }
    }, 30000);
  },
};
