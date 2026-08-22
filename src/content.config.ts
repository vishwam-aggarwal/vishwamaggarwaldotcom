import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { githubArticlesLoader } from './loaders/github-article';
import { githubToolAppsLoader } from './loaders/github-tool-app';

// Every website-related file this site pulls from a project repo lives
// under that repo's own `website/` folder -- article.md, data.md,
// tool.md, app.html, website/images/* -- rather than cluttering the
// project's root as more of these get added. See CLAUDE.md's dated entry
// for why the content lives at the project level at all; this is just the
// on-disk layout within that repo. All paths below are relative to
// `website/`.
const WEBSITE_DIR = 'website';

// Each project repo's own website/article.md, pulled in at build time --
// see src/loaders/github-article.ts and CLAUDE.md's dated entry. Add an
// entry here for each project repo that has a website write-up; the
// loader fetches all of them.
//
// dataPath/dataImages are optional: a second file in the same repo (by
// convention, website/data.md) holding every plot that didn't make the
// article itself -- for readers who want the full dataset, without
// crowding the article. Rendered at /articles/<id>/data/, linked from the
// article body by hand wherever it reads naturally (see
// githubArticlesLoader's doc comment -- same fetch mechanism, just a
// second document per source). An entry with no dataPath simply gets no
// /data/ page.
const articleSources = [
  {
    id: 'hobby-servo-calibration',
    repo: 'vishwam-aggarwal/Servo-Calibrator',
    path: `${WEBSITE_DIR}/article.md`,
    images: [`${WEBSITE_DIR}/images/test-jig.jpg`],
    dataPath: `${WEBSITE_DIR}/data.md`,
    dataImages: [] as string[],
  },
  {
    // "Your Motor Doesn't Know How To Get There"
    id: 'universal-trajectory-interface',
    repo: 'vishwam-aggarwal/Universal-Trajectory-Interface',
    path: `${WEBSITE_DIR}/article.md`,
    images: [] as string[],
    dataPath: `${WEBSITE_DIR}/data.md`,
    dataImages: [] as string[],
  },
];

const articleDataSources = articleSources
  .filter((source) => source.dataPath)
  .map((source) => ({ id: source.id, repo: source.repo, path: source.dataPath, images: source.dataImages }));

// Each Tools-section landing page's content, pulled from its own project
// repo's website/tool.md -- same mechanism as articles, see
// src/pages/tools/[slug]/index.astro. Add an entry here for each tool
// whose landing page should live at the project level instead of being
// hand-authored in this repo.
const toolPageSources = [
  {
    id: 'servo-calibrator',
    repo: 'vishwam-aggarwal/Servo-Calibrator',
    path: `${WEBSITE_DIR}/tool.md`,
    images: [`${WEBSITE_DIR}/images/hookup.png`],
  },
];

// Each Tools-section web app's HTML, pulled from its own project repo at
// build time -- see src/loaders/github-tool-app.ts. Written to
// public/tools/<slug>/app/index.html, same URL each tool's landing page
// already links to. Add an entry here for each tool whose app should stay
// synced with its source repo instead of being a hand-copied static file.
const toolAppSources = [
  {
    slug: 'servo-calibrator',
    repo: 'vishwam-aggarwal/Servo-Calibrator',
    path: `${WEBSITE_DIR}/app.html`,
  },
];

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    // Set repo to the GitHub URL for public repos, or omit/leave blank for private ones.
    repo: z.string().url().optional(),
    // Optional link to a live demo, video, or write-up.
    demo: z.string().url().optional(),
    status: z.enum(['active', 'shipped', 'archived']).default('active'),
    featured: z.boolean().default(false),
    // Lower sorts first within a section.
    order: z.number().default(100),
  }),
});

const articles = defineCollection({
  loader: githubArticlesLoader(articleSources),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Companion "every plot, full dataset" page per article -- see the
// dataPath comment above. Same draft-then-flip workflow as articles.
const articleData = defineCollection({
  loader: githubArticlesLoader(articleDataSources),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Tools-section landing pages -- content lives in each tool's own project
// repo (website/tool.md), rendered through src/pages/tools/[slug]/index.astro.
// The `id` above is the slug, so it doubles as the route param and the
// /tools/<slug>/app/ launch link target.
const toolPages = defineCollection({
  loader: githubArticlesLoader(toolPageSources),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['active', 'shipped', 'archived']).default('active'),
    // GitHub URL for the page's "View on GitHub" button.
    repo: z.string().url(),
    draft: z.boolean().default(false),
  }),
});

// No entries stored -- this loader's only job is the side effect of
// writing files into public/ during content sync (see its doc comment).
// Nothing on the site queries this collection; it exists so Astro's
// Content Layer actually invokes the loader.
const toolApps = defineCollection({
  loader: githubToolAppsLoader(toolAppSources),
});

export const collections = { projects, articles, articleData, toolPages, toolApps };
