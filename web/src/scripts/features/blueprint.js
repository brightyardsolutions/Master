// Brief to blueprint (home page): Yardie and the rules engine turn a typed problem into a plan, shown as the
// four-chapter 3D solution model (or four cards where 3D is not available).
import { $, $$, reduced } from '../lib/dom.js';
import BYEngine from '../../lib/blueprint/engine.js';
import { G, anim } from '../lib/motion.js';
import { loadScenes } from '../lib/scenes.js';
import { href, stash } from '../lib/site.js';
import { navigate } from '../lib/nav.js';

export default function init() {
/* ---------- 1. Brief to blueprint: Yardie + rules engine (BYEngine + #bp-master) ---------- */
var BPM=null;
try{BPM=JSON.parse($('#bp-master').textContent)}catch(e){BPM=null}
function bpesc(s){return String(s==null?'':s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}
function detect(t){return BPM?BYEngine.classify(t,BPM):[]}
window.BrightYardBlueprint={generate:function(t,o){return BYEngine.generate(t,o||{},BPM)},master:BPM,last:null};
var STAGES=[['Understand',['DISC','ASSESS']],['Design',['ARCH','PLAN']],['Build',['DEV','CONF','INTEG','MIGR']],['Prove',['SEC','TEST']],['Launch',['DEPLOY','HAND']],['Run',['MON']]];
var LINES={
  idle:['Checking in with my agents…','All agents online.','Ready when you are!'],
  focus:['Ooh, tell me what\'s stuck!','I\'m all ears. Well, all antenna.'],
  ponder:['Hmm, thinking…','Let me think about that…'],
  work:['On it! Briefing my agents…'],
  vague:['Tell me a bit more?','Which system, and what\'s happening?'],
  off:['That\'s outside what we build. Got a software problem?'],
  short:['A sentence is enough!'],
  done:['Here\'s your blueprint!','Ta-da! Swipe through it.'],
  boop:['Hi there!','Beep boop!','Need a plan?','Hehe, that tickles.']
};
function pick(k){var a=LINES[k];return a[Math.floor(Math.random()*a.length)]}

var tpl=$('#bp-tpl'),home=$('#p-home');
if(tpl&&home){
  var node=tpl.content.firstElementChild.cloneNode(true),anchor=$('.logos',home);
  if(anchor)anchor.parentNode.insertBefore(node,anchor.nextSibling);else home.insertBefore(node,home.firstChild);
  $$('.bpu',node).forEach(function(el){el.classList.add('rv')});
  var ta=$('#bpt'),sig=$('#bpsig'),plan=$('#bpplan'),err=$('#bperr'),dt,pt,bt,known={},bud=null,G2=G;
  var mob=matchMedia('(max-width:940px)');
  plan.innerHTML='<div class="bud" id="bud"><div class="bud-stage" id="budStage" aria-hidden="true"><canvas id="budCanvas"></canvas>'+
    '<svg class="bud-still" viewBox="0 0 200 220" aria-hidden="true"><ellipse cx="100" cy="208" rx="54" ry="8" fill="#1E1B4B" opacity=".12"/><rect x="58" y="176" width="34" height="26" rx="10" fill="#C6F432"/><rect x="108" y="176" width="34" height="26" rx="10" fill="#C6F432"/><rect x="64" y="118" width="72" height="56" rx="18" fill="#F8F7FF" stroke="#E4E0FB" stroke-width="2"/><rect x="86" y="132" width="28" height="28" rx="7" fill="#4F46E5"/><rect x="95" y="96" width="10" height="24" fill="#24205C"/><rect x="36" y="34" width="128" height="68" rx="24" fill="#F8F7FF" stroke="#E4E0FB" stroke-width="2"/><rect x="34" y="94" width="132" height="10" rx="5" fill="#4F46E5"/><rect x="50" y="44" width="100" height="48" rx="16" fill="#0B0A24"/><rect x="70" y="56" width="16" height="20" rx="7" fill="#C6F432"/><rect x="114" y="56" width="16" height="20" rx="7" fill="#C6F432"/><path d="M90 82q10 7 20 0" stroke="#C6F432" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="118" y="14" width="3" height="20" fill="#24205C"/><circle cx="119.5" cy="13" r="6" fill="#C6F432"/></svg></div>'+
    '<div class="bud-bub" id="budBub" aria-hidden="true"><span></span><i class="bud-dots"><b></b><b></b><b></b></i></div>'+
    '<span class="bud-name" aria-hidden="true">Yardie &middot; your blueprint buddy</span></div>'+
    '<div class="bres" id="bres" role="region" aria-label="Your blueprint" hidden></div><p class="vh" id="bpLive" role="status" aria-live="polite"></p>';
  var stage=$('#budStage'),bub=$('#budBub'),bres=$('#bres'),live=$('#bpLive'),budEl=$('#bud'),state='idle',lastBub='';

  function bsay(k,txt){var t=txt||pick(k);if(t===lastBub&&k!=='boop')return;lastBub=t;bub.classList.toggle('think',k==='ponder'||k==='work');
    if(G2&&anim){G2.to(bub,{autoAlpha:0,y:6,scale:.96,duration:.14,overwrite:true,onComplete:function(){$('span',bub).textContent=t;G2.to(bub,{autoAlpha:1,y:0,scale:1,duration:.4,ease:'back.out(2)'})}})}
    else{$('span',bub).textContent=t;bub.style.opacity=1}}
  function setS(s){state=s;if(bud)bud.setState(s);budEl.setAttribute('data-state',s)}
  function inDir(){var a=ta.getBoundingClientRect(),b=stage.getBoundingClientRect();if(!b.width)return;var x=((a.left+a.width/2)-(b.left+b.width/2))/(b.width/2),y=((a.top+a.height/2)-(b.top+b.height*0.35))/(b.height/2);if(bud)bud.setInputDir(Math.max(-1.4,Math.min(1.4,x)),Math.max(-1.4,Math.min(1.4,y)))}

  /* load the 3D buddy only when the section is near */
  var still=function(){budEl.classList.add('is-still')};
  if(!('IntersectionObserver' in window)||reduced)still();
  else{var lio=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;lio.disconnect();
    loadScenes().then(function(S){
      if(!S){still();return}
      try{bud=new S.Buddy($('#budCanvas'));bud.start();budEl.classList.add('is-live');bud.setState(state);bsay('idle')}catch(e){still()}
    })},{rootMargin:'400px 0px'});lio.observe(node)}
  bsay('idle');

  /* look at the pointer anywhere in the section */
  node.addEventListener('pointermove',function(e){if(!bud)return;if((state==='focus'||state==='confused')&&!ta.value.trim()){setS('idle');bsay('idle')}if(state!=='idle')return;var b=stage.getBoundingClientRect();bud.setPointer(Math.max(-1.3,Math.min(1.3,(e.clientX-(b.left+b.width/2))/(b.width/2))),Math.max(-1.2,Math.min(1.2,(e.clientY-(b.top+b.height*0.35))/(b.height/2))),true)});
  node.addEventListener('pointerleave',function(){if(bud)bud.setPointer(0,0,false)});
  stage.addEventListener('click',function(){if(state==='present')return;if(bud)bud.boop();bsay('boop')});

  /* chips: detected topics fly into Yardie */
  function fly(chip){
    if(!G2||!anim||!bud)return;
    var a=chip.getBoundingClientRect(),b=stage.getBoundingClientRect(),c=chip.cloneNode(true);
    c.classList.add('bps-fly');c.style.left=a.left+'px';c.style.top=a.top+'px';document.body.appendChild(c);
    G2.to(c,{x:b.left+b.width/2-a.left-a.width/2,y:b.top+b.height*0.38-a.top,scale:.2,autoAlpha:0,duration:.75,ease:'power2.in',onComplete:function(){c.remove();bud.absorb()}});
  }
  function showSig(){
    var d=detect(ta.value),fresh=[];
    sig.innerHTML=d.length?d.slice(0,4).map(function(c,i){if(!known[c.id])fresh.push(i);return '<span class="bps" style="--i:'+i+'">'+bpesc(c.short)+'</span>'}).join(''):'<span class="bps0">Topics Yardie spots will appear here</span>';
    var nk={};d.forEach(function(c){nk[c.id]=1});known=nk;
    fresh.forEach(function(i,k){var ch=$$('.bps',sig)[i];if(ch)setTimeout(function(){fly(ch)},120+k*160)});
    if(fresh.length&&state!=='present')bsay(null,'Ooh, '+(/^[A-Z]{2}/.test(d[fresh[0]].short)?d[fresh[0]].short:d[fresh[0]].short.toLowerCase())+'!');
  }
  ta.addEventListener('focus',function(){if(state==='present')return;inDir();setS('focus');bsay('focus')});
  ta.addEventListener('blur',function(){if(state==='present'||state==='work')return;clearTimeout(pt);setS('idle');bsay('idle')});
  ta.addEventListener('input',function(){
    err.textContent='';if(state==='present')return;
    inDir();setS('typing');if(bud)bud.keystroke();
    clearTimeout(dt);dt=setTimeout(showSig,220);
    clearTimeout(pt);pt=setTimeout(function(){if(state==='typing'&&ta.value.trim()){setS('ponder');bsay('ponder')}},1300);
  });
  $$('.bpex button',node).forEach(function(b){b.addEventListener('click',function(){
    if(state==='present')reset(true);ta.value=b.dataset.ex;err.textContent='';inDir();setS('typing');if(bud)bud.keystroke();showSig();ta.focus();
    clearTimeout(pt);pt=setTimeout(function(){if(state==='typing'){setS('ponder');bsay('ponder')}},1300)})});
  window.addEventListener('resize',function(){if(state==='focus'||state==='typing')inDir()});

  $('#bpgo').addEventListener('click',function(){
    var t=ta.value.trim();clearTimeout(pt);
    if(t.length<8){err.textContent='Describe your challenge first. A sentence is enough.';setS('confused');bsay('short');ta.focus();return}
    if(!BPM){err.textContent='The blueprint engine failed to load. Please refresh the page.';return}
    var bp;try{bp=BYEngine.generate(t,{},BPM)}catch(e){bp=null}
    window.BrightYardBlueprint.last=bp;
    if(!bp){err.textContent='Something went wrong drawing the blueprint. Please try again.';return}
    if(!bp.project.supported){setS('confused');bsay('off');live.textContent=bp.project.message;return}
    setS('work');bsay('work');
    if(mob.matches){var pr=plan.getBoundingClientRect();if(pr.top<60||pr.bottom>innerHeight)window.scrollTo({top:pr.top+scrollY-(innerHeight-pr.height)/2,behavior:reduced?'auto':'smooth'})}
    setTimeout(function(){reveal(bp,t)},reduced||!bud?0:1450);
  });

  /* ---------- result: four swipeable cards in the same box ---------- */
  function card(i,label,body){return '<article class="bc" data-i="'+i+'" aria-label="'+label+'"><span class="bc-k">'+label+'</span>'+body+'</article>'}
  function build(bp,t){
    var P=bp.project,D=P.estimated_duration,W=Math.max(1,Math.ceil(D.including_hypercare_days/5));
    var short=bpesc(bp.solution.summary.split('. ')[0].replace(/\.$/,''))+'.';
    var c1='<h3 class="bc-t">'+bpesc(P.proposed_solution)+'</h3><div class="bc-big"><b id="bpwk">0</b><span>to '+D.maximum_weeks+' weeks<br>to first release</span></div>'+
      '<div class="bc-pills"><span>'+bpesc(P.complexity)+' complexity</span><span>'+bp.resources.agent_roles.length+' agents</span><span>'+bp.resources.human_roles.length+' people</span></div>'+
      (P.ambiguous?'<p class="bc-n"><b>Rough guess.</b> Tell us which system and what happens for a sharper plan.</p>':'<p class="bc-n">'+short+'</p>');
    var bars='';STAGES.forEach(function(s,k){var ps=bp.phases.filter(function(p){return s[1].indexOf(p.phase_id)>-1});if(!ps.length)return;
      var a=Math.min.apply(null,ps.map(function(p){return p.start_day})),b=Math.max.apply(null,ps.map(function(p){return p.end_day}));
      bars+='<li style="--i:'+k+'"><b>'+s[0]+'</b><span class="bc-tr"><i class="'+(s[0]==='Run'?'on':'')+'" style="left:'+(a/5/W*100).toFixed(1)+'%;width:'+Math.max(3,(b-a)/5/W*100).toFixed(1)+'%"></i></span></li>'});
    var c2='<h3 class="bc-t">How it would run</h3><ul class="bc-bars">'+bars+'</ul><div class="bc-ax"><span>Week 0</span><span>'+W+'</span></div>';
    var ag=bp.agents.map(function(a){var n=a.name.replace(' Agent','');return '<li><i>'+bpesc(n.charAt(0))+'</i>'+bpesc(n)+'</li>'}).join('');
    var c3='<h3 class="bc-t">Who does the work</h3><ul class="bc-ag">'+ag+'</ul><p class="bc-n"><b>Reviewed by</b> '+bpesc(bp.resources.human_roles.slice(0,4).join(', ').toLowerCase())+'.</p>';
    var rk=bp.delivery.risks.slice(0,2).map(function(r){return '<li>'+bpesc(r.description)+'</li>'}).join('');
    var prod=P.related_product;
    var c4='<h3 class="bc-t">Watch-outs and next step</h3><ul class="bc-rk">'+rk+'</ul>'+(prod?'<p class="bc-n">Related: <a class="ul-link" href="'+href(prod.toLowerCase())+'">'+bpesc(prod)+'</a></p>':'')+
      '<div class="bc-cta"><button class="btn pri" id="bpsend" type="button"><span>Send this plan to our team</span><span class="arrow">&rarr;</span></button><button class="btn out" id="bpreset" type="button">Start over</button></div><p class="bc-f">Indicative only. A discovery workshop confirms scope and timing.</p>';
    var navH='<div class="bres-nav"><button type="button" class="bres-a" data-d="-1" aria-label="Previous card">&#8592;</button><span class="bres-dots">'+[0,1,2,3].map(function(i){return '<button type="button" aria-label="Card '+(i+1)+' of 4"'+(i?'':' aria-current="true"')+'></button>'}).join('')+'</span><button type="button" class="bres-a" data-d="1" aria-label="Next card">&#8594;</button></div>';
    bres.innerHTML='<div class="bres-h"><span class="tag">Your blueprint</span></div>'+
      '<div class="bres-track" tabindex="0" aria-label="Blueprint cards, scroll sideways">'+card(0,'The solution',c1)+card(1,'Timeline',c2)+card(2,'Team',c3)+card(3,'Next step',c4)+'</div>'+navH;
    var tr=$('.bres-track',bres),dots=$$('.bres-dots button',bres),cards=$$('.bc',bres),cur=0;
    function goC(i){i=Math.max(0,Math.min(3,i));tr.scrollTo({left:cards[i].offsetLeft-tr.offsetLeft,behavior:reduced?'auto':'smooth'})}
    $$('.bres-a',bres).forEach(function(b){b.onclick=function(){goC(cur+(+b.dataset.d))}});
    dots.forEach(function(b,i){b.onclick=function(){goC(i)}});
    tr.addEventListener('scroll',function(){var i=Math.round(tr.scrollLeft/(cards[1].offsetLeft-cards[0].offsetLeft));if(i!==cur){cur=i;dots.forEach(function(d,j){d.toggleAttribute('aria-current',j===i)});
      var c=cards[i];if(G2&&anim&&!c._a){c._a=1;G2.from($$('.bc-bars i,.bc-ag li,.bc-rk li',c),{scaleX:0,autoAlpha:0,transformOrigin:'left',stagger:.06,duration:.6,ease:'power3.out'})}}},{passive:true});
    tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){goC(cur+1);e.preventDefault()}if(e.key==='ArrowLeft'){goC(cur-1);e.preventDefault()}});
    /* the contact form is on its own page now: the summary goes with the visitor and is filled in there */
    $('#bpsend',bres).addEventListener('click',function(){
      stash('by-goal','Challenge: '+t+'\n\nIndicative blueprint: '+P.proposed_solution+', about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks, '+P.complexity.toLowerCase()+' complexity.');
      navigate(href('contact'))});
    $('#bpreset',bres).addEventListener('click',function(){reset(false)});
    return D;
  }

  /* ---------- holographic result: solution model: four chapters, each with its own 3D animation ---------- */
  var CH=['What we heard','The solution','How we build it','By when'],hv=null,raf=0,holo=null;
  function wk(a,b){var x=Math.max(1,Math.round(a)+1),y=Math.max(x,Math.round(b));return x===y?'Week '+x:'Weeks '+x+'–'+y}
  function nextMondays(){var o=[],d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+((8-d.getDay())%7||7));for(var i=0;i<6;i++){o.push(new Date(d));d.setDate(d.getDate()+(i?28:14))}return o}
  function fmt(d){return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}
  function addWorkDays(start,days){var d=new Date(start);d.setDate(d.getDate()+Math.round(days/5*7));return d}
  function modelSpec(bp){
    var v=bp.visual,all=v.components,byId={};all.forEach(function(c){byId[c.id]=c});
    var core=all.filter(function(c){return c.lane==='core'}),fixCount={};Object.keys(v.fixes).forEach(function(p){fixCount[v.fixes[p]]=(fixCount[v.fixes[p]]||0)+1});
    var seenV={},hero=[];core.slice().sort(function(a,b){return (fixCount[b.id]||0)-(fixCount[a.id]||0)||(b.end-b.start)-(a.end-a.start)}).forEach(function(c){if(hero.length<4&&!seenV[c.viz]){seenV[c.viz]=1;hero.push({id:c.id,name:c.name,viz:c.viz,lane:'core',start:c.start,end:c.end,members:[c.id]})}else{var h=hero.filter(function(x){return x.viz===c.viz})[0]||hero[hero.length-1];if(h){h.members.push(c.id);h.start=Math.min(h.start,c.start);h.end=Math.max(h.end,c.end)}}});
    if(!hero.length){var any=all.filter(function(c){return c.lane!=='plan'})[0]||all[0];hero.push({id:any.id,name:any.name,viz:any.viz==='scan'?'service':any.viz,lane:'core',start:any.start,end:any.end,members:[any.id]})}
    var outc=all.filter(function(c){return c.lane==='outcome'});if(outc.length)hero.push({id:outc[0].id,name:outc[0].name,viz:outc[0].viz,lane:'outcome',start:Math.min.apply(null,outc.map(function(c){return c.start})),end:Math.max.apply(null,outc.map(function(c){return c.end})),members:outc.map(function(c){return c.id})});
    var asr=all.filter(function(c){return c.lane==='assure'}),zone=asr.length?{start:Math.min.apply(null,asr.map(function(c){return c.start})),end:Math.max.apply(null,asr.map(function(c){return c.end})),names:asr.map(function(c){return c.name})}:null;
    var modOf={};hero.forEach(function(h,i){h.members.forEach(function(id){modOf[id]=i})});
    var today=v.today.slice(0,3),idx={};today.forEach(function(t,i){t.problems.forEach(function(p){if(idx[p]==null)idx[p]=i})});
    var slots={},problems=bp.problems.map(function(p){var ti=idx[p.problem_id]!=null?idx[p.problem_id]:(today.length?0:-1),s=slots[ti]||0;slots[ti]=s+1;var f=v.fixes[p.problem_id];return {id:p.problem_id,label:p.description,stated:p.source==='stated',today:ti,slot:s,fix:f!=null&&modOf[f]!=null?modOf[f]:(byId[f]&&byId[f].lane==='assure'?-2:0)}});
    var edges=[],seen={};v.edges.forEach(function(e){var a=e[0].charAt(0)==='T'?(+e[0].slice(1)<3?e[0]:null):(modOf[e[0]]!=null?'M'+modOf[e[0]]:null),b=modOf[e[1]]!=null?'M'+modOf[e[1]]:null;if(a&&b&&a!==b&&!seen[a+b]){seen[a+b]=1;edges.push([a,b])}});
    var comps=hero.map(function(h,i){return {id:'M'+i,name:h.name,viz:h.viz,lane:h.lane,start:h.start,end:h.end}});
    var days=Math.max.apply(null,all.map(function(c){return c.end}).concat([1]));
    var ms=bp.delivery.milestones.filter(function(m){return /Architecture|Go-live|Handover|Release/.test(m.name)}).map(function(m){return {label:m.name,day:m.week*5,live:m.name==='Go-live'}});
    return {today:today,comps:comps,edges:edges,problems:problems,gates:v.gates.slice(0,2),days:days,milestones:ms,zone:zone};
  }
  function stagesOf(bp){
    var groupOf={},out=[];STAGES.forEach(function(s){s[1].forEach(function(ph){groupOf[ph]=s[0]})});
    STAGES.forEach(function(s){var ps=bp.phases.filter(function(p){return s[1].indexOf(p.phase_id)>-1});if(!ps.length)return;
      var ag={};bp.activities.forEach(function(a){if(groupOf[a.phase_id]===s[0]&&a.assigned_agent)ag[a.assigned_agent]=1});
      out.push({name:s[0],a:Math.min.apply(null,ps.map(function(p){return p.start_day}))/5,b:Math.max.apply(null,ps.map(function(p){return p.end_day}))/5,agents:Object.keys(ag).length})});
    return out;
  }
  function list(items,n){if(items.length<=n)return '<ul class="bh-ls">'+items.join('')+'</ul>';return '<ul class="bh-ls">'+items.slice(0,n).join('')+'<li class="bh-more" hidden>'+items.slice(n).join('</li><li class="bh-more" hidden>').replace(/^<li>|<\/li>$/g,'')+'</li></ul><button type="button" class="bh-all">Show all '+items.length+'</button>'}
  function holoPanels(bp,S,start){
    var R=bp.project,D=R.estimated_duration,v=bp.visual,fixBy={};
    Object.keys(v.fixes).forEach(function(p){(fixBy[v.fixes[p]]=fixBy[v.fixes[p]]||[]).push(p)});
    var plabel={};bp.problems.forEach(function(p){plabel[p.problem_id]=p.description});
    var probs=bp.problems.map(function(p){return '<li><b>'+bpesc(p.description)+'</b>'+(p.source==='stated'?'':' <em class="bh-as">our assumption</em>')+'<span>'+bpesc(p.operational_consequence)+'.</span></li>'});
    var comps=v.components.filter(function(c){return c.lane!=='plan'}).map(function(c){var f=(fixBy[c.id]||[]).map(function(p){return plabel[p].toLowerCase()});return '<li><b>'+bpesc(c.name)+'</b>'+(f.length?'<span>Fixes: '+bpesc(f.join('; '))+'</span>':'')+'</li>'});
    var st=stagesOf(bp),gl=v.gates.map(function(g){return g.label.toLowerCase()});
    var rows=st.map(function(s){return '<li class="bh-row"><b>'+s.name+'</b><span>'+wk(s.a,s.b)+'</span><em>'+s.agents+' agent'+(s.agents===1?'':'s')+'</em></li>'}).join('');
    var opts=nextMondays().map(function(d,i){return '<option value="'+new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)+'"'+(i===1?' selected':'')+'>'+fmt(d)+'</option>'}).join('');
    var ms=bp.delivery.milestones.map(function(m){return '<li class="bh-row"><b>'+bpesc(m.name)+'</b><span data-ms="'+m.week+'">Week '+Math.max(1,Math.round(m.week))+'</span></li>'}).join('');
    var met=bp.business_impact.measurable_metrics.slice(0,2).map(function(m){return '<li>'+bpesc(m.metric)+'</li>'}).join('');
    return [
      '<span class="bh-k">What we heard</span><h3 class="bh-t">'+bp.problems.length+' problem'+(bp.problems.length===1?'':'s')+' to solve</h3>'+list(probs,3)+'<p class="bh-hint">Amber markers are problems. Dashed ones are our assumptions, to confirm.</p>',
      '<span class="bh-k">The solution</span><h3 class="bh-t">'+bpesc(R.proposed_solution)+'</h3><p class="bh-n bh-sum">'+bpesc(bp.solution.summary.split('. ')[0].replace(/\.$/,''))+'.</p>'+prod(R.related_product)+list(comps,4),
      '<span class="bh-k">How we build it</span><h3 class="bh-t">Agents build, engineers review</h3><ul class="bh-ls bh-rows">'+rows+'</ul><p class="bh-n">Agents carry out '+bp.automation.coverage_percentage+'% of the work. An engineer reviews every change'+(gl.length?' and signs off at '+bpesc(gl.join(', ')):'')+'.</p>',
      '<span class="bh-k">By when</span><h3 class="bh-t">Live in about <b id="bpwk">'+D.minimum_weeks+'</b>–'+D.maximum_weeks+' weeks</h3><label class="bh-start">If we start on <select id="bpStart">'+opts+'</select></label><ul class="bh-ls bh-rows">'+ms+'</ul><p class="bh-n"><b>Measure:</b></p><ul class="bh-ls">'+met+'</ul>'+
        '<div class="bh-cta"><b>Share it with your team</b><span>We email you the 3D blueprint link, a one-page brief and the full plan, ready to forward.</span><button type="button" class="btn pri" data-take="1"><span>Email me this blueprint</span><span class="arrow">&rarr;</span></button></div>'
    ];
  }
  /* when the problem is one our own products solve, say so */
  function prod(name){
    var P={Allocivo:['allocivo','Allocivo already does this for hotels: live room turns, staff assignment and supervisor approvals.'],Xessly:['xessly','Xessly already does this: AI agents find, fix and verify accessibility issues.']}[name];
    return P?'<a class="bh-prod" href="'+href(P[0])+'"><b>We already built this</b><span>'+bpesc(P[1])+'</span><em>See '+bpesc(name)+' &rarr;</em></a>':'';
  }
  function widen(on){
    var grid=plan.parentNode,card=grid.firstElementChild;if(mob.matches||grid.classList.contains('is-wide')===on)return;
    var r0=plan.getBoundingClientRect();
    var flip=function(){var r1=plan.getBoundingClientRect();if(G2&&anim)G2.fromTo(plan,{x:r0.left-r1.left,width:r0.width},{x:0,width:r1.width,duration:.8,ease:'power3.inOut',clearProps:'width,transform'})};
    if(on){if(G2&&anim)G2.to(card,{autoAlpha:0,x:-40,duration:.3,ease:'power2.in',onComplete:function(){grid.classList.add('is-wide');flip()}});else grid.classList.add('is-wide')}
    else{grid.classList.remove('is-wide');flip();if(G2&&anim)G2.fromTo(card,{autoAlpha:0,x:-40},{autoAlpha:1,x:0,duration:.55,delay:.35,ease:'power3.out',clearProps:'opacity,visibility,transform'});else{card.style.opacity='';card.style.visibility=''}}
  }
  function revealHolo(bp,t){
    var pend=window.BYPending;window.BYPending=null;var S=modelSpec(bp),R=bp.project,D=R.estimated_duration,start=pend&&pend.start?new Date(pend.start+'T00:00:00'):nextMondays()[1],panels=holoPanels(bp,S,start),view=0;
    holo={bp:bp,t:t,S:S,start:start};
    var lab='';
    S.today.forEach(function(x,i){lab+='<span class="bh-l bh-td'+(x.source==='stated'?'':' dash')+'" data-k="t'+i+'">'+bpesc(x.label)+(x.source==='confirm'?' <i>to confirm</i>':'')+'</span>'});
    S.problems.forEach(function(p,i){lab+='<span class="bh-l bh-p'+(p.stated?'':' dash')+'" data-k="p'+i+'">'+bpesc(p.label)+'</span>'});
    S.comps.forEach(function(c,i){lab+='<span class="bh-l bh-c" data-k="c'+i+'">'+bpesc(c.name)+'</span>'});
    S.gates.forEach(function(g,i){lab+='<span class="bh-l bh-g" data-k="g'+i+'">&#10003; '+bpesc(g.label)+'</span>'});
    S.milestones.forEach(function(m,i){lab+='<span class="bh-l bh-m'+(m.live?' bh-live':'')+'" data-k="m'+i+'"><b>'+bpesc(m.label)+'</b><em data-msd="'+m.day+'"></em></span>'});
    if(S.zone)lab+='<span class="bh-l bh-z" data-k="z">Checks on every change</span>';
    lab+='<span class="bh-l bh-w" data-k="w">Week 1</span>';
    bres.innerHTML='<div class="bh-labels" aria-hidden="true">'+lab+'</div><div class="bh-top"><span class="tag bh-tag">Your blueprint</span><button type="button" class="bh-edit">&larr; Edit brief</button><button type="button" class="bh-send" data-take="1">Email me this blueprint</button></div>'+
      '<div class="bh-panel" tabindex="-1"><button type="button" class="bh-replay" aria-label="Replay this chapter">&#8635; Replay</button><div class="bh-body">'+panels[0]+'</div></div>'+
      '<div class="bh-nav"><button type="button" class="bres-a" data-d="-1" aria-label="Previous chapter">&#8592;</button><div class="bh-tabs" role="tablist">'+CH.map(function(c,i){return '<button type="button" role="tab" aria-selected="'+(i?'false':'true')+'"><i>'+(i+1)+'</i><span class="tl">'+c+'</span><span class="ts" aria-hidden="true">'+['Heard','Solution','Build','When'][i]+'</span></button>'}).join('')+'</div><button type="button" class="bres-a" data-d="1" aria-label="Next chapter">&#8594;</button></div>'+
      '<span class="bh-drag">Drag to rotate</span>';
    bres.classList.add('holo');bres.dataset.view='0';bres.hidden=false;budEl.classList.add('is-holo');
    var panel=$('.bh-panel',bres),body=$('.bh-body',panel),tabs=$$('.bh-tabs button',bres),labels={};$$('.bh-l',bres).forEach(function(l){labels[l.dataset.k]=l});
    widen(true);bud.planFrame(null);bud.showPlan(S);bud.setChapter(0);setS('present');bsay(null,'Here\'s what I heard.');track('bp_ch1');
    live.textContent='Blueprint ready: '+R.proposed_solution+', live in about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks. Four chapters: what we heard, the solution, how we build it, and by when.';
    function dates(){var sel=$('#bpStart',panel);if(sel&&sel.value)start=new Date(sel.value+'T00:00:00');if(holo)holo.start=start;
      $$('[data-ms]',panel).forEach(function(e){e.textContent=fmt(addWorkDays(start,+e.dataset.ms*5))});
      $$('[data-msd]',bres).forEach(function(e){e.textContent=fmt(addWorkDays(start,+e.dataset.msd))})}
    function bind(){
      $$('.bh-all',panel).forEach(function(b){b.onclick=function(){$$('.bh-more',b.parentNode).forEach(function(l){l.hidden=false});b.remove()}});
      var sel=$('#bpStart',panel);if(sel){var iso=new Date(start.getTime()-start.getTimezoneOffset()*60000).toISOString().slice(0,10);sel.value=iso;if(sel.value!==iso){var o=document.createElement('option');o.value=iso;o.textContent=fmt(start);sel.insertBefore(o,sel.firstChild);sel.value=iso}sel.onchange=function(){dates();track('bp_start_date')}}
      $$('[data-take]',bres).forEach(function(b){b.onclick=function(){openTake()}});
      dates();
    }
    function go(i,replay){
      i=Math.max(0,Math.min(3,i));if(i===view&&!replay)return;view=i;bud.setChapter(i,replay);bres.dataset.view=String(i);
      tabs.forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
      if(!replay){var swap=function(){body.innerHTML=panels[i];bind()};
        if(G2&&anim){G2.to(body,{autoAlpha:0,y:10,duration:.18,overwrite:true,onComplete:function(){swap();G2.fromTo(body,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.45,ease:'power3.out'})}})}else swap();
        bsay(null,['Here\'s what I heard.','Here\'s how we\'d solve it.','Watch my agents build it.','And here\'s when it goes live!'][i]);track('bp_ch'+(i+1))}
    }
    holo.go=go;
    $$('.bres-a',bres).forEach(function(b){b.onclick=function(){go(view+(+b.dataset.d))}});
    tabs.forEach(function(b,i){b.onclick=function(){go(i)}});
    $('.bh-replay',panel).onclick=function(){go(view,true)};
    $('.bh-edit',bres).onclick=function(){reset(true);setTimeout(function(){ta.focus()},anim?950:0)};
    holo.key=function(e){if(!holo||e.target.closest('input,textarea,select'))return;if(e.key==='ArrowRight'){go(view+1);e.preventDefault()}if(e.key==='ArrowLeft'){go(view-1);e.preventDefault()}};
    node.addEventListener('keydown',holo.key);
    bind();
    if(G2&&anim){G2.fromTo(panel,{autoAlpha:0,x:-20},{autoAlpha:1,x:0,duration:.7,delay:.6,ease:'power3.out'});G2.from($('.bh-nav',bres),{autoAlpha:0,y:12,duration:.6,delay:.9})}
    /* labels follow the 3D model; only the current chapter's labels show, and they never collide */
    var sc=$('#budCanvas'),sz={},wl=labels.w;
    function vis(k,p){var c=k.charAt(0),n=+k.slice(1);if(c==='t')return false;if(c==='p')return view===0;if(c==='c')return (view===1&&n<2&&sc.clientWidth>=600)||(view===2&&p.building)||bud.hover===n;if(c==='z')return view===1&&p.shown;if(c==='g')return false;if(c==='m')return view===3&&p.shown&&!!(S.milestones[n]||{}).live;if(c==='w')return view===2;return false}
    (function loop(){if(!holo)return;raf=requestAnimationFrame(loop);var a=bud.anchors();if(!a)return;
      if(view===2&&wl)wl.textContent='Week '+Math.max(1,Math.ceil(bud.day()/5));
      var placed=[],yr=bud.yardieRect&&bud.yardieRect();if(yr)placed.push(yr);
      a.filter(function(p){return labels[p.k]&&p.z<1}).map(function(p){p.v=vis(p.k,p);return p}).sort(function(p,q){return (q.v?1:0)-(p.v?1:0)||p.x-q.x}).forEach(function(p){
        var l=labels[p.k];l.classList.toggle('on',p.v);l.classList.toggle('ok',!!p.fixed||!!p.built);
        if(!sz[p.k]||!sz[p.k].w)sz[p.k]={w:l.offsetWidth,h:l.offsetHeight};var w=sz[p.k].w,h=sz[p.k].h,x=p.x,y=p.y,dn=!!p.below;
        var CW=sc.clientWidth,top0=CW<600?78:8;x=Math.max(w/2+6,Math.min(CW-w/2-6,x));if(!dn)y=Math.max(h+top0,y);
        if(p.v){for(var n=0;n<8;n++){var hit=false,top=dn?y+6:y-h,bot=dn?y+6+h:y;for(var i=0;i<placed.length;i++){var r=placed[i];if(x-w/2<r[2]+4&&x+w/2>r[0]-4&&top<r[3]+3&&bot>r[1]-3){hit=true;if(r===yr)x=r[0]-6-w/2;else y=dn?r[3]+3-6:r[1]-3;break}}if(!hit)break}placed.push([x-w/2,dn?y+6:y-h,x+w/2,dn?y+6+h:y])}
        l.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,'+(dn?'6px':'-100%')+')'})})();
    var down=null;
    hv=function(e){var r=sc.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width*2-1,ny=-((e.clientY-r.top)/r.height*2-1);
      if(down!==null&&e.pointerType!=='touch'){bud.dragBy(e.clientX-down);down=e.clientX;sc.style.cursor='grabbing';return}
      var h=bud.hoverAt(nx,ny);sc.style.cursor=h>-1?'pointer':'grab'};
    sc.addEventListener('pointermove',hv);
    sc.onpointerdown=function(e){if(e.pointerType==='touch')return;down=e.clientX;try{sc.setPointerCapture(e.pointerId)}catch(x){}};
    sc.onpointerup=sc.onpointercancel=function(){down=null;sc.style.cursor='grab'};
    setTimeout(function(){panel.focus({preventScroll:true})},anim?1000:0);
  }
  function hideHolo(){
    if(!holo)return;cancelAnimationFrame(raf);if(holo.key)node.removeEventListener('keydown',holo.key);holo=null;var sc=$('#budCanvas');if(hv)sc.removeEventListener('pointermove',hv);sc.onpointerdown=sc.onpointerup=sc.onpointercancel=null;sc.style.cursor='';
    if(bud){bud.hidePlan();bud.planFrame(null)}bres.classList.remove('holo');budEl.classList.remove('is-holo');widen(false);
  }
  function track(n){try{if(window.BYTrack)window.BYTrack(n)}catch(e){}}
  function openTake(){if(window.BYTake)window.BYTake(holo);else if(holo&&holo.go)holo.go(3)}
  function reveal(bp,t){
    if(bud){revealHolo(bp,t);return}
    var D=build(bp,t);bres.hidden=false;setS('present');bsay('done');budEl.classList.add('is-mini');
    live.textContent='Blueprint ready: '+bp.project.proposed_solution+', about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks. Four cards, scroll sideways.';
    var wk=$('#bpwk',bres),launch=D.minimum_weeks;
    if(G2&&anim){
      var b=stage.getBoundingClientRect(),p=plan.getBoundingClientRect(),cx=((b.left+b.width/2-p.left)/p.width*100).toFixed(1),cy=((b.top+b.height*0.4-p.top)/p.height*100).toFixed(1);
      G2.timeline()
        .fromTo(bres,{clipPath:'circle(0% at '+cx+'% '+cy+'%)'},{clipPath:'circle(150% at '+cx+'% '+cy+'%)',duration:.9,ease:'power3.inOut'})
        .from($$('.bc[data-i="0"] > *',bres),{y:18,autoAlpha:0,stagger:.06,duration:.6,ease:'power3.out'},'-=.35')
        .add(function(){var o={v:0};G2.to(o,{v:launch,duration:.9,ease:'power2.out',onUpdate:function(){wk.textContent=Math.round(o.v)}})},'-=.4');
    }else wk.textContent=launch;
    setTimeout(function(){var h=$('.bres-track',bres);if(h)h.focus({preventScroll:true})},anim?950:0);
  }
  function reset(quiet){
    var wasHolo=!!holo;
    var done=function(){hideHolo();bres.hidden=true;bres.innerHTML='';bres.style.opacity='';bres.style.visibility='';bres.style.clipPath='';budEl.classList.remove('is-mini');setS('idle');if(bud)bud.wave();bsay('idle')};
    if(!quiet){ta.value='';known={};showSig()}
    if(G2&&anim&&!quiet){G2.to(bres,wasHolo?{autoAlpha:0,duration:.35,onComplete:function(){done();ta.focus()}}:{clipPath:'circle(0% at 86% 18%)',duration:.6,ease:'power3.in',onComplete:function(){done();ta.focus()}})}else{done();if(!quiet)ta.focus()}
  }
}
}
