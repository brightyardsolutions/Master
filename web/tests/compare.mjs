// Compares the new Astro pages with today's live files, page by page.
//   1. the page shell (head, header, mega menu, footer, dock, templates, data): same HTML, once old #/ links
//      are converted with the link table; the stylesheet: same text;
//   2. screenshots of the header and footer on desktop and phone: identical pixels;
//   3. every page's content: same HTML, and identical full-page screenshots on desktop and phone;
//   4. old brightyard.in/#/... addresses forward to the right new page.
// Both sides run with JavaScript off, because the scripts are ported in step 3.
// Run from web/ after `npm run build`:  npm run test:compare
// Starts its own servers. Screenshots of any difference go to tests/out/.
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITES } from '../src/sites/index.mjs';
import { baseline } from './baseline.mjs';
import { link, mainLink } from '../src/lib/links.mjs';
import { NO_SCRIPT_CSS } from '../src/lib/page.mjs';

// For screenshots both pages get the same conditions: the page content is hidden (except the closing band) so the fixed
// header is shot over the same background, floating buttons are hidden, and the no-JavaScript rules apply to both.
// brightyard.in pages are compared with all content hidden; product pages keep only their closing band.
const SHOT_CSS = NO_SCRIPT_CSS + 'html:not([data-product]) main{display:none!important}main section.page>:not(.sec:has(.band)){display:none!important}#dock,#astb,#astp{display:none!important}'
  // with the content hidden the band becomes the first section, which new.css pads by 168px (.page>.sec:first-child): pin it
  + 'main section.page>.sec:has(.band){padding-top:40px!important}';
// while shooting the footer or the band, the fixed bars at the top are hidden so they cannot overlap them
const NO_TOP_BARS = '#hdr,#draftbar,#prog{visibility:hidden!important}';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const WEB = fileURLToPath(new URL('..', import.meta.url));
const REPO = baseline();   // the old sites, from git history (tests/baseline.mjs)
const OUT = join(WEB, 'tests/out');
mkdirSync(OUT, { recursive: true });

// ---------- tiny static server: /x -> x.html, /x/ -> x/index.html, unknown -> 404.html
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };
function serve(dir, port) {
  return new Promise(res => {
    const s = createServer((req, rsp) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let f = join(dir, p);
      if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
      else if (!existsSync(f) && existsSync(f + '.html')) f = f + '.html';
      let code = 200;
      if (!existsSync(f)) { f = join(dir, '404.html'); code = 404; }
      rsp.writeHead(code, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
      rsp.end(readFileSync(f));
    }).listen(port, () => res(s));
  });
}

// ---------- normalising HTML so only real differences count
const oldHref = here => html => html
  .replace(/href="https:\/\/brightyard\.in\/#\/([^"]*)"/g, (_, t) => `href="${mainLink(t, true)}"`)
  .replace(/href="#\/([^"]*)"/g, (_, t) => `href="${link(t, here)}"`);
const norm = html => html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

const SHELL_MAIN = ['#pre', '#pt', 'body > svg[width="0"]', '#draftbar', '#prog', 'a.skip', '#hdr', 'footer', '#astb', '#astp', '#tpl-al', '#tpl-xs', '#dock', '#bhint', '#bp', '#bring', '#gl', '#bp-tpl'];
const SHELL_PRODUCT = ['#pt', 'body > svg[width="0"]', '#prog', 'a.skip', '#hdr', 'footer', '#tpl-al', '#tpl-xs', '.band'];
const HEAD = ['title', 'meta[name="description"]', 'meta[name="theme-color"]', 'link[rel="canonical"]', 'meta[name="robots"]', 'meta[property="og:type"]', 'meta[property="og:site_name"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]', 'link[rel="icon"]'];

let failures = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { failures++; console.log('  FAIL ' + msg); } };

async function grab(page, sels) {
  return page.evaluate(sels => Object.fromEntries(sels.map(s => [s, document.querySelector(s)?.outerHTML ?? null])), sels);
}

