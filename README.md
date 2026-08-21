# vishwamaggarwal.com

Personal site / portfolio for Vishwam Aggarwal — projects, research write-ups, and an about page. Built with [Astro](https://astro.build).

## Structure

- `src/content/projects/` — one Markdown file per project (frontmatter: `title`, `summary`, `tags`, `repo`, `demo`, `status`, `featured`, `order`)
- `src/content/articles/` — empty. Articles aren't authored here — see "Adding an article" below.
- `src/loaders/github-article.ts` — the custom loader that fetches each project's `article.md` from its own GitHub repo at build time (frontmatter: `title`, `description`, `pubDate`, `tags`, `draft` — same schema an article would have if it were local)
- `src/pages/` — routes (home, `/projects/`, `/articles/`, `/about/`)
- `src/components/`, `src/layouts/` — shared UI
- `src/styles/global.css` — all styling

## Adding a project

Copy an existing file in `src/content/projects/` and edit the frontmatter + body. Set `featured: true` to show it on the homepage. If the repo is public, add `repo: "https://github.com/..."` to get a "Source" link.

## Adding an article

Write `article.md` at the root of the project's own GitHub repo (frontmatter: `title`, `description`, `pubDate`, `tags`, `draft`; inline SVG charts use the `--series-1`/`--series-2` CSS tokens from `src/styles/global.css`), then add one entry to the `articleSources` array in `src/content.config.ts` (`{ id, repo: 'owner/name', path: 'article.md' }`). Set `draft: false` in that repo when ready to publish, then trigger a redeploy here. See `CLAUDE.md` for the full pipeline and the token setup it needs.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # preview the production build
```

## Deployment

Deployed on [Vercel](https://vercel.com), connected to this GitHub repo — pushes to `master` deploy automatically. Custom domain (`vishwamaggarwal.com`) is on Cloudflare, pointed at Vercel.
