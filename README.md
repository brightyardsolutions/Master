# Brightyard websites

Three sites, built from the Astro project in [`web/`](web/README.md) and served by Cloudflare Pages:

| Site | Cloudflare project | What it is |
|---|---|---|
| brightyard.in | `master3` | The company site: services, products, how we work, case studies, insights, contact, and "Brief to blueprint" with Yardie |
| allocivo.brightyard.in | `allocivo` | Allocivo, AI agents for hotel operations: overview with the 3D story and value calculator, `/how-it-works/`, `/integrations/`, `/demo/` |
| xessly.brightyard.in | `xessly` | Xessly, AI agents for website accessibility: overview with the 3D story, `/agent-flow/`, `/where-fixes-land/`, `/early-access/` |

A push to `main` rebuilds all three (two to three minutes). `CLAUDE.md` has the rules for working on the sites;
`web/README.md` explains the code, the commands and the tests.

## Looking at the sites on your computer

**Windows:** install Node.js once from [nodejs.org](https://nodejs.org) (the LTS version), then double-click
`start-local.bat`. brightyard.in opens at http://localhost:4321. While the window is open it pulls the latest
changes from GitHub every 30 seconds, and the page updates by itself. For the product sites, open a Command Prompt in
this folder and run `start-local.bat allocivo` or `start-local.bat xessly`. Forms and the API don't work in this
preview.

**Mac or Linux:** in `web/`, run `npm install` once, then `npm run dev` (or `npm run dev:allocivo`, `npm run dev:xessly`).

## The blueprint lead flow

1. Anyone can run the generator and see all four chapters. Nothing is sent.
2. **Email me this blueprint** asks for one field, an email. The visitor gets the 3D blueprint link, the one-page
   brief and the full plan, and the team gets a notice.
3. **Have an engineer check it** is optional: name, company, role and timing. The team gets the request with the
   full plan and replies within one business day.
4. The dialog always offers **Copy share link** and **Print one-page brief**. If email can't be sent, it says so and
   offers those plus a prefilled email to the team.

Share links look like `brightyard.in/#/plan/<code>`. The code holds only the brief and the start date, and the page
rebuilds the plan from them. The API also rebuilds every plan from the brief, so emails never contain content made up
in a browser.

### API (`web/functions/`, the same in all three projects)

| Endpoint | Does |
|---|---|
| `POST /api/blueprint` | Emails the pack to the visitor and a notice to the team. Saves a `pack` lead |
| `POST /api/blueprint/review` | Emails the review request to the team and a confirmation to the visitor. Saves a `review` lead |
| `POST /api/contact` | The contact form, the Allocivo demo form and the Xessly early-access form |
| `POST /api/event` | Daily counts of chapter views, start-date changes, dialog opens, packs, reviews, share-link copies and prints. No cookies, IPs or visitor ids |

Every form endpoint has a hidden honeypot field, rejects posts from other sites, and limits each network per hour
(8 packs, 5 reviews, 6 contact messages). The network is stored only as a salted hash that changes every hour.
Leads are deleted after 12 months.

## Backend setup (Cloudflare and Zoho ZeptoMail, one time; already done)

The sites still work with no backend: the blueprint dialog falls back to the share link, print and email.

1. **Email sender: Zoho ZeptoMail** (Zoho's service for automated email, separate from the Zoho Mail inbox). The
   account is on Zoho CPaaS, so the API is `https://cpaas.zoho.in/v1.1/email`.
   - Mail Agents > Add Mail Agent, named `Brightyard website`; Domains > add `brightyard.in`, and add its DKIM (TXT)
     and bounce (CNAME, **DNS only**) records in Cloudflare > DNS. Leave the Zoho Mail MX and SPF records as they are.
   - SMTP/API > API > copy the **Send Mail token**.
2. **Database.** Cloudflare > Storage & Databases > D1 > `brightyard`. Its tables are in `web/schema.sql` (paste into
   the D1 console without the `--` comment lines).
3. **Each of the three Pages projects**, under Settings, for **Production** and for **Preview**:
   - Bindings: D1 database `DB` = `brightyard` (the same database for all three, so leads land in one place).
   - Variables and secrets: `ZEPTOMAIL_TOKEN` (type **Secret**, never in code), `MAIL_FROM` =
     `Brightyard <hello@brightyard.in>` (the only sender ZeptoMail accepts), `TEAM_EMAIL` = `hello@brightyard.in`,
     `SITE_URL` = the project's own address (for example `https://brightyard.in/`), and `ASTRO_SITE` (`main`,
     `allocivo` or `xessly`). Optional: `RATE_SALT` (Secret, any long random text).
   - Build: root directory `web`, build command `npm run build`, output `dist/main` (or `dist/allocivo`, `dist/xessly`).
4. After changing settings: Deployments > the latest > **Retry deployment**.

**Reading leads:** D1 > `brightyard` > Console, then `SELECT * FROM leads ORDER BY created_at DESC LIMIT 50;`.
For the funnel: `SELECT * FROM events ORDER BY day DESC, name;`.

## Behaviour notes

- With "reduce motion" switched on, or where WebGL is unavailable, the 3D stories fall back to a plain list of steps
  and nothing is pinned or animated; the blueprint shows four cards instead of the 3D model.
- three.js loads only on pages, and at the moment, that need a 3D scene.
- Old addresses from the single-page site (`brightyard.in/#/services`, `#/how`, `#/allocivo/al-demo`) forward to the
  new pages.
- `logos/` holds the Brightyard, Allocivo and Xessly marks (light and dark versions) for use outside the sites.
