// Home services gallery: the code sample that types itself while on screen.
import { $, reduced } from '../lib/dom.js';

export default function init() {
/* ---------- typing code demo ---------- */
(function(){
  var el=$('#code');if(!el)return;
  var txt='const release = await brightyard.ship({\n  stack: "yours",\n  cadence: "every 2 weeks",\n  owner: "you"\n});',i=0,vis=false;
  if(reduced){el.textContent=txt;return}
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(el);
  setInterval(function(){if(!vis)return;i=i>txt.length+26?0:i+1;el.textContent=txt.slice(0,Math.min(i,txt.length))},55);
})();
}
