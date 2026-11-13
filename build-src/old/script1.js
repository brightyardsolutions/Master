(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function esc(s){return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}

/* ---------- mega menu ---------- */
var mms=$$('.mm'),hdr=$('#hdr'),closeT;
function closeAll(keep){
  mms.forEach(function(m){if(m!==keep){m.classList.remove('open');$('.mmb',m).setAttribute('aria-expanded','false')}});
  hdr.classList.toggle('mm-on',!!(keep&&keep.classList.contains('open')));
}
var openedAt=0,openT;
function openM(m,hov){
  if(hov&&!m.classList.contains('open'))openedAt=Date.now();
  var prev=$('.mm.open'),from=null;
  if(prev&&prev!==m&&!reduced){from={g:$('.mmg',prev).getBoundingClientRect(),n:prev.querySelector('.mmb').getBoundingClientRect()}}
  closeAll(m);m.classList.add('open');$('.mmb',m).setAttribute('aria-expanded','true');hdr.classList.add('mm-on');
  notch(m,from);
  if(from){var g=$('.mmg',m),r=g.getBoundingClientRect();hdr.classList.add('mm-swap');clearTimeout(hdr._sw);hdr._sw=setTimeout(function(){hdr.classList.remove('mm-swap')},420);
    if(g.animate)g.animate([{height:from.g.height+'px'},{height:r.height+'px'}],{duration:320,easing:'cubic-bezier(.2,.7,.2,1)'})}
}
/* a small notch on the panel points at the open menu item, and glides between items */
function notch(m,from){
  var p=$('.mmp',m),b=$('.mmb',m);if(!p||innerWidth<=940)return;
  var n=$('.mmn',p);if(!n){n=document.createElement('i');n.className='mmn';n.setAttribute('aria-hidden','true');p.appendChild(n)}
  var pr=p.getBoundingClientRect(),br=b.getBoundingClientRect(),x=br.left+br.width/2-pr.left;
  n.style.left=x+'px';
  if(from&&n.animate)n.animate([{transform:'translateX('+(from.n.left+from.n.width/2-br.left-br.width/2)+'px) rotate(45deg)'},{transform:'translateX(0) rotate(45deg)'}],{duration:320,easing:'cubic-bezier(.2,.7,.2,1)'});
}
mms.forEach(function(m){
  var b=$('.mmb',m);
  b.addEventListener('click',function(){if(m.classList.contains('open')){if(Date.now()-openedAt>450)closeAll()}else openM(m)});
  /* hover intent: a short pause before the first menu opens, so a cursor crossing the header doesn't flash menus;
     once one is open, moving to the next switches straight away */
  m.addEventListener('mouseenter',function(){if(innerWidth>940&&matchMedia('(hover:hover)').matches){clearTimeout(closeT);clearTimeout(openT);
    if($('.mm.open'))openM(m,true);else openT=setTimeout(function(){openM(m,true)},140)}});
  m.addEventListener('mouseleave',function(){if(innerWidth>940&&matchMedia('(hover:hover)').matches){clearTimeout(openT);
    var busy=function(){var f=document.activeElement;return m.contains(f)&&f.tagName==='INPUT'&&f.value.trim()};
    closeT=setTimeout(function(){if(!busy())closeAll()},260)}});
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){var o=$('.mm.open');if(o){closeAll();$('.mmb',o).focus()}}});
document.addEventListener('click',function(e){if(!e.target.closest('.mm'))closeAll()});
$$('.mmp a').forEach(function(a){a.addEventListener('click',function(){closeAll()})});

/* highlight the parent menu for child pages */
var PARENT={allocivo:'products',xessly:'products',products:'products',how:'insights',insights:'insights',services:'services'};
function markNav(){
  var id=(location.hash.replace('#/','')||'home').split('/')[0];
  $$('.mmb').forEach(function(b){b.classList.toggle('on',PARENT[id]===b.dataset.r)});
  closeAll();
}
window.addEventListener('hashchange',function(){setTimeout(markNav,60)});
markNav();

