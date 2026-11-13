// Product site live demos: the Allocivo board, the Xessly agent run and the Allocivo value calculator.
import { $, $$, reduced } from '../lib/dom.js';

export default function init() {
function active(el){return !!el.closest('.page.on')&&!document.hidden}
function looper(el,steps,ms,apply,reset){
  var i=0,vis=false;
  new IntersectionObserver(function(e){vis=e[0].isIntersecting},{threshold:.25}).observe(el);
  if(reduced){reset();steps.forEach(function(s,k){apply(s,k,true)});return}
  reset();
  setInterval(function(){
    if(!vis||!active(el))return;
    if(i>=steps.length){i=0;reset();return}
    apply(steps[i],i,false);i++;
  },ms);
}

/* ---------- Allocivo live board ---------- */
var al=$('[data-live="al"]');
if(al){
  var ROOMS=[401,402,403,404,405,406,407,408,409,410,412,418];
  var BASE={401:['ready',''],402:['ready',''],403:['clean','M'],404:['ready',''],405:['dirty',''],406:['ready',''],407:['insp','M'],408:['ready',''],409:['clean','M'],410:['ready',''],412:['ready',''],418:['ready','']};
  var grid=$('.rooms',al),ev=$('.lv-ev',al),dec=$('.lv-dec',al),ags=$$('.ag',al);
  grid.innerHTML=ROOMS.map(function(r){return '<div class="rm" data-r="'+r+'"><b>'+r+'</b><span></span></div>'}).join('');
  function setRoom(r,s,flash){var el=$('[data-r="'+r+'"]',grid);el.className='rm s-'+s[0]+(flash?' flash':'');el.querySelector('span').textContent=s[1]==='!'?'Priority':s[1]==='A'?'Asha':s[1]==='D'?'Daniel':s[1]==='M'?'Mei':'';if(flash)setTimeout(function(){el.classList.remove('flash')},900)}
  var S=[
    {t:'11:58',e:'Checkout: Room 418',a:'observe',r:{418:['dirty','']},d:'New work: clean Room 418 by 14:00.'},
    {t:'12:02',e:'Early arrival booked: Room 412',a:'prioritise',r:{412:['dirty','!']},d:'Room 412 jumps the queue. Guest arrives 12:30.'},
    {t:'12:03',e:'Two rooms need people',a:'assign',r:{412:['clean','A'],418:['dirty','D']},d:'412 to Asha (free, on floor 4). 418 to Daniel.'},
    {t:'12:28',e:'Room 412 cleaned and passed',a:'watch',r:{412:['ready','']},d:'412 ready two minutes before the guest.'},
    {t:'12:40',e:'Attendance: Daniel delayed 25 min',a:'watch',r:{418:['risk','D']},d:'Room 418 is at risk of missing 14:00.'},
    {t:'12:41',e:'Replanning Room 418',a:'assign',r:{418:['clean','A']},d:'418 moved to Asha automatically. Supervisor notified.'},
    {t:'13:10',e:'Maintenance ticket: Room 406',a:'prioritise',r:{406:['block','']},d:'406 held for maintenance. No wasted housekeeping trip.'},
    {t:'13:30',e:'Room 418 cleaned',a:'observe',r:{418:['insp','M']},d:'Inspection requested. Mei is nearest.'},
    {t:'13:44',e:'Inspection passed: Room 418',a:'watch',r:{418:['ready','']},d:'418 ready 16 minutes before target. Front desk updated.'}
  ];
  looper(al,S,2300,function(s,k,quiet){
    ags.forEach(function(a){a.classList.toggle('on',a.dataset.a===s.a)});
    Object.keys(s.r).forEach(function(r){setRoom(r,s.r[r],!quiet)});
    var li=document.createElement('li');li.innerHTML='<time>'+s.t+'</time><span>'+s.e+'</span>';ev.insertBefore(li,ev.firstChild);
    while(ev.children.length>6)ev.removeChild(ev.lastChild);
    dec.textContent=s.d;
  },function(){ROOMS.forEach(function(r){setRoom(r,BASE[r])});ev.innerHTML='';dec.textContent='Waiting for the next event…';ags.forEach(function(a){a.classList.remove('on')})});
}

/* ---------- Xessly agent run ---------- */
var xs=$('[data-live="xs"]');
if(xs){
  var out=$('.xo',xs),oh=$('[data-out-h]',xs),pins=$$('.pin',xs),ag2=$$('.ag',xs),C={};
  $$('[data-c]',xs).forEach(function(b){C[b.dataset.c]=b});
  function count(k,to){var b=C[k],from=+b.textContent||0,st=null;if(reduced){b.textContent=to;return}(function f(ts){if(!st)st=ts;var p=Math.min((ts-st)/700,1);b.textContent=Math.round(from+(to-from)*p);if(p<1)requestAnimationFrame(f)})(performance.now())}
  var X=[
    {a:'scan',h:'Scanning',f:function(){pins.forEach(function(p,k){setTimeout(function(){p.className='pin on'},reduced?0:k*280)});count('found',31);
      out.innerHTML='<div class="row"><i>&#8635;</i><span>48 pages crawled</span><em>desktop + mobile</em></div><div class="row"><i>&#8635;</i><span>Menus, errors, filled forms</span><em>states</em></div><div class="row"><i>!</i><span>126 raw findings</span><em>31 unique</em></div>'}},
    {a:'triage',h:'Triage: mapped to WCAG 2.2',f:function(){
      out.innerHTML='<div class="row"><i>1</i><span>Nav links: low contrast</span><em>1.4.3 &times;12</em></div><div class="row"><i>2</i><span>Hero image: no alt text</span><em>1.1.1 &times;18</em></div><div class="row"><i>3</i><span>Email field: no label</span><em>1.3.1 &times;6</em></div><div class="row"><i>4</i><span>Icon button: no name</span><em>4.1.2 &times;3</em></div>'}},
    {a:'fix',h:'Fixing: pull request + CMS',f:function(){pins.forEach(function(p){p.className='pin on fixing'});xs.classList.add('fixed');count('fixed',29);
      out.innerHTML='<pre class="diff lt"><span class="m">- &lt;input placeholder="Email"&gt;</span>\n<span class="p">+ &lt;label for="email"&gt;Email&lt;/label&gt;</span>\n<span class="p">+ &lt;input id="email" type="email"&gt;</span></pre><div class="row ck"><i>&#10003;</i><span>PR #42 opened</span><em>code</em></div><div class="row ck"><i>&#10003;</i><span>Alt text for 18 images</span><em>CMS</em></div>'}},
    {a:'test',h:'Testing every change',f:function(){
      out.innerHTML=['Accessible names present','Contrast passes 4.5:1','Keyboard order unchanged','No new violations','Rollback ready'].map(function(t){return '<div class="row ck"><i>&#10003;</i><span>'+t+'</span><em>pass</em></div>'}).join('')}},
    {a:'verify',h:'Verified',f:function(){pins.forEach(function(p,k){p.className='pin on '+(k===1?'flag':'ok')});count('ver',29);count('flag',2);
      out.innerHTML='<div class="big2">29 verified</div><div class="row ck"><i>&#10003;</i><span>Contrast, labels, names fixed</span><em>closed</em></div><div class="row fl"><i>?</i><span>Hero image: decorative or informative?</span><em>draft ready</em></div><div class="row fl"><i>?</i><span>Promo video captions</span><em>draft ready</em></div>'}}
  ];
  looper(xs,X,2700,function(s){ag2.forEach(function(a){a.classList.toggle('on',a.dataset.a===s.a)});oh.textContent=s.h;s.f()},
    function(){pins.forEach(function(p){p.className='pin'});xs.classList.remove('fixed');Object.keys(C).forEach(function(k){C[k].textContent='0'});out.innerHTML='<div class="row"><i>&#8635;</i><span>Starting a run on northstar-store.example</span><em></em></div>';oh.textContent='Output';ag2.forEach(function(a){a.classList.remove('on')})});
}

/* ---------- Allocivo value calculator ---------- */
var calc=$('#al-calc');
if(calc){
  function v(k){var el=$('[data-k="'+k+'"]',calc);return el.tagName==='SELECT'?el.value:Math.max(0,parseFloat(el.value)||0)}
  function run(){
    var cur=v('cur'),share=v('share')/100,loc=cur==='₹'?'en-IN':'en-US';
    var fmt=function(n){return cur+Math.round(n).toLocaleString(loc)};
    var hours=v('shifts')*365*v('mins')/60*share,coord=hours*v('sup'),ot=v('ot')*share,rw=v('rw')*12*v('staff')*share,tot=coord+ot+rw,mx=Math.max(coord,ot,rw,1);
    $('[data-o="shifts"]',calc).textContent=v('shifts');$('[data-o="mins"]',calc).textContent=v('mins');$('[data-o="rw"]',calc).textContent=v('rw');$('[data-o="share"]',calc).textContent=v('share')+'%';
    $('[data-r="total"]',calc).textContent=fmt(tot);
    $('[data-r="coord"]',calc).textContent=fmt(coord);$('[data-r="ot"]',calc).textContent=fmt(ot);$('[data-r="rw"]',calc).textContent=fmt(rw);
    $('[data-r="hours"]',calc).textContent=Math.round(hours).toLocaleString(loc)+' supervisor hours a year';
    $('[data-b="coord"]',calc).style.width=(coord/mx*100)+'%';$('[data-b="ot"]',calc).style.width=(ot/mx*100)+'%';$('[data-b="rw"]',calc).style.width=(rw/mx*100)+'%';
  }
  calc.addEventListener('input',run);calc.addEventListener('change',run);run();
}
}
