const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});const errs=[];pg.on('pageerror',e=>errs.push(e.message));const o={};
await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(4500);
// hover intent: quick pass across the header shouldn't open anything
await pg.mouse.move(700,400);await pg.waitForTimeout(300);await pg.mouse.move(700,38);await pg.mouse.move(1300,38,{steps:6});await pg.mouse.move(1300,400);await pg.waitForTimeout(400);o.flashOpen=await pg.evaluate(()=>!!document.querySelector('.mm.open'));await pg.mouse.move(780,38);await pg.waitForTimeout(80);o.openAt80=await pg.evaluate(()=>!!document.querySelector('.mm.open'));await pg.waitForTimeout(250);o.openAt330=await pg.evaluate(()=>!!document.querySelector('.mm.open'));
await pg.mouse.move(700,500);await pg.waitForTimeout(500);
// products, dark
await pg.hover('.mmb[aria-controls="mm-products"]');await pg.waitForTimeout(3200);await pg.screenshot({path:'out/mm-products-dark.png',clip:{x:0,y:0,width:1440,height:620}});
// switch to services (morph)
await pg.hover('.mmb[aria-controls="mm-services"]');await pg.waitForTimeout(120);await pg.screenshot({path:'out/mm-morph.png',clip:{x:0,y:0,width:1440,height:620}});await pg.waitForTimeout(500);
await pg.hover('#mm-services a[data-svc="a11y"]');await pg.waitForTimeout(500);await pg.screenshot({path:'out/mm-services-hover.png',clip:{x:0,y:0,width:1440,height:620}});
await pg.click('#yrIn');await pg.keyboard.type('Our checkout crashes on sale days and servers go down',{delay:15});await pg.waitForTimeout(700);
o.match=await pg.evaluate(()=>[document.querySelector('.mml1 a.match')?.dataset.svc,document.querySelector('#yrBub').textContent]);
await pg.mouse.move(1000,300);await pg.waitForTimeout(300);await pg.screenshot({path:'out/mm-services-yardie.png',clip:{x:0,y:0,width:1440,height:620}});
o.stillOpen=await pg.evaluate(()=>!!document.querySelector('#mm-services').closest('.mm').classList.contains('open'));
await pg.fill('#yrIn','');await pg.keyboard.type('Our hotel housekeeping runs on WhatsApp and rooms are late',{delay:10});await pg.waitForTimeout(1300);
o.hotel=await pg.evaluate(()=>document.querySelector('#yrBub').textContent);
await pg.screenshot({path:'out/mm-services-hotel.png',clip:{x:0,y:0,width:1440,height:620}});
await pg.fill('#yrIn','');await pg.keyboard.type('We need to pass a SOC 2 audit',{delay:10});await pg.waitForTimeout(1300);o.soc=await pg.evaluate(()=>[document.querySelector('.mml1 a.match')?.dataset.svc,document.querySelector('#yrBub').textContent]);
await pg.keyboard.press('Enter');await pg.waitForTimeout(6500);
o.ran=await pg.evaluate(()=>({hash:location.hash,ta:document.querySelector('#bpt').value,holo:!!document.querySelector('.bres.holo'),menuOpen:!!document.querySelector('.mm.open')}));
await pg.screenshot({path:'out/mm-ran.png'});
// light products
await pg.evaluate(()=>location.hash='#/services');await pg.waitForTimeout(2500);await pg.evaluate(()=>scrollTo(0,1500));await pg.waitForTimeout(500);await pg.mouse.wheel(0,-60);await pg.waitForTimeout(700);
await pg.hover('.mmb[aria-controls="mm-products"]');await pg.waitForTimeout(3000);await pg.screenshot({path:'out/mm-products-light.png',clip:{x:0,y:0,width:1440,height:620}});
await pg.hover('.mmb[aria-controls="mm-services"]');await pg.waitForTimeout(700);await pg.screenshot({path:'out/mm-services-light.png',clip:{x:0,y:0,width:1440,height:620}});
// phone
const m=await (await b.newContext({...devices['iPhone 13']})).newPage();m.on('pageerror',e=>errs.push('m '+e.message));await m.goto('http://localhost:8080/#/home');await m.waitForTimeout(3000);
await m.click('#burger');await m.waitForTimeout(400);await m.click('.mmb[aria-controls="mm-products"]');await m.waitForTimeout(500);await m.screenshot({path:'out/mm-phone.png'});
o.errs=errs;console.log(JSON.stringify(o,null,1));await b.close()})();
