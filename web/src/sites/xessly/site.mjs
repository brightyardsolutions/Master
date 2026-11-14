// xessly.brightyard.in: name, pages, call to action and texts used by the product layout.
// `sections` lists the product blocks each page shows (ported as components in step 2).
export default {
  key: 'xessly',
  product: true,
  name: 'Xessly',
  short: 'xs',
  mark: 'mk-xs',
  url: 'https://xessly.brightyard.in',
  format: 'directory',
  description: 'Xessly: AI agents that find, fix and prove website and app accessibility issues, in your code or CMS.',
  cta: { label: 'Request early access', path: '/early-access/' },
  band: { title: 'Let the agents take your accessibility backlog.', text: 'Early access is open for teams with a live website or app. Tell us where it runs.' },
  blurb: 'AI agents that make websites and apps accessible.',
  routes: [
    { path: '/', file: 'index.astro', label: 'Overview', sections: ['prodhero', 's3', 'note', 'xs-problem', 'xs-routes'], title: 'Xessly | AI agents for website accessibility' },
    { path: '/agent-flow/', file: 'agent-flow.astro', label: 'Agent flow', sections: ['xs-how'], title: 'Agent flow | Xessly' },
    { path: '/where-fixes-land/', file: 'where-fixes-land.astro', label: 'Where fixes land', sections: ['xs-where'], title: 'Where fixes land | Xessly' },
    { path: '/early-access/', file: 'early-access.astro', label: 'Early access', sections: ['xs-access', 'xs-faq'], title: 'Early access | Xessly' },
    { path: '/404', file: '404.astro', title: 'Page not found | Xessly', noindex: true },
  ],
  anchors: { email: '', 'xs-problem': '', 'xs-routes': '', 'xs-who': '', 'xs-how': 'agent-flow/', 'xs-where': 'where-fixes-land/', 'xs-access': 'early-access/', 'xs-faq': 'early-access/' },
};
