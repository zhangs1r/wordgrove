/* api.js — OpenCode Go 网关调用（CapacitorHttp 接管 fetch 后自动走原生，无 CORS） */
const API = {
  base: 'https://opencode.ai/zen/go/v1/chat/completions',
  key: '',

  loadConfig() {
    this.base = Settings.get('apiBase', this.base);
    this.key = Settings.get('apiKey', '');
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
    } = opts;

    const body = { model, messages, max_tokens: maxTokens };
    if (tools && tools.length) body.tools = tools;
    if (temperature !== undefined) body.temperature = temperature;

    let lastErr = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(this.base, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.key,
          },
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
        // 200 但响应体异常（无 choices）：多半是网络层截断/污染，重试
        if (!data || !Array.isArray(data.choices) || !data.choices.length) {
          lastErr = '响应异常: ' + text.slice(0, 120);
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
