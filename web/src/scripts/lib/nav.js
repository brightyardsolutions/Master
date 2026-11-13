// Moving between brightyard.in pages. The curtain closes over the page, the browser loads the next address, and the
// next page opens the curtain (uncover). The product sites change page without a curtain, as they always have.
import { G, anim } from './motion.js';
import { KEY, stash } from './site.js';

const FLAG = 'by-pt';   // read by the inline script in MainLayout, which keeps the curtain closed until the page is ready
let busy = false;
const panels = () => { const pt = document.getElementById('pt'); return pt ? [].slice.call(pt.children) : []; };

export function navigate(url) {
  const p = panels();
  if (!anim || KEY !== 'main' || p.length < 2) { location.assign(url); return; }
  if (busy) return;
  busy = true;
  stash(FLAG, '1');
  G.timeline({ onComplete: () => location.assign(url) })
    .set(p, { yPercent: 101, y: 0 })
    .to(p[0], { yPercent: 0, duration: 0.5, ease: 'power3.inOut' })
    .to(p[1], { yPercent: 0, duration: 0.5, ease: 'power3.inOut' }, '-=.38');
}

/** True when this page was reached through navigate() and starts behind the closed curtain. */
export const arrived = () => document.documentElement.classList.contains('pt-cover');

export function uncover() {
  const root = document.documentElement, p = panels();
  if (!root.classList.contains('pt-cover')) return;
  if (!anim || p.length < 2) { root.classList.remove('pt-cover'); return; }
  G.set(p, { yPercent: 0 });
  root.classList.remove('pt-cover');
  G.to(p, { yPercent: -101, duration: 0.7, ease: 'power3.inOut', stagger: 0.06, delay: 0.12 });
}

// Back or forward into a page the browser kept in memory: it was frozen behind the closed curtain, so open it.
window.addEventListener('pageshow', e => {
  if (!e.persisted) return;
  busy = false;
  const p = panels();
  if (p.length === 2) G.to(p, { yPercent: -101, duration: 0.7, ease: 'power3.inOut', stagger: 0.06 });
});
