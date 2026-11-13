// Blueprint lead flow (home page): share links, the printable brief, "Email me this blueprint" and the optional
// engineer review, privacy-friendly counts, and running a brief handed over from a link or from Yardie in the menu.
import { $, fine, esc } from '../lib/dom.js';
import BYBrief from '../../lib/blueprint/brief.js';
import { SITE, href, take } from '../lib/site.js';
import { scrollToEl } from '../lib/scroll.js';

export default function init() {
var B=BYBrief;
var esc=B.esc,API=SITE.api!==false;
function coarse(){return matchMedia('(pointer:coarse)').matches}

/* a shared plan link opens straight into the generator and runs the brief */
var pend=B.readLink(location.hash);
if(pend){window.BYPending=pend;try{history.replaceState(null,'',location.pathname+location.search+'#bpgen')}catch(e){location.hash='#bpgen'}}

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
    '<p class="bpd-fine">One email with your blueprint. We may follow up once. No mailing list. <a href="'+href('privacy')+'" class="ul-link">Privacy</a></p><p class="bpd-msg" role="status"></p></form>'+tools();
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
  if(location.hash!=='#bpgen'){history.pushState(null,'',location.pathname+location.search+'#bpgen');var g=$('#bpgen');if(g)scrollToEl(g)}
  setTimeout(function(){runBrief({brief:t,start:''},'bp_menu_brief')},400);
};
if(pend)runBrief(pend,'bp_shared_open');
/* a brief typed to Yardie in the menu on another page (features/brief-handoff.js) */
var handed=take('by-brief');
if(handed&&!pend)runBrief({brief:handed,start:''},'bp_menu_brief');
}
