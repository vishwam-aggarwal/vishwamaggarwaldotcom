// Content Layer loader that fetches a Tools-section web app's HTML
// straight from its own project repo at build time, same reasoning and
// same GITHUB_CONTENT_TOKEN as github-article.ts: the app is authored and
// versioned at the project level, this site pulls the current copy in
// rather than keeping a hand-maintained duplicate that silently goes
// stale (which is exactly what happened before this loader existed --
// public/tools/servo-calibrator/app/index.html was a one-time copy-paste
// that had already diverged from the source repo).
//
// Doesn't store any collection entries -- nothing on the site queries
// this data, the fetched file is served directly as a static asset at
// /tools/<slug>/app/. The Loader is used purely for its side effect
// (writing the file into public/ during content sync, before Astro
// copies public/ into dist/), same trick the image-fetching half of
// github-article.ts already relies on.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';
import { fetchGithubFile } from './github-article';

interface ToolAppSource {
  /** Tool slug -- the app is written to public/tools/<slug>/app/index.html */
  slug: string;
  /** "owner/repo" */
  repo: string;
  /** Path to the app's HTML file within that repo */
  path: string;
  /**
   * Extra files the app loads at runtime, fetched alongside it and written
   * to public/tools/<slug>/app/<basename> -- so the app references them by
   * plain relative URL ("./uti.js"), same directory, no build step.
   *
   * Exists because an app is not always one file. Trajectory Lab loads a
   * WebAssembly bundle compiled from its project's own C++ (the point of
   * that page is that it runs the real library rather than a JavaScript
   * imitation), and a firmware image it flashes over Web Serial. Those are
   * generated artifacts committed next to the HTML in the source repo;
   * inlining them into app.html instead would work, but it would make a
   * hand-edited file part-generated and bloat every diff.
   *
   * Basenames must be unique within one app, and none may be "index.html".
   * Same failure handling as images on an article: a missing asset warns
   * and is skipped rather than taking the whole build down.
   */
  assets?: string[];
  /** Branch/ref to fetch from. Defaults to the repo's default branch. */
  ref?: string;
}

export function githubToolAppsLoader(sources: ToolAppSource[]): Loader {
  return {
    name: 'github-tool-apps-loader',
    load: async ({ logger, config }) => {
      const token = process.env.GITHUB_CONTENT_TOKEN || import.meta.env.GITHUB_CONTENT_TOKEN;
      if (!token) {
        logger.warn(
          'GITHUB_CONTENT_TOKEN is not set -- skipping all GitHub-sourced tool apps. ' +
            'Set it in .env (local) or Vercel Environment Variables (deployed) to fetch them.'
        );
        return;
      }

      logger.info(`Fetching ${sources.length} tool app source(s)...`);
      for (const source of sources) {
        const destDir = path.join(fileURLToPath(config.root), 'public', 'tools', source.slug, 'app');

        try {
          const bytes = await fetchGithubFile(source.repo, source.path, token, source.ref);
          await mkdir(destDir, { recursive: true });
          await writeFile(path.join(destDir, 'index.html'), bytes);
          logger.info(`Wrote tool app /tools/${source.slug}/app/index.html (${bytes.length} bytes).`);
        } catch (err) {
          logger.error(`Error fetching ${source.repo}/${source.path}: ${(err as Error).message} -- skipping.`);
          // No point fetching assets for an app whose HTML never arrived.
          continue;
        }

        for (const assetPath of source.assets ?? []) {
          const name = path.basename(assetPath);
          if (name === 'index.html') {
            logger.error(
              `Asset ${assetPath} for /tools/${source.slug}/ would overwrite the app itself -- skipping.`
            );
            continue;
          }
          try {
            const bytes = await fetchGithubFile(source.repo, assetPath, token, source.ref);
            await writeFile(path.join(destDir, name), bytes);
            logger.info(`Wrote tool asset /tools/${source.slug}/app/${name} (${bytes.length} bytes).`);
          } catch (err) {
            logger.warn(
              `Error fetching asset ${source.repo}/${assetPath}: ${(err as Error).message} -- skipping.`
            );
          }
        }
      }
    },
  };
}
