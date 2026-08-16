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

## Currently in progress (pending, not yet pushed)

**Tools section + Servo Calibrator web app** — built and committed locally
(commit `99109eb` on top of `master`), **not yet pushed to GitHub / not yet
live**. Per the user: keep this local until told otherwise.

What's built: `/tools/`, `/tools/servo-calibrator/` (wiring schematic, safety
notes, GitHub links), and the actual calibrator app hosted at
`/tools/servo-calibrator/app/`.

**Blocking before this can go live for real visitors:** the GitHub links on
the Servo Calibrator tools page point at `vishwam-aggarwal/Servo-Calibrator`,
which is currently **private** — and its firmware depends on two more private
repos (`Universal-Motor-Interface`, `Universal-Trajectory-Interface`). The
user explicitly deferred this decision ("we'll figure out how to give users
access to the sketch later, when we actually deploy this tool") — don't flip
any repo visibility without asking again first.

**Also pending:** `src/content/articles/servo-calibration.md` is drafted
(`draft: true`) and restructured per user feedback (nonlinearity is the fix
the calibration table provides; backlash is explicitly *not* fixed by it —
that section moved to the end with a clear "we live with it, these are cheap
hobby servos" conclusion). Still awaiting the user's final content review
before publishing.

**Free SEO pass** — also built and committed locally, not yet pushed:
`@astrojs/sitemap` integration (generates `sitemap-index.xml`/`sitemap-0.xml`
at build), `public/robots.txt` pointing at it, `public/og-image.png` (1200×630,
rendered from `og-image.svg` via `sharp`, not checked into source — regenerate
from the SVG if it ever needs to change), and `BaseLayout.astro` now emits a
canonical link, `og:url`/`og:image`/`twitter:*` tags, and an optional
`structuredData` prop (JSON-LD) — used for `Person` on the homepage and
`BlogPosting` on article pages. Off-site steps (Google Search Console, Bing
Webmaster Tools, sitemap submission) still need the user to do manually once
this is pushed and live — those aren't things this repo can automate.

## Local preview gotcha

To preview a `draft: true` article/route that the build filters out: flip
`draft: false`, `npm run build`, flip back to `draft: true` immediately after
— the already-built `dist/` output keeps serving the page via `npm run
preview` even though the source is back to draft, so the working tree stays
clean while still being previewable.
