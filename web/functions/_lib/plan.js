/* Rebuilds the plan on the server from the brief alone, so emails never carry content the browser made up. */
import BYEngine from './engine.js';
import BYBrief from './brief.js';
import MASTER from './master.js';

/* Links point back to the copy of the site the visitor used: a Cloudflare preview (*.pages.dev) links to itself,
   anything else to SITE_URL. Other hosts never appear in links. */
export function siteBase(env, request) {
  const here = new URL(request.url);
  if (here.hostname.endsWith('.pages.dev') || here.hostname === 'localhost' || here.hostname === '127.0.0.1') return here.origin + '/';
  return env.SITE_URL || 'https://brightyard.in/';
}

export function makePlan(env, request, brief, startISO) {
  const bp = BYEngine.generate(brief, {}, MASTER);
  if (!bp || !bp.project || !bp.project.supported) return null;
  const start = /^\d{4}-\d{2}-\d{2}$/.test(startISO || '') ? startISO : '';
  const base = siteBase(env, request);
  const link = BYBrief.link(base, brief, start);
  const M = BYBrief.model(bp, start);
  return { bp, M, link, onePage: BYBrief.onePage(M, link), full: BYBrief.fullPlan(M), text: BYBrief.text(M, link) };
}
