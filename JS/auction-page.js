// Public website auction screen; it reads and writes the same local demo bids as the app.
(() => {
  const market = window.FarmAuctions;
  const grid = document.getElementById('public-auctions');
  const dialog = document.getElementById('public-bid-dialog');
  let filter = 'live';
  const esc = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function card(item) {
    const timeTarget = item.status === 'upcoming' ? item.startsAt : item.endsAt;
    const timeLabel = item.status === 'upcoming' ? 'Starts in' : item.status === 'live' ? 'Closes in' : 'Closed';
    const bids = item.bids.length ? `<section class="auction-public-bids"><h3>Bid amounts <small>Bidder identities are private</small></h3><ul>${item.bids.map(bid=>`<li><span>Anonymous bidder</span><strong>${market.money(bid.amount)}</strong></li>`).join('')}</ul></section>` : '<p class="auction-no-bids">No bids placed yet.</p>';
    const specifications = `<details class="auction-specifications"><summary>Lot specifications</summary><dl>${item.specs.map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></details>`;
    const action = item.status === 'live'
      ? `<button type="button" class="auction-bid-button" data-place-bid="${item.id}">Place a bid</button>`
      : item.status === 'upcoming'
        ? '<p class="auction-upcoming-note">Bidding opens automatically when the countdown reaches zero.</p>'
        : `<div class="auction-closed-result"><strong>${item.bids.length ? `Winning amount: ${market.money(item.highestBid)}` : 'No bids were placed'}</strong><a href="mailto:meraprenish@gmail.com?subject=${encodeURIComponent(`Closed auction: ${item.name}`)}">Contact the farm about this closed lot</a></div>`;
    const percent = item.status === 'upcoming' ? 0 : Math.max(0,Math.min(100,(Date.now()-item.startsAt)/(item.endsAt-item.startsAt)*100));
    return `<article class="auction-lot" data-auction-lot="${item.id}"><div class="auction-lot-image"><img src="${esc(item.image)}" alt="${esc(item.name)}"><span class="auction-status is-${item.status}">${item.status === 'live' ? 'Live now' : item.status === 'upcoming' ? 'Upcoming' : 'Closed'}</span></div><div class="auction-lot-copy"><span class="auction-lot-type">${esc(item.category)} · ${esc(item.quantity)}</span><h3>${esc(item.name)}</h3><p>${esc(item.summary)}</p><div class="auction-lot-prices"><div><small>${item.status === 'upcoming' ? 'Opening bid' : 'Current highest'}</small><strong>${market.money(item.highestBid)}</strong></div><div><small>Starting bid</small><strong>${market.money(item.startBid)}</strong></div></div><p class="auction-countdown" data-auction-timer data-auction-id="${item.id}" data-auction-state="${item.status}" data-auction-start="${item.startsAt}" data-auction-end="${item.endsAt}">${timeLabel} ${market.remaining(timeTarget-Date.now())}</p><div class="auction-progress"><span style="width:${percent}%"></span></div><p class="auction-minimum">Minimum increment: ${market.money(item.increment)}</p>${specifications(item)}${bids}${action}</div></article>`;
  }

  function render() {
    document.querySelectorAll('[data-auction-filter]').forEach(button=>{const active=button.dataset.auctionFilter===filter;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active));});
    const lots=market.list().filter(item=>filter==='live'?item.status==='live':filter==='upcoming'?item.status==='upcoming':item.status==='ended');
    grid.innerHTML=lots.length?lots.map(card).join(''):`<div class="auction-empty"><strong>${filter==='live'?'No lots are live right now':filter==='upcoming'?'No upcoming lots are scheduled':'No auction results yet'}</strong><p>${filter==='live'?'Check the Upcoming tab for the next scheduled lots.':filter==='upcoming'?'New lots will appear here when scheduled.':'Completed auction results will appear here after lots close.'}</p></div>`;
  }

  function openBid(id) {
    const item=market.get(id);
    if(item.status!=='live')return;
    const minimum=market.minBid(item);
    dialog.innerHTML=`<form method="dialog" class="auction-bid-form"><button type="button" class="auction-dialog-close" aria-label="Close">×</button><span class="about-eyebrow about-eyebrow-dark">LIVE AUCTION</span><h2>Place your bid</h2><p>${esc(item.name)}</p><div class="auction-current-bid"><span>Current highest bid</span><strong>${market.money(item.highestBid)}</strong></div><label for="public-bid-amount">Your bid in KSh</label><input id="public-bid-amount" type="number" inputmode="numeric" min="${minimum}" step="${item.increment}" value="${minimum}" required><small>Minimum ${market.money(minimum)} · bid in ${market.money(item.increment)} increments.</small><p class="auction-private-note">Your bidder identity and contact details remain private. Other viewers see the amount only. This preview stores bids on this device.</p><p class="auction-bid-error" role="alert"></p><button type="submit" class="auction-bid-button">Submit bid</button></form>`;
    dialog.querySelector('.auction-dialog-close').addEventListener('click',()=>dialog.close());
    dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const result=market.placeBid(id,Number(dialog.querySelector('#public-bid-amount').value));if(!result.ok){dialog.querySelector('.auction-bid-error').textContent=result.message;return;}dialog.querySelector('form').innerHTML=`<span class="about-eyebrow about-eyebrow-dark">BID RECORDED</span><h2>Bid submitted</h2><p>Your bid of <strong>${market.money(result.bid.amount)}</strong> was recorded for ${esc(item.name)}. Your identity remains private.</p><button type="button" class="auction-bid-button" data-bid-finished>Done</button>`;dialog.querySelector('[data-bid-finished]').addEventListener('click',()=>dialog.close());});
    dialog.showModal();
  }

  function updateTimers() {
    let statusChanged=false;const now=Date.now();
    document.querySelectorAll('[data-auction-timer]').forEach(node=>{const starts=Number(node.dataset.auctionStart),ends=Number(node.dataset.auctionEnd),status=now<starts?'upcoming':now<ends?'live':'ended',target=status==='upcoming'?starts:ends;node.textContent=`${status==='upcoming'?'Starts in':status==='live'?'Closes in':'Closed'} ${market.remaining(target-now)}`;if(status!==node.dataset.auctionState){node.dataset.auctionState=status;statusChanged=true;}});
    if(statusChanged)render();
  }

  document.querySelectorAll('[data-auction-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.auctionFilter;render();}));
  grid.addEventListener('click',event=>{const button=event.target.closest('[data-place-bid]');if(button)openBid(button.dataset.placeBid);});
  window.addEventListener('farm-auctions-updated',render);
  window.addEventListener('storage',event=>{if(event.key==='marks-savannah-auction-bids-v1'||event.key==='marks-savannah-auction-schedule-v1')render();});
  window.setInterval(updateTimers,1000);
  render();
})();
