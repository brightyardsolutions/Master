// Live demo screens for Allocivo and Xessly: cloned from the templates into every [data-ui] slot, then looped.
import { $, $$, reduced } from '../lib/dom.js';

export default function init() {
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
}
