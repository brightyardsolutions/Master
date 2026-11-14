// Behaviour check: runs the same actions on today's live files and on the new pages, with scripts on, and compares
// what comes out. Run from web/ after `npm run build`:  npm run test:behaviour      (one part: ONLY=forms)
//
//   still     every page with reduced motion and a fixed random seed: page HTML after the scripts ran, and
//             full-page screenshots (desktop and phone) must match today's exactly
//   menu      mega menu: hover intent, switching panels, Escape; Yardie in the Services menu reading a brief
//   brief     a brief typed to Yardie in the menu on another page runs on the home page's generator
//   generator brief to blueprint (3D solution model), chapters, "Email me this blueprint" and the review (API mocked)
//   fallback  the same without 3D: four cards, and "Send this plan" fills the contact form
//   share     a shared plan link (#/plan/…) opens the generator and runs the brief
//   keys      yard menu (G, then 3), Blueprint mode (B), the single-key switch
//   widgets   assistant, hero audience toggle, product card steps, case filters
//   forms     contact form, Allocivo demo and Xessly early access: errors, then a mocked send
//   product   Allocivo calculator, live board and story; Xessly agent run
//   phone     phone menu: opens into its links, Escape closes and returns focus
//   pages     new site only: links play the curtain and land on the page with its heading focused, back
//             restores the page, the preloader shows once per session and only on the home page
// Starts its own servers. Differences are printed; screenshots of any that differ go to tests/out/.
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITES } from '../src/sites/index.mjs';
import { baseline } from './baseline.mjs';
import { acceptOld, acceptNew } from './accepted.mjs';
import { link, mainLink } from '../src/lib/links.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const WEB = fileURLToPath(new URL('..', import.meta.url)), REPO = baseline(), OUT = join(WEB, 'tests/out');   // REPO: the old sites, from git history
mkdirSync(OUT, { recursive: true });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const want = part => !ONLY || ONLY.includes(part);

// ---------- servers: today's files on 838x, the new build on 839x
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' };
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

// ---------- addresses: the same page on each side
const PORT = { main: 0, allocivo: 1, xessly: 2 };
const MAINR = Object.fromEntries(SITES.main.routes.filter(r => r.hash).map(r => [r.id, r]));
function url(side, site, page = 'home', hash = '') {
  const base = `http://localhost:${side === 'old' ? 838 : 839}${PORT[site]}`;
  if (site !== 'main') return base + page + hash;                       // product sites: same paths on both sides
  if (side === 'old') return base + '/#/' + page + (hash ? '/' + hash.slice(1) : '');
  return base + MAINR[page].path + hash;
}
const oldHref = here => h => h.replace(/href="https:\/\/brightyard\.in\/#\/([^"]*)"/g, (_, t) => `href="${mainLink(t, true)}"`).replace(/href="#\/([^"]*)"/g, (_, t) => `href="${link(t, here)}"`);
const norm = h => h.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
// "where am I": the page id on either side
const where = p => p.evaluate(() => { const s = document.querySelector('section.page.on'); return s ? s.id.slice(2) : null; });

// ---------- results
let checks = 0, failures = 0;
const ok = (cond, msg) => { checks++; if (!cond) { failures++; console.log('  FAIL ' + msg); } };
function same(name, a, b) {
  const x = JSON.stringify(a), y = JSON.stringify(b);
  if (x === y) { checks++; return; }
  let i = 0; while (x[i] === y[i]) i++;
  ok(false, `${name}\n    old: ${x.slice(Math.max(0, i - 120), i + 160)}\n    new: ${y.slice(Math.max(0, i - 120), i + 160)}`);
}

