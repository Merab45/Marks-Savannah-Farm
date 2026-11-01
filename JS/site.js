// Farm contact details live here; links marked data-contact-* are filled in below.
const FARM_CONTACT = {
  whatsapp: '254706894568',
  phone: '+254706894568',
  phoneDisplay: '0706 894 568',
  email: 'meraprenish@gmail.com',
};
document.querySelectorAll('[data-contact-whatsapp]').forEach(link => {
  link.href = `https://wa.me/${FARM_CONTACT.whatsapp}?text=${encodeURIComponent("Hello Mark's Savannah Farm, I have an enquiry.")}`;
});
document.querySelectorAll('[data-contact-phone]').forEach(link => { link.href = `tel:${FARM_CONTACT.phone}`; });
document.querySelectorAll('[data-contact-email]').forEach(link => { link.href = `mailto:${FARM_CONTACT.email}`; });
document.querySelectorAll('[data-farm-phone]').forEach(el => { el.textContent = FARM_CONTACT.phoneDisplay; });

// Accessible primary navigation for the homepage.
if (document.documentElement.classList.contains('page-index')) {
  const nav = document.querySelector('.page-index .nav');
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
    // A mouse click on a hover-driven menu does nothing; keyboard activation (detail 0) still toggles.
    if (hoverMenu.matches && event.detail > 0) return;
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
)">${isSaved?'♥':'♡'}</button></div><div class="card-body"><div class="card-title">${esc(a.name)}${guide?'':' · '+esc(a.type)}</div><div class="card-desc">${esc(a.breed||'Breed on request')} &nbsp;·&nbsp; ${esc(a.age||'Age on request')} &nbsp;·&nbsp; ${esc(a.weight||'Weight on request')}</div><div class="listing-loc">⌖ ${esc(a.location||'Kajiado, Kenya')} · Health and vaccination details: ${esc(a.health||'ask the farm')}</div><div class="photo-credit">${credit}</div><div class="card-bottom"><span class="card-price">${fmt(a.price)}${unit}</span><button class="ask" onclick="openEnquiry(${
  i
}
)">Ask about it&nbsp; </button></div></div></article>`
      }
      ).join(''):emptyMessage;
      syncCategoryShortcuts();
    }
    function syncCategoryShortcuts(){
      const selectedType=document.getElementById('listingType').value;
      document.querySelectorAll('[data-livestock-type]').forEach(button=>{
        const isSelected=button.dataset.livestockType===selectedType;
        button.setAttribute('aria-pressed',String(isSelected));
        button.classList.toggle('is-active',isSelected);
      });
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
    draw();['listingSearch','listingType','listingSort'].forEach(id=>document.getElementById(id).addEventListener(id==='listingSearch'?'input':'change',draw));
    document.getElementById('cards').addEventListener('click',event=>{
      if(!event.target.closest('[data-clear-listing-filters]'))return;
      document.getElementById('listingSearch').value='';
      document.getElementById('listingType').value='all';
      draw();
    });
    document.querySelectorAll('[data-livestock-type]').forEach(button=>button.addEventListener('click',()=>{
      const typeFilter=document.getElementById('listingType');
      typeFilter.value=button.dataset.livestockType;
      typeFilter.dispatchEvent(new Event('change',{bubbles:true}));
      document.getElementById('livestock').scrollIntoView({
        behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
        block:'start'
      });
    }));
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
    let installPrompt;const installBtn=document.getElementById('installButton');
    if(matchMedia('(display-mode: standalone)').matches)installBtn.hidden=true;
    window.addEventListener('beforeinstallprompt',e=>{
      e.preventDefault();installPrompt=e
    }
    );
    installBtn.addEventListener('click',async()=>{
      if(installPrompt){
        installPrompt.prompt();await installPrompt.userChoice;installPrompt=null
      }
      else{
        alert('To install, open your browser menu and choose “Install app” or “Add to Home Screen”.')
      }
    }
    );
    if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{
    }
    ));
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
      document.getElementById('listingGrid').innerHTML=cards.length?cards.map(a=>`<article class="listing-card"><div class="listing-photo"><span class="tag listed" style="z-index:1">For sale</span>${a.image?`<img src="${esc(a.image)}" alt="${esc(a.name)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">`:''}${animalEmoji(a)}</div><div class="listing-body"><div class="listing-name">${esc(a.name)} <span style="font-weight:400;color:var(--muted)">· ${esc(a.type)}</span></div><div class="listing-detail">${esc(a.breed||'Breed not specified')} · ${esc(a.age||'Age not specified')} · ${esc(a.weight||'Weight not specified')}</div><div class="listing-detail">${esc(a.location||'Kajiado')} · ${esc(a.health||'Health details on request')}</div><div class="listing-bottom"><div class="listing-price">${money(a.price)}</div><div class="listing-actions"><button class="icon-btn" title="Mark sold" onclick="markSold(${a.id})">${icons.cash}</button><button class="icon-btn" title="Remove listing" onclick="unlist(${a.id})">×</button></div></div></div></article>`).join(''):'<div class="panel empty" style="grid-column:1/-1">No listings match yet. Add an animal and set its status to Listed to advertise it here.</div>';
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
// Initialize behavior only on the matching page.
if (document.documentElement.classList.contains('page-customer-account')) {
  (() => {
    // Load the signed-in buyer profile and its locally stored account data.
    const readStore=(key,fallback)=>{
      try{
        return JSON.parse(localStorage.getItem(key)??JSON.stringify(fallback))
      }
      catch{
        return fallback
      }
    }
    ;
    const email=(localStorage.getItem('savanna-customer-session')||sessionStorage.getItem('savanna-customer-session')||'').trim().toLowerCase();
    const users=readStore('savanna-customer-accounts',[]);
    let user=Array.isArray(users)?users.find(item=>String(item.email||'').toLowerCase()===email):null;
    if(!user){
      location.replace('sign-in.html')
    }
    else initialize();
    function initialize(){
      document.getElementById('year').textContent=new Date().getFullYear();
      renderUser();
      renderOrders();
      renderSavedCount();
      document.getElementById('editModal').addEventListener('click',event=>{
        if(event.target.id==='editModal')closeEdit()
      }
      );
      document.addEventListener('keydown',event=>{
        if(event.key==='Escape')closeEdit()
      }
      );
      document.getElementById('editForm').addEventListener('submit',saveProfile);
    }
    function renderUser(){
      const name=String(user.name||'Buyer');
      document.getElementById('greeting').textContent=name.trim().split(/\s+/)[0]||'friend';
      document.getElementById('sideName').textContent=name;
      document.getElementById('sideEmail').textContent=user.email||'';
      document.getElementById('avatar').textContent=name.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase()||'M';
      document.getElementById('customerName').textContent=name;
      document.getElementById('customerEmail').textContent=user.email||'';
      document.getElementById('customerPhone').textContent=user.phone||'Add a phone number';
      const joined=new Date(user.createdAt||Date.now());
      document.getElementById('memberSince').textContent='Buyer account created '+joined.toLocaleDateString(undefined,{
        month:'long',year:'numeric'
      }
      );
    }
    function renderOrders(){
      const orders=readStore('savanna-customer-orders',[]);
      const list=document.getElementById('ordersList');
      const safeOrders=Array.isArray(orders)?orders.filter(order=>!order.email||String(order.email).toLowerCase()===email):[];
      document.getElementById('orderCount').textContent=String(safeOrders.length);
      if(!safeOrders.length){
        list.innerHTML='<div class="orders-empty"><div class="empty-icon"><svg viewBox="0 0 24 24"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"/></svg></div><div class="empty-copy"><h3>No orders recorded yet</h3><p>When you agree a livestock purchase with the farm, order updates can appear here.</p><a class="btn primary" href="index.html#livestock">Browse livestock </a></div></div>';
        return;
      }
      list.innerHTML=safeOrders.slice(0,5).map(order=>`<div class="order-row"><div><div class="order-name">${escapeHtml(order.animalName||order.listingName||'Livestock order')}</div><div class="order-meta">${escapeHtml(order.orderNumber||order.createdAt||'Farm order')}</div></div><span class="status ${String(order.status).toLowerCase()==='paid'?'paid':''}">${escapeHtml(order.status||'Pending')}</span><div class="order-price">${order.amount?`KSh ${
        new Intl.NumberFormat('en-KE').format(Number(order.amount))
      }
      `:'Contact farm'}</div></div>`).join('');
    }
    function renderSavedCount(){
      const saved=readStore('savanna-customer-favorites',[]);
      document.getElementById('savedCount').textContent=String(Array.isArray(saved)?saved.length:0);
    }
    function escapeHtml(value){
      return String(value??'').replace(/[&<>"']/g,char=>({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      }
      [char]))
    }
    function openEdit(){
      document.getElementById('editName').value=user.name||'';document.getElementById('editEmail').value=user.email||'';document.getElementById('editPhone').value=user.phone||'';document.getElementById('editModal').classList.add('open');document.getElementById('editName').focus()
    }
    function closeEdit(){
      document.getElementById('editModal').classList.remove('open')
    }
    function saveProfile(event){
      event.preventDefault();
      user.name=document.getElementById('editName').value.trim();user.phone=document.getElementById('editPhone').value.trim();
      const updated=users.map(item=>String(item.email||'').toLowerCase()===email?user:item);
      try{
        localStorage.setItem('savanna-customer-accounts',JSON.stringify(updated))
      }
      catch{
        showToast('Could not save: browser storage is unavailable.');return
      }
      renderUser();closeEdit();showToast('Your profile details have been saved in this browser.');
    }
    function showToast(message){
      const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)
    }
    function signOut(event){
      event.preventDefault();localStorage.removeItem('savanna-customer-session');sessionStorage.removeItem('savanna-customer-session');location.href='index.html'
    }
    Object.assign(window, {
      openEdit, closeEdit, signOut
    }
    );
  }
  )();
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
