# BrightYard website

Static site for brightyard.in, served by Cloudflare Pages. There is no build step on deploy: push to `main` and Cloudflare Pages redeploys what is in the repo.

## Layout

| Path | What it is |
|---|---|
| `index.html` | All pages (hash routes such as `#/services`, `#/allocivo`), plus the blueprint master data in `<script id="bp-master">` |
| `assets/css/site.css` | All styles |
| `assets/js/app.js` | Site settings (`window.SITE`), forms, menus, live demos, router, page transitions and scroll animation |
| `assets/js/blueprint-engine.js` | Rules engine behind "Brief to blueprint" on the home page |
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

## Before launch

Edit `window.SITE` at the top of `assets/js/app.js`: set `formEndpoint` so the forms send somewhere, and check `contactEmail`.

## Behaviour notes

- With "reduce motion" switched on, or where WebGL is unavailable, the 3D stories fall back to a plain list of steps and nothing is pinned or animated.
- The 3D bundle loads only when a page needs it.
