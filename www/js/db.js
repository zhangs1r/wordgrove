/* db.js — IndexedDB 封装 + 设置/画像 localStorage */
const DB_NAME = 'englishapp';
const DB_VER = 2;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('words')) {
        const store = db.createObjectStore('words', { keyPath: 'id' });
        store.createIndex('due', 'srs.due');
        store.createIndex('created', 'created');
      }
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
      // v2: 言木小院（farmState id='state' / 奖励事件 id='ev_*' / 设置 id='settings'）
      if (!db.objectStoreNames.contains('farm')) {
        db.createObjectStore('farm', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let _db = null;
async function db() {
  if (!_db) _db = await openDB();
  return _db;
}

function tx(storeName, mode, fn) {
  return new Promise(async (resolve, reject) => {
    const d = await db();
    const t = d.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    const out = fn(store);
    t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
    t.onerror = () => reject(t.error);
  });
}

/* ---------- 设置（localStorage） ---------- */
const Settings = {
  get(key, def) {
    try {
      const v = localStorage.getItem('ea_' + key);
      if (v === null) return def;
      const parsed = JSON.parse(v);
      // 🔴 v1.1：数组字段校验——损坏/旧格式数据返回默认值（避免 .filter/.map 直接抛错，用户"丢会话"无提示）
      if (Array.isArray(def) && !Array.isArray(parsed)) return def;
      return parsed;
    } catch {
      console.warn('Settings 读取失败:', key); // 🔴 v1.1：不再静默吞（方便排查数据损坏）
      return def;
    }
  },
  set(key, val) {
    localStorage.setItem('ea_' + key, JSON.stringify(val));
  },
  remove(key) {
    localStorage.removeItem('ea_' + key);
  },
};

/* ---------- 用户画像（localStorage） ---------- */
const Profile = {
  load() {
    return Settings.get('profile', {
      level: 'B1',           // 词汇水平
      topics: [],            // 聊过的话题
      mistakes: [],          // 常犯错误 [{pat, note, count}]
      mastered: [],          // 已掌握词（存 word id 列表）
      sessions: 0,           // 对话局数
      wordsLearned: 0,       // 累计学词
      streak: 0,             // 连击天数
      lastDay: null,
    });
  },
  save(p) { Settings.set('profile', p); },
  _dayStr(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  touchStreak() {
    const p = this.load();
    // 🔴 v1.1：本地日期判日界（原来 toISOString 是 UTC——北京时间凌晨 0-8 点会被算到"昨天"，连击断裂）
    const today = this._dayStr(new Date());
    const yesterday = this._dayStr(new Date(Date.now() - 864e5));
    if (p.lastDay !== today) {
      p.streak = (p.lastDay === yesterday) ? p.streak + 1 : 1;
      p.lastDay = today;
      this.save(p);
    }
    return p;
  },
};

/* ---------- 生词 ---------- */
const Words = {
  async add(w) {
    const now = Date.now();
    const word = {
      id: 'w_' + now + '_' + Math.random().toString(36).slice(2, 7),
      word: w.word, phonetic: w.phonetic || '', pos: w.pos || '',
      meaning: w.meaning || '', example: w.example || '', exampleCn: w.exampleCn || '',
      source: w.source || 'manual', created: now,
      ctx: w.ctx || '',
      // 🔴 v1.2.2：进入生词本的单词默认"忘记 1 次"（能进本说明是没记住的词）——立即进入易忘词机制，
      //   对话/剧场里 AI 会自然带出来巩固；peak 同步
      forgot: (w.forgot != null ? w.forgot : 1),
      peak: (w.peak != null ? w.peak : (w.forgot != null ? w.forgot : 1)),
      tags: w.tags || [],
      root: w.root || '', collocations: w.collocations || '', synonyms: w.synonyms || '', antonyms: w.antonyms || '', note: w.note || '',
      usage: w.usage || '', family: w.family || '', expand: w.expand || '',
      srs: { due: now, interval: 0, reps: 0, lapses: 0, ease: 2.5 },
    };
    await tx('words', 'readwrite', s => s.add(word));
    const p = Profile.load(); p.wordsLearned++; Profile.save(p);
    return word;
  },
  async get(id) { return tx('words', 'readonly', s => s.get(id)); },
  async list() { return tx('words', 'readonly', s => s.getAll()); },
  async update(id, patch) {
    const w = await this.get(id);
    if (!w) return null;
    Object.assign(w, patch);
    await tx('words', 'readwrite', s => s.put(w));
    return w;
  },
  async remove(id) { return tx('words', 'readwrite', s => s.delete(id)); },
  async findByWord(word) {
    const all = await this.list();
    return all.find(w => w.word.toLowerCase() === String(word).toLowerCase()) || null;
  },
  /* 今日到期队列 */
  async due(now = Date.now()) {
    const all = await this.list();
    return all.filter(w => w.srs.due <= now).sort((a, b) => a.srs.due - b.srs.due);
  },
  /* 批量加词（去重） */
  async addMany(words) {
    let added = 0, dup = 0;
    for (const w of words) {
      const exist = await this.findByWord(w.word);
      if (exist) { dup++; continue; }
      await this.add(w); added++;
    }
    return { added, dup };
  },
};

/* ---------- 对话记录 ---------- */
/* （Sessions store 已弃用：会话保存在 localStorage conversations，v1.1 清理死代码） */


