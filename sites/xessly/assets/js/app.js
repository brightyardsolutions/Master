/* Brightyard site script. Sections: settings and forms, menus, live demos, signature layer, core. */
try{
/* ===== Brightyard site settings: edit these before launch ===== */
window.SITE = {
  mode: 'launch',       // 'draft' shows highlighted placeholders; 'launch' hides every incomplete section
  formEndpoint: '/api/contact',    // e.g. 'https://formspree.io/f/xxxx' or '/api/contact'. Empty = form not connected yet.
  contactEmail: 'hello@brightyard.in',
  api: true,           // false = never call /api (the blueprint dialog then offers link, print and email instead)
  productSites: {}     // once live: { allocivo: 'https://allocivo.brightyard.in/', xessly: 'https://xessly.brightyard.in/' }
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
  $('#dlabel').innerHTML=m==='launch'?'<b>Launch preview.</b> Sections that still need real data are hidden.':'<b>Draft preview.</b> Highlighted text needs real Brightyard data before launch.';
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
  var s=0,vis=false,dur=[1500,1700,2600,3200];
  ui._dur=dur;
  ui._go=function(k){s=k;ui.dataset.state=k;ui._hold=Date.now()+7000};
  if(reduced){ui.dataset.state=3;return}
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(ui);
  (function step(){if(vis&&!(ui._hold>Date.now())){s=(s+1)%4;ui.dataset.state=s}setTimeout(step,ui._hold>Date.now()?400:dur[s])})();
});

