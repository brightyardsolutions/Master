/* ===== core: smooth scroll, router, page transitions, scroll animation, 3D stages ===== */
(function(){
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var G=window.gsap,ST=window.ScrollTrigger,anim=!!(G&&ST)&&!reduced,root=document.documentElement;
var PRODUCT=root.dataset.product||'',ASSETS=root.dataset.assets||'';
if(G&&ST)G.registerPlugin(ST);
root.classList.remove('anim');root.classList.add(anim?'anim':'noanim');
$('#yr').textContent=new Date().getFullYear();

/* ---------- smooth scroll ---------- */
var lenis=null;
if(window.Lenis&&anim&&fine){
  lenis=new Lenis({lerp:.1,smoothWheel:true});
  lenis.on('scroll',ST.update);
  G.ticker.add(function(t){lenis.raf(t*1000)});G.ticker.lagSmoothing(0);
}
function toTop(){if(lenis)lenis.scrollTo(0,{immediate:true,force:true});else window.scrollTo(0,0)}
function scrollToEl(el,now){
  if(lenis)lenis.scrollTo(el.getBoundingClientRect().top+window.scrollY-84,{immediate:!!now,force:true});
  else window.scrollTo({top:el.getBoundingClientRect().top+scrollY-84,behavior:now||reduced?'auto':'smooth'});
}
function scrollToY(y){if(lenis)lenis.scrollTo(y,{force:true});else window.scrollTo({top:y,behavior:reduced?'auto':'smooth'})}

/* ---------- split headings into masked words ---------- */
function split(el){
  var n=0;
  (function walk(node){
    [].slice.call(node.childNodes).forEach(function(c){
      if(c.nodeType===3){
        var f=document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(' '));return}
          var w=document.createElement('span');w.className='w'+(/^[.,;:!?)]/.test(p)&&c.previousSibling&&c.previousSibling.nodeType===1&&!/^\s/.test(c.textContent)?' wp':'');
          var i=document.createElement('span');i.textContent=p;i.style.transitionDelay=(n++*60)+'ms';
          w.appendChild(i);f.appendChild(w);
        });
        c.parentNode.replaceChild(f,c);
      }else if(c.nodeType===1){walk(c)}
    });
  })(el);
}
$$('.split').forEach(split);

/* ---------- 3D scenes: loaded on demand ---------- */
var scenesP=null,scenes={};
function loadScenes(){
  if(scenesP)return scenesP;
  scenesP=new Promise(function(res){
    if(reduced){res(null);return}
    var s=document.createElement('script');s.src=ASSETS+'assets/js/scenes.js';
    s.onload=function(){res(window.BYScenes&&BYScenes.supported()?BYScenes:null)};
    s.onerror=function(){res(null)};
    document.head.appendChild(s);
  });
  return scenesP;
}
window.BYLoadScenes=loadScenes;
function makeScene(key,cls,canvas){
  if(scenes[key])return scenes[key];
  try{scenes[key]=new BYScenes[cls](canvas)}catch(e){scenes[key]=null}
  return scenes[key];
}
function stopScenes(){Object.keys(scenes).forEach(function(k){if(scenes[k])scenes[k].stop()})}

/* ---------- header tone and hide on scroll ---------- */
var hdr=$('#hdr'),prog=$('#prog'),darks=[],lastY=0,tick=false;
function tone(){
  var y=40,on=false;
  for(var i=0;i<darks.length;i++){var r=darks[i].getBoundingClientRect();if(r.top<=y&&r.bottom>y){on=true;break}}
  hdr.classList.toggle('on-dark',on);
}
function onScroll(){
  if(tick)return;tick=true;
  requestAnimationFrame(function(){
    var y=window.scrollY,h=root.scrollHeight-innerHeight;
    hdr.classList.toggle('sc',y>10);
    hdr.classList.toggle('hide',y>lastY&&y>500&&!$('#menu').classList.contains('open'));
    lastY=y;prog.style.transform='scaleX('+(h>0?y/h:0)+')';tone();tick=false;
  });
}
window.addEventListener('scroll',onScroll,{passive:true});

