/* farm.js — 言木小院：奖励服务（木果/成长值）+ 农场状态 + Canvas 像素渲染
 * 原则：学习驱动家园，家园不反过来索取时间。
 *  - 木果只由有效学习行为获得，农场本身不产出木果
 *  - 奖励统一走 Farm.grant()：幂等键 + 每日上限 + 单事务写入（防重复给钱）
 *  - 不新增 AI 请求；全部本地离线
 */

const FARM = {
  ACORN_DAY_LIMIT: 80,        // 木果每日上限
  TIME_DAY_LIMIT: 36,         // 有效学习时长每日成长值上限（每3分钟+1）

  // 作物：价格 / 阶段数 / 需成长值成熟 / 果实颜色
  CROPS: {
    radish:    { name: '萝卜',   price: 8,  stages: 3, growth: 12, fruit: '#E57373', leaf: '#7CB342' },
    blueberry: { name: '蓝莓',   price: 14, stages: 4, growth: 22, fruit: '#5C6BC0', leaf: '#558B2F' },
    pumpkin:   { name: '南瓜',   price: 20, stages: 5, growth: 36, fruit: '#F9A825', leaf: '#689F38' },
  },
  // 树：价格 / 阶段数 / 需成长值成树
  TREES: {
    sapling: { name: '小树', price: 40, stages: 4, growth: 70, leaf: '#7CB342' },
    bigtree: { name: '大树', price: 75, stages: 6, growth: 140, leaf: '#43A047' },
  },
  // 装饰：价格 / 解锁等级（level 0 = 初始可用）
  DECOR: {
    path:      { name: '小径',   price: 6,  level: 0 },
    fence:     { name: '围栏',   price: 10, level: 0 },
    stone:     { name: '石头',   price: 5,  level: 0 },
    flowerpot: { name: '花盆',   price: 18, level: 2 },
    bench:     { name: '长椅',   price: 30, level: 3 },
    lamp:      { name: '路灯',   price: 45, level: 4 },
    sign:      { name: '纪念牌', price: 0,  level: 0, special: true },
  },
  // 家园等级门槛（成长值累计）
  LEVELS: [0, 40, 100, 200, 350, 550, 800, 1200],

  MAP_W: 20, MAP_H: 14,
  // 房屋区域（格子坐标，左上角起 4x4）
  HOUSE: { x: 1, y: 1, w: 4, h: 4 },
  // 池塘区域 3x3
  POND: { x: 16, y: 9, w: 3, h: 3 },
  // 耕地位置（初始 4 块 + 扩展 6 块）
  PLOTS: [
    { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 8, y: 6 }, { x: 9, y: 6 },
    { x: 7, y: 5 }, { x: 10, y: 5 }, { x: 7, y: 6 }, { x: 10, y: 6 }, { x: 8, y: 7 }, { x: 9, y: 7 },
  ],

  dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  levelFor(growth) {
    let lv = 1;
    for (let i = 0; i < FARM.LEVELS.length; i++) if (growth >= FARM.LEVELS[i]) lv = i + 1;
    return lv;
  },
  weatherFor(dayKey) {
    const list = ['sun', 'sun', 'sun', 'cloud', 'rain', 'breeze'];
    let h = 0;
    for (let i = 0; i < dayKey.length; i++) h = (h * 31 + dayKey.charCodeAt(i)) % 997;
    return list[h % list.length];
  },
};

