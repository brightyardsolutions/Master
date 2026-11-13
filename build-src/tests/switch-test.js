const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const o={};const errs=[];
const pg=await b.newPage({viewport:{width:1440,height:900}});pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/brightyard\.in/,r=>r.fulfill({status:200,contentType:'text/html',body:'<title>external</title>'}));
await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(3000);
o.links=await pg.evaluate(()=>[...new Set([...document.querySelectorAll('a[href*="brightyard.in"]')].map(a=>a.getAttribute('href')))].filter(h=>/allocivo|xessly/.test(h)).sort());
o.leftInternal=await pg.evaluate(()=>[...document.querySelectorAll('a[href^="#/allocivo"],a[href^="#/xessly"]')].length);
for(const h of ['#/allocivo','#/allocivo/al-demo','#/xessly/xs-how']){const p2=await b.newPage();await p2.route(/brightyard\.in/,r=>r.fulfill({status:200,contentType:'text/html',body:'ok'}));
 const reqs=[];p2.on('request',r=>{if(/brightyard\.in/.test(r.url()))reqs.push(r.url())});await p2.goto('http://localhost:8080/'+h).catch(()=>{});await p2.waitForTimeout(2500);o[h]=reqs[0]||p2.url();await p2.close()}
await pg.click('.pc.al .pc-top',{trial:true}).catch(()=>{});
o.errs=errs;console.log(JSON.stringify(o,null,1));await b.close()})();
