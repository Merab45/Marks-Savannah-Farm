// Farm contact details live here; links marked data-contact-* are filled in below.
const FARM_CONTACT = {
  whatsapp: '254706894568',
  phone: '+254706894568',
  phoneDisplay: '0706 894 568',
  email: 'meraprenish@gmail.com',
};
// Older Android installs may still launch the homepage saved as their start URL.
if (document.documentElement.classList.contains('page-index') && /Android/i.test(navigator.userAgent) && (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true)) {
  const appUrl = new URL('app.html', window.location.href);
  if (window.location.pathname !== appUrl.pathname) window.location.replace(appUrl.href);
}
document.querySelectorAll('[data-contact-whatsapp]').forEach(link => {
  link.href = `https://wa.me/${FARM_CONTACT.whatsapp}?text=${encodeURIComponent("Hello Mark's Savannah Farm, I have an enquiry.")}`;
});
document.querySelectorAll('[data-contact-phone]').forEach(link => { link.href = `tel:${FARM_CONTACT.phone}`; });
document.querySelectorAll('[data-contact-email]').forEach(link => { link.href = `mailto:${FARM_CONTACT.email}`; });
document.querySelectorAll('[data-farm-phone]').forEach(el => { el.textContent = FARM_CONTACT.phoneDisplay; });
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(() => {}));
}

// Copyright year for the standalone About page.
if (document.documentElement.classList.contains('page-about')) {
  const year = document.getElementById('about-year');
  if (year) year.textContent = new Date().getFullYear();
}

// Intro, onboarding and buyer account flow for the phone-first app.
if (document.documentElement.classList.contains('page-farm-app') && document.documentElement.classList.contains('android-app')) {
  (() => {
    const shell = document.getElementById('farm-app');
    const splash = document.getElementById('screen-splash');
    const onboarding = document.getElementById('screen-onboarding');
    const auth = document.getElementById('screen-auth');
    const toast = shell.querySelector('.app-toast');
    const steps = [
      {
        title: 'Discover Premium Livestock & Farm Products',
        copy: 'Buy quality cattle, goats, sheep, poultry, crops and more — all in one convenient app.',
        image: 'Assets/Onboarding.png', alt: 'Cattle, goats, and poultry at a farm', imageName: 'animals',
        benefits: ['Browse & request quotes with ease', 'Trusted quality & expert advice', 'Reliable delivery support'],
      },
      {
        title: 'Learn & Grow with Expert Guides',
        copy: 'Get practical farming tips, business guides, and advice from Mark’s Savannah Farm.',
        image: 'Assets/Onboarding.jpg', alt: 'Hands using a smartphone', imageName: 'phone',
        benefits: ['Step-by-step farm guides', 'Smart farming tips', 'Farm business planning'],
      },
      {
        title: 'Manage Your Farm Smarter',
        copy: 'Get personalized support, save your favourites, and connect with our team.',
        image: 'Assets/Farmer%20Checking%20Phone%20at%20Savannah%20Farm%20onboarding.png', alt: 'A farmer checks his phone at the farm', imageName: 'farmer',
        benefits: ['Save favourite products', 'Get help from the farm team', 'Receive farm updates'],
      },
    ];
    let currentStep = 0;
    let toastTimer;

    const showToast = message => {
      toast.textContent = message;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
    };
    const showScreen = screen => {
      [splash, onboarding, auth].forEach(item => {
        item.hidden = item !== screen;
        item.classList.toggle('is-active', item === screen);
      });
    };
    const openAuth = mode => {
      localStorage.setItem('marks-farm-app-onboarding-complete','true');
      showScreen(auth);
      setAuthMode(mode);
      window.location.hash = mode === 'sign-up' ? 'sign-up' : 'sign-in';
    };
    const googleMark = '<svg class="google-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 6.1-8.7 6.1-14.7Z"/><path fill="#34A853" d="M24 44c5.4 0 9.9-1.8 13.2-4.8l-6.5-5c-1.8 1.2-4 2-6.7 2-5.2 0-9.6-3.5-11.2-8.2H6.1v5.2C9.4 39.6 16.1 44 24 44Z"/><path fill="#FBBC05" d="M12.8 28a12 12 0 0 1 0-8v-5.2H6.1a20 20 0 0 0 0 18.4l6.7-5.2Z"/><path fill="#EA4335" d="M24 11.8c2.9 0 5.5 1 7.5 3l5.6-5.6C33.9 6 29.4 4 24 4 16.1 4 9.4 8.4 6.1 14.8l6.7 5.2c1.6-4.7 6-8.2 11.2-8.2Z"/></svg>';
    const setAuthMode = mode => {
      const signupMode = mode === 'sign-up';
      document.getElementById('app-sign-in').hidden = signupMode;
      document.getElementById('app-sign-up').hidden = !signupMode;
      auth.classList.toggle('is-sign-up', signupMode);
      auth.querySelector('[data-auth-mode-label]').textContent = signupMode ? 'Create Your Account' : 'Welcome Back!';
      auth.querySelector('[data-auth-subtitle]').textContent = signupMode ? 'Join our growing community' : 'Sign in to continue your farming journey';
      auth.querySelector('[data-auth-back]').setAttribute('aria-label', signupMode ? 'Back to sign in' : 'Back to introduction');
      auth.querySelector('[data-auth-back]').dataset.backToSignIn = String(signupMode);
      auth.querySelectorAll('[data-google-auth]').forEach(button => { button.innerHTML = googleMark; });
    };
    const updateStep = index => {
      currentStep = Math.max(0, Math.min(index, steps.length - 1));
      const step = steps[currentStep];
      onboarding.querySelector('[data-step-number]').textContent = currentStep + 1;
      onboarding.querySelector('[data-onboarding-title]').textContent = step.title;
      onboarding.querySelector('[data-onboarding-copy]').textContent = step.copy;
      const image = onboarding.querySelector('[data-onboarding-image]');
      image.dataset.onboardingImage = step.imageName;
      image.querySelector('img').src = step.image;
      image.querySelector('img').alt = step.alt;
      onboarding.querySelectorAll('.onboarding-benefits > div').forEach((row, rowIndex) => { row.lastElementChild.textContent = step.benefits[rowIndex]; });
      onboarding.querySelectorAll('[data-go-step]').forEach((dot, dotIndex) => {
        if (dotIndex === currentStep) dot.setAttribute('aria-current','step');
        else dot.removeAttribute('aria-current');
      });
      onboarding.querySelector('[data-onboarding-next]').textContent = currentStep === steps.length - 1 ? 'Get started' : 'Next';
      const content = onboarding.querySelector('.onboarding-content');
      content.classList.remove('is-swap'); void content.offsetWidth; content.classList.add('is-swap');
    };
    const startOnboarding = () => { showScreen(onboarding); updateStep(0); };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const savedSession = localStorage.getItem('savanna-customer-session') || sessionStorage.getItem('savanna-customer-session');
    const SPLASH_HOLD_MS = 2700;
    const SPLASH_FADE_MS = reduceMotion ? 0 : 400;
    function continueFromSplash() {
      if (savedSession) window.location.replace('customer-account.html');
      else if (localStorage.getItem('marks-farm-app-onboarding-complete')) openAuth('sign-in');
      else startOnboarding();
    }
    function leaveSplash() {
      if (splash.hidden || splash.classList.contains('is-leaving')) return;
      splash.classList.add('is-leaving');
      window.setTimeout(continueFromSplash, SPLASH_FADE_MS);
    }

    // Start the fixed hold once the photo, logo and fonts are ready (or 4s passes).
    let splashReady = false;
    const waitFor = img => (!img || img.complete) ? Promise.resolve() : new Promise(done => { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); });
    const photoReady = new Promise(done => { const photo = new Image(); photo.onload = photo.onerror = done; photo.src = 'Assets/Splash%20Screen.png'; });
    const assetsReady = Promise.all([photoReady, waitFor(splash.querySelector('.splash-brand img')), document.fonts ? document.fonts.ready : null]);
    Promise.race([assetsReady, new Promise(done => window.setTimeout(done, 4000))]).then(() => {
      splashReady = true;
      splash.classList.add('is-ready');
      window.setTimeout(leaveSplash, SPLASH_HOLD_MS);
    });
    onboarding.querySelector('[data-onboarding-next]').addEventListener('click', () => {
      if (currentStep < steps.length - 1) updateStep(currentStep + 1);
      else openAuth('sign-in');
    });
    onboarding.querySelectorAll('[data-go-step]').forEach(dot => dot.addEventListener('click', () => updateStep(Number(dot.dataset.goStep))));
    onboarding.querySelector('[data-open-auth]').addEventListener('click', event => { event.preventDefault(); openAuth('sign-in'); });
    auth.querySelector('[data-auth-back]').addEventListener('click', event => {
      if (event.currentTarget.dataset.backToSignIn === 'true') setAuthMode('sign-in');
      else { window.location.hash = ''; startOnboarding(); }
    });
    auth.querySelectorAll('[data-switch-auth]').forEach(button => button.addEventListener('click', () => setAuthMode(button.dataset.switchAuth)));
    auth.querySelectorAll('[data-toggle-password]').forEach(button => button.addEventListener('click', () => {
      const input = button.closest('.app-input').querySelector('input');
      input.type = input.type === 'password' ? 'text' : 'password';
      button.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
      button.textContent = input.type === 'password' ? 'Show' : 'Hide';
    }));
    const signupPassword = document.querySelector('#app-sign-up [name="password"]');
    const passwordRules = {
      length: value => value.length >= 8,
      upper: value => /[A-Z]/.test(value),
      symbol: value => /[^A-Za-z0-9\s]/.test(value),
    };
    const updatePasswordRules = () => {
      document.querySelectorAll('[data-password-rule]').forEach(rule => {
        rule.classList.toggle('is-met', passwordRules[rule.dataset.passwordRule](signupPassword.value));
      });
    };
    signupPassword.addEventListener('input', updatePasswordRules);
    updatePasswordRules();
    auth.querySelectorAll('[data-google-auth]').forEach(button => button.addEventListener('click', () => showToast('Google sign-in needs the farm’s OAuth setup before it can create or access an account.')));
    auth.querySelectorAll('[data-facebook-auth]').forEach(button => button.addEventListener('click', () => showToast('Facebook sign-in needs the farm’s OAuth setup before it can create or access an account.')));
    auth.querySelectorAll('[data-apple-auth]').forEach(button => button.addEventListener('click', () => showToast('Apple sign-in needs the farm’s OAuth setup before it can create or access an account.')));
    auth.querySelector('[data-forgot-password]').addEventListener('click', () => showToast('Password recovery will be available when accounts are connected to an online service.'));

    const accountUsers = () => JSON.parse(localStorage.getItem('savanna-customer-accounts') || '[]');
    const hashPassword = async (password, salt) => {
      const saltBytes = Uint8Array.from(salt.match(/.{2}/g), byte => parseInt(byte,16));
      const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
      const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:saltBytes,iterations:210000,hash:'SHA-256'},key,256);
      return Array.from(new Uint8Array(bits),byte => byte.toString(16).padStart(2,'0')).join('');
    };
    document.getElementById('app-sign-in').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const email = form.elements.email.value.trim().toLowerCase();
      const error = auth.querySelector('[data-sign-in-error]');
      const user = accountUsers().find(account => account.email === email);
      error.classList.remove('is-visible');
      if (!user || await hashPassword(form.elements.password.value,user.salt) !== user.passwordHash) {
        error.textContent = 'We could not find an account with those details. Check them or create an account.';
        error.classList.add('is-visible');
        return;
      }
      if (form.elements.remember.checked) { localStorage.setItem('savanna-customer-session',email); sessionStorage.removeItem('savanna-customer-session'); }
      else { localStorage.removeItem('savanna-customer-session'); sessionStorage.setItem('savanna-customer-session',email); }
      window.location.href = 'customer-account.html';
    });
    document.getElementById('app-sign-up').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const error = auth.querySelector('[data-sign-up-error]');
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim().toLowerCase();
      const password = form.elements.password.value;
      error.classList.remove('is-visible');
      if (!Object.values(passwordRules).every(rule => rule(password))) {
        error.textContent = 'Choose a password that meets all the requirements above.';
        error.classList.add('is-visible');
        return;
      }
      if (password !== form.elements.confirm.value) { error.textContent = 'Those passwords do not match.'; error.classList.add('is-visible'); return; }
      if (accountUsers().some(account => account.email === email)) { error.textContent = 'An account with this email already exists. Sign in instead.'; error.classList.add('is-visible'); return; }
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const saltText = Array.from(salt,byte => byte.toString(16).padStart(2,'0')).join('');
      try {
        const users = accountUsers();
        users.push({name,email,phone:form.elements.phone.value.trim(),salt:saltText,passwordHash:await hashPassword(password,saltText),createdAt:new Date().toISOString()});
        localStorage.setItem('savanna-customer-accounts',JSON.stringify(users));
        localStorage.setItem('savanna-customer-session',email);
      } catch {
        error.textContent = 'This browser could not save the account. Please allow local storage and try again.';
        error.classList.add('is-visible');
        return;
      }
      window.location.href = 'customer-account.html';
    });
  })();
}

