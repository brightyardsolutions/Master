// Accessibility: axe-core (WCAG 2.2 A and AA rules) on every page of the three sites, old and new, desktop and phone.
// Passes when the new pages have no finding that today's pages don't have. Known, accepted finding: the deliberately
// low-contrast "Sign in" button in the Xessly demo (the "before" state the agents fix). The two findings the old sites
// had (label-content-name-mismatch on the dock buttons and product logos, and inner product pages without a main
// heading) were fixed on 14 November 2026: they now fail the test wherever they appear, and every page must have
// exactly one <h1>.
// Run from web/ after `npm run build`:  npm run test:axe
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITES } from '../src/sites/index.mjs';
import { baseline } from './baseline.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const WEB = fileURLToPath(new URL('..', import.meta.url)), REPO = baseline();   // the old sites, from git history
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const serve = (dir, port) => new Promise(res => {
  const s = createServer((req, rsp) => {
    let f = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html'); else if (!existsSync(f) && existsSync(f + '.html')) f += '.html';
    let code = 200; if (!existsSync(f)) { f = join(dir, '404.html'); code = 404; }
    rsp.writeHead(code, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }); rsp.end(readFileSync(f));
  }).listen(port, () => res(s));
});
const servers = [await serve(REPO, 8380), await serve(join(REPO, 'sites/allocivo'), 8381), await serve(join(REPO, 'sites/xessly'), 8382),
  await serve(join(WEB, 'dist/main'), 8390), await serve(join(WEB, 'dist/allocivo'), 8391), await serve(join(WEB, 'dist/xessly'), 8392)];

const PAGES = [
  ...SITES.main.routes.filter(r => r.hash).map(r => ({ name: 'main' + r.path, old: 'http://localhost:8380/#/' + r.hash, new: 'http://localhost:8390' + r.path })),
  // the not-found page is new: compared with today's home page, which has the same shell (header, dock, footer)
  { name: 'main/404', old: 'http://localhost:8380/#/home', new: 'http://localhost:8390/no-such-page' },
  ...['allocivo', 'xessly'].flatMap((k, i) => SITES[k].routes.filter(r => r.sections).map(r => ({ name: k + r.path, old: `http://localhost:838${i + 1}${r.path}`, new: `http://localhost:839${i + 1}${r.path}` }))),
];
const ACCEPTED = f => f.id === 'color-contrast' && /xui|cta/.test(f.target);   // the Xessly demo's "before" button

const browser = await chromium.launch();
let failures = 0, checks = 0;
async function scan(u, vp) {
  const c = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' }); const p = await c.newPage();
  await p.goto(u); await p.waitForTimeout(1800);
  await p.addScriptTag({ content: AXE });
  // only the visible page counts (today's brightyard.in keeps every page in one document)
  const r = await p.evaluate(() => axe.run({ exclude: [['section.page:not(.on)']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
  await c.close();
  return r.violations.flatMap(v => v.nodes.map(n => ({ id: v.id, target: n.target.join(' ') })));
}
async function h1Count(u, vp) {
  const c = await browser.newContext({ viewport: vp }); const p = await c.newPage();
  await p.goto(u); await p.waitForTimeout(600);
  const n = await p.evaluate(() => document.querySelectorAll('h1').length); await c.close(); return n;
}
try {
  for (const [label, vp] of Object.entries({ desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } })) {
    for (const P of PAGES) {
      const now = await scan(P.new, vp), before = P.old ? await scan(P.old, vp) : [];
      const had = new Set(before.map(f => f.id));
      const fresh = now.filter(f => (!had.has(f.id) || f.id === 'label-content-name-mismatch') && !ACCEPTED(f));
      const h1 = await h1Count(P.new, vp);
      checks++; if (h1 !== 1) { failures++; console.log(`  FAIL ${P.name} ${label}: ${h1} main headings (<h1>), expected 1`); }
      checks++;
      if (fresh.length) { failures++; console.log(`  FAIL ${P.name} ${label}: new findings ${JSON.stringify(fresh.slice(0, 4))}`); }
      if (process.env.SHOW) console.log(`  ${P.name} ${label}: old ${before.length}, new ${now.length}${now.length ? ' ' + JSON.stringify([...new Set(now.map(f => f.id))]) : ''}`);
    }
  }
} finally { await browser.close(); servers.forEach(s => s.close()); }
console.log(`\n${checks - failures} of ${checks} pages have no new accessibility findings` + (failures ? `, ${failures} do` : ''));
process.exit(failures ? 1 : 0);
