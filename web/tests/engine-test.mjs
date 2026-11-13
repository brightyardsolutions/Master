// Checks that each brief in engine-cases.mjs lands on an acceptable plan, and that every plan is complete.
// Add a case whenever a real brief lands on the wrong plan.   npm test
import { readFileSync } from 'node:fs';
import cases from './engine-cases.mjs';
import BYEngine from '../src/lib/blueprint/engine.js';
const M = JSON.parse(readFileSync(new URL('../src/data/master.json', import.meta.url), 'utf8'));
let fail = 0, best = 0;
for (const [brief, want] of cases) {
  const bp = BYEngine.generate(brief, {}, M), got = bp.project.supported ? bp.meta.template : null;
  let why = '';
  if (!want.length) { if (got) why = 'should be declined, got ' + got; }
  else if (!got) why = 'was declined';
  else if (!want.includes(got)) why = 'got ' + got;
  else if (!bp.visual || !bp.visual.components.length || !bp.phases.length || !bp.delivery.milestones.length) why = 'incomplete plan';
  if (why) { fail++; console.log('FAIL', brief, '\n     want', want.join(' or ') || 'declined', '-', why); }
  else if (!want.length || want[0] === got) best++;
}
console.log(`${cases.length - fail}/${cases.length} acceptable, ${best} best fit`);
process.exit(fail ? 1 : 0);
