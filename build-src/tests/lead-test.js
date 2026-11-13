const {chromium}=require('playwright');const PORT=process.env.P||8788,out='out/';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1308,height:760}});const pg=await ctx.newPage();const errs=[];
pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await pg.goto(`http://localhost:${PORT}/#/home/bpgen`);await pg.waitForTimeout(4000);
await pg.evaluate(()=>document.querySelector('.bpg').scrollIntoView({block:'center'}));await pg.waitForTimeout(1200);
await pg.click('.bpex button >> nth=0');await pg.click('#bpgo');await pg.waitForTimeout(3000);
await pg.click('.bh-tabs button >> nth=3');await pg.waitForTimeout(1500);
await pg.selectOption('#bpStart',{index:3});await pg.waitForTimeout(300);
await pg.click('.bh-cta [data-take]');await pg.waitForTimeout(600);
await pg.screenshot({path:out+'L1-step1.png'});
await pg.click('.bpd-go');await pg.waitForTimeout(300);const e1=await pg.textContent('#bpd-email-e');
await pg.fill('#bpd-email','lead@example.com');await pg.click('.bpd-go');await pg.waitForTimeout(2500);
await pg.screenshot({path:out+'L2-'+PORT+'.png'});
const step=await pg.evaluate(()=>({ok:!!document.querySelector('.bpd-ok'),msg:(document.querySelector('.bpd-msg')||{}).textContent||''}));
let link='';
if(step.ok){
  await pg.click('.bpd-go');await pg.waitForTimeout(300);const e2=await pg.evaluate(()=>[...document.querySelectorAll('.bpd-e')].map(e=>e.textContent).filter(Boolean));
  await pg.fill('#bpd-name','Lee');await pg.fill('#bpd-company','Acme');await pg.selectOption('#bpd-role',{index:2});await pg.selectOption('#bpd-timing',{index:1});
  await pg.click('.bpd-go');await pg.waitForTimeout(2500);await pg.screenshot({path:out+'L3-done.png'});
  console.log('validation',e1,e2,'done:',await pg.textContent('.bpd-done h3'));
}else console.log('fallback:',e1,'|',step.msg);
await pg.keyboard.press('Escape');await pg.waitForTimeout(300);
console.log('dialog closed',await pg.evaluate(()=>!document.querySelector('.bpd').open));
// share link built from the same holo
link=await pg.evaluate(()=>{const t=document.querySelector('#bpt').value,s=document.querySelector('#bpStart').value;return BYBrief.link(location.href,t,s)});
const sel=await pg.evaluate(()=>document.querySelector('#bpStart').value);
// print layout
await pg.evaluate(()=>{const h={};});
const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push('p2 '+e.message));
await p2.goto(link);await p2.waitForTimeout(9000);
const r=await p2.evaluate(()=>({hash:location.hash,ta:document.querySelector('#bpt').value.slice(0,40),holo:!!document.querySelector('.bres.holo')}));
await p2.click('.bh-tabs button >> nth=3');await p2.waitForTimeout(800);
r.start=await p2.evaluate(()=>document.querySelector('#bpStart').value);r.want=sel;
console.log('shared',JSON.stringify(r));
await p2.screenshot({path:out+'L4-shared.png'});
console.log('ERRORS',errs.length?errs:'none');await b.close()})();