const Farm = {
  _state: null,

  defaultState() {
    return {
      id: 'state', schemaVersion: 1,
      acorns: 32, growth: 0, level: 1,
      day: FARM.dayKey(new Date()), dayAcorns: 0, dayCounts: {},
      dayGrowthTime: 0,
      plots: FARM.PLOTS.slice(0, 4).map(p => ({ x: p.x, y: p.y })),
      crops: [], trees: [], decor: [],
      unlocked: {}, harvests: {},
      firstTime: true,
    };
  },

  async load() {
    if (this._state) return this._state;
    const s = await this.txGet('state');
    this._state = s || this.defaultState();
    if (this._state.firstTime) {
      this._state.firstTime = false;
      this._state.decor.push({ type: 'sign', x: 6, y: 3 });
      await this.save();
    }
    return this._state;
  },
  async save() {
    await this.txPut('state', this._state);
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
  async txDelete(id) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction('farm', 'readwrite');
      t.objectStore('farm').delete(id);
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  },

  /* ============ 奖励服务 ============
   * grant(source, { key, acorns, growth, maxDay })
   *  - key: 幂等键（如 词ID+日期 / 会话ID+档位 / 表达文本）
   *  - maxDay: 该来源每日次数上限（可选）
   *  - 单事务：幂等检查 + 状态更新 + 事件记录 原子完成，中断不会重复发奖
   */
  async grant(source, opts) {
    const key = (opts.key == null ? '' : String(opts.key));
    const evId = 'ev_' + source + '_' + key;
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction('farm', 'readwrite');
      const store = t.objectStore('farm');
      const reqEv = store.get(evId);
      reqEv.onsuccess = () => {
        if (reqEv.result) { resolve(null); return; } // 已发过（幂等）
        const reqS = store.get('state');
        reqS.onsuccess = () => {
          const state = reqS.result || Farm.defaultState();
          const today = FARM.dayKey(new Date());
          if (state.day !== today) { state.day = today; state.dayAcorns = 0; state.dayCounts = {}; state.dayGrowthTime = 0; }
          // 来源日次数上限
          if (opts.maxDay && (state.dayCounts[source] || 0) >= opts.maxDay) { resolve(null); return; }
          // 木果日上限截断
          let a = opts.acorns || 0;
          if (state.dayAcorns + a > FARM.ACORN_DAY_LIMIT) a = Math.max(0, FARM.ACORN_DAY_LIMIT - state.dayAcorns);
          const g = opts.growth || 0;
          if (a === 0 && g === 0) { resolve(null); return; }
          state.acorns += a;
          state.growth += g;
          state.dayAcorns += a;
          state.dayCounts[source] = (state.dayCounts[source] || 0) + 1;
          state.level = FARM.levelFor(state.growth);
          store.put(state);
          Farm._state = state; // 同步内存缓存，避免 load() 旧值覆盖
          store.put({ id: evId, source, key, acorns: a, growth: g, at: Date.now() });
          resolve({ acorns: a, growth: g });
        };
        reqS.onerror = () => reject(reqS.error);
      };
      reqEv.onerror = () => reject(reqEv.error);
      t.onerror = () => reject(t.error);
    });
  },

  /* 有效学习时长：每满 3 分钟 +1 成长值（不发木果），日上限 36 */
  async tickTime(seconds) {
    const state = await this.load();
    const today = FARM.dayKey(new Date());
    if (state.day !== today) { state.day = today; state.dayAcorns = 0; state.dayCounts = {}; state.dayGrowthTime = 0; }
    const before = Math.floor(state.dayGrowthTime / 180);
    state.dayGrowthTime += seconds;
    const after = Math.floor(state.dayGrowthTime / 180);
    const gain = Math.min(after - before, FARM.TIME_DAY_LIMIT - before);
    if (gain > 0) {
      state.growth += gain;
      state.level = FARM.levelFor(state.growth);
      await this.save();
      return gain;
    }
    await this.save();
    return 0;
  },

  /* ============ 农场操作 ============ */
  async buy(type, kind) {
    const state = await this.load();
    const def = type === 'crop' ? FARM.CROPS[kind] : type === 'tree' ? FARM.TREES[kind] : FARM.DECOR[kind];
    if (!def) return { ok: false, msg: '物品不存在' };
    if (def.special) return { ok: false, msg: '特殊物品不可购买' };
    if ((def.level || 0) > state.level) return { ok: false, msg: '家园 ' + def.level + ' 级解锁' };
    if (state.acorns < def.price) return { ok: false, msg: '木果不够' };
    state.acorns -= def.price;
    await this.save();
    return { ok: true, kind };
  },
  async plant(type, kind, x, y) {
    const state = await this.load();
    const plot = state.plots.find(p => p.x === x && p.y === y);
    if (!plot) return { ok: false, msg: '这里不是耕地' };
    if (state.crops.some(c => c.x === x && c.y === y) || state.trees.some(t => t.x === x && t.y === y)) {
      return { ok: false, msg: '这里已经有东西了' };
    }
    const item = { type, kind, x, y, planted: state.growth, stage: 0 };
    if (type === 'crop') state.crops.push(item);
    else state.trees.push(item);
    await this.save();
    return { ok: true };
  },
  /* 成长结算：按累计成长值推进所有作物/树阶段 */
  async growAll() {
    const state = await this.load();
    let changed = false;
    for (const c of state.crops) {
      const def = FARM.CROPS[c.kind];
      const st = Math.min(def.stages - 1, Math.floor((state.growth - c.planted) / (def.growth / (def.stages - 1))));
      if (st !== c.stage) { c.stage = st; changed = true; }
    }
    for (const t of state.trees) {
      const def = FARM.TREES[t.kind];
      const st = Math.min(def.stages - 1, Math.floor((state.growth - t.planted) / (def.growth / (def.stages - 1))));
      if (st !== t.stage) { t.stage = st; changed = true; }
    }
    if (changed) await this.save();
    return changed;
  },
  async harvest(x, y) {
    const state = await this.load();
    const i = state.crops.findIndex(c => c.x === x && c.y === y);
    if (i === -1) return { ok: false, msg: '这里没有作物' };
    const c = state.crops[i];
    const def = FARM.CROPS[c.kind];
    if (c.stage < def.stages - 1) return { ok: false, msg: '还没成熟' };
    state.crops.splice(i, 1);
    state.harvests[c.kind] = (state.harvests[c.kind] || 0) + 1;
    // 收获给图鉴/景观进度，不给木果（避免种田刷钱）
    await this.save();
    return { ok: true, harvest: c.kind };
  },
  async removeAt(x, y) {
    const state = await this.load();
    const ci = state.crops.findIndex(c => c.x === x && c.y === y);
    if (ci !== -1) { state.crops.splice(ci, 1); await this.save(); return { ok: true, what: 'crop' }; }
    const ti = state.trees.findIndex(t => t.x === x && t.y === y);
    if (ti !== -1) { state.trees.splice(ti, 1); await this.save(); return { ok: true, what: 'tree' }; }
    const di = state.decor.findIndex(d => d.x === x && d.y === y);
    if (di !== -1) { state.decor.splice(di, 1); await this.save(); return { ok: true, what: 'decor' }; }
    return { ok: false, msg: '这里没有东西' };
  },
  async placeDecor(type, x, y) {
    const state = await this.load();
    if (state.decor.some(d => d.x === x && d.y === y)) return { ok: false, msg: '这里已经有东西' };
    state.decor.push({ type, x, y });
    await this.save();
    return { ok: true };
  },
  async expandPlot() {
    const state = await this.load();
    const max = FARM.PLOTS.length;
    if (state.plots.length >= max) return { ok: false, msg: '地块已开满' };
    const next = FARM.PLOTS[state.plots.length];
    const price = [30, 50, 75, 75, 75, 75][state.plots.length - 4];
    if (state.acorns < price) return { ok: false, msg: '木果不够（需 ' + price + '）' };
    state.acorns -= price;
    state.plots.push({ x: next.x, y: next.y });
    await this.save();
    return { ok: true, price };
  },
  async resetFarm() {
    const state = this.defaultState();
    state.firstTime = false;
    this._state = state;
    await this.save();
    await this.txDelete('ev_'); // 不存在的键，仅保证干净
    return true;
  },

  /* ============ Canvas 像素渲染 ============ */
  tile: 16,
  _cache: null,

  paint(ctx, state, weather, t) {
    const T = this.tile;
    // 地形层（离屏缓存）
    if (!this._cache) this._cache = this.paintTerrain();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this._cache, 0, 0);

    // 耕地
    for (const p of state.plots) {
      const x = p.x * T, y = p.y * T;
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(x + 1, y + 1, T - 2, 2);
      ctx.fillRect(x + 1, y + 1, 2, T - 2);
      ctx.fillStyle = '#BCAAA4';
      ctx.fillRect(x + 3, y + 3, T - 6, 1);
    }

    // 树（先画，被装饰遮挡关系简单处理：树在作物下）
    for (const tr of state.trees) this.paintTree(ctx, tr, FARM.TREES[tr.kind]);

    // 作物
    for (const c of state.crops) this.paintCrop(ctx, c, FARM.CROPS[c.kind]);

    // 装饰
    for (const d of state.decor) this.paintDecor(ctx, d);

    // 天气
    if (weather === 'rain') this.paintRain(ctx, t);
    else if (weather === 'cloud') {
      ctx.fillStyle = 'rgba(120,140,160,0.18)';
      ctx.fillRect(0, 0, FARM.MAP_W * T, FARM.MAP_H * T);
    } else if (weather === 'sun') {
      ctx.fillStyle = '#FAC75E';
      ctx.beginPath();
      ctx.arc(FARM.MAP_W * T - 14, 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(FARM.MAP_W * T - 14, 2, 2, 4);
      ctx.fillRect(FARM.MAP_W * T - 18, 10, 4, 2);
      ctx.fillRect(FARM.MAP_W * T - 14, 16, 2, 3);
      ctx.fillRect(FARM.MAP_W * T - 20, 6, 2, 2);
      ctx.fillRect(FARM.MAP_W * T - 8, 6, 2, 2);
    } else if (weather === 'breeze') {
      const T2 = FARM.MAP_W * T;
      const y = (t / 2) % (FARM.MAP_H * T);
      ctx.fillStyle = 'rgba(124,179,66,0.8)';
      ctx.fillRect(10 + (t % T2), y, 3, 2);
      ctx.fillRect((t * 1.7) % T2, (y + 20) % (FARM.MAP_H * T), 3, 2);
    }
  },

  paintTerrain() {
    const T = this.tile, W = FARM.MAP_W * T, H = FARM.MAP_H * T;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    // 草地（两种绿随机）
    for (let y = 0; y < FARM.MAP_H; y++) {
      for (let x = 0; x < FARM.MAP_W; x++) {
        ctx.fillStyle = ((x * 7 + y * 13) % 5 < 2) ? '#9CCC65' : '#8BC34A';
        ctx.fillRect(x * T, y * T, T, T);
        if ((x * 3 + y * 5) % 7 === 0) { ctx.fillStyle = '#7CB342'; ctx.fillRect(x * T + 5, y * T + 5, 3, 3); }
        if ((x * 11 + y * 3) % 9 === 0) { ctx.fillStyle = '#AED581'; ctx.fillRect(x * T + 9, y * T + 3, 3, 2); }
      }
    }
    // 池塘
    const P = FARM.POND;
    for (let y = P.y; y < P.y + P.h; y++) {
      for (let x = P.x; x < P.x + P.w; x++) {
        ctx.fillStyle = ((x + y) % 2) ? '#4FC3F7' : '#29B6F6';
        ctx.fillRect(x * T, y * T, T, T);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(P.x * T + 3, P.y * T + 3, 6, 3);
    // 小路（房子到耕地）
    ctx.fillStyle = '#C8A882';
    for (let y = 4; y < 7; y++) ctx.fillRect(5 * T + 2, y * T + 2, T - 4, T - 4);
    // 房子
    const Hc = FARM.HOUSE;
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(Hc.x * T - 2, (Hc.y + Hc.h) * T - 2, Hc.w * T + 4, 4);
    ctx.fillStyle = '#EFEBE9';
    ctx.fillRect(Hc.x * T, Hc.y * T, Hc.w * T, Hc.h * T);
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(Hc.x * T, Hc.y * T, Hc.w * T, 3);
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(Hc.x * T - 2, Hc.y * T);
    ctx.lineTo(Hc.x * T + Hc.w * T / 2, (Hc.y - 2) * T);
    ctx.lineTo(Hc.x * T + Hc.w * T + 2, Hc.y * T);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FAF3E8';
    ctx.fillRect(Hc.x * T + T, Hc.y * T + T, T - 4, T - 4);
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(Hc.x * T + T * 2 + 2, Hc.y * T + T + 2, 4, 8);
    // 围栏（地图边缘装饰线）
    ctx.fillStyle = '#795548';
    for (let x = 0; x < FARM.MAP_W; x += 2) ctx.fillRect(x * T + 4, 0, 3, 3);
    return cv;
  },

  paintCrop(ctx, c, def) {
    const T = this.tile, x = c.x * T, y = c.y * T;
    const max = def.stages - 1;
    const r = c.stage / max;
    // 土垄
    ctx.fillStyle = '#795548';
    ctx.fillRect(x + 4, y + 8, T - 8, 4);
    if (c.stage === 0) {
      ctx.fillStyle = '#558B2F';
      ctx.fillRect(x + 7, y + 6, 2, 4);
    } else if (r < 0.5) {
      ctx.fillStyle = def.leaf;
      ctx.fillRect(x + 5, y + 4, 3, 6);
      ctx.fillRect(x + 8, y + 3, 3, 7);
    } else if (r < 1) {
      ctx.fillStyle = def.leaf;
      ctx.fillRect(x + 4, y + 3, 4, 7);
      ctx.fillRect(x + 8, y + 2, 4, 8);
      ctx.fillStyle = '#33691E';
      ctx.fillRect(x + 6, y + 6, 4, 1);
    } else {
      ctx.fillStyle = def.leaf;
      ctx.fillRect(x + 3, y + 2, 5, 8);
      ctx.fillRect(x + 8, y + 1, 5, 9);
      ctx.fillStyle = def.fruit;
      ctx.fillRect(x + 6, y + 5, 4, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 6, y + 5, 1, 1);
    }
  },

  paintTree(ctx, tr, def) {
    const T = this.tile, x = tr.x * T, y = tr.y * T;
    const max = def.stages - 1;
    const r = tr.stage / max;
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x + 6, y + 8, 4, 7);
    const size = 3 + Math.round(r * 5);
    ctx.fillStyle = tr.stage >= max ? def.leaf : '#8BC34A';
    ctx.beginPath();
    ctx.arc(x + 8, y + 8 - size / 2, size, 0, Math.PI * 2);
    ctx.fill();
    if (tr.stage >= max) {
      ctx.fillStyle = '#FAC75E';
      ctx.fillRect(x + 5, y + 2, 2, 2);
      ctx.fillRect(x + 10, y + 4, 2, 2);
    }
  },

  paintDecor(ctx, d) {
    const T = this.tile, x = d.x * T, y = d.y * T;
    switch (d.type) {
      case 'path':
        ctx.fillStyle = '#C8A882';
        ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
        ctx.fillStyle = '#B99C77';
        ctx.fillRect(x + 3, y + 3, T - 6, T - 6);
        break;
      case 'fence':
        ctx.fillStyle = '#795548';
        ctx.fillRect(x + 1, y + 5, T - 2, 3);
        ctx.fillRect(x + 3, y + 2, 2, 10);
        ctx.fillRect(x + 11, y + 2, 2, 10);
        break;
      case 'stone':
        ctx.fillStyle = '#9E9E9E';
        ctx.fillRect(x + 4, y + 7, 8, 6);
        ctx.fillStyle = '#BDBDBD';
        ctx.fillRect(x + 4, y + 7, 8, 2);
        break;
      case 'flowerpot':
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 4, y + 10, 8, 4);
        ctx.fillStyle = '#E57373';
        ctx.fillRect(x + 6, y + 4, 4, 4);
        ctx.fillStyle = '#7CB342';
        ctx.fillRect(x + 6, y + 7, 4, 4);
        break;
      case 'bench':
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(x + 1, y + 8, T - 2, 4);
        ctx.fillRect(x + 2, y + 12, 3, 3);
        ctx.fillRect(x + T - 5, y + 12, 3, 3);
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 1, y + 4, T - 2, 2);
        break;
      case 'lamp':
        ctx.fillStyle = '#455A64';
        ctx.fillRect(x + 7, y + 5, 2, 9);
        ctx.fillStyle = '#FAC75E';
        ctx.fillRect(x + 4, y + 2, 8, 4);
        ctx.fillStyle = '#FFF8E1';
        ctx.fillRect(x + 5, y + 3, 6, 2);
        break;
      case 'sign':
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x + 7, y + 4, 2, 10);
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 1, y + 1, T - 2, 7);
        ctx.fillStyle = '#FAF3E8';
        ctx.fillRect(x + 2, y + 2, T - 4, 5);
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(x + 4, y + 3, 3, 3);
        break;
    }
  },

  paintRain(ctx, t) {
    ctx.strokeStyle = 'rgba(120,180,230,0.5)';
    ctx.lineWidth = 1;
    const T = FARM.MAP_W * 16;
    for (let i = 0; i < 14; i++) {
      const x = ((i * 53 + t * 3) % T);
      const y = ((i * 97 + t * 6) % (FARM.MAP_H * 16));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 2, y + 4);
      ctx.stroke();
    }
  },

  /* 点击命中：像素坐标 → 格子 */
  hitTest(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / (FARM.MAP_W * this.tile);
    const px = (e.clientX - rect.left) / scale;
    const py = (e.clientY - rect.top) / scale;
    return { x: Math.floor(px / this.tile), y: Math.floor(py / this.tile) };
  },
};

/* 有效学习时长追踪：有交互且页面可见时累计，每 3 分钟 +1 成长值 */
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
        try { await Farm.tickTime(180); } catch (e) {}
      }
    }, 30000);
  },
};
