/* WordGrove 网页版 Service Worker——缓存静态资源，离线可用 + 添加到主屏幕体验 */
const CACHE = 'wordgrove-v1';
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
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res.ok && url.pathname.includes('/icons/')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
