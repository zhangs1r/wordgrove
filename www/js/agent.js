/* agent.js — 简化 agent loop + 本地工具 + 场景 + 复盘 + 摘要压缩
   参考 Pi agent-harness 的核心设计（工具批次执行 / token截断保护 / 上下文压缩） */

const SCENES = [
  { id: 'cafe', name: '☕ 咖啡店', level: 'B1',
    system: `You are Alex, a friendly barista at a small coffee shop. The user is a customer practicing English.
Keep replies to 1-2 short sentences. Use simple words (B1 level). If the user makes a mistake or hesitates, naturally model the correct way to say it in your reply, do not give lectures. Ask about their order, preferences, small things about their day.` },
  { id: 'advisor', name: '🎓 组会导师', level: 'B1+',
    system: `You are Professor Chen, a research advisor. The user is your graduate student giving a short progress update in English.
Keep replies to 1-2 short sentences. Use simple but professional words. Ask about progress, problems, next steps. If the user struggles, gently offer simpler ways to phrase things.` },
  { id: 'interview', name: '💼 面试官', level: 'B1+',
    system: `You are an interviewer for a tech company. The user is applying for a junior engineering role and practicing English.
Keep replies to 1-2 short sentences. Ask one question at a time: self-introduction, projects, why this role. Be warm, not intimidating. If the user is stuck, give them a moment then offer a hint.` },
  { id: 'smalltalk', name: '🌤️ 日常闲聊', level: 'B1',
    system: `You are a chatty friend. The user is practicing casual English.
Keep replies to 1-2 short sentences. Talk about everyday things: weather, food, hobbies, weekend plans. Use very natural, simple spoken English. If the user hesitates, just continue naturally so the conversation flows.` },
];

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
  async execute(name, argsStr) {
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
            example: it.example || '', exampleCn: it.exampleCn || '', source: 'agent',
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
    const p = Profile.load();
    const mistakes = (p.mistakes || []).slice(0, 5).map(m => m.pat).join('; ') || '无';
    const mastered = (p.mastered || []).slice(-8).join(', ') || '无';
    return `${scene.system}

【学习者档案】
- 水平：${p.level}（中国研究生，约四级词汇量，能读但口语输出卡顿）
- 常犯错误：${mistakes}
- 已掌握（别再用太基础的词考他）：${mastered}
- 累计对话 ${p.sessions || 0} 局

【对话规则】
- 一次只回复 1-2 句，别长篇大论，这是 3 分钟短对话
- 如果学习者说错或卡壳，用自然的方式把正确说法带进你的回复里，不要长篇纠错
- 可以调用工具查/加生词，但别在对话中途打断节奏
- 对话进行 5-8 轮后，如果学习者说"结束/复盘/好了"，回复 OK 并停
`;
  },

  /* ---------- 核心 agent loop ---------- */
  async run(scene, history) {
    const model = Settings.get('chatModel', 'deepseek-v4-flash');
    try {
      return await this._run(scene, history, model);
    } catch (e) {
      // mimo 对话网络不稳时自动换 deepseek 重试一次
      if (model === 'mimo-v2.5') {
        return await this._run(scene, history, 'deepseek-v4-flash');
      }
      throw e;
    }
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
        const result = await this.execute(tc.function.name, tc.function.arguments);
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
      { role: 'system', content: `你是英语老师。下面是学习者刚结束的一段英语对话（可能含 AI 角色和工具消息，只看 user 和 assistant 的内容）。
请分析学习者的表现，输出 JSON（不要输出其他内容）：
{
  "good": "一句鼓励的话（中文）",
  "mistakes": [{"pattern":"学习者说错/卡壳的表达（英文原文）","fix":"正确的说法","note":"简短中文说明"}],
  "newWords": [{"word":"值得记住的词","phonetic":"","meaning":"中文释义","example":"英文例句","exampleCn":"中文翻译"}]
}
要求：newWords 最多 3 个，必须是对话里真正出现且有学习价值的；mistakes 最多 3 条。没有就留空数组。` },
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

  /* ---------- 表达建议：检查用户最后一条英文，给更地道的说法 ---------- */
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
      ], { model, maxTokens: 300 });
      const content = (resp.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
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

  /* ---------- 会话命名：根据对话内容生成中文标题 ---------- */
  async titleForConversation(history) {
    const model = Settings.get('buildModel', 'deepseek-v4-flash');
    const brief = history.slice(-6).map(m => `${m.role}: ${(m.content || '').slice(0, 120)}`).join('\n');
    try {
      const resp = await API.chat([
        { role: 'system', content: '你是标题生成器。给下面这段英语学习对话生成一个简短的中文标题，不超过 8 个字，概括对话主题（如"咖啡店点单""组会汇报"）。只输出标题本身，不要引号和其他内容。' },
        { role: 'user', content: brief },
      ], { model, maxTokens: 200 });
      const title = (resp.choices?.[0]?.message?.content || '').trim().replace(/["「」']/g, '').slice(0, 12);
      return title || '';
    } catch {
      return '';
    }
  },
};
