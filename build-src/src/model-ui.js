  /* ---------- solution model: four chapters, each with its own 3D animation ---------- */
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
    return P?'<a class="bh-prod" href="#/'+P[0]+'"><b>We already built this</b><span>'+bpesc(P[1])+'</span><em>See '+bpesc(name)+' &rarr;</em></a>':'';
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
