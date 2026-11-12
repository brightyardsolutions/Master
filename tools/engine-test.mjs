// Checks that each brief in engine-cases.mjs lands on an acceptable plan, and that every plan is complete.
//   npm test
import { readFileSync } from 'node:fs';
import cases from './engine-cases.mjs';
const root = new URL('..', import.meta.url), read = p => readFileSync(new URL(p, root), 'utf8');
const BYEngine = new Function(read('assets/js/blueprint-engine.js') + ';return BYEngine')();
const M = JSON.parse(/<script type="application\/json" id="bp-master">([\s\S]*?)<\/script>/.exec(read('index.html'))[1]);
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
