// Custom Astro Content Layer loader that pulls article.md content directly
// from other GitHub repos (project repos) rather than from a local file.
// See CLAUDE.md's dated entry for the reasoning: project write-ups live at
// the project level, this site pulls them in at build time instead of
// having them authored twice or synced via a git submodule.
//
// Fetches once per `sources` entry via the GitHub Contents API (works for
// private repos with a token) and stores each as one collection entry.
// A missing token or a failed fetch logs a warning and skips that entry
// rather than failing the whole site build -- useful before the token is
// configured, or if a project repo is briefly unreachable.
import matter from 'gray-matter';
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
}

export function githubArticlesLoader(sources: ArticleSource[]): Loader {
  return {
    name: 'github-articles-loader',
    load: async ({ store, parseData, generateDigest, renderMarkdown, logger }) => {
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
        const apiUrl = `https://api.github.com/repos/${source.repo}/contents/${source.path}${
          source.ref ? `?ref=${source.ref}` : ''
        }`;
        try {
          const res = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });
          if (!res.ok) {
            logger.warn(
              `Failed to fetch ${source.repo}/${source.path}: ${res.status} ${res.statusText} -- skipping.`
            );
            continue;
          }
          const json = (await res.json()) as { content: string; encoding: string };
          const raw = Buffer.from(json.content, json.encoding as BufferEncoding).toString('utf-8');
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
          logger.error(`Error fetching ${source.repo}/${source.path}: ${(err as Error).stack} -- skipping.`);
        }
      }
    },
  };
}
