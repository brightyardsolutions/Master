// Signature layer on brightyard.in: Blueprint mode (B), the lens that shows how the page is built, and the
// yard menu (G, then 1 to 9) with its hint.
import { $, $$, reduced, fine } from '../lib/dom.js';
import { href } from '../lib/site.js';
import { navigate } from '../lib/nav.js';

export default function init() {
function typing(t){return !!t&&(/^(input|textarea|select)$/i.test(t.tagName)||t.isContentEditable)}
function nav(id){navigate(href(id))}
var hint=$('#bhint'),hintT;
function say(html,ms){hint.innerHTML=html;hint.classList.add('show');clearTimeout(hintT);hintT=setTimeout(function(){hint.classList.remove('show')},ms||5000)}
function seen(){try{sessionStorage.setItem('bys','1')}catch(e){}}
function wasSeen(){try{return !!sessionStorage.getItem('bys')}catch(e){return false}}

/* ---------- 2. Blueprint lens ---------- */
if(!$('#bbtn'))return;
var bp=$('#bp'),ring=$('#bring'),ann=$('#bpann'),bbtn=$('#bbtn'),ro=$('#bro');
var on=false,x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,R=0,big=false,looping=false,els=[],pool=[],last=0;
var TARGETS=[['header','header',0],['h1','h1',1],['h2','h2',1],['h3','h3',1],['.lead','lead text',1],['.btn','button',0],['.card','card',0],['.tag','tag',0],['.mini','live widget',0],['.stats b','stat',1],['.ch','chip',0],['.logos','logo strip',0],['.pill','pill',0],['.sg','toggle',0],['footer','footer',0],['.band','cta band',0],['details','accordion',0],['.role','job row',0],['.spanel','sticky visual',0],['.sstep','story step',0],['input','input',0],['textarea','textarea',0],['.demo','demo panel',0],['.bpplan','plan panel',0],['.hero3','hero',0],['.s3-step.on','story step',0]];
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
}