async function comparePair(ctx, name, oldUrl, newUrl, sels, here, { head = [], expectHead = {} } = {}) {
  const a = await ctx.newPage(), b = await ctx.newPage();
  await a.goto(oldUrl); await b.goto(newUrl);
  await a.evaluate(() => document.fonts.ready); await b.evaluate(() => document.fonts.ready);
  const attrs = p => p.evaluate(() => [...document.documentElement.attributes].map(x => x.name + '="' + x.value + '"').sort().join(' ') + ' | body class="' + document.body.className + '"');
  const [ha, hb] = [await attrs(a), await attrs(b)];
  ok(ha === hb, `${name}: <html>/<body> attributes\n    old: ${ha}\n    new: ${hb}`);
  const A = await grab(a, sels), B = await grab(b, sels);
  for (const s of sels) {
    const x = A[s] == null ? null : norm(oldHref(here)(A[s])), y = B[s] == null ? null : norm(B[s]);
    ok(y !== null, `${name}: ${s} missing on the new page`);
    if (x !== y && y !== null) {
      let i = 0; while (x && x[i] === y[i]) i++;
      ok(false, `${name}: ${s} differs at ${i}\n    old: ${x?.slice(Math.max(0, i - 60), i + 80)}\n    new: ${y.slice(Math.max(0, i - 60), i + 80)}`);
    } else checks++;
  }
  if (head.length) {
    const HA = await grab(a, head), HB = await grab(b, head);
    for (const s of head) {
      const want = s in expectHead ? expectHead[s] : HA[s];
      ok(want === HB[s], `${name}: head ${s}\n    want: ${want}\n    new:  ${HB[s]}`);
    }
  }
  await a.close(); await b.close();
}

// Screenshots must match pixel for pixel. If a future change makes the browser render an element at a different
// spot on the page (gradients and curved edges can then shift by a few levels), raise this a little, never above ~8:
// the stylesheet and HTML checks above stay exact either way.
const TOLERANCE = 0;
async function pixelDiff(page, x, y) {
  return page.evaluate(async ([a, b]) => {
    const load = async src => { const i = new Image(); i.src = 'data:image/png;base64,' + src; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height); };
    const [A, B] = [await load(a), await load(b)];
    if (A.width !== B.width || A.height !== B.height) return { sameSize: false };
    let max = 0, count = 0;
    for (let i = 0; i < A.data.length; i += 4) { const m = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2])); if (m) { count++; if (m > max) max = m; } }
    return { sameSize: true, max, count };
  }, [x.toString('base64'), y.toString('base64')]);
}

async function compareShots(browser, name, oldUrl, newUrl, sels, viewport) {
  for (const [label, vp] of Object.entries(viewport)) {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: vp, deviceScaleFactor: 1 });
    const a = await ctx.newPage(), b = await ctx.newPage();
    await a.goto(oldUrl); await b.goto(newUrl);
    for (const p of [a, b]) { await p.evaluate(css => { const st = document.createElement("style"); st.textContent = css; document.head.append(st); }, SHOT_CSS); await p.evaluate(() => document.fonts.ready); }
    for (const s of sels) {
      if (s !== '#hdr') for (const p of [a, b]) await p.evaluate(css => { const st = document.createElement('style'); st.textContent = css; document.head.append(st); }, NO_TOP_BARS);
      const x = await a.locator(s).first().screenshot({ animations: 'disabled' });
      const y = await b.locator(s).first().screenshot({ animations: 'disabled' });
      const d = Buffer.compare(x, y) === 0 ? { same: true } : await pixelDiff(b, x, y);
      const same = d.same || (d.sameSize && d.max <= TOLERANCE);
      ok(same, `${name} ${label}: screenshot of ${s} differs (${d.sameSize === false ? 'different size' : `${d.count} pixels, up to ${d.max}/255`}; saved to tests/out)`);
      if (!same) { const f = `${name}-${label}-${s.replace(/\W+/g, '')}`.replace(/\W+/g, '_'); writeFileSync(join(OUT, f + '-old.png'), x); writeFileSync(join(OUT, f + '-new.png'), y); }
    }
    await ctx.close();
  }
}