/* ---------- contact form: honest about whether it is connected ---------- */
if(!$('#cf'))return;
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
    body:JSON.stringify({goal:g,name:n,email:m,company:$('#co').value.trim(),interest:$('#int').value,industry:$('#ind').value,page:location.href,website:$('#cf [name=website]').value})})
  .then(function(r){if(!r.ok)throw new Error(r.status);
    $('#formcard').innerHTML='<div class="okm" role="status"><div class="tick">&#10003;</div><h3>Message sent</h3><p style="margin-top:10px;color:var(--mute)">Thanks, '+esc(n)+'. A senior engineer will reply within one business day.</p></div>'})
  .catch(function(){send.disabled=false;send.firstChild.textContent='Send message';say('We couldn\'t send that. Please try again, or email us at <b>'+esc(SITE.contactEmail)+'</b>.',true)});
});
})();

}catch(e){console.error(e)}
try{
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

}catch(e){console.error(e)}
try{
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

}catch(e){console.error(e)}
try{
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

  /* ---------- holographic result: solution model: four chapters, each with its own 3D animation ---------- */
  var CH=['What we heard','The solution','How we build it','By when'],hv=null,raf=0,holo=null;
  function wk(a,b){var x=Math.max(1,Math.round(a)+1),y=Math.max(x,Math.round(b));return x===y?'Week '+x:'Weeks '+x+'–'+y}
  function nextMondays(){var o=[],d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+((8-d.getDay())%7||7));for(var i=0;i<6;i++){o.push(new Date(d));d.setDate(d.getDate()+(i?28:14))}return o}
  function fmt(d){return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}
  function addWorkDays(start,days){var d=new Date(start);d.setDate(d.getDate()+Math.round(days/5*7));return d}
  function modelSpec(bp){
    var v=bp.visual,all=v.components,byId={};all.forEach(function(c){byId[c.id]=c});
    var core=all.filter(function(c){return c.lane==='core'}),fixCount={};Object.keys(v.fixes).forEach(function(p){fixCount[v.fixes[p]]=(fixCount[v.fixes[p]]||0)+1});
    var seenV={},hero=[];core.slice().sort(function(a,b){return (fixCount[b.id]||0)-(fixCount[a.id]||0)||(b.end-b.start)-(a.end-a.start)}).forEach(function(c){if(hero.length<4&&!seenV[c.viz]){seenV[c.viz]=1;hero.push({id:c.id,name:c.name,viz:c.viz,lane:'core',start:c.start,end:c.end,members:[c.id]})}else{var h=hero.filter(function(x){return x.viz===c.viz})[0]||hero[hero.length-1];if(h){h.members.push(c.id);h.start=Math.min(h.start,c.start);h.end=Math.max(h.end,c.end)}}});
    if(!hero.length){var any=all.filter(function(c){return c.lane!=='plan'})[0]||all[0];hero.push({id:any.id,name:any.name,viz:any.viz==='scan'?'service':any.viz,lane:'core',start:any.start,end:any.end,members:[any.id]})}
    var outc=all.filter(function(c){return c.lane==='outcome'});if(outc.length)hero.push({id:outc[0].id,name:outc[0].name,viz:outc[0].viz,lane:'outcome',start:Math.min.apply(null,outc.map(function(c){return c.start})),end:Math.max.apply(null,outc.map(function(c){return c.end})),members:outc.map(function(c){return c.id})});
    var asr=all.filter(function(c){return c.lane==='assure'}),zone=asr.length?{start:Math.min.apply(null,asr.map(function(c){return c.start})),end:Math.max.apply(null,asr.map(function(c){return c.end})),names:asr.map(function(c){return c.name})}:null;
    var modOf={};hero.forEach(function(h,i){h.members.forEach(function(id){modOf[id]=i})});
    var today=v.today.slice(0,3),idx={};today.forEach(function(t,i){t.problems.forEach(function(p){if(idx[p]==null)idx[p]=i})});
    var slots={},problems=bp.problems.map(function(p){var ti=idx[p.problem_id]!=null?idx[p.problem_id]:(today.length?0:-1),s=slots[ti]||0;slots[ti]=s+1;var f=v.fixes[p.problem_id];return {id:p.problem_id,label:p.description,stated:p.source==='stated',today:ti,slot:s,fix:f!=null&&modOf[f]!=null?modOf[f]:(byId[f]&&byId[f].lane==='assure'?-2:0)}});
    var edges=[],seen={};v.edges.forEach(function(e){var a=e[0].charAt(0)==='T'?(+e[0].slice(1)<3?e[0]:null):(modOf[e[0]]!=null?'M'+modOf[e[0]]:null),b=modOf[e[1]]!=null?'M'+modOf[e[1]]:null;if(a&&b&&a!==b&&!seen[a+b]){seen[a+b]=1;edges.push([a,b])}});
    var comps=hero.map(function(h,i){return {id:'M'+i,name:h.name,viz:h.viz,lane:h.lane,start:h.start,end:h.end}});
    var days=Math.max.apply(null,all.map(function(c){return c.end}).concat([1]));
    var ms=bp.delivery.milestones.filter(function(m){return /Architecture|Go-live|Handover|Release/.test(m.name)}).map(function(m){return {label:m.name,day:m.week*5,live:m.name==='Go-live'}});
    return {today:today,comps:comps,edges:edges,problems:problems,gates:v.gates.slice(0,2),days:days,milestones:ms,zone:zone};
  }
  function stagesOf(bp){
    var groupOf={},out=[];STAGES.forEach(function(s){s[1].forEach(function(ph){groupOf[ph]=s[0]})});
    STAGES.forEach(function(s){var ps=bp.phases.filter(function(p){return s[1].indexOf(p.phase_id)>-1});if(!ps.length)return;
      var ag={};bp.activities.forEach(function(a){if(groupOf[a.phase_id]===s[0]&&a.assigned_agent)ag[a.assigned_agent]=1});
      out.push({name:s[0],a:Math.min.apply(null,ps.map(function(p){return p.start_day}))/5,b:Math.max.apply(null,ps.map(function(p){return p.end_day}))/5,agents:Object.keys(ag).length})});
    return out;
  }
  function list(items,n){if(items.length<=n)return '<ul class="bh-ls">'+items.join('')+'</ul>';return '<ul class="bh-ls">'+items.slice(0,n).join('')+'<li class="bh-more" hidden>'+items.slice(n).join('</li><li class="bh-more" hidden>').replace(/^<li>|<\/li>$/g,'')+'</li></ul><button type="button" class="bh-all">Show all '+items.length+'</button>'}
  function holoPanels(bp,S,start){
    var R=bp.project,D=R.estimated_duration,v=bp.visual,fixBy={};
    Object.keys(v.fixes).forEach(function(p){(fixBy[v.fixes[p]]=fixBy[v.fixes[p]]||[]).push(p)});
    var plabel={};bp.problems.forEach(function(p){plabel[p.problem_id]=p.description});
    var probs=bp.problems.map(function(p){return '<li><b>'+bpesc(p.description)+'</b>'+(p.source==='stated'?'':' <em class="bh-as">our assumption</em>')+'<span>'+bpesc(p.operational_consequence)+'.</span></li>'});
    var comps=v.components.filter(function(c){return c.lane!=='plan'}).map(function(c){var f=(fixBy[c.id]||[]).map(function(p){return plabel[p].toLowerCase()});return '<li><b>'+bpesc(c.name)+'</b>'+(f.length?'<span>Fixes: '+bpesc(f.join('; '))+'</span>':'')+'</li>'});
    var st=stagesOf(bp),gl=v.gates.map(function(g){return g.label.toLowerCase()});
    var rows=st.map(function(s){return '<li class="bh-row"><b>'+s.name+'</b><span>'+wk(s.a,s.b)+'</span><em>'+s.agents+' agent'+(s.agents===1?'':'s')+'</em></li>'}).join('');
    var opts=nextMondays().map(function(d,i){return '<option value="'+new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)+'"'+(i===1?' selected':'')+'>'+fmt(d)+'</option>'}).join('');
    var ms=bp.delivery.milestones.map(function(m){return '<li class="bh-row"><b>'+bpesc(m.name)+'</b><span data-ms="'+m.week+'">Week '+Math.max(1,Math.round(m.week))+'</span></li>'}).join('');
    var met=bp.business_impact.measurable_metrics.slice(0,2).map(function(m){return '<li>'+bpesc(m.metric)+'</li>'}).join('');
    return [
      '<span class="bh-k">What we heard</span><h3 class="bh-t">'+bp.problems.length+' problem'+(bp.problems.length===1?'':'s')+' to solve</h3>'+list(probs,3)+'<p class="bh-hint">Amber markers are problems. Dashed ones are our assumptions, to confirm.</p>',
      '<span class="bh-k">The solution</span><h3 class="bh-t">'+bpesc(R.proposed_solution)+'</h3><p class="bh-n bh-sum">'+bpesc(bp.solution.summary.split('. ')[0].replace(/\.$/,''))+'.</p>'+prod(R.related_product)+list(comps,4),
      '<span class="bh-k">How we build it</span><h3 class="bh-t">Agents build, engineers review</h3><ul class="bh-ls bh-rows">'+rows+'</ul><p class="bh-n">Agents carry out '+bp.automation.coverage_percentage+'% of the work. An engineer reviews every change'+(gl.length?' and signs off at '+bpesc(gl.join(', ')):'')+'.</p>',
      '<span class="bh-k">By when</span><h3 class="bh-t">Live in about <b id="bpwk">'+D.minimum_weeks+'</b>–'+D.maximum_weeks+' weeks</h3><label class="bh-start">If we start on <select id="bpStart">'+opts+'</select></label><ul class="bh-ls bh-rows">'+ms+'</ul><p class="bh-n"><b>Measure:</b></p><ul class="bh-ls">'+met+'</ul>'+
        '<div class="bh-cta"><b>Share it with your team</b><span>We email you the 3D blueprint link, a one-page brief and the full plan, ready to forward.</span><button type="button" class="btn pri" data-take="1"><span>Email me this blueprint</span><span class="arrow">&rarr;</span></button></div>'
    ];
  }
  /* when the problem is one our own products solve, say so */
  function prod(name){
    var P={Allocivo:['allocivo','Allocivo already does this for hotels: live room turns, staff assignment and supervisor approvals.'],Xessly:['xessly','Xessly already does this: AI agents find, fix and verify accessibility issues.']}[name];
    return P?'<a class="bh-prod" href="#/'+P[0]+'"><b>We already built this</b><span>'+bpesc(P[1])+'</span><em>See '+bpesc(name)+' &rarr;</em></a>':'';
  }
  function widen(on){
    var grid=plan.parentNode,card=grid.firstElementChild;if(mob.matches||grid.classList.contains('is-wide')===on)return;
    var r0=plan.getBoundingClientRect();
    var flip=function(){var r1=plan.getBoundingClientRect();if(G2&&anim)G2.fromTo(plan,{x:r0.left-r1.left,width:r0.width},{x:0,width:r1.width,duration:.8,ease:'power3.inOut',clearProps:'width,transform'})};
    if(on){if(G2&&anim)G2.to(card,{autoAlpha:0,x:-40,duration:.3,ease:'power2.in',onComplete:function(){grid.classList.add('is-wide');flip()}});else grid.classList.add('is-wide')}
    else{grid.classList.remove('is-wide');flip();if(G2&&anim)G2.fromTo(card,{autoAlpha:0,x:-40},{autoAlpha:1,x:0,duration:.55,delay:.35,ease:'power3.out',clearProps:'opacity,visibility,transform'});else{card.style.opacity='';card.style.visibility=''}}
  }
  function revealHolo(bp,t){
    var pend=window.BYPending;window.BYPending=null;var S=modelSpec(bp),R=bp.project,D=R.estimated_duration,start=pend&&pend.start?new Date(pend.start+'T00:00:00'):nextMondays()[1],panels=holoPanels(bp,S,start),view=0;
    holo={bp:bp,t:t,S:S,start:start};
    var lab='';
    S.today.forEach(function(x,i){lab+='<span class="bh-l bh-td'+(x.source==='stated'?'':' dash')+'" data-k="t'+i+'">'+bpesc(x.label)+(x.source==='confirm'?' <i>to confirm</i>':'')+'</span>'});
    S.problems.forEach(function(p,i){lab+='<span class="bh-l bh-p'+(p.stated?'':' dash')+'" data-k="p'+i+'">'+bpesc(p.label)+'</span>'});
    S.comps.forEach(function(c,i){lab+='<span class="bh-l bh-c" data-k="c'+i+'">'+bpesc(c.name)+'</span>'});
    S.gates.forEach(function(g,i){lab+='<span class="bh-l bh-g" data-k="g'+i+'">&#10003; '+bpesc(g.label)+'</span>'});
    S.milestones.forEach(function(m,i){lab+='<span class="bh-l bh-m'+(m.live?' bh-live':'')+'" data-k="m'+i+'"><b>'+bpesc(m.label)+'</b><em data-msd="'+m.day+'"></em></span>'});
    if(S.zone)lab+='<span class="bh-l bh-z" data-k="z">Checks on every change</span>';
    lab+='<span class="bh-l bh-w" data-k="w">Week 1</span>';
    bres.innerHTML='<div class="bh-labels" aria-hidden="true">'+lab+'</div><div class="bh-top"><span class="tag bh-tag">Your blueprint</span><button type="button" class="bh-edit">&larr; Edit brief</button><button type="button" class="bh-send" data-take="1">Email me this blueprint</button></div>'+
      '<div class="bh-panel" tabindex="-1"><button type="button" class="bh-replay" aria-label="Replay this chapter">&#8635; Replay</button><div class="bh-body">'+panels[0]+'</div></div>'+
      '<div class="bh-nav"><button type="button" class="bres-a" data-d="-1" aria-label="Previous chapter">&#8592;</button><div class="bh-tabs" role="tablist">'+CH.map(function(c,i){return '<button type="button" role="tab" aria-selected="'+(i?'false':'true')+'"><i>'+(i+1)+'</i><span class="tl">'+c+'</span><span class="ts" aria-hidden="true">'+['Heard','Solution','Build','When'][i]+'</span></button>'}).join('')+'</div><button type="button" class="bres-a" data-d="1" aria-label="Next chapter">&#8594;</button></div>'+
      '<span class="bh-drag">Drag to rotate</span>';
    bres.classList.add('holo');bres.dataset.view='0';bres.hidden=false;budEl.classList.add('is-holo');
    var panel=$('.bh-panel',bres),body=$('.bh-body',panel),tabs=$$('.bh-tabs button',bres),labels={};$$('.bh-l',bres).forEach(function(l){labels[l.dataset.k]=l});
    widen(true);bud.planFrame(null);bud.showPlan(S);bud.setChapter(0);setS('present');bsay(null,'Here\'s what I heard.');track('bp_ch1');
    live.textContent='Blueprint ready: '+R.proposed_solution+', live in about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks. Four chapters: what we heard, the solution, how we build it, and by when.';
    function dates(){var sel=$('#bpStart',panel);if(sel&&sel.value)start=new Date(sel.value+'T00:00:00');if(holo)holo.start=start;
      $$('[data-ms]',panel).forEach(function(e){e.textContent=fmt(addWorkDays(start,+e.dataset.ms*5))});
      $$('[data-msd]',bres).forEach(function(e){e.textContent=fmt(addWorkDays(start,+e.dataset.msd))})}
    function bind(){
      $$('.bh-all',panel).forEach(function(b){b.onclick=function(){$$('.bh-more',b.parentNode).forEach(function(l){l.hidden=false});b.remove()}});
      var sel=$('#bpStart',panel);if(sel){var iso=new Date(start.getTime()-start.getTimezoneOffset()*60000).toISOString().slice(0,10);sel.value=iso;if(sel.value!==iso){var o=document.createElement('option');o.value=iso;o.textContent=fmt(start);sel.insertBefore(o,sel.firstChild);sel.value=iso}sel.onchange=function(){dates();track('bp_start_date')}}
      $$('[data-take]',bres).forEach(function(b){b.onclick=function(){openTake()}});
      dates();
    }
    function go(i,replay){
      i=Math.max(0,Math.min(3,i));if(i===view&&!replay)return;view=i;bud.setChapter(i,replay);bres.dataset.view=String(i);
      tabs.forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
      if(!replay){var swap=function(){body.innerHTML=panels[i];bind()};
        if(G2&&anim){G2.to(body,{autoAlpha:0,y:10,duration:.18,overwrite:true,onComplete:function(){swap();G2.fromTo(body,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.45,ease:'power3.out'})}})}else swap();
        bsay(null,['Here\'s what I heard.','Here\'s how we\'d solve it.','Watch my agents build it.','And here\'s when it goes live!'][i]);track('bp_ch'+(i+1))}
    }
    holo.go=go;
    $$('.bres-a',bres).forEach(function(b){b.onclick=function(){go(view+(+b.dataset.d))}});
    tabs.forEach(function(b,i){b.onclick=function(){go(i)}});
    $('.bh-replay',panel).onclick=function(){go(view,true)};
    $('.bh-edit',bres).onclick=function(){reset(true);setTimeout(function(){ta.focus()},anim?950:0)};
    holo.key=function(e){if(!holo||e.target.closest('input,textarea,select'))return;if(e.key==='ArrowRight'){go(view+1);e.preventDefault()}if(e.key==='ArrowLeft'){go(view-1);e.preventDefault()}};
    node.addEventListener('keydown',holo.key);
    bind();
    if(G2&&anim){G2.fromTo(panel,{autoAlpha:0,x:-20},{autoAlpha:1,x:0,duration:.7,delay:.6,ease:'power3.out'});G2.from($('.bh-nav',bres),{autoAlpha:0,y:12,duration:.6,delay:.9})}
    /* labels follow the 3D model; only the current chapter's labels show, and they never collide */
    var sc=$('#budCanvas'),sz={},wl=labels.w;
    function vis(k,p){var c=k.charAt(0),n=+k.slice(1);if(c==='t')return false;if(c==='p')return view===0;if(c==='c')return (view===1&&n<2&&sc.clientWidth>=600)||(view===2&&p.building)||bud.hover===n;if(c==='z')return view===1&&p.shown;if(c==='g')return false;if(c==='m')return view===3&&p.shown&&!!(S.milestones[n]||{}).live;if(c==='w')return view===2;return false}
    (function loop(){if(!holo)return;raf=requestAnimationFrame(loop);var a=bud.anchors();if(!a)return;
      if(view===2&&wl)wl.textContent='Week '+Math.max(1,Math.ceil(bud.day()/5));
      var placed=[],yr=bud.yardieRect&&bud.yardieRect();if(yr)placed.push(yr);
      a.filter(function(p){return labels[p.k]&&p.z<1}).map(function(p){p.v=vis(p.k,p);return p}).sort(function(p,q){return (q.v?1:0)-(p.v?1:0)||p.x-q.x}).forEach(function(p){
        var l=labels[p.k];l.classList.toggle('on',p.v);l.classList.toggle('ok',!!p.fixed||!!p.built);
        if(!sz[p.k]||!sz[p.k].w)sz[p.k]={w:l.offsetWidth,h:l.offsetHeight};var w=sz[p.k].w,h=sz[p.k].h,x=p.x,y=p.y,dn=!!p.below;
        var CW=sc.clientWidth,top0=CW<600?78:8;x=Math.max(w/2+6,Math.min(CW-w/2-6,x));if(!dn)y=Math.max(h+top0,y);
        if(p.v){for(var n=0;n<8;n++){var hit=false,top=dn?y+6:y-h,bot=dn?y+6+h:y;for(var i=0;i<placed.length;i++){var r=placed[i];if(x-w/2<r[2]+4&&x+w/2>r[0]-4&&top<r[3]+3&&bot>r[1]-3){hit=true;if(r===yr)x=r[0]-6-w/2;else y=dn?r[3]+3-6:r[1]-3;break}}if(!hit)break}placed.push([x-w/2,dn?y+6:y-h,x+w/2,dn?y+6+h:y])}
        l.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,'+(dn?'6px':'-100%')+')'})})();
    var down=null;
    hv=function(e){var r=sc.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width*2-1,ny=-((e.clientY-r.top)/r.height*2-1);
      if(down!==null&&e.pointerType!=='touch'){bud.dragBy(e.clientX-down);down=e.clientX;sc.style.cursor='grabbing';return}
      var h=bud.hoverAt(nx,ny);sc.style.cursor=h>-1?'pointer':'grab'};
    sc.addEventListener('pointermove',hv);
    sc.onpointerdown=function(e){if(e.pointerType==='touch')return;down=e.clientX;try{sc.setPointerCapture(e.pointerId)}catch(x){}};
    sc.onpointerup=sc.onpointercancel=function(){down=null;sc.style.cursor='grab'};
    setTimeout(function(){panel.focus({preventScroll:true})},anim?1000:0);
  }
  function hideHolo(){
    if(!holo)return;cancelAnimationFrame(raf);if(holo.key)node.removeEventListener('keydown',holo.key);holo=null;var sc=$('#budCanvas');if(hv)sc.removeEventListener('pointermove',hv);sc.onpointerdown=sc.onpointerup=sc.onpointercancel=null;sc.style.cursor='';
    if(bud){bud.hidePlan();bud.planFrame(null)}bres.classList.remove('holo');budEl.classList.remove('is-holo');widen(false);
  }
  function track(n){try{if(window.BYTrack)window.BYTrack(n)}catch(e){}}
  function openTake(){if(window.BYTake)window.BYTake(holo);else if(holo&&holo.go)holo.go(3)}
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
if(!$('#bbtn'))return;
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
  try{if(localStorage.getItem('by-keys')==='off')return}catch(x){}
  var k=e.key.toLowerCase();
  if(k==='g'){setGL(!glOpen);return}
  if(glOpen){if(/^[1-9]$/.test(e.key))choose(PAGES[+e.key-1][0]);return}
  if(k==='b'&&fine)setBP(!on);
});

