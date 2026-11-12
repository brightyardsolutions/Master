/* BrightYard site script. Sections: settings and forms, menus, live demos, signature layer, core. */
/* ===== BrightYard site settings: edit these before launch ===== */
window.SITE = {
  mode: 'launch',       // 'draft' shows highlighted placeholders; 'launch' hides every incomplete section
  formEndpoint: '',    // e.g. 'https://formspree.io/f/xxxx' or '/api/contact'. Empty = form not connected yet.
  contactEmail: 'hello@brightyard.in'
};
(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function esc(s){return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}

/* ---------- draft / launch view ---------- */
var body=document.body,bar=$('#draftbar'),mbtn=$('#dmode');
function setMode(m){
  body.classList.toggle('launch',m==='launch');
  mbtn.textContent=m==='launch'?'Back to draft view':'Preview launch view';
  $('#dlabel').innerHTML=m==='launch'?'<b>Launch preview.</b> Sections that still need real data are hidden.':'<b>Draft preview.</b> Highlighted text needs real BrightYard data before launch.';
}
if(SITE.mode==='launch'){body.classList.add('launch');if(bar)bar.remove()}
else if(mbtn){mbtn.addEventListener('click',function(){setMode(body.classList.contains('launch')?'draft':'launch')})}

/* ---------- case study cards (fill these with approved projects) ---------- */
var CASES=[
  {c:'eng',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'cloud',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'data',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'a11y',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'sec',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'eng',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'}
];
function mark(s){return esc(s).replace(/\[[^\]]+\]/g,function(m){return '<span class="tbd">'+m+'</span>'})}
var cg=$('#cases');
if(cg)cg.innerHTML=CASES.map(function(k,i){
  return '<div class="card tilt case rv" data-c="'+k.c+'" style="--d:'+(i%3*80)+'ms"><div><span class="tag">'+mark(k.tag)+'</span><h3>'+mark(k.title)+'</h3><p>'+mark(k.line)+'</p></div><div class="num">'+mark(k.num)+'<small>'+mark(k.unit)+'</small></div><span class="go">&nearr;</span></div>';
}).join('');

/* ---------- product demo UIs (illustrative, deterministic loop) ---------- */
function mount(key,tpl,label){
  $$('[data-ui="'+key+'"]').forEach(function(h){
    var ui=$('#'+tpl).content.firstElementChild.cloneNode(true);
    ui.setAttribute('role','img');ui.setAttribute('aria-label',label);
    h.appendChild(ui);
  });
}
mount('al','tpl-al','Illustrative Allocivo demo: Room 418 is at risk because Daniel is running late. Allocivo recommends moving it to Asha, and the supervisor approves.');
mount('xs','tpl-xs','Illustrative Xessly demo: a sign-in field without a persistent label is flagged, pattern B adds a visible label, and the change is verified.');
$$('.aui,.xui').forEach(function(ui){
  if(reduced){ui.dataset.state=3;return}
  var s=0,vis=false,dur=[1500,1700,2600,3200];
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(ui);
  (function step(){if(vis){s=(s+1)%4;ui.dataset.state=s}setTimeout(step,dur[s])})();
});

/* ---------- contact form: honest about whether it is connected ---------- */
var opt=$('#opt'),optb=$('#optb'),note=$('#fnote'),send=$('#fsend');
optb.addEventListener('click',function(){var o=opt.classList.toggle('open');optb.setAttribute('aria-expanded',o);optb.textContent=o?'- Hide extra details':'+ Add more details (optional)'});
['goal','name','email'].forEach(function(i){$('#'+i).addEventListener('input',function(){$('#e-'+i).textContent=''})});
function say(msg,bad){note.innerHTML=msg;note.classList.add('show');note.classList.toggle('bad',!!bad)}
$('#cf').addEventListener('submit',function(e){
  e.preventDefault();
  var g=$('#goal').value.trim(),n=$('#name').value.trim(),m=$('#email').value.trim(),bad=false,first=null;
  if(!g){$('#e-goal').textContent='Tell us a little about your goal.';bad=true;first=first||$('#goal')}
  if(!n){$('#e-name').textContent='Enter your name.';bad=true;first=first||$('#name')}
  if(!/^\S+@\S+\.\S+$/.test(m)){$('#e-email').textContent='Enter a valid work email.';bad=true;first=first||$('#email')}
  if(bad){first.focus();return}
  if(!SITE.formEndpoint){say('This form isn\'t connected yet, so nothing was sent. Please email us at <b>'+esc(SITE.contactEmail)+'</b> instead.');return}
  send.disabled=true;send.firstChild.textContent='Sending…';
  fetch(SITE.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({goal:g,name:n,email:m,company:$('#co').value.trim(),interest:$('#int').value,industry:$('#ind').value,page:location.href})})
  .then(function(r){if(!r.ok)throw new Error(r.status);
    $('#formcard').innerHTML='<div class="okm" role="status"><div class="tick">&#10003;</div><h3>Message sent</h3><p style="margin-top:10px;color:var(--mute)">Thanks, '+esc(n)+'. A senior engineer will reply within one business day.</p></div>'})
  .catch(function(){send.disabled=false;send.firstChild.textContent='Send message';say('We couldn\'t send that. Please try again, or email us at <b>'+esc(SITE.contactEmail)+'</b>.',true)});
});
})();

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
var openedAt=0;
function openM(m,hov){if(hov&&!m.classList.contains('open'))openedAt=Date.now();closeAll(m);m.classList.add('open');$('.mmb',m).setAttribute('aria-expanded','true');hdr.classList.add('mm-on')}
mms.forEach(function(m){
  var b=$('.mmb',m);
  b.addEventListener('click',function(){if(m.classList.contains('open')){if(Date.now()-openedAt>450)closeAll()}else openM(m)});
  m.addEventListener('mouseenter',function(){if(innerWidth>940&&matchMedia('(hover:hover)').matches){clearTimeout(closeT);openM(m,true)}});
  m.addEventListener('mouseleave',function(){if(innerWidth>940&&matchMedia('(hover:hover)').matches){closeT=setTimeout(function(){closeAll()},200)}});
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

(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
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

/* ---------- hero agent team card ---------- */
var agl=$('#agl');
if(agl){
  var H=[
    [['run','build-agent','Writing checkout cache'],['ok','test-agent','412 tests passed'],['ok','a11y-agent','3 fixes verified']],
    [['ok','build-agent','PR #128 opened'],['run','test-agent','Running 36 new tests'],['ok','a11y-agent','3 fixes verified']],
    [['ok','build-agent','PR #128 opened'],['ok','test-agent','448 tests passed'],['run','a11y-agent','Checking checkout flow']],
    [['ok','build-agent','PR #128 ready'],['ok','test-agent','448 tests passed'],['ok','a11y-agent','0 new issues']]
  ],h=0;
  function paint(){var rows=$$('.agr',agl);H[h].forEach(function(r,k){var el=rows[k];el.querySelector('i').className='sdot '+r[0];el.querySelector('b').textContent=r[1];el.querySelector('span').textContent=r[2];el.classList.toggle('now',r[0]==='run')})}
  if(!reduced)setInterval(function(){if(!active(agl))return;h=(h+1)%H.length;paint()},2200);
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
})();

(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
function typing(t){return !!t&&(/^(input|textarea|select)$/i.test(t.tagName)||t.isContentEditable)}
function nav(id){location.hash='#/'+id}
var hint=$('#bhint'),hintT;
function say(html,ms){hint.innerHTML=html;hint.classList.add('show');clearTimeout(hintT);hintT=setTimeout(function(){hint.classList.remove('show')},ms||5000)}
function seen(){try{sessionStorage.setItem('bys','1')}catch(e){}}
function wasSeen(){try{return !!sessionStorage.getItem('bys')}catch(e){return false}}

/* ---------- 1. Brief to blueprint: Yardie + rules engine (BYEngine + #bp-master) ---------- */
var BPM=null,anim=!reduced&&!!window.gsap;
try{BPM=JSON.parse($('#bp-master').textContent)}catch(e){BPM=null}
function bpesc(s){return String(s==null?'':s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}
function detect(t){return BPM&&window.BYEngine?BYEngine.classify(t,BPM):[]}
window.BrightYardBlueprint={generate:function(t,o){return BYEngine.generate(t,o||{},BPM)},master:BPM,last:null};
var STAGES=[['Understand',['DISC','ASSESS']],['Design',['ARCH','PLAN']],['Build',['DEV','CONF','INTEG','MIGR']],['Prove',['SEC','TEST']],['Launch',['DEPLOY','HAND']],['Run',['MON']]];
var LINES={
  idle:['Checking in with my agents…','All agents online.','Ready when you are!'],
  focus:['Ooh, tell me what\'s stuck!','I\'m all ears. Well, all antenna.'],
  ponder:['Hmm, thinking…','Let me think about that…'],
  work:['On it! Briefing my agents…'],
  vague:['Tell me a bit more?','Which system, and what\'s happening?'],
  off:['That\'s outside what we build. Got a software problem?'],
  short:['A sentence is enough!'],
  done:['Here\'s your blueprint!','Ta-da! Swipe through it.'],
  boop:['Hi there!','Beep boop!','Need a plan?','Hehe, that tickles.']
};
function pick(k){var a=LINES[k];return a[Math.floor(Math.random()*a.length)]}

var tpl=$('#bp-tpl'),home=$('#p-home');
if(tpl&&home){
  var node=tpl.content.firstElementChild.cloneNode(true),anchor=$('.logos',home);
  if(anchor)anchor.parentNode.insertBefore(node,anchor.nextSibling);else home.insertBefore(node,home.firstChild);
  $$('.bpu',node).forEach(function(el){el.classList.add('rv')});
  var ta=$('#bpt'),sig=$('#bpsig'),plan=$('#bpplan'),err=$('#bperr'),dt,pt,bt,known={},bud=null,G2=window.gsap;
  var mob=matchMedia('(max-width:940px)');
  plan.innerHTML='<div class="bud" id="bud"><div class="bud-stage" id="budStage" aria-hidden="true"><canvas id="budCanvas"></canvas>'+
    '<svg class="bud-still" viewBox="0 0 200 220" aria-hidden="true"><ellipse cx="100" cy="208" rx="54" ry="8" fill="#1E1B4B" opacity=".12"/><rect x="58" y="176" width="34" height="26" rx="10" fill="#C6F432"/><rect x="108" y="176" width="34" height="26" rx="10" fill="#C6F432"/><rect x="64" y="118" width="72" height="56" rx="18" fill="#F8F7FF" stroke="#E4E0FB" stroke-width="2"/><rect x="86" y="132" width="28" height="28" rx="7" fill="#4F46E5"/><rect x="95" y="96" width="10" height="24" fill="#24205C"/><rect x="36" y="34" width="128" height="68" rx="24" fill="#F8F7FF" stroke="#E4E0FB" stroke-width="2"/><rect x="34" y="94" width="132" height="10" rx="5" fill="#4F46E5"/><rect x="50" y="44" width="100" height="48" rx="16" fill="#0B0A24"/><rect x="70" y="56" width="16" height="20" rx="7" fill="#C6F432"/><rect x="114" y="56" width="16" height="20" rx="7" fill="#C6F432"/><path d="M90 82q10 7 20 0" stroke="#C6F432" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="118" y="14" width="3" height="20" fill="#24205C"/><circle cx="119.5" cy="13" r="6" fill="#C6F432"/></svg></div>'+
    '<div class="bud-bub" id="budBub" aria-hidden="true"><span></span><i class="bud-dots"><b></b><b></b><b></b></i></div>'+
    '<span class="bud-name" aria-hidden="true">Yardie &middot; your blueprint buddy</span></div>'+
    '<div class="bres" id="bres" role="region" aria-label="Your blueprint" hidden></div><p class="vh" id="bpLive" role="status" aria-live="polite"></p>';
  var stage=$('#budStage'),bub=$('#budBub'),bres=$('#bres'),live=$('#bpLive'),budEl=$('#bud'),state='idle',lastBub='';

  function bsay(k,txt){var t=txt||pick(k);if(t===lastBub&&k!=='boop')return;lastBub=t;bub.classList.toggle('think',k==='ponder'||k==='work');
    if(G2&&anim){G2.to(bub,{autoAlpha:0,y:6,scale:.96,duration:.14,overwrite:true,onComplete:function(){$('span',bub).textContent=t;G2.to(bub,{autoAlpha:1,y:0,scale:1,duration:.4,ease:'back.out(2)'})}})}
    else{$('span',bub).textContent=t;bub.style.opacity=1}}
  function setS(s){state=s;if(bud)bud.setState(s);budEl.setAttribute('data-state',s)}
  function inDir(){var a=ta.getBoundingClientRect(),b=stage.getBoundingClientRect();if(!b.width)return;var x=((a.left+a.width/2)-(b.left+b.width/2))/(b.width/2),y=((a.top+a.height/2)-(b.top+b.height*0.35))/(b.height/2);if(bud)bud.setInputDir(Math.max(-1.4,Math.min(1.4,x)),Math.max(-1.4,Math.min(1.4,y)))}

  /* load the 3D buddy only when the section is near */
  var still=function(){budEl.classList.add('is-still')};
  if(!('IntersectionObserver' in window)||reduced)still();
  else{var lio=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;lio.disconnect();
    (window.BYLoadScenes?window.BYLoadScenes():Promise.resolve(null)).then(function(S){
      if(!S){still();return}
      try{bud=new S.Buddy($('#budCanvas'));bud.start();budEl.classList.add('is-live');bud.setState(state);bsay('idle')}catch(e){still()}
    })},{rootMargin:'400px 0px'});lio.observe(node)}
  bsay('idle');

  /* look at the pointer anywhere in the section */
  node.addEventListener('pointermove',function(e){if(!bud)return;if((state==='focus'||state==='confused')&&!ta.value.trim()){setS('idle');bsay('idle')}if(state!=='idle')return;var b=stage.getBoundingClientRect();bud.setPointer(Math.max(-1.3,Math.min(1.3,(e.clientX-(b.left+b.width/2))/(b.width/2))),Math.max(-1.2,Math.min(1.2,(e.clientY-(b.top+b.height*0.35))/(b.height/2))),true)});
  node.addEventListener('pointerleave',function(){if(bud)bud.setPointer(0,0,false)});
  stage.addEventListener('click',function(){if(state==='present')return;if(bud)bud.boop();bsay('boop')});

  /* chips: detected topics fly into Yardie */
  function fly(chip){
    if(!G2||!anim||!bud)return;
    var a=chip.getBoundingClientRect(),b=stage.getBoundingClientRect(),c=chip.cloneNode(true);
    c.classList.add('bps-fly');c.style.left=a.left+'px';c.style.top=a.top+'px';document.body.appendChild(c);
    G2.to(c,{x:b.left+b.width/2-a.left-a.width/2,y:b.top+b.height*0.38-a.top,scale:.2,autoAlpha:0,duration:.75,ease:'power2.in',onComplete:function(){c.remove();bud.absorb()}});
  }
  function showSig(){
    var d=detect(ta.value),fresh=[];
    sig.innerHTML=d.length?d.slice(0,4).map(function(c,i){if(!known[c.id])fresh.push(i);return '<span class="bps" style="--i:'+i+'">'+bpesc(c.short)+'</span>'}).join(''):'<span class="bps0">Topics Yardie spots will appear here</span>';
    var nk={};d.forEach(function(c){nk[c.id]=1});known=nk;
    fresh.forEach(function(i,k){var ch=$$('.bps',sig)[i];if(ch)setTimeout(function(){fly(ch)},120+k*160)});
    if(fresh.length&&state!=='present')bsay(null,'Ooh, '+(/^[A-Z]{2}/.test(d[fresh[0]].short)?d[fresh[0]].short:d[fresh[0]].short.toLowerCase())+'!');
  }
  ta.addEventListener('focus',function(){if(state==='present')return;inDir();setS('focus');bsay('focus')});
  ta.addEventListener('blur',function(){if(state==='present'||state==='work')return;clearTimeout(pt);setS('idle');bsay('idle')});
  ta.addEventListener('input',function(){
    err.textContent='';if(state==='present')return;
    inDir();setS('typing');if(bud)bud.keystroke();
    clearTimeout(dt);dt=setTimeout(showSig,220);
    clearTimeout(pt);pt=setTimeout(function(){if(state==='typing'&&ta.value.trim()){setS('ponder');bsay('ponder')}},1300);
  });
  $$('.bpex button',node).forEach(function(b){b.addEventListener('click',function(){
    if(state==='present')reset(true);ta.value=b.dataset.ex;err.textContent='';inDir();setS('typing');if(bud)bud.keystroke();showSig();ta.focus();
    clearTimeout(pt);pt=setTimeout(function(){if(state==='typing'){setS('ponder');bsay('ponder')}},1300)})});
  window.addEventListener('resize',function(){if(state==='focus'||state==='typing')inDir()});

  $('#bpgo').addEventListener('click',function(){
    var t=ta.value.trim();clearTimeout(pt);
    if(t.length<8){err.textContent='Describe your challenge first. A sentence is enough.';setS('confused');bsay('short');ta.focus();return}
    if(!BPM||!window.BYEngine){err.textContent='The blueprint engine failed to load. Please refresh the page.';return}
    var bp;try{bp=BYEngine.generate(t,{},BPM)}catch(e){bp=null}
    window.BrightYardBlueprint.last=bp;
    if(!bp){err.textContent='Something went wrong drawing the blueprint. Please try again.';return}
    if(!bp.project.supported){setS('confused');bsay('off');live.textContent=bp.project.message;return}
    setS('work');bsay('work');
    if(mob.matches){var pr=plan.getBoundingClientRect();if(pr.top<60||pr.bottom>innerHeight)window.scrollTo({top:pr.top+scrollY-(innerHeight-pr.height)/2,behavior:reduced?'auto':'smooth'})}
    setTimeout(function(){reveal(bp,t)},reduced||!bud?0:1450);
  });

  /* ---------- result: four swipeable cards in the same box ---------- */
  function card(i,label,body){return '<article class="bc" data-i="'+i+'" aria-label="'+label+'"><span class="bc-k">'+label+'</span>'+body+'</article>'}
  function build(bp,t){
    var P=bp.project,D=P.estimated_duration,W=Math.max(1,Math.ceil(D.including_hypercare_days/5));
    var short=bpesc(bp.solution.summary.split('. ')[0].replace(/\.$/,''))+'.';
    var c1='<h3 class="bc-t">'+bpesc(P.proposed_solution)+'</h3><div class="bc-big"><b id="bpwk">0</b><span>to '+D.maximum_weeks+' weeks<br>to first release</span></div>'+
      '<div class="bc-pills"><span>'+bpesc(P.complexity)+' complexity</span><span>'+bp.resources.agent_roles.length+' agents</span><span>'+bp.resources.human_roles.length+' people</span></div>'+
      (P.ambiguous?'<p class="bc-n"><b>Rough guess.</b> Tell us which system and what happens for a sharper plan.</p>':'<p class="bc-n">'+short+'</p>');
    var bars='';STAGES.forEach(function(s,k){var ps=bp.phases.filter(function(p){return s[1].indexOf(p.phase_id)>-1});if(!ps.length)return;
      var a=Math.min.apply(null,ps.map(function(p){return p.start_day})),b=Math.max.apply(null,ps.map(function(p){return p.end_day}));
      bars+='<li style="--i:'+k+'"><b>'+s[0]+'</b><span class="bc-tr"><i class="'+(s[0]==='Run'?'on':'')+'" style="left:'+(a/5/W*100).toFixed(1)+'%;width:'+Math.max(3,(b-a)/5/W*100).toFixed(1)+'%"></i></span></li>'});
    var c2='<h3 class="bc-t">How it would run</h3><ul class="bc-bars">'+bars+'</ul><div class="bc-ax"><span>Week 0</span><span>'+W+'</span></div>';
    var ag=bp.agents.map(function(a){var n=a.name.replace(' Agent','');return '<li><i>'+bpesc(n.charAt(0))+'</i>'+bpesc(n)+'</li>'}).join('');
    var c3='<h3 class="bc-t">Who does the work</h3><ul class="bc-ag">'+ag+'</ul><p class="bc-n"><b>Reviewed by</b> '+bpesc(bp.resources.human_roles.slice(0,4).join(', ').toLowerCase())+'.</p>';
    var rk=bp.delivery.risks.slice(0,2).map(function(r){return '<li>'+bpesc(r.description)+'</li>'}).join('');
    var prod=P.related_product;
    var c4='<h3 class="bc-t">Watch-outs and next step</h3><ul class="bc-rk">'+rk+'</ul>'+(prod?'<p class="bc-n">Related: <a class="ul-link" href="#/'+prod.toLowerCase()+'">'+bpesc(prod)+'</a></p>':'')+
      '<div class="bc-cta"><button class="btn pri" id="bpsend" type="button"><span>Send this plan to our team</span><span class="arrow">&rarr;</span></button><button class="btn out" id="bpreset" type="button">Start over</button></div><p class="bc-f">Indicative only. A discovery workshop confirms scope and timing.</p>';
    var navH='<div class="bres-nav"><button type="button" class="bres-a" data-d="-1" aria-label="Previous card">&#8592;</button><span class="bres-dots">'+[0,1,2,3].map(function(i){return '<button type="button" aria-label="Card '+(i+1)+' of 4"'+(i?'':' aria-current="true"')+'></button>'}).join('')+'</span><button type="button" class="bres-a" data-d="1" aria-label="Next card">&#8594;</button></div>';
    bres.innerHTML='<div class="bres-h"><span class="tag">Your blueprint</span></div>'+
      '<div class="bres-track" tabindex="0" aria-label="Blueprint cards, scroll sideways">'+card(0,'The solution',c1)+card(1,'Timeline',c2)+card(2,'Team',c3)+card(3,'Next step',c4)+'</div>'+navH;
    var tr=$('.bres-track',bres),dots=$$('.bres-dots button',bres),cards=$$('.bc',bres),cur=0;
    function goC(i){i=Math.max(0,Math.min(3,i));tr.scrollTo({left:cards[i].offsetLeft-tr.offsetLeft,behavior:reduced?'auto':'smooth'})}
    $$('.bres-a',bres).forEach(function(b){b.onclick=function(){goC(cur+(+b.dataset.d))}});
    dots.forEach(function(b,i){b.onclick=function(){goC(i)}});
    tr.addEventListener('scroll',function(){var i=Math.round(tr.scrollLeft/(cards[1].offsetLeft-cards[0].offsetLeft));if(i!==cur){cur=i;dots.forEach(function(d,j){d.toggleAttribute('aria-current',j===i)});
      var c=cards[i];if(G2&&anim&&!c._a){c._a=1;G2.from($$('.bc-bars i,.bc-ag li,.bc-rk li',c),{scaleX:0,autoAlpha:0,transformOrigin:'left',stagger:.06,duration:.6,ease:'power3.out'})}}},{passive:true});
    tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){goC(cur+1);e.preventDefault()}if(e.key==='ArrowLeft'){goC(cur-1);e.preventDefault()}});
    $('#bpsend',bres).addEventListener('click',function(){var g=$('#goal');
      if(g)g.value='Challenge: '+t+'\n\nIndicative blueprint: '+P.proposed_solution+', about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks, '+P.complexity.toLowerCase()+' complexity.';
      nav('contact');setTimeout(function(){var n=$('#name');if(n)n.focus({preventScroll:true})},1400)});
    $('#bpreset',bres).addEventListener('click',function(){reset(false)});
    return D;
  }

  /* ---------- holographic result: Yardie projects the plan as a 3D table ---------- */
  var RISK_STAGE={R_REQ:'Understand',R_AMBIG:'Understand',R_DOCS:'Understand',R_INFRA:'Understand',R_ASSUME:'Understand',R_APPROVAL:'Design',R_INTEG:'Build',R_DATA:'Build',R_PROC:'Build',R_CAP:'Build',R_SECAPP:'Prove',R_AI:'Prove',R_SPECIALIST:'Prove',R_DEADLINE:'Launch',R_LONG:'Launch',R_BENCH:'Design'};
  var CH=['The solution','Timeline','Team','Next step'],hv=null,raf=0,holo=null;
  function planFromBp(bp){
    var P=bp.project,W=Math.max(1,Math.ceil(P.estimated_duration.including_hypercare_days/5)),groupOf={},eff={};
    STAGES.forEach(function(s){s[1].forEach(function(ph){groupOf[ph]=s[0]})});
    bp.activities.forEach(function(a){var g=groupOf[a.phase_id];eff[g]=(eff[g]||0)+a.effort.traditional_hours});
    var stages=[];STAGES.forEach(function(s){var ps=bp.phases.filter(function(p){return s[1].indexOf(p.phase_id)>-1});if(!ps.length)return;
      stages.push({name:s[0],a:Math.min.apply(null,ps.map(function(p){return p.start_day}))/5,b:Math.max.apply(null,ps.map(function(p){return p.end_day}))/5,e:eff[s[0]]||0,kind:s[0]==='Build'?'build':s[0]==='Run'?'run':s[0]==='Launch'?'ship':'plan'})});
    var mx=Math.max.apply(null,stages.map(function(s){return s.e}))||1;stages.forEach(function(s){s.e=s.e/mx});
    var idx=function(n){for(var i=0;i<stages.length;i++)if(stages[i].name===n)return i;var b=0;stages.forEach(function(s,i){if(s.kind==='build')b=i});return b};
    var actPh={};bp.activities.forEach(function(a){actPh[a.activity_id]=groupOf[a.phase_id]});
    var agents=bp.agents.filter(function(a){return a.agent_id!=='AG_ORCH'}).sort(function(a,b){return b.agent_hours-a.agent_hours}).slice(0,6).map(function(a){
      var c={};a.activities.forEach(function(id){var g=actPh[id];c[g]=(c[g]||0)+1});var best=Object.keys(c).sort(function(x,y){return c[y]-c[x]})[0];
      return {name:a.name.replace(' Agent',''),s:idx(best)}});
    var risks=bp.delivery.risks.slice(0,2).map(function(r){return {s:idx(RISK_STAGE[r.risk_id]||'Build'),text:r.description}});
    return {W:W,stages:stages,agents:agents,risks:risks};
  }
  function wk(a,b){var x=Math.max(1,Math.round(a)+1),y=Math.max(x,Math.round(b));return x===y?'Week '+x:'Weeks '+x+'–'+y}
  function holoPanels(bp,P,t){
    var R=bp.project,D=R.estimated_duration,people=bp.resources.human_roles;
    var longest=P.stages.slice().sort(function(a,b){return (b.b-b.a)-(a.b-a.a)})[0];
    return [
      '<span class="bh-k">The solution</span><h3 class="bh-t">'+bpesc(R.proposed_solution)+'</h3><div class="bh-big"><b id="bpwk">0</b><span>to '+D.maximum_weeks+' weeks<br>to first release</span></div><div class="bc-pills"><span>'+bpesc(R.complexity)+' complexity</span><span>'+P.agents.length+' agents</span><span>'+people.length+' people</span></div>'+(R.ambiguous?'<p class="bh-n"><b>Rough guess.</b> Tell us more for a sharper plan.</p>':''),
      '<span class="bh-k">Timeline</span><h3 class="bh-t">'+P.stages.length+' stages, one path</h3><p class="bh-n">'+bpesc(longest.name)+' is the longest stretch. Block length is time, height is effort.</p><ul class="vh">'+P.stages.map(function(s){return '<li>'+s.name+': '+wk(s.a,s.b)+'</li>'}).join('')+'</ul><p class="bh-hint">Hover a block for details</p>',
      '<span class="bh-k">Team</span><h3 class="bh-t">'+P.agents.length+' agents build it</h3><p class="bh-n">Each orb is an agent, floating over the stage it works on. <b>Every change is reviewed by</b> '+bpesc(people.slice(0,3).join(', ').toLowerCase())+'.</p>',
      '<span class="bh-k">Next step</span><h3 class="bh-t">Watch-outs</h3><ul class="bh-rk">'+P.risks.map(function(r){return '<li>'+bpesc(r.text)+'</li>'}).join('')+'</ul>'+(R.related_product?'<p class="bh-n">Related: <a class="ul-link" href="#/'+R.related_product.toLowerCase()+'">'+bpesc(R.related_product)+'</a></p>':'')+'<div class="bc-cta"><button class="btn pri" id="bpsend" type="button"><span>Send this plan</span><span class="arrow">&rarr;</span></button><button class="btn out" id="bpreset" type="button">Start over</button></div>'
    ];
  }
  function widen(on){
    var grid=plan.parentNode,card=grid.firstElementChild;if(mob.matches||grid.classList.contains('is-wide')===on)return;
    var r0=plan.getBoundingClientRect();
    var flip=function(){var r1=plan.getBoundingClientRect();if(G2&&anim)G2.fromTo(plan,{x:r0.left-r1.left,width:r0.width},{x:0,width:r1.width,duration:.8,ease:'power3.inOut',clearProps:'width,transform'})};
    if(on){if(G2&&anim)G2.to(card,{autoAlpha:0,x:-40,duration:.3,ease:'power2.in',onComplete:function(){grid.classList.add('is-wide');flip()}});else grid.classList.add('is-wide')}
    else{grid.classList.remove('is-wide');flip();if(G2&&anim)G2.fromTo(card,{autoAlpha:0,x:-40},{autoAlpha:1,x:0,duration:.55,delay:.35,ease:'power3.out',clearProps:'opacity,visibility,transform'});else{card.style.opacity='';card.style.visibility=''}}
  }
  function revealHolo(bp,t){
    var P=planFromBp(bp),R=bp.project,D=R.estimated_duration,panels=holoPanels(bp,P,t),view=0;
    holo={P:P};
    var lab='';P.stages.forEach(function(s,i){lab+='<span class="bh-l bh-s" data-k="s'+i+'"><b>'+s.name+'</b><em>'+wk(s.a,s.b)+'</em></span>'});
    P.agents.forEach(function(a,i){lab+='<span class="bh-l bh-a" data-k="a'+i+'">'+bpesc(a.name)+'</span>'});
    P.risks.forEach(function(r,i){lab+='<span class="bh-l bh-r" data-k="r'+i+'">!</span>'});
    lab+='<span class="bh-l bh-f" data-k="f">Live &middot; week '+D.minimum_weeks+'</span>';
    bres.innerHTML='<div class="bh-labels" aria-hidden="true">'+lab+'</div><div class="bh-top"><span class="tag bh-tag">Your blueprint</span><button type="button" class="bh-edit">&larr; Edit brief</button></div>'+
      '<div class="bh-panel" tabindex="-1">'+panels[0]+'</div>'+
      '<div class="bh-nav"><button type="button" class="bres-a" data-d="-1" aria-label="Previous view">&#8592;</button><div class="bh-tabs" role="tablist">'+CH.map(function(c,i){return '<button type="button" role="tab" aria-selected="'+(i?'false':'true')+'">'+c+'</button>'}).join('')+'</div><button type="button" class="bres-a" data-d="1" aria-label="Next view">&#8594;</button></div>'+
      '<span class="bh-drag">Drag to rotate</span>';
    bres.classList.add('holo');bres.dataset.view='0';bres.hidden=false;budEl.classList.add('is-holo');
    var panel=$('.bh-panel',bres),tabs=$$('.bh-tabs button',bres),labels={};$$('.bh-l',bres).forEach(function(l){labels[l.dataset.k]=l});
    widen(true);bud.planFrame(null);bud.showPlan(P);bud.setView(0);setS('present');bsay(null,'Here\'s your blueprint!');
    live.textContent='Blueprint ready: '+R.proposed_solution+', about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks. Use the tabs to explore the timeline, team and next step.';
    function bind(){
      var s=$('#bpsend',panel);if(s)s.onclick=function(){var g=$('#goal');if(g)g.value='Challenge: '+t+'\n\nIndicative blueprint: '+R.proposed_solution+', about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks, '+R.complexity.toLowerCase()+' complexity.';nav('contact');setTimeout(function(){var n=$('#name');if(n)n.focus({preventScroll:true})},1400)};
      var r=$('#bpreset',panel);if(r)r.onclick=function(){reset(false)};
    }
    function go(i){
      i=Math.max(0,Math.min(3,i));if(i===view)return;view=i;bud.setView(i);bres.dataset.view=String(i);
      tabs.forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
      var swap=function(){panel.innerHTML=panels[i];bind();if(i===0){var w=$('#bpwk',panel);if(w)w.textContent=D.minimum_weeks}};
      if(G2&&anim){G2.to(panel,{autoAlpha:0,y:10,duration:.18,overwrite:true,onComplete:function(){swap();G2.fromTo(panel,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.45,ease:'power3.out'})}})}else swap();
      bsay(null,['Here\'s the big picture.','Follow the path, left to right.','Meet the team!','Ready when you are.'][i]);
    }
    $$('.bres-a',bres).forEach(function(b){b.onclick=function(){go(view+(+b.dataset.d))}});
    $('.bh-edit',bres).onclick=function(){reset(true);setTimeout(function(){ta.focus()},anim?950:0)};
    tabs.forEach(function(b,i){b.onclick=function(){go(i)}});
    holo.key=function(e){if(!holo||e.target.closest('input,textarea,select'))return;if(e.key==='ArrowRight'){go(view+1);e.preventDefault()}if(e.key==='ArrowLeft'){go(view-1);e.preventDefault()}};
    node.addEventListener('keydown',holo.key);
    bind();
    var w=$('#bpwk',panel);
    if(G2&&anim){G2.fromTo(panel,{autoAlpha:0,x:-20},{autoAlpha:1,x:0,duration:.7,delay:.9,ease:'power3.out'});G2.from($('.bh-nav',bres),{autoAlpha:0,y:12,duration:.6,delay:1.2});
      var o={v:0};G2.to(o,{v:D.minimum_weeks,duration:1.1,delay:1,ease:'power2.out',onUpdate:function(){w.textContent=Math.round(o.v)}})}else w.textContent=D.minimum_weeks;
    /* labels follow the 3D model */
    var sc=$('#budCanvas'),cr=null;
    var sz={};function vis(k){var c=k.charAt(0),l=labels[k];return c==='s'?(view===1||l.classList.contains('hov')):c==='a'?view===2:c==='r'?(view===1||view===3):(view===0||view===3)}
    (function loop(){if(!holo)return;raf=requestAnimationFrame(loop);var a=bud.anchors();if(!a)return;
      var placed=[];
      a.filter(function(p){return labels[p.k]&&p.z<1}).sort(function(p,q){return (vis(q.k)?1:0)-(vis(p.k)?1:0)||p.x-q.x}).forEach(function(p){
        var l=labels[p.k];if(!sz[p.k]||!sz[p.k].w)sz[p.k]={w:l.offsetWidth,h:l.offsetHeight};var w=sz[p.k].w,h=sz[p.k].h,x=p.x,y=p.y;
        if(vis(p.k)){for(var n=0;n<8;n++){var hit=false;for(var i=0;i<placed.length;i++){var r=placed[i];if(x-w/2<r[2]+4&&x+w/2>r[0]-4&&y-h<r[3]+3&&y>r[1]-3){hit=true;y=r[1]-3;break}}if(!hit)break}placed.push([x-w/2,y-h,x+w/2,y])}
        l.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-100%)'})})();
    /* hover and drag */
    var down=null;
    hv=function(e){
      var r=sc.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width*2-1,ny=-((e.clientY-r.top)/r.height*2-1);
      if(down!==null&&e.pointerType!=='touch'){bud.dragBy(e.clientX-down);down=e.clientX;sc.style.cursor='grabbing';return}
      var h=bud.hoverAt(nx,ny);$$('.bh-s',bres).forEach(function(l,i){l.classList.toggle('hov',i===h)});sc.style.cursor=h>-1?'pointer':'grab';
    };
    sc.addEventListener('pointermove',hv);
    sc.onpointerdown=function(e){if(e.pointerType==='touch')return;down=e.clientX;try{sc.setPointerCapture(e.pointerId)}catch(x){}};
    sc.onpointerup=sc.onpointercancel=function(){down=null;sc.style.cursor='grab'};
    setTimeout(function(){panel.focus({preventScroll:true})},anim?1000:0);
  }
  function hideHolo(){
    if(!holo)return;cancelAnimationFrame(raf);if(holo.key)node.removeEventListener('keydown',holo.key);holo=null;var sc=$('#budCanvas');if(hv)sc.removeEventListener('pointermove',hv);sc.onpointerdown=sc.onpointerup=sc.onpointercancel=null;sc.style.cursor='';
    if(bud){bud.hidePlan();bud.planFrame(null)}bres.classList.remove('holo');budEl.classList.remove('is-holo');widen(false);
  }
  function reveal(bp,t){
    if(bud){revealHolo(bp,t);return}
    var D=build(bp,t);bres.hidden=false;setS('present');bsay('done');budEl.classList.add('is-mini');
    live.textContent='Blueprint ready: '+bp.project.proposed_solution+', about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks. Four cards, scroll sideways.';
    var wk=$('#bpwk',bres),launch=D.minimum_weeks;
    if(G2&&anim){
      var b=stage.getBoundingClientRect(),p=plan.getBoundingClientRect(),cx=((b.left+b.width/2-p.left)/p.width*100).toFixed(1),cy=((b.top+b.height*0.4-p.top)/p.height*100).toFixed(1);
      G2.timeline()
        .fromTo(bres,{clipPath:'circle(0% at '+cx+'% '+cy+'%)'},{clipPath:'circle(150% at '+cx+'% '+cy+'%)',duration:.9,ease:'power3.inOut'})
        .from($$('.bc[data-i="0"] > *',bres),{y:18,autoAlpha:0,stagger:.06,duration:.6,ease:'power3.out'},'-=.35')
        .add(function(){var o={v:0};G2.to(o,{v:launch,duration:.9,ease:'power2.out',onUpdate:function(){wk.textContent=Math.round(o.v)}})},'-=.4');
    }else wk.textContent=launch;
    setTimeout(function(){var h=$('.bres-track',bres);if(h)h.focus({preventScroll:true})},anim?950:0);
  }
  function reset(quiet){
    var wasHolo=!!holo;
    var done=function(){hideHolo();bres.hidden=true;bres.innerHTML='';bres.style.opacity='';bres.style.visibility='';bres.style.clipPath='';budEl.classList.remove('is-mini');setS('idle');if(bud)bud.wave();bsay('idle')};
    if(!quiet){ta.value='';known={};showSig()}
    if(G2&&anim&&!quiet){G2.to(bres,wasHolo?{autoAlpha:0,duration:.35,onComplete:function(){done();ta.focus()}}:{clipPath:'circle(0% at 86% 18%)',duration:.6,ease:'power3.in',onComplete:function(){done();ta.focus()}})}else{done();if(!quiet)ta.focus()}
  }
}

/* ---------- 2. Blueprint lens ---------- */
var bp=$('#bp'),ring=$('#bring'),ann=$('#bpann'),bbtn=$('#bbtn'),ro=$('#bro');
var on=false,x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,R=0,big=false,looping=false,els=[],pool=[],last=0;
var TARGETS=[['header','header',0],['h1','h1',1],['h2','h2',1],['h3','h3',1],['.lead','lead text',1],['.btn','button',0],['.card','card',0],['.tag','tag',0],['.mini','live widget',0],['.stats b','stat',1],['.ch','chip',0],['.logos','logo strip',0],['.pill','pill',0],['.sg','toggle',0],['footer','footer',0],['.band','cta band',0],['details','accordion',0],['.role','job row',0],['.spanel','sticky visual',0],['.sstep','story step',0],['input','input',0],['textarea','textarea',0],['.demo','demo panel',0],['.bpplan','plan panel',0],['.hero3','hero',0],['.s3-step.on','story step',0]];
function collect(){
  var scopes=[$('header'),$('.page.on'),$('footer')].filter(Boolean),out=[];
  TARGETS.forEach(function(t){scopes.forEach(function(sc){$$(t[0],sc).forEach(function(el){if(!el.closest('#bp,#gl,.dock,.ast,#cur,#bring,.bhint'))out.push({el:el,role:t[1],txt:t[2]})})})});
  return out;
}
function hex(c){var m=c.match(/\d+(\.\d+)?/g);if(!m)return c;return '#'+m.slice(0,3).map(function(v){return ('0'+Math.round(+v).toString(16)).slice(-2)}).join('').toUpperCase()}
function annotate(){
  var reads=[];
  for(var i=0;i<els.length&&reads.length<70;i++){
    var o=els[i],r=o.el.getBoundingClientRect();
    if(r.width<4||r.height<4||r.bottom<y-R||r.top>y+R||r.right<x-R||r.left>x+R)continue;
    reads.push([o,r]);
  }
  reads.forEach(function(p,i){
    var o=p[0],r=p[1],b=pool[i];
    if(!b){b=document.createElement('div');b.className='bpb';b.innerHTML='<span class="bplab"></span>';ann.appendChild(b);pool[i]=b}
    b.style.display='block';
    b.style.transform='translate('+r.left+'px,'+r.top+'px)';
    b.style.width=r.width+'px';b.style.height=r.height+'px';
    var key=o.role+'|'+Math.round(r.width)+'x'+Math.round(r.height);
    if(b._k!==key){
      b._k=key;
      var cs=getComputedStyle(o.el);
      var extra=o.txt?Math.round(parseFloat(cs.fontSize))+'px/'+cs.fontWeight+' '+hex(cs.color):'r'+Math.round(parseFloat(cs.borderTopLeftRadius)||0);
      b.firstChild.textContent=o.role+' \u00B7 '+extra+' \u00B7 '+Math.round(r.width)+'\u00D7'+Math.round(r.height);
    }
  });
  for(var j=reads.length;j<pool.length;j++)pool[j].style.display='none';
}
function frame(ts){
  if(on&&ts-last>800){els=collect();last=ts}
  var k=reduced?1:.2;
  x+=(tx-x)*k;y+=(ty-y)*k;
  var tR=on?(big?270:170):0;
  R+=(tR-R)*(reduced?1:.16);
  if(Math.abs(tR-R)<.5)R=tR;
  var cp='circle('+R+'px at '+x+'px '+y+'px)';
  bp.style.clipPath=cp;bp.style.webkitClipPath=cp;
  ring.style.transform='translate('+(x-R)+'px,'+(y-R)+'px)';
  ring.style.width=(R*2)+'px';ring.style.height=(R*2)+'px';
  ring.style.opacity=R>2?1:0;
  if(R>2){ro.textContent='x '+Math.round(x)+'  y '+Math.round(y+scrollY);annotate()}
  if(on||R>0)requestAnimationFrame(frame);else looping=false;
}
function setBP(v){
  if(!fine)return;
  on=v;bbtn.setAttribute('aria-pressed',v);document.body.classList.toggle('bp-on',v);
  seen();
  if(v){last=0;say('Blueprint mode is on. Move your cursor, hold the mouse button to widen the lens, press <b>Esc</b> to exit.',5500);if(!looping){looping=true;requestAnimationFrame(frame)}}
  else hint.classList.remove('show');
}
document.addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY});
document.addEventListener('pointerdown',function(e){if(on&&!e.target.closest('.dock'))big=true});
['pointerup','pointercancel'].forEach(function(n){document.addEventListener(n,function(){big=false})});
window.addEventListener('hashchange',function(){last=0});
bbtn.addEventListener('click',function(){setBP(!on)});
var bpon=$('#bpon');if(bpon)bpon.addEventListener('click',function(){if(fine)setBP(true);else say('Blueprint mode needs a mouse. Try it on a desktop.',4000)});

