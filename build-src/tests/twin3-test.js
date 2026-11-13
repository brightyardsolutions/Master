const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const o={};
const pg=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(3500);
const sec=pg.locator('#p-home .prods');await sec.scrollIntoViewIfNeeded();await pg.waitForTimeout(800);
const y=await sec.evaluate(e=>e.getBoundingClientRect().top+scrollY);await pg.evaluate(y=>scrollTo(0,y-90),y);
o.seq=[];for(let i=0;i<4;i++){await pg.waitForTimeout(i?2200:1500);o.seq.push(await pg.evaluate(()=>[...document.querySelectorAll('#p-home .pp')].map(c=>c.querySelector('.aui,.xui').dataset.state+' | '+c.querySelector('.pp-now').textContent)))}
await pg.click('#p-home .pp.al .pp-steps li[data-s="2"] button');await pg.click('#p-home .pp.xs .pp-steps li[data-s="2"] button');await pg.waitForTimeout(900);
await pg.screenshot({path:'out/tw3.png'});
o.rows=await pg.evaluate(()=>[...document.querySelectorAll('#p-home .pp')].map(c=>['h3','[data-ui]','.pp-steps','.pp-now','.pp-act'].map(s=>Math.round(c.querySelector(s).getBoundingClientRect().top)).join('/')));
await pg.evaluate(()=>location.hash='#/products');await pg.waitForTimeout(2000);o.productsPage=await pg.evaluate(()=>[...document.querySelectorAll('#p-products .pp h3')].map(h=>h.textContent));
const m=await (await b.newContext({...devices['iPhone 13']})).newPage();m.on('pageerror',e=>errs.push('m '+e.message));await m.goto('http://localhost:8080/#/home');await m.waitForTimeout(3000);
const mc=m.locator('#p-home .pp.xs');await mc.scrollIntoViewIfNeeded();await m.waitForTimeout(3000);await mc.screenshot({path:'out/tw3-phone.png'});
o.errs=errs;console.log(JSON.stringify(o,null,1));await b.close()})();
