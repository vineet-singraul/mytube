// Minimal service worker — koi offline caching nahi karta (videos/API hamesha
// taaza chahiye), lekin iski maujoodgi hi Chrome ko "Install app" / home-screen
// prompt dikhane deti hai.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