/* ---------- per-page scroll animation ---------- */
var ctx=null,sio=null;
function reveal(pg){
  var rv=$$('.rv',pg),sp=$$('.split',pg);
  if(!anim){rv.concat(sp).forEach(function(e){e.classList.add('in')});return}
  sp.forEach(function(el){ST.create({trigger:el,start:'top 90%',once:true,onEnter:function(){el.classList.add('in')}})});
  G.set(rv,{autoAlpha:0,y:44});
  ST.batch(rv,{start:'top 92%',once:true,onEnter:function(b){G.to(b,{autoAlpha:1,y:0,duration:1,ease:'power3.out',stagger:.09,overwrite:'auto'})}});
}
/* child staggers: CSS transitions started by an IntersectionObserver. Content is visible unless .stg-wait is set,
   and the observer cannot miss: it also fires for anything already on screen. */
var stio=null;
function stagger(pg){
  if(stio)stio.disconnect();
  var groups=$$('.chips,.wont,.levers,.arch,.auto,.tracks,.cover,.otiles',pg);
  if(!anim||!('IntersectionObserver' in window)){groups.forEach(function(g){g.classList.remove('stg-wait')});return}
  stio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('stg-wait');stio.unobserve(e.target)}})},{rootMargin:'0px 0px -12% 0px'});
  groups.forEach(function(g){[].forEach.call(g.children,function(c,i){c.style.setProperty('--si',i)});g.classList.add('stg','stg-wait');stio.observe(g)});
  /* bands grow to full size once, whenever they come into view, even at the very end of a page */
  $$('.band',pg).forEach(function(b){G.set(b,{scale:.94,borderRadius:60});var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();G.to(b,{scale:1,borderRadius:36,duration:.9,ease:'power3.out'})}});io.observe(b)});
}
function parallax(pg){
  if(!anim)return;
  $$('.prods .pp',pg).forEach(function(p,i){G.fromTo(p,{y:50},{y:0,ease:'none',scrollTrigger:{trigger:p.parentNode,start:'top 95%',end:'top 35%',scrub:.8}})});
  $$('.pp [data-ui],.pvis [data-ui]',pg).forEach(function(u){G.fromTo(u,{y:26,rotateX:8,transformPerspective:900},{y:0,rotateX:0,ease:'none',scrollTrigger:{trigger:u,start:'top 95%',end:'top 50%',scrub:.6}})});
  stagger(pg);
  $$('.ph',pg).forEach(function(p){G.to($('.wrap',p),{yPercent:18,autoAlpha:.2,ease:'none',scrollTrigger:{trigger:p,start:'top top',end:'bottom top',scrub:true}})});
}
function gallery(pg){
  $$('[data-hscroll]',pg).forEach(function(hs){
    var tr=$('.hs-track',hs),sec=hs.closest('.hsec'),bar=$('.hs-prog i',sec);
    if(!anim||innerWidth<941){hs.classList.add('native');return}
    hs.classList.remove('native');
    var dist=function(){return Math.max(0,tr.scrollWidth-innerWidth)};
    G.to(tr,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:sec,start:'top top',end:function(){return '+='+dist()},pin:true,scrub:.7,invalidateOnRefresh:true,anticipatePin:1,
      onUpdate:function(s){if(bar)bar.style.transform='scaleX('+s.progress+')'}}});
    G.from($$('.hs-card',tr),{y:70,autoAlpha:0,stagger:.08,duration:1,ease:'power3.out',scrollTrigger:{trigger:sec,start:'top 70%',once:true}});
  });
}
function story(sec,S){
  var key=sec.dataset.story,steps=$$('.s3-step',sec),n=steps.length,rail=$('.s3-rail',sec),pin=$('.s3-pin',sec),cur=-1,st=null;
  if(!rail.children.length){
    rail.innerHTML=steps.map(function(s,i){return '<button type="button" tabindex="-1" aria-hidden="true"><i></i></button>'}).join('')+'<span></span>';
  }
  var btns=$$('button',rail),cnt=$('span',rail);
  function setStep(i){
    if(i===cur)return;cur=i;
    steps.forEach(function(s,j){s.classList.toggle('on',j===i)});
    btns.forEach(function(b,j){b.classList.toggle('on',j===i);b.classList.toggle('done',j<i)});
    cnt.textContent=(i<9?'0':'')+(i+1)+' / '+n;
  }
  var scene=S?makeScene(key,key==='al'?'Allocivo':'Xessly',$('canvas',sec)):null;
  if(!scene||!anim){sec.classList.add('flat');return}
  sec.classList.remove('flat');setStep(0);scene.setProgress(0);scene.start();
  st=ST.create({trigger:pin,start:'top top',end:'+='+(n*90)+'%',pin:true,scrub:true,anticipatePin:1,
    onUpdate:function(self){var p=self.progress*(n-1);scene.setProgress(p);setStep(Math.round(p))}});
  function goStep(i){scrollToY(st.start+(st.end-st.start)*i/(n-1)+2)}
  btns.forEach(function(b,i){b.onclick=function(){goStep(i)}});
  steps.forEach(function(s,i){s.addEventListener('focusin',function(){if(cur!==i)goStep(i)})});
}
function heroInit(pg){
  var hero=$('#hero',pg);if(!hero)return;
  if(anim){
    var tl=G.timeline({delay:.15});
    tl.from('.h3-kick',{y:20,autoAlpha:0,duration:.8,ease:'power3.out'})
      .add(function(){$('.hero3 h1').classList.add('in')},'<')
      .from('.hero3 .lead,.hero3 .acts,.hero3 .micro,.hero3 .segs',{y:28,autoAlpha:0,duration:.9,ease:'power3.out',stagger:.09},'-=.3')
      .from('.h3-meta',{autoAlpha:0,duration:.8},'-=.5')
      .from('.h3-scroll',{autoAlpha:0,duration:.8},'-=.4');
    G.to('.h3-in',{yPercent:-14,autoAlpha:0,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom 35%',scrub:true}});
  }
  loadScenes().then(function(S){
    if(!S){hero.classList.add('no3d');return}
    var sc=makeScene('hero','Hero',$('#hero-c'));
    if(!sc){hero.classList.add('no3d');return}
    sc.start();hero.classList.add('is-live');window.__heroScene=sc;
    if(!hero._b){hero._b=1;
      var pb=$('#hero-pause');if(pb)pb.addEventListener('click',function(){sc.paused=!sc.paused;pb.setAttribute('aria-pressed',sc.paused);pb.textContent=sc.paused?'Play animation':'Pause animation'});
      hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();sc.pointer((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1))});
    }
    if(anim&&ctx)ctx.add(function(){ST.create({trigger:hero,start:'top top',end:'bottom top',scrub:true,onUpdate:function(s){sc.setScroll(s.progress)}})});
  });
}
function enter(pg){
  if(ctx)ctx.revert();stopScenes();if(sio)sio.disconnect();
  $$('.rv,.split',pg).forEach(function(e){e.classList.remove('in')});
  darks=$$('[data-dark]',pg);
  var build=function(){
    reveal(pg);parallax(pg);gallery(pg);heroInit(pg);
    if(anim)G.fromTo('.giant',{xPercent:-6},{xPercent:6,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'bottom bottom',scrub:.8}});
  };
  if(G)ctx=G.context(build);else build();
  /* how-we-work sticky visual */
  sio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var s=e.target.dataset.s;
    $$('.sstep',pg).forEach(function(x){x.classList.toggle('on',x.dataset.s===s)});$$('.vs',pg).forEach(function(x){x.classList.toggle('on',x.dataset.s===s)})})},{rootMargin:'-45% 0px -45% 0px'});
  $$('.sstep',pg).forEach(function(s){sio.observe(s)});
  var st=$$('[data-story]',pg);
  if(st.length){
    return loadScenes().then(function(S){
      if(!pg.classList.contains('on'))return;
      if(ctx)ctx.add(function(){st.forEach(function(s){story(s,S)})});else st.forEach(function(s){story(s,null)});
      if(ST)ST.refresh();
    });
  }
  if(ST)ST.refresh();
  return Promise.resolve();
}

