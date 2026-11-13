// Case study cards on the Work page (placeholders until approved projects are filled in).
import { $, esc } from '../lib/dom.js';

export default function init() {
/* ---------- case study cards (fill these with approved projects) ---------- */
var CASES=[
  {c:'eng',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'cloud',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'data',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'a11y',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'sec',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'},
  {c:'eng',tag:'[Service]',title:'[Client type] [what we built or changed]',line:'[What was true before, in one sentence]',num:'[Metric]',unit:'[unit and timeframe]'}
];
function mark(s){return esc(s).replace(/\[[^\]]+\]/g,function(m){return '<span class="tbd">'+m+'</span>'})}
var cg=$('#cases');
if(cg)cg.innerHTML=CASES.map(function(k,i){
  return '<div class="card tilt case rv" data-c="'+k.c+'" style="--d:'+(i%3*80)+'ms"><div><span class="tag">'+mark(k.tag)+'</span><h3>'+mark(k.title)+'</h3><p>'+mark(k.line)+'</p></div><div class="num">'+mark(k.num)+'<small>'+mark(k.unit)+'</small></div><span class="go">&nearr;</span></div>';
}).join('');
}
