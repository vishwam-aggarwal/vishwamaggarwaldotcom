---
name: check-site
description: >
  Crawls every page of this Astro site (built fresh, including every
  GitHub-fetched article/tool app) for broken links, broken images, and
  content that silently failed to fetch at build time. Use when the user
  asks to check the site for broken links, missing images, dead links,
  404s, or asks "does everything still work" / "did that rename break
  anything" after editing content.config.ts, renaming an article id,
  moving/removing a page, or editing article.md/data.md in a source repo.
  Also good to run periodically as a general health check, or before/after
  any deploy that touches routing.
---

# check-site

Two independent failure modes have bitten this site before, and this
skill checks for both:

1. **Silent fetch failures** — an `articleSources`/`toolAppSources` entry
   in `src/content.config.ts` 404s against GitHub (wrong id, renamed repo
   path, stale ref) and the loader just logs a warning and skips it. The
   build still succeeds, so nothing *looks* wrong — the content is just
   quietly absent. Caught by reading the build log, not by crawling.
2. **Broken links/images within what did build** — a hardcoded href or
   img src pointing at an old route (e.g. after an article id rename), a
   cross-link between an article and its `/data/` page, a GitHub link
   using the wrong branch name, etc. Caught by crawling `dist/`.

## Steps

1. **Confirm the local environment can actually fetch remote content**
   before building, or the crawl will be misleadingly clean (nothing
   fetched = nothing to find broken). Check that `GITHUB_CONTENT_TOKEN` is
   set — `.env.local` (created via `vercel env pull`) is the usual source
   locally. If it's missing, tell the user before proceeding; a build
   without it only checks the hand-authored pages (about, projects,
   tools), not any article or tool app content.

2. **Clean build**, so nothing stale from a previous run masks a real
   problem:
   ```
   rm -rf dist public/images public/tools/*/app
   npm run build
   ```
   Capture the full build output — don't just check the exit code.

3. **Scan the build log for loader failures.** Grep for
   `[github-articles-loader]` and `[github-tool-apps-loader]` lines at
   `ERROR` or `WARN` level (`Error fetching ... -- skipping` /
   `GITHUB_CONTENT_TOKEN is not set`). Each one means a source in
   `content.config.ts` is currently producing *nothing* — cross-reference
   against the `articleSources`/`toolAppSources` arrays there to name
   exactly which entry and why (404 = wrong id/path/ref; other status =
   worth a closer look; token missing = environment issue, not a content
   bug).

4. **Crawl the built site** with linkinator (fetched via `npx`, no need to
   add it as a project dependency):
   ```
   npx linkinator dist --recurse --format json
   ```
   This checks every internal link, every image `src`, and every external
   link (including GitHub repo/blob links) reachable from any page,
   following internal links recursively so every route gets covered
   without needing to hardcode a page list. Save the output to a scratch
   file and parse it — `state: "BROKEN"` entries are what matter; ignore
   `OK`/`SKIPPED`. Each broken entry has `url`, `status`, and `parent`
   (which page it was found on) — that's enough to name the exact fix
   needed without re-deriving it from scratch.

5. **Sanity-check each broken external link before reporting it as new.**
   A 404 on an external GitHub link can mean the link is genuinely wrong
   (bad branch name, stale path, typo) — verify with `gh api
   repos/<owner>/<repo>/contents/<path>` and `gh repo view <owner>/<repo>
   --json defaultBranchRef` before proposing a fix, the same way a wrong
   branch name (`main` vs this account's actual default, `master`) was
   caught. Don't just report the raw 404 without checking whether it's a
   fixable mistake here vs. a repo that's genuinely private/gone — if a
   repo is intentionally private for now (check CLAUDE.md's Status section
   for anything already flagged as a known, deferred issue), say so
   explicitly rather than re-flagging it as new each run.

6. **Report clearly, grouped by cause, not as a flat link dump**:
   - Silently-missing content (from step 3) — which `content.config.ts`
     entry, why, and whether it looks like an id/path mismatch from a
     recent rename (check recent git log on `content.config.ts` and the
     source repo if the cause isn't obvious).
   - Broken internal links/images (from step 4) — source page → broken
     target → likely fix (usually a stale id after a rename, exactly like
     `/articles/servo-calibration/` and `/images/<old-id>/...` have been
     before).
   - Broken external links (from step 4, verified in step 5) — source
     page → broken target → the actual fix (branch name, path, etc.), or
     "known, deferred" if it matches something already documented in
     CLAUDE.md.
   - A short "all clear" is fine when there's genuinely nothing to
     report — don't pad a clean result with caveats.

7. **Don't auto-fix without asking.** A fix might live in this repo
   (`content.config.ts`, an `.astro` page) or in a source repo
   (`article.md`/`data.md`'s own cross-links, same as the id-rename
   cross-link bugs from earlier this session) — confirm scope with the
   user before editing, since it may span repos they'll want to review
   each of individually.

8. **Clean up** the scratch JSON file from wherever it was written before
   finishing.
