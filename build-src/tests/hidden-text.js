const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(3000);
for(const p of ['home','services','products','allocivo','xessly','how','work','insights','contact','privacy']){
 await pg.evaluate(h=>location.hash=h,'#/'+p);await pg.waitForTimeout(2000);
 for(let i=0;i<80;i++){await pg.mouse.wheel(0,450);await pg.waitForTimeout(90)}await pg.waitForTimeout(1200);
 const r=await pg.evaluate(p=>{const P=document.querySelector('#p-'+p);const els=[...P.querySelectorAll('h1,h2,h3,p,li,.ch,td,b,small')].filter(e=>e.textContent.trim()&&e.getClientRects().length&&!e.closest('[aria-hidden="true"],template,.s3-step,[data-story] .s3-steps,.hp,.sr'));
  const hid=els.filter(e=>{let n=e;while(n&&n!==P){const cs=getComputedStyle(n);if(cs.visibility==='hidden'||+cs.opacity<0.05)return true;n=n.parentElement}return false});
  return {total:els.length,hidden:hid.length,ex:hid.slice(0,5).map(e=>e.tagName+'.'+(e.className||'')+': '+e.textContent.trim().slice(0,40)+' <'+(e.closest('[class]')||{}).className+'>')}},p);
 console.log(p.padEnd(9),r.hidden+'/'+r.total,JSON.stringify(r.ex));
}
await b.close()})();
