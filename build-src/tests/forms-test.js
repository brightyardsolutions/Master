const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1308,height:860}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
const res={};
// contact
await pg.goto('http://localhost:8788/#/contact');await pg.waitForTimeout(3000);
await pg.click('#fsend');await pg.waitForTimeout(300);res.contactErrors=await pg.evaluate(()=>['goal','name','email'].map(i=>document.querySelector('#e-'+i).textContent).filter(Boolean));
await pg.fill('#goal','We need help connecting Tally and Shopify.');await pg.fill('#name','Test Person');await pg.fill('#email','test@example.com');
await pg.click('#fsend');await pg.waitForTimeout(2500);res.contact=await pg.evaluate(()=>(document.querySelector('#formcard .okm h3')||document.querySelector('#fnote')||{}).textContent);
// product forms
for(const [page,kind] of [['allocivo','Allocivo demo'],['xessly','Xessly early access']]){
 await pg.goto('http://localhost:8788/#/'+page);await pg.waitForTimeout(3000);
 const f=pg.locator(`form[data-kind="${kind}"]`);await f.scrollIntoViewIfNeeded();
 await f.locator('button[type=submit],button:not([type])').last().click();await pg.waitForTimeout(300);
 const errsN=await f.evaluate(el=>[...el.querySelectorAll('[id^=e-],.err,.ferr,[class*=err]')].filter(e=>e.textContent.trim()).length);
 const fields=await f.evaluate(el=>[...el.querySelectorAll('input,select,textarea')].map(i=>({n:i.name,t:i.type,req:!!i.dataset.req})));
 for(const x of fields){const loc=f.locator(`[name="${x.n}"]`);if(x.t==='checkbox'){await loc.check()}else if(x.t==='email'){await loc.fill('lead@example.com')}else if(x.t==='select-one'){await loc.selectOption({index:1})}else if(x.t!=='hidden'){await loc.fill('Test '+x.n)}}
 await f.locator('button[type=submit],button:not([type])').last().click();await pg.waitForTimeout(2500);
 res[page]={emptySubmitErrors:errsN,fields:fields.map(x=>x.n+(x.req?'*':'')).join(','),result:await f.evaluate(el=>(el.querySelector('.okm h3')||el.querySelector('[role=status],.note,.fnote')||{textContent:el.textContent.slice(0,80)}).textContent.trim())};
}
res.errs=errs;console.log(JSON.stringify(res,null,1));await b.close()})();
