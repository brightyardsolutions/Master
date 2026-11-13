const {chromium}=require('playwright');const fs=require('fs');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1308,height:800}});
await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(3500);
for(const p of ['home','products','xessly']){await pg.evaluate(h=>location.hash=h,'#/'+p);await pg.waitForTimeout(2000);
 await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)});await pg.waitForTimeout(600);
 await pg.addScriptTag({content:AXE});
 const r=await pg.evaluate(async p=>{const r=await axe.run(document.querySelector('#p-'+p),{runOnly:['color-contrast']});return r.violations.flatMap(v=>v.nodes.map(n=>({t:n.target.join(' '),txt:(document.querySelector(n.target[0])||{}).textContent?.trim().slice(0,40),d:n.any[0]&&n.any[0].data&&{fg:n.any[0].data.fgColor,bg:n.any[0].data.bgColor,r:n.any[0].data.contrastRatio,need:n.any[0].data.expectedContrastRatio,size:n.any[0].data.fontSize}})))},p);
 console.log('==',p);r.forEach(x=>console.log(' ',x.t.slice(0,60).padEnd(60),JSON.stringify(x.d),'|',x.txt))}
await b.close()})();
