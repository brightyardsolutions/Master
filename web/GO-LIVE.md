# Going live with the new sites (migration step 4)

This switches brightyard.in, allocivo.brightyard.in and xessly.brightyard.in from the old files to the new Astro
build in `web/`. You do it in two stages: first you look at **preview links**, then you **go live**.
Nothing here asks for a password or key: bindings, variables and secrets already set in Cloudflare stay as they are.

## Before you start

All checks pass on the branch `claude/sleepy-euler-lezn7a`:

| Check | Result |
|---|---|
| Every page compared with today's, scripts off (HTML and screenshots, desktop and phone) | 830 of 830 |
| Same actions on today's site and the new one, scripts on (menus, generator, lead dialog, forms, shortcuts, demos, moving between pages) | all pass |
| Forms and blueprint emails against the real API (run locally with Cloudflare's own tool) | all four send and store |
| Accessibility (axe, WCAG 2.2 AA), every page | nothing new compared with today |
| Blueprint engine, 66 example briefs | 66 of 66 |

**While you do this, don't push other changes to `main`.** If something does reach `main` in between, nothing
breaks: Cloudflare would try to build it with the new settings, the build would fail, and the live site would simply
stay as it is.

## Stage 1: preview links (about 15 minutes)

Do this for **each of the three projects**. The only value that changes between them is the site name.

| Project in Cloudflare | Site name (`ASTRO_SITE`) | Build output directory |
|---|---|---|
| `master3-agf` (brightyard.in) | `main` | `dist/main` |
| `allocivo` | `allocivo` | `dist/allocivo` |
| `xessly` | `xessly` | `dist/xessly` |

### 1. Change the build settings

1. Go to **dash.cloudflare.com**, then **Workers & Pages** in the left menu, and click the project.
2. Open the **Settings** tab, then **Build**. Next to **Build configuration**, click **Edit**.
3. Set:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** the one in the table above (for example `dist/main`)
   - **Root directory (advanced):** `web`
4. Click **Save**.

### 2. Add the site name

1. Still in **Settings**, open **Variables and Secrets** and click **Add**.
2. Type: **Plaintext**. Variable name: `ASTRO_SITE`. Value: the site name from the table (for example `main`).
3. Make sure it is added for **both Production and Preview**. If the page lets you pick one environment at a time,
   add it once for Production, then again for Preview.
4. Leave everything else as it is (`DB`, `ZEPTOMAIL_TOKEN`, `MAIL_FROM`, `TEAM_EMAIL`, `SITE_URL`).

### 3. Build the preview

1. Open the **Deployments** tab. Under **Preview**, find the latest deployment of the branch
   `claude/sleepy-euler-lezn7a`.
2. Click the **⋯** menu on it, then **Retry deployment**. The build takes two to three minutes.
3. When it shows **Success**, click it and open the link that ends in `.pages.dev`. For brightyard.in it should be
   `https://claude-sleepy-euler-lezn7a.master3-agf.pages.dev`. Copy the product sites' links from their own
   Deployments tab, as their `.pages.dev` names may differ from the project names.

If you don't see a preview for the branch at all: **Settings**, **Build**, **Branch control**, and check that
preview deployments are on for non-production branches.

### 4. Look around

On the brightyard.in preview:

- [ ] The home page: preloader, hero, the blueprint generator (try an example and "Draw my blueprint").
- [ ] The menus: Services (type a sentence to Yardie), Products, Resources.
- [ ] Click between pages: the lime and dark curtain closes and opens, and the address changes (`/services`, `/how-we-work`…).
- [ ] Press **G** for the yard menu and **B** for Blueprint mode.
- [ ] Try a made-up address, such as `/old-page`: you get the new "We couldn't find that page" page.
- [ ] Try an old address, such as `/#/services`: you land on `/services`.
- [ ] On your phone too.
- [ ] Optional: send yourself a blueprint ("Email me this blueprint") or a contact message. These use the real
      email service, so they really arrive.

On the product previews: the pages, the story animation, the calculator (Allocivo), the agent run (Xessly) and the
demo or early-access form.

**Expected on previews:** links from the product previews to brightyard.in (for example **Contact** in their footer)
go to the **live** brightyard.in. Its new addresses such as `/contact` only exist after going live, so until then
they show the old home page. That is normal for previews and fixes itself in stage 2.

When you are happy, say **"merge to main"**.

## Stage 2: going live

1. When you say "merge to main", I merge the branch into `main`.
2. Cloudflare then builds all three projects at once, with the settings from stage 1 (two to three minutes).
3. In each project's **Deployments** tab, the new Production deployment should show **Success**.
4. Check the live sites: the same list as above, on brightyard.in, allocivo.brightyard.in and xessly.brightyard.in.

**brightyard.in must go live together with the product sites, or before them.** The new product sites link to
brightyard.in's new addresses. Merging to `main` switches all three at once, as long as all three have the stage 1
settings.

## If something goes wrong

- **Undo straight away:** in the project's **Deployments** tab, find the previous Production deployment (the old
  site), click **⋯**, then **Rollback to this deployment**. The old site is back within a minute. The old files
  stay in the repository until the move is settled, so nothing is lost.
- **Undo fully:** set the build settings back to how they were. For brightyard.in: root directory empty, no build
  command, output directory `/`. For the product sites: root directory `sites/allocivo` or `sites/xessly`, no build
  command, output `/`. Then retry the latest Production deployment.
- **The build fails** with a message about the Node.js version: add one more variable, `NODE_VERSION` =
  `22.23.4`, for Production and Preview, and retry. (The `web/.nvmrc` file asks Cloudflare for this version
  already; the variable is only a fallback.) If **Settings**, **Build** offers a newer **Build system version**,
  choose the newest.
- Anything else: copy the last lines of the build log (click the failed deployment) into the chat.

## After going live (later, with your OK)

Once the new sites have run without trouble for a while, the old files can be removed from the repository: the old
`index.html`, `assets/`, `vendor/`, `sites/`, `functions/` and `build-src/`, plus the old `start-local.bat`. The
handover notes then describe only the new setup. Nothing is removed until you agree.

## Previewing on your own computer

Install Node.js once from **nodejs.org** (the LTS installer). Then double-click `web\start-local.bat` in your copy of
the repository. brightyard.in opens at http://localhost:4321. For the product sites, open a Command Prompt in the
`web` folder and run `start-local.bat allocivo` (port 4322) or `start-local.bat xessly` (port 4323). Forms and the
API don't work in this preview, as before.
