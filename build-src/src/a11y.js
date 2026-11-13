/* ---------- keyboard: keep focus inside the yard menu; phone menu opens into its links and closes with Escape ---------- */
(function(){
var FOC='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function visible(e){return !!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&getComputedStyle(e).visibility!=='hidden'}
function trap(box,e){
  var f=[].filter.call(box.querySelectorAll(FOC),visible);if(!f.length)return;
  var first=f[0],last=f[f.length-1],a=document.activeElement;
  if(!box.contains(a)){e.preventDefault();first.focus();return}
  if(e.shiftKey&&a===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&a===last){e.preventDefault();first.focus()}
}
var gl=document.getElementById('gl');
document.addEventListener('keydown',function(e){if(e.key==='Tab'&&gl&&gl.classList.contains('open'))trap(gl,e)});
var menu=document.getElementById('menu'),burger=document.getElementById('burger');
if(menu&&burger){
  var phone=matchMedia('(max-width:940px)');
  burger.addEventListener('click',function(){if(phone.matches&&menu.classList.contains('open'))setTimeout(function(){var f=[].filter.call(menu.querySelectorAll(FOC),visible)[0];if(f)f.focus()},60)});
  function close(){menu.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.focus()}
  document.addEventListener('keydown',function(e){if(!phone.matches||!menu.classList.contains('open'))return;if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='Tab')trap(menu.parentNode.contains(burger)?menu.parentNode:menu,e)});
}

/* required fields: marked visibly and for screen readers */
[].forEach.call(document.querySelectorAll('form'),function(f){
  var req=[].slice.call(f.querySelectorAll('[data-req]'));
  if(f.id==='cf')['goal','name','email'].forEach(function(id){var e=document.getElementById(id);if(e)req.push(e)});
  req=req.filter(function(e){return e.type!=='checkbox'});
  if(!req.length)return;
  req.forEach(function(e){e.setAttribute('aria-required','true');var l=e.closest('label');if(l&&!l.querySelector('.req')){var t=l.firstChild;if(t&&t.nodeType===3&&t.textContent.trim()){var w=document.createElement('span');w.className='lt';l.insertBefore(w,t);w.appendChild(t);var r=document.createElement('span');r.className='req';r.setAttribute('aria-hidden','true');r.textContent=' *';w.appendChild(r)}}});
  var n=document.createElement('p');n.className='reqn';n.innerHTML='Fields marked <span aria-hidden="true">*</span><span class="sr">with a star</span> are required.';
  var first=f.querySelector('label:not(.hp),.row2');if(first)f.insertBefore(n,first);
});
/* phone menu button says what it will do */
if(menu&&burger){
  var sync=function(){var o=menu.classList.contains('open');burger.textContent=o?'✕':'☰';burger.setAttribute('aria-label',o?'Close menu':'Open menu')};
  new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});sync();
}
/* single-key shortcuts (G, B and 1-9) can be switched off */
var glk=document.getElementById('glk');
if(glk){
  var keysOn=function(){try{return localStorage.getItem('by-keys')!=='off'}catch(e){return true}};
  var show=function(){var on=keysOn();glk.setAttribute('aria-pressed',on);glk.textContent='Single-key shortcuts: '+(on?'on':'off')};
  glk.addEventListener('click',function(){try{localStorage.setItem('by-keys',keysOn()?'off':'on')}catch(e){}show()});show();
}

/* the assistant button steps aside while the blueprint result or the footer is on screen */
var astb=document.getElementById('astb');
if(astb&&'IntersectionObserver' in window){
  astb.setAttribute('aria-label','Ask Brightyard');
  var seen=new Set();
  var small=matchMedia('(max-width:767px)');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)seen.add(e.target);else seen.delete(e.target)});var away=false;seen.forEach(function(t){if(t.tagName==='FOOTER'||small.matches)away=true});document.body.classList.toggle('ast-away',away)},{threshold:.25});
  var watch=function(){var b=document.getElementById('bpplan');if(b)io.observe(b);var f=document.querySelector('footer');if(f)io.observe(f)};
  watch();setTimeout(watch,3000);
}
})();
