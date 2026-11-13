// Home hero: the audience toggle (growing company, startup, enterprise, public sector) swaps the lead text and button.
import { $, $$ } from '../lib/dom.js';
import { G, anim } from '../lib/motion.js';

export default function init() {
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
}