/* ---------- auto-running decks ---------- */
$$('[data-deck]').forEach(function(dk){
  var slides=$$('.sl',dk),n=slides.length,i=0,t=0,DUR=4500,playing=!reduced,vis=false,hold=false,last=0;
  var c=document.createElement('div');c.className='dk-ctrl';
  c.innerHTML='<button class="dk-btn" type="button" data-a="prev" aria-label="Previous slide">&#8249;</button>'+
    '<button class="dk-btn" type="button" data-a="play"></button>'+
    '<button class="dk-btn" type="button" data-a="next" aria-label="Next slide">&#8250;</button>'+
    '<div class="dk-prog">'+slides.map(function(s,k){return '<button type="button" aria-label="Go to slide '+(k+1)+'"><i></i></button>'}).join('')+'</div>'+
    '<span class="dk-n" aria-hidden="true"></span><span class="dk-live" aria-live="polite"></span>';
  dk.appendChild(c);
  var bars=$$('.dk-prog i',c),pb=$('[data-a="play"]',c),num=$('.dk-n',c),live=$('.dk-live',c);
  function setPlay(p){playing=p;pb.innerHTML=p?'&#10073;&#10073;':'&#9654;';pb.setAttribute('aria-label',p?'Pause presentation':'Play presentation')}
  function go(k,manual){
    i=(k+n)%n;t=0;
    slides.forEach(function(s,j){var on=j===i;s.classList.toggle('on',on);s.setAttribute('aria-hidden',!on);s.inert=!on});
    bars.forEach(function(b,j){b.style.setProperty('--p',j<i?1:0)});
    num.textContent=(i+1)+' / '+n;
    if(manual)live.textContent='Slide '+(i+1)+' of '+n+': '+($('h2',slides[i])||{}).textContent;
  }
  c.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.a==='prev')go(i-1,true);
    else if(b.dataset.a==='next')go(i+1,true);
    else if(b.dataset.a==='play')setPlay(!playing);
    else{var k=$$('.dk-prog button',c).indexOf(b);if(k>-1)go(k,true)}
  });
  dk.addEventListener('keydown',function(e){
    if(e.target.closest('input,textarea,select'))return;
    if(e.key==='ArrowRight'){go(i+1,true);e.preventDefault()}
    if(e.key==='ArrowLeft'){go(i-1,true);e.preventDefault()}
  });
  $('.dk-stage',dk).addEventListener('mouseenter',function(){hold=true});
  $('.dk-stage',dk).addEventListener('mouseleave',function(){hold=false});
  dk.addEventListener('focusin',function(e){if(e.target.closest('.dk-stage'))hold=true});
  dk.addEventListener('focusout',function(){hold=false});
  new IntersectionObserver(function(e){vis=e[0].isIntersecting},{threshold:.35}).observe(dk);
  setPlay(playing);go(0);
  (function tick(ts){
    var dt=last?ts-last:0;last=ts;
    if(playing&&vis&&!hold&&!document.hidden&&dk.closest('.page.on')){t+=dt;if(t>=DUR)go(i+1)}
    if(bars[i])bars[i].style.setProperty('--p',Math.min(t/DUR,1));
    requestAnimationFrame(tick);
  })(0);
  window.addEventListener('hashchange',function(){if(dk.closest('.page.on'))go(0)});
});

/* ---------- product forms ---------- */
$$('form.lf').forEach(function(f){
  var note=$('.fnote',f),btn=$('button[type=submit]',f);
  function errFor(el){return el.type==='checkbox'?$('.err[data-for="'+el.name+'"]',f):el.parentNode.querySelector('.err')}
  function say(msg,bad){note.innerHTML=msg;note.classList.add('show');note.classList.toggle('bad',!!bad)}
  f.addEventListener('input',function(e){var er=errFor(e.target);if(er)er.textContent=''});
  f.addEventListener('change',function(e){var er=errFor(e.target);if(er)er.textContent=''});
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var first=null;
    $$('[data-req]',f).forEach(function(el){
      var v=el.type==='checkbox'?el.checked:el.value.trim(),ok=!!v;
      if(ok&&el.type==='email')ok=/^\S+@\S+\.\S+$/.test(el.value.trim());
      var er=errFor(el);if(er)er.textContent=ok?'':el.dataset.req;
      if(!ok&&!first)first=el;
    });
    if(first){first.focus();return}
    if(!SITE.formEndpoint){say('This form isn\'t connected yet, so nothing was sent. Please email us at <b>'+esc(SITE.contactEmail)+'</b> instead.');return}
    var data={};new FormData(f).forEach(function(v,k){data[k]=v});data.kind=f.dataset.kind;data.page=location.href;
    btn.disabled=true;
    fetch(SITE.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
    .then(function(r){if(!r.ok)throw new Error(r.status);
      f.innerHTML='<div class="okm" role="status"><div class="tick">&#10003;</div><h3>Request sent</h3><p style="margin-top:10px;color:var(--mute)">Thanks, '+esc(data.name||'')+'. We\'ll reply within one business day.</p></div>'})
    .catch(function(){btn.disabled=false;say('We couldn\'t send that. Please try again, or email us at <b>'+esc(SITE.contactEmail)+'</b>.',true)});
  });
});
})();
