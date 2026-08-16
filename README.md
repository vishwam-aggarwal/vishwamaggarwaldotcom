# vishwamaggarwal.com

Personal site / portfolio for Vishwam Aggarwal — projects, research write-ups, and an about page. Built with [Astro](https://astro.build).

## Structure

- `src/content/projects/` — one Markdown file per project (frontmatter: `title`, `summary`, `tags`, `repo`, `demo`, `status`, `featured`, `order`)
- `src/content/articles/` — one Markdown file per article (frontmatter: `title`, `description`, `pubDate`, `tags`, `draft`)
- `src/pages/` — routes (home, `/projects/`, `/articles/`, `/about/`)
- `src/components/`, `src/layouts/` — shared UI
- `src/styles/global.css` — all styling (light/dark via `prefers-color-scheme`)

## Adding a project

Copy an existing file in `src/content/projects/` and edit the frontmatter + body. Set `featured: true` to show it on the homepage. If the repo is public, add `repo: "https://github.com/..."` to get a "Source" link.

## Adding an article

Copy `src/content/articles/hello-world.md`, fill in the frontmatter, write the body in Markdown, and set `draft: false`.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # preview the production build
```

## Deployment

Deployed on [Vercel](https://vercel.com), connected to this GitHub repo — pushes to `main` deploy automatically. Custom domain (`vishwamaggarwal.com`) is on Cloudflare, pointed at Vercel.
