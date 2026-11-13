// Mega menu: glass panels with hover intent, a notch that follows the open item, Escape and click-away to close,
// and the parent menu marked on child pages.
import { $, $$, reduced } from '../lib/dom.js';
import { pageId } from '../lib/site.js';

export default function init() {
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
  var id=pageId();
  $$('.mmb').forEach(function(b){b.classList.toggle('on',PARENT[id]===b.dataset.r)});
  closeAll();
}
markNav();
}
