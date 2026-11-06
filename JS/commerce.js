// Shared buyer-side catalogue and order-request cart for the website and app.
(() => {
  const products = [
    {id:'ayrshire-cow',name:'Dairy cows & heifers',category:'Livestock',unit:'head',image:'Assets/Cattle%20dropdown.jpg',description:'Dairy cattle for milk production and herd development. Ask for the individual animal’s breed, age, lactation details, health and vaccination records, and inspection arrangements.',details:'Before ordering, confirm the animal identity, production history where available, health documentation, collection location, and transport plan. Final selection and price are confirmed with the farm.'},
    {id:'calves',name:'Calves',category:'Livestock',unit:'head',image:'Assets/Cattle%20dropdown.jpg',description:'Young cattle for rearing or herd replacement. The farm can confirm age, breed, sex, feeding history, and current condition for each available calf.',details:'Ask for the individual animal’s records and suitability for your intended purpose. Availability and price depend on the animal and season.'},
    {id:'beef-cattle',name:'Beef & finishing cattle',category:'Livestock',unit:'head',image:'Assets/Cattle%20dropdown.jpg',description:'Cattle for beef production or finishing. Confirm breed, sex, age, live weight if available, condition, and inspection options before purchase.',details:'Transport and handling arrangements should be agreed before collection. Pricing is confirmed per animal after the buyer and farm agree on the specific stock.'},
    {id:'boer-goat',name:'Meat goats',category:'Livestock',unit:'head',image:'Assets/Goats.jpg',description:'Goats for meat production, breeding, or herd growth. Ask for breed, sex, age, approximate size, health information, and quantity available.',details:'The farm confirms the selected animals and current price before payment. Delivery depends on destination and the number of animals.'},
    {id:'dairy-goats',name:'Dairy goats',category:'Livestock',unit:'head',image:'Assets/Goats.jpg',description:'Dairy goats for household or commercial milk production. Ask about breed, age, lactation status, production history where available, and care records.',details:'Discuss your herd goals and housing or transport needs with the farm before confirming an order.'},
    {id:'goat-kids',name:'Goat kids & breeding stock',category:'Livestock',unit:'head',image:'Assets/Goats.jpg',description:'Young goats and breeding animals for herd development. Confirm breed, age, sex, health information, and suitability for your plans.',details:'Price and availability are confirmed for each animal.'},
    {id:'sheep',name:'Sheep: ewes, rams & lambs',category:'Livestock',unit:'head',image:'Assets/Sheep.jpg',description:'Sheep for flock development and meat production. Request details for the individual animal, including age, sex, breed, size, and health records where available.',details:'Availability, price, and transport are confirmed for the chosen animals.'},
    {id:'pigs',name:'Pigs: piglets, growers & breeders',category:'Livestock',unit:'head',image:'Assets/Pigs.jpg',description:'Pigs for rearing, finishing, or breeding. Tell the farm whether you need piglets, growers, sows, or boars so it can confirm suitable stock.',details:'Ask for age, breed, weight where available, health information, and feeding details. Price and collection arrangements are confirmed before payment.'},
    {id:'layers',name:'Point-of-lay hens & layers',category:'Poultry',unit:'bird',image:'Assets/poultry%20Frming.jpg',description:'Chickens for egg production. Confirm bird age, breed or strain, vaccination records, laying status, minimum order quantity, and collection arrangements.',details:'For recurring supply, include your preferred quantity and timing in the order notes.'},
    {id:'broilers',name:'Broiler chickens',category:'Poultry',unit:'bird',image:'Assets/poultry%20Frming.jpg',description:'Broiler birds for meat production. Ask whether day-old chicks, growers, or mature birds are available, and confirm age, vaccination, and minimum quantities.',details:'Availability is time-sensitive; the farm confirms the flock and price before accepting the order.'},
    {id:'kienyeji-chicken',name:'Kienyeji chicken',category:'Poultry',unit:'bird',image:'Assets/poultry%20Frming.jpg',description:'Indigenous or improved kienyeji chickens for household or commercial keeping. Confirm type, age, sex, health records, and available quantities.',details:'Ask about housing and transport arrangements that suit the birds.'},
    {id:'ducks',name:'Ducks',category:'Poultry',unit:'bird',image:'Assets/poultry%20Frming.jpg',description:'Ducks for smallholding or commercial poultry projects. Confirm type, age, sex if known, quantity, and care information for the available birds.',details:'Transport and collection should be arranged to suit the birds and destination.'},
    {id:'turkeys',name:'Turkeys',category:'Poultry',unit:'bird',image:'Assets/Turkeys.jpg',description:'Turkeys for rearing or meat production. Ask whether poults or mature birds are available and confirm age, quantity, and health records where available.',details:'The farm will confirm current stock and price before payment.'},
    {id:'eggs',name:'Chicken eggs',category:'Poultry',unit:'tray',image:'Assets/poultry%20Frming.jpg',description:'Farm eggs for household, retail, or food-service orders. Confirm tray size, quantity, collection timing, and any recurring supply needs.',details:'Egg availability and delivery depend on the day’s production and destination.'},
    {id:'maize',name:'Maize',category:'Crops',unit:'bag or kg',image:'Assets/Crops.jpg',description:'Seasonal maize supply for household, retail, or bulk buyers. Confirm variety, grade, bag weight, moisture or storage details where available, harvest timing, and quantity.',details:'Ask for the current price per agreed unit. Bulk orders and delivery are confirmed separately.'},
    {id:'wheat',name:'Wheat',category:'Crops',unit:'bag or kg',image:'Assets/Crops.jpg',description:'Seasonal wheat for food or commercial use. Confirm available variety, grade, unit weight, quantity, and harvest or collection timing.',details:'Final price depends on the available lot, quantity, and destination.'},
    {id:'sorghum',name:'Sorghum',category:'Crops',unit:'bag or kg',image:'Assets/Crops.jpg',description:'Sorghum for household and commercial requirements. Ask about available varieties, quality, quantity, packaging, and collection or delivery.',details:'The farm confirms the current lot and price before accepting the order.'},
    {id:'beans',name:'Beans & pulses',category:'Crops',unit:'bag or kg',image:'Assets/Crops.jpg',description:'Beans and other seasonal pulses. Specify the type, quantity, packaging, and intended collection date so the farm can check the available harvest.',details:'Seasonal supply and prices vary by crop, grade, volume, and harvest period.'},
    {id:'peas',name:'Peas',category:'Crops',unit:'bag or kg',image:'Assets/Crops.jpg',description:'Seasonal peas for household or commercial use. Ask about the current crop, quality, quantity, packaging, and collection or delivery.',details:'The farm confirms the available lot and current price before accepting an order.'},
    {id:'potatoes',name:'Potatoes',category:'Crops',unit:'bag or kg',image:'Assets/Crops.jpg',description:'Seasonal potatoes for households, shops, and food businesses. Confirm variety, size or grade, bag weight, volume, and harvest timing.',details:'For bulk orders, include your preferred delivery location and timing.'},
    {id:'vegetables',name:'Seasonal vegetables',category:'Crops',unit:'crate or kg',image:'Assets/Crops.jpg',description:'Vegetable availability changes with planting and harvest periods. Ask for the varieties, grade, quantities, and collection dates currently available.',details:'The farm confirms whether the requested items can be supplied together and how they should be packed.'},
    {id:'fodder',name:'Fodder crops & hay',category:'Crops',unit:'bale or load',image:'Assets/Crops.jpg',description:'Fodder and hay for livestock feeding. Confirm forage type, bale or load size, storage condition, quantity, and delivery access.',details:'Feed suitability depends on animal type and ration; confirm the product and handling details with the farm.'},
    {id:'fresh-milk',name:'Fresh milk',category:'Dairy',unit:'litre',image:'Assets/Dairy%20Products.jpg',description:'Fresh farm milk for household or regular supply. Confirm daily availability, container or packaging, quantity, collection time, and delivery options.',details:'Keep chilled and follow the handling and use-by information supplied with the order.'},
    {id:'fermented-milk',name:'Fermented milk',category:'Dairy',unit:'pack',image:'Assets/Dairy%20Products.jpg',description:'Fermented dairy product for household or business orders. Confirm available pack sizes, ingredients, storage needs, and date information.',details:'Availability depends on the current production batch; chilled handling and delivery should be confirmed.'},
    {id:'yoghurt',name:'Yoghurt',category:'Dairy',unit:'pack',image:'Assets/Dairy%20Products.jpg',description:'Dairy yoghurt for household or business orders. Confirm available flavours, pack sizes, ingredients, storage requirements, and date information before purchase.',details:'Availability and delivery depend on the current production batch.'},
    {id:'ghee',name:'Ghee',category:'Dairy',unit:'pack',image:'Assets/Dairy%20Products.jpg',description:'Clarified butter for cooking and food-service use. Ask for available pack sizes, ingredients, storage guidance, and current batch information.',details:'The farm confirms the current price and packaging before accepting an order.'},
    {id:'butter',name:'Butter & cream',category:'Dairy',unit:'pack',image:'Assets/Dairy%20Products.jpg',description:'Dairy products for household, retail, or food-service buyers. Confirm which products are currently available, their pack sizes, ingredients, and storage needs.',details:'Availability can vary; chilled handling and delivery arrangements must be confirmed.'},
    {id:'tractor',name:'Tractors & field machinery',category:'Equipment',unit:'item',image:'Assets/Farm%20Equipments.jpg',description:'Ask about tractors and field machinery by make, model, condition, capacity, and intended use. Request photos, inspection details, and service history where applicable.',details:'Confirm whether the item is new or used, what accessories are included, warranty terms if offered, and transport or installation costs.'},
    {id:'equipment',name:'Farm equipment',category:'Equipment',unit:'item',image:'Assets/Farm%20Equipments.jpg',description:'Farm equipment options may include machinery and tools for field, water, crop-care, and livestock work. Specify the task and preferred capacity or condition.',details:'The farm confirms model, specifications, condition, included parts, price, and delivery before order acceptance.'},
    {id:'ploughs',name:'Ploughs, harrows & planters',category:'Equipment',unit:'item',image:'Assets/Farm%20Equipments.jpg',description:'Implements for land preparation and planting. Share tractor compatibility, working width, crop, acreage, and preferred condition so the farm can identify a suitable option.',details:'Specifications, condition, included parts, and delivery are confirmed for each item.'},
    {id:'irrigation',name:'Pumps, tanks & irrigation equipment',category:'Equipment',unit:'item',image:'Assets/Farm%20Equipments.jpg',description:'Water storage and irrigation equipment for farm use. Confirm water source, flow or storage needs, power availability, pipe sizes, and site conditions.',details:'Ask for the product specifications and installation requirements before placing an order.'},
    {id:'sprayers',name:'Sprayers, feeders & milking equipment',category:'Equipment',unit:'item',image:'Assets/Farm%20Equipments.jpg',description:'Equipment for crop care and livestock operations. Tell us whether you need a sprayer, poultry feeder or drinker, incubator, or milking machine.',details:'The farm confirms model, capacity, condition, included components, and any warranty before payment.'},
    {id:'seeds',name:'Seeds & planting materials',category:'Farm inputs',unit:'pack or kg',image:'Assets/Crops.jpg',description:'Crop, vegetable, and pasture seed options for farm planting. Confirm crop, variety, pack size, planting season, and availability before ordering.',details:'Check that the selected seed and planting advice suit your location and growing conditions.'},
    {id:'organic-fertilizer',name:'Compost & well-decomposed manure',category:'Farm inputs',unit:'bag or load',image:'Assets/Agri-Consultancy.jpg',description:'Organic soil inputs for crop and garden use. Confirm source, maturity, quantity, packaging, and delivery access before ordering.',details:'Application rates depend on crop and soil conditions; seek suitable local agronomic advice.'},
    {id:'soil-amendments',name:'Agricultural lime & soil amendments',category:'Farm inputs',unit:'bag',image:'Assets/Crops.jpg',description:'Soil amendments may be available for farm use. Confirm the exact product, analysis, packaging, and intended application before ordering.',details:'Use soil test results and product label instructions to select and apply amendments.'},
    {id:'mineral-fertilizer',name:'Mineral fertilizers',category:'Farm inputs',unit:'bag',image:'Assets/Crops.jpg',description:'Fertilizer options may be available depending on crop, season, and stock. Ask for the exact product name, nutrient analysis, bag size, and label before ordering.',details:'Choose fertilizer based on crop needs and soil information. Follow the manufacturer’s label and local professional advice.'},
    {id:'crop-protection',name:'Registered crop-protection products',category:'Farm inputs',unit:'pack',image:'Assets/Crops.jpg',description:'Crop-protection products may be offered only where the exact product is currently approved and available. Share the crop and issue so the farm can confirm the product label and intended use.',details:'The exact registered product, active ingredient, pack size, directions, protective equipment, and restrictions must be confirmed before sale. Follow the product label and qualified local advice.'}
  ];
  const categories = ['All', 'Livestock', 'Poultry', 'Crops', 'Dairy', 'Equipment', 'Farm inputs'];
  const serviceLinks = {
    'dairy cows & heifers':'ayrshire-cow','calves':'calves','beef & finishing cattle':'beef-cattle','meat goats':'boer-goat','dairy goats':'dairy-goats','kids & breeding stock':'goat-kids','ewes':'sheep','rams':'sheep','lambs':'sheep','piglets':'pigs','growers & finishers':'pigs','breeding sows & boars':'pigs',
    'maize':'maize','wheat':'wheat','sorghum':'sorghum','beans':'beans','peas':'peas','other seasonal pulses':'beans','potatoes':'potatoes','vegetables':'vegetables','fodder crops':'fodder',
    'broilers':'broilers','kienyeji chicken':'kienyeji-chicken','layers & pullets':'layers','ducks':'ducks','turkey':'turkeys','fresh eggs':'eggs','bulk poultry orders':'broilers',
    'fresh milk':'fresh-milk','fermented milk':'fermented-milk','yoghurt':'yoghurt','ghee':'ghee','bulk dairy orders':'fresh-milk','product availability':'fresh-milk',
    'tractors':'tractor','farm equipment':'equipment','ploughs & harrows':'ploughs','planters & seeders':'ploughs','irrigation equipment':'irrigation','water pumps':'irrigation','sprayers':'sprayers'
  };
  const cartKey = 'savanna-farm-shop-cart';
  const moneyText = 'Price confirmed by the farm';
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const readCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem(cartKey) || '[]');
      return Array.isArray(value) ? value.filter(item => item && typeof item === 'object' && item.id).map(item => ({
        id: String(item.id), name: String(item.name || 'Farm product'), category: String(item.category || 'Farm product'),
        unit: String(item.unit || 'item'), quantity: Math.max(1, Math.floor(Number(item.quantity) || 1))
      })) : [];
    } catch { return []; }
  };
  const writeCart = value => { localStorage.setItem(cartKey, JSON.stringify(value)); renderCart(); };
  const toast = message => { const el = $('#shop-toast'); el.textContent = message; el.classList.add('is-visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('is-visible'), 2600); };
  const requestedCategory = new URLSearchParams(location.search).get('category');
  let activeCategory = categories.includes(requestedCategory) ? requestedCategory : 'All';

  function renderCategories() {
    $('#shop-categories').innerHTML = categories.map(category => `<button type="button" data-shop-category="${esc(category)}" class="${activeCategory === category ? 'is-active' : ''}" aria-pressed="${activeCategory === category}">${esc(category)}</button>`).join('');
  }
  function renderProducts() {
    const query = ($('#shop-search').value || '').trim().toLowerCase();
    const selected = new URLSearchParams(location.search).get('product');
    const filtered = products.filter(product => (activeCategory === 'All' || product.category === activeCategory) && (!query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query)));
    $('#shop-products').innerHTML = filtered.map(product => `<article class="shop-product" id="product-${esc(product.id)}"><img src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy"><div class="shop-product-copy"><span class="shop-product-category">${esc(product.category)}</span><h2>${esc(product.name)}</h2><p>${esc(product.description)}</p><strong>${moneyText}</strong><details><summary>Product information</summary><p>${esc(product.details)}</p><small>Unit: ${esc(product.unit)} · Availability and final pricing are confirmed when the farm reviews your request.</small></details><button type="button" class="shop-add-button" data-shop-add="${esc(product.id)}">Add to order</button></div></article>`).join('') || '<p class="shop-empty">No matching products. Try another search or category.</p>';
    renderCategories();
    if (selected) setTimeout(() => document.getElementById(`product-${CSS.escape(selected)}`)?.scrollIntoView({block:'center'}), 40);
  }
  function renderCart() {
    const cart = readCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach(node => node.textContent = String(count));
    $('#shop-cart-items').innerHTML = cart.length ? cart.map(item => `<article class="shop-cart-item"><div><strong>${esc(item.name)}</strong><small>${esc(item.unit || 'item')} · ${moneyText}</small></div><div class="shop-quantity"><button type="button" data-cart-change="-1" data-cart-id="${esc(item.id)}" aria-label="Remove one ${esc(item.name)}">−</button><span>${Math.max(1, Number(item.quantity) || 1)}</span><button type="button" data-cart-change="1" data-cart-id="${esc(item.id)}" aria-label="Add one ${esc(item.name)}">+</button><button type="button" class="shop-remove" data-cart-remove="${esc(item.id)}">Remove</button></div></article>`).join('') : '<p class="shop-empty">Your cart is empty. Add products from the catalogue to prepare an order request.</p>';
    $('[data-checkout-open]').disabled = cart.length === 0;
  }
  function addItem(product) {
    const cart = readCart(), current = cart.find(item => item.id === product.id);
    if (current) current.quantity = (Number(current.quantity) || 1) + 1;
    else cart.push({id:product.id,name:product.name,category:product.category,unit:product.unit,quantity:1});
    writeCart(cart); toast(`${product.name} added to your order.`);
  }
  function submitOrder(event) {
    event.preventDefault();
    const cart = readCart(); if (!cart.length) return;
    const form = event.currentTarget, data = new FormData(form), orderId = `MSF-${Date.now().toString(36).toUpperCase()}`;
    const lines = cart.map(item => `- ${item.name}: ${item.quantity} ${item.unit || 'item'} (${item.category})`);
    const message = [`Order request ${orderId}`, '', ...lines, '', `Name: ${data.get('name')}`, `Phone: ${data.get('phone')}`, data.get('email') ? `Email: ${data.get('email')}` : '', `County: ${data.get('county')}`, `Fulfilment: ${data.get('fulfilment')}`, data.get('notes') ? `Notes: ${data.get('notes')}` : '', '', 'Please confirm availability, final prices, delivery cost, and payment instructions.'].filter(Boolean).join('\n');
    const order = {orderNumber:orderId,listingName:`${cart.length} order item(s)`,createdAt:new Date().toISOString(),status:'Order request prepared',email:String(data.get('email') || '').trim().toLowerCase(),items:cart};
    try { const previous = JSON.parse(localStorage.getItem('savanna-customer-orders') || '[]'); localStorage.setItem('savanna-customer-orders', JSON.stringify([order, ...(Array.isArray(previous) ? previous : [])])); } catch {}
    const feedback = $('#shop-form-feedback');
    feedback.textContent = 'Your order email is ready. Send it to complete your request; the farm will confirm stock, final pricing, and payment before fulfilment.';
    const emailLink = `mailto:meraprenish@gmail.com?subject=${encodeURIComponent(`Farm order request ${orderId}`)}&body=${encodeURIComponent(message)}`;
    const send = document.createElement('a'); send.className = 'shop-email-link'; send.href = emailLink; send.textContent = 'Open email to send order';
    feedback.append(' ', send);
  }
  if (document.documentElement.classList.contains('page-about')) {
    document.querySelectorAll('.livestock-product').forEach(card => {
      if (card.closest('#details-consultancy')) return;
      const link = card.querySelector('a[href*="wa.me"]');
      const label = card.querySelector('h4')?.textContent.trim().toLowerCase();
      const productId = label === 'regular supply' ? (card.closest('#details-dairy') ? 'fresh-milk' : 'eggs') : serviceLinks[label];
      if (!link || !productId) return;
      link.href = `shop.html?product=${encodeURIComponent(productId)}`;
      link.removeAttribute('target'); link.removeAttribute('rel'); link.textContent = 'View details & add to order';
    });
  }
  const searchParam = new URLSearchParams(location.search).get('search');
  if (searchParam) $('#shop-search').value = searchParam;
  $('#shop-categories').addEventListener('click', event => { const button = event.target.closest('[data-shop-category]'); if (!button) return; activeCategory = button.dataset.shopCategory; renderProducts(); });
  $('#shop-search').addEventListener('input', renderProducts);
  $('#shop-products').addEventListener('click', event => { const button = event.target.closest('[data-shop-add]'); if (!button) return; const product = products.find(item => item.id === button.dataset.shopAdd); if (product) addItem(product); });
  $('#shop-cart-items').addEventListener('click', event => {
    const remove = event.target.closest('[data-cart-remove]');
    if (remove) { writeCart(readCart().filter(item => item.id !== remove.dataset.cartRemove)); return; }
    const change = event.target.closest('[data-cart-change]'); if (!change) return;
    const cart = readCart(), item = cart.find(entry => entry.id === change.dataset.cartId); if (!item) return;
    item.quantity = (Number(item.quantity) || 1) + Number(change.dataset.cartChange);
    writeCart(cart.filter(entry => item === entry ? item.quantity > 0 : true));
  });
  $('[data-cart-clear]').addEventListener('click', () => writeCart([]));
  document.querySelectorAll('[data-cart-focus]').forEach(button => button.addEventListener('click', () => $('#shop-cart').scrollIntoView({behavior:'smooth',block:'start'})));
  const checkout = $('#shop-checkout');
  $('[data-checkout-open]').addEventListener('click', () => checkout.showModal());
  $('[data-checkout-close]').addEventListener('click', () => checkout.close());
  checkout.addEventListener('click', event => { if (event.target === checkout) checkout.close(); });
  $('#shop-checkout-form').addEventListener('submit', submitOrder);
  renderProducts(); renderCart();
})();
