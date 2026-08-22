import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { githubArticlesLoader } from './loaders/github-article';
import { githubToolAppsLoader } from './loaders/github-tool-app';

// Each project repo's own article.md, pulled in at build time -- see
// src/loaders/github-article.ts and CLAUDE.md's dated entry. Add an entry
// here for each project repo that has a website write-up; the loader
// fetches all of them.
//
// dataPath/dataImages are optional: a second file in the same repo (by
// convention, data.md) holding every plot that didn't make the article
// itself -- for readers who want the full dataset, without crowding the
// article. Rendered at /articles/<id>/data/, linked from the article body
// by hand wherever it reads naturally (see githubArticlesLoader's doc
// comment -- same fetch mechanism, just a second document per source). An
// entry with no dataPath simply gets no /data/ page.
const articleSources = [
  {
    id: 'your-servo-is-lying-to-you',
    repo: 'vishwam-aggarwal/Servo-Calibrator',
    path: 'article.md',
    images: ['test-jig.jpg'],
    dataPath: 'data.md',
    dataImages: [] as string[],
  },
  {
    // "Your Motor Doesn't Know How To Get There" -- article is up on the
    // repo (draft: true, wording still being tweaked in a pending PR).
    id: 'your-motor-doesnt-know-how-to-get-there',
    repo: 'vishwam-aggarwal/Universal-Trajectory-Interface',
    path: 'article.md',
    images: [] as string[],
    dataPath: 'data.md',
    dataImages: [] as string[],
  },
];

const articleDataSources = articleSources
  .filter((source) => source.dataPath)
  .map((source) => ({ id: source.id, repo: source.repo, path: source.dataPath, images: source.dataImages }));

// Each Tools-section web app's HTML, pulled from its own project repo at
// build time -- see src/loaders/github-tool-app.ts. Written to
// public/tools/<slug>/app/index.html, same URL each tool's landing page
// already links to. Add an entry here for each tool whose app should stay
// synced with its source repo instead of being a hand-copied static file.
const toolAppSources = [
  {
    slug: 'servo-calibrator',
    repo: 'vishwam-aggarwal/Servo-Calibrator',
    path: 'ServoCalibrator.html',
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

// No entries stored -- this loader's only job is the side effect of
// writing files into public/ during content sync (see its doc comment).
// Nothing on the site queries this collection; it exists so Astro's
// Content Layer actually invokes the loader.
const toolApps = defineCollection({
  loader: githubToolAppsLoader(toolAppSources),
});

export const collections = { projects, articles, articleData, toolApps };
