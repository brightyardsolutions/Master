const {chromium}=require('playwright');
const out=__dirname+'/out/';
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const errs=[];
 const watch=pg=>{pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/fonts\.g|ERR_|Failed to load resource/.test(m.text()))errs.push('console: '+m.text())})};
 // 1. normal desktop: navigation through every page, blueprint, forms
 let pg=await b.newPage({viewport:{width:1440,height:860}});watch(pg);
 await pg.goto('http://localhost:8080/#/home');await pg.waitForTimeout(4000);
 for(const id of ['services','products','work','how','insights','allocivo','xessly','contact','privacy','home']){
   await pg.evaluate(id=>{location.hash='#/'+id},id);await pg.waitForTimeout(2600);
   const s=await pg.evaluate(()=>{const p=document.querySelector('.page.on');const h=p.querySelector('h1');const r=h&&h.getBoundingClientRect();return {id:p.id,title:document.title,h1vis:!!r&&r.width>0,hidden:[].filter.call(p.querySelectorAll('.rv'),e=>{const b=e.getBoundingClientRect();return b.top<innerHeight*0.85&&b.bottom>0&&getComputedStyle(e).opacity==='0'&&!e.closest('[data-draft],.launch-only,.opt')}).length,pt:getComputedStyle(document.querySelector('#pt i')).transform}});
   console.log(JSON.stringify(s));
 }
 // sub-anchor
 await pg.evaluate(()=>{location.hash='#/allocivo/al-demo'});await pg.waitForTimeout(4500);
 console.log('anchor al-demo top:',await pg.evaluate(()=>Math.round(document.getElementById('al-demo').getBoundingClientRect().top)));
 await pg.fill('#p-allocivo input[name=name]','Test');await pg.click('#p-allocivo button[type=submit]');await pg.waitForTimeout(300);
 console.log('form errors shown:',await pg.evaluate(()=>[].filter.call(document.querySelectorAll('#p-allocivo .err'),e=>e.textContent).length));
 // calculator
 console.log('calc total:',await pg.evaluate(()=>document.querySelector('[data-r="total"]').textContent));
 // blueprint
 await pg.evaluate(()=>{location.hash='#/home/bpgen'});await pg.waitForTimeout(4500);
 await pg.fill('#bpt','want to create a chatbot');await pg.click('#bpgo');await pg.waitForSelector('.bh-panel',{timeout:8000});await pg.waitForTimeout(1500);
 console.log('blueprint:',await pg.evaluate(()=>{const p=document.querySelector('#bpplan');return p.querySelector('.bh-t').textContent+' | labels '+p.querySelectorAll('.bh-l').length+' | height '+Math.round(p.getBoundingClientRect().height)}));
 await (await pg.$('#bpgen')).screenshot({path:out+'bp-compact.png'});
 // yard menu + assistant
 await pg.keyboard.press('g');await pg.waitForTimeout(900);console.log('yard open:',await pg.evaluate(()=>document.querySelector('#gl').classList.contains('open')));await pg.keyboard.press('Escape');
 await pg.click('#astb');await pg.click('#qr button');await pg.waitForTimeout(800);console.log('assistant msgs:',await pg.evaluate(()=>document.querySelectorAll('#msgs .m').length));
 await pg.close();
 // 2. reduced motion: flat stories, everything visible
 const cx=await b.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});pg=await cx.newPage();watch(pg);
 await pg.goto('http://localhost:8080/#/xessly');await pg.waitForTimeout(2500);
 console.log('reduced:',await pg.evaluate(()=>({cls:document.documentElement.className,flat:document.querySelector('#p-xessly .s3').classList.contains('flat'),pre:getComputedStyle(document.querySelector('#pre')).display,steps:[].filter.call(document.querySelectorAll('#p-xessly .s3-step'),e=>getComputedStyle(e).opacity==='1').length,scenes:!!window.BYScenes})));
 await pg.screenshot({path:out+'reduced-xessly.png'});
 console.log('ERRORS:',errs.length?errs.slice(0,8):'none');
 await b.close();
})();
