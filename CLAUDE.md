# Brightyard websites: handover notes

Three live static sites on Cloudflare Pages, all built from the Astro project in `web/`:

| Site | Cloudflare project | Build settings |
|---|---|---|
| brightyard.in | `master3` (preview address `master3-agf.pages.dev`) | root `web`, `npm run build`, output `dist/main`, `ASTRO_SITE=main` |
| allocivo.brightyard.in | `allocivo` | root `web`, `npm run build`, output `dist/allocivo`, `ASTRO_SITE=allocivo` |
| xessly.brightyard.in | `xessly` | root `web`, `npm run build`, output `dist/xessly`, `ASTRO_SITE=xessly` |

All three use **`main` as the production branch**, so a push to `main` rebuilds all three. Cloudflare builds them;
nothing generated is committed except `web/functions/_lib/{engine,brief,master}.js`. `README.md` covers the backend
setup; `web/README.md` covers the code, commands and tests.

## Working with the owner

- The owner is not a developer. Explain plainly, give each command in its own code block, and say where to click in Cloudflare or Zoho. They run the sites locally on Windows from `C:\Users\singh\OneDrive\Desktop\Git\brightyard-live` by double-clicking `start-local.bat` (needs Node.js; it pulls from GitHub while running; forms and the API don't work locally).
- **Propose first, build after an explicit OK.** For any design or content change, describe it (options and a recommendation), wait for approval, then show screenshots before pushing. Criticism of a proposal is not approval.
- **Work on a branch. Merge to `main` only when the owner says so** ("merge to main" / "push to main"). Never push to `main` otherwise. Every branch gets a Cloudflare preview link (`<branch>.master3-agf.pages.dev`; the product projects show theirs in their Deployments tab).
- Never ask for API keys or passwords in chat; they go into Cloudflare as Secrets.

## Product and content rules (decided by the owner)

- **Both products are always visible** on brightyard.in: never hide one behind a tab, switch or click.
- The company name is **Brightyard** everywhere except the logo, which is drawn as `Bright<b>Yard</b>`.
- Prices are in **US dollars**. Fixed-price starters show no figures: "quoted after a free 30-minute call".
- Home "Our products" cards: Allocivo "AI agents that turn your workforce availability into action." and Xessly "AI agents make your website and app accessible. You just watch." (chosen by the owner). Never promise compliance or "fully accessible".
- The home page is a signpost; product detail lives on the product sites.
- Brand colours: Brightyard indigo `#4F46E5` with lime `#C6F432`; Allocivo teal `#0C3A3F`/`#0C5A60` with lime; Xessly slate `#10161D` and indigo with mint `#8FF2CC`.

## How the code is organised (all in `web/`; details in `web/README.md`)

- **Sites and pages:** `src/sites/<site>/site.mjs` lists each site's pages; page files are in `src/sites/<site>/pages/`. brightyard.in has `/`, `/services`, `/products`, `/how-we-work`, `/work`, `/insights`, `/contact`, `/privacy` and a not-found page; the product sites have folder addresses (`/demo/`, `/agent-flow/`…).
- **Components:** page sections in `src/components/main/<page>/` and `src/components/products/<product>/`; shared parts (`PageHero`, `ProductHero`, `ProductStory`, icon sprite, curtain, demo templates) in `src/components/shared/` and `src/components/product/`; the brightyard.in shell (header with the mega menu, footer, dock, assistant) in `src/components/main/`.
- **Links:** always `link('contact')` from `src/lib/links.mjs`, never a hard-coded path. The same table forwards old `#/…` addresses (`src/components/main/HashForward.astro`).
- **Styles:** `src/styles/`, one stylesheet shipped unminified.
- **Scripts:** one module per feature in `src/scripts/features/`; `src/scripts/main.js` and `product.js` run them in a fixed order, and each page loads its entry (`src/scripts/pages/`). Moving between brightyard.in pages plays the curtain (`src/scripts/lib/nav.js`). GSAP, Lenis and three.js come from npm; the 3D scenes (`src/scripts/scenes/scenes.js`: hero, Allocivo and Xessly stories, Yardie, the blueprint solution model) load only when needed.

### Features worth knowing

- **Brief to blueprint** (home page): a rules engine (`src/lib/blueprint/engine.js` + `src/data/master.json`) turns a typed problem into a plan. Yardie, the 3D mascot, presents it as a four-chapter solution model (What we heard, The solution, How we build it, By when). `npm test` (in `web/`) checks 66 example briefs; add a case to `tests/engine-cases.mjs` whenever a real brief lands on the wrong plan.
- **Lead flow**: "Email me this blueprint" (email only), then an optional engineer review (name, company, role, timing). There is also a share link (`/#/plan/…`) and a printable one-page brief (`src/lib/blueprint/brief.js`).
- **Mega menu**: glass panels; Products menu with live product cards; Services menu with previews and a Yardie input that routes a one-line brief (on another page it hands the brief to the home page's generator).
- **Forms**: contact, Allocivo demo and Xessly early access all post to `/api/contact`.

## Backend (Cloudflare Pages Functions, `web/functions/`)

- Endpoints: `POST /api/blueprint`, `/api/blueprint/review`, `/api/contact`, `/api/event` (daily counts only, no cookies or ids). `functions/_lib/{engine,brief,master}.js` are generated from `src/` by `npm run build`; commit them with any engine change.
- Email: **Zoho ZeptoMail via `https://cpaas.zoho.in/v1.1/email`** (the account is on Zoho CPaaS; `api.zeptomail.in` does not reach it). Sender `hello@brightyard.in` is the only allowed sender.
- Settings in **each** of the three projects, for Production and Preview:
  - `DB`: D1 binding to the `brightyard` database (tables in `web/schema.sql`; paste it into the D1 console without `--` comments);
  - `ZEPTOMAIL_TOKEN`: a Secret;
  - `MAIL_FROM` = `Brightyard <hello@brightyard.in>`;
  - `TEAM_EMAIL` = `hello@brightyard.in` (the bare address);
  - `SITE_URL`: that project's own address;
  - `ASTRO_SITE`: `main`, `allocivo` or `xessly`.
- Protection and retention: a honeypot field `website`, same-site checks, hourly per-network limits (8 packs, 5 reviews, 6 contact messages) using a salted hash that changes every hour, and leads deleted after 12 months.
- Locally with the API: `web/wrangler.example.toml` (see `web/README.md`); emails are logged, not sent.

## Checks before pushing (in `web/`)

- `npm run build` (all three sites) and `npm test` (the 66 briefs).
- `npm run test:compare`, `npm run test:behaviour`, `npm run test:axe`: compare every page with the sites as they were before the move to Astro (taken from git history, `tests/baseline.mjs`), with scripts off and on, plus accessibility. They prove nothing changed by accident. After a **deliberate, approved** design, content or accessibility change, add it to `tests/accepted.mjs` (what changed, and how the old HTML maps to the new), so the tests keep flagging everything else. `test:axe` also requires exactly one `<h1>` on every page and no `label-content-name-mismatch` (both fixed on 14 November 2026).
- Known, accepted findings: axe flags the deliberately low-contrast "Sign in" button in the Xessly demo (the "before" state the agents fix).

## History

- **November 2026, move to Astro** (steps 1 to 5, approved by the owner): brightyard.in went from one hash-routed page to real pages, the three sites were rebuilt from shared components with per-page scripts, the design and behaviour were kept identical (proved by the comparison tests), and the sites went live from `web/` on 14 November 2026 (`web/GO-LIVE.md`). Decisions: the curtain closes on link click and opens on the new page; a real not-found page on brightyard.in (dark page banner, "Go to the home page" and "Talk to an engineer"); child pages always mark their parent menu. Accessibility fixes after the move (no visible change): the dock buttons are named by their visible text with `aria-keyshortcuts`, the product logos are named "Allocivo by Brightyard, home", and the inner product pages have a visually hidden `<h1>` ("Allocivo: How it works"). The old single-page site and its `build-src/` build were then removed; they are in git history (commit `049e41e`).

## Open items

- Clearer form errors (say whether it failed because of local testing, the hourly limit or the server).
- Optional AI reading of blueprint briefs (Cloudflare Workers AI or paid Gemini; never the free Gemini tier, for privacy). The AI picks from the existing lists only; the rules engine still builds the plan. Measure it against the 66 briefs first.
- Re-run the Impeccable and Taste design audit on the live sites.
- Product site pages to add later (for example pricing or security).
- Per-page meta descriptions and share titles: every brightyard.in page still uses the home page's description and share text, as before the move.
