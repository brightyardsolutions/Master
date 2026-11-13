// Adds the pages of one site, so brightyard.in never contains the product sites' pages and the reverse.
// Page files live in src/sites/<site>/pages/ (not src/pages/, which Astro would publish for every site).
// After the build, each page gets <link rel="modulepreload"> for every script its entry imports, so the browser
// fetches them all at once (as the old site did with its plain <script> tags) instead of one after another.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITES } from '../sites/index.mjs';

function htmlFiles(dir) {
  return readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? htmlFiles(p) : f.endsWith('.html') ? [p] : []; });
}
function preloadScripts(dir) {
  const imports = url => {   // static imports of a built chunk (dynamic import() of the 3D scenes is left out on purpose)
    const code = readFileSync(join(dir, url), 'utf8');
    return [...code.matchAll(/(?:^|[;}])\s*import\s*(?:[\w${}\s,*]+from\s*)?["'](\.\.?\/[^"']+)["']/g)].map(m => posix.join(posix.dirname(url), m[1]));
  };
  for (const file of htmlFiles(dir)) {
    let html = readFileSync(file, 'utf8');
    const entries = [...html.matchAll(/<script type="module" src="([^"]+)"/g)].map(m => m[1]);
    const seen = new Set(entries), queue = [...entries];
    while (queue.length) for (const u of imports(queue.shift())) if (!seen.has(u)) { seen.add(u); queue.push(u); }
    const links = [...seen].filter(u => !entries.includes(u)).map(u => `<link rel="modulepreload" href="${u}">`).join('\n');
    if (links) { html = html.replace('</head>', links + '\n</head>'); writeFileSync(file, html); }
  }
}

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
      'astro:build:done': ({ dir }) => preloadScripts(fileURLToPath(dir)),
    },
  };
}
