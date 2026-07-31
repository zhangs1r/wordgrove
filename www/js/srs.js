/* srs.js — 间隔重复排程（SM-2 变体，自用够用） */
/* grade: 0=忘了 1=模糊 2=记得 */
const SRS = {
  schedule(word, grade) {
    const s = word.srs;
    s.reps += 1;
    if (grade === 0) {
      s.lapses += 1;
      s.interval = 0;                          // 今天再学
      s.ease = Math.max(1.3, s.ease - 0.2);
    } else if (grade === 1) {
      s.interval = Math.max(1, Math.round(s.interval * 0.6));
      s.ease = Math.max(1.3, s.ease - 0.05);
    } else {
      if (s.interval === 0) s.interval = 1;
      else if (s.interval === 1) s.interval = 6;
      else s.interval = Math.round(s.interval * s.ease);
      s.ease = Math.min(3.0, s.ease + 0.05);
    }
    s.due = Date.now() + s.interval * 864e5;
    return word;
  },

  async applyGrade(wordId, grade) {
    const w = await Words.get(wordId);
    if (!w) return null;
    this.schedule(w, grade);
    await Words.update(wordId, { srs: w.srs });
    return w;
  },
};
