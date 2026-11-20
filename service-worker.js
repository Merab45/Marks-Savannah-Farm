// Bump the version when the local site shell changes. Old farm caches are
// retired only after this worker installs successfully and takes control.
const CACHE_PREFIX = 'marks-savannah-farm-';
const CACHE_NAME = `${CACHE_PREFIX}v155`;

// Keep the pages and code shell available offline. Large photography is
// cached on first use so the initial install does not download the full gallery.
const CORE_FILES = [
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
  './auctions.html',
  './shop.html',
  './herdbook.html',
  './sign-in.html',
  './create-account.html',
  './customer-account.html',
  './CSS/site.css',
  './JS/site.js',
  './JS/auction-core.js',
  './JS/auction-page.js',
  './JS/commerce.js',
  './JS/farm-home.js',
  './manifest.webmanifest',
  './Assets/farm-icon.svg',
  './Assets/marks-savannah-farm-logo.svg',
  './Assets/Glossy%20Green%20Agriculture%20Emblem.png',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(CORE_FILES);
      await self.skipWaiting();
    } catch (error) {
      // Do not activate a partial new shell; the previous worker stays usable.
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function cachedResponse(cache, request) {
  return cache.match(request, { ignoreSearch:true });
}

async function unavailableResponse(cache, request) {
  const cached = await cachedResponse(cache, request);
  if (cached) return cached;
  if (request.destination === 'image') {
    const imageFallback = await cache.match('./Assets/farm-icon.svg');
    if (imageFallback) return imageFallback;
  }
  return new Response('This page or asset is not available offline.', {
    status:503,
    statusText:'Service Unavailable',
    headers:{ 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' },
  });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request, { cache:'no-cache' });
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        const page = await cachedResponse(cache, request);
        if (page) return page;
        const home = await cache.match('./index.html');
        return home || unavailableResponse(cache, request);
      }
    }

    const isCode = /\.(js|css|webmanifest)$/i.test(requestUrl.pathname);
    if (isCode) {
      try {
        const response = await fetch(request, { cache:'no-cache' });
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return unavailableResponse(cache, request);
      }
    }

    const cached = await cachedResponse(cache, request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
        return response;
      }
      if (request.destination === 'image') {
        return (await cache.match('./Assets/farm-icon.svg')) || response;
      }
      return response;
    } catch {
      return unavailableResponse(cache, request);
    }
  })());
});
