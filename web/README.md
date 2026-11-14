# web: the three Brightyard sites

One Astro project builds **brightyard.in**, **allocivo.brightyard.in** and **xessly.brightyard.in** from shared components.
Cloudflare builds each site from this folder on every push to `main` (settings in the table in `../CLAUDE.md`).

## Commands (run inside `web/`)

Install once (needs Node.js 22.23.4 or newer):

```bash
npm install
```

Build all three sites into `dist/main`, `dist/allocivo` and `dist/xessly`:

```bash
npm run build
```

Build one site: `npm run build:main`, `npm run build:allocivo` or `npm run build:xessly`.

Preview while editing (forms and the API don't work here):

```bash
npm run dev
```

That is brightyard.in at http://localhost:4321. `npm run dev:allocivo` (port 4322) and `npm run dev:xessly` (port 4323) do the same for the product sites.

Check the pages against the sites as they were before the move to Astro (needs a build first; the old sites are
taken from git history, see `tests/baseline.mjs`). The first compares the HTML and pixels of every page with scripts
off; the second runs the same actions on both sides with scripts on (menus, the blueprint generator and lead dialog,
forms, shortcuts, product demos, moving between pages). Approved changes since the move are listed in
`tests/accepted.mjs`; anything else that differs is reported:

```bash
npm run test:compare
```

```bash
npm run test:behaviour
```

Accessibility (axe, WCAG 2.2 AA) on every page: nothing new compared with the old sites:

```bash
npm run test:axe
```

The blueprint engine's 66 example briefs:

```bash
npm test
```

A built site with its API and a local database (emails are logged, not sent): copy `wrangler.example.toml` to
`wrangler.toml`, load the tables once with `npx wrangler d1 execute brightyard --local --file schema.sql`, then:

```bash
npx wrangler pages dev dist/main --port 8788
```

On Windows, `start-local.bat` in the repository folder (double-click) starts the preview: it needs Node.js, runs
`tools/local.ps1`, and pulls the latest changes from GitHub while it runs.

How the Cloudflare projects were switched to this folder, and how to roll back: [GO-LIVE.md](GO-LIVE.md).

## Where things are

| Path | What it is |
|---|---|
| `astro.config.mjs` | Reads `ASTRO_SITE` (`main`, `allocivo` or `xessly`) and builds that site |
| `src/sites/<site>/site.mjs` | Each site's address, name and page list (address, page file, title) |
| `src/sites/<site>/pages/` | Each site's page files. Not in `src/pages/`, which Astro would publish on every site; `src/integrations/sites.mjs` adds only the current site's pages |
| `src/sites/shared/` | `robots.txt` and `sitemap.xml`, written for whichever site is built |
| `src/layouts/` | `Base` (head, styles, fonts), `MainLayout` (brightyard.in shell), `ProductLayout` (product site shell) |
| `src/components/shared/` | Used across sites: icon sprite, page curtain, live demo templates, blueprint data, `PageHero` (the dark banner that opens most pages), `ProductStory` (the ten-step story) |
| `src/components/main/` | brightyard.in shell: header with the mega menu (`megamenu/`), footer, preloader, Yard menu dock, assistant, blueprint template, old-address forwarder |
| `src/components/main/<page>/` | The sections of each brightyard.in page (`home/Hero.astro`, `services/Starters.astro`…), in page order in `src/sites/main/pages/` |
| `src/components/product/` | Product site shell: header, footer, closing band, `ProductHero` |
| `src/components/products/<product>/` | The sections of Allocivo and Xessly (`allocivo/Demo.astro`, `xessly/AgentFlow.astro`…); each page file lists the ones it shows |
| `src/lib/links.mjs` | Every internal link. Components write `link('contact')`, never a path |
| `src/lib/page.mjs` | The no-JavaScript rules (used inside `<noscript>`) |
| `src/scripts/features/` | One module per feature of the old `app.js`, its code unchanged except where it relied on the single hash-routed page: `core.js` (smooth scroll, reveals, 3D stages, page start), `megamenu.js`, `service-router.js` (Yardie in the menu), `blueprint.js` and `lead.js` (home), `signature.js` (B and G), forms, demos… |
| `src/scripts/main.js`, `product.js` | The features every brightyard.in page / product page runs, in the old order. `main.js` takes a page's own features and puts them in their old place |
| `src/scripts/pages/` | Page entries: `home.js`, `contact.js`, `work.js`; other brightyard.in pages call `startMain()` directly. Each page file loads its entry in its `scripts` slot |
| `src/scripts/lib/` | Shared helpers: `nav.js` (curtain between pages), `site.js` (settings, links, hand-over between pages), `scroll.js`, `motion.js` (GSAP), `scenes.js` (loads 3D on demand) |
| `src/scripts/scenes/scenes.js` | three.js scenes (hero, stories, Yardie, the solution model), loaded only when needed |
| `src/styles/` | The stylesheet in its parts, joined in the order `Base.astro` imports them. Shipped unminified, exactly as written |
| `src/assets/fonts/` | Inter and Instrument Serif (SIL OFL) |
| `src/data/master.json` | Blueprint master data |
| `src/lib/blueprint/` | Blueprint engine and brief builder, as ES modules shared by the browser and the API |
| `functions/` | Cloudflare Pages Functions (the API), one copy for all three projects. `functions/_lib/{engine,brief,master}.js` are generated by `npm run build` |
| `public/<site>/` | Files copied as they are: favicon, share image |
| `tools/` | `build.mjs` and `dev.mjs` (run one or all sites, also on Windows), `build-functions.mjs`, `local.ps1` (the Windows preview) |
| `schema.sql`, `wrangler.example.toml` | The database tables, and the settings for running a built site with its API locally |
| `tests/behaviour.mjs` | Same actions on old and new with scripts on; still pages compared in HTML and pixels with reduced motion |
| `tests/axe.mjs` | Accessibility scan of every page, old and new, desktop and phone |
| `tests/engine-test.mjs`, `tests/engine-cases.mjs` | The 66 example briefs (add a case whenever a real brief lands on the wrong plan) |
| `tests/baseline.mjs` | Takes the old sites (before the move to Astro) from git history for the three comparison tests |
| `tests/accepted.mjs` | Approved changes since the move; the comparison tests apply them so only unintended differences show |
| `tests/compare.mjs` | Old-against-new check: HTML of the shell and of every page, `<html>`/`<body>` attributes, head tags, the stylesheet, pixel-exact full-page screenshots of every page on desktop and phone, old `#/` addresses |

## Addresses

- brightyard.in: `/`, `/services`, `/products`, `/how-we-work`, `/work`, `/insights`, `/contact`, `/privacy`, plus a not-found page.
- Product sites keep their folder addresses: `/how-it-works/`, `/integrations/`, `/demo/`, `/agent-flow/`, `/where-fixes-land/`, `/early-access/`.
- Old addresses (`brightyard.in/#/services/svc-eng`, `#/how`, `#/allocivo/al-demo`…) are forwarded by `src/components/main/HashForward.astro`, which uses the same table as `link()`. `#/home/…` and share links (`#/plan/…`) stay on the home page.
- The product sites link to brightyard.in's addresses (`https://brightyard.in/contact`).

## How the move to Astro went (November 2026)

1. **Done: project structure.** All three sites build from shared components.
2. **Done: page content.** Every page is ported as components and matched the old page in HTML and pixel for pixel (desktop and phone, JavaScript off). brightyard.in got a real not-found page, to a design the owner approved.
3. **Done: scripts.** Ported as feature modules with per-page entries; gsap, Lenis and three.js come from npm (same versions), three.js only where 3D is used. Behaviour matched the old site in `tests/behaviour.mjs`. How moving between pages works now:
   - a link to another brightyard.in page closes the curtain and loads the page, which opens it (`lib/nav.js`, plus a two-line script in `MainLayout`'s head that keeps the curtain closed while the next page loads); links within a page scroll smoothly; the product sites change page without a curtain, as before;
   - Yardie in the menu on another page hands the brief to the home page (`features/brief-handoff.js`), and "Send this plan to our team" hands the summary to the contact form, through `sessionStorage`;
   - share links (`/#/plan/…`) work as before; the generator's address is now `/#bpgen` (the old `#/home/bpgen` still works).
   - one small change: child pages always mark their parent menu (How we work marks Resources). The old site did this only after moving within the site, not when a page was opened directly.
4. **Done: Cloudflare switched** (live on 14 November 2026), step by step in [GO-LIVE.md](GO-LIVE.md). In each of the three projects: root directory `web`, build command `npm run build`, output directory `dist/<site>` (`dist/main`, `dist/allocivo`, `dist/xessly`), variable `ASTRO_SITE` = `main`, `allocivo` or `xessly` (Production and Preview). Bindings and secrets stay as they are. Checked beforehand: forms and emails against the real API (`wrangler pages dev`), accessibility (`npm run test:axe`), addresses (`/services.html` redirects to `/services`, `/demo` to `/demo/`, unknown addresses give the not-found page with status 404).
5. **Done: old files removed.** The old generated files, `build-src/` and the old local server were removed from the repository; they are in git history (the tests take the old sites from commit `049e41e`).
