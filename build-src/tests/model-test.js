const {chromium}=require('playwright');
const out=__dirname+'/out/';
const briefs=(process.env.B||'2,0,4').split(',').map(Number);
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const errs=[];const vp=process.env.M?{width:390,height:844}:{width:1308,height:711};const mob=!!process.env.M;
for(const ex of briefs){
 const cx=await b.newContext({viewport:vp,deviceScaleFactor:1,hasTouch:mob,isMobile:mob});const pg=await cx.newPage();
 pg.on('pageerror',e=>errs.push(ex+' '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load/.test(m.text()))errs.push(ex+' '+m.text())});
 await pg.goto('http://localhost:8080/#/home/bpgen');await pg.waitForTimeout(5000);await pg.mouse.wheel(0,300);await pg.waitForTimeout(600);
 await pg.evaluate(()=>document.querySelector('.bpg').scrollIntoView({block:'center'}));await pg.waitForTimeout(1500);
 await pg.click('.bpex button >> nth='+ex);await pg.click('#bpgo');await pg.waitForTimeout(2000);
 const plan=await pg.$('#bpplan');
 const shots=[[0,2200,'a'],[0,3500,'b'],[1,1800,'a'],[1,3600,'b'],[2,3500,'a'],[2,5500,'b'],[3,2200,'a'],[3,4500,'b']];
 let cur=0;
 for(const [ch,w,s] of shots){ if(ch!==cur){await pg.click('.bh-tabs button >> nth='+ch);cur=ch;} await pg.waitForTimeout(s==='a'?w:w-shots.find(x=>x[0]===ch&&x[2]==='a')[1]); await plan.screenshot({path:out+`M${ex}-c${ch}${s}.png`}); }
 const r=await pg.evaluate(()=>{const ov=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
   const ls=[...document.querySelectorAll('.bh-l.on')].map(l=>l.getBoundingClientRect());let lo=0;for(let i=0;i<ls.length;i++)for(let j=i+1;j<ls.length;j++)if(ov(ls[i],ls[j])>4)lo++;
   return {title:document.querySelector('.bh-t').textContent,labelsOn:ls.length,overlaps:lo,dates:[...document.querySelectorAll('[data-ms]')].map(e=>e.textContent).slice(0,3)}});
 console.log('brief',ex,JSON.stringify(r));
 await cx.close();}
console.log('ERRORS:',errs.length?errs.slice(0,6):'none');await b.close()})();
