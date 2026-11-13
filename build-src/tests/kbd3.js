const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const o={};
const pg=await b.newPage({viewport:{width:1308,height:800}});await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(3500);
const inGL=()=>pg.evaluate(()=>document.querySelector('#gl').contains(document.activeElement));
await pg.keyboard.press('g');await pg.waitForTimeout(1000);const t=[];for(let i=0;i<30;i++){await pg.keyboard.press('Tab');t.push(await inGL())}for(let i=0;i<5;i++){await pg.keyboard.press('Shift+Tab');t.push(await inGL())}
o.glTrap=t.every(Boolean);await pg.keyboard.press('Escape');await pg.waitForTimeout(500);o.glEsc=await pg.evaluate(()=>!document.querySelector('#gl').classList.contains('open')&&document.activeElement.id);
const m=await (await b.newContext({...devices['iPhone 13']})).newPage();await m.goto('http://localhost:8080/#/home');await m.waitForTimeout(3000);
await m.click('#burger');await m.waitForTimeout(500);o.menuFocus=await m.evaluate(()=>document.activeElement.textContent.trim().slice(0,20));
const r=[];for(let i=0;i<25;i++){await m.keyboard.press('Tab');r.push(await m.evaluate(()=>{const h=document.querySelector('#menu').parentNode;return h.contains(document.activeElement)}))}o.menuTrap=r.every(Boolean);
await m.keyboard.press('Escape');await m.waitForTimeout(400);o.menuEsc=await m.evaluate(()=>!document.querySelector('#menu').classList.contains('open')&&document.activeElement.id);
// menu link still navigates
await m.click('#burger');await m.waitForTimeout(400);await m.click('#menu a[href="#/work"], #menu [data-r="work"]');await m.waitForTimeout(1500);o.navWorks=await m.evaluate(()=>location.hash+' open='+document.querySelector('#menu').classList.contains('open'));
console.log(JSON.stringify(o));await b.close()})();
