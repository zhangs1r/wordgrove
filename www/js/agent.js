/* agent.js — 简化 agent loop + 本地工具 + 场景 + 复盘 + 摘要压缩
   参考 Pi agent-harness 的核心设计（工具批次执行 / token截断保护 / 上下文压缩） */

/* 🔴 v1.1.1：英语水平档位（设置页选择，注入提示词控制词汇难度） */
const LEVELS = {
  cet4:  { label: 'CET-4 四级',     desc: '以基础高频词为主，句子简单清晰，避免生僻词' },
  cet6:  { label: 'CET-6 六级',     desc: '以四级词汇为主，适当带六级词汇，偶尔一个进阶词' },
  kaoyan:{ label: '考研',           desc: '中高级词汇为主，可带学术表达' },
  ielts: { label: '雅思',           desc: '话题词汇丰富，口语化与学术表达平衡' },
  toefl: { label: '托福',           desc: '学术词汇为主，表达正式但自然' },
  fluent:{ label: '自如交流',       desc: '接近母语者水平，可用俚语习语和复杂句式' },
};
function levelCfg() {
  const lv = Settings.get('level', 'cet6');
  return LEVELS[lv] || LEVELS.cet6;
}
function levelLine() {
  const c = levelCfg();
  return `- 词汇水平：${c.label}（${c.desc}）——你的回复词汇量要匹配这个水平：以该水平词汇为主，可带 1-2 个稍高阶的词帮他拓展，但不要大段超出他的水平`;
}

const DEFAULT_SCENE = { id: 'default', name: '日常对话', level: 'B1',
  system: `You are a friendly English conversation partner. The user is practicing spoken English.
Keep replies to 1-2 short sentences. Use simple, natural spoken English. If the user makes a mistake or hesitates, naturally model the correct way to say it in your reply, do not give lectures. Ask one natural follow-up question to keep the conversation going.` };

