/* api.js — LLM 网关调用（DeepSeek 官方 / OpenCode Go，CapacitorHttp 接管 fetch 走原生）
   DeepSeek 官方：https://api.deepseek.com/v1/chat/completions，deepseek-v4-flash 国内直连 */
const API = {
  base: 'https://api.deepseek.com/v1/chat/completions',
  key: '',

  /* 🔴 v1.2.36 安全加固：API 地址严格校验——必须 https + api.deepseek.com 主机名、无 userinfo（防 key 发往任意端点）
     原来 includes('deepseek.com') 子串匹配可被 deepseek.com.evil.com / 明文 http 绕过 */
  validateBase(base) {
    if (!base || typeof base !== 'string') return false;
    try {
      const u = new URL(base);
      return u.protocol === 'https:'
        && u.hostname === 'api.deepseek.com'
        && !u.username && !u.password;
    } catch { return false; }
  },

  loadConfig() {
    const provider = Settings.get('provider', 'deepseek');
    const base = Settings.get('apiBase', '');
    const defaultBase = 'https://api.deepseek.com/v1/chat/completions';
    // 只用 DeepSeek：非合法 deepseek.com 地址一律重置，防残留/恶意地址
    this.base = (base && this.validateBase(base)) ? base : defaultBase;
    this.key = Settings.get('apiKey', '');
    if (this.base !== base) Settings.set('apiBase', this.base);
  },

  configured() {
    return !!this.key;
  },

  /* DeepSeek 账户余额查询（🔴 v1.2.36：加 10s 超时，防网络黑洞永久挂起） */
  async getBalance() {
    if (!this.configured()) return null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const resp = await fetch('https://api.deepseek.com/user/balance', {
        headers: { Authorization: 'Bearer ' + Settings.get('apiKey', '') },
        signal: ctrl.signal,
      });
      if (!resp.ok) throw new Error('balance ' + resp.status);
      const j = await resp.json();
      const infos = j.balance_infos || [];
      return { total: infos[0] ? infos[0].total_balance : '' };
    } finally { clearTimeout(timer); }
  },

  async chat(messages, opts = {}) {
    const {
      model = 'deepseek-v4-flash',
      tools,
      maxTokens = 2000,
      temperature,
      thinking,
      reasoningEffort,
      timeout,
    } = opts;

    const body = { model, messages, max_tokens: maxTokens };
    if (tools && tools.length) body.tools = tools;
    if (temperature !== undefined) body.temperature = temperature;
    // DeepSeek 思考模式开关（对话传 'disabled' 提速；建卡/复盘不传=默认思考）
    if (thinking) body.thinking = { type: thinking };
    // 🔴 v1.2.32：推理档位（low/medium/high/xhigh/ultra）——简单任务（查词/翻译）用 medium 提速，
    //   对话/剧场保持默认 high 保质量
    if (reasoningEffort) body.reasoning_effort = reasoningEffort;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14; 23127PN0CC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Origin': 'https://localhost',
      'Referer': 'https://localhost/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.key,
    };

    let lastErr = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // 🔴 v1.1：fetch 加超时（断网/代理黑洞不再永久卡 typing；对话思考模式给 90s）
        // 🔴 v1.2.32：支持按调用自定义超时（查词/翻译收紧到 20-25s，不干等）
        const ctrl = new AbortController();
        const t = timeout || (attempt === 0 ? 90000 : 60000);
        const timer = setTimeout(() => ctrl.abort(), t);
        let res;
        try {
          res = await fetch(this.base, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: ctrl.signal,
          });
        } finally { clearTimeout(timer); }
        // 🔴 v1.1：参数类错误不重试（重试只会浪费 4.5s）；402 余额不足给中文提示
        // 🔴 v1.2.32：400 时若带 reasoning_effort，去掉后重试一次（兼容不支持该参数的端点）
        if (res.status === 400 || res.status === 422) {
          const t = await res.text();
          if (body.reasoning_effort && attempt === 0) {
            delete body.reasoning_effort;
            attempt--;
            continue;
          }
          let msg = '请求参数错误';
          try { msg = JSON.parse(t)?.error?.message || msg; } catch {}
          throw new Error(msg + ' [' + res.status + ']');
        }
        if (res.status === 402) {
          throw new Error('API 余额不足，请去 platform.deepseek.com 充值 [402]');
        }
        if (res.status === 429 || res.status === 529) {
          // 🔴 v1.1：尊重 Retry-After
          const ra = parseInt(res.headers.get('retry-after') || '', 10);
          lastErr = '限流(' + res.status + ')，重试中';
          await sleep((ra && ra > 0 ? ra : 2 * (attempt + 1)) * 1000);
          continue;
        }
        const text = await res.text();
        let data = {};
        try { data = JSON.parse(text); } catch {}
        if (!res.ok) {
          const msg = data?.error?.message || ('HTTP ' + res.status);
          if (res.status === 401) throw new Error('API Key 无效，去设置里检查');
          throw new Error(msg + ' [' + res.status + ']');
        }
        // HTML 响应：网络层被拦截（Cloudflare 挑战/运营商劫持页）
        if (text.trimStart().startsWith('<')) {
          lastErr = '网络被拦截(返回网页而非数据)，请检查代理/VPN 或稍后重试';
          await sleep(2000 * (attempt + 1));
          continue;
        }
        // 200 但响应体异常（无 choices）：多半是网络层截断/污染，重试
        if (!data || !Array.isArray(data.choices) || !data.choices.length) {
          lastErr = '响应异常: ' + text.slice(0, 300);
          await sleep(1500 * (attempt + 1));
          continue;
        }
        return data;
      } catch (e) {
        if (e.name === 'AbortError') {
          lastErr = '请求超时（网络慢或代理问题），已重试';
          await sleep(1500 * (attempt + 1));
          continue;
        }
        if (e.message.includes('Key 无效') || e.message.includes('余额不足') || e.message.includes('参数错误')) throw e;
        lastErr = e.message || String(e);
        await sleep(1500 * (attempt + 1));
      }
    }
    throw new Error('API 调用失败：' + lastErr);
  },
  /* 测试连接：发一个最小请求验证 key
     🔴 v1.1：max_tokens 8→200（思考模式会吃光 8 个 token 导致 content 空，假阳性"连接成功"）；校验 content 非空 */
  async test() {
    // 🔴 v1.2.36：加 10s 超时，防网络黑洞时按钮永久卡"测试中…"
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(this.base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.key,
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 200,
        }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error?.message || ('HTTP ' + res.status));
      }
      const content = data.choices?.[0]?.message?.content || '';
      if (!content) throw new Error('响应异常（模型未返回内容，可能是思考链吃光了输出额度）');
      return content;
    } finally { clearTimeout(timer); }
  },
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