if(fine&&!wasSeen()){setTimeout(function(){if(!wasSeen()&&!glOpen&&!on)say('New: press <b>B</b> to see how this page is built, or <b>G</b> for the yard menu.',9000)},6000)}
})();

}catch(e){console.error(e)}
try{
/* ---------- blueprint lead flow: share link, printable brief, "take it to your team", review request, counts ---------- */
(function(){
var B=window.BYBrief;if(!B)return;
var $=function(s,r){return (r||document).querySelector(s)};
var esc=B.esc,API=SITE.api!==false;
function coarse(){return matchMedia('(pointer:coarse)').matches}

/* a shared plan link opens straight into the generator and runs the brief */
var pend=B.readLink(location.hash);
if(pend){window.BYPending=pend;try{history.replaceState(null,'',location.pathname+location.search+'#/home/bpgen')}catch(e){location.hash='#/home/bpgen'}}

/* privacy-friendly counts: an event name only, no cookies, no ids */
var EV={bp_ch1:1,bp_ch2:1,bp_ch3:1,bp_ch4:1,bp_start_date:1,bp_take_open:1,bp_pack:1,bp_review:1,bp_share_copy:1,bp_print:1,bp_shared_open:1,bp_menu_brief:1};
window.BYTrack=function(name){
  if(!API||!EV[name]||/^(localhost|127\.)/.test(location.hostname))return;
  try{var d=JSON.stringify({e:name});if(!(navigator.sendBeacon&&navigator.sendBeacon('/api/event',new Blob([d],{type:'application/json'}))))fetch('/api/event',{method:'POST',body:d,headers:{'Content-Type':'application/json'},keepalive:true}).catch(function(){})}catch(e){}
};

function startISO(h){var d=h&&h.start;if(!d)return '';var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)}
function shareLink(h){return B.link(location.href,h.t,startISO(h))}

/* printable one-page brief */
function printBrief(h){
  var M=B.model(h.bp,startISO(h)),box=$('#bp-print');
  if(!box){box=document.createElement('div');box.id='bp-print';document.body.appendChild(box)}
  box.innerHTML=B.onePage(M,shareLink(h));
  document.documentElement.classList.add('printing-bp');
  var done=function(){document.documentElement.classList.remove('printing-bp');window.removeEventListener('afterprint',done)};
  window.addEventListener('afterprint',done);setTimeout(function(){window.print();setTimeout(done,1500)},60);
  BYTrack('bp_print');
}
function copy(text,btn){
  var ok=function(){var o=btn.textContent;btn.textContent='Link copied';btn.classList.add('ok');setTimeout(function(){btn.textContent=o;btn.classList.remove('ok')},1800)};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(ok,function(){prompt('Copy this link',text)});else{prompt('Copy this link',text)}
  BYTrack('bp_share_copy');
}
function post(url,data){
  if(!API)return Promise.reject(new Error('offline'));
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)}).then(function(r){
    return r.json().catch(function(){return {}}).then(function(j){if(!r.ok){var e=new Error(j.error||r.status);e.code=j.error;e.status=r.status;throw e}return j})});
}

