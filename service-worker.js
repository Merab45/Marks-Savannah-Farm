// Change this value whenever a site update should replace the cached files.
const CACHE = 'marks-savannah-farm-v149';

// These core pages and assets remain available when the visitor is offline.
const FILES = [
  './',
  './index.html',
  './about-us.html',
  './contact.html',
  './terms-and-conditions.html',
  './privacy-policy.html',
  './gallery.html',
  './blog.html',
  './app.html',
  './products-and-services.html',
  './shop.html',
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
  './CSS/site.css?v=113',
  './CSS/site.css?v=114',
  './CSS/site.css?v=115',
  './CSS/site.css?v=116',
  './CSS/site.css?v=117',
  './CSS/site.css?v=118',
  './CSS/site.css?v=119',
  './CSS/site.css?v=120',
  './CSS/site.css?v=121',
  './CSS/site.css?v=122',
  './CSS/site.css?v=123',
  './CSS/site.css?v=124',
  './CSS/site.css?v=125',
  './CSS/site.css?v=126',
  './CSS/site.css?v=127',
  './CSS/site.css?v=128',
  './CSS/site.css?v=129',
  './CSS/site.css?v=130',
  './CSS/site.css?v=131',
  './CSS/site.css?v=132',
  './CSS/site.css?v=133',
  './CSS/site.css?v=134',
  './JS/site.js',
  './JS/site.js?v=86',
  './JS/site.js?v=87',
  './JS/site.js?v=88',
  './JS/site.js?v=89',
  './JS/site.js?v=90',
  './JS/site.js?v=91',
  './JS/site.js?v=92',
  './JS/site.js?v=93',
  './JS/site.js?v=94',
  './JS/site.js?v=95',
  './JS/site.js?v=96',
  './JS/site.js?v=97',
  './JS/site.js?v=98',
  './JS/site.js?v=99',
  './JS/site.js?v=100',
  './JS/site.js?v=101',
  './JS/farm-home.js',
  './JS/farm-home.js?v=1',
  './JS/farm-home.js?v=2',
  './JS/farm-home.js?v=3',
  './JS/farm-home.js?v=4',
  './JS/farm-home.js?v=5',
  './JS/farm-home.js?v=6',
  './JS/farm-home.js?v=7',
  './JS/commerce.js?v=1',
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
  // Add files one by one so a single missing file can never block an update.
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(FILES.map(file => cache.add(file)))));
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

  // Code (JS, CSS, manifest) always tries the network first so updates are never stuck behind old cached copies.
  if (/\.(js|css|webmanifest)$/.test(new URL(request.url).pathname)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true })),
    );
    return;
  }

  // Images and other static files use the cache first, then save successful network responses.
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
