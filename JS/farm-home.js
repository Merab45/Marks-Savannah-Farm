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
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', phone:'<path d="M5 3h4l2 5-2.5 1.7a15 15 0 0 0 5.8 5.8L16 13l5 2v4a2 2 0 0 1-2 2C10.2 21 3 13.8 3 5a2 2 0 0 1 2-2Z"/>', check:'<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.7L16 9.5"/>', chev:'<path d="m6 9 6 6 6-6"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>'
  };
  const ic = (n, c = '') => `<svg class="fh-i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const wa = t => 'https://wa.me/254706894568?text=' + encodeURIComponent(t);
  const ksh = n => 'KSh ' + n.toLocaleString('en-KE');
  const img = f => 'Assets/' + f;
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

  const NK = 'Nakuru, Kenya';
  const LISTINGS = [
    { id:'ayrshire-cow', name:'Purebred Ayrshire Cow', cat:'Cattle', meta:'Female · 3 years', price:85000, imgs:['Cattle%20dropdown.jpg'], tag:'For Sale', stock:'In Stock',
      specs:[['Breed','Ayrshire'],['Age','3 years'],['Sex','Female'],['Location',NK],['Weight','420 kg'],['Vaccination','Up to date'],['Health','Excellent']],
      desc:'A healthy and productive dairy cow, well cared for and ready for breeding.' },
    { id:'boran-cow', name:'Boran Cow', cat:'Cattle', meta:'Female · 4 years', price:120000, imgs:['Cattle%20dropdown.jpg'], tag:'For Sale', stock:'In Stock', specs:[['Breed','Boran'],['Age','4 years'],['Sex','Female']], desc:'Ask the farm for weight, vaccination and health details.' },
    { id:'boer-goat', name:'Boer Goat', cat:'Goats', meta:'Male · 8 months', price:18000, imgs:['Goats.jpg'], tag:'For Sale', stock:'In Stock', specs:[['Breed','Boer'],['Age','8 months'],['Sex','Male']], desc:'Ask the farm for weight, vaccination and health details.' },
    { id:'layers', name:'Layers (Brown)', cat:'Poultry', meta:'20 hens', price:3500, imgs:['poultry%20Frming.jpg'], tag:'For Sale', stock:'In Stock', specs:[['Type','Layers (brown)'],['Quantity','20 hens']], desc:'Ask the farm about age and laying history.' },
    { id:'fresh-milk', name:'Fresh Milk', cat:'Dairy', meta:'1 litre', price:120, imgs:['Dairy%20Products.jpg'], tag:'For Sale', stock:'In Stock', specs:[['Product','Fresh milk'],['Volume','1 litre']], desc:'Ask the farm about daily availability and delivery.' },
    { id:'sheep', name:'Sheep', cat:'Sheep', meta:'Ask for details', price:null, imgs:['Sheep.jpg'], tag:'Available', stock:'Available', specs:[], desc:'Contact the farm for breed, age, price and availability.' },
    { id:'pigs', name:'Pigs', cat:'Pigs', meta:'Ask for details', price:null, imgs:['Pigs.jpg'], tag:'Available', stock:'Available', specs:[], desc:'Contact the farm for breed, age, price and availability.' }
  ];
  const CATS = ['All', 'Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs'];
  const DAY = 864e5, HR = 36e5, MIN = 6e4;
  const auctionEnd = () => { let t = store.get('farm-app-demo-auction', null); if (!t) { t = { start: Date.now(), end: Date.now() + 2 * DAY + 14 * HR + 32 * MIN }; store.set('farm-app-demo-auction', t); } return t; };
  // SAMPLE auction data and rules: replace with the farm's real details. Bids are sent to the farm on WhatsApp for confirmation.
  const RULES = ['Each bid must be at least the current highest bid plus the minimum increment.','Bids are confirmed by the farm on WhatsApp before they count.','The winning bidder arranges payment and collection with the farm.','The farm confirms availability and final details before any payment.'];
  const HIST = [[85000,'2 mins ago','john_doe'],[82000,'5 mins ago','farm_kenya'],[80000,'8 mins ago','agri_pro']];
  const AUCTIONS = { live: { name:'Premium Boran Bull', meta:'Male · 3 years · Excellent genetics', bid:85000, start:60000, inc:2000, bidders:12, imgs:['Cattle%20dropdown.jpg'], img:'Cattle%20dropdown.jpg', specs:[['Breed','Boran'],['Age','3 years'],['Sex','Male']] },
                     upcoming: { name:'Boer Goats – 10 Heads', meta:'10 heads · Boer goats', img:'Goats.jpg', imgs:['Goats.jpg'], days:3, start:60000, inc:1000, specs:[['Breed','Boer'],['Quantity','10 heads']] } };
  const AU = id => id === 'goats' ? AUCTIONS.upcoming : AUCTIONS.live;
  const bidsList = () => store.get('farm-app-bids', []);
  const fmtLeft = ms => { ms = Math.max(0, ms); const p = n => String(n).padStart(2, '0'); return `${p(Math.floor(ms / DAY))}d : ${p(Math.floor(ms % DAY / HR))}h : ${p(Math.floor(ms % HR / MIN))}m`; };

  const S = { detail:null, tab:'home', cat:'All', q:'', sort:'recent', atab:'live' };
  const TABS = [['home','Home'], ['market','Marketplace'], ['auctions','Auctions'], ['saved','Saved'], ['profile','Profile']];
  const user = () => { const e = localStorage.getItem('savanna-customer-session') || sessionStorage.getItem('savanna-customer-session'); const u = store.get('savanna-customer-accounts', []).find(a => a.email === e); return { email: e || '', name: u && u.name ? String(u.name) : '' }; };
  const saved = () => store.get('farm-app-saved', []);
  const toast = m => { const t = document.querySelector('.app-toast'); if (!t) return; t.textContent = m; t.classList.add('is-visible'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('is-visible'), 2600); };

  const brand = right => `<header class="fh-top"><a class="fh-brand" href="index.html" aria-label="Mark’s Savannah Farm"><img src="Assets/Glossy%20Green%20Agriculture%20Emblem.png" alt=""><span>Mark’s<br>Savannah Farm</span></a>${right}</header>`;
  const title = (t, back) => `<header class="fh-top fh-top-title">${back ? `<button class="fh-icon" data-tab="home" aria-label="Back">${ic('back')}</button>` : '<span></span>'}<h1>${t}</h1><span></span></header>`;
  const heart = (id, n) => `<button class="fh-heart ${saved().includes(id) ? 'is-on' : ''}" data-save="${id}" aria-label="Save ${esc(n)}" aria-pressed="${saved().includes(id)}">${ic('heart')}</button>`;
  const card = p => `<article class="fh-card"><div class="fh-card-img" style="background-image:url('${img(p.imgs[0])}')"><span class="fh-tag">${p.tag}</span>${heart(p.id, p.name)}</div><div class="fh-card-body"><h3>${p.name}</h3><p>${p.meta}</p><strong>${p.price ? ksh(p.price) : 'Ask for price'}</strong><button class="fh-soft" data-open="product:${p.id}">View Details ${ic('arrow')}</button></div></article>`;
  const gallery = (imgs, badge) => `<div class="fh-galwrap"><div class="fh-gal" tabindex="0" aria-label="Photos, swipe to see more">${imgs.map((f, i) => `<img src="${img(f)}" alt="Photo ${i + 1} of ${imgs.length}" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>${badge || ''}${imgs.length > 1 ? `<span class="fh-count"><b data-gcur>1</b> / ${imgs.length}</span><button class="fh-arr fh-prev" data-gal="-1" aria-label="Previous photo">${ic('back')}</button><button class="fh-arr fh-next" data-gal="1" aria-label="Next photo">${ic('arrow')}</button><div class="fh-dots">${imgs.map(() => '<i></i>').join('')}</div>` : ''}</div>${imgs.length > 1 ? `<div class="fh-thumbs">${imgs.map((f, i) => `<button data-gal-to="${i}" aria-label="Show photo ${i + 1}" style="background-image:url('${img(f)}')"></button>`).join('')}</div>` : ''}`;
  const seller = `<a class="fh-seller" href="about-us.html"><img src="Assets/Glossy%20Green%20Agriculture%20Emblem.png" alt=""><span><small>Sold by:</small><b>Mark’s Savannah Farm</b></span>${ic('arrow')}</a>`;
  const specs = L => L.length ? `<section class="fh-spec"><h3>${ic('file')} Specifications</h3><dl>${L.map(([k, v]) => `<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>` : '';
  const dtop = t => `<header class="fh-top fh-top-title"><button class="fh-icon" data-back aria-label="Back">${ic('back')}</button><h1>${t}</h1><span></span></header>`;
  const auState = (a, id) => id === 'goats' ? 'upcoming' : (auctionEnd().end - Date.now() > 0 ? 'live' : 'ended');

  function product(id) {
    const p = LISTINGS.find(x => x.id === id) || LISTINGS[0], rel = LISTINGS.filter(x => x.id !== p.id && x.cat === p.cat).concat(LISTINGS.filter(x => x.id !== p.id && x.cat !== p.cat)).slice(0, 2);
    const call = '<a class="fh-ghost" href="tel:+254706894568">' + ic('phone') + ' Call</a>';
    return `<header class="fh-top fh-top-title fh-top-brand"><button class="fh-icon" data-back aria-label="Back">${ic('back')}</button><a class="fh-brand" href="index.html"><img src="Assets/Glossy%20Green%20Agriculture%20Emblem.png" alt=""><span>Mark’s<br>Savannah Farm</span></a>${heart(p.id, p.name).replace('fh-heart', 'fh-icon fh-heart-top')}</header>
    ${gallery(p.imgs)}<h1 class="fh-ptitle">${p.name}</h1><div class="fh-meta"><span class="fh-cat">${p.cat}</span><span class="fh-ok">${ic('check')} ${p.stock}</span></div><p class="fh-price">${p.price ? ksh(p.price) : 'Ask for price'}</p>
    ${specs(p.specs)}<section class="fh-desc"><h3>${ic('info')} Description</h3><p>${p.desc}</p></section>${seller}
    <div class="fh-two"><a class="fh-dark fh-wide" href="${wa(`Hello Mark's Savannah Farm, I'm interested in: ${p.name}${p.price ? ' (' + ksh(p.price) + ')' : ''}.`)}" target="_blank" rel="noopener">${ic('chat')} WhatsApp</a>${call}</div>
    <a class="fh-gold fh-full" href="${wa(`Hello Mark's Savannah Farm, I'd like to enquire about: ${p.name}.`)}" target="_blank" rel="noopener">${ic('chat')} Enquire Now</a>
    ${rel.length ? `<h3 class="fh-h3">Related products</h3><div class="fh-grid">${rel.map(card).join('')}</div>` : ''}`;
  }
  function auctionDetail(id) {
    const a = AU(id), st = auState(a, id), t = auctionEnd(), left = t.end - Date.now(), pct = Math.min(100, Math.max(4, (Date.now() - t.start) / (t.end - t.start) * 100));
    const badge = `<span class="fh-pill fh-status fh-${st}">${st === 'live' ? '<i></i>' : ''}${st.toUpperCase()}</span>`;
    const mine = bidsList().filter(b => b.id === id);
    const action = st === 'live' ? `<button class="fh-dark fh-full" data-bid="${id}">${ic('auctions')} Place Your Bid</button><p class="fh-note-box">${ic('bell')} Keep this app open and check My Bids for updates.</p>`
      : st === 'upcoming' ? `<button class="fh-soft fh-full" data-remind aria-pressed="${!!store.get('farm-app-remind', false)}">${ic('bell')} ${store.get('farm-app-remind', false) ? 'Reminder set' : 'Set Reminder'}</button>`
      : `<div class="fh-result">${ic('check')}<div><b>Auction ended</b><p>Closing bid: ${ksh(a.bid)}. Contact the farm about the result.</p></div></div><a class="fh-ghost fh-full" href="${wa(`Hello Mark's Savannah Farm, I'm asking about the result of the ${a.name} auction.`)}" target="_blank" rel="noopener">${ic('chat')} Ask about the result</a>`;
    return dtop('Auctions').replace('<span></span></header>', heart('auction-' + id, a.name).replace('fh-heart', 'fh-icon fh-heart-top') + '</header>') + gallery(a.imgs, badge) + `<h1 class="fh-ptitle">${a.name}</h1><p class="fh-sub">${a.meta || 'Male · 3 years · Excellent genetics'}</p>
    <div class="fh-stats"><div><small>${st === 'upcoming' ? 'Starting Bid' : 'Current Highest Bid'}</small><b>${ksh(st === 'upcoming' ? a.start : a.bid)}</b></div><div><small>Starting Bid</small><b>${ksh(a.start)}</b></div></div>
    ${st === 'upcoming' ? `<p class="fh-ends">${ic('clock')} Starts in <b>${a.days} days</b></p>` : `<p class="fh-ends">${ic('clock')} ${st === 'live' ? 'Ends in' : 'Ended'} <b data-left>${st === 'live' ? fmtLeft(left) : '00d : 00h : 00m'}</b></p><div class="fh-bar"><span style="width:${st === 'live' ? pct.toFixed(0) : 100}%"></span></div>`}
    <div class="fh-two fh-info"><div>${ic('market')}<span><small>Minimum Increment</small><b>${ksh(a.inc)}</b></span></div>${a.bidders ? `<div>${ic('user')}<b>${a.bidders} Bidders</b></div>` : ''}</div>
    ${specs(a.specs)}
    ${id === 'goats' ? '' : `<h3 class="fh-h3">${ic('auctions')} Bidding History</h3><table class="fh-hist"><tbody>${HIST.map(r => `<tr><td>${ksh(r[0])}</td><td>${r[1]}</td><td>(${r[2]})</td></tr>`).join('')}</tbody></table><p class="fh-fine">Sample bids shown for this prototype.</p>${mine.length ? `<h3 class="fh-h3">Your bids</h3><table class="fh-hist"><tbody>${mine.map(b => `<tr><td>${ksh(b.amount)}</td><td>${new Date(b.time).toLocaleString('en-KE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</td><td>Sent to farm</td></tr>`).join('')}</tbody></table>` : ''}`}
    <details class="fh-rules"><summary>${ic('file')} Auction Rules ${ic('chev')}</summary><ul>${RULES.map(r => `<li>${r}</li>`).join('')}</ul></details>${seller}${action}`;
  }
  function sheet(id) {
    const a = AU(id), min = a.bid + a.inc; let amt = min;
    const el = document.createElement('div'); el.className = 'fh-sheet';
    const close = () => { el.remove(); };
    const step1 = (err = '') => { el.innerHTML = `<div class="fh-sheet-card" role="dialog" aria-modal="true" aria-label="Place your bid"><h2>Place your bid</h2><p>${a.name}. Current highest bid ${ksh(a.bid)}.</p><label for="fh-amt">Your bid (KSh)</label><input id="fh-amt" type="number" inputmode="numeric" min="${min}" step="${a.inc}" value="${amt}"><div class="fh-chips"><button data-q="${min}">Minimum ${ksh(min)}</button><button data-q="${min + a.inc}">${ksh(min + a.inc)}</button><button data-q="${min + a.inc * 3}">${ksh(min + a.inc * 3)}</button></div><p class="fh-err" role="alert">${err}</p><button class="fh-dark fh-full" data-go="2">Review bid</button><button class="fh-ghost fh-full" data-x>Cancel</button></div>`; $('#fh-amt', el).focus(); };
    const step2 = () => { el.innerHTML = `<div class="fh-sheet-card" role="dialog" aria-modal="true" aria-label="Review your bid"><h2>Review your bid</h2><dl class="fh-rev"><div><dt>Animal</dt><dd>${a.name}</dd></div><div><dt>Your bid</dt><dd>${ksh(amt)}</dd></div><div><dt>Current highest</dt><dd>${ksh(a.bid)}</dd></div></dl><p class="fh-fine">Confirming opens WhatsApp with your bid ready to send. The farm confirms it before it counts.</p><button class="fh-dark fh-full" data-go="3">Confirm bid</button><button class="fh-ghost fh-full" data-go="1">Change amount</button></div>`; };
    const step3 = () => { const L = bidsList(); L.unshift({ id, amount: amt, time: Date.now() }); store.set('farm-app-bids', L); window.open(wa(`Hello Mark's Savannah Farm, I'd like to place a bid of ${ksh(amt)} on the ${a.name}.`), '_blank', 'noopener'); el.innerHTML = `<div class="fh-sheet-card"><h2>Bid ready to send</h2><p>Send the WhatsApp message to finish. Your bid of ${ksh(amt)} is saved under My Bids as awaiting confirmation.</p><button class="fh-dark fh-full" data-done>Done</button></div>`; };
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (e.target === el) return close(); if (!b) return;
      if (b.dataset.x !== undefined) return close();
      if (b.dataset.done !== undefined) { close(); render(); return; }
      if (b.dataset.q) { $('#fh-amt', el).value = b.dataset.q; return; }
      if (b.dataset.go === '1') return step1();
      if (b.dataset.go === '2') { const v = Math.round(Number($('#fh-amt', el).value)); if (!v || v < min) return step1(`Your bid must be at least ${ksh(min)}.`); amt = v; return step2(); }
      if (b.dataset.go === '3') step3();
    });
    el.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    root.appendChild(el); step1();
  }
  function home() {
    const n = user().name.split(' ')[0], h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const t = auctionEnd();
    return brand(`<a class="fh-icon" href="${wa("Hello Mark's Savannah Farm, I'd like to make an enquiry.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ic('chat')}</a>`) + `
    <div class="fh-greet"><h2>${g}${n ? ', ' + esc(n) : ''}</h2><p>Welcome to Mark’s Savannah Farm</p></div>
    <section class="fh-hero"><h2>Growing food today.<br>Building a better tomorrow.</h2><button class="fh-gold" data-tab="market">Explore the farm ${ic('arrow')}</button></section>
    <section class="fh-live"><div class="fh-row"><h3>${ic('auctions')} Live Auctions</h3><span class="fh-pill">Live</span></div>
      <div class="fh-live-body"><div class="fh-thumb" style="background-image:url('${img(AUCTIONS.live.img)}')"></div><div><h4>${AUCTIONS.live.name}</h4><small>Current bid</small><strong>${ksh(AUCTIONS.live.bid)}</strong><span class="fh-time">${ic('clock')}<b data-left>${fmtLeft(t.end - Date.now())}</b></span><button class="fh-dark" data-open="auction:bull">View &amp; Bid ${ic('arrow')}</button></div></div></section>
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
      <div class="fh-bidrow"><button class="fh-dark fh-wide" data-open="auction:bull">${ic('auctions')} Place Your Bid</button><button class="fh-heart-lg ${saved().includes('auction-bull') ? 'is-on' : ''}" data-save="auction-bull" aria-label="Save auction">${ic('heart')}</button></div></article>`;
    const up = `<article class="fh-up"><div class="fh-thumb" style="background-image:url('${img(u.img)}')"></div><div><h3><button class="fh-link" data-open="auction:goats">${u.name}</button></h3><small>Auction starts in</small><span class="fh-time">${ic('cal')}<b>${u.days} days</b></span><button class="fh-soft" data-remind aria-pressed="${!!store.get('farm-app-remind', false)}">${ic('bell')} ${store.get('farm-app-remind', false) ? 'Reminder set' : 'Set Reminder'}</button></div></article>`;
    const body = S.atab === 'live' ? live : S.atab === 'upcoming' ? up : S.atab === 'bids' ? (bidsList().length ? `<div class="fh-list">${bidsList().map(b => `<button data-open="auction:bull"><span>${ksh(b.amount)} on ${AU('bull').name}<br><small>Sent to the farm, awaiting confirmation</small></span></button>`).join('')}</div>` : '<p class="fh-empty">You have not placed any bids yet. Bids are confirmed with the farm on WhatsApp.</p>') : '<p class="fh-empty">No auction results yet.</p>';
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
    const d = S.detail;
    $('.fh-scroll').innerHTML = d ? (d.type === 'product' ? product(d.id) : auctionDetail(d.id)) : VIEWS[S.tab]();
    if (S.tab === 'market' && !d) fillList();
    $('.fh-scroll').scrollTop = 0;
    $$('.fh-nav button').forEach(b => { const on = b.dataset.tab === (d ? (d.type === 'product' ? 'market' : 'auctions') : S.tab); b.classList.toggle('is-on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
  }
  function open() {
    root.innerHTML = '<div class="fh-scroll"></div><nav class="fh-nav" aria-label="Main">' + TABS.map(([k, l]) => `<button data-tab="${k}">${ic(k)}<span>${l}</span></button>`).join('') + '</nav>';
    S.tab = 'home'; render();
  }
  root.addEventListener('click', e => {
    const g = e.target.closest('[data-gal],[data-gal-to]');
    if (g) { const r = $('.fh-gal'), n = r.children.length, w = r.clientWidth, i = g.dataset.galTo !== undefined ? +g.dataset.galTo : Math.min(n - 1, Math.max(0, Math.round(r.scrollLeft / w) + +g.dataset.gal)); r.scrollTo({ left: i * w, behavior: 'smooth' }); return; }
    const b = e.target.closest('[data-open],[data-back],[data-bid],[data-tab],[data-cat],[data-atab],[data-save],[data-sort],[data-remind],[data-signout]');
    if (!b) return;
    const d = b.dataset;
    if (d.open) { const [type, id] = d.open.split(':'); S.detail = { type, id }; render(); return; }
    if (d.back !== undefined) { S.detail = null; render(); return; }
    if (d.bid) { sheet(d.bid); return; }
    if (d.tab) S.detail = null;
    if (d.signout !== undefined) { ['savanna-customer-session'].forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); }); location.reload(); return; }
    if (d.save) { const s = saved(), i = s.indexOf(d.save); i < 0 ? s.push(d.save) : s.splice(i, 1); store.set('farm-app-saved', s); render(); toast(i < 0 ? 'Saved' : 'Removed from saved'); return; }
    if (d.sort !== undefined) { S.sort = { recent:'low', low:'high', high:'recent' }[S.sort]; fillList(); toast({ recent:'Sorted: recently listed', low:'Sorted: price low to high', high:'Sorted: price high to low' }[S.sort]); return; }
    if (d.remind !== undefined) { const on = !store.get('farm-app-remind', false); store.set('farm-app-remind', on); render(); toast(on ? 'Reminder noted on this device' : 'Reminder removed'); return; }
    if (d.atab) { S.atab = d.atab; render(); return; }
    if (d.cat && !d.tab) { S.cat = d.cat; render(); return; }
    if (d.cat) S.cat = d.cat;
    if (d.tab) { S.tab = d.tab; render(); }
  });
  root.addEventListener('scroll', e => { const r = e.target; if (!r.classList || !r.classList.contains('fh-gal')) return; const i = Math.round(r.scrollLeft / r.clientWidth), w = r.parentElement; const c = $('[data-gcur]', w); if (c) c.textContent = i + 1; $$('.fh-dots i', w).forEach((x, k) => x.classList.toggle('is-on', k === i)); $$('.fh-thumbs button').forEach((x, k) => x.classList.toggle('is-on', k === i)); }, true);
  root.addEventListener('input', e => { if (e.target.id === 'fh-q') { S.q = e.target.value; fillList(); } });
  setInterval(() => { const t = auctionEnd(); $$('[data-left]').forEach(n => { n.textContent = fmtLeft(t.end - Date.now()); }); }, 30000);
  window.addEventListener('farm-home-open', open);
  window.farmHomeReady = true;
})();
