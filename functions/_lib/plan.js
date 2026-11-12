/* Rebuilds the plan on the server from the brief alone, so emails never carry content the browser made up. */
import BYEngine from './engine.js';
import BYBrief from './brief.js';
import MASTER from './master.js';

export function makePlan(env, request, brief, startISO) {
  const bp = BYEngine.generate(brief, {}, MASTER);
  if (!bp || !bp.project || !bp.project.supported) return null;
  const start = /^\d{4}-\d{2}-\d{2}$/.test(startISO || '') ? startISO : '';
  const base = env.SITE_URL || new URL(request.url).origin + '/';
  const link = BYBrief.link(base, brief, start);
  const M = BYBrief.model(bp, start);
  return { bp, M, link, onePage: BYBrief.onePage(M, link), full: BYBrief.fullPlan(M), text: BYBrief.text(M, link) };
}