// ---------- browsers: one with 3D (software WebGL, as build-src/tests/model-test.js), one without
const gl3d = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const no3d = await chromium.launch({ args: ['--disable-gpu', '--disable-webgl', '--disable-3d-apis'] });
const SEED = `(() => { let s = 42; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();`;
async function ctx(browser, o = {}) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...o });
  await c.addInitScript(SEED);
  c.errors = [];
  c.on('page', p => { p.on('pageerror', e => c.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/status of 404|Failed to load resource/.test(m.text())) c.errors.push(m.text()); }); });
  return c;
}
async function both(name, fn, o = {}, browser = no3d) {
  const out = {};
  for (const side of ['old', 'new']) {
    const c = await ctx(browser, o);
    try { out[side] = await fn(c, side); } catch (e) { out[side] = 'threw: ' + e.message.split('\n')[0]; }
    ok(!c.errors.length, `${name} (${side}): script errors ${JSON.stringify(c.errors.slice(0, 3))}`);
    await c.close();
  }
  for (const side of ['old', 'new']) ok(!(typeof out[side] === 'string' && out[side].startsWith('threw')), `${name} (${side}) did not finish: ${out[side]}`);
  same(name, out.old, out.new);
  if (process.env.SHOW) console.log('   ', name, JSON.stringify(out.new).slice(0, +process.env.SHOW || 600));
  return out;
}
// pixel comparison of two PNG screenshots, done in a blank browser page
async function pixelDiff(x, y) {
  const c = await no3d.newContext(), p = await c.newPage();
  const d = await p.evaluate(async ([a, b]) => {
    const load = async src => { const i = new Image(); i.src = 'data:image/png;base64,' + src; await i.decode(); const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height; const g = cv.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height); };
    const [A, B] = [await load(a), await load(b)];
    if (A.width !== B.width || A.height !== B.height) return { size: true, max: 255 };
    let max = 0, count = 0;
    for (let i = 0; i < A.data.length; i += 4) { const m = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2])); if (m) { count++; if (m > max) max = m; } }
    return { max, count };
  }, [x.toString('base64'), y.toString('base64')]);
  await c.close(); return d;
}
// mocked API: records what was posted and answers like the real one
async function mockApi(c) {
  const posts = [];
  await c.route('**/api/**', async r => {
    const req = r.request(), body = req.postDataJSON ? (() => { try { return req.postDataJSON(); } catch (e) { return req.postData(); } })() : null;
    posts.push({ path: new URL(req.url()).pathname, body });
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 'lead-1' }) });
  });
  return posts;
}

