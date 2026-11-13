/* ===== Brightyard site settings: edit these before launch ===== */
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
