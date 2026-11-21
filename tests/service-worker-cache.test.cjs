const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');

function workerHarness(fetchImpl) {
  const handlers = new Map();
  const writes = [];
  const cache = {
    async match() { return undefined; },
    async put(request) { writes.push(new URL(request.url).pathname); },
  };
  const self = { location: { origin: 'http://127.0.0.1:3000' }, addEventListener(name, callback) { handlers.set(name, callback); }, skipWaiting: async () => {}, clients: { claim: async () => {} } };
  const caches = { open: async () => cache, keys: async () => [], delete: async () => true };
  vm.runInNewContext(source, { self, caches, fetch: fetchImpl, Request, Response, URL });
  return { handlers, writes };
}

async function fetchThrough(worker, request) {
  let response;
  worker.handlers.get('fetch')({ request, respondWith(promise) { response = promise; } });
  return response;
}

const navigationRequest = url => ({
  url,
  method: 'GET',
  headers: new Headers(),
  mode: 'navigate',
  destination: 'document',
});

test('authenticated and Supabase API reads bypass the Cache API', async () => {
  let networkCalls = 0;
  const worker = workerHarness(async () => { networkCalls += 1; return new Response('private', { status: 200 }); });
  const withToken = await fetchThrough(worker, new Request('http://127.0.0.1:3000/private', { headers: { authorization: 'Bearer synthetic-token' } }));
  const authRoute = await fetchThrough(worker, new Request('http://127.0.0.1:3000/auth/v1/user'));
  const restRoute = await fetchThrough(worker, new Request('http://127.0.0.1:3000/rest/v1/user_profiles'));
  assert.equal(withToken.status, 200);
  assert.equal(authRoute.status, 200);
  assert.equal(restRoute.status, 200);
  assert.equal(networkCalls, 3);
  assert.deepEqual(worker.writes, []);
});

test('staff herdbook is not served from or written to the offline cache', async () => {
  const worker = workerHarness(async () => { throw new Error('offline'); });
  const response = await fetchThrough(worker, navigationRequest('http://127.0.0.1:3000/herdbook.html'));
  assert.equal(response.status, 503);
  assert.deepEqual(worker.writes, []);
  assert.doesNotMatch(source, /['"]\.\/herdbook\.html['"]/);
});

test('safe public navigation and static code continue to use normal caching', async () => {
  const worker = workerHarness(async request => new Response(`public:${new URL(request.url).pathname}`, { status: 200 }));
  const response = await fetchThrough(worker, navigationRequest('http://127.0.0.1:3000/about-us.html'));
  assert.equal(response.status, 200);
  assert.deepEqual(worker.writes, ['/about-us.html']);
});
