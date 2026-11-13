const {chromium}=require('playwright');const fs=require('fs');const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
const run=async(tag)=>{for(const id of ['mm-services','mm-products','mm-res']){await pg.hover(`.mmb[aria-controls="${id}"]`);await pg.waitForTimeout(700);await pg.addScriptTag({content:AXE});
 const r=await pg.evaluate(async id=>{const x=await axe.run(document.getElementById(id),{runOnly:['color-contrast']});return x.violations.flatMap(v=>v.nodes.map(n=>n.target.join(' ')+' '+(n.any[0]&&n.any[0].data?n.any[0].data.contrastRatio:'')))},id);console.log(tag,id,r.length?r:'pass')}};
await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(4000);await run('dark');
await pg.mouse.move(700,880);await pg.evaluate(()=>location.hash='#/services');await pg.waitForTimeout(2500);await pg.evaluate(()=>scrollTo(0,1500));await pg.waitForTimeout(600);await pg.mouse.wheel(0,-60);await pg.waitForTimeout(800);await run('light');
await b.close()})();
