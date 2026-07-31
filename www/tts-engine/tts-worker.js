/* tts-worker.js — 内置 Piper 引擎的 Web Worker（classic）
   onnxruntime 推理 + phonemize 在 worker 跑，UI 不卡
   支持多音色：n=旁白/默认女声(female), f=女声, m=男声 —— 模型懒加载 */
importScripts('ort.wasm.min.js');

let createPiperPhonemize = null;
let sessions = {};   // voice -> session
let configs = {};    // voice -> config
let paths = null;
let ready = false;

async function loadPhonemize() {
  if (createPiperPhonemize) return;
  const m = await import('./piper-phonemize.js');
  createPiperPhonemize = m.createPiperPhonemize;
}

async function init(cfg) {
  paths = cfg;
  if (!self.ort) throw new Error('onnxruntime not loaded in worker');
  self.ort.env.wasm.numThreads = 1;
  // worker 内路径相对 worker script（tts-engine/）
  self.ort.env.wasm.wasmPaths = './';
  await loadPhonemize();
  ready = true;
}

async function getSession(voice) {
  const v = voice || 'n';
  if (sessions[v]) return { session: sessions[v], config: configs[v] };
  const cfgRes = await fetch(paths.modelJsons[v]);
  if (!cfgRes.ok) throw new Error('model config fetch failed ' + v + ' ' + cfgRes.status);
  const cfg = await cfgRes.json();
  const modelRes = await fetch(paths.modelUrls[v]);
  if (!modelRes.ok) throw new Error('model fetch failed ' + v + ' ' + modelRes.status);
  sessions[v] = await self.ort.InferenceSession.create(await modelRes.arrayBuffer());
  configs[v] = cfg;
  return { session: sessions[v], config: cfg };
}

async function synthesize(text, speed, voice) {
  const { session, config } = await getSession(voice);
  const input = JSON.stringify([{ text: text.trim() }]);
  const phonemeIds = await new Promise((resolve, reject) => {
    createPiperPhonemize({
      print: (data) => {
        try { resolve(JSON.parse(data).phoneme_ids); }
        catch (e) { reject(new Error('phonemize parse: ' + e.message)); }
      },
      printErr: (msg) => { reject(new Error('phonemize: ' + msg)); },
      locateFile: (url) => {
        if (url.endsWith('.wasm')) return paths.phonemizeWasm;
        if (url.endsWith('.data')) return paths.phonemizeData;
        return url;
      },
    }).then((m) => {
      m.callMain(['-l', config.espeak.voice, '--input', input, '--espeak_data', '/espeak-ng-data']);
    }).catch((e) => reject(new Error('phonemize init: ' + e.message)));
  });
  const lengthScale = (config.inference.length_scale || 1.0) / Math.max(0.4, speed);
  const feeds = {
    input: new self.ort.Tensor('int64', phonemeIds, [1, phonemeIds.length]),
    input_lengths: new self.ort.Tensor('int64', [phonemeIds.length]),
    scales: new self.ort.Tensor('float32', [config.inference.noise_scale, lengthScale, config.inference.noise_w]),
  };
  if (Object.keys(config.speaker_id_map || {}).length) feeds.sid = new self.ort.Tensor('int64', [0]);
  const { output: { data: pcm } } = await session.run(feeds);
  return { samples: pcm, sampleRate: config.audio.sample_rate };
}

self.onmessage = async (e) => {
  try {
    if (e.data.type === 'init') {
      await init(e.data);
      self.postMessage({ type: 'ready' });
    } else if (e.data.type === 'synth') {
      const r = await synthesize(e.data.text, e.data.rate, e.data.voice);
      self.postMessage({ type: 'result', id: e.data.id, samples: r.samples, sampleRate: r.sampleRate }, [r.samples.buffer]);
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: e.data && e.data.id, message: err.message });
  }
};