try {
  // =========================================================== still
  if (want('still')) {
    console.log('still: every page, reduced motion, after the scripts ran');
    const PAGES = [...Object.keys(MAINR).map(id => ['main', id]), ...['allocivo', 'xessly'].flatMap(k => SITES[k].routes.filter(r => r.sections).map(r => [k, r.path]))];
    const SHELL = ['#hdr', 'footer', '#dock', '#gl', '#astp', '#tpl-al', '#tpl-xs'];
    for (const [site, page] of PAGES) {
      const name = site + (site === 'main' ? '/' + page : page);
      const grab = async (c, side) => {
        const p = await c.newPage(); await p.goto(url(side, site, page)); await p.waitForTimeout(1500);
        const html = await p.evaluate(sels => {
          const out = { page: document.querySelector('section.page.on').innerHTML, body: document.body.className, html: document.documentElement.className };
          for (const s of sels) { const e = document.querySelector(s); out[s] = e ? e.outerHTML : null; }
          return out;
        }, SHELL);
        for (const k of Object.keys(html)) html[k] = norm(side === 'old' ? acceptOld(oldHref(site)(html[k] || '')) : acceptNew(html[k] || ''));
        // the parent menu is marked on child pages (decided for step 3; the old site did so only after an in-site move)
        html['#hdr'] = html['#hdr'].replace(/ class="mmb on"/g, ' class="mmb"');
        return html;
      };
      await both(`still ${name}: page after scripts`, grab, { reducedMotion: 'reduce' });
      for (const [label, vp] of Object.entries({ desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } })) {
        const shots = {};
        for (const side of ['old', 'new']) {
          const c = await ctx(no3d, { reducedMotion: 'reduce', viewport: vp });
          const p = await c.newPage(); await p.goto(url(side, site, page)); await p.waitForTimeout(1500);
          await p.evaluate(() => document.fonts.ready);
          await p.evaluate(() => { for (const b of document.querySelectorAll('.mmb.on')) b.classList.remove('on'); });
          shots[side] = await p.screenshot({ fullPage: true }); await c.close();
        }
        const d = Buffer.compare(shots.old, shots.new) === 0 ? { max: 0 } : await pixelDiff(shots.old, shots.new);
        const eq = d.max <= 2;   // translucent, blurred buttons can round one level differently; real changes move pixels far more
        ok(eq, `still ${name} ${label}: full-page screenshot differs (${d.size ? 'different size' : d.count + ' pixels, up to ' + d.max + '/255'}; saved to tests/out)`);
        if (!eq) for (const s of ['old', 'new']) writeFileSync(join(OUT, `still-${name.replace(/\W+/g, '_')}-${label}-${s}.png`), shots[s]);
      }
    }
  }

  // =========================================================== menu
  if (want('menu')) {
    console.log('menu: mega menu and Yardie in the Services menu');
    await both('mega menu: hover intent, switch, Escape', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'services')); await p.waitForTimeout(2500);
      const st = () => p.evaluate(() => ({ open: [...document.querySelectorAll('.mm.open .mmb')].map(b => b.textContent.trim()), on: document.getElementById('hdr').classList.contains('mm-on') }));
      const r = [];
      await p.hover('.mm:nth-of-type(1) .mmb'); await p.waitForTimeout(60); r.push(await st()); await p.waitForTimeout(300); r.push(await st());
      await p.hover('[aria-controls="mm-products"]'); await p.waitForTimeout(120); r.push(await st());
      await p.keyboard.press('Escape'); await p.waitForTimeout(100); r.push(await st(), await p.evaluate(() => document.activeElement.getAttribute('aria-controls')));
      await p.click('[aria-controls="mm-res"]'); await p.waitForTimeout(200); r.push(await st());
      await p.mouse.click(700, 700); await p.waitForTimeout(200); r.push(await st());
      return r;
    });
    await both('Yardie in the Services menu reads a brief', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'contact')); await p.waitForTimeout(2500);
      await p.click('[aria-controls="mm-services"]'); await p.waitForTimeout(400);
      const r = [];
      for (const t of ['our checkout crashes on sale days', 'housekeeping in our hotel is always late', 'our website fails screen readers', 'blah']) {
        await p.fill('#yrIn', t); await p.waitForTimeout(700);
        r.push(await p.evaluate(() => ({ bub: document.getElementById('yrBub').innerHTML, match: [...document.querySelectorAll('.mml1 a.match')].map(a => a.dataset.svc), prev: document.getElementById('svPrev').innerHTML })));
      }
      return r.map(x => ({ ...x, bub: oldHref('main')(x.bub), prev: oldHref('main')(x.prev) }));
    });
  }

  // =========================================================== brief from the menu on another page
  if (want('brief')) {
    console.log('brief: Yardie in the menu hands the brief to the home page');
    await both('brief typed in the menu on Services runs on the home page', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'services')); await p.waitForTimeout(2500);
      await p.click('[aria-controls="mm-services"]'); await p.waitForTimeout(400);
      await p.fill('#yrIn', 'Nine spreadsheets run our reporting and nobody trusts the numbers.'); await p.waitForTimeout(500);
      await p.press('#yrIn', 'Enter'); await p.waitForTimeout(9000);
      return { page: await where(p), result: await p.evaluate(() => { const t = document.querySelector('.bres:not([hidden]) .bh-t, .bres:not([hidden]) .bc-t'); return t && t.textContent; }),
        brief: await p.inputValue('#bpt'), inView: await p.evaluate(() => { const r = document.getElementById('bpgen').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }) };
    }, {}, gl3d);
  }

  // =========================================================== generator (3D) and lead flow
  if (want('generator')) {
    console.log('generator: brief to blueprint with the 3D model, then the lead dialog');
    for (const ex of [0, 2, 4]) {
      await both(`generator: example ${ex}, chapters, email pack, review`, async (c, side) => {
        const posts = await mockApi(c);
        const p = await c.newPage(); await p.goto(url(side, 'main', 'home', '#bpgen')); await p.waitForTimeout(4000);
        await p.evaluate(() => document.querySelector('.bpg').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2500);
        const r = { live: await p.evaluate(() => document.getElementById('bud').className) };
        await p.click(`.bpex button >> nth=${ex}`); await p.waitForTimeout(800);
        r.sig = await p.evaluate(() => [...document.querySelectorAll('#bpsig .bps')].map(s => s.textContent));
        await p.click('#bpgo'); await p.waitForTimeout(3500);
        r.chapters = []; r.links = [];
        for (let i = 0; i < 4; i++) {
          if (i) { await p.click(`.bh-tabs button >> nth=${i}`); await p.waitForTimeout(900); }
          r.chapters.push(await p.evaluate(() => [document.querySelector('.bh-body').textContent, [...document.querySelectorAll('.bh-tabs button')].map(b => b.getAttribute('aria-selected')).join()]));
          r.links.push(...await p.evaluate(() => [...document.querySelectorAll('.bres a')].map(a => a.getAttribute('href'))));
        }
        await p.click('.bh-send'); await p.waitForTimeout(500);
        r.dialog1 = await p.evaluate(() => document.querySelector('dialog.bpd .bpd-b').textContent);
        await p.fill('#bpd-email', 'test@example.com'); await p.click('.bpd-go'); await p.waitForTimeout(800);
        r.dialog2 = await p.evaluate(() => document.querySelector('dialog.bpd .bpd-b').textContent);
        await p.fill('#bpd-name', 'Ada'); await p.fill('#bpd-company', 'Acme'); await p.selectOption('#bpd-role', { index: 2 }); await p.selectOption('#bpd-timing', { index: 1 });
        await p.click('.bpd-go'); await p.waitForTimeout(800);
        r.dialog3 = await p.evaluate(() => document.querySelector('dialog.bpd .bpd-b').textContent);
        r.posts = posts.map(x => ({ path: x.path, body: x.body && (x.body.e ? { e: x.body.e } : { ...x.body }) })).filter(x => x.path !== '/api/event');
        r.events = posts.filter(x => x.path === '/api/event').length;
        r.links = r.links.map(h => (h && h.startsWith('#/') ? link(h.slice(2), 'main') : h));
        return r;
      }, {}, gl3d);
    }
  }

  // =========================================================== fallback without 3D
  if (want('fallback')) {
    console.log('fallback: cards instead of 3D, and "Send this plan"');
    await both('generator without 3D: cards, then the plan goes to the contact form', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'home', '#bpgen')); await p.waitForTimeout(3500);
      await p.evaluate(() => document.querySelector('.bpg').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1500);
      await p.click('.bpex button >> nth=1'); await p.click('#bpgo'); await p.waitForTimeout(2500);
      const r = { cards: await p.evaluate(() => [...document.querySelectorAll('.bc')].map(c => c.textContent)) };
      await p.click('#bpsend'); await p.waitForTimeout(3500);
      r.page = await where(p); r.goal = await p.inputValue('#goal'); r.focus = await p.evaluate(() => document.activeElement.id);
      return r;
    });
  }

  // =========================================================== share link
  if (want('share')) {
    console.log('share: a shared plan link');
    const b64 = s => Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const plan = '#/plan/' + b64(JSON.stringify({ b: 'Our old mainframe system must be modernised and pass a security audit.', s: '2027-01-04' }));
    await both('shared plan link opens and runs the brief', async (c, side) => {
      const p = await c.newPage(); await p.goto(`http://localhost:${side === 'old' ? 8380 : 8390}/${plan}`); await p.waitForTimeout(9000);
      await p.click('.bh-tabs button >> nth=3'); await p.waitForTimeout(900);   // "By when" shows the start date from the link
      return { page: await where(p), hash: (await p.evaluate(() => location.hash)).replace('#/home/bpgen', '#bpgen'), brief: await p.inputValue('#bpt'),
        title: await p.evaluate(() => { const t = document.querySelector('.bres .bh-t'); return t && t.textContent; }), dates: await p.evaluate(() => [...document.querySelectorAll('[data-ms]')].map(e => e.textContent)), start: await p.evaluate(() => { const s = document.getElementById('bpStart'); return s && s.value; }) };
    }, {}, gl3d);
  }

  // =========================================================== keys
  if (want('keys')) {
    console.log('keys: yard menu, Blueprint mode, single-key switch');
    await both('G opens the yard menu, 3 goes to Work', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'services')); await p.waitForTimeout(2500);
      await p.keyboard.press('g'); await p.waitForTimeout(800);
      const r = { open: await p.evaluate(() => document.getElementById('gl').classList.contains('open')), items: await p.evaluate(() => [...document.querySelectorAll('#gg .gc b')].map(b => b.textContent)), focus: await p.evaluate(() => document.activeElement.className) };
      await p.keyboard.press('3'); await p.waitForTimeout(2500);
      r.page = await where(p); r.closed = await p.evaluate(() => !document.getElementById('gl').classList.contains('open'));
      return r;
    });
    await both('B turns Blueprint mode on and off, the switch turns keys off', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'services')); await p.waitForTimeout(2500);
      await p.mouse.move(600, 400); await p.keyboard.press('b'); await p.waitForTimeout(700);
      const r = { on: await p.evaluate(() => document.body.classList.contains('bp-on')), boxes: await p.evaluate(() => [...document.querySelectorAll('#bpann .bpb')].filter(b => b.style.display === 'block').length > 0) };
      await p.keyboard.press('Escape'); await p.waitForTimeout(400); r.off = await p.evaluate(() => !document.body.classList.contains('bp-on'));
      await p.keyboard.press('g'); await p.waitForTimeout(700); await p.click('#glk'); r.glk = await p.textContent('#glk'); await p.keyboard.press('Escape'); await p.waitForTimeout(500);
      await p.keyboard.press('g'); await p.waitForTimeout(500); r.stillClosed = await p.evaluate(() => !document.getElementById('gl').classList.contains('open'));
      return r;
    });
  }

  // =========================================================== widgets
  if (want('widgets')) {
    console.log('widgets: assistant, hero toggle, product card steps, case filters');
    await both('assistant answers', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'insights')); await p.waitForTimeout(2500);
      await p.click('#astb'); await p.waitForTimeout(300); const r = { open: await p.evaluate(() => document.getElementById('astp').classList.contains('open')) };
      for (const q of ['start', 'book']) { await p.click(`#qr [data-q="${q}"]`); await p.waitForTimeout(800); }
      r.msgs = await p.evaluate(() => [...document.querySelectorAll('#msgs .m')].map(m => m.className + ':' + m.innerHTML));
      r.msgs = r.msgs.map(m => m.replace(/href="#\/([^"]*)"/g, (_, t) => `href="${link(t, 'main')}"`));
      await p.keyboard.press('Escape'); r.closed = await p.evaluate(() => !document.getElementById('astp').classList.contains('open'));
      return r;
    });
    await both('hero audience toggle', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'home', '#bpgen')); await p.waitForTimeout(2500);
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
      const r = [];
      for (const s of ['startup', 'enterprise', 'public', 'all']) { await p.click(`.sg[data-s="${s}"]`); await p.waitForTimeout(900); r.push(await p.evaluate(() => [document.getElementById('seg-p').textContent, document.querySelector('#seg-b span').textContent, [...document.querySelectorAll('.sg')].map(b => b.getAttribute('aria-pressed')).join()])); }
      return r;
    });
    await both('product card steps follow the demo', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'products')); await p.waitForTimeout(2500);
      await p.evaluate(() => document.querySelector('section.page.on .pp').scrollIntoView({ block: 'center' })); await p.waitForTimeout(800);
      const r = [];
      for (const s of [2, 3, 1]) { await p.click(`section.page.on .pp >> nth=0 >> .pp-steps li[data-s="${s}"] button`); await p.waitForTimeout(400); r.push(await p.evaluate(() => { const c = document.querySelector('section.page.on .pp'); return [c.querySelector('.aui,.xui').dataset.state, c.querySelector('.pp-now').textContent, c.classList.contains('held')]; })); }
      return r;
    });
    await both('case filters', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'main', 'work')); await p.waitForTimeout(2500);
      const r = { cards: await p.evaluate(() => document.querySelectorAll('section.page.on .case').length) };
      const fs = await p.evaluate(() => [...document.querySelectorAll('#filters .fb')].map(b => b.dataset.f));
      r.f = [];
      // the case studies are a draft section, hidden in launch mode on both sites, so the buttons are pressed by script
      for (const f of fs) { await p.$eval(`#filters .fb[data-f="${f}"]`, b => b.click()); await p.waitForTimeout(150); r.f.push(await p.evaluate(() => [...document.querySelectorAll('section.page.on .case')].filter(c => !c.classList.contains('hide')).length)); }
      return r;
    });
  }

  // =========================================================== forms
  if (want('forms')) {
    console.log('forms: contact, Allocivo demo, Xessly early access');
    await both('contact form: errors, then sent', async (c, side) => {
      const posts = await mockApi(c);
      const p = await c.newPage(); await p.goto(url(side, 'main', 'contact')); await p.waitForTimeout(2500);
      await p.click('#fsend'); await p.waitForTimeout(200);
      const r = { errors: await p.evaluate(() => ['goal', 'name', 'email'].map(i => document.getElementById('e-' + i).textContent)), focus: await p.evaluate(() => document.activeElement.id), req: await p.evaluate(() => document.querySelectorAll('#cf .req').length + '/' + document.querySelectorAll('#cf [aria-required]').length) };
      await p.fill('#goal', 'A new booking app'); await p.fill('#name', 'Ada'); await p.fill('#email', 'ada@example.com'); await p.click('#optb'); await p.fill('#co', 'Acme');
      await p.click('#fsend'); await p.waitForTimeout(800);
      r.done = await p.evaluate(() => document.getElementById('formcard').textContent); r.posts = posts.map(x => ({ path: x.path, body: strip2(x.body) }));
      return r;
    });
    for (const [site, page] of [['allocivo', '/demo/'], ['xessly', '/early-access/']]) {
      await both(`${site} ${page} form: errors, then sent`, async (c, side) => {
        const posts = await mockApi(c);
        const p = await c.newPage(); await p.goto(url(side, site, page)); await p.waitForTimeout(2500);
        await p.click('form.lf button[type=submit]'); await p.waitForTimeout(200);
        const r = { errors: await p.evaluate(() => [...document.querySelectorAll('form.lf .err')].map(e => e.textContent)), focus: await p.evaluate(() => document.activeElement.name) };
        await p.evaluate(() => { for (const el of document.querySelectorAll('form.lf [data-req]')) { if (el.type === 'checkbox') el.checked = true; else if (el.tagName === 'SELECT') el.selectedIndex = 1; else el.value = el.type === 'email' ? 'ada@example.com' : 'Test'; } });
        await p.click('form.lf button[type=submit]'); await p.waitForTimeout(800);
        r.done = await p.evaluate(() => document.querySelector('.okm') && document.querySelector('.okm').textContent); r.posts = posts.map(x => ({ path: x.path, body: strip2(x.body) }));
        return r;
      });
    }
  }

  // =========================================================== product sites
  if (want('product')) {
    console.log('product: calculator, live board, story, agent run');
    await both('Allocivo calculator', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'allocivo', '/', '#al-calc')); await p.waitForTimeout(2500);
      const read = () => p.evaluate(() => [...document.querySelectorAll('#al-calc [data-r],#al-calc [data-o]')].map(e => e.textContent).join('|'));
      const r = [await read()];
      // sliders and number fields set as a visitor would (input events); the currency picker is hidden with one option
      await p.evaluate(() => { for (const e of document.querySelectorAll('#al-calc input[data-k]')) { e.value = String(Math.min(+e.max || 37, 7)); e.dispatchEvent(new Event('input', { bubbles: true })); } });
      await p.waitForTimeout(200); r.push(await read());
      return r;
    });
    await both('Allocivo live board runs', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'allocivo', '/how-it-works/', '#al-how')); await p.waitForTimeout(2000);
      await p.evaluate(() => document.querySelector('[data-live="al"]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(7500);
      return await p.evaluate(() => { const a = document.querySelector('[data-live="al"]'); return { events: a.querySelectorAll('.lv-ev li').length, rooms: a.querySelectorAll('.rm').length, dec: a.querySelector('.lv-dec').textContent !== 'Waiting for the next event…' }; });
    });
    await both('Xessly agent run', async (c, side) => {
      const p = await c.newPage(); await p.goto(url(side, 'xessly', '/agent-flow/')); await p.waitForTimeout(2000);
      await p.evaluate(() => document.querySelector('[data-live="xs"]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(6500);
      return await p.evaluate(() => { const x = document.querySelector('[data-live="xs"]'); return { head: x.querySelector('[data-out-h]').textContent !== 'Output', rows: x.querySelectorAll('.xo .row').length > 0 }; });
    });
    for (const [site, page] of [['allocivo', '/'], ['xessly', '/']]) {
      await both(`${site} story pins and steps (3D)`, async (c, side) => {
        const p = await c.newPage(); await p.goto(url(side, site, page)); await p.waitForTimeout(3500);
        const r = { flat: await p.evaluate(() => document.querySelector('.s3').classList.contains('flat')), live: await p.evaluate(() => document.querySelector('.s3 canvas').width > 300) };
        const top = await p.evaluate(() => document.querySelector('.s3').getBoundingClientRect().top + scrollY);
        r.steps = [];
        for (const f of [0.05, 2.2, 5.4]) { await p.evaluate(y => scrollTo(0, y), top + f * 900); await p.waitForTimeout(1200); r.steps.push(await p.evaluate(() => { const s = document.querySelector('.s3-step.on'); return s ? s.dataset.i : null; })); }
        return r;
      }, {}, gl3d);
    }
  }

  // =========================================================== phone
  if (want('phone')) {
    console.log('phone: the phone menu');
    for (const site of ['main', 'allocivo']) {
      await both(`${site}: phone menu opens into its links, Escape closes`, async (c, side) => {
        const p = await c.newPage(); await p.goto(url(side, site, site === 'main' ? 'services' : '/')); await p.waitForTimeout(2500);
        await p.click('#burger'); await p.waitForTimeout(300);
        const r = { open: await p.evaluate(() => document.getElementById('menu').classList.contains('open')), label: await p.getAttribute('#burger', 'aria-label'), focus: await p.evaluate(() => document.activeElement.textContent.trim().slice(0, 30)) };
        for (let i = 0; i < 30; i++) await p.keyboard.press('Tab');
        r.inside = await p.evaluate(() => document.getElementById('hdr').contains(document.activeElement));
        await p.keyboard.press('Escape'); await p.waitForTimeout(200);
        r.closed = await p.evaluate(() => !document.getElementById('menu').classList.contains('open')); r.back = await p.evaluate(() => document.activeElement.id);
        return r;
      }, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    }
  }

  // =========================================================== pages (new site only)
  if (want('pages')) {
    console.log('pages: moving between brightyard.in pages');
    const c = await ctx(no3d); const p = await c.newPage();
    await p.goto('http://localhost:8390/'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('pre')).display !== 'none'), 'preloader shows on the first visit to the home page');
    await p.waitForTimeout(3500);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('pre')).display === 'none'), 'preloader is gone after it played');
    await p.click('#hdr a.l[data-r="work"]'); await p.waitForTimeout(250);
    ok(await p.evaluate(() => document.querySelector('#pt i').getBoundingClientRect().top < innerHeight - 5), 'curtain closes on a link to another page');
    await p.waitForURL('**/work'); await p.waitForTimeout(1600);
    ok(await where(p) === 'work', 'link lands on /work');
    ok(await p.evaluate(() => document.activeElement.tagName === 'H1'), 'the new page heading has focus (as after a move on the old site)');
    ok(await p.evaluate(() => [...document.querySelectorAll('#pt i')].every(i => i.getBoundingClientRect().bottom <= 1)), 'curtain is open again after arriving');
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('pre')).display === 'none'), 'no preloader when arriving from another page');
    ok(await p.evaluate(() => document.querySelector('#hdr a.l[data-r="work"]').classList.contains('on')), 'Work is marked in the header on /work');
    await p.goBack(); await p.waitForTimeout(1800);
    ok(await where(p) === 'home', 'back returns to the home page');
    ok(await p.evaluate(() => [...document.querySelectorAll('#pt i')].every(i => { const r = i.getBoundingClientRect(); return r.bottom <= 1 || r.top >= innerHeight - 1; })), 'after back, the page is not left behind the curtain');
    await p.goto('http://localhost:8390/'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('pre')).display === 'none'), 'preloader shows once per session');
    await p.goto('http://localhost:8390/services'); await p.waitForTimeout(1500);
    const y0 = await p.evaluate(() => scrollY);
    await p.evaluate(() => { const a = document.createElement('a'); a.href = '/services#starters'; a.id = 'tst'; a.textContent = 'x'; document.querySelector('section.page.on').prepend(a); });
    await p.$eval('#tst', a => a.click()); await p.waitForTimeout(1800);
    ok(await p.evaluate(() => Math.abs(document.getElementById('starters').getBoundingClientRect().top - 84) < 30) && (await p.evaluate(() => scrollY)) > y0, 'a link to a section on the same page scrolls to it without reloading');
    ok(new URL(p.url()).hash === '#starters', 'the address shows the section');
    const c2 = await ctx(no3d); const p2 = await c2.newPage();
    await p2.goto('http://localhost:8390/services#starters'); await p2.waitForTimeout(2500);
    ok(await p2.evaluate(() => Math.abs(document.getElementById('starters').getBoundingClientRect().top - 84) < 30), 'opening /services#starters lands on that section');
    ok(await p2.evaluate(() => getComputedStyle(document.getElementById('pre')).display === 'none'), 'no preloader when landing on another page');
    ok(!c.errors.length && !c2.errors.length, 'pages: script errors ' + JSON.stringify([...c.errors, ...c2.errors].slice(0, 3)));
    await c.close(); await c2.close();
  }
} finally {
  await gl3d.close(); await no3d.close(); servers.forEach(s => s.close());
}
console.log(`\n${checks - failures} of ${checks} checks passed` + (failures ? `, ${failures} failed` : ''));
process.exit(failures ? 1 : 0);

// the posted page address differs by design (each page has its own address now)
function strip2(b) { if (!b || typeof b !== 'object') return b; const o = { ...b }; delete o.page; return o; }