const Agent = {
  /* ---------- 工具定义（OpenAI function calling） ---------- */
  toolDefs: [
    {
      type: 'function',
      function: {
        name: 'search_vocab',
        description: '在用户的生词本中查询单词，返回释义和例句。用户提到某个词时可以用。',
        parameters: {
          type: 'object',
          properties: { word: { type: 'string', description: '要查询的单词' } },
          required: ['word'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'add_words',
        description: '把单词加入用户的生词本（带中文释义和例句）。用户说错/卡壳/学到的新词可以用这个记下来。',
        parameters: {
          type: 'object',
          properties: {
            words: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  word: { type: 'string' },
                  phonetic: { type: 'string' },
                  meaning: { type: 'string', description: '中文释义' },
                  example: { type: 'string', description: '英文例句' },
                  exampleCn: { type: 'string', description: '例句中文翻译' },
                },
                required: ['word', 'meaning'],
              },
            },
          },
          required: ['words'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'mark_mastered',
        description: '把生词本中的某个词标记为已掌握（用户明显已经很熟练的词）。',
        parameters: {
          type: 'object',
          properties: { word: { type: 'string', description: '单词' } },
          required: ['word'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_review_queue',
        description: '获取用户今天待复习的单词数量。用户问"今天要复习什么/还有多少"时用。',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_profile',
        description: '获取用户的学习画像（水平、常犯错误、已掌握词）。想了解用户情况时用。',
        parameters: { type: 'object', properties: {} },
      },
    },
  ],

  /* ---------- 工具执行 ---------- */
  async execute(name, argsStr, scene) {
    let args = {};
    try { args = JSON.parse(argsStr || '{}'); } catch {}
    try {
      switch (name) {
        case 'search_vocab': {
          const w = await Words.findByWord(args.word || '');
          return { found: !!w, word: w ? { word: w.word, meaning: w.meaning, example: w.example } : null };
        }
        case 'add_words': {
          const items = (args.words || []).slice(0, 10);
          const result = await Words.addMany(items.map(it => ({
            word: it.word, phonetic: it.phonetic || '', meaning: it.meaning || '',
            example: it.example || '', exampleCn: it.exampleCn || '',
            source: 'agent', sourceScene: scene ? scene.name : '',
          })));
          return { added: result.added, duplicates: result.dup };
        }
        case 'mark_mastered': {
          const w = await Words.findByWord(args.word || '');
          if (w) {
            await Words.update(w.id, { srs: { ...w.srs, due: Date.now() + 30 * 864e5 } });
            const p = Profile.load();
            if (!p.mastered.includes(w.word)) p.mastered.push(w.word);
            Profile.save(p);
            return { ok: true };
          }
          return { ok: false, reason: 'not in vocab' };
        }
        case 'get_review_queue': {
          const due = await Words.due();
          return { dueToday: due.length };
        }
        case 'get_profile': {
          return Profile.load();
        }
        default:
          return { error: 'unknown tool' };
      }
    } catch (e) {
      return { error: String(e && e.message || e) };
    }
  },

  /* ---------- system prompt 组装（场景 + 用户档案） ---------- */
  buildSystem(scene) {
    const sc = scene || DEFAULT_SCENE;
    const p = Profile.load();
    const mistakes = (p.mistakes || []).slice(0, 5).map(m => m.pat).join('; ') || '无';
    const mastered = (p.mastered || []).slice(-8).join(', ') || '无';
    return `${sc.system}

【学习者档案】
- 水平：${p.level}（中国研究生，约四级词汇量，能读但口语输出卡顿）
- 词汇水平：${levelLine()}
- 常犯错误：${mistakes}
- 已掌握（别再用太基础的词考他）：${mastered}
- 累计对话 ${p.sessions || 0} 局

【对话规则】
- 一次只回复 1-2 句，别长篇大论，这是 3 分钟短对话
- 如果学习者说错或卡壳，用自然的方式把正确说法带进你的回复里，不要长篇纠错
- 可以调用工具查/加生词，但别在对话中途打断节奏
- 对话进行 5-8 轮后，如果学习者说"结束/复盘/好了"，回复 OK 并停
${this.forgetLine()}
`;
  },

  /* ---------- 核心 agent loop ---------- */
  async run(scene, history) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    return await this._run(scene, history, model);
  },

  async _run(scene, history, model) {
    const msgs = [{ role: 'system', content: this.buildSystem(scene) }, ...history];

    let turns = 0;
    while (turns < 8) {
      turns++;
      const resp = await API.chat(msgs, { model, tools: this.toolDefs, maxTokens: 2000 });
      const choices = resp.choices || [];
      if (!choices.length || !choices[0].message) {
        throw new Error('模型返回异常(空响应) [' + model + ']');
      }
      const msg = choices[0].message;
      msgs.push(msg);

      // token 截断保护（参考 Pi：length 截断时工具参数可能不完整，放弃执行让模型重发）
      if (resp.choices[0].finish_reason === 'length' && msg.tool_calls) {
        msgs.push({ role: 'tool', tool_call_id: msg.tool_calls[0].id,
          content: JSON.stringify({ error: 'truncated, please re-issue with complete arguments' }) });
        continue;
      }

      const calls = msg.tool_calls || [];
      if (calls.length === 0) {
        return msg.content || '';
      }
      for (const tc of calls) {
        const result = await this.execute(tc.function.name, tc.function.arguments, scene);
        msgs.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }
    return '（对话有点长了，我们歇一下）';
  },

  /* ---------- 复盘：对话后生成生词/错误清单 ---------- */
  async review(messages) {
    const model = Settings.get('buildModel', 'mimo-v2.5');
    const brief = messages.slice(-14).map(m => `${m.role}: ${typeof m.content === 'string' ? m.content.slice(0, 300) : ''}`).join('\n');
    const resp = await API.chat([
      { role: 'system', content: `你是英语老师 + 表演教练。下面是学习者刚结束的一段英语对话（可能含 AI 角色和工具消息，只看 user 和 assistant 的内容）。
请分析学习者的表现，输出 JSON（不要输出其他内容）：
{
  "good": "一句鼓励的话（中文）",
  "mistakes": [{"pattern":"学习者说错/卡壳的表达（英文原文）","fix":"正确/更地道的说法（英文）","note":"简短中文说明（可选）"}],
  "newWords": [{"word":"学习者明显不会或不熟的单词","meaning":"中文释义","example":"简单例句","exampleCn":"例句翻译"}],
  "roleplay": [{"line":"学习者某句台词（英文原文）","issue":"不符合其扮演角色人设/身份/语气的地方（中文，若无则空字符串）","better":"更符合角色的说法（英文）"}]
}
注意：
- newWords：重点收集学习者在对话中**主动问过意思**的单词（如 what does X mean），以及明显卡壳的词
- roleplay：仅当这段对话是角色扮演时检查（学习者有扮演身份），检查他的台词是否符合角色身份/语气；普通对话时 roleplay 返回空数组
- 如果学习者中文提问了某个词的意思，那个词一定要放进 newWords` },
      { role: 'user', content: brief },
    ], { model, maxTokens: 1500 });
    const content = resp.choices[0].message.content || '';
    try {
      const json = content.replace(/```json|```/g, '').trim();
      const start = json.indexOf('{');
      const end = json.lastIndexOf('}');
      return JSON.parse(json.slice(start, end + 1));
    } catch {
      return { good: '复盘生成失败，但练了就比没练强。', mistakes: [], newWords: [] };
    }
  },

  /* ---------- 一键建卡：粘贴英文文本提取生词 ---------- */
  async buildCards(text) {
    const model = Settings.get('buildModel', 'mimo-v2.5');
    const resp = await API.chat([
      { role: 'system', content: `你是英语学习助手。下面是用户粘贴的英文文本（可能是论文摘要、文章、对话等）。
提取其中对用户（中国研究生，四级水平）最有学习价值的 5-8 个生词/短语，输出 JSON（不要输出其他内容）：
{"words":[{"word":"单词或短语","phonetic":"英式音标","meaning":"中文释义","example":"从原文中截取或改写一个短例句","exampleCn":"例句中文翻译"}]}
要求：优先选影响理解的核心词，跳过太简单或太生僻的词。` },
      { role: 'user', content: text.slice(0, 4000) },
    ], { model, maxTokens: 2000 });
    const content = resp.choices[0].message.content || '';
    try {
      const json = content.replace(/```json|```/g, '').trim();
      const start = json.indexOf('{');
      const end = json.lastIndexOf('}');
      return JSON.parse(json.slice(start, end + 1)).words || [];
    } catch {
      return [];
    }
  },

  /* 表达建议：检查用户最后一条英文，给更地道的说法 */
  async suggestBetter(history) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const lastUser = [...history].reverse().find(m => m.role === 'user');
    if (!lastUser || !/[a-zA-Z]/.test(lastUser.content || '')) return null;
    const ctx = history.slice(-6).map(m => `${m.role}: ${(m.content || '').slice(0, 200)}`).join('\n');
    try {
      const resp = await API.chat([
        { role: 'system', content: `你是英语口语教练。分析用户最近一条英文表达，判断是否自然、准确。
如果表达有明显问题（语法错误/不地道/用词不当/表达生硬），返回 JSON：
{"needFix":true,"better":"更地道自然的英文说法","reason":"一句话中文解释哪里不对、为什么这样更好"}
如果表达没问题，返回：{"needFix":false}
要求：better 要贴合对话上下文语境，口语化地道。只输出 JSON，不要其他内容。` },
        { role: 'user', content: ctx },
      ], { model, maxTokens: 2000 }); // 🔴 v1.2.5：恢复思考模式（质量优先）+ maxTokens 2000（思考链不再吃光输出）
      const msg = resp.choices?.[0]?.message || {};
      let content = (msg.content || '').replace(/```json|```/g, '').trim();
      if (!content && msg.reasoning_content) {
        // 🔴 v1.2.5：极端情况 content 为空 → 从思考链里兜底提取 JSON（只取输出结果，过滤思考过程）
        const m = String(msg.reasoning_content).match(/\{[\s\S]*\}/);
        if (m) content = m[0];
      }
      const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
      return j && j.needFix ? j : null;
    } catch {
      return null;
    }
  },

  /* 🔴 v1.2.2：RP 台词检查——语法/表达 + 是否符合扮演角色的身份/语气（出纠正小卡片）
     🔴 v1.2.3：提示词降低漏报阈值——学习者在练习，有任何不准确都要指出
     🔴 v1.2.5：恢复思考 + maxTokens 2000 + content 空时从思考链兜底提取 JSON */
  async suggestRp(line, world, player, history) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const w = world || {};
    const p = player || {};
    const ctx = (history || []).slice(-4).map(m => `${m.role}${m.name ? ' (' + m.name + ')' : ''}: ${(m.content || '').slice(0, 150)}`).join('\n');
    try {
      const resp = await API.chat([
        { role: 'system', content: `你是英语口语教练 + 表演指导。学习者在角色扮演中扮演「${p.name || '主角'}」（身份：${p.persona || '未知'}），世界：${w.name || ''}（${w.setting || ''}）。
他是在练习英语，所以只要他的台词有任何问题都要指出来：
1) 语法错误（时态/主谓一致/介词/冠词等）
2) 表达不地道（中式英语/生硬/用词不当）
3) 不符合角色身份（语气/用词/时代背景违和，比如古代角色说出现代俚语）
发现任何一条就返回 JSON：
{"needFix":true,"better":"更地道且符合角色的英文说法（完整一句，不要省略号）","reason":"一句话中文解释哪里不对、为什么这样更好"}
完全没问题才返回：{"needFix":false}
要求：better 口语化、贴合剧情语境。只输出 JSON，不要其他内容。` },
        { role: 'user', content: '最近剧情：\n' + ctx + '\n\n学习者的台词：' + line },
      ], { model, maxTokens: 2000 }); // 🔴 v1.2.5：恢复思考 + maxTokens 2000（同 suggestBetter）
      const msg = resp.choices?.[0]?.message || {};
      let content = (msg.content || '').replace(/```json|```/g, '').trim();
      if (!content && msg.reasoning_content) {
        const m = String(msg.reasoning_content).match(/\{[\s\S]*\}/);
        if (m) content = m[0];
      }
      const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
      return j && j.needFix ? j : null;
    } catch {
      return null;
    }
  },

  /* ---------- 中文求助：用户用中文描述想表达的意思，生成地道英文 ---------- */
  async suggestFromChinese(history, chinese) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const ctx = history.slice(-6).map(m => `${m.role}: ${(m.content || '').slice(0, 200)}`).join('\n');
    const resp = await API.chat([
      { role: 'system', content: `你是英语口语教练。用户用中文描述想表达的意思，请结合对话上下文，给出地道自然的英文表达。
返回 JSON：{"better":"英文表达","reason":"一句话中文解释为什么这样说/用这个词"}
要求：英文要口语化、贴合语境。只输出 JSON，不要其他内容。` },
      { role: 'user', content: '对话上下文：\n' + ctx + '\n\n用户想表达（中文）：' + chinese },
    ], { model, maxTokens: 300 });
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    return { better: j.better || '', reason: j.reason || '' };
  },

  /* 选角：根据世界卡给出 3-4 个可扮演身份 */
  async rpOfferRoles(world) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const w = world || {};
    const rolesDesc = (w.roles || []).map(r => `${r.name}(${r.gender === 'male' ? '男' : '女'},${r.role || ''},${r.persona || ''})`).join('; ');
    const resp = await API.chat([
      { role: 'system', content: `You are casting the player in an English roleplay story.\nWorld: ${w.name} — ${w.setting || w.description || ''}\nCast already in this world: ${rolesDesc || 'none'}\n\nOffer 3-4 distinct roles the PLAYER could play in this world. They can be a character from the cast, an outsider, or a fresh arrival. Each must fit the world.\nYou MUST reply with ONLY a JSON array, no explanation, no markdown fences, no trailing text:\n[{"name":"角色英文名","gender":"male或female","desc":"一句话身份介绍(英文)","persona":"性格要点(英文,1句)"}]` },
      { role: 'user', content: 'Give me 3-4 role options.' },
    ], { model, maxTokens: 2000 });
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      const a = content.indexOf('['), b = content.lastIndexOf(']');
      if (a === -1 || b === -1) return [];
      const j = JSON.parse(content.slice(a, b + 1));
      return Array.isArray(j) ? j : [];
    } catch { return []; }
  },

  /* 塑造玩家角色：根据用户选择/描述生成角色卡 */
  async rpPlayerCard(desc, world) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const w = world || {};
    const resp = await API.chat([
      { role: 'system', content: `You shape the PLAYER character in an English roleplay story.
World: ${w.name} — ${w.setting || w.description || ''}
Cast: ${(w.roles || []).map(r => r.name).join(', ') || 'none'}

The player will roleplay as a character. Given their choice/description, produce a compact character card.
Output ONLY JSON: {"name":"角色英文名","gender":"male或female","persona":"身份与性格(英文,2句)","background":"与世界的关联(英文,1-2句)"}` },
      { role: 'user', content: 'My character: ' + desc },
    ], { model, maxTokens: 500 });
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
    } catch { return { name: 'You', gender: 'female', persona: '', background: '' }; }
  },

  /* 开场前言：世界 + 你的处境 + 第一个行动选择 */
  async rpOpenIntro(world, player, roster) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const w = world || {};
    const p = player || {};
    const castLine = (w.roles || []).map(r => `${r.name}(${r.gender === 'male' ? 'M' : 'F'})`).join(', ');
    const sys = this.rpSystem(w) + `\nYou are the GAME MASTER / narrator.\n\nWrite the OPENING scene: the player ${p.name || 'the stranger'} arrives in ${w.name}. Set the scene vividly in 3-4 sentences of narration (English), introduce who is around (cast: ${castLine}), and end by presenting 3-4 English choices for the player's first move (second-person, actionable, short).\n\nOutput ONLY JSON: {"narration":"...","options":["Choice 1","Choice 2","Choice 3"]}`;
    const msgs = [{ role: 'system', content: sys }, { role: 'user', content: 'Open the story.' }];
    const resp = await API.chat(msgs, { model, maxTokens: 700 });
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
      return { narration: j.narration || '', options: (j.options || []).slice(0, 4) };
    } catch {
      // 🔴 v1.1：解析失败时提取 narration 字段，失败用固定开场文案——绝不把原始 JSON 当旁白展示
      const narration = (content.match(/"narration"\s*:\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || '';
      const opts = (content.match(/"options"\s*:\s*\[([^\]]*)\]/) || [])[1] || '';
      const options = opts ? opts.match(/"([^"]+)"/g).map(s => s.slice(1, -1)).slice(0, 4) : [];
      return { narration: narration || ('You step into the world of ' + (w.name || 'this story') + ', where your first decision awaits.'), options };
    }
  },

  /* ================= 角色扮演（酒馆 RP）引擎 ================= */
  // 最常忘词缓存（对话/剧场生成时自然带入，巩固记忆）
  // _forgetWords: 当前还在忘（forgot>0）→ 每轮稳定带
  // _dormantWords: 历史忘过但现在记住（peak>0 且 forgot=0）→ 偶尔随机带一个巩固
  // _dueWords: 今天 SRS 到期该复习的词（v0.44）→ 优先带进对话
  _forgetWords: [],
  _dormantWords: [],
  _dueWords: [],
  async refreshForgetWords() {
    const n = parseInt(Settings.get('forgetCount', 5), 10) || 5;
    try {
      const list = await Words.list();
      const withPeak = list.map(w => ({ ...w, peak: w.peak || w.forgot || 0 }));
      this._forgetWords = withPeak
        .filter(w => (w.forgot || 0) > 0)
        .sort((a, b) => (b.forgot || 0) - (a.forgot || 0))
        .slice(0, n)
        .map(w => w.word);
      this._dormantWords = withPeak.filter(w => (w.peak || 0) > 0 && !(w.forgot || 0) > 0);
      // 🔴 v0.44：今天按复习规律该复习的词（SRS 到期且已学过），也带进对话上下文
      const now = Date.now();
      this._dueWords = withPeak
        .filter(w => w.srs && w.srs.due > 0 && w.srs.reps > 0 && w.srs.due <= now)
        .sort((a, b) => (a.srs.due || 0) - (b.srs.due || 0))
        .slice(0, 8)
        .map(w => w.word);
    } catch { this._forgetWords = []; this._dormantWords = []; this._dueWords = []; }
  },
  forgetLine() {
    let lines = '';
    if (this._forgetWords.length) {
      lines += `\n- 学习者最常忘的词（这些词只是可以参考的素材：如果符合当前场景/世界观就自然带进对话帮他巩固；如果明显违和就不要用，宁可错过也不要生硬塞入）：${this._forgetWords.join('、')}`;
    }
    // 沉淀词：历史忘过但现在已记住 → 约 30% 概率随机带一个，偶尔重现巩固
    if (this._dormantWords && this._dormantWords.length && Math.random() < 0.3) {
      const w = this._dormantWords[Math.floor(Math.random() * this._dormantWords.length)];
      lines += `\n- 巩固词（学习者以前忘过这个词，现在记起来了；同样只在符合场景时自然提一次，违和就不用）：${w.word}`;
    }
    // 🔴 v0.44：今天按复习规律该复习的词（SRS 到期）——优先自然带进对话，帮他在对话里巩固
    if (this._dueWords && this._dueWords.length) {
      lines += `\n- 今天复习计划里的词（学习者今天应该复习这些词，请优先在对话中自然使用它们，同样要符合场景、不硬塞）：${this._dueWords.join('、')}`;
    }
    return lines;
  },
  // 基础提示词前缀（保持稳定 → DeepSeek 硬盘缓存命中）
  rpSystem(world) {
    const w = world || {};
    return `You are the engine of an immersive English roleplay game. RULES:
1. Everything you output must be in English. All narration, dialogue, and choices must be English.
2. Stay in character at all times. Never break the fourth wall.
3. Keep responses concise (under 150 words).
4. If the user writes in Chinese, gently correct them: first show the correct English way to say what they meant, then continue the story in English.
5. WORLD CONSISTENCY: everything in the story must fit the world's setting and era as defined by the world card. Only introduce things that plausibly exist in this world — if the world card is modern, modern things are fine; if it is medieval or futuristic, stick to that world. Vocabulary reminders below are optional material: use a word only if it fits naturally; never force it.
6. VOCABULARY LEVEL: ${levelLine()} — apply this to narration, dialogue, and choices; keep the story understandable at this level while naturally including 1-2 slightly advanced words per beat.
${this.forgetLine()}

WORLD: ${w.name || 'Unknown world'}
SETTING: ${w.setting || ''}
WORLD RULES: ${w.rules || 'None'}
NARRATION TONE: ${w.tone || 'atmospheric'}`;
  },

  /* 角色子 Agent：推理一个角色的内心活动 → 行动 → 台词（每轮每个角色单独调用） */
  async rpInferChar(char, world, history, userInput) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const sys = this.rpSystem(world) + `

You are playing: ${char.name}
PERSONA: ${char.persona || 'a character in this world'}
APPEARANCE: ${char.appearance || 'ordinary appearance'}
BACKGROUND: ${char.background || 'part of this world'}
SPEAKING STYLE: ${char.speakingStyle || 'natural, in-character'}
EXAMPLE DIALOGUE: ${char.exampleDialogue || 'none'}

Now think as ${char.name}. Given the conversation so far and the player's latest action, infer this character's inner thoughts, decide their action, and write their spoken line.
Output ONLY JSON: {"inner":"their inner thoughts in English","action":"what they physically do","speech":"their spoken line in English"}`;
    const msgs = [
      { role: 'system', content: sys },
      // 🔴 v1.1：清洗多余字段（voice/options/name 不进请求体）+ 排除刚注入的当前 user 消息（避免同一输入出现两遍）
      ...this.cleanRpHistory(history, 10),
      { role: 'user', content: 'Latest event: ' + userInput + '\n\nRespond as ' + char.name + '.' },
    ];
    const resp = await API.chat(msgs, { model, maxTokens: 1200 }); // 🔴 v1.1：800→1200（思考模式下三字段 JSON 更不易截断）
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
      return { inner: j.inner || '', action: j.action || '', speech: j.speech || '' };
    } catch {
      // 🔴 v1.1：解析失败时逐字段提取，绝不把原始 JSON 当台词展示（v0.42 只修了导演层，角色层漏了）
      const speech = (content.match(/"speech"\s*:\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || '';
      const inner = (content.match(/"inner"\s*:\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || '';
      const action = (content.match(/"action"\s*:\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || '';
      return { inner, action, speech: speech || '(The character pauses, gathering their thoughts.)' };
    }
  },

  /* 🔴 v1.1：RP 历史送模型前清洗——只留 role/content（voice/options/name 不进请求体），
   * 并排除最后一条 user 消息（当前输入已单独注入，避免重复） */
  cleanRpHistory(history, n) {
    const arr = (history || []).slice(-n);
    const msgs = arr.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' }));
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') { msgs.splice(i, 1); break; }
    }
    return msgs;
  },

  /* 导演 Agent：汇总所有角色的推理，推进情节 + 给选项 */
  async rpDirect(world, chars, history, userInput, charResults) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const sys = this.rpSystem(world) + `

You are the GAME MASTER / narrator of this story. Characters present: ${chars.map(c => c.name).join(', ')}.

Given the conversation history, the player's latest action, and each character's inner thoughts and actions, write the next beat of the story:
- A short vivid narration of the scene (2-4 sentences)
- Each character's spoken line (from their speech; adjust if needed)
- 3-4 English choices for the player's next move (second-person, actionable, short)

Output ONLY JSON: {"narration":"...","dialogue":[{"name":"CharacterName","line":"...","gender":"male或female"}],"options":["Choice 1","Choice 2","Choice 3"]}
For dialogue: characters from the cast keep their identity; NEW side characters may appear (e.g. a waiter, a guard) — for ANY character first appearing in this beat, MUST include "gender" ("male" or "female"). For already-known characters you may omit it.`;
    const charBrief = charResults.map((r, i) => `${chars[i].name}: inner="${r.inner}" action="${r.action}" speech="${r.speech}"`).join('\n');
    const msgs = [
      { role: 'system', content: sys },
      ...this.cleanRpHistory(history, 8),
      { role: 'user', content: 'Player action: ' + (userInput || '(the player lets the story continue on its own)') + '\n\nCharacter inner states:\n' + charBrief + '\n\nWrite the next beat.' },
    ];
    const resp = await API.chat(msgs, { model, maxTokens: 2200 }); // v0.42：1000 太小，narration+dialogue+options 会被截断→JSON解析失败显示原始JSON
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
      return { narration: j.narration || '', dialogue: j.dialogue || [], options: (j.options || []).slice(0, 4) };
    } catch {
      // JSON 解析失败（可能被截断）：逐字段兜底提取，绝不把原始 JSON 当旁白显示
      const dlg = [];
      content.split('\n').forEach(l => {
        const m = l.match(/^\s*([A-Za-z][A-Za-z0-9 _'-]*?):\s*(.+)$/);
        if (m) dlg.push({ name: m[1].trim(), line: m[2].trim(), gender: '' });
      });
      const narration = (content.match(/"narration"\s*:\s*"([^"]*)"/) || [])[1] || '';
      const opts = (content.match(/"options"\s*:\s*\[([^\]]*)\]/) || [])[1] || '';
      const options = opts ? opts.match(/"([^"]+)"/g).map(s => s.slice(1, -1)).slice(0, 4) : [];
      return { narration: narration || content.slice(0, 300), dialogue: dlg, options };
    }
  },

  /* 中文 → 英文翻译（用户 RP 输入含中文时先翻译） */
  async translateToEnglish(text) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const resp = await API.chat([
      { role: 'system', content: 'Translate the user input to natural, spoken English. Output ONLY the translation, nothing else.' },
      { role: 'user', content: text },
    ], { model, maxTokens: 300 });
    return (resp.choices?.[0]?.message?.content || '').trim();
  },

  /* ---------- 酒馆卡生成 ---------- */
  async generateWorldCard(desc) {
    const model = Settings.get('buildModel', 'deepseek-v4-flash');
    const resp = await API.chat([
      { role: 'system', content: `你是世界卡设计师。根据用户描述生成一个角色扮演世界的世界卡，世界卡内嵌这个世界里已有的角色表（主角/配角/反派等，3-5 个），返回 JSON：
{"name":"世界名(英文)","title":"中文标题","description":"一句话简介(英文)","setting":"详细世界设定(英文,3-5句)","rules":"世界规则(英文,2-3条,换行分隔)","tone":"叙述风格(英文,如 atmospheric、humorous)","roles":[{"name":"角色英文名","gender":"male或female","persona":"身份与性格(英文,1-2句)","role":"主角/配角/反派等(中文)","speakingStyle":"说话风格(英文,1句)"}]}
要求：角色要和世界观贴合，性别明确。英文输出，适合英语学习。只输出 JSON。` },
      { role: 'user', content: '我的世界设想：' + desc },
    ], { model, maxTokens: 1200 });
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
      if (!Array.isArray(j.roles)) j.roles = [];
      return j;
    } catch {
      return null; // 🔴 v1.1：解析失败返回 null，调用方给出重试提示
    }
  },
  /* 旧世界卡补齐角色：按世界设定生成 3-5 个角色 */
  async fillWorldRoles(world) {
    const model = Settings.get('buildModel', 'deepseek-v4-flash');
    const w = world || {};
    const resp = await API.chat([
      { role: 'system', content: `你是世界卡设计师。根据已有的世界卡，为这个世界补充角色表（主角/配角/反派等，3-5 个），返回 JSON 数组：
[{"name":"角色英文名","gender":"male或female","persona":"身份与性格(英文,1-2句)","role":"主角/配角/反派等(中文)","speakingStyle":"说话风格(英文,1句)"}]
要求：角色贴合世界观，性别明确。英文输出。只输出 JSON 数组。` },
      { role: 'user', content: `世界：${w.name || ''} — ${w.setting || w.description || ''}` },
    ], { model, maxTokens: 900 });
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      const a = content.indexOf('['), b = content.lastIndexOf(']');
      const j = JSON.parse(content.slice(a, b + 1));
      return Array.isArray(j) ? j : [];
    } catch {
      return []; // 🔴 v1.1：解析失败返回空数组（调用方已有兜底提示）
    }
  },

  /* 复盘：语法/表达 + 角色扮演贴合度 */
  /* 🔴 v1.1.1：查词升级——带整句语境（固定搭配识别）+ 老师式讲解（用法/举一反三/词族/记忆提示）+ 例句难度匹配英语水平 */
  async queryWord(word, context) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const lv = levelCfg();
    const ctxBlock = context
      ? `\n【这个词出现的语境】\n"""${String(context).slice(0, 900)}"""\n先仔细读语境再回答：这个词在语境中是什么意思？它是不是某个固定搭配/惯用语的一部分（搭配的另一部分可能离它很远，要仔细找）？`
      : '\n（没有语境，按最常用义讲解即可）';
    const resp = await API.chat([
      { role: 'system', content: `你是英语老师，在教一个${lv.label}水平的学生。为单词 "${word}" 输出讲解，返回 JSON（不要输出其他内容）：
{
  "word": "${word}",
  "phonetic": "英式音标",
  "pos": "词性，如 v./n./adj.",
  "meaning": "中文释义（结合语境的主释义 1-2 条；无语境给最常用义）",
  "usage": "语境中的用法：如果是固定搭配/惯用语的一部分，指出来并解释整个搭配怎么用（英文示例+中文说明）；无语境时给这个单词最常用的搭配",
  "root": "词根/词缀拆解（用中文说明）",
  "family": "同根词/词族 2-3 个（英文，简短）",
  "collocations": "常用搭配 1-2 个（英文，如 take a break）",
  "synonyms": "同义词 1-2 个",
  "antonyms": "反义词（如有）",
  "examples": [{"en":"英文例句","cn":"中文翻译"}],
  "expand": "举一反三：换个说法/相关表达 1-2 个（英文+中文），让学习者能立刻用出来",
  "note": "记忆提示（一句话中文，可用词源小故事或联想记忆）"
}
要求：例句难度匹配 ${lv.label} 水平（${lv.desc}）；有语境时例句优先贴近语境场景。只输出 JSON。${ctxBlock}` },
      { role: 'user', content: word + (context ? '\n语境：' + String(context).slice(0, 900) : '') },
    ], { model, maxTokens: 1500 });
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
      return { ...j, word: word };
    } catch {
      return { word, phonetic: '', pos: '', meaning: '', usage: '', root: '', family: '', collocations: '', synonyms: '', antonyms: '', examples: [], expand: '', note: '' };
    }
  },

  /* 句子/词组翻译解释（查询后入句子本）
     🔴 v1.1.1：输出加 expand（关键表达+类似说法），讲解更完整 */
  async queryText(text) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    const lv = levelCfg();
    const resp = await API.chat([
      { role: 'system', content: `你是英语老师，在教一个${lv.label}水平的学生。翻译下面这句英文（或词组），返回 JSON（不要输出其他内容）：
{"cn":"自然的中文翻译","note":"关键表达/语法点的一句话中文说明（如有）","expand":"这句话里的关键表达或搭配，以及 1 个类似说法（英文+中文）"}` },
      { role: 'user', content: text },
    ], { model, maxTokens: 500 });
    const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
    try {
      const j = JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1));
      return { cn: j.cn || '', note: j.note || '', expand: j.expand || '' };
    } catch {
      return { cn: '', note: '', expand: '' };
    }
  },

  /* ---------- 会话命名：根据对话内容生成中文标题 ---------- */
  async titleForConversation(history) {
    const model = Settings.get('buildModel', 'deepseek-v4-flash');
    const brief = history.slice(-6).map(m => `${m.role}: ${(m.content || '').slice(0, 120)}`).join('\n');
    try {
      const resp = await API.chat([
        { role: 'system', content: '你是标题生成器。给下面这段英语学习对话生成一个简短的中文标题，不超过 8 个字，概括对话主题（如"咖啡店点单""组会汇报"）。只输出标题本身，不要引号和其他内容。' },
        { role: 'user', content: brief },
      ], { model, maxTokens: 300 });
      const title = (resp.choices?.[0]?.message?.content || '').trim().replace(/["「」']/g, '').slice(0, 12);
      return title || '';
    } catch {
      return '';
    }
  },
};
