// Scrolling that goes through Lenis (smooth scroll) when it runs. features/core.js creates Lenis and registers it here.
import { reduced } from './dom.js';
let lenis = null;
export function setLenis(l) { lenis = l; }
export function getLenis() { return lenis; }
export function toTop() { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0); }
export function scrollToEl(el, now) {
  if (lenis) lenis.scrollTo(el.getBoundingClientRect().top + window.scrollY - 84, { immediate: !!now, force: true });
  else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 84, behavior: now || reduced ? 'auto' : 'smooth' });
}
export function scrollToY(y) { if (lenis) lenis.scrollTo(y, { force: true }); else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }); }