// Offer the installable farm app when a visitor opens the website homepage.
if (document.documentElement.classList.contains('page-index')) {
  const installDialog = document.getElementById('app-install-dialog');
  if (installDialog && /Android/i.test(navigator.userAgent)) {
    const installAction = installDialog.querySelector('[data-install-action]');
    const installHelp = installDialog.querySelector('[data-install-help]');
    let pendingInstall = null;
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const dismissForVisit = () => {
      sessionStorage.setItem('marks-farm-install-dismissed','true');
      if (installDialog.open) installDialog.close();
    };

    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      pendingInstall = event;
      installAction.textContent = 'Install the app';
      installHelp.hidden = true;
    });
    window.addEventListener('appinstalled', () => {
      pendingInstall = null;
      localStorage.setItem('marks-farm-app-installed','true');
      if (installDialog.open) installDialog.close();
    });
    installDialog.querySelectorAll('[data-install-dismiss]').forEach(button => button.addEventListener('click', dismissForVisit));
    installDialog.addEventListener('cancel', () => sessionStorage.setItem('marks-farm-install-dismissed','true'));
    installAction.addEventListener('click', async () => {
      if (!pendingInstall) {
        const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        installHelp.textContent = isAppleMobile
          ? 'To add the app on iPhone or iPad: tap the Share button in your browser, then choose “Add to Home Screen”.'
          : 'To install the app, open your browser menu and choose “Install app” or “Add to Home Screen”. You can also open the app in your browser below.';
        installHelp.hidden = false;
        installAction.textContent = isAppleMobile ? 'Add to Home Screen' : 'Installation steps';
        return;
      }

      const installEvent = pendingInstall;
      pendingInstall = null;
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice?.outcome === 'accepted') localStorage.setItem('marks-farm-app-installed','true');
      dismissForVisit();
    });

    if (!isInstalled && !localStorage.getItem('marks-farm-app-installed') && !sessionStorage.getItem('marks-farm-install-dismissed')) {
      window.setTimeout(() => { if (!installDialog.open) installDialog.showModal(); }, 900);
    }
  }
}

// Open a prefilled WhatsApp message from the contact form.
if (document.documentElement.classList.contains('page-contact')) {
  const form = document.getElementById('contact-enquiry-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const message = [
      "Hello Mark's Savannah Farm, I'd like to make an enquiry.",
      `Name: ${fields.get('name')}`,
      `Phone: ${fields.get('phone')}`,
      `Interested in: ${fields.get('interest')}`,
      `Location: ${fields.get('location') || 'Not provided'}`,
      `Enquiry: ${fields.get('message')}`,
    ].join('\n');
    window.location.href = `https://wa.me/${FARM_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
  });
}

// Share each guide with a direct link to its section.
document.querySelectorAll('[data-share]').forEach(shareBar => {
  const article = document.getElementById(shareBar.dataset.share);
  if (!article) return;

  const title = article.querySelector('h2')?.textContent?.trim() || document.title;
  const shareUrl = new URL(`#${article.id}`, window.location.href);
  const encodedUrl = encodeURIComponent(shareUrl.href);
  const encodedTitle = encodeURIComponent(title);

  shareBar.querySelector('[data-share-facebook]')?.setAttribute('href', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
  shareBar.querySelector('[data-share-x]')?.setAttribute('href', `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`);
  shareBar.querySelector('[data-share-whatsapp]')?.setAttribute('href', `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`);
  shareBar.querySelector('[data-native-share]')?.addEventListener('click', async () => {
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl.href }).catch(() => {});
    } else {
      shareBar.querySelector('[data-copy-share]')?.click();
    }
  });

  shareBar.querySelector('[data-copy-share]')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(shareUrl.href);
      button.textContent = 'Link copied';
      window.setTimeout(() => { button.textContent = 'Copy link'; }, 1800);
    } catch {
      window.prompt('Copy this guide link:', shareUrl.href);
    }
  });
});