const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const servers = [
  await serve(REPO, 8380), await serve(join(REPO, 'sites/allocivo'), 8381), await serve(join(REPO, 'sites/xessly'), 8382),
  await serve(join(WEB, 'dist/main'), 8390), await serve(join(WEB, 'dist/allocivo'), 8391), await serve(join(WEB, 'dist/xessly'), 8392),
];
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ javaScriptEnabled: false });

  console.log('brightyard.in: shell on every page');
  for (const r of SITES.main.routes) {
    const url = 'http://localhost:8390' + (r.path === '/404' ? '/no-such-page' : r.path);
    await comparePair(ctx, 'main' + r.path, 'http://localhost:8380/', url, SHELL_MAIN, 'main', {
      head: HEAD,
      expectHead: {
        title: `<title>${r.title}</title>`,
        'link[rel="canonical"]': r.noindex ? null : `<link rel="canonical" href="https://brightyard.in${r.path}">`,
        'meta[name="robots"]': r.noindex ? '<meta name="robots" content="noindex">' : null,
        'link[rel="icon"]': '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
      },
    });
  }
  const page = await ctx.newPage();
  await page.goto('http://localhost:8390/');
  const data = await page.evaluate(() => document.getElementById('bp-master').textContent);
  const oldData = readFileSync(join(REPO, 'index.html'), 'utf8').match(/id="bp-master">([\s\S]*?)<\/script>/)[1];
  ok(JSON.stringify(JSON.parse(data)) === JSON.stringify(JSON.parse(oldData)), 'main: blueprint master data differs');
  await compareShots(browser, 'main', 'http://localhost:8380/', 'http://localhost:8390/', ['#hdr', 'footer'], VIEWPORTS);

  console.log('Stylesheet: same text as today\'s site.css (font file names aside)');
  for (const [key, port] of [['main', 0], ['allocivo', 1], ['xessly', 2]]) {
    const href = await page.evaluate(() => document.querySelector('link[rel=stylesheet]').getAttribute('href'));
    const p2 = await ctx.newPage(); await p2.goto(`http://localhost:839${port}/`);
    const h = await p2.evaluate(() => [...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.getAttribute('href')));
    await p2.close();
    ok(h.length === 1, `${key}: expected one stylesheet, found ${h.length}`);
    const css = readFileSync(join(WEB, 'dist', key, h[0]), 'utf8').replace(/url\(\/_astro\/([\w-]+)\.[\w-]+\.woff2\)/g, 'url(FONT/$1.woff2)');
    const old = readFileSync(join(REPO, key === 'main' ? 'assets/css/site.css' : `sites/${key}/assets/css/site.css`), 'utf8').replace(/url\(\.\.\/fonts\/([\w-]+)\.woff2\)/g, 'url(FONT/$1.woff2)');
    const n = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();   // comments do not change the page
    if (n(css) !== n(old)) { let i = 0; const x = n(old), y = n(css); while (x[i] === y[i]) i++; ok(false, `${key}: stylesheet differs at ${i}\n    old: ${x.slice(i - 80, i + 80)}\n    new: ${y.slice(i - 80, i + 80)}`); } else checks++;
  }

  for (const [key, port] of [['allocivo', 1], ['xessly', 2]]) {
    const S = SITES[key];
    console.log(`${S.name}: shell on every page`);
    for (const r of S.routes) {
      const nf = r.path === '/404';
      const oldUrl = `http://localhost:838${port}` + (nf ? '/no-such-page' : r.path);
      const newUrl = `http://localhost:839${port}` + (nf ? '/no-such-page' : r.path);
      await comparePair(ctx, key + r.path, oldUrl, newUrl, nf ? [...SHELL_PRODUCT.filter(s => s !== '.band'), 'main'] : SHELL_PRODUCT.filter(s => s !== '.band' || r.path !== S.cta.path), key, {
        head: HEAD,
        expectHead: {
          'link[rel="icon"]': '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
          // accepted: today's 404 pages carry the overview's share title (copied by products.py); the new ones name the page
          ...(nf ? { 'meta[property="og:title"]': `<meta property="og:title" content="${r.title}">` } : {}),
        },
      });
    }
    await compareShots(browser, key, `http://localhost:838${port}/how-it-works/`.replace('how-it-works', key === 'xessly' ? 'agent-flow' : 'how-it-works'),
      `http://localhost:839${port}/` + (key === 'xessly' ? 'agent-flow/' : 'how-it-works/'), ['#hdr', 'footer'], VIEWPORTS);   // the band is covered by the full-page screenshots below
  }

  console.log('Whole pages: same content, identical full-page screenshots on desktop and phone');
  const strip = h => h.replace(/<!--[\s\S]*?-->/g, '');
  // today's brightyard.in is one page with every section in it: show the wanted one, as the router would
  const showOld = (p, id) => p.evaluate(id => document.querySelectorAll('.page').forEach(s => s.classList.toggle('on', s.id === 'p-' + id)), id);
  const PAGES = [
    ...SITES.main.routes.filter(r => r.hash).map(r => ({ name: 'main' + r.path, here: 'main', oldUrl: 'http://localhost:8380/', oldId: r.id, newUrl: 'http://localhost:8390' + r.path })),
    ...['allocivo', 'xessly'].flatMap((k, i) => SITES[k].routes.filter(r => r.sections).map(r => ({ name: k + r.path, here: k, oldUrl: `http://localhost:838${i + 1}${r.path}`, newUrl: `http://localhost:839${i + 1}${r.path}` }))),
  ];
  for (const P of PAGES) {
    const a = await ctx.newPage(), b = await ctx.newPage();
    await a.goto(P.oldUrl); await b.goto(P.newUrl);
    if (P.oldId) await showOld(a, P.oldId);
    const x = norm(strip(oldHref(P.here)(await a.evaluate(s => document.querySelector(s).innerHTML, P.oldId ? '#p-' + P.oldId : 'main'))));
    const y = norm(strip(await b.evaluate(s => document.querySelector(s).innerHTML, P.oldId ? 'section.page.on' : 'main')));
    if (x !== y) { let i = 0; while (x[i] === y[i]) i++; ok(false, `${P.name}: page content differs at ${i}\n    old: ${x.slice(Math.max(0, i - 80), i + 100)}\n    new: ${y.slice(Math.max(0, i - 80), i + 100)}`); } else checks++;
    await a.close(); await b.close();
  }
  for (const [label, vp] of Object.entries(VIEWPORTS)) {
    const sctx = await browser.newContext({ javaScriptEnabled: false, viewport: vp, deviceScaleFactor: 1 });
    for (const P of PAGES) {
      const a = await sctx.newPage(), b = await sctx.newPage();
      await a.goto(P.oldUrl); await b.goto(P.newUrl);
      if (P.oldId) await showOld(a, P.oldId);
      for (const p of [a, b]) { await p.evaluate(css => { const st = document.createElement('style'); st.textContent = css; document.head.append(st); }, NO_SCRIPT_CSS); await p.evaluate(() => document.fonts.ready); }
      const x = await a.screenshot({ fullPage: true, animations: 'disabled' }), y = await b.screenshot({ fullPage: true, animations: 'disabled' });
      const d = Buffer.compare(x, y) === 0 ? { same: true } : await pixelDiff(b, x, y);
      const same = d.same || (d.sameSize && d.max <= TOLERANCE);
      ok(same, `${P.name} ${label}: full-page screenshot differs (${d.sameSize === false ? 'different size' : `${d.count} pixels, up to ${d.max}/255`}; saved to tests/out)`);
      if (!same) { const f = `page-${P.name}-${label}`.replace(/\W+/g, '_'); writeFileSync(join(OUT, f + '-old.png'), x); writeFileSync(join(OUT, f + '-new.png'), y); }
      await a.close(); await b.close();
    }
    await sctx.close();
  }

  console.log('brightyard.in: old #/ addresses');
  const js = await browser.newContext();
  const fp = await js.newPage();
  await fp.route(/https:\/\/(allocivo|xessly)\.brightyard\.in\/.*/, r => r.fulfill({ status: 200, contentType: 'text/html', body: 'product' }));
  const cases = [
    ['#/services', '/services'], ['#/services/svc-eng', '/services#svc-eng'], ['#/how', '/how-we-work'], ['#/how/pressb', '/how-we-work#pressb'],
    ['#/work', '/work'], ['#/insights', '/insights'], ['#/contact', '/contact'], ['#/privacy', '/privacy'], ['#/products', '/products'],
    ['#/allocivo', 'https://allocivo.brightyard.in/'], ['#/allocivo/al-demo', 'https://allocivo.brightyard.in/demo/'],
    ['#/allocivo/al-how', 'https://allocivo.brightyard.in/how-it-works/#al-how'], ['#/xessly/xs-access', 'https://xessly.brightyard.in/early-access/'],
    ['#/xessly/xs-who', 'https://xessly.brightyard.in/#xs-routes'],
    ['#/home/bpgen', '/#/home/bpgen'], ['#/plan/abc123', '/#/plan/abc123'],
  ];
  for (const [from, to] of cases) {
    await fp.goto('http://localhost:8390/' + from);
    await fp.waitForLoadState('load');
    const u = new URL(fp.url()), got = u.origin === 'http://localhost:8390' ? u.pathname.replace(/\.html$/, '') + u.hash : u.href;
    ok(got === to, `forward ${from}: expected ${to}, got ${got}`);
  }
  await js.close();
} finally {
  await browser.close();
  servers.forEach(s => s.close());
}
console.log(`\n${checks - failures} of ${checks} checks passed` + (failures ? `, ${failures} failed` : ''));
process.exit(failures ? 1 : 0);
