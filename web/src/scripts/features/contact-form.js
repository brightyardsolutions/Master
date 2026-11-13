// Contact page form: checks the fields, posts to /api/contact, and says honestly when it could not send.
import { $, esc } from '../lib/dom.js';
import { SITE, take } from '../lib/site.js';

export default function init() {
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

/* a plan sent from the blueprint generator (on the home page) arrives with its summary filled in */
var handed=take('by-goal');
if(handed){$('#goal').value=handed;setTimeout(function(){var n=$('#name');if(n)n.focus({preventScroll:true})},900)}
}
