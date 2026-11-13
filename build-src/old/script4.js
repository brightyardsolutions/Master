(function(){
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
$('#yr').textContent=new Date().getFullYear();

/* smooth scroll */
var lenis=null;
if(window.Lenis&&!reduced&&fine){
  lenis=new Lenis({duration:1.1,smoothWheel:true});
  (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0);
}
function toTop(){lenis?lenis.scrollTo(0,{immediate:true}):window.scrollTo({top:0,behavior:'instant'})}

/* split text into masked words */
function split(el){
  var n=0;
  (function walk(node){
    $$.call(null,'x');
    [].slice.call(node.childNodes).forEach(function(c){
      if(c.nodeType===3){
        var f=document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(' '));return}
          var w=document.createElement('span');w.className='w';
          var i=document.createElement('span');i.textContent=p;i.style.transitionDelay=(n++*55)+'ms';
          w.appendChild(i);f.appendChild(w);
        });
        c.parentNode.replaceChild(f,c);
      }else if(c.nodeType===1){walk(c)}
    });
  })(el);
}
$$('.split').forEach(split);

/* reveals and counters */
function count(el){
  var t=+el.dataset.n,s=el.dataset.s||'',st=null;
  (function f(ts){if(!st)st=ts;var p=Math.min((ts-st)/1500,1);el.textContent=Math.round(t*(1-Math.pow(1-p,3)))+s;if(p<1)requestAnimationFrame(f)})(performance.now());
}
var io=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(!e.isIntersecting)return;
    var el=e.target;
    if(el.classList.contains('cnt'))count(el);else el.classList.add('in');
    io.unobserve(el);
  });
},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
function arm(pg){
  $$('.rv,.cnt,.split',pg).forEach(function(el){
    el.classList.remove('in');
    if(el.classList.contains('cnt'))el.textContent='0'+(el.dataset.s||'');
    io.observe(el);
  });
}

/* sticky story */
var sio=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(!e.isIntersecting)return;
    var s=e.target.dataset.s;
    $$('.sstep').forEach(function(x){x.classList.toggle('on',x.dataset.s===s)});
    $$('.vs').forEach(function(x){x.classList.toggle('on',x.dataset.s===s)});
  });
},{rootMargin:'-45% 0px -45% 0px'});
$$('.sstep').forEach(function(s){sio.observe(s)});

/* router with view transitions */
var pages=$$('.page'),links=$$('[data-r]'),menu=$('#menu'),burger=$('#burger');
function render(){
  var parts=(location.hash.replace('#/','')||'home').split('/'),id=parts[0],sub=parts[1];
  if(!document.getElementById('p-'+id))id='home';
  pages.forEach(function(p){p.classList.toggle('on',p.id==='p-'+id)});
  links.forEach(function(a){a.classList.toggle('on',a.dataset.r===id)});
  var pg=document.getElementById('p-'+id);
  document.title=pg.dataset.title||'Brightyard';
  toTop();arm(pg);
  if(sub){var tg=document.getElementById(sub);if(tg)setTimeout(function(){lenis?lenis.scrollTo(tg,{offset:-90}):tg.scrollIntoView()},80)}
  menu.classList.remove('open');burger.setAttribute('aria-expanded','false');
}
function go(){
  if(document.startViewTransition&&!reduced){document.startViewTransition(render)}else render();
}
window.addEventListener('hashchange',go);
render();
burger.addEventListener('click',function(){var o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)});

/* header, progress */
var hdr=$('#hdr'),prog=$('#prog'),tick=false;
function onScroll(){
  if(tick)return;tick=true;
  requestAnimationFrame(function(){
    var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
    hdr.classList.toggle('sc',y>10);
    prog.style.transform='scaleX('+(h>0?y/h:0)+')';
    tick=false;
  });
}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

/* hero segment copy */
var seg={
  all:['Brightyard designs, builds and runs software that turns data, signals and requests into the next right action. We do it for our clients, and in our own products.','Talk to an engineer'],
  startup:['Get to a first release your users can rely on. A senior team that designs, builds and ships with you, then stays for what comes next.','Plan your first release'],
  enterprise:['Modernise the systems you can\'t switch off. Replacement in safe slices, clear governance and a team on call after go-live.','Book an architecture review'],
  public:['Digital services that work for every citizen, including people using a screen reader or a five-year-old phone. Secure, accessible and built to be handed over.','Talk to our team']
};
$$('.sg').forEach(function(b){b.addEventListener('click',function(){
  $$('.sg').forEach(function(x){x.classList.toggle('on',x===b)});
  var p=$('#seg-p'),t=$('#seg-b span');
  p.classList.add('sw');t.classList.add('sw');
  setTimeout(function(){p.textContent=seg[b.dataset.s][0];t.textContent=seg[b.dataset.s][1];p.classList.remove('sw');t.classList.remove('sw')},220);
})});

