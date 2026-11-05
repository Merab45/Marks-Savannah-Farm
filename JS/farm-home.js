// Signed-in app screens: Home, Marketplace, Auctions, Saved, Profile.
// Listings and the sample auctions below are PLACEHOLDERS: edit LISTINGS / AUCTIONS to match the farm's real stock.
(() => {
  const root = document.getElementById('screen-home');
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const P = {
    home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    market:'<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5 12v8h14v-8"/>',
    auctions:'<path d="m14 13-8.4 8.4a2 2 0 0 1-2.8-2.8L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>',
    saved:'<path d="M6 3h12v18l-6-4-6 4z"/>',
    profile:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    chat:'<path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow:'<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    back:'<path d="m15 5-7 7 7 7"/>',
    sort:'<path d="M4 7h10M4 17h6M18 5v14m0 0-3-3m3 3 3-3"/>',
    book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    bell:'<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    out:'<path d="M9 4H5v16h4"/><path d="M16 8l4 4-4 4M20 12H9"/>',
    file:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>'
  };
  const ic = (n, c = '') => `<svg class="fh-i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const wa = t => 'https://wa.me/254706894568?text=' + encodeURIComponent(t);
  const ksh = n => 'KSh ' + n.toLocaleString('en-KE');
  const img = f => 'Assets/' + f;
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

  const LISTINGS = [
    { id:'boran-cow', name:'Boran Cow', cat:'Cattle', meta:'Female · 4 years', price:120000, img:'Cattle%20dropdown.jpg', tag:'For Sale' },
    { id:'boer-goat', name:'Boer Goat', cat:'Goats', meta:'Male · 8 months', price:18000, img:'Goats.jpg', tag:'For Sale' },
    { id:'layers', name:'Layers (Brown)', cat:'Poultry', meta:'20 hens', price:3500, img:'poultry%20Frming.jpg', tag:'For Sale' },
    { id:'fresh-milk', name:'Fresh Milk', cat:'Dairy', meta:'1 litre', price:120, img:'Dairy%20Products.jpg', tag:'For Sale' },
    { id:'sheep', name:'Sheep', cat:'Sheep', meta:'Ask for details', price:null, img:'Sheep.jpg', tag:'Available' },
    { id:'pigs', name:'Pigs', cat:'Pigs', meta:'Ask for details', price:null, img:'Pigs.jpg', tag:'Available' }
  ];
  const CATS = ['All', 'Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs'];
  const DAY = 864e5, HR = 36e5, MIN = 6e4;
  const auctionEnd = () => { let t = store.get('farm-app-demo-auction', null); if (!t) { t = { start: Date.now(), end: Date.now() + 2 * DAY + 14 * HR + 32 * MIN }; store.set('farm-app-demo-auction', t); } return t; };
  const AUCTIONS = { live: { name:'Premium Boran Bull', meta:'Male · 3 years · Excellent genetics', bid:85000, start:60000, img:'Cattle%20dropdown.jpg' },
                     upcoming: { name:'Boer Goats – 10 Heads', img:'Goats.jpg', days:3 } };
  const fmtLeft = ms => { ms = Math.max(0, ms); const p = n => String(n).padStart(2, '0'); return `${p(Math.floor(ms / DAY))}d : ${p(Math.floor(ms % DAY / HR))}h : ${p(Math.floor(ms % HR / MIN))}m`; };

  const S = { tab:'home', cat:'All', q:'', sort:'recent', atab:'live' };
  const TABS = [['home','Home'], ['market','Marketplace'], ['auctions','Auctions'], ['saved','Saved'], ['profile','Profile']];
  const user = () => { const e = localStorage.getItem('savanna-customer-session') || sessionStorage.getItem('savanna-customer-session'); const u = store.get('savanna-customer-accounts', []).find(a => a.email === e); return { email: e || '', name: u && u.name ? String(u.name) : '' }; };
  const saved = () => store.get('farm-app-saved', []);
  const toast = m => { const t = document.querySelector('.app-toast'); if (!t) return; t.textContent = m; t.classList.add('is-visible'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('is-visible'), 2600); };

  const brand = right => `<header class="fh-top"><a class="fh-brand" href="index.html" aria-label="Mark’s Savannah Farm"><img src="Assets/Glossy%20Green%20Agriculture%20Emblem.png" alt=""><span>Mark’s<br>Savannah Farm</span></a>${right}</header>`;
  const title = (t, back) => `<header class="fh-top fh-top-title">${back ? `<button class="fh-icon" data-tab="home" aria-label="Back">${ic('back')}</button>` : '<span></span>'}<h1>${t}</h1><span></span></header>`;
  const card = p => `<article class="fh-card"><div class="fh-card-img" style="background-image:url('${img(p.img)}')"><span class="fh-tag">${p.tag}</span><button class="fh-heart ${saved().includes(p.id) ? 'is-on' : ''}" data-save="${p.id}" aria-label="Save ${esc(p.name)}" aria-pressed="${saved().includes(p.id)}">${ic('heart')}</button></div><div class="fh-card-body"><h3>${p.name}</h3><p>${p.meta}</p><strong>${p.price ? ksh(p.price) : 'Ask for price'}</strong><a class="fh-soft" href="${wa(`Hello Mark's Savannah Farm, I'd like details about: ${p.name} (${p.meta}).`)}" target="_blank" rel="noopener">View Details ${ic('arrow')}</a></div></article>`;

  function home() {
    const n = user().name.split(' ')[0], h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const t = auctionEnd();
    return brand(`<a class="fh-icon" href="${wa("Hello Mark's Savannah Farm, I'd like to make an enquiry.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ic('chat')}</a>`) + `
    <div class="fh-greet"><h2>${g}${n ? ', ' + esc(n) : ''}</h2><p>Welcome to Mark’s Savannah Farm</p></div>
    <section class="fh-hero"><h2>Growing food today.<br>Building a better tomorrow.</h2><button class="fh-gold" data-tab="market">Explore the farm ${ic('arrow')}</button></section>
    <section class="fh-live"><div class="fh-row"><h3>${ic('auctions')} Live Auctions</h3><span class="fh-pill">Live</span></div>
      <div class="fh-live-body"><div class="fh-thumb" style="background-image:url('${img(AUCTIONS.live.img)}')"></div><div><h4>${AUCTIONS.live.name}</h4><small>Current bid</small><strong>${ksh(AUCTIONS.live.bid)}</strong><span class="fh-time">${ic('clock')}<b data-left>${fmtLeft(t.end - Date.now())}</b></span><button class="fh-dark" data-tab="auctions">View &amp; Bid ${ic('arrow')}</button></div></div></section>
    <h3 class="fh-h3">What are you looking for today?</h3>
    <div class="fh-tiles">
      <button data-tab="market" data-cat="All"><i style="background-image:url('${img('Cattle%20dropdown.jpg')}')"></i><b>Livestock</b><small>Cattle, goats, sheep, pigs</small></button>
      <a href="${wa("Hello Mark's Savannah Farm, I'd like to ask about your crops.")}" target="_blank" rel="noopener"><i style="background-image:url('${img('Crops.jpg')}')"></i><b>Crops</b><small>Farm produce</small></a>
      <button data-tab="market" data-cat="Poultry"><i style="background-image:url('${img('poultry%20Frming.jpg')}')"></i><b>Poultry</b><small>Layers &amp; broilers</small></button>
      <a href="${wa("Hello Mark's Savannah Farm, I'd like to ask about your dairy products.")}" target="_blank" rel="noopener"><i style="background-image:url('${img('Dairy%20Products.jpg')}')"></i><b>Dairy</b><small>Milk &amp; more</small></a></div>
    <a class="fh-learn" href="blog.html#guide-enterprise" style="background-image:linear-gradient(90deg,#eaf2dcf2 45%,#eaf2dc55),url('${img('Agri-Consultancy.jpg')}')"><h3>${ic('book')} Learn something new</h3><p>Practical farming tips, livestock care and agricultural insights.</p><b>Explore guides ${ic('arrow')}</b></a>`;
  }
  function market() {
    return brand(`<button class="fh-icon" data-tab="saved" aria-label="Saved items">${ic('heart')}${saved().length ? `<em>${saved().length}</em>` : ''}</button>`) + `
    <div class="fh-search"><label>${ic('search')}<input id="fh-q" type="search" placeholder="Search livestock, products…" value="${esc(S.q)}" aria-label="Search"></label><button class="fh-icon" data-sort aria-label="Change sort order">${ic('sort')}</button></div>
    <div class="fh-chips" role="group" aria-label="Category">${CATS.map(c => `<button data-cat="${c}" aria-pressed="${c === S.cat}" class="${c === S.cat ? 'is-on' : ''}">${c}</button>`).join('')}</div>
    <h2 class="fh-h2">Our Marketplace</h2><p class="fh-sub">Quality livestock and farm products</p><div class="fh-grid" id="fh-list"></div>`;
  }
  function fillList() {
    const q = S.q.trim().toLowerCase();
    let L = LISTINGS.filter(p => (S.cat === 'All' || p.cat === S.cat) && (!q || (p.name + ' ' + p.cat + ' ' + p.meta).toLowerCase().includes(q)));
    if (S.sort !== 'recent') L = [...L].sort((a, b) => ((a.price ?? 9e9) - (b.price ?? 9e9)) * (S.sort === 'low' ? 1 : -1));
    $('#fh-list').innerHTML = L.length ? L.map(card).join('') : '<p class="fh-empty">Nothing matches that search. Try another category.</p>';
  }
  function auctions() {
    const t = auctionEnd(), a = AUCTIONS.live, u = AUCTIONS.upcoming, pct = Math.min(100, Math.max(4, (Date.now() - t.start) / (t.end - t.start) * 100));
    const tabs = [['live', 'Live (1)'], ['upcoming', 'Upcoming (1)'], ['bids', 'My Bids'], ['results', 'Results']];
    const live = `<article class="fh-auction"><div class="fh-big" style="background-image:url('${img(a.img)}')"><span class="fh-pill">Live</span></div><h2>${a.name}</h2><p>${a.meta}</p>
      <div class="fh-stats"><div><small>Current Highest Bid</small><b>${ksh(a.bid)}</b></div><div><small>Starting Bid</small><b>${ksh(a.start)}</b></div></div>
      <p class="fh-ends">${ic('clock')} Ends in: <b data-left>${fmtLeft(t.end - Date.now())}</b></p><div class="fh-bar"><span style="width:${pct.toFixed(0)}%"></span></div>
      <div class="fh-bidrow"><a class="fh-dark fh-wide" href="${wa(`Hello Mark's Savannah Farm, I'd like to bid on the ${a.name} (current bid ${ksh(a.bid)}).`)}" target="_blank" rel="noopener">${ic('auctions')} Place Your Bid</a><button class="fh-heart-lg ${saved().includes('auction-bull') ? 'is-on' : ''}" data-save="auction-bull" aria-label="Save auction">${ic('heart')}</button></div></article>`;
    const up = `<article class="fh-up"><div class="fh-thumb" style="background-image:url('${img(u.img)}')"></div><div><h3>${u.name}</h3><small>Auction starts in</small><span class="fh-time">${ic('cal')}<b>${u.days} days</b></span><button class="fh-soft" data-remind aria-pressed="${!!store.get('farm-app-remind', false)}">${ic('bell')} ${store.get('farm-app-remind', false) ? 'Reminder set' : 'Set Reminder'}</button></div></article>`;
    const body = S.atab === 'live' ? live : S.atab === 'upcoming' ? up : `<p class="fh-empty">${S.atab === 'bids' ? 'You have not placed any bids yet. Bids are confirmed with the farm on WhatsApp.' : 'No auction results yet.'}</p>`;
    return title('Auctions', true) + `<div class="fh-chips fh-atabs" role="group" aria-label="Auction views">${tabs.map(([k, l]) => `<button data-atab="${k}" class="${k === S.atab ? 'is-on' : ''}" aria-pressed="${k === S.atab}">${l}</button>`).join('')}</div>${body}${S.atab === 'live' ? `<h3 class="fh-h3">Upcoming Auction</h3>${up}` : ''}`;
  }
  function savedView() {
    const L = LISTINGS.filter(p => saved().includes(p.id));
    return title('Saved') + (L.length ? `<div class="fh-grid">${L.map(card).join('')}</div>` : `<div class="fh-empty fh-blank">${ic('saved', 'fh-big-i')}<p>Nothing saved yet. Tap the heart on any listing to keep it here.</p><button class="fh-dark" data-tab="market">Browse the marketplace</button></div>`);
  }
  function profile() {
    const u = user();
    return title('Profile') + `<div class="fh-me">${ic('user', 'fh-big-i')}<h2>${u.name ? esc(u.name) : 'Your account'}</h2><p>${esc(u.email)}</p></div>
    <nav class="fh-list" aria-label="Account links"><a href="customer-account.html">${ic('user')} Buyer account details</a><a href="${wa("Hello Mark's Savannah Farm, I need some help.")}" target="_blank" rel="noopener">${ic('chat')} Chat with the farm</a><a href="terms-and-conditions.html">${ic('file')} Terms &amp; Conditions</a><a href="privacy-policy.html">${ic('file')} Privacy Policy</a><button data-signout>${ic('out')} Sign out</button></nav>`;
  }
  const VIEWS = { home, market, auctions, saved: savedView, profile };

  function render() {
    $('.fh-scroll').innerHTML = VIEWS[S.tab]();
    if (S.tab === 'market') fillList();
    $('.fh-scroll').scrollTop = 0;
    $$('.fh-nav button').forEach(b => { const on = b.dataset.tab === S.tab; b.classList.toggle('is-on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
  }
  function open() {
    root.innerHTML = '<div class="fh-scroll"></div><nav class="fh-nav" aria-label="Main">' + TABS.map(([k, l]) => `<button data-tab="${k}">${ic(k)}<span>${l}</span></button>`).join('') + '</nav>';
    S.tab = 'home'; render();
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-tab],[data-cat],[data-atab],[data-save],[data-sort],[data-remind],[data-signout]');
    if (!b) return;
    const d = b.dataset;
    if (d.signout !== undefined) { ['savanna-customer-session'].forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); }); location.reload(); return; }
    if (d.save) { const s = saved(), i = s.indexOf(d.save); i < 0 ? s.push(d.save) : s.splice(i, 1); store.set('farm-app-saved', s); render(); toast(i < 0 ? 'Saved' : 'Removed from saved'); return; }
    if (d.sort !== undefined) { S.sort = { recent:'low', low:'high', high:'recent' }[S.sort]; fillList(); toast({ recent:'Sorted: recently listed', low:'Sorted: price low to high', high:'Sorted: price high to low' }[S.sort]); return; }
    if (d.remind !== undefined) { const on = !store.get('farm-app-remind', false); store.set('farm-app-remind', on); render(); toast(on ? 'Reminder noted on this device' : 'Reminder removed'); return; }
    if (d.atab) { S.atab = d.atab; render(); return; }
    if (d.cat && !d.tab) { S.cat = d.cat; render(); return; }
    if (d.cat) S.cat = d.cat;
    if (d.tab) { S.tab = d.tab; render(); }
  });
  root.addEventListener('input', e => { if (e.target.id === 'fh-q') { S.q = e.target.value; fillList(); } });
  setInterval(() => { const t = auctionEnd(); $$('[data-left]').forEach(n => { n.textContent = fmtLeft(t.end - Date.now()); }); }, 30000);
  window.addEventListener('farm-home-open', open);
})();
