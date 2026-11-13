// allocivo.brightyard.in. Settings carried over unchanged from build-src/src/products.py.
// `sections` lists the product blocks each page shows (ported as components in step 2).
export default {
  key: 'allocivo',
  product: true,
  name: 'Allocivo',
  short: 'al',
  mark: 'mk-al',
  url: 'https://allocivo.brightyard.in',
  format: 'directory',
  description: "Allocivo: AI agents that turn hotel workforce availability into action. Spots rooms at risk, moves the work to the right person and gets a supervisor's OK.",
  cta: { label: 'Book a demo', path: '/demo/' },
  band: { title: 'Show us how your hotel works.', text: "Thirty minutes with our team. We'll explore where better coordination could help, and say so if it won't." },
  blurb: 'Real-time workforce orchestration for hotels.',
  routes: [
    { path: '/', file: 'index.astro', label: 'Overview', sections: ['prodhero', 's3', 'note', 'al-value'], title: 'Allocivo | AI agents for hotel operations' },
    { path: '/how-it-works/', file: 'how-it-works.astro', label: 'How it works', sections: ['al-problem', 'al-how', 'al-uses'], title: 'How it works | Allocivo' },
    { path: '/integrations/', file: 'integrations.astro', label: 'Integrations', sections: ['al-systems'], title: 'Integrations | Allocivo' },
    { path: '/demo/', file: 'demo.astro', label: 'Book a demo', sections: ['al-demo'], title: 'Book a demo | Allocivo' },
    { path: '/404', file: '404.astro', title: 'Page not found | Allocivo', noindex: true },
  ],
  // which page each section id lives on (as products.py worked it out), for links like #/allocivo/al-how
  anchors: { 'al-value': '', 'al-calc': '', 'al-problem': 'how-it-works/', 'al-how': 'how-it-works/', 'al-uses': 'how-it-works/', 'al-systems': 'integrations/', 'al-demo': 'demo/' },
};
