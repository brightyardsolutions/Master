// One Astro project, three sites. ASTRO_SITE picks which one is built: main (brightyard.in), allocivo or xessly.
// Each site lists its own pages in src/sites/<site>/site.mjs; the brightyard-sites hook adds only those pages.
import { defineConfig } from 'astro/config';
import { SITES, siteKey } from './src/sites/index.mjs';
import sites from './src/integrations/sites.mjs';

const KEY = siteKey(process.env.ASTRO_SITE);
const SITE = SITES[KEY];

export default defineConfig({
  site: SITE.url,
  outDir: `./dist/${KEY}`,
  publicDir: `./public/${KEY}`,
  // brightyard.in: /services (services.html). Product sites keep their folder addresses: /demo/ (demo/index.html).
  build: { format: SITE.format, inlineStylesheets: 'never' },
  trailingSlash: 'ignore',
  compressHTML: false,
  devToolbar: { enabled: false },
  integrations: [sites(KEY)],
  vite: {
    define: { 'import.meta.env.SITE_KEY': JSON.stringify(KEY) },
    // ship the stylesheet exactly as written: the minifier merges and rewrites rules, and the design must not change
    build: { cssMinify: false },
  },
});
