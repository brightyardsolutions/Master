# BrightYard website

Static site for brightyard.in, served by Cloudflare Pages. There is no build step on deploy: push to `main` and Cloudflare Pages redeploys what is in the repo.

## Layout

| Path | What it is |
|---|---|
| `index.html` | All pages (hash routes such as `#/services`, `#/allocivo`), plus the blueprint master data in `<script id="bp-master">` |
| `assets/css/site.css` | All styles |
| `assets/js/app.js` | Site settings (`window.SITE`), forms, menus, live demos, router, page transitions and scroll animation |
| `assets/js/blueprint-engine.js` | Rules engine behind "Brief to blueprint" on the home page |
| `assets/js/blueprint-brief.js` | Builds the one-page brief, full plan and share link from a blueprint. Used by the page and the API |
| `functions/` | Cloudflare Pages Functions: the API under `/api/` (see below). `functions/_lib/engine.js`, `brief.js` and `master.js` are **generated** |
| `schema.sql` | D1 tables for leads, daily event counts and rate limits |
| `tools/build-functions.mjs` | Regenerates the API's copies of the engine, brief builder and master data |
| `assets/js/scenes.js` | **Generated.** The three 3D scenes bundled with three.js. Do not edit by hand |
| `src/scenes.js` | Source for the 3D scenes (home hero, Allocivo hotel, Xessly page) |
| `vendor/` | GSAP, ScrollTrigger and Lenis, served locally so the site does not depend on a CDN |
| `logos/`, `favicon.svg` | BrightYard, Allocivo and Xessly marks |

## Running locally

**Windows:** double-click `start-local.bat`. It opens http://localhost:8080, and whenever you reload the page it pulls the latest changes from GitHub (needs Git installed and this folder cloned with Git). Keep its window open while you browse.

**Mac or Linux:**

```bash
python3 -m http.server 8080
```

## Changing the 3D scenes

Edit `src/scenes.js`, then rebuild the bundle and commit both files:

```bash
npm install
```

```bash
npm run build:scenes
```

## The blueprint lead flow

1. Anyone can run the generator and see all four chapters. Nothing is sent.
2. **Take it to your team** asks for one field, an email. The visitor gets the 3D blueprint link, the one-page brief and the full plan, and the team gets a notice.
3. **Have an engineer check it** is optional: name, company, role and timing. The team gets the request with the full plan and must reply within one business day.
4. The dialog always offers **Copy share link** and **Print one-page brief**. If email can't be sent, it says so and offers those plus a prefilled email to the team.

Share links look like `brightyard.in/#/plan/<code>`. The code holds only the brief and the start date, and the page rebuilds the plan from them. The API also rebuilds every plan from the brief, so emails never contain content made up in a browser.

### API

| Endpoint | Does |
|---|---|
| `POST /api/blueprint` | Emails the pack to the visitor and a notice to the team. Saves a `pack` lead |
| `POST /api/blueprint/review` | Emails the review request to the team and a confirmation to the visitor. Saves a `review` lead |
| `POST /api/contact` | The site's contact and request forms (`SITE.formEndpoint`) |
| `POST /api/event` | Daily counts of chapter views, start-date changes, dialog opens, packs, reviews, share-link copies and prints. No cookies, IPs or visitor ids |

Every form endpoint has a hidden honeypot field, rejects posts from other sites, and limits each network per hour (8 packs, 5 reviews, 6 contact messages). The network is stored only as a salted hash that changes every hour.

## Backend setup (Cloudflare, one time)

The site still works with no backend: the dialog falls back to the share link, print and email.

1. **Email.** Create a [Resend](https://resend.com) account, verify the `brightyard.in` domain (add the DNS records it shows in Cloudflare DNS), and create an API key.
2. **Database.** Cloudflare dashboard > Storage & Databases > D1 > Create, name it `brightyard`. Open its Console, paste the contents of `schema.sql` and run it.
3. **Pages project settings.** Workers & Pages > your BrightYard project > Settings:
   - Bindings > Add > D1 database: variable name `DB`, database `brightyard`.
   - Variables and secrets, for Production:
     - `RESEND_API_KEY`: type **Secret**, your Resend key. Never put it in code or in a plain variable.
     - `MAIL_FROM`: `BrightYard <blueprints@brightyard.in>`
     - `TEAM_EMAIL`: the inbox that receives leads, for example `hello@brightyard.in`
     - `SITE_URL`: `https://brightyard.in/`
     - `RATE_SALT`: type Secret, any long random text (optional, strengthens the rate-limit hash)
4. Redeploy (Deployments > the latest > Retry deployment) so the settings take effect.
5. Test: make a blueprint on the live site, click **Send my blueprint**, and check both inboxes.

To read leads: D1 > `brightyard` > Console, then run `SELECT * FROM leads ORDER BY created_at DESC LIMIT 50;`. For the funnel, run `SELECT * FROM events ORDER BY day DESC, name;`.

### Running the API locally (optional)

Needs Node.js. Emails are printed in the terminal instead of being sent.

```bash
cp wrangler.example.toml wrangler.toml
```

```bash
npx wrangler d1 execute brightyard --local --file=schema.sql
```

```bash
npx wrangler pages dev . --port 8788
```

Then open http://localhost:8788. `start-local.bat` serves the site without the API, so the dialog shows its fallback there.

### After changing the engine, the brief builder or the master data

```bash
npm run build:functions
```

Commit the regenerated `functions/_lib/` files with your change.

## Before launch

Check `contactEmail` in `window.SITE` at the top of `assets/js/app.js`. `formEndpoint` is set to `/api/contact`, and `api: true` lets the blueprint dialog call the API.

## Behaviour notes

- With "reduce motion" switched on, or where WebGL is unavailable, the 3D stories fall back to a plain list of steps and nothing is pinned or animated.
- The 3D bundle loads only when a page needs it.