/* hero dot grid */
(function(){
  var c=$('#dots'),hero=$('#hero'),x=c.getContext('2d'),W=0,H=0,D=Math.min(devicePixelRatio||1,2),mx=-999,my=-999,run=true,t=0,S=38;
  function size(){var r=hero.getBoundingClientRect();W=r.width;H=r.height;c.width=W*D;c.height=H*D;x.setTransform(D,0,0,D,0,0)}
  function draw(){
    x.clearRect(0,0,W,H);
    for(var i=0;i<W/S+1;i++){for(var j=0;j<H/S+1;j++){
      var px=i*S+S/2,py=j*S+S/2,d=Math.hypot(px-mx,py-my),k=Math.max(0,1-d/170);
      var w=Math.sin((px+py)*.011+t)*.5+.5,r=1.5+w*1.3+k*7;
      x.fillStyle=k>.62?'#C6F432':'rgba(79,70,229,'+(k>0?.25+k*.7:.1+w*.12)+')';
      x.beginPath();x.arc(px,py,r,0,6.2832);x.fill();
      if(k>.62){x.strokeStyle='#4F46E5';x.lineWidth=1.5;x.stroke()}
    }}
  }
  function loop(){if(run&&$('#p-home').classList.contains('on')){t+=.018;draw()}requestAnimationFrame(loop)}
  size();draw();
  window.addEventListener('resize',size);
  if(!reduced){
    hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
    hero.addEventListener('pointerleave',function(){mx=my=-999});
    new IntersectionObserver(function(e){run=e[0].isIntersecting}).observe(hero);
    loop();
  }
})();

/* sparkline */
(function(){
  var v=[],el=$('#spark');if(!el)return;
  for(var i=0;i<28;i++)v.push(.55+Math.random()*.3);
  function paint(){el.setAttribute('points',v.map(function(a,i){return (i*(240/27)).toFixed(1)+','+(52-a*46).toFixed(1)}).join(' '))}
  paint();
  if(!reduced)setInterval(function(){v.shift();v.push(.55+Math.random()*.38);paint()},1100);
})();

/* typing code demo */
(function(){
  var el=$('#code'),txt='const release = await brightyard.ship({\n  stack: "yours",\n  cadence: "every 2 weeks",\n  owner: "you"\n});',i=0,vis=false;
  if(reduced){el.textContent=txt;return}
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(el);
  setInterval(function(){if(!vis)return;i=i>txt.length+26?0:i+1;el.textContent=txt.slice(0,Math.min(i,txt.length))},55);
})();

/* spotlight, tilt, magnetic, cursor */
var cur=$('#cur'),cx=0,cy=0,tx=0,ty=0;
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
  if(fine&&!reduced){
    tx=e.clientX;ty=e.clientY;cur.style.opacity=1;
    cur.classList.toggle('big',!!t.closest('a,button,.card,summary,input,select,textarea'));
  }
});
document.addEventListener('pointerout',function(e){
  var t=e.target;if(!t.closest)return;
  var c=t.closest('.tilt');if(c&&!c.contains(e.relatedTarget))c.style.transform='';
  var m=t.closest('.mag');if(m&&!m.contains(e.relatedTarget))m.style.transform='';
});


/* case filters */
var fl=$('#filters');
fl.addEventListener('click',function(e){
  var b=e.target.closest('.fb');if(!b)return;
  $$('.fb',fl).forEach(function(x){x.classList.toggle('on',x===b)});
  $$('#p-work .case').forEach(function(c){c.classList.toggle('hide',b.dataset.f!=='all'&&c.dataset.c!==b.dataset.f);c.classList.add('in')});
});

/* demo assistant (preset answers, swap for a real AI endpoint later) */
var ans={
  services:'We build products, run cloud platforms, ship data and AI work, make websites accessible, and support systems after launch.',
  products:'Our own products. Allocivo helps hotel teams decide who should do which task next. Xessly helps teams find, fix and verify website accessibility issues.',
  start:'Most projects start within two to three weeks of the first call, after a short discovery workshop.',
  price:'Fixed price for well-defined work, a monthly team for ongoing delivery, or a fixed-price review if you want to start small. We agree the model before any work begins.',
  book:'Happy to. <a href="#/contact" style="color:var(--ind);font-weight:500">Open the contact form</a> and a senior engineer will reply within one business day.'
};
var astb=$('#astb'),astp=$('#astp');
function toggleA(o){astp.classList.toggle('open',o);astb.setAttribute('aria-expanded',o)}
astb.addEventListener('click',function(){toggleA(!astp.classList.contains('open'))});
$('#astx').addEventListener('click',function(){toggleA(false)});
$('#qr').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  var ms=$('#msgs'),u=document.createElement('div');u.className='m u';u.textContent=b.textContent;ms.appendChild(u);
  setTimeout(function(){var a=document.createElement('div');a.className='m b';a.innerHTML=ans[b.dataset.q];ms.appendChild(a);ms.scrollTop=ms.scrollHeight},550);
  ms.scrollTop=ms.scrollHeight;
});
})();