// Filter the gallery and provide an accessible photo viewer with category enquiry links.
if (document.documentElement.classList.contains('page-gallery')) {
  const gallery = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('gallery-lightbox');
  const cards = gallery ? [...gallery.querySelectorAll('[data-gallery-category]')] : [];
  const filters = [...document.querySelectorAll('[data-gallery-filter]')];
  const photo = document.getElementById('gallery-lightbox-image');
  const title = document.getElementById('gallery-lightbox-title');
  const category = document.getElementById('gallery-lightbox-category');
  const enquiry = document.getElementById('gallery-lightbox-enquiry');
  let currentCard = null;

  const visibleCards = () => cards.filter(card => !card.hidden);
  const showCard = card => {
    if (!card) return;
    currentCard = card;
    photo.src = card.dataset.galleryImage;
    photo.alt = card.querySelector('img')?.alt || card.dataset.galleryTitle;
    title.textContent = card.dataset.galleryTitle;
    category.textContent = card.dataset.galleryCategory;
    const message = `Hello Mark's Savannah Farm, I'd like to ask about ${card.dataset.galleryEnquiry}.`;
    enquiry.href = `https://wa.me/${FARM_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  cards.forEach(card => card.addEventListener('click', () => {
    showCard(card);
    lightbox?.showModal();
  }));

  filters.forEach(filter => filter.addEventListener('click', () => {
    const activeFilter = filter.dataset.galleryFilter;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    cards.forEach(card => { card.hidden = activeFilter !== 'all' && card.dataset.galleryCategory !== activeFilter; });
  }));

  const movePhoto = step => {
    const visible = visibleCards();
    const index = visible.indexOf(currentCard);
    const nextIndex = (index + step + visible.length) % visible.length;
    showCard(visible[nextIndex]);
  };

  document.querySelector('[data-gallery-close]')?.addEventListener('click', () => lightbox?.close());
  document.querySelector('[data-gallery-prev]')?.addEventListener('click', () => movePhoto(-1));
  document.querySelector('[data-gallery-next]')?.addEventListener('click', () => movePhoto(1));
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') movePhoto(-1);
    if (event.key === 'ArrowRight') movePhoto(1);
  });
}

// Accessible primary navigation shared by the homepage and About page.
if (document.documentElement.matches('.page-index, .page-about, .page-contact, .page-sign-in, .page-create-account, .page-customer-account')) {
  const nav = document.querySelector('nav.nav');
  if (nav) {
    const syncNavScrollState = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    syncNavScrollState();
    window.addEventListener('scroll', syncNavScrollState, { passive: true });
  }
  const menuToggle = nav?.querySelector('.nav-menu-toggle');
  const links = nav?.querySelector('.links');
  const servicesToggle = nav?.querySelector('.nav-dropdown-toggle');
  const servicesDropdown = nav?.querySelector('.nav-dropdown');

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    links?.classList.toggle('is-open', isOpen);
  });

  // Desktop with a mouse: open on hover, close shortly after the pointer leaves.
  const hoverMenu = window.matchMedia('(min-width: 701px) and (hover: hover)');
  let closeTimer;
  const setServicesOpen = isOpen => {
    servicesToggle?.setAttribute('aria-expanded', String(isOpen));
    servicesDropdown?.classList.toggle('is-open', isOpen);
    if (!isOpen) resetPreview();
  };

  // Photo panel: swap the image and caption to match the link being hovered.
  const megaFeature = servicesDropdown?.querySelector('.mega-feature');
  const megaLayers = megaFeature ? [...megaFeature.querySelectorAll('.mega-img')] : [];
  const megaCaption = megaFeature?.querySelector('.mega-caption');
  const defaultCaption = megaCaption ? megaCaption.textContent : '';
  const previewImages = {
    default: 'Assets/Hero%20background.png',
    cattle: 'Assets/Cattle%20dropdown.jpg',
    chicken: 'Assets/Turkeys.jpg',
    poultryFarming: 'Assets/poultry%20Frming.jpg',
    crops: 'Assets/Crops.jpg',
    dairy: 'Assets/Dairy%20Products.jpg',
    equipment: 'Assets/Farm%20Equipments.jpg',
    consultancy: 'Assets/Agri-Consultancy.jpg',
    goat: 'Assets/Goats.jpg',
    sheep: 'Assets/Sheep.jpg',
    pig: 'Assets/Pigs.jpg',
  };
  let activeLayer = 0;
  let currentImage = previewImages.default;
  let preloaded = false;

  function showPreview(key, caption) {
    if (!megaLayers.length) return;
    if (megaCaption) megaCaption.textContent = caption;
    const url = previewImages[key] || previewImages.default;
    if (url === currentImage) return;
    const next = megaLayers[1 - activeLayer];
    next.style.backgroundImage = `url("${url}")`;
    next.classList.add('is-on');
    megaLayers[activeLayer].classList.remove('is-on');
    activeLayer = 1 - activeLayer;
    currentImage = url;
  }

  function resetPreview() {
    showPreview('default', defaultCaption);
  }

  servicesDropdown?.querySelectorAll('.mega-links a, .mega-promo').forEach(link => {
    const preview = () => showPreview(link.dataset.preview, link.textContent.trim());
    link.addEventListener('mouseenter', preview);
    link.addEventListener('focus', preview);
  });

  servicesDropdown?.addEventListener('mouseenter', () => {
    if (!hoverMenu.matches) return;
    clearTimeout(closeTimer);
    if (!preloaded) {
      preloaded = true;
      Object.values(previewImages).forEach(src => { new Image().src = src; });
    }
    setServicesOpen(true);
  });

  servicesDropdown?.addEventListener('mouseleave', () => {
    if (!hoverMenu.matches) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setServicesOpen(false), 140);
  });

  servicesToggle?.addEventListener('click', event => {
    // Keep desktop hover, and let an intentional mouse click open the menu too.
    if (hoverMenu.matches && event.detail > 0) {
      setServicesOpen(true);
      return;
    }
    setServicesOpen(servicesToggle.getAttribute('aria-expanded') !== 'true');
  });

  nav?.addEventListener('click', event => {
    if (event.target.closest('.links a')) {
      event.target.closest('.links a').blur();
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Open navigation');
      links?.classList.remove('is-open');
      servicesToggle?.setAttribute('aria-expanded', 'false');
      servicesDropdown?.classList.remove('is-open');
    }
  });

  document.addEventListener('click', event => {
    if (!nav?.contains(event.target)) {
      servicesToggle?.setAttribute('aria-expanded', 'false');
      servicesDropdown?.classList.remove('is-open');
    }
  });

  nav?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Open navigation');
      links?.classList.remove('is-open');
      servicesToggle?.setAttribute('aria-expanded', 'false');
      servicesDropdown?.classList.remove('is-open');
      menuToggle?.focus();
    }
  });
}

// Initialize behavior only on the matching page.
if (document.documentElement.classList.contains('page-index')) {
  (() => {
    // Listing data and buyer actions for the public livestock catalogue.
    const photos={
      Cattle:{
        url:'https://upload.wikimedia.org/wikipedia/commons/b/bb/Boran_cattle_in_Kenya.jpg',page:'https://commons.wikimedia.org/wiki/File:Boran_cattle_in_Kenya.jpg',credit:'Boran cattle · ILRI · CC BY 2.0'
      }
      ,Chicken:{
        url:'https://upload.wikimedia.org/wikipedia/commons/f/fe/Kenyan_backyard_chicken_rooster.jpg',page:'https://commons.wikimedia.org/wiki/File:Kenyan_backyard_chicken_rooster.jpg',credit:'Backyard chicken · Ngangaesther · CC BY-SA 4.0'
      }
      ,Goat:{
        url:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Maasai_Goats_and_Sheep_Gathering_under_a_tree.jpg/1280px-Maasai_Goats_and_Sheep_Gathering_under_a_tree.jpg',page:'https://commons.wikimedia.org/wiki/File:Maasai_Goats_and_Sheep_Gathering_under_a_tree.jpg',credit:'Maasai goats · Yganyana · CC BY-SA 4.0'
      }
      ,Sheep:{
        url:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Maasai_Goats_and_Sheep_Gathering_under_a_tree.jpg/1280px-Maasai_Goats_and_Sheep_Gathering_under_a_tree.jpg',page:'https://commons.wikimedia.org/wiki/File:Maasai_Goats_and_Sheep_Gathering_under_a_tree.jpg',credit:'Maasai sheep · Yganyana · CC BY-SA 4.0'
      }
    }
    ;
    const readJSON=(k,f)=>{
      try{
        const v=JSON.parse(localStorage.getItem(k));
        return v==null?f:v
      }
      catch{
        return f
      }
    }
    ;
    const writeJSON=(k,v)=>{
      try{
        localStorage.setItem(k,JSON.stringify(v));
        return true
      }
      catch{
        return false
      }
    }
    ;
    const fmt=n=>n?'KSh '+new Intl.NumberFormat('en-KE',{
      maximumFractionDigits:0
    }
    ).format(n):'Ask for price';
    const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }
    [c]));
    const favKey='savanna-customer-favorites';
    const favs=()=>{
      const f=readJSON(favKey,[]);return Array.isArray(f)?f:[]
    }
    ;
    const favId=a=>String(a.id||a.name);
    function farmListings(){
      const saved=readJSON('herdbook-animals',[]);return (Array.isArray(saved)?saved:[]).filter(a=>a&&a.status==='Listed'&&!a.referenceOnly&&!a.demo).reverse()
    }
    let livestock=[];
    function draw(){
      const q=(document.getElementById('listingSearch')?.value||'').trim().toLowerCase(),type=document.getElementById('listingType')?.value||'all',sort=document.getElementById('listingSort')?.value||'recent';
      const allListings=farmListings();
      livestock=allListings.filter(a=>(type==='all'||a.type===type)&&[a.name,a.type,a.breed,a.location].join(' ').toLowerCase().includes(q));
      const key=(a,empty)=>(a.unit==='kg'||!+a.price)?empty:+a.price;
      if(sort==='price-low')livestock.sort((a,b)=>key(a,Infinity)-key(b,Infinity));
      if(sort==='price-high')livestock.sort((a,b)=>key(b,-1)-key(a,-1));
      if(sort==='name')livestock.sort((a,b)=>a.name.localeCompare(b.name));
      document.getElementById('listingCount').textContent=livestock.length+' listing'+(livestock.length===1?'':'s');
      const saved=new Set(favs().map(f=>f.id));
      const emptyMessage=allListings.length===0
        ? '<div class="listing-empty"><span class="listing-empty-mark" aria-hidden="true">🌱</span><h3>No livestock listed right now</h3><p>Contact the farm to ask about current availability.</p><a class="btn" href="#contact">Ask the farm</a></div>'
        : '<div class="listing-empty"><span class="listing-empty-mark" aria-hidden="true">⌕</span><h3>No matching livestock</h3><p>Try another animal type or clear your search and filters.</p><button class="clear-listing-filters" type="button" data-clear-listing-filters>Clear filters</button></div>';
      document.getElementById('cards').innerHTML=livestock.length?livestock.map((a,i)=>{
        const guide=false,src=a.image||photos[a.type]?.url,isSaved=saved.has(favId(a));
        const emoji=`<span class="emoji"${src?' hidden':''}>${a.emoji||'🐄'}</span>`;
        const pic=src?`<img src="${
  esc(src)
}
" alt="${
  esc(a.name)
}
(${
  esc(a.type)
}
)" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">${emoji}`:emoji;
        const credit=a.image?'Farm photo':photos[a.type]?`Representative photo · <a href="${
  photos[a.type].page
}
" target="_blank" rel="noopener">${photos[a.type].credit}</a>`:'Photo not provided';
        const unit=a.unit&&a.unit!=='head'?` <small>/ ${esc(a.unit)}</small>`:'';
        return `<article class="card"><div class="card-pic">${pic}<span class="for-sale${
  guide?' market-badge':''
}
">${guide?'Market guide':'Farm listed'}</span><button class="save" type="button" aria-pressed="${
  isSaved
}
" aria-label="${
  isSaved?'Remove':'Save'
}
${
  esc(a.name)
}
${
  isSaved?'from':'to'
}
your shortlist" onclick="toggleSave(${
  i
}
)">${isSaved?'♥':'♡'}</button></div><div class="card-body"><div class="card-title">${esc(a.name)}${guide?'':' · '+esc(a.type)}</div><div class="card-desc">${esc(a.breed||'Breed on request')} &nbsp;·&nbsp; ${esc(a.age||'Age on request')} &nbsp;·&nbsp; ${esc(a.weight||'Weight on request')}</div><div class="listing-loc">⌖ ${esc(a.location||'Kenya')} · Health and vaccination details: ${esc(a.health||'ask the farm')}</div><div class="photo-credit">${credit}</div><div class="card-bottom"><span class="card-price">${fmt(a.price)}${unit}</span><button class="ask" onclick="openEnquiry(${
  i
}
)">Ask about it&nbsp; </button></div></div></article>`
      }
      ).join(''):emptyMessage;
    }
    function toggleSave(i){
      const a=livestock[i];if(!a)return;let list=favs();const id=favId(a);list=list.some(f=>f.id===id)?list.filter(f=>f.id!==id):[...list,{
        id,name:a.name,type:a.type
      }
      ];writeJSON(favKey,list);draw()
    }
    let selected;
    function openEnquiry(i){
      selected=livestock[i];document.getElementById('askName').textContent=selected.name;document.getElementById('buyerMessage').value=selected.referenceOnly?`Hello, I saw the ${selected.type.toLowerCase()} market guide on your website. Do you have ${selected.type.toLowerCase()} available, and what is the current price?`:`Hello, I’m interested in ${selected.name} (${selected.type}). Is it still available?`;document.getElementById('enquiry').classList.add('open');document.getElementById('buyerName').focus()
    }
    function closeEnquiry(){
      document.getElementById('enquiry').classList.remove('open')
    }
    function sendEnquiry(){
      const name=document.getElementById('buyerName').value.trim(),contact=document.getElementById('buyerContact').value.trim(),message=document.getElementById('buyerMessage').value.trim();const animal=selected?`Animal: ${selected.name} (${selected.type})\n`:'';const body=`Hello Mark's Savannah Farm,\n\n${message}\n\n${animal}My name: ${name||'Not provided'}\nMy contact: ${contact||'Not provided'}`;window.open('https://wa.me/254706894568?text='+encodeURIComponent(body),'_blank','noopener')
    }
    document.getElementById('enquiry').addEventListener('click',e=>{
      if(e.target.id==='enquiry')closeEnquiry()
    }
    );
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape')closeEnquiry()
    }
    );
    document.getElementById('year').textContent=new Date().getFullYear();
    const requestedAnimal = new URLSearchParams(location.search).get('animal');
    if (['Cattle','Goat','Sheep','Chicken','Pig','Camel'].includes(requestedAnimal)) document.getElementById('listingType').value = requestedAnimal;
    draw();['listingSearch','listingType','listingSort'].forEach(id=>document.getElementById(id).addEventListener(id==='listingSearch'?'input':'change',draw));
    document.getElementById('cards').addEventListener('click',event=>{
      if(!event.target.closest('[data-clear-listing-filters]'))return;
      document.getElementById('listingSearch').value='';
      document.getElementById('listingType').value='all';
      draw();
    });
    document.querySelectorAll('[data-nav-livestock-type]').forEach(link=>link.addEventListener('click',()=>{
      const typeFilter=document.getElementById('listingType');
      if(!typeFilter)return;
      typeFilter.value=link.dataset.navLivestockType;
      typeFilter.dispatchEvent(new Event('change',{bubbles:true}));
    }));
    try{
      if(localStorage.getItem('savanna-customer-session')||sessionStorage.getItem('savanna-customer-session')){
        document.querySelectorAll('a[href="sign-in.html"]').forEach(a=>{
          a.href='customer-account.html';a.textContent=a.closest('footer')?'My buyer account':'My account'
        }
        )
      }
    }
    catch{
    }
    Object.assign(window, {
      toggleSave, openEnquiry, closeEnquiry, sendEnquiry
    }
    );
  }
  )();
}
// Initialize behavior only on the matching page.
if (document.documentElement.classList.contains('page-herdbook')) {
  (() => {
    // Demo records, local storage, and farm record actions.
    const seed=[{
      id:1,name:'Nia',type:'Cattle',breed:'Boran',age:'2 years',weight:'320 kg',status:'Listed',price:55000,emoji:'🐄',notes:'Healthy, vaccinated',saleDate:'',demo:true
    }
    ,{
      id:2,name:'Kito',type:'Goat',breed:'Boer cross',age:'1 year',weight:'42 kg',status:'Available',price:12000,emoji:'🐐',notes:'Twin-born, strong frame',saleDate:'',demo:true
    }
    ,{
      id:3,name:'Malaika',type:'Cattle',breed:'Friesian',age:'3 years',weight:'410 kg',status:'Available',price:95000,emoji:'🐄',notes:'Good milking line',saleDate:'',demo:true
    }
    ,{
      id:4,name:'Pili',type:'Sheep',breed:'Dorper',age:'8 months',weight:'31 kg',status:'Sold',price:9500,emoji:'🐑',notes:'Sold to A. Mwangi',saleDate:'2026-09-22',demo:true
    }
    ,{
      id:5,name:'Kuku 01',type:'Chicken',breed:'Kienyeji',age:'6 months',weight:'2.1 kg',status:'Listed',price:1000,emoji:'🐓',notes:'Free range',saleDate:'',demo:true
    }
    ];
    let animals;
    try{
      const saved=JSON.parse(localStorage.getItem('herdbook-animals'));
      animals=Array.isArray(saved)?saved.filter(a=>a&&!a.referenceOnly):seed;
      if(Array.isArray(saved)&&animals.length!==saved.length)localStorage.setItem('herdbook-animals',JSON.stringify(animals))
    }
    catch{
      animals=seed
    }
    const persist=()=>{
      try{
        localStorage.setItem('herdbook-animals',JSON.stringify(animals));
        return true
      }
      catch{
        toast('Could not save: browser storage is full. Try a smaller photo.');
        return false
      }
    }
    ;
    const icons={
      cow:'<svg viewBox="0 0 24 24"><path d="M4 16.5c2-5 4-8 8-8s6 3 8 8M7 15h10M9 8l-1-3m7 3 1-3M5 17v2m14-2v2M8 12l-2-1m10 1 2-1"/></svg>',tag:'<svg viewBox="0 0 24 24"><path d="M20 13 11 4H4v7l9 9 7-7Z"/><circle cx="8" cy="8" r="1"/></svg>',cart:'<svg viewBox="0 0 24 24"><path d="M3 4h2l2.5 11h11L21 8H7M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>',cash:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M7 6V4h10v2m-5 4v5m2-4c0-1-1-1-2-1s-2 0-2 1 1 1 2 1 2 0 2 1-1 1-2 1-2 0-2-1"/></svg>'
    }
    ;
    function money(v){
      return v?'KSh '+new Intl.NumberFormat('en-KE',{
        maximumFractionDigits:0
      }
      ).format(v):'—'
    }
    function animalEmoji(a){
      return a.emoji||({
        Cattle:'🐄',Goat:'🐐',Sheep:'🐑',Chicken:'🐓',Camel:'🐪',Pig:'🐖'
      }
      [a.type]||'🐂')
    }
    function statusClass(s){
      return s.toLowerCase()
    }
    function statusTag(s){
      return `<span class="tag ${statusClass(s)}">${s}</span>`
    }
    function dateFormat(s){
      if(!s)return'—';
      return new Date(s+'T00:00:00').toLocaleDateString(undefined,{
        day:'numeric',month:'short',year:'numeric'
      }
      )
    }
    function render(){
      const hr=new Date().getHours();
      document.getElementById('greetTitle').textContent=(hr<12?'Good morning':hr<17?'Good afternoon':'Good evening')+', farmer.';
      document.getElementById('greetEyebrow').textContent=new Date().toLocaleDateString(undefined,{
        weekday:'long'
      }
      )+', looking good';
      document.getElementById('demoBanner').style.display=animals.some(a=>a.demo)?'block':'none';
      let total=animals.length,listed=animals.filter(a=>a.status==='Listed').length,sold=animals.filter(a=>a.status==='Sold'),value=animals.filter(a=>a.status!=='Sold').reduce((n,a)=>n+(+a.price||0),0);
      document.getElementById('stats').innerHTML=[[icons.cow,'Animals',total,'Across your farm',''],[icons.tag,'Available',animals.filter(a=>a.status==='Available').length,'Ready for a new home',''],[icons.cart,'Listed online',listed,'Visible to buyers','orange'],[icons.cash,'Sales recorded',sold.length,'Total '+money(sold.reduce((n,a)=>n+(+a.price||0),0)),'']].map(([i,l,v,f,c])=>`<div class="stat"><div class="stat-top">${l}<span class="stat-icon ${c}">${i}</span></div><div class="stat-value">${v}</div><div class="stat-foot">${f}</div></div>`).join('');
      let recent=[...animals].slice(-4).reverse();
      document.getElementById('recentAnimals').innerHTML=recent.length?recent.map(a=>`<div class="animal-row"><div class="animal-pic">${animalEmoji(a)}</div><div><div class="animal-main">${esc(a.name)}</div><div class="animal-meta">${esc(a.breed||a.type)} · ${esc(a.age||'Age not set')}</div></div><div class="hide-small">${statusTag(a.status)}</div><div class="hide-small animal-meta">${esc(a.weight||'—')}</div><div class="price">${a.price?money(a.price):'—'}</div></div>`).join(''):'<div class="empty">No animal records yet. Add your first animal to get started.</div>';
      let acts=[];
      animals.slice(-4).reverse().forEach(a=>acts.push(`<div class="activity-item"><div class="activity-dot">${icons.cow}</div><div class="activity-copy"><strong>${esc(a.name)}</strong> added to your records<div class="activity-time">Recently added · ${esc(a.type)}</div></div></div>`));
      sold.slice(-2).forEach(a=>acts.push(`<div class="activity-item"><div class="activity-dot orange">${icons.cash}</div><div class="activity-copy"><strong>${esc(a.name)}</strong> sale recorded · ${money(a.price)}<div class="activity-time">${dateFormat(a.saleDate)}</div></div></div>`));
      document.getElementById('activity').innerHTML=acts.slice(0,4).join('')||'<div class="empty">Your farm activity will appear here.</div>';
      let q=(document.getElementById('animalSearch')?.value||'').toLowerCase(),f=document.getElementById('animalFilter')?.value||'all';
      let rows=animals.filter(a=>(f==='all'||a.status===f)&&[a.name,a.type,a.breed].join(' ').toLowerCase().includes(q));
      document.getElementById('animalsTable').innerHTML=rows.length?rows.map(tableAnimal).join(''):'<tr><td colspan="6" class="empty">No animals match. Add an animal or clear your search.</td></tr>';
      let mq=(document.getElementById('marketSearch')?.value||'').toLowerCase(),mf=document.getElementById('marketFilter')?.value||'all';
      let cards=animals.filter(a=>a.status==='Listed'&&(mf==='all'||a.type===mf)&&[a.name,a.type,a.breed].join(' ').toLowerCase().includes(mq));
      document.getElementById('listingCount').textContent=cards.length+' listing'+(cards.length===1?'':'s');
      document.getElementById('listingGrid').innerHTML=cards.length?cards.map(a=>`<article class="listing-card"><div class="listing-photo"><span class="tag listed" style="z-index:1">For sale</span>${a.image?`<img src="${esc(a.image)}" alt="${esc(a.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">`:''}${animalEmoji(a)}</div><div class="listing-body"><div class="listing-name">${esc(a.name)} <span style="font-weight:400;color:var(--muted)">· ${esc(a.type)}</span></div><div class="listing-detail">${esc(a.breed||'Breed not specified')} · ${esc(a.age||'Age not specified')} · ${esc(a.weight||'Weight not specified')}</div><div class="listing-detail">${esc(a.location||'Kenya')} · ${esc(a.health||'Health details on request')}</div><div class="listing-bottom"><div class="listing-price">${money(a.price)}</div><div class="listing-actions"><button class="icon-btn" title="Mark sold" onclick="markSold(${a.id})">${icons.cash}</button><button class="icon-btn" title="Remove listing" onclick="unlist(${a.id})">×</button></div></div></div></article>`).join(''):'<div class="panel empty" style="grid-column:1/-1">No listings match yet. Add an animal and set its status to Listed to advertise it here.</div>';
      document.getElementById('salesTable').innerHTML=sold.length?sold.map(a=>`<tr><td><div class="table-animal"><span class="table-emoji">${animalEmoji(a)}</span>${esc(a.name)}</div></td><td>${esc(a.type)} · ${esc(a.breed||'—')}</td><td>${dateFormat(a.saleDate)}</td><td>${esc(a.notes||'—')}</td><td><b>${money(a.price)}</b></td></tr>`).join(''):'<tr><td colspan="5" class="empty">No sales recorded yet. Mark a listed animal as sold to record a sale.</td></tr>';
      document.getElementById('salesStats').innerHTML=[[icons.cash,'Sales completed',sold.length],[icons.tag,'Total sales value',money(sold.reduce((n,a)=>n+(+a.price||0),0))],[icons.cow,'Animals on farm',animals.filter(a=>a.status!=='Sold').length],[icons.cart,'Currently listed',listed]].map(([i,l,v])=>`<div class="stat"><div class="stat-top">${l}<span class="stat-icon">${i}</span></div><div class="stat-value">${v}</div><div class="stat-foot">Updated with your records</div></div>`).join('')
    }
    async function compressAnimalPhoto(file){
      const bitmap=await createImageBitmap(file);
      const scale=Math.min(1,1200/bitmap.width,900/bitmap.height);
      const canvas=document.createElement('canvas');
      canvas.width=Math.round(bitmap.width*scale);
      canvas.height=Math.round(bitmap.height*scale);
      canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      bitmap.close();
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.78));
      return await new Promise((resolve,reject)=>{
        const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)
      }
      )
    }
    function tableAnimal(a){
      return`<tr><td><div class="table-animal"><span class="table-emoji">${animalEmoji(a)}</span><span>${esc(a.name)}</span></div></td><td>${esc(a.type)} · ${esc(a.breed||'—')}</td><td>${esc(a.age||'—')}</td><td>${esc(a.weight||'—')}</td><td>${statusTag(a.status)}</td><td><b>${money(a.price)}</b></td></tr>`
    }
    function esc(s){
      return String(s??'').replace(/[&<>"']/g,c=>({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      }
      [c]))
    }
    function navigate(page){
      document.querySelectorAll('.section').forEach(x=>x.classList.remove('show'));document.getElementById('page-'+page).classList.add('show');document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));document.getElementById('crumb').textContent=({
        overview:'Overview',animals:'My animals',market:'Marketplace',sales:'Sales & records'
      }
      )[page];window.scrollTo(0,0)
    }
    document.getElementById('nav').addEventListener('click',e=>{
      let b=e.target.closest('[data-page]');if(b)navigate(b.dataset.page)
    }
    );function openModal(){
      document.getElementById('modal').classList.add('open')
    }
    function closeModal(){
      document.getElementById('modal').classList.remove('open')
    }
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape')closeModal()
    }
    );document.getElementById('modal').addEventListener('click',e=>{
      if(e.target.id==='modal')closeModal()
    }
    );document.getElementById('animalForm').addEventListener('submit',async e=>{
      e.preventDefault();let d=Object.fromEntries(new FormData(e.target));const photoFile=d.photoFile;delete d.photoFile;if(photoFile&&photoFile.size)d.image=await compressAnimalPhoto(photoFile);if(d.status==='Sold'&&!d.saleDate)d.saleDate=new Date().toISOString().slice(0,10);animals.push({
        id:Date.now(),...d,price:+d.price||0,emoji:({
          Cattle:'🐄',Goat:'🐐',Sheep:'🐑',Chicken:'🐓',Camel:'🐪',Pig:'🐖'
        }
        [d.type]||'🐂')
      }
      );if(!persist()){
        animals.pop();return
      }
      render();e.target.reset();closeModal();toast('Animal saved to your farm records.')
    }
    );function clearDemo(){
      animals=animals.filter(a=>!a.demo);persist();render();toast('Sample animals removed.')
    }
    function markSold(id){
      let a=animals.find(x=>x.id===id);a.status='Sold';a.saleDate=new Date().toISOString().slice(0,10);persist();render();toast(a.name+' marked as sold.')
    }
    function unlist(id){
      let a=animals.find(x=>x.id===id);a.status='Available';persist();render();toast(a.name+' listing removed.')
    }
    function toast(t){
      let el=document.getElementById('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500)
    }
    ['animalSearch','animalFilter','marketSearch','marketFilter'].forEach(id=>document.getElementById(id).addEventListener('input',render));document.getElementById('dateText').textContent=new Date().toLocaleDateString(undefined,{
      weekday:'short',day:'numeric',month:'short',year:'numeric'
    }
    );render();
    Object.assign(window, {
      navigate, openModal, closeModal, clearDemo, markSold, unlist
    }
    );
  }
  )();
}
// Customer app: Home, Marketplace, Auctions, Saved, and Profile.
if (document.documentElement.classList.contains('page-customer-account')) {
  (() => {
    const catalog = [
      ['market-cattle','Cattle','Cattle','Livestock','Assets/Cattle%20dropdown.jpg','Ask about breeds and current availability.'],
      ['market-goats','Goats','Goats','Livestock','Assets/Goats.jpg','Ask about breeds and current availability.'],
      ['market-sheep','Sheep','Sheep','Livestock','Assets/Sheep.jpg','Ask the farm about current stock and details.'],
      ['market-poultry','Poultry','Poultry','Poultry','Assets/poultry%20Frming.jpg','Chicken, ducks, and turkey. Ask about availability.'],
      ['market-pigs','Pigs','Pigs','Livestock','Assets/Pigs.jpg','Ask about breeds and current availability.'],
      ['market-crops','Crops & produce','Crops','Crops','Assets/Crops.jpg','Ask about produce and seasonal supply.'],
      ['market-dairy','Dairy products','Dairy','Dairy products','Assets/Dairy%20Products.jpg','Ask about milk, ghee, and other farm dairy products.'],
      ['market-equipment','Farm equipment','Equipment','Farm equipment','Assets/Farm%20Equipments.jpg','Ask about specifications and availability.'],
      ['market-consultancy','Agri-consultancy','Services','Agri-consultancy','Assets/Agri-Consultancy.jpg','Tell the farm what guidance your operation needs.'],
    ].map(([id,name,group,category,image,description]) => ({id,name,group,category,type:group,image,description}));
    const filters = ['All','Cattle','Goats','Sheep','Poultry','Pigs','Crops','Dairy','Equipment','Services'];
    const readStore = (key,fallback) => {
      try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)); }
      catch { return fallback; }
    };
    const email = (localStorage.getItem('savanna-customer-session') || sessionStorage.getItem('savanna-customer-session') || '').trim().toLowerCase();
    const users = readStore('savanna-customer-accounts',[]);
    const user = Array.isArray(users) ? users.find(item => String(item.email || '').toLowerCase() === email) : null;
    if (!user) { location.replace('sign-in.html'); return; }

    let marketFilter = 'All';
    let auctionTab = 'live';
    let marketItems = [];
    let quoteTrigger = null;

    function initialize() {
      renderUser(); renderMarket(); renderSaved(); renderOrders(); renderAuctionTab('live');
      document.querySelectorAll('[data-app-view]').forEach(button => button.addEventListener('click',() => showView(button.dataset.appView)));
      document.querySelectorAll('[data-market-open-filter]').forEach(button => button.addEventListener('click',() => {
        marketFilter = button.dataset.marketOpenFilter; updateFilters(); showView('marketplace'); renderMarket();
      }));
      document.querySelectorAll('[data-market-filter]').forEach(button => button.addEventListener('click',() => { marketFilter=button.dataset.marketFilter; renderMarket(); }));
      document.getElementById('marketSearch').addEventListener('input',renderMarket);
      document.querySelector('[data-market-filter-help]').addEventListener('click',event => {
        const button=event.currentTarget, filters=document.querySelector('.buyer-market-filters'), expanded=button.getAttribute('aria-expanded')==='true';
        filters.classList.toggle('is-collapsed',expanded);button.setAttribute('aria-expanded',String(!expanded));button.setAttribute('aria-label',expanded?'Show marketplace categories':'Hide marketplace categories');
      });
      const notifications=document.getElementById('notificationsModal');
      document.querySelector('[data-app-notifications]').addEventListener('click',() => {notifications.classList.add('is-open');notifications.setAttribute('aria-hidden','false');document.querySelector('[data-close-notifications]').focus();});
      document.querySelector('[data-close-notifications]').addEventListener('click',closeNotifications);
      notifications.addEventListener('click',event=>{if(event.target===notifications)closeNotifications();});
      document.querySelector('[data-notifications-marketplace]').addEventListener('click',()=>{closeNotifications();showView('marketplace');});
      document.querySelectorAll('[data-auction-tab]').forEach(button => button.addEventListener('click',() => renderAuctionTab(button.dataset.auctionTab)));
      document.querySelector('[data-auction-filter]').addEventListener('click',event=>{
        const button=event.currentTarget,tabs=document.querySelector('.buyer-auction-tabs'),expanded=button.getAttribute('aria-expanded')==='true';
        tabs.classList.toggle('is-collapsed',expanded);button.setAttribute('aria-expanded',String(!expanded));button.setAttribute('aria-label',expanded?'Show auction views':'Hide auction views');
      });
      document.getElementById('auctionContent').addEventListener('click',event => {
        if(event.target.closest('[data-auction-preview-bid]')) openQuoteSheet('Livestock','Premium Boran Bull auction enquiry');
        if(event.target.closest('[data-auction-reminder]')) openQuoteSheet('Livestock','Upcoming Boer Goat auction enquiry');
      });
      document.querySelector('[data-close-enquiry]').addEventListener('click',closeQuoteSheet);
      document.getElementById('enquiryModal').addEventListener('click',event => { if(event.target.id==='enquiryModal') closeQuoteSheet(); });
      document.getElementById('dashboardEnquiryForm').addEventListener('submit',sendEnquiry);
      document.getElementById('editModal').addEventListener('click',event => { if(event.target.id==='editModal') closeEdit(); });
      document.getElementById('editForm').addEventListener('submit',saveProfile);
      document.addEventListener('keydown',event => { if(event.key==='Escape'){closeEdit();closeQuoteSheet();closeNotifications();} });
    }

    function showView(view) {
      document.querySelectorAll('[data-app-screen]').forEach(screen => {
        const active=screen.dataset.appScreen===view; screen.hidden=!active; screen.classList.toggle('is-active',active);
      });
      document.querySelectorAll('.buyer-bottom-nav [data-app-view]').forEach(button => {
        const active=button.dataset.appView===view; button.classList.toggle('is-active',active);
        if(active) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
      });
      if(view==='marketplace') renderMarket();
      if(view==='saved') renderSaved();
      window.scrollTo({top:0,behavior:'smooth'});
    }

    function renderUser() {
      const name=String(user.name||'Buyer');
      document.getElementById('greeting').textContent=name.trim().split(/\s+/)[0]||'friend';
      document.getElementById('avatar').textContent=name.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase()||'M';
      document.getElementById('customerName').textContent=name;
      document.getElementById('customerEmail').textContent=user.email||'';
      document.getElementById('customerPhone').textContent=user.phone||'Add a phone number';
      document.getElementById('memberSince').textContent=new Date(user.createdAt||Date.now()).toLocaleDateString(undefined,{month:'long',year:'numeric'});
    }

    function getMarketItems() {
      const saved=readStore('herdbook-animals',[]);
      const live=Array.isArray(saved)?saved.filter(item=>item&&item.status==='Listed'&&!item.referenceOnly&&!item.demo).map(animal=>{
        const type=String(animal.type||'Cattle');
        const base=catalog.find(item=>item.type.toLowerCase()===type.toLowerCase())||catalog[0];
        return {id:`listed-${animal.id||animal.name}`,name:String(animal.name||type),group:base.group,category:type==='Chicken'?'Poultry':'Livestock',type,image:animal.image||base.image,description:[animal.breed,animal.age,animal.location].filter(Boolean).join(' · ')||'Ask the farm for listing details.',price:Number(animal.price)||0,isListed:true};
      }):[];
      return [...live,...catalog];
    }

    function renderMarket() {
      marketItems=getMarketItems();
      const search=(document.getElementById('marketSearch').value||'').trim().toLowerCase();
      const filterGroups={Dairy:'Dairy products',Equipment:'Farm equipment',Services:'Agri-consultancy'};
      const matchingGroup=filterGroups[marketFilter]||marketFilter;
      const filtered=marketItems.filter(item=>(marketFilter==='All'||item.group===matchingGroup)&&[item.name,item.group,item.category,item.description].join(' ').toLowerCase().includes(search));
      document.getElementById('market-result-note').textContent=`${filtered.length} listings and categories · Confirm availability and prices with the farm.`;
      const grid=document.getElementById('marketGrid');
      grid.innerHTML=filtered.length?filtered.map(marketCard).join(''):'<div class="buyer-market-empty"><strong>No matches found</strong><p>Try a different search or category.</p></div>';
      bindMarketCardActions(grid); updateFilters();
    }

    function marketCard(item) {
      const id=encodeURIComponent(String(item.id));
      const saved=readFavorites().some(entry=>String(entry.id)===String(item.id));
      const price=Number(item.price)>0?`KSh ${new Intl.NumberFormat('en-KE').format(Number(item.price))}`:'Ask for current price';
      return `<article class="buyer-market-card"><div class="buyer-market-photo"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy"><span class="buyer-market-badge">${item.isListed?'Listed':'Ask the farm'}</span><button type="button" class="buyer-save-button${saved?' is-saved':''}" data-market-save="${id}" aria-label="${saved?'Remove':'Save'} ${escapeHtml(item.name)}">${saved?'♥':'♡'}</button></div><div class="buyer-market-card-copy"><small>${escapeHtml(item.category)}</small><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><strong>${price}</strong><button type="button" data-market-enquiry="${id}">View details</button></div></article>`;
    }

    function updateFilters() {
      document.querySelectorAll('[data-market-filter]').forEach(button=>button.classList.toggle('is-active',button.dataset.marketFilter===marketFilter));
    }

    function bindMarketCardActions(grid) {
      grid.onclick=event=>{
        const save=event.target.closest('[data-market-save]');
        if(save){const item=marketItems.find(entry=>String(entry.id)===decodeURIComponent(save.dataset.marketSave));if(item)toggleSave(item);return;}
        const enquiry=event.target.closest('[data-market-enquiry]');
        if(enquiry){const item=marketItems.find(entry=>String(entry.id)===decodeURIComponent(enquiry.dataset.marketEnquiry));if(item)openQuoteSheet(item.category,item.name);}
      };
    }

    function readFavorites() {
      const saved=readStore('savanna-customer-favorites',[]);
      return Array.isArray(saved)?saved.filter(item=>item&&typeof item==='object'):[];
    }

    function toggleSave(item) {
      const favorites=readFavorites();
      const exists=favorites.some(entry=>String(entry.id)===String(item.id));
      const updated=exists?favorites.filter(entry=>String(entry.id)!==String(item.id)):[...favorites,{id:item.id,name:item.name,type:item.type,category:item.category}];
      try{localStorage.setItem('savanna-customer-favorites',JSON.stringify(updated));}
      catch{showToast('Could not save this item on the device.');return;}
      renderMarket(); renderSaved(); showToast(exists?'Removed from Saved.':'Added to Saved on this device.');
    }

    function renderSaved() {
      const favorites=readFavorites();
      const list=document.getElementById('savedList');
      marketItems=getMarketItems();
      if(!favorites.length){
        list.innerHTML='<div class="buyer-market-empty"><strong>No saved items yet</strong><p>Save livestock and farm products from the Marketplace to keep them here.</p><button type="button" data-open-marketplace>Browse Marketplace</button></div>';
        list.querySelector('[data-open-marketplace]').addEventListener('click',()=>showView('marketplace'));
        return;
      }
      list.innerHTML=favorites.map(saved=>{
        const item=marketItems.find(entry=>String(entry.id)===String(saved.id)||entry.name===saved.name);
        return item?marketCard(item):`<article class="buyer-saved-fallback"><strong>${escapeHtml(saved.name||saved.type||'Saved farm item')}</strong><small>Saved on this device</small></article>`;
      }).join('');
      bindMarketCardActions(list);
    }

    function renderAuctionTab(tab) {
      auctionTab=['live','upcoming','my-bids','results'].includes(tab)?tab:'live';
      document.querySelectorAll('[data-auction-tab]').forEach(button=>{
        const active=button.dataset.auctionTab===auctionTab;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active));
      });
      const content=document.getElementById('auctionContent');
      if(auctionTab==='live') content.innerHTML=`<article class="buyer-auction-card"><div class="buyer-auction-photo"><img src="Assets/Cattle%20dropdown.jpg" alt="Boran bull in a green field"><span>Preview only</span></div><div class="buyer-auction-copy"><h2>Premium Boran Bull</h2><p>Male · 3 years · Sample listing details</p><div class="buyer-auction-prices"><div><small>Sample current bid</small><strong>KSh 85,000</strong></div><div><small>Sample starting bid</small><strong>KSh 60,000</strong></div></div><div class="buyer-auction-countdown">Sample countdown · 02d : 14h : 32m</div><div class="buyer-auction-progress"><span></span></div><button type="button" class="buyer-place-bid" data-auction-preview-bid>Ask about this animal</button><p class="buyer-demo-caption">Illustrative values only. This preview does not accept bids.</p></div></article>`;
      else if(auctionTab==='upcoming') content.innerHTML=`<article class="buyer-upcoming-card"><img src="Assets/Goats.jpg" alt="Goats at a farm"><div><span class="buyer-market-badge">Preview</span><h2>Boer Goats — 10 Heads</h2><p>Sample upcoming auction · starts in 3 days</p><button type="button" data-auction-reminder>Ask about this sale</button></div></article><p class="buyer-demo-caption">Example event only. Confirm auction dates with the farm.</p>`;
      else if(auctionTab==='my-bids') content.innerHTML='<div class="buyer-market-empty"><strong>No bids yet</strong><p>Your bids will appear here when live bidding is connected to the app.</p></div>';
      else content.innerHTML='<div class="buyer-market-empty"><strong>No auction results yet</strong><p>Completed auctions and confirmed winners will appear here when auction history is available.</p></div>';
    }

    function renderOrders() {
      const orders=readStore('savanna-customer-orders',[]);
      const safe=Array.isArray(orders)?orders.filter(order=>order&&(!order.email||String(order.email).toLowerCase()===email)):[];
      const list=document.getElementById('ordersList');
      if(!safe.length){list.innerHTML='<div class="buyer-market-empty"><strong>No purchases recorded yet</strong><p>When you arrange a purchase directly with the farm, it can be noted here.</p></div>';return;}
      list.innerHTML=safe.slice(0,5).map(order=>`<article class="buyer-order-entry"><div><strong>${escapeHtml(order.animalName||order.listingName||'Farm purchase')}</strong><small>${escapeHtml(order.orderNumber||order.createdAt||'Arranged with the farm')}</small></div><span class="buyer-order-status">${escapeHtml(order.status||'Recorded')}</span></article>`).join('');
    }

    function openQuoteSheet(category='',item='') {
      quoteTrigger=document.activeElement;
      const modal=document.getElementById('enquiryModal');
      const form=document.getElementById('dashboardEnquiryForm');
      form.reset(); if(category)form.elements.category.value=category; if(item)form.elements.item.value=item;
      modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');window.setTimeout(()=>form.elements.item.focus(),30);
    }

    function closeQuoteSheet() {
      const modal=document.getElementById('enquiryModal');if(!modal.classList.contains('is-open'))return;
      modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');quoteTrigger?.focus();
    }

    function closeNotifications() {
      const modal=document.getElementById('notificationsModal');if(!modal.classList.contains('is-open'))return;
      modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.querySelector('[data-app-notifications]').focus();
    }

    function sendEnquiry(event) {
      event.preventDefault();const data=new FormData(event.currentTarget);
      const message=['Hello Mark’s Savannah Farm, I’d like to make an enquiry.',`Category: ${data.get('category')}`,`Looking for: ${data.get('item')}`,data.get('quantity')?`Quantity: ${data.get('quantity')}`:'',`County: ${data.get('county')}`,data.get('details')?`Details: ${data.get('details')}`:'',`Name: ${user.name||'Not provided'}`,`Phone: ${user.phone||'Not provided'}`,`Email: ${user.email||'Not provided'}`].filter(Boolean).join('\n');
      window.open(`https://wa.me/${FARM_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');closeQuoteSheet();
    }

    function openEdit() {
      document.getElementById('editName').value=user.name||'';document.getElementById('editEmail').value=user.email||'';document.getElementById('editPhone').value=user.phone||'';document.getElementById('editModal').classList.add('open');document.getElementById('editName').focus();
    }
    function closeEdit(){document.getElementById('editModal').classList.remove('open');}
    function saveProfile(event){
      event.preventDefault();user.name=document.getElementById('editName').value.trim();user.phone=document.getElementById('editPhone').value.trim();
      const updated=users.map(item=>String(item.email||'').toLowerCase()===email?user:item);
      try{localStorage.setItem('savanna-customer-accounts',JSON.stringify(updated));}catch{showToast('Could not save: browser storage is unavailable.');return;}
      renderUser();closeEdit();showToast('Your profile details have been saved on this device.');
    }
    function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));}
    function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');window.setTimeout(()=>toast.classList.remove('show'),2800);}
    function signOut(event){event.preventDefault();localStorage.removeItem('savanna-customer-session');sessionStorage.removeItem('savanna-customer-session');location.href='index.html';}

    Object.assign(window,{openEdit,closeEdit,signOut});
    initialize();
  })();
}
// Initialize behavior only on the matching page.
if (document.documentElement.classList.contains('page-sign-in')) {
  (() => {
    // Verify credentials stored by this browser and create a buyer session.
    document.getElementById('year').textContent=new Date().getFullYear();
    const users=()=>JSON.parse(localStorage.getItem('savanna-customer-accounts')||'[]');
    async function hashPassword(password,salt){
      const saltBytes=Uint8Array.from(salt.match(/.{2}/g),b=>parseInt(b,16));
      const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
      const bits=await crypto.subtle.deriveBits({
        name:'PBKDF2',salt:saltBytes,iterations:210000,hash:'SHA-256'
      }
      ,key,256);
      return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('')
    }
    document.getElementById('togglePassword').addEventListener('click',()=>{
      const field=document.getElementById('password'),show=field.type==='password';field.type=show?'text':'password';document.getElementById('togglePassword').textContent=show?'Hide':'Show';document.getElementById('togglePassword').setAttribute('aria-label',show?'Hide password':'Show password')
    }
    );
    document.getElementById('login').addEventListener('submit',async e=>{
      e.preventDefault();const email=document.getElementById('email').value.trim().toLowerCase(),password=document.getElementById('password').value;const user=users().find(u=>u.email===email);const error=document.getElementById('error');if(!user||await hashPassword(password,user.salt)!==user.passwordHash){
        error.textContent='We could not find an account with those details. Check them or create an account.';error.classList.add('show');return
      }
      if(document.getElementById('rememberMe').checked){
        localStorage.setItem('savanna-customer-session',email);sessionStorage.removeItem('savanna-customer-session')
      }
      else{
        localStorage.removeItem('savanna-customer-session');sessionStorage.setItem('savanna-customer-session',email)
      }
      location.href='customer-account.html'
    }
    );
    Object.assign(window, {
    }
    );
  }
  )();
}
// Initialize behavior only on the matching page.
if (document.documentElement.classList.contains('page-create-account')) {
  (() => {
    // Validate the form, hash the password, and save a local buyer account.
    document.getElementById('year').textContent=new Date().getFullYear();
    const users=()=>JSON.parse(localStorage.getItem('savanna-customer-accounts')||'[]');
    async function hashPassword(password,salt){
      const saltBytes=Uint8Array.from(salt.match(/.{2}/g),b=>parseInt(b,16));
      const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
      const bits=await crypto.subtle.deriveBits({
        name:'PBKDF2',salt:saltBytes,iterations:210000,hash:'SHA-256'
      }
      ,key,256);
      return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('')
    }
    ;
    document.getElementById('signup').addEventListener('submit',async e=>{
      e.preventDefault();const name=document.getElementById('name').value.trim(),email=document.getElementById('email').value.trim().toLowerCase(),phone=document.getElementById('phone').value.trim(),password=document.getElementById('password').value,confirm=document.getElementById('confirm').value,error=document.getElementById('error');if(password!==confirm){
        error.textContent='Those passwords do not match.';error.classList.add('show');return
      }
      error.classList.remove('show');const list=users();if(list.some(user=>user.email===email)){
        error.textContent='An account with this email already exists. Sign in instead.';error.classList.add('show');return
      }
      const salt=crypto.getRandomValues(new Uint8Array(16));const saltText=Array.from(salt,b=>b.toString(16).padStart(2,'0')).join('');list.push({
        name,email,phone,salt:saltText,passwordHash:await hashPassword(password,saltText),createdAt:new Date().toISOString()
      }
      );try{
        localStorage.setItem('savanna-customer-accounts',JSON.stringify(list));localStorage.setItem('savanna-customer-session',email)
      }
      catch{
        error.textContent='This browser is blocking storage, so the account could not be saved. Turn off private browsing and try again.';error.classList.add('show');return
      }
      location.href='customer-account.html'
    }
    );
    Object.assign(window, {
    }
    );
  }
  )();
}