/* ---------- 3. Yard menu ---------- */
var PAGES=[['services','Services','Build, run, secure'],['allocivo','Allocivo','Hotel operations'],['work','Work','The proof'],['xessly','Xessly','Accessibility'],['home','Home','Start here'],['how','How we work','Our playbook'],['insights','Insights','Field notes'],['contact','Contact','Talk to us'],['bp','Blueprint','See how this page is built']];
var Y=[0,2,4,7];
var gl=$('#gl'),gg=$('#gg'),gbtn=$('#gbtn'),glOpen=false;
gg.innerHTML=PAGES.map(function(p,i){
  return '<button class="gc'+(Y.indexOf(i)>-1?' y':'')+'" type="button" role="menuitem" style="--i:'+i+'" data-p="'+p[0]+'"><span class="n">'+(i+1)+'</span><b>'+p[1]+'</b><small>'+p[2]+'</small></button>';
}).join('');
function setGL(v){
  glOpen=v;
  if(v){var r=gbtn.getBoundingClientRect();gl.style.setProperty('--ox',(r.left+r.width/2)+'px');gl.style.setProperty('--oy',(r.top+r.height/2)+'px')}
  gl.classList.toggle('open',v);gl.setAttribute('aria-hidden',!v);gbtn.setAttribute('aria-expanded',v);
  document.body.classList.toggle('gl-open',v);
  seen();
  if(v){setTimeout(function(){var c=$('.gc',gl);if(c&&glOpen)c.focus({preventScroll:true})},600)}
  else gbtn.focus({preventScroll:true});
}
function choose(id){
  setGL(false);
  if(id==='bp'){if(fine)setTimeout(function(){setBP(!on)},500);else say('Blueprint mode needs a mouse. Try it on a desktop.',4000)}
  else nav(id);
}
gbtn.addEventListener('click',function(){setGL(!glOpen)});
$('#glx').addEventListener('click',function(){setGL(false)});
gg.addEventListener('click',function(e){var b=e.target.closest('.gc');if(b)choose(b.dataset.p)});
gl.addEventListener('wheel',function(e){e.preventDefault()},{passive:false});
gl.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});

