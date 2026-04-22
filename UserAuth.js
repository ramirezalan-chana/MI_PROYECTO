const UserAuth = (() => {
  const STORAGE_KEY = 'sk_user_store';
  const LEGACY_KEY = 'sk_user';
  const PROMO_HEIGHT = 38;
  const USER_PAGE = 'Usuario.html';

  function getStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return normalizeStore(parsed);
      }

      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (legacyRaw) {
        const legacyUser = JSON.parse(legacyRaw);
        const migrated = normalizeStore({
          accounts: legacyUser && legacyUser.email ? [legacyUser] : [],
          currentEmail: legacyUser && legacyUser.authenticated ? legacyUser.email : null
        });
        saveStore(migrated);
        localStorage.removeItem(LEGACY_KEY);
        return migrated;
      }
    } catch {
      // ignore and fall through
    }

    return normalizeStore();
  }

  function normalizeStore(store = {}) {
    const accounts = Array.isArray(store.accounts) ? store.accounts : [];
    return {
      accounts: accounts
        .filter(account => account && account.email)
        .map(account => ({
          name: account.name || 'Usuario',
          email: String(account.email).trim().toLowerCase(),
          password: account.password || '',
          street: account.street || '',
          city: account.city || '',
          postalCode: account.postalCode || '',
          country: account.country || '',
          authenticated: Boolean(account.authenticated),
          rememberCredentials: Boolean(account.rememberCredentials),
          credentialsPromptHandled: Boolean(account.credentialsPromptHandled)
        })),
      currentEmail: store.currentEmail ? String(store.currentEmail).trim().toLowerCase() : null
    };
  }

  function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStore(store)));
  }

  function findAccount(email) {
    const store = getStore();
    return store.accounts.find(account => account.email === String(email).trim().toLowerCase()) || null;
  }

  function updateAccount(updatedAccount, currentEmail = updatedAccount.email) {
    const store = getStore();
    const nextAccounts = store.accounts.filter(account => account.email !== updatedAccount.email);
    nextAccounts.push(updatedAccount);
    saveStore({ accounts: nextAccounts, currentEmail });
    return updatedAccount;
  }

  function getUser() {
    const store = getStore();
    if (!store.currentEmail) return null;
    return store.accounts.find(account => account.email === store.currentEmail) || null;
  }

  function getSavedAccounts() {
    const store = getStore();
    return store.accounts.map(account => ({
      email: account.email,
      name: account.name || 'Usuario',
      location: [account.city, account.country].filter(Boolean).join(', '),
      lastUsed: store.currentEmail === account.email,
      rememberCredentials: account.rememberCredentials,
      password: account.rememberCredentials ? account.password : ''
    }));
  }

  function isAuthenticated() {
    const user = getUser();
    return Boolean(user && user.authenticated);
  }

  function logout() {
    const user = getUser();
    if (!user) return;

    const updatedUser = { ...user, authenticated: false };
    updateAccount(updatedUser, null);
    refreshUserUI();
  }

  function login(email, password) {
    const account = findAccount(email);
    if (!account) {
      const quickUser = {
        name: 'Usuario',
        email: String(email).trim().toLowerCase(),
        password,
        street: '',
        city: '',
        postalCode: '',
        country: '',
        authenticated: true,
        rememberCredentials: false,
        credentialsPromptHandled: false
      };

      updateAccount(quickUser, quickUser.email);
      refreshUserUI();
      return {
        ok: true,
        user: quickUser,
        shouldPromptCredentials: true,
        isQuickAccount: true
      };
    }

    if (account.password !== password) {
      return { ok: false, message: 'Correo o contrasena incorrectos.' };
    }

    const updatedUser = { ...account, authenticated: true };
    updateAccount(updatedUser, updatedUser.email);
    refreshUserUI();
    return {
      ok: true,
      user: updatedUser,
      shouldPromptCredentials: !updatedUser.credentialsPromptHandled
    };
  }

  function register(data, options = {}) {
    const rememberCredentials = Boolean(options.rememberCredentials);
    const email = data.email.trim().toLowerCase();

    const updatedUser = {
      name: data.name.trim(),
      email,
      password: data.password,
      street: data.street.trim(),
      city: data.city.trim(),
      postalCode: data.postalCode.trim(),
      country: data.country.trim(),
      authenticated: true,
      rememberCredentials,
      credentialsPromptHandled: false
    };

    updateAccount(updatedUser, email);
    refreshUserUI();
    return { ok: true, user: updatedUser };
  }

  function updateCredentialPreference(originalEmail, updates = {}, rememberCredentials = false) {
    const account = findAccount(originalEmail);
    if (!account) return { ok: false, message: 'No se encontro la cuenta.' };

    const nextEmail = (updates.email || account.email).trim().toLowerCase();
    const updatedUser = {
      ...account,
      email: nextEmail,
      password: updates.password || account.password,
      rememberCredentials: Boolean(rememberCredentials),
      credentialsPromptHandled: true
    };

    const store = getStore();
    const nextAccounts = store.accounts.filter(item => item.email !== account.email && item.email !== nextEmail);
    nextAccounts.push(updatedUser);
    saveStore({
      accounts: nextAccounts,
      currentEmail: store.currentEmail === account.email ? nextEmail : store.currentEmail
    });
    refreshUserUI();
    return { ok: true, user: updatedUser };
  }

  function ensureShell() {
    injectPromoBar();
    document.body.classList.add('has-promo-bar');
    document.body.style.setProperty('--promo-height', `${PROMO_HEIGHT}px`);
    sanitizeSearchFields();
  }

  function injectPromoBar() {
    if (document.getElementById('topPromoBar')) return;
    const bar = document.createElement('div');
    bar.id = 'topPromoBar';
    bar.className = 'top-promo-bar';
    bar.innerHTML = `
      <span>Envios gratis - <a href="#" data-open-user>ingresa aqui</a></span>
    `;
    document.body.prepend(bar);
  }

  function bindEvents() {
    document.querySelectorAll('[aria-label="Usuario"]').forEach(btn => {
      btn.type = 'button';
      btn.addEventListener('click', openUserPage);
    });

    document.querySelectorAll('[data-open-user]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        openUserPage();
      });
    });
  }

  function refreshUserUI() {
    const user = getUser();
    document.querySelectorAll('[aria-label="Usuario"]').forEach(btn => {
      btn.title = isAuthenticated() ? `Sesion activa: ${user.email}` : 'Ir a usuario';
    });
  }

  function sanitizeSearchFields() {
    const selectors = [
      '.search-bar input',
      '.mobile-search input',
      'input[type="search"]'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(input => {
      if (!input || input.closest('.usuario-auth-page')) return;

      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'none');
      input.setAttribute('spellcheck', 'false');

      if (document.activeElement !== input) {
        input.value = '';
      }
    });

    window.addEventListener('pageshow', () => {
      document.querySelectorAll(selectors.join(',')).forEach(input => {
        if (!input || input.closest('.usuario-auth-page')) return;
        if (document.activeElement !== input) {
          input.value = '';
        }
      });
    });
  }

  function openUserPage() {
    window.location.href = USER_PAGE;
  }

  function init() {
    ensureShell();
    bindEvents();
    refreshUserUI();
  }

  return {
    init,
    getUser,
    getSavedAccounts,
    isAuthenticated,
    logout,
    openUserPage,
    login,
    register,
    updateCredentialPreference
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  UserAuth.init();
});
