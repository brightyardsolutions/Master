// Site settings (formerly window.SITE at the top of app.js) and the link table for scripts.
import { link } from '../../lib/links.mjs';

export const KEY = import.meta.env.SITE_KEY;   // main | allocivo | xessly
export const SITE = window.SITE = {
  mode: 'launch',              // 'draft' shows highlighted placeholders; 'launch' hides every incomplete section
  formEndpoint: '/api/contact', // empty = forms say they aren't connected and offer the email address instead
  contactEmail: 'hello@brightyard.in',
  api: true,                   // false = never call /api (the blueprint dialog then offers link, print and email instead)
};

/** Address for an old-style link target ("contact", "services/starters", "allocivo/al-demo"), as on the server. */
export const href = target => link(target, KEY);

/** Id of the page being shown: home, services, how, contact… (from <section class="page on" id="p-…">). */
export function pageId() { const p = document.querySelector('section.page.on'); return p ? p.id.slice(2) : ''; }

/** The section an address points at: #svc-eng, and the old #/home/bpgen form. Share links (#/plan/…) are not sections. */
export function hashTarget() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (h === 'home' || /^plan\//.test(h)) return '';
  return h.replace(/^home\//, '');
}

/** Hand a value to the next page (a brief for the generator, a summary for the contact form). */
export function stash(key, value) { try { sessionStorage.setItem(key, value); } catch (e) { /* private mode: the next page simply starts empty */ } }
export function take(key) { try { const v = sessionStorage.getItem(key); sessionStorage.removeItem(key); return v; } catch (e) { return null; } }
