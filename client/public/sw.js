// App shell (HTML/JS/CSS/icons) cache karte hain taaki Downloads page aur
// poori app bina internet ke bhi khul sake. API calls aur video downloads
// hamesha network se jaate hain — unme fresh data chahiye, cache nahi.
const STATIC_CACHE = 'mytube-static-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API aur video downloads: sirf network, kabhi cache nahi.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Page navigation (jaise /downloads, /watch/xyz direct kholna ya reload
  // karna): offline hone par app shell (index.html) se serve karo, taaki
  // client-side router isse sambhal le.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }

  // Baaki static assets: cache-first, background me refresh kar lete hain.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
