(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
function typing(t){return !!t&&(/^(input|textarea|select)$/i.test(t.tagName)||t.isContentEditable)}
function nav(id){location.hash='#/'+id}
var hint=$('#bhint'),hintT;
function say(html,ms){hint.innerHTML=html;hint.classList.add('show');clearTimeout(hintT);hintT=setTimeout(function(){hint.classList.remove('show')},ms||5000)}
function seen(){try{sessionStorage.setItem('bys','1')}catch(e){}}
function wasSeen(){try{return !!sessionStorage.getItem('bys')}catch(e){return false}}

/* ---------- 1. Brief to blueprint (rules engine: BYEngine + #bp-master) ---------- */
var BPM=null;
try{BPM=JSON.parse($('#bp-master').textContent)}catch(e){BPM=null}
function bpesc(s){return String(s==null?'':s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}
function detect(t){return BPM&&window.BYEngine?BYEngine.classify(t,BPM):[]}
window.BrightYardBlueprint={generate:function(t,o){return BYEngine.generate(t,o||{},BPM)},master:BPM,last:null};
var EMPTY='<div class="bpe"><div class="bpe-d" aria-hidden="true"><i class="y"></i><i></i><i class="y"></i><i></i><i class="y"></i><i></i><i></i><i class="y"></i><i></i></div><p>Your blueprint will be drawn here.</p></div>';
var SCAN='<div class="bpe"><div class="bpscan" aria-hidden="true"><i></i></div><p>Reading your brief&hellip;</p></div>';

var tpl=$('#bp-tpl'),home=$('#p-home');
if(tpl&&home){
  var node=tpl.content.firstElementChild.cloneNode(true),anchor=$('.logos',home);
  if(anchor)anchor.parentNode.insertBefore(node,anchor.nextSibling);else home.insertBefore(node,home.firstChild);
  var uio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');uio.unobserve(e.target)}})},{threshold:.12});
  $$('.bpu',node).forEach(function(el){uio.observe(el)});

  var ta=$('#bpt'),sig=$('#bpsig'),plan=$('#bpplan'),err=$('#bperr'),dt;
  plan.innerHTML=EMPTY;
  function showSig(){
    var d=detect(ta.value);
    sig.innerHTML=d.length?d.slice(0,5).map(function(c,i){return '<span class="bps" style="--i:'+i+'">'+bpesc(c.short)+'</span>'}).join(''):'<span class="bps0">Signals we pick up will appear here</span>';
  }
  ta.addEventListener('input',function(){err.textContent='';clearTimeout(dt);dt=setTimeout(showSig,140)});
  $$('.bpex button',node).forEach(function(b){b.addEventListener('click',function(){ta.value=b.dataset.ex;err.textContent='';showSig();ta.focus()})});
  $('#bpgo').addEventListener('click',function(){
    var t=ta.value.trim();
    if(t.length<8){err.textContent='Describe your challenge first. A sentence is enough.';ta.focus();return}
    if(!BPM||!window.BYEngine){err.textContent='The blueprint engine failed to load. Please refresh the page.';return}
    plan.innerHTML=SCAN;
    setTimeout(function(){build(t)},reduced?0:900);
  });

  function li(html){return '<li>'+html+'</li>'}
  function sect(title,items){return items.length?'<details><summary>'+bpesc(title)+'</summary><ul class="ul">'+items.join('')+'</ul></details>':''}
  function wk(d){return Math.round(d/5*10)/10}
  function bindReset(){$('#bpreset').addEventListener('click',function(){plan.innerHTML=EMPTY;ta.value='';showSig();ta.focus()})}

  function build(t){
    var bp;
    try{bp=BYEngine.generate(t,{},BPM)}catch(e){bp=null}
    window.BrightYardBlueprint.last=bp;
    if(!bp){plan.innerHTML=EMPTY;err.textContent='Something went wrong drawing the blueprint. Please try again.';return}
    var P=bp.project;
    if(!P.supported){
      plan.innerHTML='<div class="bpe"><div class="bpe-d" aria-hidden="true"><i class="y"></i><i></i><i class="y"></i><i></i><i class="y"></i><i></i><i></i><i class="y"></i><i></i></div><p>'+bpesc(P.message)+'</p></div><div class="bpa"><button class="btn out" id="bpreset" type="button">Start over</button></div>';
      bindReset();return;
    }
    var D=P.estimated_duration,ph=bp.phases,W=Math.max(1,Math.ceil(D.including_hypercare_days/5));
    var h='<div class="bpph"><div><span class="tag">Indicative blueprint &middot; '+bpesc(bp.project.title)+'</span><h3>'+bpesc(P.proposed_solution)+'</h3></div><div class="bpm"><span>About <b id="bpwk">0</b> to '+D.maximum_weeks+' weeks</span> <span>'+bpesc(P.complexity)+' complexity</span> <span>Confidence '+P.confidence_score+'/100</span></div></div>';
    h+='<p class="bpnote">'+bpesc(bp.solution.summary)+' '+bpesc(bp.solution.rationale)+'</p>';
    if(P.ambiguous)h+='<p class="bpnote"><b>Scope not yet clear.</b> We\'ve planned a health check first and estimated the rest conservatively. Add what\'s happening, which system and since when for a sharper plan.</p>';
    h+='<div class="bpax" aria-hidden="true"><span>Week 0</span><span>'+Math.round(W/2)+'</span><span>'+W+'</span></div><div class="bplist">';
    ph.forEach(function(p,i){
      var who=[];if(p.assigned_agents.length)who.push('Agents: '+p.assigned_agents.map(function(a){return a.replace(' Agent','')}).join(', '));
      if(p.human_involvement.length)who.push('People: '+p.human_involvement.join(', '));
      var c=p.ongoing?'ongoing':p.phase_id==='DEPLOY'?'ms':'';
      h+='<div class="bpr" style="--i:'+i+'"><div class="bpn"><b>'+bpesc(p.name)+'</b><small>'+bpesc(who.join(' · '))+'</small></div><div class="bpt"><span class="bpbar '+c+'" style="left:'+(p.start_day/5/W*100).toFixed(2)+'%;width:'+Math.max(1,(p.end_day-p.start_day)/5/W*100).toFixed(2)+'%" title="Weeks '+wk(p.start_day)+' to '+wk(p.end_day)+'"></span></div></div>';
    });
    h+='</div>';
    var A=bp.automation,R=bp.resources,Cmp=bp.comparison;
    h+='<p class="bpnote"><b>Critical path:</b> '+bpesc(bp.delivery.critical_path.map(function(c){return c.name}).join(' → '))+'.</p>';
    h+='<p class="bpnote"><b>AI-first vs traditional, same scope:</b> about '+Cmp.ai_first.duration_weeks+' weeks with '+R.agent_effort_hours+' agent hours and '+R.human_effort_hours+' human hours ('+R.human_review_hours+' of them reviewing), versus about '+Cmp.traditional.duration_weeks+' weeks and '+Cmp.traditional.human_hours+' human hours delivered traditionally. Agents carry out '+A.coverage_percentage+'% of the work effort: '+A.autonomous_effort_percentage+'% on their own, '+A.supervised_effort_percentage+'% with an engineer reviewing every change.</p>';
    var probs=bp.problems.map(function(p){return li('<b>'+bpesc(p.description)+'</b> ('+(p.source==='stated'?'stated':'inferred, to confirm')+'). '+bpesc(p.root_cause)+'. Goal: '+bpesc(p.desired_outcome.toLowerCase())+'.')});
    var comps=bp.solution.components.map(function(c){return li('<b>'+bpesc(c.name)+'</b> · '+bpesc(c.assigned_agents.join(', '))+'. '+bpesc(c.deliverables.join('; '))+'.')});
    bp.solution.integrations.forEach(function(i){comps.push(li('<b>Integration:</b> '+bpesc(i.name)+' ('+bpesc(i.source)+')'))});
    var ags=bp.agents.map(function(a){return li('<b>'+bpesc(a.name)+'</b> ('+bpesc(a.execution_mode)+'): '+bpesc(a.responsibilities.join('; '))+'.'+(a.handoffs.length?' Hands off to '+bpesc(a.handoffs.join(', '))+'.':'')+(a.human_checkpoints.length?' Checkpoint: '+bpesc(a.human_checkpoints.join(', '))+'.':''))});
    ags.push(li('<b>Recovery:</b> '+bpesc(bp.collaboration.recovery)));
    var acts=bp.activities.map(function(a){return li('<b>Weeks '+wk(a.schedule.start_day)+' to '+wk(a.schedule.finish_day)+' · '+bpesc(a.name)+'</b> · '+bpesc(a.assigned_agent||a.human_role)+(a.assigned_agent?', '+bpesc(a.execution_mode)+' by '+bpesc(a.human_role):', human-led')+'. Delivers: '+bpesc(a.expected_deliverable)+'. Done when: '+bpesc(a.validation_criteria)+'.')});
    var rk=bp.delivery.risks.map(function(r){return li('<b>'+bpesc(r.severity)+':</b> '+bpesc(r.description)+'. '+bpesc(r.mitigation)+' ('+bpesc(r.responsible_role)+').')});
    var F=bp.delivery.feasibility;
    rk.push(li('<b>Feasibility:</b> technical: '+bpesc(F.technical)+'; agents: '+bpesc(F.agent_capability)+'; integration: '+bpesc(F.integration)+'; delivery: '+bpesc(F.delivery)+'.'));
    bp.delivery.assumptions.forEach(function(a){rk.push(li('Assumption: '+bpesc(a)))});
    (bp.solution.exclusions||[]).forEach(function(x){rk.push(li('Not included: '+bpesc(x)))});
    var out=bp.business_impact.expected_outcomes.map(function(o){return li(bpesc(o.outcome)+' ('+bpesc(o.basis.toLowerCase())+')')});
    bp.business_impact.measurable_metrics.forEach(function(m){out.push(li('<b>Measure:</b> '+bpesc(m.metric)+'. Baseline: '+bpesc(m.baseline)+'.'))});
    out.push(li(bpesc(bp.business_impact.note)));
    h+=sect('Problems we identified',probs)+sect('Solution components',comps)+sect('Agents, handoffs and human checkpoints',ags)+sect('Activities, deliverables and checks',acts)+sect('Risks, assumptions and exclusions',rk)+sect('Expected outcomes',out);
    var prod=P.related_product;
    h+=(prod?'<p class="bpnote"><b>Related Brightyard product:</b> '+bpesc(prod)+'. <a class="ul-link" href="#/'+prod.toLowerCase()+'">See how it works</a></p>':'')+'<p class="bpnote">Indicative only. Rules-based estimate generated in your browser in '+bp.meta.generated_ms+' ms; a discovery workshop confirms scope and timing.</p>';
    h+='<div class="bpa"><button class="btn pri" id="bpsend" type="button"><span>Send this plan to our team</span><span class="arrow">&rarr;</span></button><button class="btn out" id="bpreset" type="button">Start over</button></div>';
    plan.innerHTML=h;
    var wkEl=$('#bpwk'),launch=D.minimum_weeks;
    if(reduced){wkEl.textContent=launch}else{var st=null;(function f(ts){if(!st)st=ts;var p=Math.min((ts-st)/900,1);wkEl.textContent=Math.round(launch*p);if(p<1)requestAnimationFrame(f)})(performance.now())}
    $('#bpsend').addEventListener('click',function(){
      var g=$('#goal');
      if(g)g.value='Challenge: '+t+'\n\nIndicative blueprint: '+P.proposed_solution+' ('+P.primary_category+'), about '+D.minimum_weeks+' to '+D.maximum_weeks+' weeks, '+P.complexity.toLowerCase()+' complexity.\nPhases: '+ph.map(function(p){return p.name}).join(', ')+'.\nAgents: '+bp.resources.agent_roles.join(', ')+'.\nPeople: '+bp.resources.human_roles.join(', ')+'.';
      nav('contact');
      setTimeout(function(){var n=$('#name');if(n)n.focus({preventScroll:true})},800);
    });
    bindReset();
  }
}

/* ---------- 2. Blueprint lens ---------- */
if(!$('#bbtn'))return;
var bp=$('#bp'),ring=$('#bring'),ann=$('#bpann'),bbtn=$('#bbtn'),ro=$('#bro');
var on=false,x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,R=0,big=false,looping=false,els=[],pool=[],last=0;
var TARGETS=[['header','header',0],['h1','h1',1],['h2','h2',1],['h3','h3',1],['.lead','lead text',1],['.btn','button',0],['.card','card',0],['.tag','tag',0],['.mini','live widget',0],['.stats b','stat',1],['.ch','chip',0],['.logos','logo strip',0],['.pill','pill',0],['.sg','toggle',0],['footer','footer',0],['.band','cta band',0],['details','accordion',0],['.role','job row',0],['.spanel','sticky visual',0],['.sstep','story step',0],['input','input',0],['textarea','textarea',0],['.demo','demo panel',0],['.bpplan','plan panel',0],['.hero','hero',0]];
function collect(){
  var scopes=[$('header'),$('.page.on'),$('footer')].filter(Boolean),out=[];
  TARGETS.forEach(function(t){scopes.forEach(function(sc){$$(t[0],sc).forEach(function(el){if(!el.closest('#bp,#gl,.dock,.ast,#cur,#bring,.bhint'))out.push({el:el,role:t[1],txt:t[2]})})})});
  return out;
}
function hex(c){var m=c.match(/\d+(\.\d+)?/g);if(!m)return c;return '#'+m.slice(0,3).map(function(v){return ('0'+Math.round(+v).toString(16)).slice(-2)}).join('').toUpperCase()}
function annotate(){
  var reads=[];
  for(var i=0;i<els.length&&reads.length<70;i++){
    var o=els[i],r=o.el.getBoundingClientRect();
    if(r.width<4||r.height<4||r.bottom<y-R||r.top>y+R||r.right<x-R||r.left>x+R)continue;
    reads.push([o,r]);
  }
  reads.forEach(function(p,i){
    var o=p[0],r=p[1],b=pool[i];
    if(!b){b=document.createElement('div');b.className='bpb';b.innerHTML='<span class="bplab"></span>';ann.appendChild(b);pool[i]=b}
    b.style.display='block';
    b.style.transform='translate('+r.left+'px,'+r.top+'px)';
    b.style.width=r.width+'px';b.style.height=r.height+'px';
    var key=o.role+'|'+Math.round(r.width)+'x'+Math.round(r.height);
    if(b._k!==key){
      b._k=key;
      var cs=getComputedStyle(o.el);
      var extra=o.txt?Math.round(parseFloat(cs.fontSize))+'px/'+cs.fontWeight+' '+hex(cs.color):'r'+Math.round(parseFloat(cs.borderTopLeftRadius)||0);
      b.firstChild.textContent=o.role+' \u00B7 '+extra+' \u00B7 '+Math.round(r.width)+'\u00D7'+Math.round(r.height);
    }
  });
  for(var j=reads.length;j<pool.length;j++)pool[j].style.display='none';
}
function frame(ts){
  if(on&&ts-last>800){els=collect();last=ts}
  var k=reduced?1:.2;
  x+=(tx-x)*k;y+=(ty-y)*k;
  var tR=on?(big?270:170):0;
  R+=(tR-R)*(reduced?1:.16);
  if(Math.abs(tR-R)<.5)R=tR;
  var cp='circle('+R+'px at '+x+'px '+y+'px)';
  bp.style.clipPath=cp;bp.style.webkitClipPath=cp;
  ring.style.transform='translate('+(x-R)+'px,'+(y-R)+'px)';
  ring.style.width=(R*2)+'px';ring.style.height=(R*2)+'px';
  ring.style.opacity=R>2?1:0;
  if(R>2){ro.textContent='x '+Math.round(x)+'  y '+Math.round(y+scrollY);annotate()}
  if(on||R>0)requestAnimationFrame(frame);else looping=false;
}
function setBP(v){
  if(!fine)return;
  on=v;bbtn.setAttribute('aria-pressed',v);document.body.classList.toggle('bp-on',v);
  seen();
  if(v){last=0;say('Blueprint mode is on. Move your cursor, hold the mouse button to widen the lens, press <b>Esc</b> to exit.',5500);if(!looping){looping=true;requestAnimationFrame(frame)}}
  else hint.classList.remove('show');
}
document.addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY});
document.addEventListener('pointerdown',function(e){if(on&&!e.target.closest('.dock'))big=true});
['pointerup','pointercancel'].forEach(function(n){document.addEventListener(n,function(){big=false})});
window.addEventListener('hashchange',function(){last=0});
bbtn.addEventListener('click',function(){setBP(!on)});
var bpon=$('#bpon');if(bpon)bpon.addEventListener('click',function(){if(fine)setBP(true);else say('Blueprint mode needs a mouse. Try it on a desktop.',4000)});

