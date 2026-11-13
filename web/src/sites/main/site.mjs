// brightyard.in. Titles are the data-title values of the current index.html pages.
export default {
  key: 'main',
  name: 'Brightyard',
  url: 'https://brightyard.in',
  format: 'file',
  description: "Brightyard designs, builds and runs software for teams that can't afford downtime, and makes Allocivo and Xessly.",
  routes: [
    { path: '/', file: 'index.astro', id: 'home', hash: 'home', title: 'Brightyard | Software built for what happens next' },
    { path: '/services', file: 'services.astro', id: 'services', hash: 'services', title: 'Services | Brightyard' },
    { path: '/products', file: 'products.astro', id: 'products', hash: 'products', title: 'Allocivo and Xessly | Brightyard products' },
    { path: '/how-we-work', file: 'how-we-work.astro', id: 'how', hash: 'how', title: 'How we work | Brightyard playbook' },
    { path: '/work', file: 'work.astro', id: 'work', hash: 'work', title: 'Case studies | Brightyard' },
    { path: '/insights', file: 'insights.astro', id: 'insights', hash: 'insights', title: 'Insights | Brightyard field notes' },
    { path: '/contact', file: 'contact.astro', id: 'contact', hash: 'contact', title: 'Contact Brightyard' },
    { path: '/privacy', file: 'privacy.astro', id: 'privacy', hash: 'privacy', title: 'Privacy | Brightyard' },
    { path: '/404', file: '404.astro', id: 'notfound', title: 'Page not found | Brightyard', noindex: true },
  ],
};
