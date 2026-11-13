const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [n,o] of [['desktop',{viewport:{width:1308,height:800}}],['phone',{...devices['iPhone 13']}]]){const pg=await (await b.newContext(o)).newPage();const items=[];
pg.on('response',async r=>{try{const buf=await r.body();items.push([new URL(r.url()).pathname,buf.length])}catch(e){}});
const t0=Date.now();await pg.goto('http://localhost:8080/#/home',{waitUntil:'load'});const load=Date.now()-t0;await pg.waitForTimeout(4000);
const tot=items.reduce((s,x)=>s+x[1],0);items.sort((a,b)=>b[1]-a[1]);
console.log(n,'total',(tot/1024).toFixed(0)+'KB uncompressed, load event',load+'ms');items.slice(0,8).forEach(x=>console.log('  ',(x[1]/1024).toFixed(0).padStart(5)+'KB',x[0]))}
await b.close()})();
