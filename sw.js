// Force new versions so devices always update
const SW_VERSION = "v100-" + Date.now();
const FORCE_CLEAR_VERSION = "clear-cache-v1";
// console.log("SW Loaded:", SW_VERSION, FORCE_CLEAR_VERSION);

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

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icons/LDL_logo.png",
    });
});

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            // DELETE ALL OLD CACHES ON ALL DEVICES
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));

            // console.log("All previous caches deleted");
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
