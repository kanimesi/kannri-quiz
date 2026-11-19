// 管理会計論 一問一答 オフライン対応 Service Worker
// 戦略: cache-first（キャッシュ優先、なければネットワーク取得してキャッシュ追加）
const CACHE_NAME = 'kannri-quiz-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './imgs.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(PRECACHE_URLS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (key) {
          if (key !== CACHE_NAME) { return caches.delete(key); }
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') { return; }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) { return cached; }
      return fetch(event.request).then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      });
    })
  );
});
