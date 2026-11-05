// Change this value whenever a site update should replace the cached files.
const CACHE = 'marks-savannah-farm-v123';

// These core pages and assets remain available when the visitor is offline.
const FILES = [
  './',
  './index.html',
  './about-us.html',
  './contact.html',
  './gallery.html',
  './blog.html',
  './app.html',
  './products-and-services.html',
  './herdbook.html',
  './sign-in.html',
  './create-account.html',
  './customer-account.html',
  './CSS/site.css',
  './CSS/site.css?v=107',
  './CSS/site.css?v=108',
  './CSS/site.css?v=109',
  './CSS/site.css?v=110',
  './CSS/site.css?v=111',
  './CSS/site.css?v=112',
  './JS/site.js',
  './JS/site.js?v=86',
  './JS/site.js?v=87',
  './JS/site.js?v=88',
  './JS/site.js?v=89',
  './JS/site.js?v=90',
  './manifest.webmanifest',
  './Assets/login page background.png',
  './Assets/Splash Screen.png',
  './Assets/Onboarding.png',
  './Assets/Onboarding.jpg',
  './Assets/Farmer Checking Phone at Savannah Farm onboarding.png',
  './Assets/Hero background.png',
  './Assets/About us Image.jpg',
  './Assets/About us.png',
  './Assets/product and services.png',
  './Assets/Our Story.jpg',
  './Assets/Mark’s Savannah contact.png',
  './Assets/marks-savannah-farm-logo.svg',
  './Assets/Mark’s Savannah Farm Logo.png',
  './Assets/Marks Savannah Farm Logo 2.png',
  './Assets/farm-icon.svg',
  './Assets/Glossy Green Agriculture Emblem.png',
  './Assets/Cattle dropdown.jpg',
  './Assets/Crops.jpg',
  './Assets/Dairy Products.jpg',
  './Assets/Farm Equipments.jpg',
  './Assets/Agri-Consultancy.jpg',
  './Assets/Turkeys.jpg',
  './Assets/poultry Frming.jpg',
  './Assets/Goats.jpg',
  './Assets/Sheep.jpg',
  './Assets/Pigs.jpg',
  './Assets/placeholder-about-banner.svg',
  './Assets/placeholder-about-story.svg',
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
        .catch(() => caches.match(request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))),
    );
    return;
  }

  // Static files use the cache first, then save successful network responses.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(
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
