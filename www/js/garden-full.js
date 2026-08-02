/* garden-full.js — 月历花园整页版（v0.34 第六 tab）
 * 渲染：当月背景图（WebP，按季节+天数匹配）→ 作物画在坐标格（farm-maps JSON）→ 装饰摆四周
 * 数据：复用 farm.js 的 Farm 状态（planted/decor/stage/points）
 * 坐标：maps JSON 是 1024×1536 原图坐标系，canvas 同尺寸直接可用
 */
const GardenFull = {
  _imgs: {},      // 背景图缓存
  _map: null,     // 当前坐标映射
  _mapKey: '',

  /* 背景图 key：bg_<season>_<days>.webp */
  bgKey(month) {
    const season = FARM.seasonOf(month);
    const days = FARM.daysInMonth(new Date().getFullYear(), month);
    return season + '_' + days;
  },

  async loadBg(month, year) {
    const season = FARM.seasonOf(month);
    const days = FARM.daysInMonth(year || new Date().getFullYear(), month);
    const key = season + '_' + days;
    const mapKey = key;
    // 坐标映射
    if (this._mapKey !== mapKey) {
      this._map = null;
      try {
        const r = await fetch('assets/farm-maps/bg_' + mapKey + '.json');
        this._map = await r.json();
        this._mapKey = mapKey;
      } catch (e) {
        this._map = null;
        this._mapKey = '';
      }
    }
    // 背景图
    if (!this._imgs[key]) {
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { this._imgs[key] = img; resolve(); };
        img.onerror = () => resolve();
        img.src = 'assets/farm-bg/bg_' + key + '.webp';
      });
    }
    return key;
  },

  /* 画整页：bg(可选历史) / planted / decor / stage / 当前月标记 */
  async paint(ctx, opts) {
    const st = opts.state;
    const year = opts.year != null ? opts.year : st.year;
    const month = opts.month != null ? opts.month : st.month;
    const planted = opts.planted || st.planted;
    const decor = opts.decor || st.decor;
    const stage = opts.stage != null ? opts.stage : st.stage;
    const readonly = !!opts.readonly;

    const key = await this.loadBg(month, year);
    const bg = this._imgs[key];
    ctx.clearRect(0, 0, 1024, 1536);
    ctx.imageSmoothingEnabled = false;
    // 背景（无图时深绿兜底）
    if (bg) {
      ctx.drawImage(bg, 0, 0, 1024, 1536);
    } else {
      ctx.fillStyle = '#2d5a27';
      ctx.fillRect(0, 0, 1024, 1536);
    }

    const map = this._map;
    const now = FARM.now();
    const isCurrentMonth = !readonly && year === st.year && month === st.month;

    // 作物画在坐标格中心
    if (map && map.cells) {
      for (const c of map.cells) {
        const d = c.day;
        const crop = planted[d];
        if (crop && Farm._imgs.crops && FARM.CROP_DEFS[crop]) {
          const def = FARM.CROP_DEFS[crop];
          const sx = def.x * 96 + stage * 32;
          const size = 84; // 放大绘制保持像素感（留出高亮框空间）
          ctx.drawImage(Farm._imgs.crops, sx, 0, 32, 32, c.cx - size / 2, c.cy - size / 2, size, size);
          if (stage >= 2) {
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.strokeText(def.name, c.cx, c.cy + 58);
            ctx.fillStyle = '#FFF8E1';
            ctx.fillText(def.name, c.cx, c.cy + 58);
            ctx.textAlign = 'left';
          }
        }
        // 今天高亮（画在作物之上保证可见）
        if (isCurrentMonth && d === now.getDate()) {
          ctx.strokeStyle = '#FAC75E';
          ctx.lineWidth = 7;
          ctx.strokeRect(c.cx - 50, c.cy - 50, 100, 100);
        }
      }
    }

    // 装饰按坐标画（v0.36：任意空地可摆）
    this.paintDecorAt(ctx, decor);
  },

  /* 装饰按坐标渲染：decor = [{type, x, y}]（1024×1536 坐标系，x/y 为装饰中心）
   * 兼容旧历史数据 {type, day} → 映射到旧 12 锚点 */
  paintDecorAt(ctx, decor) {
    if (!decor) return;
    const anchors = [
      { x: 220, y: 290 }, { x: 420, y: 275 }, { x: 620, y: 280 }, { x: 820, y: 295 },
      { x: 220, y: 1180 }, { x: 420, y: 1200 }, { x: 620, y: 1190 }, { x: 820, y: 1185 },
      { x: 120, y: 800 }, { x: 910, y: 800 }, { x: 140, y: 1380 }, { x: 880, y: 1380 },
    ];
    let i = 0;
    for (const de of decor) {
      let x = de.x, y = de.y;
      if (x == null || y == null) {
        // 旧格式 {type, day}
        const a = anchors[(de.day != null ? de.day - 1 : i) % anchors.length];
        x = a.x; y = a.y;
      }
      i++;
      const img = Farm._imgs['decor_' + de.type];
      const size = 110;
      if (img) {
        ctx.drawImage(img, 0, 0, img.width, img.height, x - size / 2, y - size / 2, size, size);
      } else {
        ctx.fillStyle = '#FAC75E';
        ctx.fillRect(x - 12, y - 12, 24, 24);
      }
    }
  },

  /* 点击：canvas 像素 → 格子 day（🔴 v0.36 修复：矩形判定代替圆形半径，点角落/作物边缘不再误报空地）
   * 格子实际尺寸：列距 ~105-112px（半宽 ~55），行距 ~122px（半高 ~61）→ 矩形命中 */
  hitDay(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1024 / rect.width;
    const scaleY = 1536 / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    if (!this._map || !this._map.cells) return null;
    let best = null, bestD = 1e9;
    for (const c of this._map.cells) {
      const dx = Math.abs(c.cx - px), dy = Math.abs(c.cy - py);
      const d = Math.hypot(dx, dy);
      if (d < bestD) { bestD = d; best = c; }
    }
    if (!best) return null;
    // 矩形判定：|dx| <= 57 且 |dy| <= 64（格子半宽/半高 + 少量容差）
    const dx = Math.abs(best.cx - px), dy = Math.abs(best.cy - py);
    if (dx <= 57 && dy <= 64) return best.day;
    return null;
  },
};

/* 让 GardenFull 能拿到作物图（复用 Farm._imgs.crops 和 decor 图） */
GardenFull._imgs.crops = null;