document.addEventListener('keydown',function(e){
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==='Escape'){if(glOpen)setGL(false);else if(on)setBP(false);return}
  if(typing(e.target))return;
  var k=e.key.toLowerCase();
  if(k==='g'){setGL(!glOpen);return}
  if(glOpen){if(/^[1-9]$/.test(e.key))choose(PAGES[+e.key-1][0]);return}
  if(k==='b'&&fine)setBP(!on);
});

if(fine&&!wasSeen()){setTimeout(function(){if(!wasSeen()&&!glOpen&&!on)say('New: press <b>B</b> to see how this page is built, or <b>G</b> for the yard menu.',9000)},6000)}
})();

/* ===== core: smooth scroll, router, page transitions, scroll animation, 3D stages ===== */
(function(){
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var G=window.gsap,ST=window.ScrollTrigger,anim=!!(G&&ST)&&!reduced,root=document.documentElement;
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
          var w=document.createElement('span');w.className='w';
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
    var s=document.createElement('script');s.src='assets/js/scenes.js';
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
  ST.batch(rv,{start:'top 92%',once:true,onEnter:function(b){G.to(b,{autoAlpha:1,y:0,duration:1,ease:'power3.out',stagger:.09,overwrite:true})}});
}
function parallax(pg){
  if(!anim)return;
  $$('.band',pg).forEach(function(b){G.fromTo(b,{scale:.94,borderRadius:60},{scale:1,borderRadius:36,ease:'none',scrollTrigger:{trigger:b,start:'top 95%',end:'top 45%',scrub:.6}})});
  $$('.prods .pp',pg).forEach(function(p,i){G.fromTo(p,{y:i%2?90:40},{y:0,ease:'none',scrollTrigger:{trigger:p.parentNode,start:'top 95%',end:'top 35%',scrub:.8}})});
  $$('.pp [data-ui],.pvis [data-ui]',pg).forEach(function(u){G.fromTo(u,{y:26,rotateX:8,transformPerspective:900},{y:0,rotateX:0,ease:'none',scrollTrigger:{trigger:u,start:'top 95%',end:'top 50%',scrub:.6}})});
  $$('.chips',pg).forEach(function(c){G.from($$('.ch',c),{y:40,autoAlpha:0,rotate:-4,stagger:.06,duration:.8,ease:'back.out(1.6)',scrollTrigger:{trigger:c,start:'top 88%',once:true}})});
  $$('.wont',pg).forEach(function(w){G.from($$('li',w),{x:-40,autoAlpha:0,stagger:.08,duration:.8,ease:'power3.out',scrollTrigger:{trigger:w,start:'top 82%',once:true}})});
  $$('.levers,.arch,.auto,.tracks,.cover,.otiles',pg).forEach(function(w){G.from(w.children,{y:30,autoAlpha:0,stagger:.07,duration:.8,ease:'power3.out',scrollTrigger:{trigger:w,start:'top 85%',once:true}})});
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
function parse(){var parts=(location.hash.replace('#/','')||'home').split('/'),id=parts[0];if(!document.getElementById('p-'+id))id='home';return {id:id,sub:parts[1]}}
function render(first){
  var r=parse(),pg=document.getElementById('p-'+r.id);
  menu.classList.remove('open');burger.setAttribute('aria-expanded','false');
  if(r.id===curId){var tg0=r.sub&&document.getElementById(r.sub);if(tg0)scrollToEl(tg0);else if(!r.sub)scrollToY(0);return Promise.resolve()}
  curId=r.id;
  pages.forEach(function(p){p.classList.toggle('on',p===pg)});
  links.forEach(function(a){a.classList.toggle('on',a.dataset.r===r.id)});
  document.title=pg.dataset.title||'BrightYard';
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
window.addEventListener('hashchange',go);
burger.addEventListener('click',function(){var o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
var rsz;window.addEventListener('resize',function(){clearTimeout(rsz);rsz=setTimeout(function(){tone()},200)});

/* ---------- preloader then first render ---------- */
var pre=$('#pre');
function boot(){render(true)}
if(anim&&pre){
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
  all:['BrightYard designs, builds and runs software that turns data, signals and requests into the next right action. We do it for our clients, and in our own products.','Talk to an engineer'],
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