/* ---------- router ---------- */
var pages=$$('.page'),links=$$('a[data-r],button.mmb[data-r]'),menu=$('#menu'),burger=$('#burger'),curId=null,pt=$('#pt'),busy=false;
function parse(){if(PRODUCT){var h=location.hash.replace(/^#\/?/,'');return {id:PRODUCT,sub:h||undefined}}var parts=(location.hash.replace('#/','')||'home').split('/'),id=parts[0];if(!document.getElementById('p-'+id))id='home';return {id:id,sub:parts[1]}}
function render(first){
  var r=parse(),pg=document.getElementById('p-'+r.id);
  menu.classList.remove('open');burger.setAttribute('aria-expanded','false');
  if(r.id===curId){var tg0=r.sub&&document.getElementById(r.sub);if(tg0)scrollToEl(tg0);else if(!r.sub)scrollToY(0);return Promise.resolve()}
  curId=r.id;
  pages.forEach(function(p){p.classList.toggle('on',p===pg)});
  links.forEach(function(a){a.classList.toggle('on',a.dataset.r===r.id)});
  document.title=pg.dataset.title||'Brightyard';
  toTop();hdr.classList.remove('hide');
  return enter(pg).then(function(){
    onScroll();tone();
    var tg=r.sub&&document.getElementById(r.sub);
    if(tg)setTimeout(function(){if(ST)ST.refresh();if(lenis)lenis.resize();scrollToEl(tg,true);setTimeout(function(){if(Math.abs(tg.getBoundingClientRect().top-84)>40){if(lenis)lenis.resize();scrollToEl(tg,true)}},350)},first?500:120);
    if(!first){var h=$('h1',pg);if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}
  });
}
function go(){
  var r=parse();
  if(!anim||r.id===curId||busy){render();return}
  busy=true;
  var a=pt.children[0],b=pt.children[1];
  G.timeline({onComplete:function(){busy=false}})
    .set([a,b],{yPercent:101,y:0})
    .to(a,{yPercent:0,duration:.5,ease:'power3.inOut'})
    .to(b,{yPercent:0,duration:.5,ease:'power3.inOut'},'-=.38')
    .add(function(){render()})
    .to([a,b],{yPercent:-101,duration:.7,ease:'power3.inOut',stagger:.06},'+=.12');
}
/* product subdomains: switched on in SITE.productSites once they are live */
var PS=(window.SITE&&SITE.productSites)||{},PMAP={
  allocivo:{'al-problem':'how-it-works/#al-problem','al-how':'how-it-works/#al-how','al-uses':'how-it-works/#al-uses','al-systems':'integrations/','al-demo':'demo/','al-value':'#al-value','al-calc':'#al-calc'},
  xessly:{'xs-problem':'#xs-problem','xs-routes':'#xs-routes','xs-who':'#xs-routes','xs-how':'agent-flow/','xs-where':'where-fixes-land/','xs-faq':'early-access/#xs-faq','xs-access':'early-access/'}};
function prodUrl(id,sub){var b=PS[id];if(!b)return null;var m=(PMAP[id]||{})[sub]||'';return b.replace(/\/?$/,'/')+m}
if(!PRODUCT){
  $$('a[href^="#/allocivo"],a[href^="#/xessly"]').forEach(function(a){var p=a.getAttribute('href').replace('#/','').split('/'),u=prodUrl(p[0],p[1]);if(u){a.href=u;a.removeAttribute('data-r')}});
  var leave=function(){var p=location.hash.replace('#/','').split('/'),u=prodUrl(p[0],p[1]);if(u){location.replace(u);return true}return false};
  if(leave())return;
  window.addEventListener('hashchange',leave);
}
window.addEventListener('hashchange',go);
burger.addEventListener('click',function(){var o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
var rsz;window.addEventListener('resize',function(){clearTimeout(rsz);rsz=setTimeout(function(){tone()},200)});

/* ---------- preloader then first render ---------- */
var pre=$('#pre');
function boot(){render(true)}
var preSeen=(function(){try{var v=sessionStorage.getItem('by-pre');sessionStorage.setItem('by-pre','1');return !!v}catch(e){return false}})();
var deep=/^#\/(plan|home\/)|^#\/(?!home)[a-z]/.test(location.hash);
if(anim&&pre&&!preSeen&&!deep){
  var dots=$$('.pre-g i',pre),num=$('#pre-n'),o={v:0};
  G.timeline()
    .to(dots,{scale:1,duration:.45,ease:'back.out(2.4)',stagger:{each:.05,from:'random'}})
    .to(o,{v:100,duration:.9,ease:'power2.inOut',onUpdate:function(){num.textContent=('00'+Math.round(o.v)).slice(-3)}},0)
    .to('.pre-g',{scale:1.12,duration:.25,ease:'power2.out'},'-=.1')
    .add(boot)
    .to('.pre-in',{autoAlpha:0,scale:.9,duration:.35,ease:'power2.in'})
    .to(pre,{yPercent:-100,duration:.8,ease:'power4.inOut'},'-=.1')
    .set(pre,{display:'none'});
}else{if(pre)pre.style.display='none';boot()}

/* ---------- hero audience copy ---------- */
var seg={
  all:['Brightyard designs, builds and runs software that turns data, signals and requests into the next right action. We do it for our clients, and in our own products.','Talk to an engineer'],
  startup:['Get to a first release your users can rely on. A senior team that designs, builds and ships with you, then stays for what comes next.','Plan your first release'],
  enterprise:['Modernise the systems you can\'t switch off. Replacement in safe slices, clear governance and a team on call after go-live.','Book an architecture review'],
  public:['Digital services that work for every citizen, including people using a screen reader or a five-year-old phone. Secure, accessible and built to be handed over.','Talk to our team']
};
$$('.sg').forEach(function(b){b.setAttribute('aria-pressed',b.classList.contains('on'));b.addEventListener('click',function(){
  $$('.sg').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});
  var p=$('#seg-p'),t=$('#seg-b span'),c=seg[b.dataset.s];
  if(anim){G.to(p,{autoAlpha:0,y:8,duration:.2,ease:'power1.in',overwrite:true,onComplete:function(){p.textContent=c[0];G.to(p,{autoAlpha:1,y:0,duration:.45,ease:'power3.out'})}})}else p.textContent=c[0];
  t.classList.add('sw');setTimeout(function(){t.textContent=c[1];t.classList.remove('sw')},220);
})});

/* ---------- typing code demo ---------- */
(function(){
  var el=$('#code');if(!el)return;
  var txt='const release = await brightyard.ship({\n  stack: "yours",\n  cadence: "every 2 weeks",\n  owner: "you"\n});',i=0,vis=false;
  if(reduced){el.textContent=txt;return}
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(el);
  setInterval(function(){if(!vis)return;i=i>txt.length+26?0:i+1;el.textContent=txt.slice(0,Math.min(i,txt.length))},55);
})();

/* ---------- spotlight, tilt, magnetic ---------- */
document.addEventListener('pointermove',function(e){
  var t=e.target;if(!t.closest)return;
  var c=t.closest('.card');
  if(c){
    var r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');
    if(c.classList.contains('tilt')&&!reduced&&fine){
      var px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      c.style.transform='perspective(900px) rotateX('+(-py*7)+'deg) rotateY('+(px*9)+'deg) translateY(-4px)';
    }
  }
  var m=t.closest('.mag');
  if(m&&!reduced&&fine){
    var b=m.getBoundingClientRect();
    m.style.transform='translate('+((e.clientX-b.left-b.width/2)*.22)+'px,'+((e.clientY-b.top-b.height/2)*.3)+'px)';
  }
});
document.addEventListener('pointerout',function(e){
  var t=e.target;if(!t.closest)return;
  var c=t.closest('.tilt');if(c&&!c.contains(e.relatedTarget))c.style.transform='';
  var m=t.closest('.mag');if(m&&!m.contains(e.relatedTarget))m.style.transform='';
});

/* ---------- case filters ---------- */
var fl=$('#filters');
if(fl)fl.addEventListener('click',function(e){
  var b=e.target.closest('.fb');if(!b)return;
  $$('.fb',fl).forEach(function(x){x.classList.toggle('on',x===b)});
  $$('#p-work .case').forEach(function(c){c.classList.toggle('hide',b.dataset.f!=='all'&&c.dataset.c!==b.dataset.f)});
});

/* ---------- preset-answer assistant ---------- */
var ans={
  services:'We build products, run cloud platforms, ship data and AI work, make websites accessible, and support systems after launch.',
  products:'Our own products. Allocivo helps hotel teams decide who should do which task next. Xessly helps teams find, fix and verify website accessibility issues.',
  start:'Most projects start within two to three weeks of the first call, after a short discovery workshop.',
  price:'Fixed price for well-defined work, a monthly team for ongoing delivery, or a fixed-price review if you want to start small. We agree the model before any work begins.',
  book:'Happy to. <a href="#/contact" style="color:var(--ind);font-weight:500">Open the contact form</a> and a senior engineer will reply within one business day.'
};
var astb=$('#astb'),astp=$('#astp');
if(!astb)return;
function toggleA(o){astp.classList.toggle('open',o);astb.setAttribute('aria-expanded',o);if(o)$('#astx').focus();else astb.focus()}
astb.addEventListener('click',function(){toggleA(!astp.classList.contains('open'))});
$('#astx').addEventListener('click',function(){toggleA(false)});
astp.addEventListener('keydown',function(e){if(e.key==='Escape')toggleA(false)});
$('#qr').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  var ms=$('#msgs'),u=document.createElement('div');u.className='m u';u.textContent=b.textContent;ms.appendChild(u);
  setTimeout(function(){var a=document.createElement('div');a.className='m b';a.innerHTML=ans[b.dataset.q];ms.appendChild(a);ms.scrollTop=ms.scrollHeight},550);
  ms.scrollTop=ms.scrollHeight;
});
})();
