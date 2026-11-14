// Deliberate, approved changes made since the move to Astro. The comparison tests (compare.mjs, behaviour.mjs) apply
// them to the old sites, or remove them from the new ones, so that only unintended differences are reported.
// Add an entry with every approved design, content or accessibility change that the tests would otherwise flag.
export const ACCEPTED = [
  {
    date: '2026-11-14', what: 'Accessibility: the dock buttons are named by their visible text, and announce their shortcut keys',
    old: [['aria-label="Open yard menu"', 'aria-keyshortcuts="G"'], ['aria-label="Toggle blueprint mode"', 'aria-keyshortcuts="B"']],
  },
  {
    date: '2026-11-14', what: 'Accessibility: the product logo names include their visible text "by Brightyard"',
    old: [[/aria-label="(Allocivo|Xessly) home"/g, 'aria-label="$1 by Brightyard, home"'],
          [/(<a class="logo plogo"[^>]*>(?:(?!<\/a>)[\s\S])*?<span>(?:Allocivo|Xessly))<small>/g, '$1 <small>']],   // the header logo only
  },
  {
    date: '2026-11-14', what: 'Accessibility: inner product pages have a main heading for screen readers ("Allocivo: How it works")',
    new: [/<h1 class="sr">[^<]*<\/h1>/g],
  },
];

/** The old HTML with the approved changes applied. */
export function acceptOld(html) {
  for (const c of ACCEPTED) for (const [a, b] of c.old || []) html = typeof a === 'string' ? html.split(a).join(b) : html.replace(a, b);
  return html;
}
/** The new HTML without the approved additions. */
export function acceptNew(html) {
  for (const c of ACCEPTED) for (const re of c.new || []) html = html.replace(re, '');
  return html;
}
