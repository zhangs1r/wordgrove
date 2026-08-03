/* WordGrove 网页版 Service Worker——离线可用 + 始终最新
   🔴 v1.2.34：缓存名升 v3 强制换血（sw.js 字节变化让已被 HTTP 缓存的旧 sw.js 也检测到更新）；
   配合 app.js 的 updateViaCache:'none' 注册 + skipWaiting/claim——发版后一次刷新即新版 */
const CACHE = 'wordgrove-v3';
const CORE = [
  './',
  './index.html',
  './css/style.css',
  './js/db.js',
  './js/farm.js',
  './js/garden-full.js',
  './js/tts.js',
  './js/api.js',
  './js/srs.js',
  './js/agent.js',
  './js/ui.js',
  './js/app.js',
  './data/cefr.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // 只处理同源 GET；API 请求（api.deepseek.com 等）不缓存不拦截
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // 🔴 v1.2.30：network-first——在线永远返回最新资源（后台顺手更新缓存），
  //   网络失败（离线）才回退缓存；彻底解决"缓存了旧版就永远不更新"
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
