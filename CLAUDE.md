# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## ⏰ Reminder for next session

The user asked to be reminded, next time Claude is opened in this repo, about
the **off-site SEO steps** that only they can do (not automatable from this
repo): verify the site in **Google Search Console** and **Bing Webmaster
Tools** and submit `sitemap-index.xml` to each, plus the free-backlink ideas
from that conversation (GitHub profile README, LinkedIn Featured section,
cross-posting articles to dev.to/Hashnode with a canonical link back). Bring
this up near the start of the conversation, once — don't keep repeating it
every session after that.

## What this is

Vishwam Aggarwal's personal site/portfolio — Astro, static output, deployed on
Vercel at [vishwamaggarwal.com](https://vishwamaggarwal.com) (custom domain on
Cloudflare, DNS-only CNAMEs to Vercel). GitHub repo:
[vishwam-aggarwal/vishwamaggarwaldotcom](https://github.com/vishwam-aggarwal/vishwamaggarwaldotcom)
(public). Pushing to `master` auto-deploys via the Vercel GitHub App.

Home / Projects / Tools / Articles / About, plus a growing Tools section for
hosting Vishwam's own browser-based hardware apps directly on the site.

## Structure

- `src/content/projects/` — content-collection Markdown, one file per project
  (frontmatter: `title`, `summary`, `tags`, `repo`, `demo`, `status`,
  `featured`, `order`). Curated by hand, not fetched live from GitHub — several
  featured projects (the `Universal-*-Interface` stack) are private repos and
  wouldn't render for visitors anyway.
- `src/content/articles/` — content-collection Markdown, one file per article
  (`title`, `description`, `pubDate`, `tags`, `draft`). Articles use inline SVG
  charts/diagrams styled with the site's `--series-1`/`--series-2` CSS tokens
  (validated categorical palette, see `src/styles/global.css`) — **raw HTML in
  these `.md` files must not contain any blank line inside a block**, or
  Astro's markdown parser drops back into Markdown mode mid-block and renders
  the rest as an escaped code block instead of real SVG/HTML.
- `src/pages/tools/` — hand-built Astro pages (not a content collection; each
  tool's page is bespoke enough — schematic, safety notes, launch button —
  that markdown templating doesn't fit). `public/tools/<slug>/app/` holds the
  actual standalone web app (self-contained HTML, Web Serial) served as a
  static file at `/tools/<slug>/app/`.
- `src/styles/global.css` — all styling, light/dark via `prefers-color-scheme`
  only (no theme toggle on this site).

## Status

As of commit `aa2e123`, everything below is **pushed to `master` and live in
production** (the user authorized pushing everything at once while away from
their computer — see git log for the individual commits if you need the
history of what shipped together vs. separately):

- **Tools section + Servo Calibrator web app** — `/tools/`,
  `/tools/servo-calibrator/` (wiring schematic, safety notes, GitHub links),
  and the actual calibrator app at `/tools/servo-calibrator/app/`. **Known
  non-blocking issue:** the GitHub links on that page point at
  `vishwam-aggarwal/Servo-Calibrator`, which is still **private** (and its
  firmware depends on two more private repos,
  `Universal-Motor-Interface`/`Universal-Trajectory-Interface`) — those links
  currently 404 for visitors. The user explicitly deferred fixing this
  ("we'll figure out how to give users access to the sketch later") — don't
  flip any repo visibility without asking first.
- **Free SEO pass** — `@astrojs/sitemap`, `public/robots.txt`,
  `public/og-image.png` (1200×630, rendered from `og-image.svg` via `sharp`,
  not checked into source — regenerate from the SVG if it ever needs to
  change), canonical/`og:*`/`twitter:*` tags and JSON-LD (`Person` on the
  homepage, `BlogPosting` on articles) in `BaseLayout.astro`. Off-site steps
  (Search Console, Bing Webmaster Tools) still need the user to do manually —
  see the reminder above.
- **Comments (Cusdis backend, custom UI)** — `src/components/Comments.astro`,
  wired into the article template. **Not** the Cusdis iframe embed —
  that was tried first and dropped: its hosted widget has two real bugs
  (neither fixable from outside it) — `data-theme="auto"`/`"dark"` never
  actually rendered dark despite the page correctly reporting
  `prefers-color-scheme: dark`, and the iframe was stuck at a small fixed
  height with its own internal scrollbar instead of auto-resizing. Current
  implementation calls Cusdis's public REST API directly
  (`GET`/`POST https://cusdis.com/api/open/comments`, CORS-open, no
  server-side captcha requirement either way) from a small vanilla-JS
  `<script>`, rendering the list and the submit form entirely in the site's
  own CSS — no iframe. Has an honeypot field for casual bots; the real spam
  backstop is still the moderation queue (nothing shows without approval),
  same as before. No user database: no login, just name + optional email +
  comment text. The Cusdis project (`vishwamaggarwal.com`, App ID
  `d0b799f1-0fb3-4d3f-8b2a-9bda898d47c2`) is set as `PUBLIC_CUSDIS_APP_ID` in
  Vercel's Environment Variables (all environments) and in a local,
  gitignored `.env` — see `.env.example` if it ever needs to be recreated.
  Verified end-to-end against the live API with a real test submission
  ("Test Reviewer" on the servo-calibration article) — it landed correctly
  in the moderation queue. **That test comment is still sitting there
  unapproved** — deleting it hit a native confirm() dialog that froze the
  automation tab, so it was left for the user to delete manually from the
  dashboard.

- **`src/content/articles/servo-calibration.md` is published** (`draft: false`,
  commit `95c2ab3`) — live at `/articles/servo-calibration/`. Published on the
  user's explicit go-ahead ("push the article too, we'll fix it later")
  *before* a final content read-through — if a future session is asked to
  touch this article, know that its current live text hasn't had the
  author's own final pass yet, separate from any code-level correctness.

## Local preview gotcha

To preview a `draft: true` article/route that the build filters out: flip
`draft: false`, `npm run build`, flip back to `draft: true` immediately after
— the already-built `dist/` output keeps serving the page via `npm run
preview` even though the source is back to draft, so the working tree stays
clean while still being previewable.
