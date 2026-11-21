/*
 * Customer authentication for the public site and installable customer app.
 * This module never treats legacy localStorage identities as authenticated.
 */
(() => {
  const config = window.MARKS_SUPABASE_CONFIG || {};
  const sdk = window.supabase;
  let client = null;
  let session = null;
  let profile = null;
  let configurationError = 'Supabase is not configured. Set the local publishable/anon key in JS/supabase-config.js.';
  const rememberControl = document.querySelector('#app-sign-in [name="remember"], #rememberMe');
  let keepSignedIn = rememberControl ? rememberControl.checked : true;
  const sessionStorage = {
    getItem(key) { return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key); },
    setItem(key, value) {
      const target = keepSignedIn ? window.localStorage : window.sessionStorage;
      const other = keepSignedIn ? window.sessionStorage : window.localStorage;
      target.setItem(key, value);
      other.removeItem(key);
    },
    removeItem(key) { window.sessionStorage.removeItem(key); window.localStorage.removeItem(key); },
  };
  let readyResolve;
  const ready = new Promise(resolve => { readyResolve = resolve; });

  try {
    if (!config.url || !config.anonKey || /YOUR_|PLACEHOLDER/i.test(config.anonKey)) throw new Error('missing configuration');
    const serviceUrl = new URL(config.url);
    if (serviceUrl.protocol !== 'http:' || serviceUrl.hostname !== '127.0.0.1' || serviceUrl.port !== '55421') throw new Error('non-local service URL');
    if (!(config.anonKey.startsWith('sb_publishable_') || config.anonKey.startsWith('eyJ'))) throw new Error('invalid public key format');
    if (!sdk?.createClient) throw new Error('client library unavailable');
    client = sdk.createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
        storage: sessionStorage,
        storageKey: 'marks-savannah-farm-customer-auth',
      },
    });
    configurationError = '';
  } catch {
    configurationError = sdk?.createClient
      ? 'Local Supabase configuration is invalid. Check the URL and publishable/anon key in JS/supabase-config.js.'
      : 'The Supabase client library could not load. Check the network connection and reload.';
  }

  const authError = message => new Error(message);
  const requireClient = () => {
    if (!client) throw authError(configurationError || 'Online sign-in is unavailable.');
    return client;
  };

  async function loadOwnProfile(user) {
    profile = null;
    if (!user || !client) return null;
    // Scope reads and writes to the ID returned by Supabase Auth, never a URL or form field.
    const { data, error } = await client.from('user_profiles')
      .select('user_id, display_name, phone, preferred_language, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      profile = data;
      return profile;
    }
    const metadata = user.user_metadata || {};
    const firstProfile = {
      user_id: user.id,
      display_name: String(metadata.display_name || '').slice(0, 120),
      phone: String(metadata.phone || '').slice(0, 20),
    };
    const inserted = await client.from('user_profiles')
      .insert(firstProfile)
      .select('user_id, display_name, phone, preferred_language, created_at, updated_at')
      .single();
    if (inserted.error?.code === '23505') {
      const raced = await client.from('user_profiles')
        .select('user_id, display_name, phone, preferred_language, created_at, updated_at')
        .eq('user_id', user.id)
        .single();
      if (raced.error) throw raced.error;
      profile = raced.data;
      return profile;
    }
    if (inserted.error) throw inserted.error;
    profile = inserted.data;
    return profile;
  }

  async function refresh() {
    if (!client) {
      session = null;
      profile = null;
      readyResolve(null);
      return null;
    }
    const result = await client.auth.getSession();
    if (result.error) throw result.error;
    session = result.data.session;
    if (session?.user) await loadOwnProfile(session.user);
    else profile = null;
    readyResolve(session);
    return session;
  }

  const api = {
    client: () => requireClient(),
    ready,
    getSession: () => session,
    getUser: () => session?.user || null,
    getProfile: () => profile,
    isConfigured: () => Boolean(client),
    getConfigurationMessage: () => configurationError,
    async signIn(email, password) {
      const result = await requireClient().auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      session = result.data.session;
      await loadOwnProfile(result.data.user);
      return result.data;
    },
    async signUp({ email, password, displayName, phone }) {
      const callbackPage = document.documentElement.classList.contains('android-app') ? 'app.html?auth=confirmed' : 'sign-in.html?auth=confirmed';
      const redirectTo = new URL(callbackPage, window.location.href).href;
      const result = await requireClient().auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectTo, data: { display_name: displayName, phone } },
      });
      if (result.error) throw result.error;
      session = result.data.session;
      if (session?.user) await loadOwnProfile(session.user);
      return result.data;
    },
    async requestPasswordReset(email) {
      const callbackPage = document.documentElement.classList.contains('android-app') ? 'app.html?auth=recovery' : 'sign-in.html?auth=recovery';
      const redirectTo = new URL(callbackPage, window.location.href).href;
      const result = await requireClient().auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (result.error) throw result.error;
      return result;
    },
    async updatePassword(password) {
      const result = await requireClient().auth.updateUser({ password });
      if (result.error) throw result.error;
      session = (await requireClient().auth.getSession()).data.session;
      return result.data;
    },
    async saveProfile(displayName, phone) {
      const user = session?.user;
      if (!user) throw authError('Your session has expired. Sign in again to update your details.');
      const row = { display_name: displayName.trim().slice(0, 120), phone: phone.trim().slice(0, 20) };
      // Keep UPDATE within the existing column grants; user_id and roles are immutable here.
      const result = await requireClient().from('user_profiles')
        .update(row)
        .eq('user_id', user.id)
        .select('user_id, display_name, phone, preferred_language, created_at, updated_at')
        .single();
      if (result.error) throw result.error;
      profile = result.data;
      return profile;
    },
    async signOut() {
      if (!client) return;
      const result = await client.auth.signOut({ scope: 'local' });
      if (result.error) throw result.error;
      session = null;
      profile = null;
    },
  };

  window.MarksFarmAuth = Object.freeze(api);
  document.querySelectorAll('#app-sign-in [name="remember"], #rememberMe').forEach(control => {
    control.addEventListener('change', () => { keepSignedIn = control.checked; });
  });

  if (!client) {
    readyResolve(null);
  } else {
    client.auth.onAuthStateChange((event, nextSession) => {
      const previousUserId = session?.user?.id || null;
      session = nextSession;
      if (previousUserId !== (nextSession?.user?.id || null)) profile = null;
      if (!nextSession || event === 'SIGNED_OUT' || event === 'USER_DELETED') profile = null;
      // Avoid awaiting Supabase calls from inside the auth event callback.
      if (nextSession?.user && event === 'SIGNED_IN') window.setTimeout(() => loadOwnProfile(nextSession.user).catch(error => {
        window.dispatchEvent(new CustomEvent('marks-auth-error', { detail: error.message }));
      }), 0);
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        readyResolve(nextSession);
        window.dispatchEvent(new CustomEvent('marks-auth-state', { detail: { event, user: nextSession?.user || null, previousUserId } }));
      }
    });
    refresh().catch(error => {
      readyResolve(null);
      window.dispatchEvent(new CustomEvent('marks-auth-error', { detail: error.message }));
    });
  }

  // Attach the standalone website forms as well as the phone app forms.
  const loginForm = document.getElementById('login');
  if (loginForm) {
    document.getElementById('year').textContent = new Date().getFullYear();
    const errorNode = document.getElementById('error');
    const statusNode = document.getElementById('authStatus');
    const recoveryPage = new URLSearchParams(location.search).get('auth') === 'recovery';
    const confirmedPage = new URLSearchParams(location.search).get('auth') === 'confirmed';
    const newPasswordForm = document.getElementById('newPasswordForm');
    if (recoveryPage) { loginForm.hidden = true; newPasswordForm.hidden = false; }
    api.ready.then(currentSession => {
      if (confirmedPage && currentSession?.user) statusNode.textContent = 'Email confirmed. Your account is ready; sign in to continue.';
      if (recoveryPage && !currentSession?.user) document.getElementById('newPasswordError').textContent = 'This reset link is invalid or expired. Request a new link.';
    });
    if (!api.isConfigured()) statusNode.textContent = api.getConfigurationMessage();
    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      errorNode.textContent = '';
      statusNode.textContent = '';
      const button = loginForm.querySelector('[type="submit"]');
      button.disabled = true;
      try {
        await api.signIn(document.getElementById('email').value, document.getElementById('password').value);
        location.assign('customer-account.html');
      } catch (error) {
        errorNode.textContent = error.message || 'Sign-in failed. Check your details and try again.';
        errorNode.classList.add('show');
      } finally { button.disabled = false; }
    });
    document.getElementById('togglePassword')?.addEventListener('click', () => {
      const field = document.getElementById('password');
      const show = field.type === 'password';
      field.type = show ? 'text' : 'password';
      document.getElementById('togglePassword').textContent = show ? 'Hide' : 'Show';
      document.getElementById('togglePassword').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
    const resetForm = document.getElementById('passwordReset');
    document.getElementById('forgotPassword')?.addEventListener('click', () => {
      resetForm.hidden = false;
      loginForm.hidden = true;
      document.getElementById('resetEmail').value = document.getElementById('email').value;
    });
    document.getElementById('cancelReset')?.addEventListener('click', () => { resetForm.hidden = true; loginForm.hidden = false; });
    resetForm?.addEventListener('submit', async event => {
      event.preventDefault();
      const error = document.getElementById('resetError');
      const status = document.getElementById('resetStatus');
      error.textContent = ''; status.textContent = '';
      const button = resetForm.querySelector('[type="submit"]'); button.disabled = true;
      try {
        await api.requestPasswordReset(document.getElementById('resetEmail').value);
        status.textContent = 'If that email is registered, a password reset link has been sent.';
      } catch (failure) { error.textContent = failure.message || 'Could not send a reset link.'; error.classList.add('show'); }
      finally { button.disabled = false; }
    });
    newPasswordForm?.addEventListener('submit', async event => {
      event.preventDefault();
      const password = document.getElementById('newPassword').value;
      const error = document.getElementById('newPasswordError');
      if (password !== document.getElementById('confirmNewPassword').value) { error.textContent = 'Those passwords do not match.'; error.classList.add('show'); return; }
      const button = newPasswordForm.querySelector('[type="submit"]'); button.disabled = true; error.textContent = '';
      try {
        await api.updatePassword(password);
        statusNode.textContent = 'Password updated. You can now sign in.';
        newPasswordForm.hidden = true; loginForm.hidden = false;
        history.replaceState(null, '', 'sign-in.html');
      } catch (failure) { error.textContent = failure.message || 'The reset link is invalid or expired.'; error.classList.add('show'); }
      finally { button.disabled = false; }
    });
  }

  const signupForm = document.getElementById('signup');
  if (signupForm) {
    document.getElementById('year').textContent = new Date().getFullYear();
    if (!api.isConfigured()) document.getElementById('authStatus').textContent = api.getConfigurationMessage();
    signupForm.addEventListener('submit', async event => {
      event.preventDefault();
      const error = document.getElementById('error');
      const status = document.getElementById('authStatus');
      error.textContent = ''; error.classList.remove('show'); status.textContent = '';
      const password = document.getElementById('password').value;
      if (password !== document.getElementById('confirm').value) {
        error.textContent = 'Those passwords do not match.'; error.classList.add('show'); return;
      }
      const button = signupForm.querySelector('[type="submit"]'); button.disabled = true;
      try {
        const result = await api.signUp({
          email: document.getElementById('email').value,
          password,
          displayName: document.getElementById('name').value.trim(),
          phone: document.getElementById('phone').value.trim(),
        });
        if (result.session) location.assign('customer-account.html');
        else status.textContent = 'Account created. Check your email and confirm it before signing in.';
      } catch (failure) { error.textContent = failure.message || 'Account creation failed. Check your details and try again.'; error.classList.add('show'); }
      finally { button.disabled = false; }
    });
  }

  document.querySelectorAll('[data-customer-auth-required]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('marks-auth-error', { detail: 'Please sign in to continue.' }));
    });
  });
})();
