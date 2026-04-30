const CACHE_NAME = 'fcp-runtime-v3';
const APP_SHELL = ['./', './index.html', './manifest.json', './logo.png'];

self.addEventListener('install', e => {
  /* 앱 셸만 사전 캐시. 외부 CDN은 install에 포함하지 않음 (한 곳 실패 시 등록 자체 실패 방지) */
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL).catch(err => {
      console.warn('[SW] precache partial fail:', err);
    }))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* 같은 출처(자가 자원): 네트워크 우선 → 캐시 폴백 → 성공 시 캐시 갱신
     수정한 index.html / sw.js / 기타 자가 파일이 즉시 반영됨 */
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  /* 외부 CDN(React, Babel, Firebase, Pretendard 등): 캐시 우선 → 없으면 네트워크 */
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone)).catch(() => {});
        return res;
      });
    })
  );
});
