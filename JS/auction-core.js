// Shared browser-side auction data and bidding rules for the website and Android app.
// Production bidding needs a server to validate and synchronize offers across devices.
(() => {
  const scheduleKey = 'marks-savannah-auction-schedule-v1';
  const bidsKey = 'marks-savannah-auction-bids-v1';
  const bidderKey = 'marks-savannah-auction-bidder-v1';
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  const templates = [
    { id:'boran-bull', name:'Premium Boran Bull', type:'Boran cattle', category:'Livestock', image:'Assets/Cattle%20dropdown.jpg', quantity:'1 bull', startBid:60000, increment:2000, startsIn:-2*HOUR, duration:3*DAY, summary:'Breeding bull offered as an individual lot.', specs:[['Breed','Boran'],['Sex','Male'],['Age','3 years'],['Lot size','1 bull'],['Health','Ask for vaccination and treatment records'],['Inspection','Arrange an on-farm inspection'],['Location','Laikipia County'],['Collection','Buyer arranges transport after award']] },
    { id:'dairy-heifers', name:'Dairy Heifers — 2 Head', type:'Dairy cattle', category:'Livestock', image:'Assets/Cattle%20dropdown.jpg', quantity:'2 heifers', startBid:110000, increment:5000, startsIn:-(8*HOUR), duration:2*DAY, summary:'Two dairy heifers offered together as one lot.', specs:[['Breed','Confirm with farm'],['Sex','Female'],['Age','Confirm for each animal'],['Lot size','2 heifers'],['Production','Not in milk; ask for individual details'],['Health','Ask for vaccination and veterinary records'],['Inspection','Arrange before placing a bid'],['Location','Nakuru County']] },
    { id:'boer-goats', name:'Boer Goats — 10 Head', type:'Boer goats', category:'Livestock', image:'Assets/Goats.jpg', quantity:'10 goats', startBid:60000, increment:2000, startsIn:2*DAY, duration:2*DAY, summary:'A group lot of ten Boer goats for herd building.', specs:[['Breed','Boer'],['Lot size','10 goats'],['Age and sex','Confirm list with farm'],['Health','Ask for health and treatment records'],['Inspection','Arrange with farm before bidding'],['Location','Narok County'],['Collection','Transport arranged after award']] },
    { id:'sheep-breeding', name:'Breeding Rams — 3 Head', type:'Sheep', category:'Livestock', image:'Assets/Sheep.jpg', quantity:'3 rams', startBid:45000, increment:1500, startsIn:4*DAY, duration:2*DAY, summary:'Three breeding rams offered as a single lot.', specs:[['Breed','Confirm with farm'],['Sex','Male'],['Lot size','3 rams'],['Age','Confirm for each animal'],['Health','Ask for veterinary records'],['Inspection','Arrange before auction opens'],['Location','Laikipia County']] },
    { id:'kienyeji-pullets', name:'Kienyeji Pullets — 50 Birds', type:'Poultry', category:'Poultry', image:'Assets/poultry%20Frming.jpg', quantity:'50 birds', startBid:25000, increment:1000, startsIn:6*DAY, duration:36*HOUR, summary:'A flock lot of fifty growing Kienyeji pullets.', specs:[['Type','Kienyeji pullets'],['Lot size','50 birds'],['Age','Confirm with farm'],['Vaccination','Request flock vaccination details'],['Inspection','Arrange before auction opens'],['Location','Nakuru County'],['Collection','Suitable poultry transport required']] },
    { id:'farm-tractor', name:'Farm Tractor & Plough Lot', type:'Farm equipment', category:'Equipment', image:'Assets/Farm%20Equipments.jpg', quantity:'1 tractor lot', startBid:850000, increment:25000, startsIn:-(1*HOUR), duration:2*DAY, summary:'Tractor and compatible plough offered together.', specs:[['Make and model','Confirm with farm'],['Condition','Used; inspect before bidding'],['Included','Tractor and one plough'],['Engine hours','Confirm on inspection'],['Service history','Request available records'],['Inspection','Required before bidding'],['Location','Nakuru County'],['Collection','Buyer arranges equipment transport']] }
  ];

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const baseId = id => id.replace(/-relist-\d+$/, '');
  function itemFor(entry) {
    const source = templates.find(item => item.id === baseId(entry.id));
    if (!source) return null;
    const relist = entry.id === source.id ? 0 : Number(entry.id.match(/-relist-(\d+)$/)?.[1] || 1);
    return relist ? {...source, id:entry.id, name:`${source.name} (Round ${relist + 1})`} : source;
  }
  function schedule() {
    let entries = read(scheduleKey, null);
    if (!Array.isArray(entries) || !templates.every(item => entries.some(entry => entry.id === item.id))) {
      const now = Date.now();
      entries = templates.map(item => ({id:item.id, startsAt:now + item.startsIn, endsAt:now + item.startsIn + item.duration}));
    }
    const now = Date.now();
    let available = entries.filter(entry => Number(entry.endsAt) > now).length;
    while (available < 3) {
      const lastEnd = Math.max(now, ...entries.map(entry => Number(entry.endsAt) || 0));
      const source = templates[(entries.length - templates.length) % templates.length];
      const round = Math.max(0, ...entries.filter(entry => baseId(entry.id) === source.id).map(entry => Number(entry.id.match(/-relist-(\d+)$/)?.[1] || 0))) + 1;
      const startsAt = Math.max(now + 12 * HOUR, lastEnd);
      entries.push({id:`${source.id}-relist-${round}`, startsAt, endsAt:startsAt + 2 * DAY});
      available++;
    }
    save(scheduleKey, entries);
    return entries;
  }
  function list() {
    const times = schedule(), now = Date.now();
    return times.map(time => {
      const item = itemFor(time);
      if (!item) return null;
      const startsAt = Number(time.startsAt) || now, endsAt = Number(time.endsAt) || (now + item.duration);
      const status = now < startsAt ? 'upcoming' : now < endsAt ? 'live' : 'ended';
      const bids = getBids(item.id);
      return {...item, startsAt, endsAt, status, bids, highestBid:bids[0]?.amount || item.startBid, bidderCount:new Set(bids.map(bid => bid.bidder)).size};
    }).filter(Boolean);
  }
  function get(id) { return list().find(item => item.id === id) || list()[0]; }
  function getBids(id) {
    const all = read(bidsKey, []);
    return (Array.isArray(all) ? all : []).filter(bid => bid && bid.auctionId === id && Number.isFinite(Number(bid.amount)))
      .sort((a,b) => Number(b.amount)-Number(a.amount) || Number(a.placedAt)-Number(b.placedAt));
  }
  function bidderId() {
    const account = (localStorage.getItem('savanna-customer-session') || sessionStorage.getItem('savanna-customer-session') || '').trim().toLowerCase();
    const scopedKey = `${bidderKey}:${account ? encodeURIComponent(account) : 'anonymous-device'}`;
    let id = localStorage.getItem(scopedKey);
    if (!id) { id = globalThis.crypto?.randomUUID?.() || `buyer-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`; try { localStorage.setItem(scopedKey,id); } catch {} }
    return id;
  }
  function myBids() { return read(bidsKey, []).filter(bid => bid && bid.bidder === bidderId()).sort((a,b) => Number(b.placedAt)-Number(a.placedAt)); }
  function minBid(item) { return item.bids.length ? item.highestBid + item.increment : item.startBid; }
  function placeBid(id, amount) {
    const item = get(id), value = Number(amount), minimum = minBid(item);
    if (item.status !== 'live') return {ok:false, message:'This auction is not open for bids.'};
    if (!Number.isSafeInteger(value) || value < minimum || (value - minimum) % item.increment !== 0) return {ok:false, message:`Enter KSh ${minimum.toLocaleString('en-KE')} or more in increments of KSh ${item.increment.toLocaleString('en-KE')}.`};
    const all = read(bidsKey, []);
    const bid = {auctionId:id, bidder:bidderId(), amount:value, placedAt:Date.now()};
    save(bidsKey, [...(Array.isArray(all)?all:[]), bid]);
    window.dispatchEvent(new CustomEvent('farm-auctions-updated'));
    return {ok:true, bid};
  }
  const money = amount => `KSh ${Number(amount).toLocaleString('en-KE')}`;
  const remaining = ms => {
    ms=Math.max(0,Number(ms)||0); const d=Math.floor(ms/DAY), h=Math.floor(ms%DAY/HOUR), m=Math.floor(ms%HOUR/60000), s=Math.floor(ms%60000/1000);
    return `${String(d).padStart(2,'0')}d : ${String(h).padStart(2,'0')}h : ${String(m).padStart(2,'0')}m : ${String(s).padStart(2,'0')}s`;
  };
  window.FarmAuctions = {list,get,getBids,myBids,minBid,placeBid,money,remaining};
})();
