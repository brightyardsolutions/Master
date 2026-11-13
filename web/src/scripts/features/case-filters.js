// Work page: filter the case studies by service.
import { $, $$ } from '../lib/dom.js';

export default function init() {
/* ---------- case filters ---------- */
var fl=$('#filters');
if(fl)fl.addEventListener('click',function(e){
  var b=e.target.closest('.fb');if(!b)return;
  $$('.fb',fl).forEach(function(x){x.classList.toggle('on',x===b)});
  $$('#p-work .case').forEach(function(c){c.classList.toggle('hide',b.dataset.f!=='all'&&c.dataset.c!==b.dataset.f)});
});
}
