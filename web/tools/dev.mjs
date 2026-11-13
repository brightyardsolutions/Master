// npm run dev            -> brightyard.in at http://localhost:4321
// npm run dev:allocivo   -> allocivo at http://localhost:4322
// npm run dev:xessly     -> xessly at http://localhost:4323
// Forms and the API do not work here; use `npx wrangler pages dev` on a build for those.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { siteKey } from '../src/sites/index.mjs';

const key = siteKey(process.argv[2]);
const port = { main: 4321, allocivo: 4322, xessly: 4323 }[key];
const astro = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const r = spawnSync(process.execPath, [astro, 'dev', '--port', String(port)], {
  cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'inherit', env: { ...process.env, ASTRO_SITE: key },
});
process.exit(r.status || 0);
