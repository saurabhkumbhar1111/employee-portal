const CACHE_NAME = 'employee-portal-v5';
const DATA_CACHE_NAME = 'employee-portal-data-v5';

const urlsToCache = [
  '/', 
  '/index.html', 
  '/style.css', 
  '/app.js', 
  '/auth.js', 
  '/attendance.js', 
  '/salary.js', 
  '/manifest.json',
  '/icons/dental_lab.png',
  '/icons/dental_lab.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (response.ok) await cache.put(url, response);
        } catch (err) {
        }
      }
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

 
  if (request.url.includes('/Attendance') || request.url.includes('/Payslip')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            const cloned = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then(cache => cache.put(request, cloned));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback to cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return new Response(JSON.stringify({ error: 'Offline data not available' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }


  event.respondWith(
    caches.match(request)
      .then(cachedResponse => cachedResponse || fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html'))
      )
  );
});
