const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const R={};
for(const [port,slug,paths] of [[8091,'allocivo',['','how-it-works/','integrations/','demo/']],[8092,'xessly',['','agent-flow/','where-fixes-land/','early-access/']]]){
 for(const p of paths){const pg=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});const errs=[],bad=[];
  pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});pg.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});
  await pg.goto(`http://localhost:${port}/${p}`);await pg.waitForTimeout(3500);
  for(let i=0;i<40;i++){await pg.mouse.wheel(0,600);await pg.waitForTimeout(80)}await pg.waitForTimeout(1200);
  const info=await pg.evaluate(()=>({title:document.title,h1:document.querySelector('h1')?.textContent.slice(0,50),canvas:!!document.querySelector('.s3 canvas'),flat:!!document.querySelector('.s3.flat'),hidden:[...document.querySelectorAll('main h2,main p')].filter(e=>getComputedStyle(e).opacity<.05).length,overflow:document.documentElement.scrollWidth-innerWidth,demo:!!document.querySelector('.aui,.xui,.xlive'),form:!!document.querySelector('form.lf')}));
  await pg.evaluate(()=>scrollTo(0,0));await pg.waitForTimeout(800);await pg.screenshot({path:`out/ps-${slug}-${p.replace(/\//g,'')||'home'}.png`});
  R[slug+'/'+p]={...info,errs,bad};await pg.close()}
}
console.log(JSON.stringify(R,null,1));await b.close()})();
