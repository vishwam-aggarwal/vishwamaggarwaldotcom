import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { githubArticlesLoader } from './loaders/github-article';

// Each project repo's own article.md, pulled in at build time -- see
// src/loaders/github-article.ts and CLAUDE.md's dated entry. Add an entry
// here for each project repo that has a website write-up; the loader
// fetches all of them.
const articleSources = [
  { id: 'your-servo-is-lying-to-you', repo: 'vishwam-aggarwal/Servo-Calibrator', path: 'article.md' },
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

export const collections = { projects, articles };
