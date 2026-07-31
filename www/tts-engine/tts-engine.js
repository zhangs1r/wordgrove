/* tts-engine.js — 浏览器内 Piper TTS 引擎（自包含 ESM，无 bundler 依赖）
   前置：<script src="tts-engine/ort.wasm.min.js">（onnxruntime-web UMD → window.ort）
   模型：Piper VITS onnx（美音女声 en_US-kristin-medium，int8） */
import { createPiperPhonemize } from './piper-phonemize.js';

const PiperTTS = {
  ready: false,
  session: null,
  config: null,
  paths: null,

  /* opts: { modelUrl, modelJsonUrl, phonemizeWasm, phonemizeData, ortWasmDir } */
  async init(opts) {
    this.paths = opts;
    if (!window.ort) throw new Error('onnxruntime not loaded');
    // 单线程 SIMD：避免 SharedArrayBuffer 的跨域隔离要求（WebView 无法设置 COOP/COEP）
    window.ort.env.wasm.numThreads = 1;
    window.ort.env.wasm.wasmPaths = opts.ortWasmDir;

    const cfgRes = await fetch(opts.modelJsonUrl);
    if (!cfgRes.ok) throw new Error('model config fetch failed ' + cfgRes.status);
    this.config = await cfgRes.json();

    const modelRes = await fetch(opts.modelUrl);
    if (!modelRes.ok) throw new Error('model fetch failed ' + modelRes.status);
    this.session = await window.ort.InferenceSession.create(await modelRes.arrayBuffer());
    this.ready = true;
    return this;
  },

  /* 合成：返回 { samples: Float32Array, sampleRate } */
  async synthesize(text, speed = 1.0) {
    if (!this.ready) return null;
    const input = JSON.stringify([{ text: text.trim() }]);
    const phonemeIds = await new Promise((resolve, reject) => {
      try {
        createPiperPhonemize({
          print: (data) => {
            try { resolve(JSON.parse(data).phoneme_ids); }
            catch (e) { reject(new Error('phonemize parse: ' + e.message)); }
          },
          printErr: (msg) => { reject(new Error('phonemize: ' + msg)); },
          locateFile: (url) => {
            if (url.endsWith('.wasm')) return this.paths.phonemizeWasm;
            if (url.endsWith('.data')) return this.paths.phonemizeData;
            return url;
          },
        }).then((module) => {
          module.callMain(['-l', this.config.espeak.voice, '--input', input, '--espeak_data', '/espeak-ng-data']);
        }).catch((e) => reject(new Error('phonemize init: ' + e.message)));
      } catch (e) {
        reject(new Error('phonemize setup: ' + e.message));
      }
    });

    const sampleRate = this.config.audio.sample_rate;
    const noiseScale = this.config.inference.noise_scale;
    const baseLength = this.config.inference.length_scale || 1.0;
    const noiseW = this.config.inference.noise_w;
    // speed > 1 更快 → lengthScale 更小
    const lengthScale = baseLength / Math.max(0.4, speed);

    const feeds = {
      input: new window.ort.Tensor('int64', phonemeIds, [1, phonemeIds.length]),
      input_lengths: new window.ort.Tensor('int64', [phonemeIds.length]),
      scales: new window.ort.Tensor('float32', [noiseScale, lengthScale, noiseW]),
    };
    if (Object.keys(this.config.speaker_id_map || {}).length) {
      feeds.sid = new window.ort.Tensor('int64', [0]);
    }
    const { output: { data: pcm } } = await this.session.run(feeds);
    return { samples: pcm, sampleRate };
  },
};

export default PiperTTS;
window.PiperTTS = PiperTTS;