/* the dialog: step 1 email for the pack, step 2 optional engineer review */
var dlg,cur,lastEmail='',leadId='';
function build(){
  dlg=document.createElement('dialog');dlg.className='bpd';dlg.setAttribute('aria-labelledby','bpdT');
  dlg.innerHTML='<button type="button" class="bpd-x" aria-label="Close">&times;</button><div class="bpd-b"></div>';
  document.body.appendChild(dlg);
  $('.bpd-x',dlg).onclick=function(){dlg.close()};
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  dlg.addEventListener('close',function(){document.documentElement.classList.remove('bpd-open');if(cur&&cur.ret)try{cur.ret.focus({preventScroll:true})}catch(e){}});
}
function tools(){
  return '<div class="bpd-tools"><button type="button" class="bpd-t" data-a="copy">Copy share link</button><button type="button" class="bpd-t" data-a="print">Print one-page brief</button></div>';
}
function bindTools(){
  var h=cur.h;[].forEach.call(dlg.querySelectorAll('.bpd-t'),function(b){b.onclick=function(){if(b.dataset.a==='copy')copy(shareLink(h),b);else printBrief(h)}});
}
function field(id,label,type,extra){return '<label class="bpd-f" for="'+id+'"><span>'+label+'</span><input id="'+id+'" name="'+id.replace('bpd-','')+'" type="'+type+'" '+(extra||'')+'><em class="bpd-e" id="'+id+'-e"></em></label>'}
function hp(){return '<label class="bpd-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>'}
function step1(){
  var h=cur.h,M=B.model(h.bp,startISO(h));
  $('.bpd-b',dlg).innerHTML='<span class="bpd-k">Share it with your team</span><h3 id="bpdT" tabindex="-1">Email me this blueprint</h3>'+
    '<p class="bpd-n">For <b>'+esc(M.title)+'</b>, live in about '+M.minW+'–'+M.maxW+' weeks.</p>'+
    '<ul class="bpd-what"><li><b>3D blueprint link</b><span>Opens this model for anyone you share it with</span></li><li><b>One-page brief</b><span>Problem, solution, how and by when, ready to forward</span></li><li><b>Full plan</b><span>Outcomes, measures, team, assumptions and watch-outs</span></li></ul>'+
    '<form class="bpd-form" novalidate>'+field('bpd-email','Work email','email','autocomplete="email" required inputmode="email" placeholder="you@company.com"')+hp()+
    '<button class="btn pri bpd-go" type="submit"><span>Email it to me</span><span class="arrow">&rarr;</span></button>'+
    '<p class="bpd-fine">One email with your blueprint. We may follow up once. No mailing list. <a href="#/privacy" class="ul-link">Privacy</a></p><p class="bpd-msg" role="status"></p></form>'+tools();
  bindTools();
  var f=$('form',dlg),em=$('#bpd-email',dlg);if(lastEmail)em.value=lastEmail;
  em.addEventListener('input',function(){$('#bpd-email-e',dlg).textContent=''});
  f.onsubmit=function(e){e.preventDefault();var v=em.value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){$('#bpd-email-e',dlg).textContent='Enter a valid email.';em.focus();return}
    var btn=$('.bpd-go',f);btn.disabled=true;btn.firstChild.textContent='Sending…';
    post('/api/blueprint',{email:v,brief:h.t,start:startISO(h),website:f.website.value}).then(function(j){
      lastEmail=v;leadId=j.id||'';BYTrack('bp_pack');step2(v);
    }).catch(function(err){btn.disabled=false;btn.firstChild.textContent='Email it to me';fallback(f,err)});
  };
  setTimeout(function(){(coarse()?$('#bpdT',dlg):em).focus()},60);
}
function fallback(f,err){
  var h=cur.h,M=B.model(h.bp,startISO(h)),m=$('.bpd-msg',f),c=SITE.contactEmail;
  if(err&&err.code==='rate_limited'){m.innerHTML='Too many requests from this network. Try again in a little while, or use the link and printout below.';m.className='bpd-msg bad';return}
  if(err&&err.code==='bad_email'){$('#bpd-email-e',dlg).textContent='Enter a valid email.';return}
  var body=encodeURIComponent(B.text(M,shareLink(h)));
  m.innerHTML='We couldn\'t send email just now. You can still copy the share link or print the brief below, or <a class="ul-link" href="mailto:'+esc(c)+'?subject='+encodeURIComponent('Blueprint: '+M.title)+'&body='+body+'">email it to our team</a>.';
  m.className='bpd-msg bad';
}
var ROLES=['Founder or CEO','CTO or engineering lead','Product or operations lead','IT or platform team','Other'],WHEN=['Within a month','In 1 to 3 months','In 3 to 6 months','Just exploring'];
function sel(id,label,opts){return '<label class="bpd-f" for="'+id+'"><span>'+label+'</span><select id="'+id+'" name="'+id.replace('bpd-','')+'"><option value="">Choose…</option>'+opts.map(function(o){return '<option>'+esc(o)+'</option>'}).join('')+'</select><em class="bpd-e" id="'+id+'-e"></em></label>'}
function step2(email){
  $('.bpd-b',dlg).innerHTML='<div class="bpd-ok"><span class="bpd-tick">&#10003;</span><div><b>On its way to '+esc(email)+'</b><span>Check your inbox in a minute. Forward it to anyone on your team.</span></div></div>'+
    '<span class="bpd-k">Optional</span><h3 id="bpdT" tabindex="-1">Have an engineer check it</h3><p class="bpd-n">A senior engineer reviews your blueprint against your systems and replies within one business day. No sales call unless you ask.</p>'+
    '<form class="bpd-form" novalidate><div class="bpd-2">'+field('bpd-name','Your name','text','autocomplete="name" required')+field('bpd-company','Company','text','autocomplete="organization" required')+'</div>'+
    '<div class="bpd-2">'+sel('bpd-role','Your role',ROLES)+sel('bpd-timing','When would you start?',WHEN)+'</div>'+hp()+
    '<button class="btn pri bpd-go" type="submit"><span>Ask for a review</span><span class="arrow">&rarr;</span></button><button type="button" class="bpd-skip">No thanks, I\'m done</button><p class="bpd-msg" role="status"></p></form>'+tools();
  bindTools();
  var f=$('form',dlg);$('.bpd-skip',f).onclick=function(){dlg.close()};
  f.addEventListener('input',function(e){var x=$('#'+e.target.id+'-e',dlg);if(x)x.textContent=''});
  f.addEventListener('change',function(e){var x=$('#'+e.target.id+'-e',dlg);if(x)x.textContent=''});
  f.onsubmit=function(e){e.preventDefault();var d={},first=null;
    [['name','Enter your name.'],['company','Enter your company.'],['role','Choose your role.'],['timing','Choose a timing.']].forEach(function(q){var el=f[q[0]],v=el.value.trim();d[q[0]]=v;if(!v){$('#bpd-'+q[0]+'-e',dlg).textContent=q[1];first=first||el}});
    if(first){first.focus();return}
    var h=cur.h,btn=$('.bpd-go',f);btn.disabled=true;btn.firstChild.textContent='Sending…';
    d.email=email;d.brief=h.t;d.start=startISO(h);d.id=leadId;d.website=f.website.value;
    post('/api/blueprint/review',d).then(function(){BYTrack('bp_review');
      $('.bpd-b',dlg).innerHTML='<div class="bpd-done"><span class="bpd-tick big">&#10003;</span><h3 id="bpdT">Review requested</h3><p class="bpd-n">Thanks, '+esc(d.name)+'. A senior engineer will reply to '+esc(email)+' within one business day.</p><button type="button" class="btn out bpd-close">Back to my blueprint</button></div>';
      $('.bpd-close',dlg).onclick=function(){dlg.close()};$('.bpd-close',dlg).focus();
    }).catch(function(){btn.disabled=false;btn.firstChild.textContent='Ask for a review';var m=$('.bpd-msg',f);m.className='bpd-msg bad';
      m.innerHTML='We couldn\'t send that. Please try again, or email <a class="ul-link" href="mailto:'+esc(SITE.contactEmail)+'">'+esc(SITE.contactEmail)+'</a>.'});
  };
  setTimeout(function(){(coarse()?$('#bpdT',dlg):$('#bpd-name',dlg)).focus()},60);
}
window.BYTake=function(h){
  if(!h||!h.bp)return;if(!dlg)build();
  cur={h:h,ret:document.activeElement};
  if(lastEmail&&leadId)step2(lastEmail);else step1();
  document.documentElement.classList.add('bpd-open');
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
  BYTrack('bp_take_open');
};

