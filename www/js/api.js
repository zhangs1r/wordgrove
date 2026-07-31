/* api.js — LLM 网关调用（DeepSeek 官方 / OpenCode Go，CapacitorHttp 接管 fetch 走原生）
   DeepSeek 官方：https://api.deepseek.com/v1/chat/completions，deepseek-v4-flash 国内直连 */
const API = {
  base: 'https://api.deepseek.com/v1/chat/completions',
  key: '',

  loadConfig() {
    const provider = Settings.get('provider', 'deepseek');
    const base = Settings.get('apiBase', '');
    const defaultBase = provider === 'deepseek'
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://opencode.ai/zen/go/v1/chat/completions';
    // 地址与提供商不匹配时自动校正（防止旧数据残留导致请求发错地方）
    const ok = base && (base.includes('deepseek.com') || base.includes('opencode.ai'));
    this.base = (ok && ((provider === 'deepseek') === base.includes('deepseek.com'))) ? base : defaultBase;
    this.key = Settings.get('apiKey', '');
    if (this.base !== base) Settings.set('apiBase', this.base);
  },

  configured() {
    return !!this.key;
  },

  async chat(messages, opts = {}) {
    const {
      model = 'deepseek-v4-flash',
      tools,
      maxTokens = 2000,
      temperature,
      thinking,
    } = opts;

    const body = { model, messages, max_tokens: maxTokens };
    if (tools && tools.length) body.tools = tools;
    if (temperature !== undefined) body.temperature = temperature;
    // DeepSeek 思考模式开关（对话传 'disabled' 提速；建卡/复盘不传=默认思考）
    if (thinking) body.thinking = { type: thinking };

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
        const res = await fetch(this.base, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        if (res.status === 429 || res.status === 529) {
          lastErr = '限流(' + res.status + ')，重试中';
          await sleep(2000 * (attempt + 1));
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
        if (e.message.includes('Key 无效')) throw e;
        lastErr = e.message || String(e);
        await sleep(1500 * (attempt + 1));
      }
    }
    throw new Error('API 调用失败：' + lastErr);
  },
  /* 测试连接：发一个最小请求验证 key */
  async test() {
    const res = await fetch(this.base, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.key,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 8,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || ('HTTP ' + res.status));
    }
    return data.choices?.[0]?.message?.content || 'ok';
  },
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
