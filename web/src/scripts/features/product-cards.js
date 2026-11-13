// Home and Products: the numbered steps on each product card light up with the demo they describe.
import { $$ } from '../lib/dom.js';

export default function init() {
/* product cards: the numbered steps light up with the demo they describe */
$$('.pp').forEach(function(card){
  var ui=card.querySelector('.aui,.xui'),steps=$$('.pp-steps li',card),now=card.querySelector('.pp-now');if(!ui||!steps.length)return;
  var sync=function(){var st=+ui.dataset.state||0,held=ui._hold>Date.now();card.classList.toggle('held',held);
    steps.forEach(function(li){var k=+li.dataset.s,b=li.querySelector('button');li.classList.toggle('on',k===st);li.classList.toggle('done',k<st);if(b)b.setAttribute('aria-pressed',k===st);
      if(ui._dur)li.style.setProperty('--sd',ui._dur[k]+'ms')});
    var cur=steps.filter(function(li){return +li.dataset.s===Math.max(1,st)})[0];if(now&&cur&&now.textContent!==cur.dataset.d){now.textContent=cur.dataset.d;now.classList.remove('fresh');void now.offsetWidth;now.classList.add('fresh')}};
  steps.forEach(function(li){var b=li.querySelector('button');if(b)b.addEventListener('click',function(){if(ui._go)ui._go(+li.dataset.s);sync();clearTimeout(card._ht);card._ht=setTimeout(sync,7100)})});
  new MutationObserver(sync).observe(ui,{attributes:true,attributeFilter:['data-state']});sync();
});
}
