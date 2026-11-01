// Change this value whenever a site update should replace the cached files.
const CACHE = 'marks-savannah-farm-v59';

// These core pages and assets remain available when the visitor is offline.
const FILES = [
  './',
  './index.html',
  './herdbook.html',
  './sign-in.html',
  './create-account.html',
  './customer-account.html',
  './CSS/site.css',
  './JS/site.js',
  './manifest.webmanifest',
  './Assets/login page background.png',
  './Assets/Hero background.png',
  './Assets/marks-savannah-farm-logo.svg',
  './Assets/Mark’s Savannah Farm Logo.png',
  './Assets/Marks Savannah Farm Logo 2.png',
  './Assets/farm-icon.svg',
  './Assets/Glossy Green Agriculture Emblem.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Remove older versions after this worker takes control.
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Leave non-GET requests and cross-origin assets to the browser.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    // Pages use the latest network response, with the cache as an offline fallback.
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(hit => hit || caches.match('./index.html'))),
    );
    return;
  }

  // Static files use the cache first, then save successful network responses.
  event.respondWith(
    caches.match(request).then(
      cached =>
        cached ||
        fetch(request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
