/* db.js — IndexedDB 封装 + 设置/画像 localStorage */
const DB_NAME = 'englishapp';
const DB_VER = 1;

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
    try { const v = localStorage.getItem('ea_' + key); return v === null ? def : JSON.parse(v); }
    catch { return def; }
  },
  set(key, val) {
    localStorage.setItem('ea_' + key, JSON.stringify(val));
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
  touchStreak() {
    const p = this.load();
    const today = new Date().toISOString().slice(0, 10);
    if (p.lastDay !== today) {
      p.streak = (p.lastDay === new Date(Date.now() - 864e5).toISOString().slice(0, 10)) ? p.streak + 1 : 1;
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
      forgot: w.forgot || 0,
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
const Sessions = {
  async save(s) {
    await tx('sessions', 'readwrite', st => st.put({ id: Date.now().toString(), at: Date.now(), ...s }));
  },
  async recent(limit = 5) {
    const all = await tx('sessions', 'readonly', st => st.getAll());
    return all.sort((a, b) => b.at - a.at).slice(0, limit);
  },
};


