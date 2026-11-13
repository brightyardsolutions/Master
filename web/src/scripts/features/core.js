// Core of every page: smooth scroll (Lenis), headings split into words, the 3D stages, header tone and hiding,
// scroll animations (reveals, staggers, parallax, the horizontal services gallery, pinned product stories, the hero),
// and the page start: curtain, preloader and scrolling to the section in the address.
import Lenis from 'lenis';
import { $, $$, reduced, fine } from '../lib/dom.js';
import { G, ST, anim } from '../lib/motion.js';
import { setLenis, scrollToEl, scrollToY } from '../lib/scroll.js';
import { loadScenes } from '../lib/scenes.js';
import { hashTarget } from '../lib/site.js';
import { navigate, arrived, uncover } from '../lib/nav.js';

export default function init() {
var root=document.documentElement,PRODUCT=root.dataset.product||'';
root.classList.remove('anim');root.classList.add(anim?'anim':'noanim');
$('#yr').textContent=new Date().getFullYear();

/* ---------- smooth scroll ---------- */
var lenis=null;
if(anim&&fine){
  lenis=new Lenis({lerp:.1,smoothWheel:true});
  lenis.on('scroll',ST.update);
  G.ticker.add(function(t){lenis.raf(t*1000)});G.ticker.lagSmoothing(0);
}
setLenis(lenis);

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
var scenes={};
function makeScene(key,cls,canvas,S){
  if(scenes[key])return scenes[key];
  try{scenes[key]=new S[cls](canvas)}catch(e){scenes[key]=null}
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
  var scene=S?makeScene(key,key==='al'?'Allocivo':'Xessly',$('canvas',sec),S):null;
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
    var sc=makeScene('hero','Hero',$('#hero-c'),S);
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

/* ---------- page start ----------
   Each page is its own address. A link to another brightyard.in page closes the curtain and loads it (lib/nav.js);
   the new page starts behind the curtain and opens it once its animations are ready. Links within the page scroll
   smoothly, as before. Old #/ addresses are forwarded before this runs (HashForward.astro on the home page). */
var pg=$('section.page.on'),id=pg?pg.id.slice(2):'',menu=$('#menu'),burger=$('#burger'),came=arrived();
$$('a[data-r]').forEach(function(a){a.classList.toggle('on',a.dataset.r===id)});
function target(){var t=hashTarget();return t?document.getElementById(t):null}
function render(first){
  menu.classList.remove('open');burger.setAttribute('aria-expanded','false');
  hdr.classList.remove('hide');
  return enter(pg).then(function(){
    onScroll();tone();
    var tg=target();
    if(tg)setTimeout(function(){if(ST)ST.refresh();if(lenis)lenis.resize();scrollToEl(tg,true);setTimeout(function(){if(Math.abs(tg.getBoundingClientRect().top-84)>40){if(lenis)lenis.resize();scrollToEl(tg,true)}},350)},first?500:120);
    if(!first){var h=$('h1',pg);if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}
  });
}
/* same page, another section (or back and forward between them) */
function sameAnchor(){menu.classList.remove('open');burger.setAttribute('aria-expanded','false');var tg=target();if(tg)scrollToEl(tg);else if(!hashTarget())scrollToY(0)}
window.addEventListener('hashchange',sameAnchor);
if(!PRODUCT)document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(a.target&&a.target!=='_self')||a.hasAttribute('download'))return;
  var u=new URL(a.href,location.href);
  if(u.origin!==location.origin)return;
  e.preventDefault();
  if(u.pathname===location.pathname&&u.search===location.search){
    if(u.hash===location.hash)return;
    history.pushState(null,'',u.hash||u.pathname+u.search);sameAnchor();return;
  }
  navigate(u.href);
});
burger.addEventListener('click',function(){var o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
var rsz;window.addEventListener('resize',function(){clearTimeout(rsz);rsz=setTimeout(function(){tone()},200)});

/* ---------- preloader (first visit of a session, landing on the home page) then first render ---------- */
var pre=$('#pre');
function boot(){render(!came);uncover()}
var preSeen=(function(){try{var v=sessionStorage.getItem('by-pre');sessionStorage.setItem('by-pre','1');return !!v}catch(e){return false}})();
var deep=id!=='home'||/^#./.test(location.hash);
if(anim&&pre&&!preSeen&&!deep&&!came){
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
}
