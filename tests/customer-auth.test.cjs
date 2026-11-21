const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'JS', 'customer-auth.js'), 'utf8');

function makeAuthHarness({ configured = true, remember = true, key = 'sb_publishable_test', signInError = null, signUpError = null } = {}) {
  const calls = [];
  const profileByUser = new Map();
  const user = { id: 'fixture-customer-a', email: 'customer-a@example.test', created_at: '2026-01-01T00:00:00Z', user_metadata: { display_name: 'A Customer', phone: '0712345678' } };
  let session = { user, access_token: 'synthetic-token' };
  let onAuthChange;
  const localValues = new Map();
  const sessionValues = new Map();
  const storage = values => ({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) });
  const rememberControl = { checked: remember, addEventListener(type, callback) { if (type === 'change') this.onChange = callback; } };

  const client = {
    auth: {
      onAuthStateChange(callback) { onAuthChange = callback; return { data: { subscription: { unsubscribe() {} } } }; },
      async getSession() { return { data: { session }, error: null }; },
      async signInWithPassword(payload) { calls.push(['signInWithPassword', payload]); return { data: { user, session }, error: signInError }; },
      async signUp(payload) { calls.push(['signUp', payload]); return { data: { user, session: null }, error: signUpError }; },
      async resetPasswordForEmail(email, options) { calls.push(['resetPasswordForEmail', email, options]); return { data: {}, error: null }; },
      async updateUser(payload) { calls.push(['updateUser', payload]); return { data: { user }, error: null }; },
      async signOut(options) { calls.push(['signOut', options]); session = null; onAuthChange?.('SIGNED_OUT', null); return { error: null }; },
    },
    from(table) {
      const query = { table, operation: 'select', values: null, filter: null };
      const builder = {
        select(columns) { query.columns = columns; return builder; },
        eq(column, value) { query.filter = [column, value]; return builder; },
        maybeSingle: async () => ({ data: profileByUser.get(query.filter?.[1]) || null, error: null }),
        single: async () => {
          calls.push([query.operation, table, query.values, query.filter]);
          if (query.operation === 'insert') {
            const row = { ...query.values, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' };
            profileByUser.set(row.user_id, row);
            return { data: row, error: null };
          }
          if (query.operation === 'update') {
            const prior = profileByUser.get(query.filter?.[1]);
            if (!prior) return { data: null, error: new Error('No row') };
            const row = { ...prior, ...query.values };
            profileByUser.set(row.user_id, row);
            return { data: row, error: null };
          }
          return { data: null, error: null };
        },
        insert(values) { query.operation = 'insert'; query.values = values; return builder; },
        update(values) { query.operation = 'update'; query.values = values; return builder; },
      };
      return builder;
    },
  };

  const window = {
    MARKS_SUPABASE_CONFIG: configured ? { url: 'http://127.0.0.1:55421', anonKey: key } : {},
    supabase: { createClient(url, key, options) { calls.push(['createClient', url, key, options]); return client; } },
    location: { href: 'http://127.0.0.1:3000/sign-in.html' },
    localStorage: storage(localValues),
    sessionStorage: storage(sessionValues),
    setTimeout(callback) { callback(); },
    dispatchEvent() {},
  };
  const document = { documentElement: { classList: { contains: () => false } }, getElementById: () => null, querySelector: selector => selector.includes('remember') || selector.includes('rememberMe') ? rememberControl : null, querySelectorAll: selector => selector.includes('remember') || selector.includes('rememberMe') ? [rememberControl] : [] };
  const context = { window, document, URL, URLSearchParams, CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail; } }, console };
  vm.runInNewContext(source, context, { filename: 'customer-auth.js' });
  return { auth: window.MarksFarmAuth, calls, profileByUser, user, localValues, sessionValues, getSession: () => session, rememberControl };
}

test('restores only the authenticated user profile and scopes it to the Supabase user ID', async () => {
  const h = makeAuthHarness();
  await h.auth.ready;
  assert.equal(h.auth.getUser().id, h.user.id);
  assert.equal(h.auth.getProfile().user_id, h.user.id);
  const insert = h.calls.find(call => call[0] === 'insert');
  assert.equal(insert[1], 'user_profiles');
  assert.equal(insert[2].user_id, h.user.id);
});

