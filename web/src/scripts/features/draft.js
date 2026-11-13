// Draft or launch view: launch hides every section that still needs real data (data-draft) and the draft bar.
import { $ } from '../lib/dom.js';
import { SITE } from '../lib/site.js';

export default function init() {
/* ---------- draft / launch view ---------- */
var body=document.body,bar=$('#draftbar'),mbtn=$('#dmode');
function setMode(m){
  body.classList.toggle('launch',m==='launch');
  mbtn.textContent=m==='launch'?'Back to draft view':'Preview launch view';
  $('#dlabel').innerHTML=m==='launch'?'<b>Launch preview.</b> Sections that still need real data are hidden.':'<b>Draft preview.</b> Highlighted text needs real Brightyard data before launch.';
}
if(SITE.mode==='launch'){body.classList.add('launch');if(bar)bar.remove()}
else if(mbtn){mbtn.addEventListener('click',function(){setMode(body.classList.contains('launch')?'draft':'launch')})}
}
