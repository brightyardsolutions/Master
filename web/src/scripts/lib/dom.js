// Small helpers every feature uses (the same ones each part of the old app.js defined for itself).
export const $ = (s, r) => (r || document).querySelector(s);
export const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
export function esc(s) { return String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])); }
