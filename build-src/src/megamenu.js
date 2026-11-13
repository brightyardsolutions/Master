/* ---------- mega menu: service previews and Yardie, who routes a one-line brief ---------- */
(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var panel=$('#mm-services');if(!panel)return;
var links=$$('.mml1 a[data-svc]',panel),pv=$('#svPrev'),bub=$('#yrBub'),inp=$('#yrIn'),form=$('#yrF'),bot=$('.yr-bot',panel);
function esc(s){return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}

var SVC={
  eng:{n:'Product engineering',fit:'You need a product built or rebuilt, with one team from design to launch.',get:'Working software every two weeks, in your repositories.',tags:['Web and mobile apps','APIs and integrations','Legacy in safe slices'],st:['Discovery sprint','2 weeks']},
  cloud:{n:'Cloud and DevOps',fit:'Releases are risky, outages hurt, or the cloud bill keeps surprising you.',get:'A pipeline you trust and a written cost and risk report.',tags:['Cloud migration','CI/CD pipelines','Cost control'],st:['Cloud cost review','1 week']},
  data:{n:'Data and AI',fit:'An AI pilot stalled before production, or nobody trusts the data.',get:'A working feature with its evaluation set and monitoring.',tags:['Data pipelines','Dashboards','Generative AI'],st:['Discovery sprint','2 weeks']},
  a11y:{n:'Accessibility and quality',fit:'An audit, a tender or a complaint, or you want your product to work for everyone.',get:'A prioritised report, fixes in your code and a re-test of every fix.',tags:['WCAG reviews','Fixes in your code','Screen reader testing'],st:['Accessibility review','10 working days']},
  sec:{n:'Security and support',fit:"You need a live system kept safe and running, or support isn't keeping up.",get:'Clear SLAs, a named team and a runbook for every critical system.',tags:['Hardening','Incident readiness','24/7 monitoring'],st:['Architecture review','10 working days']}
};
/* engine categories to the service that delivers them */
var MAP={sw:'eng',legacy:'eng',integ:'eng',ent:'eng',cloud:'cloud',infra:'cloud',data:'data',ai:'data',a11y:'a11y',sec:'sec',msp:'sec'};
var PROD={Allocivo:['allocivo','Hotels? That\'s exactly what <b>Allocivo</b> does.'],Xessly:['xessly','That\'s what <b>Xessly</b> does: it finds, fixes and proves accessibility fixes.']};

function show(key,why){
  var S=SVC[key];links.forEach(function(a){a.classList.toggle('cur',a.dataset.svc===key)});
  if(!S){pv.innerHTML='<a class="sv-st sv-def" href="#/services/starters"><small>Start small</small><b>Fixed-price starters</b><span>Architecture, accessibility and cloud cost reviews, each with a written report you keep.</span></a>';return}
  pv.innerHTML='<div class="sv-c'+(why?' sv-m':'')+'"><b class="sv-n">'+esc(S.n)+'</b><p><em>Good fit if</em> '+esc(S.fit)+'</p><p><em>You get</em> '+esc(S.get)+'</p>'+
    '<ul>'+S.tags.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul></div>'+
    '<a class="sv-st" href="#/services/starters"><small>Start small</small><b>'+esc(S.st[0])+'</b><span>Fixed price &middot; '+esc(S.st[1])+' &rarr;</span></a>';
}
show(null);
var hoverKey=null,matchKey=null;
links.forEach(function(a){
  var on=function(){hoverKey=a.dataset.svc;show(hoverKey);look(a)};
  a.addEventListener('mouseenter',on);a.addEventListener('focus',on);
  a.addEventListener('mouseleave',function(){hoverKey=null;show(matchKey,!!matchKey);look(matchKey?$('[data-svc="'+matchKey+'"]',panel):null)});
});

/* Yardie looks at what it's talking about */
var eyes=bot&&bot.querySelector('.yr-eyes'),head=bot&&bot.querySelector('.yr-head');
function look(el){
  if(!eyes)return;
  if(!el){eyes.style.transform='';head.style.transform='';return}
  var b=bot.getBoundingClientRect(),r=el.getBoundingClientRect(),dx=(r.left+r.width/2)-(b.left+b.width/2),dy=(r.top+r.height/2)-(b.top+b.height/3);
  var d=Math.max(1,Math.hypot(dx,dy));eyes.style.transform='translate('+(dx/d*3).toFixed(1)+'px,'+(dy/d*2.4).toFixed(1)+'px)';
  head.style.transform='rotate('+Math.max(-8,Math.min(8,dx/40)).toFixed(1)+'deg)';
}

/* read the brief with the same engine as the generator */
var M=null;function master(){if(!M){try{M=JSON.parse($('#bp-master').textContent)}catch(e){M=null}}return M}
var t=null,DEF='Not sure which? Tell me in a sentence.';
function read(){
  var v=inp.value.trim();bot.classList.toggle('think',false);
  if(v.length<6){matchKey=null;bub.innerHTML=DEF;links.forEach(function(a){a.classList.remove('match')});show(hoverKey);look(null);return}
  var bp=null;try{if(window.BYEngine&&master())bp=BYEngine.generate(v,{},master())}catch(e){bp=null}
  links.forEach(function(a){a.classList.remove('match')});
  if(!bp||!bp.project.supported){matchKey=null;bub.innerHTML='Hmm. Tell me what isn\'t working, or what you want to build.';show(hoverKey);look(null);return}
  var prim=(bp.meta.classification[0]||{}).category,dom=null;
  (master().domains||[]).forEach(function(d){if(d.name===prim)dom=d.id});
  matchKey=MAP[dom]||'eng';var a=$('[data-svc="'+matchKey+'"]',panel);a.classList.add('match');
  var pr=PROD[bp.project.related_product];
  bub.innerHTML=pr?pr[1]+' <a href="#/'+pr[0]+'">See it &rarr;</a>':'Sounds like <b>'+esc(SVC[matchKey].n)+'</b>. Press Enter and I\'ll sketch the plan.';
  if(!hoverKey)show(matchKey,true);look(a);
}
inp.addEventListener('input',function(){clearTimeout(t);bot.classList.add('think');t=setTimeout(read,260)});
form.addEventListener('submit',function(e){
  e.preventDefault();var v=inp.value.trim();
  if(v.length<6){bub.innerHTML='A sentence is enough: what isn\'t working?';inp.focus();return}
  var m=panel.closest('.mm');if(m){m.classList.remove('open');var b=$('.mmb',m);if(b)b.setAttribute('aria-expanded','false');var h=$('#hdr');if(h)h.classList.remove('mm-on')}
  inp.blur();if(window.BYRunBrief)window.BYRunBrief(v);
});

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
})();
