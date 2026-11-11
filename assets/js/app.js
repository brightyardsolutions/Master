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

/* ---------- 1. Brief to blueprint (rules engine: BYEngine + #bp-master) ---------- */
var BPM=null;
try{BPM=JSON.parse($('#bp-master').textContent)}catch(e){BPM=null}
function bpesc(s){return String(s==null?'':s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}
function detect(t){return BPM&&window.BYEngine?BYEngine.classify(t,BPM):[]}
window.BrightYardBlueprint={generate:function(t,o){return BYEngine.generate(t,o||{},BPM)},master:BPM,last:null};
var DOTS='<div class="bpe-d" aria-hidden="true"><i class="y"></i><i></i><i class="y"></i><i></i><i class="y"></i><i></i><i></i><i class="y"></i><i></i></div>';
var EMPTY='<div class="bpe">'+DOTS+'<p>Your blueprint will be drawn here.</p></div>';
var SCAN='<div class="bpe"><div class="bpscan" aria-hidden="true"><i></i></div><p>Reading your brief&hellip;</p></div>';
var STAGES=[['Understand','Discovery and assessment',['DISC','ASSESS']],['Design','Architecture and plan',['ARCH','PLAN']],['Build','Agents build, engineers review',['DEV','CONF','INTEG','MIGR']],['Prove','Testing and security',['SEC','TEST']],['Launch','Release and handover',['DEPLOY','HAND']],['Run','Monitoring after go-live',['MON']]];

var tpl=$('#bp-tpl'),home=$('#p-home');
if(tpl&&home){
  var node=tpl.content.firstElementChild.cloneNode(true),anchor=$('.logos',home);
  if(anchor)anchor.parentNode.insertBefore(node,anchor.nextSibling);else home.insertBefore(node,home.firstChild);
  $$('.bpu',node).forEach(function(el){el.classList.add('rv')});
  var ta=$('#bpt'),sig=$('#bpsig'),plan=$('#bpplan'),err=$('#bperr'),dt;
  plan.innerHTML=EMPTY;
  function showSig(){
    var d=detect(ta.value);
    sig.innerHTML=d.length?d.slice(0,4).map(function(c,i){return '<span class="bps" style="--i:'+i+'">'+bpesc(c.short)+'</span>'}).join(''):'<span class="bps0">Signals we pick up will appear here</span>';
  }
  ta.addEventListener('input',function(){err.textContent='';clearTimeout(dt);dt=setTimeout(showSig,140)});
  $$('.bpex button',node).forEach(function(b){b.addEventListener('click',function(){ta.value=b.dataset.ex;err.textContent='';showSig();ta.focus()})});
  $('#bpgo').addEventListener('click',function(){
    var t=ta.value.trim();
    if(t.length<8){err.textContent='Describe your challenge first. A sentence is enough.';ta.focus();return}
    if(!BPM||!window.BYEngine){err.textContent='The blueprint engine failed to load. Please refresh the page.';return}
    plan.innerHTML=SCAN;
    setTimeout(function(){build(t)},reduced?0:800);
  });
  function li(h){return '<li>'+h+'</li>'}
  function grp(title,items){return items.length?'<h4>'+title+'</h4><ul class="ul">'+items.join('')+'</ul>':''}
  function bindReset(){$('#bpreset').addEventListener('click',function(){plan.innerHTML=EMPTY;ta.value='';showSig();ta.focus()})}
  function build(t){
    var bp;try{bp=BYEngine.generate(t,{},BPM)}catch(e){bp=null}
    window.BrightYardBlueprint.last=bp;
    if(!bp){plan.innerHTML=EMPTY;err.textContent='Something went wrong drawing the blueprint. Please try again.';return}
    var P=bp.project;
    if(!P.supported){plan.innerHTML='<div class="bpe">'+DOTS+'<p>'+bpesc(P.message)+'</p></div><div class="bpa"><button class="btn out" id="bpreset" type="button">Start over</button></div>';bindReset();return}
    var D=P.estimated_duration,W=Math.max(1,Math.ceil(D.including_hypercare_days/5)),agents=bp.resources.agent_roles.length,people=bp.resources.human_roles.length;
    var h='<div class="bpph"><div><span class="tag">Indicative blueprint</span><h3>'+bpesc(P.proposed_solution)+'</h3></div></div>';
    h+='<div class="bpstats"><div><b><span id="bpwk">0</span> to '+D.maximum_weeks+'</b><span>weeks to first release</span></div><div><b>'+agents+' + '+people+'</b><span>agent roles + people</span></div><div><b>'+bpesc(P.complexity)+'</b><span>complexity</span></div></div>';
    h+='<p class="bpnote">'+bpesc(bp.solution.summary)+'</p>';
    if(P.ambiguous)h+='<p class="bpnote"><b>We need a little more.</b> This plan starts with a health check. Tell us which system, what happens and since when for a sharper plan.</p>';
    h+='<div class="bpax" aria-hidden="true"><span>Week 0</span><span>'+Math.round(W/2)+'</span><span>'+W+'</span></div><div class="bplist">';
    var k=0;
    STAGES.forEach(function(s){
      var ps=bp.phases.filter(function(p){return s[2].indexOf(p.phase_id)>-1});if(!ps.length)return;
      var a=Math.min.apply(null,ps.map(function(p){return p.start_day})),b=Math.max.apply(null,ps.map(function(p){return p.end_day}));
      var c=s[0]==='Run'?'ongoing':s[0]==='Launch'?'ms':'';
      h+='<div class="bpr" style="--i:'+(k++)+'"><div class="bpn"><b>'+s[0]+'</b><small>'+s[1]+'</small></div><div class="bpt"><span class="bpbar '+c+'" style="left:'+(a/5/W*100).toFixed(2)+'%;width:'+Math.max(2,(b-a)/5/W*100).toFixed(2)+'%"></span></div></div>';
    });
    h+='</div>';
    var probs=bp.problems.map(function(p){return li('<b>'+bpesc(p.description)+'</b>'+(p.source==='stated'?'':' (our assumption, to confirm)'))});
    var comps=bp.solution.components.map(function(c){return li(bpesc(c.name))});
    var ags=bp.agents.slice(1).map(function(a){return li('<b>'+bpesc(a.name)+':</b> '+bpesc(a.responsibilities.slice(0,3).join(', ').toLowerCase())+(a.responsibilities.length>3?' and more':'')+'.')});
    var ppl=bp.resources.human_roles.map(function(r){return li(bpesc(r))});
    var rk=bp.delivery.risks.slice(0,4).map(function(r){return li(bpesc(r.description)+'. <b>How we handle it:</b> '+bpesc(r.mitigation.charAt(0).toLowerCase()+r.mitigation.slice(1))+'.')});
    var out=bp.business_impact.expected_outcomes.slice(0,4).map(function(o){return li(bpesc(o.outcome))});
    h+='<details><summary>See the full plan</summary>'+grp('What we understood',probs)+grp('What we would build',comps)+grp('Agents on the work',ags)+grp('People who review and approve',ppl)+grp('Risks we would manage',rk)+grp('What should improve',out)+
      '<p class="bpnote">Delivered the traditional way, the same scope would take about '+bp.comparison.traditional.duration_weeks+' weeks. Every agent-written change is reviewed by an engineer.</p></details>';
    var prod=P.related_product;
    h+=(prod?'<p class="bpnote"><b>Related BrightYard product:</b> '+bpesc(prod)+'. <a class="ul-link" href="#/'+prod.toLowerCase()+'">See how it works</a></p>':'')+'<p class="bpnote">Indicative only. A discovery workshop confirms scope and timing.</p>';
    h+='<div class="bpa"><button class="btn pri" id="bpsend" type="button"><span>Send this plan to our team</span><span class="arrow">&rarr;</span></button><button class="btn out" id="bpreset" type="button">Start over</button></div>';
    plan.innerHTML=h;
    var wkEl=$('#bpwk'),launch=D.minimum_weeks;
    if(reduced){wkEl.textContent=launch}else{var st=null;(function f(ts){if(!st)st=ts;var p=Math.min((ts-st)/900,1);wkEl.textContent=Math.round(launch*p);if(p<1)requestAnimationFrame(f)})(performance.now())}
    if(window.ScrollTrigger)ScrollTrigger.refresh();
    $('#bpsend').addEventListener('click',function(){
      var g=$('#goal');
      if(g)g.value='Challenge: '+t+'\n\nIndicative blueprint: '+P.proposed_solution+', about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks, '+P.complexity.toLowerCase()+' complexity.';
      nav('contact');
      setTimeout(function(){var n=$('#name');if(n)n.focus({preventScroll:true})},1400);
    });
    bindReset();
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
      .from('.h3-hud .mini',{x:60,autoAlpha:0,duration:1,ease:'power3.out',stagger:.12},'-=.9')
      .from('.h3-scroll',{autoAlpha:0,duration:.8},'-=.4');
    G.to('.h3-in',{yPercent:-14,autoAlpha:0,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom 35%',scrub:true}});
  }
  loadScenes().then(function(S){
    if(!S){hero.classList.add('no3d');return}
    var sc=makeScene('hero','Hero',$('#hero-c'));
    if(!sc){hero.classList.add('no3d');return}
    sc.start();hero.classList.add('is-live');
    if(!hero._b){hero._b=1;
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
  var p=$('#seg-p'),t=$('#seg-b span');
  p.classList.add('sw');t.classList.add('sw');
  setTimeout(function(){p.textContent=seg[b.dataset.s][0];t.textContent=seg[b.dataset.s][1];p.classList.remove('sw');t.classList.remove('sw')},220);
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
