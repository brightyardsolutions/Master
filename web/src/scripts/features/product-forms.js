// Product site forms (Allocivo demo, Xessly early access): check required fields and post to /api/contact.
import { $, $$, esc } from '../lib/dom.js';
import { SITE } from '../lib/site.js';

export default function init() {
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
}
