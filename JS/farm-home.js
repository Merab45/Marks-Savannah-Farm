// Signed-in app screens: Home, Marketplace, Auctions, Saved, Profile.
// Marketplace listings are sample records; auction schedules and bids use the shared auction core.
(() => {
  const root = document.getElementById('screen-home');
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const P = {
    home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    market:'<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9"/><path d="M5 12v8h14v-8"/>',
    cart:'<path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/>',
    cart:'<path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/>',
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
    { id:'ayrshire-cow', name:'Dairy cows & heifers', cat:'Cattle', meta:'Ask for breed, age and records', price:null, imgs:['Cattle%20dropdown.jpg'], tag:'Ask the farm', stock:'Confirm availability',
      specs:[['Breed','Confirm for each animal'],['Age','Confirm for each animal'],['Sex','Confirm for each animal'],['Health records','Ask the farm'],['Inspection','Arrange with the farm']],
      desc:'Dairy cattle for milk production and herd development. Ask the farm for the individual animal’s breed, age, lactation details, health and vaccination records, inspection arrangements, and transport options.' },
    { id:'boran-cow', name:'Boran cattle', cat:'Cattle', meta:'Ask for breed, age and records', price:null, imgs:['Cattle%20dropdown.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Breed','Confirm with farm'],['Age','Confirm with farm'],['Sex','Confirm with farm']], desc:'Ask the farm for the individual animal’s weight, vaccination, health, inspection, and transport details.' },
    { id:'boer-goat', name:'Meat goats', cat:'Goats', meta:'Ask for breed, age and records', price:null, imgs:['Goats.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Breed','Confirm with farm'],['Age','Confirm with farm'],['Purpose','Meat, breeding, or herd growth']], desc:'Goats for meat production, breeding, or herd growth. Confirm breed, sex, age, size, health information, quantity, and delivery arrangements.' },
    { id:'layers', name:'Point-of-lay hens & layers', cat:'Poultry', meta:'Ask about age and quantity', price:null, imgs:['poultry%20Frming.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Type','Layers or point-of-lay hens'],['Quantity','Confirm with farm']], desc:'Chickens for egg production. Ask about bird age, breed or strain, vaccination records, laying status, minimum order quantity, and collection arrangements.' },
    { id:'fresh-milk', name:'Fresh milk', cat:'Dairy', meta:'Ask about packaging and supply', price:null, imgs:['Dairy%20Products.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product','Fresh milk'],['Packaging','Confirm with farm']], desc:'Fresh farm milk for household or regular supply. Confirm daily availability, packaging, cold handling, quantity, collection time, and delivery options.' },
    { id:'sheep', name:'Sheep: ewes, rams & lambs', cat:'Sheep', meta:'Ask for breed, age and records', price:null, imgs:['Sheep.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[], desc:'Contact the farm for breed, age, sex, size, health information, price, and availability for individual animals.' },
    { id:'pigs', name:'Pigs', cat:'Pigs', meta:'Ask for details', price:null, imgs:['Pigs.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[], desc:'Contact the farm for breed, age, price and availability.' },
    { id:'maize', name:'Maize', cat:'Crops', meta:'Seasonal produce', price:null, imgs:['Crops.jpg'], tag:'Seasonal', stock:'Confirm availability', specs:[['Category','Grain'],['Supply','Seasonal']], desc:'Ask about available quantities, harvest timing, and bulk supply.' },
    { id:'wheat', name:'Wheat', cat:'Crops', meta:'Seasonal produce', price:null, imgs:['Crops.jpg'], tag:'Seasonal', stock:'Confirm availability', specs:[['Category','Grain'],['Supply','Seasonal']], desc:'Enquire about seasonal availability and suitable order volumes.' },
    { id:'sorghum', name:'Sorghum', cat:'Crops', meta:'Seasonal produce', price:null, imgs:['Crops.jpg'], tag:'Seasonal', stock:'Confirm availability', specs:[['Category','Grain'],['Supply','Seasonal']], desc:'Ask about available varieties, quantities, and collection or delivery.' },
    { id:'beans', name:'Beans', cat:'Crops', meta:'Seasonal produce', price:null, imgs:['Crops.jpg'], tag:'Seasonal', stock:'Confirm availability', specs:[['Category','Legume'],['Supply','Seasonal']], desc:'Share the type and quantity you need and ask what is currently available.' },
    { id:'eggs', name:'Farm Eggs', cat:'Poultry', meta:'Chicken eggs', price:null, imgs:['poultry%20Frming.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product','Chicken eggs'],['Supply','Ask for current quantities']], desc:'Ask about egg sizes, quantities, collection, and delivery options.' },
    { id:'ducks', name:'Ducks', cat:'Poultry', meta:'Birds for sale', price:null, imgs:['poultry%20Frming.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Type','Duck'],['Price','On request']], desc:'Contact the farm to confirm duck type, age, quantity, and availability.' },
    { id:'turkeys', name:'Turkeys', cat:'Poultry', meta:'Birds for sale', price:null, imgs:['Turkeys.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Type','Turkey'],['Price','On request']], desc:'Contact the farm to confirm age, quantity, and current availability.' },
    { id:'ghee', name:'Farm Ghee', cat:'Dairy', meta:'Dairy product', price:null, imgs:['Dairy%20Products.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product','Ghee'],['Price','On request']], desc:'Ask about pack sizes, current availability, and collection or delivery.' },
    { id:'equipment', name:'Farm Equipment', cat:'Equipment', meta:'Equipment enquiries', price:null, imgs:['Farm%20Equipments.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Category','Farm equipment'],['Price','On request']], desc:'Tell us what equipment you need so the farm can confirm specifications and availability.' },
    { id:'consultancy', name:'Agri-consultancy', cat:'Services', meta:'Farm advice and planning', price:null, imgs:['Agri-Consultancy.jpg'], tag:'Enquire', stock:'By consultation', specs:[['Service','Farm planning and advice'],['Fee','On request']], desc:'Share your farm goals and location to discuss suitable support and consultation fees.' }
    ,{ id:'broilers', name:'Broiler chickens', cat:'Poultry', meta:'Ask about age and quantities', price:null, imgs:['poultry%20Frming.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Type','Broiler'],['Age','Confirm with farm'],['Vaccination','Ask the farm']], desc:'Ask whether day-old chicks, growers, or mature birds are available. Confirm age, health information, minimum quantities, and readiness dates.' }
    ,{ id:'kienyeji-chicken', name:'Kienyeji chicken', cat:'Poultry', meta:'Ask about type and quantities', price:null, imgs:['poultry%20Frming.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Type','Kienyeji chicken'],['Age','Confirm with farm'],['Quantity','Confirm with farm']], desc:'Confirm the type, age, sex, health records, quantity, and transport arrangements for available birds.' }
    ,{ id:'fermented-milk', name:'Fermented milk', cat:'Dairy', meta:'Ask about packaging and supply', price:null, imgs:['Dairy%20Products.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product','Fermented milk'],['Packaging','Confirm with farm']], desc:'Ask about current batch, pack sizes, ingredients, storage needs, dates, collection, and delivery.' }
    ,{ id:'yoghurt', name:'Yoghurt', cat:'Dairy', meta:'Ask about pack sizes', price:null, imgs:['Dairy%20Products.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product','Yoghurt'],['Flavours','Confirm with farm']], desc:'Confirm available flavours, ingredients, pack sizes, storage, and batch date before ordering.' }
    ,{ id:'butter', name:'Butter & cream', cat:'Dairy', meta:'Ask about current products', price:null, imgs:['Dairy%20Products.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product','Butter or cream'],['Packaging','Confirm with farm']], desc:'Ask which products and pack sizes are currently available and how chilled handling and delivery are arranged.' }
    ,{ id:'peas', name:'Peas', cat:'Crops', meta:'Seasonal produce', price:null, imgs:['Crops.jpg'], tag:'Seasonal', stock:'Confirm availability', specs:[['Category','Legume'],['Supply','Seasonal']], desc:'Ask about the current crop, quality, quantity, packaging, and collection or delivery.' }
    ,{ id:'potatoes', name:'Potatoes', cat:'Crops', meta:'Seasonal produce', price:null, imgs:['Crops.jpg'], tag:'Seasonal', stock:'Confirm availability', specs:[['Grade','Confirm with farm'],['Supply','Seasonal']], desc:'Confirm variety, size or grade, bag weight, quantity, and harvest timing.' }
    ,{ id:'vegetables', name:'Seasonal vegetables', cat:'Crops', meta:'Seasonal produce', price:null, imgs:['Crops.jpg'], tag:'Seasonal', stock:'Confirm availability', specs:[['Varieties','Confirm with farm'],['Supply','Seasonal']], desc:'Ask for currently available varieties, grade, quantities, and collection dates.' }
    ,{ id:'fodder', name:'Fodder crops & hay', cat:'Crops', meta:'Livestock feed', price:null, imgs:['Crops.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Unit','Bale or load'],['Supply','Confirm with farm']], desc:'Confirm forage type, bale or load size, storage condition, quantity, and delivery access.' }
    ,{ id:'tractor', name:'Tractors & field machinery', cat:'Equipment', meta:'Ask about models and condition', price:null, imgs:['Farm%20Equipments.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Make & model','Confirm with farm'],['Condition','Confirm with farm']], desc:'Request model, condition, capacity, inspection, service history, accessories, warranty if offered, and transport details.' }
    ,{ id:'ploughs', name:'Ploughs, harrows & planters', cat:'Equipment', meta:'Match to tractor and field', price:null, imgs:['Farm%20Equipments.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Compatibility','Confirm with farm'],['Condition','Confirm with farm']], desc:'Share tractor compatibility, crop, acreage, working width, and preferred condition so the farm can confirm options.' }
    ,{ id:'irrigation', name:'Pumps, tanks & irrigation', cat:'Equipment', meta:'Ask for specifications', price:null, imgs:['Farm%20Equipments.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Capacity','Confirm with farm'],['Power','Confirm with farm']], desc:'Confirm your water source, flow or storage needs, power availability, pipe sizes, and installation requirements.' }
    ,{ id:'sprayers', name:'Sprayers & crop-care equipment', cat:'Equipment', meta:'Ask for type and capacity', price:null, imgs:['Farm%20Equipments.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Type','Confirm with farm'],['Capacity','Confirm with farm']], desc:'Ask about sprayer type, capacity, condition, included components, and intended use.' }
    ,{ id:'seeds', name:'Seeds & planting materials', cat:'Farm inputs', meta:'Ask for variety and pack size', price:null, imgs:['Crops.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Crop','Confirm with farm'],['Variety','Confirm with farm']], desc:'Confirm the exact crop, variety, pack size, season, and suitability for your location before ordering.' }
    ,{ id:'organic-fertilizer', name:'Compost & manure', cat:'Farm inputs', meta:'Ask about source and quantity', price:null, imgs:['Crops.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Source','Confirm with farm'],['Packaging','Bag or load']], desc:'Confirm source, maturity, quantity, packaging, delivery access, and suitability for your intended use.' }
    ,{ id:'soil-amendments', name:'Agricultural lime & soil amendments', cat:'Farm inputs', meta:'Exact product confirmed on request', price:null, imgs:['Crops.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product analysis','Confirm with farm'],['Packaging','Confirm with farm']], desc:'Ask for the exact product, analysis, pack size, and intended application. Soil test results can help guide selection.' }
    ,{ id:'mineral-fertilizer', name:'Mineral fertilizers', cat:'Farm inputs', meta:'Ask for product and analysis', price:null, imgs:['Crops.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product & analysis','Confirm with farm'],['Pack size','Confirm with farm']], desc:'Request the product name, nutrient analysis, pack size, and label information. Follow label instructions and qualified local advice.' }
    ,{ id:'crop-protection', name:'Registered crop-protection products', cat:'Farm inputs', meta:'Exact product confirmed on request', price:null, imgs:['Crops.jpg'], tag:'Ask the farm', stock:'Confirm availability', specs:[['Product registration','Confirm with farm'],['Label & use','Confirm before sale']], desc:'Share the crop and concern so the farm can confirm the exact approved product, label directions, protective equipment, and restrictions before any sale.' }
  ];
  const CATS = ['All', 'Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs', 'Crops', 'Dairy', 'Equipment', 'Farm inputs', 'Services'];
  const auctionMarket = window.FarmAuctions;
  const AU = id => auctionMarket.get(({bull:'boran-bull',goats:'boer-goats'})[id] || id);
  const bidsList = () => auctionMarket.myBids();
  const fmtLeft = ms => auctionMarket.remaining(ms);
  const RULES = ['Bids must meet the displayed minimum and increment.','Bidder names and contact details are private; only bid amounts are shown publicly.','Bids close automatically at the displayed time.','The farm can be contacted to arrange the outcome after the auction closes.'];

  const S = { detail:null, tab:'home', cat:'All', q:'', sort:'recent', atab:'live' };
  const TABS = [['home','Home'], ['market','Marketplace'], ['auctions','Auctions'], ['saved','Saved'], ['profile','Profile']];
  const user = () => { const e = localStorage.getItem('savanna-customer-session') || sessionStorage.getItem('savanna-customer-session'); const u = store.get('savanna-customer-accounts', []).find(a => a.email === e); return { email: e || '', name: u && u.name ? String(u.name) : '' }; };
  const saved = () => store.get('farm-app-saved', []);
  const cartItems = () => {
    const items = store.get('savanna-farm-shop-cart', []);
    return Array.isArray(items) ? items.filter(item => item && typeof item === 'object' && item.id) : [];
  };
  const cartCount = () => cartItems().reduce((total, item) => total + Math.max(1, Number(item.quantity) || 1), 0);
  const cartButton = () => `<button class="fh-icon fh-cart-button" data-shop-cart aria-label="Open cart, ${cartCount()} items">${ic('cart')}<em data-app-cart-count>${cartCount()}</em></button>`;
  const topActions = extra => `<div class="fh-top-actions">${extra || ''}${cartButton()}</div>`;
  const toast = m => { const t = document.querySelector('.app-toast'); if (!t) return; t.textContent = m; t.classList.add('is-visible'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('is-visible'), 2600); };

  const brand = right => `<header class="fh-top"><a class="fh-brand" href="index.html" aria-label="Mark’s Savannah Farm"><img src="Assets/Glossy%20Green%20Agriculture%20Emblem.png" alt=""><span>Mark’s<br>Savannah Farm</span></a>${right}</header>`;
  const title = (t, back) => `<header class="fh-top fh-top-title">${back ? `<button class="fh-icon" data-tab="home" aria-label="Back">${ic('back')}</button>` : '<span></span>'}<h1>${t}</h1>${topActions()}</header>`;
  const heart = (id, n) => `<button class="fh-heart ${saved().includes(id) ? 'is-on' : ''}" data-save="${id}" aria-label="Save ${esc(n)}" aria-pressed="${saved().includes(id)}">${ic('heart')}</button>`;
  const card = p => `<article class="fh-card"><div class="fh-card-img" style="background-image:url('${img(p.imgs[0])}')"><span class="fh-tag">${p.tag}</span>${heart(p.id, p.name)}</div><div class="fh-card-body"><h3>${p.name}</h3><p>${p.meta}</p><strong>${p.price ? ksh(p.price) : 'Ask for price'}</strong><button class="fh-soft" data-open="product:${p.id}">View Details ${ic('arrow')}</button></div></article>`;
  const gallery = (imgs, badge, label = 'Farm listing') => `<div class="fh-galwrap"><div class="fh-gal" tabindex="0" aria-label="Photos, swipe to see more">${imgs.map((f, i) => `<img src="${img(f)}" alt="${esc(label)} photo ${i + 1} of ${imgs.length}" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>${badge || ''}${imgs.length > 1 ? `<span class="fh-count"><b data-gcur>1</b> / ${imgs.length}</span><button class="fh-arr fh-prev" data-gal="-1" aria-label="Previous photo">${ic('back')}</button><button class="fh-arr fh-next" data-gal="1" aria-label="Next photo">${ic('arrow')}</button><div class="fh-dots">${imgs.map(() => '<i></i>').join('')}</div>` : ''}</div>${imgs.length > 1 ? `<div class="fh-thumbs">${imgs.map((f, i) => `<button data-gal-to="${i}" aria-label="Show photo ${i + 1}" style="background-image:url('${img(f)}')"></button>`).join('')}</div>` : ''}`;
  const seller = `<a class="fh-seller" href="about-us.html"><img src="Assets/Glossy%20Green%20Agriculture%20Emblem.png" alt=""><span><small>Sold by:</small><b>Mark’s Savannah Farm</b></span>${ic('arrow')}</a>`;
  const specs = L => L.length ? `<section class="fh-spec"><h3>${ic('file')} Specifications</h3><dl>${L.map(([k, v]) => `<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>` : '';
  const dtop = (t, extra) => `<header class="fh-top fh-top-title"><button class="fh-icon" data-back aria-label="Back">${ic('back')}</button><h1>${t}</h1>${topActions(extra)}</header>`;
  const auState = a => a.status;

  function product(id) {
    const p = LISTINGS.find(x => x.id === id) || LISTINGS[0], rel = LISTINGS.filter(x => x.id !== p.id && x.cat === p.cat).concat(LISTINGS.filter(x => x.id !== p.id && x.cat !== p.cat)).slice(0, 2);
    const actions = p.cat === 'Services'
      ? `<a class="fh-dark fh-full" href="${wa(`Hello Mark's Savannah Farm, I'd like to discuss consultancy: ${p.name}.`)}" target="_blank" rel="noopener">${ic('chat')} Discuss consultancy on WhatsApp</a>`
      : `<button class="fh-dark fh-full" data-add-cart="${esc(p.id)}">Add to order ${ic('cart')}</button><a class="fh-ghost fh-full" href="shop.html#shop-cart">Review cart &amp; checkout</a>`;
    return `<header class="fh-top fh-top-title fh-top-brand"><button class="fh-icon" data-back aria-label="Back to marketplace">${ic('back')}</button><a class="fh-brand" href="index.html"><img src="Assets/Glossy%20Green%20Agriculture%20Emblem.png" alt=""><span>Mark’s<br>Savannah Farm</span></a>${topActions(heart(p.id, p.name).replace('fh-heart', 'fh-icon fh-heart-top'))}</header>
    ${gallery(p.imgs, '', p.name)}<h1 class="fh-ptitle">${esc(p.name)}</h1><div class="fh-meta"><span class="fh-cat">${esc(p.cat)}</span><span class="fh-ok">${ic('check')} ${esc(p.stock)}</span></div><p class="fh-price">${p.price ? ksh(p.price) : 'Price on request'}</p>
    ${specs(p.specs)}<section class="fh-desc"><h3>${ic('info')} About this item</h3><p>${esc(p.desc)}</p></section>${seller}
    ${actions}
    ${rel.length ? `<h3 class="fh-h3">Related products</h3><div class="fh-grid">${rel.map(card).join('')}</div>` : ''}`;
  }
  function auctionDetail(id) {
    const a = AU(id), st = auState(a), left = a.endsAt - Date.now(), pct = Math.min(100, Math.max(0, ((Date.now() - a.startsAt) / (a.endsAt - a.startsAt)) * 100));
    const badge = `<span class="fh-pill fh-status fh-${st}">${st === 'live' ? '<i></i>' : ''}${st.toUpperCase()}</span>`;
    const mine = bidsList().filter(b => b.auctionId === a.id);
    const action = st === 'live' ? `<button class="fh-dark fh-full" data-bid="${a.id}">${ic('auctions')} Place Your Bid</button>`
      : st === 'upcoming' ? `<button class="fh-soft fh-full" data-remind aria-pressed="${!!store.get('farm-app-remind', false)}">${ic('bell')} ${store.get('farm-app-remind', false) ? 'Reminder set' : 'Set Reminder'}</button>`
      : `<div class="fh-result">${ic('check')}<div><b>Auction closed</b><p>The farm can now be contacted to confirm the result and arrange the next steps.</p></div></div><a class="fh-ghost fh-full" href="mailto:meraprenish@gmail.com?subject=${encodeURIComponent(`Closed auction: ${a.name}`)}">${ic('chat')} Contact farm about closed auction</a>`;
    const stats = `<div class="fh-stats"><div><small>${st === 'upcoming' ? 'Opening Bid' : 'Current Highest Bid'}</small><b data-auction-highest="${a.id}">${ksh(a.highestBid)}</b></div><div><small>Starting Bid</small><b>${ksh(a.startBid)}</b></div></div><div class="fh-stats"><div><small>Minimum Increment</small><b>${ksh(a.increment)}</b></div><div><small>Lot size</small><b>${esc(a.quantity)}</b></div></div>`;
    const publicBids = a.bids.length ? `<section class="fh-spec fh-auction-bids"><h3>${ic('user')} Bid amounts · identities private</h3><ul>${a.bids.map(bid => `<li><span>Anonymous bidder</span><b>${ksh(bid.amount)}</b></li>`).join('')}</ul></section>` : '<p class="fh-fine">No bids have been placed yet.</p>';
    const userBids = mine.length ? `<h3 class="fh-h3">Your bids</h3><table class="fh-hist"><tbody>${mine.map(b => `<tr><td>${ksh(b.amount)}</td><td>${new Date(b.placedAt).toLocaleString('en-KE', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</td><td>Recorded</td></tr>`).join('')}</tbody></table>` : '';
    const countdown = st === 'upcoming' ? `Starts in <b data-auction-countdown data-auction-state="${st}" data-auction-start="${a.startsAt}" data-auction-end="${a.endsAt}">${fmtLeft(a.startsAt - Date.now())}</b>` : `${st === 'live' ? 'Ends in' : 'Ended'} <b data-auction-countdown data-auction-state="${st}" data-auction-start="${a.startsAt}" data-auction-end="${a.endsAt}">${st === 'live' ? fmtLeft(left) : '00d : 00h : 00m : 00s'}</b>`;
    return dtop('Auction details', heart('auction-' + id, a.name).replace('fh-heart', 'fh-icon fh-heart-top')) + gallery(a.imgs, badge, a.name) + `<h1 class="fh-ptitle">${esc(a.name)}</h1><p class="fh-sub">${esc(a.meta || 'Livestock auction')}</p>
    <p class="fh-ends">${ic('clock')} ${countdown}</p><div class="fh-bar"><span style="width:${st === 'upcoming' ? 0 : pct.toFixed(0)}%"></span></div>
    ${stats}<div class="fh-auction-disclosure">${esc(a.summary)}</div>${specs(a.specs)}${publicBids}${userBids}
    <details class="fh-rules"><summary>${ic('file')} Auction Rules ${ic('chev')}</summary><ul>${RULES.map(r => `<li>${r}</li>`).join('')}</ul></details>${seller}${action}`;
  }
  function sheet(id) {
    const a = AU(id), min = auctionMarket.minBid(a); let amt = min;
    const el = document.createElement('div'); el.className = 'fh-sheet';
    const close = () => { el.remove(); };
    const step1 = (err = '') => { const current = AU(id), next = auctionMarket.minBid(current); el.innerHTML = `<div class="fh-sheet-card" role="dialog" aria-modal="true" aria-label="Place your bid"><h2>Place your bid</h2><p>${esc(a.name)} · Current highest ${ksh(current.highestBid)} · Minimum ${ksh(next)}</p><label for="fh-amt">Your bid (KSh)</label><input id="fh-amt" type="number" inputmode="numeric" min="${next}" step="${a.increment}" value="${Math.max(amt,next)}"><div class="fh-chips"><button data-q="${next}">Minimum ${ksh(next)}</button><button data-q="${next + a.increment}">${ksh(next + a.increment)}</button><button data-q="${next + a.increment * 3}">${ksh(next + a.increment * 3)}</button></div><p class="fh-err" role="alert">${err}</p><button class="fh-dark fh-full" data-go="2" ${current.status !== 'live' ? 'disabled' : ''}>Review bid</button><button class="fh-ghost fh-full" data-x>Cancel</button></div>`; $('#fh-amt', el).focus(); };
    const step2 = () => { const current = AU(id); el.innerHTML = `<div class="fh-sheet-card" role="dialog" aria-modal="true" aria-label="Review your bid"><h2>Review your bid</h2><dl class="fh-rev"><div><dt>Auction lot</dt><dd>${esc(a.name)}</dd></div><div><dt>Your bid</dt><dd>${ksh(amt)}</dd></div><div><dt>Current highest</dt><dd>${ksh(current.highestBid)}</dd></div></dl><p class="fh-fine">Your bid is recorded in this demo on this device. Bidder identity stays private; the bid amount is visible to other viewers. The farm is contacted only after the auction closes.</p><button class="fh-dark fh-full" data-go="3">Submit bid</button><button class="fh-ghost fh-full" data-go="1">Change amount</button></div>`; };
    const step3 = () => { const result = auctionMarket.placeBid(id, amt); if (!result.ok) return step1(result.message); el.innerHTML = `<div class="fh-sheet-card"><h2>Bid submitted</h2><p>Your bid of ${ksh(amt)} is recorded for ${esc(a.name)}. Your identity remains private.</p><button class="fh-dark fh-full" data-done>Done</button></div>`; };
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (e.target === el) return close(); if (!b) return;
      if (b.dataset.x !== undefined) return close();
      if (b.dataset.done !== undefined) { close(); render(); return; }
      if (b.dataset.q) { $('#fh-amt', el).value = b.dataset.q; return; }
      if (b.dataset.go === '1') return step1();
      if (b.dataset.go === '2') { const v = Math.round(Number($('#fh-amt', el).value)); const current=AU(id), next=auctionMarket.minBid(current); if (current.status!=='live') return step1('This auction has closed or has not opened yet.'); if (!v || v < next || (v - next) % a.increment !== 0) return step1(`Enter at least ${ksh(next)} in increments of ${ksh(a.increment)}.`); amt = v; return step2(); }
      if (b.dataset.go === '3') step3();
    });
    el.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    root.appendChild(el); step1();
  }
  function home() {
    const n = user().name.split(' ')[0], h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const featured = auctionMarket.list().find(item => item.status === 'live') || auctionMarket.list()[0];
    return brand(cartButton()) + `
    <div class="fh-greet"><h2>${g}${n ? ', ' + esc(n) : ''}</h2><p>Welcome to Mark’s Savannah Farm</p></div>
    <section class="fh-hero"><h2>Growing food today.<br>Building a better tomorrow.</h2><button class="fh-gold" data-tab="market">Explore the farm ${ic('arrow')}</button></section>
    <section class="fh-live"><div class="fh-row"><h3>${ic('auctions')} Live Auctions</h3><span class="fh-pill">${auctionMarket.list().filter(item => item.status === 'live').length} Live</span></div>
      <div class="fh-live-body"><div class="fh-thumb" style="background-image:url('${img(featured.image.replace('Assets/',''))}')"></div><div><h4>${esc(featured.name)}</h4><small>${featured.status === 'upcoming' ? 'Opening bid' : 'Current highest bid'}</small><strong>${ksh(featured.highestBid)}</strong><span class="fh-time">${ic('clock')}<b data-auction-countdown data-auction-state="${featured.status}" data-auction-start="${featured.startsAt}" data-auction-end="${featured.endsAt}">${fmtLeft((featured.status === 'upcoming' ? featured.startsAt : featured.endsAt) - Date.now())}</b></span><button class="fh-dark" data-open="auction:${featured.id}">${featured.status === 'live' ? 'View &amp; Bid' : 'View auction'} ${ic('arrow')}</button></div></div></section>
    <h3 class="fh-h3">What are you looking for today?</h3>
    <div class="fh-tiles">
      <button data-tab="market" data-cat="All"><i style="background-image:url('${img('Cattle%20dropdown.jpg')}')"></i><b>Livestock</b><small>Cattle, goats, sheep, pigs</small></button>
      <button data-tab="market" data-cat="Crops"><i style="background-image:url('${img('Crops.jpg')}')"></i><b>Crops</b><small>Farm produce</small></button>
      <button data-tab="market" data-cat="Poultry"><i style="background-image:url('${img('poultry%20Frming.jpg')}')"></i><b>Poultry</b><small>Layers &amp; broilers</small></button>
      <button data-tab="market" data-cat="Dairy"><i style="background-image:url('${img('Dairy%20Products.jpg')}')"></i><b>Dairy</b><small>Milk &amp; more</small></button></div>
    <a class="fh-learn" href="blog.html#guide-enterprise" style="background-image:linear-gradient(90deg,#eaf2dcf2 45%,#eaf2dc55),url('${img('Agri-Consultancy.jpg')}')"><h3>${ic('book')} Learn something new</h3><p>Practical farming tips, livestock care and agricultural insights.</p><b>Explore guides ${ic('arrow')}</b></a>`;
  }
  function market() {
    return brand(cartButton()) + `
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
    const all = auctionMarket.list(), live = all.filter(item => item.status === 'live'), upcoming = all.filter(item => item.status === 'upcoming'), closed = all.filter(item => item.status === 'ended');
    const tabs = [['live', `Live (${live.length})`], ['upcoming', `Upcoming (${upcoming.length})`], ['bids', 'My Bids'], ['results', 'Results']];
    const cards = items => items.map(item => `<article class="fh-auction"><div class="fh-big" style="background-image:url('${img(item.image.replace('Assets/',''))}')"><span class="fh-pill ${item.status === 'live' ? 'fh-live-badge' : ''}">${item.status === 'live' ? 'Live' : item.status === 'ended' ? 'Closed' : 'Upcoming'}</span></div><h2>${esc(item.name)}</h2><p>${esc(item.summary)}</p><div class="fh-stats"><div><small>${item.status === 'upcoming' ? 'Opening Bid' : 'Current Highest Bid'}</small><b>${ksh(item.highestBid)}</b></div><div><small>Starting Bid</small><b>${ksh(item.startBid)}</b></div></div><p class="fh-ends">${ic('clock')} ${item.status === 'upcoming' ? 'Starts in' : item.status === 'live' ? 'Ends in' : 'Closed'} <b data-auction-countdown data-auction-state="${item.status}" data-auction-start="${item.startsAt}" data-auction-end="${item.endsAt}">${fmtLeft((item.status === 'upcoming' ? item.startsAt : item.endsAt) - Date.now())}</b></p><div class="fh-auction-disclosure">${item.specs.slice(0,3).map(([key,value])=>`<span><b>${esc(key)}:</b> ${esc(value)}</span>`).join('')}</div><div class="fh-bidrow"><button class="fh-dark fh-wide" data-open="auction:${item.id}">${item.status === 'live' ? 'View &amp; Bid' : 'View auction'} ${ic('arrow')}</button><button class="fh-heart-lg ${saved().includes('auction-'+item.id) ? 'is-on' : ''}" data-save="auction-${item.id}" aria-label="Save auction">${ic('heart')}</button></div></article>`).join('');
    let body = '';
    if (S.atab === 'live') body = live.length ? `<div class="fh-auction-grid">${cards(live)}</div>` : '<p class="fh-empty">No auctions are live right now. Upcoming lots are listed in the next tab.</p>';
    else if (S.atab === 'upcoming') body = upcoming.length ? `<div class="fh-auction-grid">${cards(upcoming)}</div>` : '<p class="fh-empty">No upcoming lots are scheduled.</p>';
    else if (S.atab === 'bids') { const mine = bidsList(); body = mine.length ? `<div class="fh-list">${mine.map(bid => { const item=auctionMarket.get(bid.auctionId); return `<button data-open="auction:${item.id}"><span>${esc(item.name)}<br><small>Your bid · ${ksh(bid.amount)} · ${new Date(bid.placedAt).toLocaleString('en-KE')}</small></span></button>`; }).join('')}</div>` : '<p class="fh-empty">You have not placed any bids on this device yet.</p>'; }
    else body = closed.length ? `<div class="fh-auction-grid">${closed.map(item => `<article class="fh-auction"><h2>${esc(item.name)}</h2><p>Auction closed</p><strong>${item.bids.length ? `Winning amount: ${ksh(item.highestBid)}` : 'No bids were placed'}</strong><a class="fh-ghost fh-full" href="mailto:meraprenish@gmail.com?subject=${encodeURIComponent(`Closed auction: ${item.name}`)}">Contact farm about closed auction</a></article>`).join('')}</div>` : '<p class="fh-empty">Completed lots will appear here after their countdown ends.</p>';
    return title('Auctions', true) + `<div class="fh-chips fh-atabs" role="group" aria-label="Auction views">${tabs.map(([k, l]) => `<button data-atab="${k}" class="${k === S.atab ? 'is-on' : ''}" aria-pressed="${k === S.atab}">${l}</button>`).join('')}</div><p class="fh-fine">Sample auction schedule. Bidder identities are private; only amounts are shown. Bids are stored on this device in this preview.</p>${body}`;
  }
  function savedView() {
    const L = LISTINGS.filter(p => saved().includes(p.id));
    const A = saved().filter(id => id.startsWith('auction-')).map(id => id.slice('auction-'.length)).filter(id => auctionMarket.get(id));
    const auctionCards = A.map(id => { const a = AU(id); return `<button class="fh-list-saved" data-open="auction:${id}">${ic('auctions')}<span>${esc(a.name)}<small>Open auction details</small></span>${ic('arrow')}</button>`; }).join('');
    return title('Saved') + (L.length || A.length ? `${L.length ? `<div class="fh-grid">${L.map(card).join('')}</div>` : ''}${auctionCards ? `<div class="fh-list">${auctionCards}</div>` : ''}` : `<div class="fh-empty fh-blank">${ic('saved', 'fh-big-i')}<p>Nothing saved yet. Tap the heart on any listing or auction to keep it here.</p><button class="fh-dark" data-tab="market">Browse the marketplace</button></div>`);
  }
  function profile() {
    const u = user();
    return title('Profile') + `<div class="fh-me">${ic('user', 'fh-big-i')}<h2>${u.name ? esc(u.name) : 'Your account'}</h2><p>${esc(u.email)}</p></div>
    <nav class="fh-list" aria-label="Account links"><a href="customer-account.html">${ic('user')} Buyer account details</a><a href="${wa("Hello Mark's Savannah Farm, I need some help.")}" target="_blank" rel="noopener">${ic('chat')} Chat with the farm</a><a href="terms-and-conditions.html">${ic('file')} Terms &amp; Conditions</a><a href="privacy-policy.html">${ic('file')} Privacy Policy</a><button data-signout>${ic('out')} Sign out</button></nav>`;
  }
  const VIEWS = { home, market, auctions, saved: savedView, profile };

  function render(keepScroll = false) {
    const d = S.detail;
    const scrollTop = $('.fh-scroll').scrollTop;
    $('.fh-scroll').innerHTML = d ? (d.type === 'product' ? product(d.id) : auctionDetail(d.id)) : VIEWS[S.tab]();
    if (S.tab === 'market' && !d) fillList();
    $('.fh-scroll').scrollTop = keepScroll ? scrollTop : 0;
    $$('.fh-nav button').forEach(b => { const on = b.dataset.tab === (d ? (d.type === 'product' ? 'market' : 'auctions') : S.tab); b.classList.toggle('is-on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); });
  }
  function open() {
    root.innerHTML = '<div class="fh-scroll"></div><nav class="fh-nav" aria-label="Main">' + TABS.map(([k, l]) => `<button data-tab="${k}">${ic(k)}<span>${l}</span></button>`).join('') + '</nav>';
    S.tab = 'home'; render();
  }
  root.addEventListener('click', e => {
    const g = e.target.closest('[data-gal],[data-gal-to]');
    if (g) { const r = $('.fh-gal'), n = r.children.length, w = r.clientWidth, i = g.dataset.galTo !== undefined ? +g.dataset.galTo : Math.min(n - 1, Math.max(0, Math.round(r.scrollLeft / w) + +g.dataset.gal)); r.scrollTo({ left: i * w, behavior: 'smooth' }); return; }
    const b = e.target.closest('[data-open],[data-back],[data-bid],[data-tab],[data-cat],[data-atab],[data-save],[data-sort],[data-remind],[data-signout],[data-add-cart],[data-shop-cart]');
    if (!b) return;
    const d = b.dataset;
    if (d.shopCart !== undefined) { location.href = 'shop.html#shop-cart'; return; }
    if (d.addCart) {
      const product = LISTINGS.find(item => item.id === d.addCart); if (!product) return;
      const current = cartItems(), item = current.find(entry => entry.id === product.id);
      if (item) item.quantity = (Number(item.quantity) || 1) + 1;
      else current.push({id:product.id,name:product.name,category:product.cat,unit:({Cattle:'head',Goats:'head',Sheep:'head',Pigs:'head',Poultry:'bird',Crops:'bag or kg',Dairy:'pack',Equipment:'item',Services:'service'})[product.cat] || 'item',quantity:1});
      store.set('savanna-farm-shop-cart', current);
      root.querySelectorAll('[data-app-cart-count]').forEach(node => { node.textContent = String(cartCount()); });
      root.querySelectorAll('[data-shop-cart]').forEach(button => { button.setAttribute('aria-label', `Open cart, ${cartCount()} items`); });
      toast(`${product.name} added to your order.`); return;
    }
    if (d.open) { const [type, id] = d.open.split(':'); S.detail = { type, id }; render(); return; }
    if (d.back !== undefined) { S.detail = null; render(); return; }
    if (d.bid) { const item = AU(d.bid); if (item.status !== 'live') { S.detail = { type:'auction', id:d.bid }; render(); toast('Bids are accepted only while the lot is live.'); return; } sheet(d.bid); return; }
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
  function updateAuctionTimers() {
    let stateChanged = false;
    $$('[data-auction-countdown]').forEach(node => {
      const startsAt = Number(node.dataset.auctionStart), endsAt = Number(node.dataset.auctionEnd), now = Date.now();
      const status = now < startsAt ? 'upcoming' : now < endsAt ? 'live' : 'ended';
      const target = status === 'upcoming' ? startsAt : endsAt;
      node.textContent = fmtLeft(target - now);
      if (node.dataset.auctionState !== status) { node.dataset.auctionState = status; stateChanged = true; }
    });
    if (stateChanged) render(true);
  }
  window.addEventListener('farm-auctions-updated', () => { if (S.tab === 'auctions' || S.detail?.type === 'auction') render(true); });
  window.addEventListener('storage', event => { if (event.key === 'marks-savannah-auction-bids-v1' || event.key === 'marks-savannah-auction-schedule-v1') { if (S.tab === 'auctions' || S.detail?.type === 'auction') render(true); } });
  setInterval(updateAuctionTimers, 1000);
  window.addEventListener('farm-home-open', open);
  window.farmHomeReady = true;
})();
