// Custom Astro Content Layer loader that pulls article.md content (and any
// images it references) directly from other GitHub repos rather than from
// a local file. See CLAUDE.md's dated entry for the reasoning: project
// write-ups live at the project level, this site pulls them in at build
// time instead of having them authored twice or synced via a git
// submodule.
//
// Fetches once per `sources` entry via the GitHub Contents API (works for
// private repos with a token) and stores each as one collection entry.
// Any paths listed in `images` are fetched the same way and written into
// public/images/<id>/ so Astro's static copy picks them up at build --
// this is the same private-repo problem as the article text itself
// (raw.githubusercontent.com isn't reachable for a private repo without
// auth), solved the same way, just for binary files instead of markdown.
// A missing token or a failed fetch logs a warning and skips that entry
// rather than failing the whole site build -- useful before the token is
// configured, or if a project repo is briefly unreachable.
import matter from 'gray-matter';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';

interface ArticleSource {
  /** Collection entry id -- becomes the route at /articles/<id>/ */
  id: string;
  /** "owner/repo" */
  repo: string;
  /** Path to the article file within that repo, e.g. "article.md" */
  path: string;
  /** Branch/ref to fetch from. Defaults to the repo's default branch. */
  ref?: string;
  /**
   * Paths (within the same repo) to images the article references.
   * Written to public/images/<id>/<basename> -- reference them in the
   * article body as /images/<id>/<basename>.
   */
  images?: string[];
}

export async function fetchGithubFile(repo: string, filePath: string, token: string, ref?: string) {
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}${ref ? `?ref=${ref}` : ''}`;
  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { content: string; encoding: string; size?: number };
  // The Contents API only inlines base64 `content` for files under 1 MB.
  // Past that it still answers 200, but with an empty content string and
  // encoding "none" -- which this would happily decode into a silent
  // 0-byte file rather than an error. That never came up while only
  // markdown and small PNGs went through here; it matters now that tool
  // apps can carry build artifacts (a WASM bundle, a firmware hex)
  // alongside their HTML, which are the things likely to grow.
  if (json.encoding !== 'base64') {
    throw new Error(
      `unexpected encoding "${json.encoding}" (size ${json.size ?? 'unknown'} bytes) -- ` +
        'the Contents API does not return files over 1 MB inline'
    );
  }
  return Buffer.from(json.content, 'base64');
}

export function githubArticlesLoader(sources: ArticleSource[]): Loader {
  return {
    name: 'github-articles-loader',
    load: async ({ store, parseData, generateDigest, renderMarkdown, logger, config }) => {
      const token = process.env.GITHUB_CONTENT_TOKEN || import.meta.env.GITHUB_CONTENT_TOKEN;
      if (!token) {
        logger.warn(
          'GITHUB_CONTENT_TOKEN is not set -- skipping all GitHub-sourced articles. ' +
            'Set it in .env (local) or Vercel Environment Variables (deployed) to fetch them.'
        );
        return;
      }

      logger.info(`Fetching ${sources.length} article source(s)...`);
      for (const source of sources) {
        try {
          const raw = (await fetchGithubFile(source.repo, source.path, token, source.ref)).toString('utf-8');
          const { data, content } = matter(raw);

          const parsedData = await parseData({ id: source.id, data });
          const rendered = await renderMarkdown(content);

          store.set({
            id: source.id,
            data: parsedData,
            body: content,
            rendered,
            digest: generateDigest(raw),
          });
          logger.info(`Stored article "${source.id}" (${content.length} chars).`);
        } catch (err) {
          logger.error(`Error fetching ${source.repo}/${source.path}: ${(err as Error).message} -- skipping.`);
          continue;
        }

        for (const imagePath of source.images ?? []) {
          try {
            const bytes = await fetchGithubFile(source.repo, imagePath, token, source.ref);
            const destDir = path.join(fileURLToPath(config.root), 'public', 'images', source.id);
            await mkdir(destDir, { recursive: true });
            const destFile = path.join(destDir, path.basename(imagePath));
            await writeFile(destFile, bytes);
            logger.info(`Wrote image /images/${source.id}/${path.basename(imagePath)} (${bytes.length} bytes).`);
          } catch (err) {
            logger.warn(`Error fetching image ${source.repo}/${imagePath}: ${(err as Error).message} -- skipping.`);
          }
        }
      }
    },
  };
}