/* run a brief once the generator is ready: from a shared link, or from Yardie in the menu */
function runBrief(p,ev){
  window.BYPending=p;
  var tries=0,edited=false;(function wait(){
    var ta=$('#bpt'),go=$('#bpgo'),bud=$('#bud'),edit=$('.bres.holo .bh-edit');
    if(!ta||!go){if(++tries<60)setTimeout(wait,200);return}
    if(edit&&!edited){edited=true;edit.click();setTimeout(wait,1100);return}
    if(bud&&!bud.classList.contains('is-live')&&++tries<25){setTimeout(wait,200);return}
    ta.value=p.brief;ta.dispatchEvent(new Event('input',{bubbles:true}));
    setTimeout(function(){go.click();BYTrack(ev)},500);
  })();
}
window.BYRunBrief=function(text){
  var t=String(text||'').trim().slice(0,4000);if(t.length<4)return;
  if(location.hash!=='#/home/bpgen')location.hash='#/home/bpgen';
  setTimeout(function(){runBrief({brief:t,start:''},'bp_menu_brief')},400);
};
if(pend)runBrief(pend,'bp_shared_open');
})();

}catch(e){console.error(e)}
try{
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

}catch(e){console.error(e)}
try{
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

}catch(e){console.error(e)}
try{
/* ---------- mega menu: service previews and Yardie, who routes a one-line brief ---------- */
(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var panel=$('#mm-services');if(!panel)return;
var links=$$('.mml1 a[data-svc]',panel),pv=$('#svPrev'),bub=$('#yrBub'),inp=$('#yrIn'),form=$('#yrF'),bot=$('.yr-bot',panel);
function esc(s){return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}

var SVC={
  eng:{n:'Product engineering',fit:'You need a product built or rebuilt, with one team from design to launch.',get:'Working software every two weeks, in your repositories.',tags:['Web and mobile apps','APIs and integrations','Legacy in safe slices'],st:['Discovery sprint','2 weeks']},
  cloud:{n:'Cloud and DevOps',fit:'Releases are risky, outages hurt, or the cloud bill keeps surprising you.',get:'A pipeline you trust and a written cost and risk report.',tags:['Cloud migration','CI/CD pipelines','Cost control'],st:['Cloud cost review','1 week']},
  data:{n:'Data and AI',fit:'An AI pilot stalled before production, or nobody trusts the data.',get:'A working feature with its evaluation set and monitoring.',tags:['Data pipelines','Dashboards','Generative AI'],st:['Discovery sprint','2 weeks']},
  a11y:{n:'Accessibility and quality',fit:'An audit, a tender or a complaint, or you want your product to work for everyone.',get:'A prioritised report, fixes in your code and a re-test of every fix.',tags:['WCAG reviews','Fixes in your code','Screen reader testing'],st:['Accessibility review','10 working days']},
  sec:{n:'Security and support',fit:"You need a live system kept safe and running, or support isn't keeping up.",get:'Clear SLAs, a named team and a runbook for every critical system.',tags:['Hardening','Incident readiness','24/7 monitoring'],st:['Architecture review','10 working days']}
};
/* engine categories to the service that delivers them */
var MAP={sw:'eng',legacy:'eng',integ:'eng',ent:'eng',cloud:'cloud',infra:'cloud',data:'data',ai:'data',a11y:'a11y',sec:'sec',msp:'sec'};
var PROD={Allocivo:['allocivo','Hotels? That\'s exactly what <b>Allocivo</b> does.'],Xessly:['xessly','That\'s what <b>Xessly</b> does: it finds, fixes and proves accessibility fixes.']};

function show(key,why){
  var S=SVC[key];links.forEach(function(a){a.classList.toggle('cur',a.dataset.svc===key)});
  if(!S){pv.innerHTML='<a class="sv-st sv-def" href="#/services/starters"><small>Start small</small><b>Fixed-price starters</b><span>Architecture, accessibility and cloud cost reviews, each with a written report you keep.</span></a>';return}
  pv.innerHTML='<div class="sv-c'+(why?' sv-m':'')+'"><b class="sv-n">'+esc(S.n)+'</b><p><em>Good fit if</em> '+esc(S.fit)+'</p><p><em>You get</em> '+esc(S.get)+'</p>'+
    '<ul>'+S.tags.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul></div>'+
    '<a class="sv-st" href="#/services/starters"><small>Start small</small><b>'+esc(S.st[0])+'</b><span>Fixed price &middot; '+esc(S.st[1])+' &rarr;</span></a>';
}
show(null);
var hoverKey=null,matchKey=null;
links.forEach(function(a){
  var on=function(){hoverKey=a.dataset.svc;show(hoverKey);look(a)};
  a.addEventListener('mouseenter',on);a.addEventListener('focus',on);
  a.addEventListener('mouseleave',function(){hoverKey=null;show(matchKey,!!matchKey);look(matchKey?$('[data-svc="'+matchKey+'"]',panel):null)});
});

/* Yardie looks at what it's talking about */
var eyes=bot&&bot.querySelector('.yr-eyes'),head=bot&&bot.querySelector('.yr-head');
function look(el){
  if(!eyes)return;
  if(!el){eyes.style.transform='';head.style.transform='';return}
  var b=bot.getBoundingClientRect(),r=el.getBoundingClientRect(),dx=(r.left+r.width/2)-(b.left+b.width/2),dy=(r.top+r.height/2)-(b.top+b.height/3);
  var d=Math.max(1,Math.hypot(dx,dy));eyes.style.transform='translate('+(dx/d*3).toFixed(1)+'px,'+(dy/d*2.4).toFixed(1)+'px)';
  head.style.transform='rotate('+Math.max(-8,Math.min(8,dx/40)).toFixed(1)+'deg)';
}

/* read the brief with the same engine as the generator */
var M=null;function master(){if(!M){try{M=JSON.parse($('#bp-master').textContent)}catch(e){M=null}}return M}
var t=null,DEF='Not sure which? Tell me in a sentence.';
function read(){
  var v=inp.value.trim();bot.classList.toggle('think',false);
  if(v.length<6){matchKey=null;bub.innerHTML=DEF;links.forEach(function(a){a.classList.remove('match')});show(hoverKey);look(null);return}
  var bp=null;try{if(window.BYEngine&&master())bp=BYEngine.generate(v,{},master())}catch(e){bp=null}
  links.forEach(function(a){a.classList.remove('match')});
  if(!bp||!bp.project.supported){matchKey=null;bub.innerHTML='Hmm. Tell me what isn\'t working, or what you want to build.';show(hoverKey);look(null);return}
  var prim=(bp.meta.classification[0]||{}).category,dom=null;
  (master().domains||[]).forEach(function(d){if(d.name===prim)dom=d.id});
  matchKey=MAP[dom]||'eng';var a=$('[data-svc="'+matchKey+'"]',panel);a.classList.add('match');
  var pr=PROD[bp.project.related_product];
  bub.innerHTML=pr?pr[1]+' <a href="#/'+pr[0]+'">See it &rarr;</a>':'Sounds like <b>'+esc(SVC[matchKey].n)+'</b>. Press Enter and I\'ll sketch the plan.';
  if(!hoverKey)show(matchKey,true);look(a);
}
inp.addEventListener('input',function(){clearTimeout(t);bot.classList.add('think');t=setTimeout(read,260)});
form.addEventListener('submit',function(e){
  e.preventDefault();var v=inp.value.trim();
  if(v.length<6){bub.innerHTML='A sentence is enough: what isn\'t working?';inp.focus();return}
  var m=panel.closest('.mm');if(m){m.classList.remove('open');var b=$('.mmb',m);if(b)b.setAttribute('aria-expanded','false');var h=$('#hdr');if(h)h.classList.remove('mm-on')}
  inp.blur();if(window.BYRunBrief)window.BYRunBrief(v);
});

/* product cards: the numbered steps light up with the demo they describe */
$$('.pp').forEach(function(card){
  var ui=card.querySelector('.aui,.xui'),steps=$$('.pp-steps li',card),now=card.querySelector('.pp-now');if(!ui||!steps.length)return;
  var sync=function(){var st=+ui.dataset.state||0,held=ui._hold>Date.now();card.classList.toggle('held',held);
    steps.forEach(function(li){var k=+li.dataset.s,b=li.querySelector('button');li.classList.toggle('on',k===st);li.classList.toggle('done',k<st);if(b)b.setAttribute('aria-pressed',k===st);
      if(ui._dur)li.style.setProperty('--sd',ui._dur[k]+'ms')});
    var cur=steps.filter(function(li){return +li.dataset.s===Math.max(1,st)})[0];if(now&&cur&&now.textContent!==cur.dataset.d){now.textContent=cur.dataset.d;now.classList.remove('fresh');void now.offsetWidth;now.classList.add('fresh')}};
  steps.forEach(function(li){var b=li.querySelector('button');if(b)b.addEventListener('click',function(){if(ui._go)ui._go(+li.dataset.s);sync();clearTimeout(card._ht);card._ht=setTimeout(sync,7100)})});
  new MutationObserver(sync).observe(ui,{attributes:true,attributeFilter:['data-state']});sync();
});
})();

}catch(e){console.error(e)}