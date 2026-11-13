/* ===== hero agent console (illustrative) ===== */
(function(){
var log=document.getElementById('hxlog');if(!log)return;
var L=[
 ['discovery-agent','Turned a two-page brief into 14 user stories','plan'],
 ['architect-agent','Drafted the architecture and a test plan','plan'],
 ['engineer','Priya met the client: checkout speed matters more than new features','plan',1],
 ['build-agent','Opened PR #128: cache cart totals at checkout','build'],
 ['test-agent','Wrote 36 tests. 412 passed, 0 failed','test'],
 ['a11y-agent','Fixed 3 WCAG issues in checkout, re-verified','a11y'],
 ['engineer','Arjun reviewed PR #128 and asked for a retry policy','build',1],
 ['build-agent','Added the retry policy, PR #128 updated','build'],
 ['security-agent','Dependency scan clean, 0 critical','test'],
 ['deploy-agent','Staged rollout 10% → 50% → 100%','ship'],
 ['ops-agent','Latency p95 182 ms, all checks healthy','run'],
 ['engineer','Priya spotted a pattern in support tickets and queued an improvement','run',1]
];
var order=['plan','build','test','a11y','ship','run'],max=8,i=0;
var pipe=[].slice.call(document.querySelectorAll('.hx-pipe span')),eng=document.getElementById('hxeng');
function add(l){
  var li=document.createElement('li');if(l[3])li.className='h';
  li.innerHTML='<b>'+l[0]+'</b><span>'+l[1]+'</span>';
  log.appendChild(li);while(log.children.length>max)log.removeChild(log.firstChild);
  var k=order.indexOf(l[2]);
  pipe.forEach(function(p,j){p.classList.toggle('on',j===k);p.classList.toggle('done',j<k)});
  eng.textContent=l[3]?'Reviewing':'Watching';eng.classList.toggle('act',!!l[3]);
}
if(matchMedia('(prefers-reduced-motion: reduce)').matches){L.slice(-max).forEach(add);return}
var vis=true;new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(log);
for(;i<4;i++)add(L[i]);
setInterval(function(){
  if(!vis||document.hidden||!document.getElementById('p-home').classList.contains('on'))return;
  add(L[i%L.length]);i++;
},1700);
})();