test('uses Supabase password auth, confirmed signup callback, and recovery routes', async () => {
  const h = makeAuthHarness();
  await h.auth.ready;
  await h.auth.signIn('customer-a@example.test', 'not-a-real-password');
  await h.auth.signUp({ email: 'new@example.test', password: 'ValidPass!1', displayName: 'New Customer', phone: '0700000000' });
  await h.auth.requestPasswordReset('new@example.test');
  const signUp = h.calls.find(call => call[0] === 'signUp')[1];
  assert.equal(signUp.options.emailRedirectTo, 'http://127.0.0.1:3000/sign-in.html?auth=confirmed');
  assert.equal(signUp.options.data.display_name, 'New Customer');
  assert.equal(h.calls.find(call => call[0] === 'resetPasswordForEmail')[2].redirectTo, 'http://127.0.0.1:3000/sign-in.html?auth=recovery');
  const options = h.calls.find(call => call[0] === 'createClient')[3].auth;
  assert.equal(options.flowType, 'pkce');
  assert.equal(options.autoRefreshToken, true);
  assert.equal(options.persistSession, true);
});

test('surfaces failed registration and incorrect credential responses', async () => {
  const h = makeAuthHarness({ signInError: new Error('Invalid login credentials'), signUpError: new Error('Password too weak') });
  await h.auth.ready;
  await assert.rejects(h.auth.signIn('customer-a@example.test', 'wrong'), /Invalid login credentials/);
  await assert.rejects(h.auth.signUp({ email:'new@example.test', password:'weak', displayName:'New', phone:'0700000000' }), /Password too weak/);
});

test('profile updates never accept a caller-supplied user ID or role', async () => {
  const h = makeAuthHarness();
  await h.auth.ready;
  await h.auth.saveProfile('Changed Name', '0711111111');
  const update = h.calls.find(call => call[0] === 'update');
  assert.deepEqual(Object.keys(update[2]).sort(), ['display_name', 'phone']);
  assert.deepEqual(update[3], ['user_id', h.user.id]);
});

test('updates password and signs out only the local Supabase session', async () => {
  const h = makeAuthHarness();
  await h.auth.ready;
  await h.auth.updatePassword('ValidPass!1');
  await h.auth.signOut();
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls.find(call => call[0] === 'updateUser')[1])), { password: 'ValidPass!1' });
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls.find(call => call[0] === 'signOut')[1])), { scope: 'local' });
  assert.equal(h.auth.getUser(), null);
});

test('fails closed when local Supabase config is missing', async () => {
  const h = makeAuthHarness({ configured: false });
  await h.auth.ready;
  assert.equal(h.auth.getUser(), null);
  await assert.rejects(h.auth.signIn('legacy@example.test', 'old-device-password'), /publishable\/anon key/);
});

test('fails closed with an invalid local publishable key', async () => {
  const h = makeAuthHarness({ key: 'not-a-public-key' });
  await h.auth.ready;
  assert.equal(h.auth.isConfigured(), false);
  assert.match(h.auth.getConfigurationMessage(), /invalid/);
  await assert.rejects(h.auth.signIn('customer-a@example.test', 'password'), /configuration is invalid/);
});

test('remember choice stores the Supabase session in the selected browser storage only', async () => {
  const h = makeAuthHarness({ remember: false });
  await h.auth.ready;
  const storage = h.calls.find(call => call[0] === 'createClient')[3].auth.storage;
  storage.setItem('session-key', 'token');
  assert.equal(h.sessionValues.get('session-key'), 'token');
  assert.equal(h.localValues.has('session-key'), false);
  h.rememberControl.checked = true;
  h.rememberControl.onChange();
  storage.setItem('session-key', 'refreshed-token');
  assert.equal(h.localValues.get('session-key'), 'refreshed-token');
  assert.equal(h.sessionValues.has('session-key'), false);
});
