// npm run build                -> builds ASTRO_SITE if it is set (Cloudflare), otherwise all three sites
// npm run build:allocivo       -> builds one site
// Output: dist/main, dist/allocivo, dist/xessly. Works on Windows too (no shell variables needed).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SITES, siteKey } from '../src/sites/index.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const astro = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const want = process.argv[2] || process.env.ASTRO_SITE;
const keys = want ? [siteKey(want)] : Object.keys(SITES);

const run = (args, env = {}) => {
  const r = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status || 1);
};

run([fileURLToPath(new URL('./build-functions.mjs', import.meta.url))]);
for (const key of keys) {
  console.log(`\n=== ${SITES[key].name}: ${SITES[key].url} -> dist/${key} ===`);
  run([astro, 'build'], { ASTRO_SITE: key });
}
