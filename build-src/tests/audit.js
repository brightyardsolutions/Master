const {chromium,devices}=require('playwright');const fs=require('fs');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const pages=['home','services','products','allocivo','xessly','how','work','insights','contact','privacy'];
(async()=>{const b=await chromium.launch();const report={};
for(const [dev,opts] of [['desktop',{viewport:{width:1308,height:800}}],['phone',{...devices['iPhone 13']}]]){
 const ctx=await b.newContext({...opts,reducedMotion:'no-preference'});const pg=await ctx.newPage();const errs=[];const bad=new Set();
 pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 pg.on('response',r=>{if(r.status()>=400)bad.add(r.status()+' '+r.url())});
 await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(3500);
 for(const p of pages){
  await pg.evaluate(h=>location.hash=h,'#/'+p);await pg.waitForTimeout(2200);
  const sel='#p-'+p;
  // scroll through to trigger reveals
  await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)});await pg.waitForTimeout(600);
  const info=await pg.evaluate(sel=>{const P=document.querySelector(sel);const vis=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&getComputedStyle(e).visibility!=='hidden';
   const tbd=[...P.querySelectorAll('.tbd')].filter(vis).map(e=>e.textContent.trim()).slice(0,8);
   const h1=[...P.querySelectorAll('h1')].filter(vis).length;
   const deadLinks=[...P.querySelectorAll('a')].filter(vis).filter(a=>{const h=a.getAttribute('href');return !h||h==='#'||h==='javascript:void(0)'}).map(a=>a.textContent.trim().slice(0,30)).slice(0,8);
   const noName=[...P.querySelectorAll('button,a,[role=button]')].filter(vis).filter(e=>!(e.textContent.trim()||e.getAttribute('aria-label')||e.getAttribute('title')||e.querySelector('img[alt]'))).map(e=>e.outerHTML.slice(0,80)).slice(0,5);
   const overflow=document.documentElement.scrollWidth-innerWidth;
   const imgs=[...P.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).length;
   return {tbd,h1,deadLinks,noName,overflow,imgsNoAlt:imgs,title:document.title}},sel);
  await pg.addScriptTag({content:AXE});
  const ax=await pg.evaluate(async sel=>{const r=await axe.run(document.querySelector(sel),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').split('\n').slice(1,2).join(''))}))},sel);
  report[dev+':'+p]={...info,axe:ax};
 }
 report[dev+':errors']=errs.slice(0,15);report[dev+':http']=[...bad].slice(0,15);
 // global chrome (header, footer, dock) once
 await pg.addScriptTag({content:AXE});
 report[dev+':chrome']=await pg.evaluate(async()=>{const r=await axe.run({include:[['header'],['footer'],['#dock']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' '))}))}).catch(e=>String(e));
 await ctx.close();
}
fs.writeFileSync('out/audit.json',JSON.stringify(report,null,1));await b.close();console.log('done')})();
