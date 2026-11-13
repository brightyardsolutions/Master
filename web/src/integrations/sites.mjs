// Adds the pages of one site, so brightyard.in never contains the product sites' pages and the reverse.
// Page files live in src/sites/<site>/pages/ (not src/pages/, which Astro would publish for every site).
import { SITES } from '../sites/index.mjs';

export default function sites(key) {
  return {
    name: 'brightyard-sites',
    hooks: {
      'astro:config:setup': ({ injectRoute, logger }) => {
        const site = SITES[key];
        for (const r of site.routes) {
          injectRoute({ pattern: r.path, entrypoint: `./src/sites/${key}/pages/${r.file}`, prerender: true });
        }
        for (const f of ['robots.txt', 'sitemap.xml']) {
          injectRoute({ pattern: '/' + f, entrypoint: `./src/sites/shared/${f}.js`, prerender: true });
        }
        logger.info(`building ${site.name} (${site.url}): ${site.routes.length} pages`);
      },
    },
  };
}