/* ---------- 3. Yard menu ---------- */
var PAGES=[['services','Services','Build, run, secure'],['allocivo','Allocivo','Hotel operations'],['work','Work','The proof'],['xessly','Xessly','Accessibility'],['home','Home','Start here'],['how','How we work','Our playbook'],['insights','Insights','Field notes'],['contact','Contact','Talk to us'],['bp','Blueprint','See how this page is built']];
var Y=[0,2,4,7];
var gl=$('#gl'),gg=$('#gg'),gbtn=$('#gbtn'),glOpen=false;
gg.innerHTML=PAGES.map(function(p,i){
  return '<button class="gc'+(Y.indexOf(i)>-1?' y':'')+'" type="button" role="menuitem" style="--i:'+i+'" data-p="'+p[0]+'"><span class="n">'+(i+1)+'</span><b>'+p[1]+'</b><small>'+p[2]+'</small></button>';
}).join('');
function setGL(v){
  glOpen=v;
  if(v){var r=gbtn.getBoundingClientRect();gl.style.setProperty('--ox',(r.left+r.width/2)+'px');gl.style.setProperty('--oy',(r.top+r.height/2)+'px')}
  gl.classList.toggle('open',v);gl.setAttribute('aria-hidden',!v);gbtn.setAttribute('aria-expanded',v);
  document.body.classList.toggle('gl-open',v);
  seen();
  if(v){setTimeout(function(){var c=$('.gc',gl);if(c&&glOpen)c.focus({preventScroll:true})},600)}
  else gbtn.focus({preventScroll:true});
}
function choose(id){
  setGL(false);
  if(id==='bp'){if(fine)setTimeout(function(){setBP(!on)},500);else say('Blueprint mode needs a mouse. Try it on a desktop.',4000)}
  else nav(id);
}
gbtn.addEventListener('click',function(){setGL(!glOpen)});
$('#glx').addEventListener('click',function(){setGL(false)});
gg.addEventListener('click',function(e){var b=e.target.closest('.gc');if(b)choose(b.dataset.p)});
gl.addEventListener('wheel',function(e){e.preventDefault()},{passive:false});
gl.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});

document.addEventListener('keydown',function(e){
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==='Escape'){if(glOpen)setGL(false);else if(on)setBP(false);return}
  if(typing(e.target))return;
  try{if(localStorage.getItem('by-keys')==='off')return}catch(x){}
  var k=e.key.toLowerCase();
  if(k==='g'){setGL(!glOpen);return}
  if(glOpen){if(/^[1-9]$/.test(e.key))choose(PAGES[+e.key-1][0]);return}
  if(k==='b'&&fine)setBP(!on);
});

if(fine&&!wasSeen()){setTimeout(function(){if(!wasSeen()&&!glOpen&&!on)say('New: press <b>B</b> to see how this page is built, or <b>G</b> for the yard menu.',9000)},6000)}
})();
