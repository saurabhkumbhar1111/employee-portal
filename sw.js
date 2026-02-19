// Force new versions so devices always update
const SW_VERSION = "v100-" + Date.now();
const FORCE_CLEAR_VERSION = "clear-cache-v1";

importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyDt4mOvMltx0V7Ujs98t8jHgvu8pyzNyH4",
    authDomain: "empportal-c733f.firebaseapp.com",
    projectId: "empportal-c733f",
    storageBucket: "empportal-c733f.firebasestorage.app",
    messagingSenderId: "702851978485",
    appId: "1:702851978485:web:e360d3ef51cbeeb2e761bc",
});

const messaging = firebase.messaging();

self.addEventListener('push', function (event) {
  if (!event.data) return;

  const payload = event.data.json().data;

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/LDL_logo.png",
      data: payload
    })
  );
});


self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
            await self.clients.claim();
        })()
    );
});

self.addEventListener("fetch", (event) => {

    // Never cache sw.js
    if (event.request.url.includes("sw.js")) {
        event.respondWith(fetch(event.request, { cache: "no-store" }));
        return;
    }

    // Always fetch latest files
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = '/index.html?page=' + (data.page || 'home');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes('index.html') && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: data
            });
            return client.focus();
          }
        }

        return clients.openWindow(targetUrl);
      })
  );
});

