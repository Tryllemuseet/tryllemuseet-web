# Operations Routine: development dataset

## Purpose

Since 2026-10-05 the Sanity project (`n2ynpgty`) is on the Growth (Non-Profit) plan, which allows 3 datasets. This routine sets up a `development` dataset holding a copy of `production`, so schema changes and bulk/migration scripts can be tested against realistic content before they touch the real 171 biographies, book register, events etc.

`development` is a sandbox, not a staging step: content is **not** promoted from `development` to `production`. Real content is still edited in `production` via the live Studio. Code changes keep flowing `main` → test → `prod` as before.

## Prerequisites

- An account with the **Administrator** role on project `n2ynpgty` (the editor-scoped API tokens used by scripts/CI cannot create datasets or edit webhooks).
- Sanity CLI via `npx sanity` from the repo root, logged in (`npx sanity login`).

## Steps

Do them in this order — step 1 must happen before any content is written to the new dataset.

### 1. Stop webhooks from firing on the new dataset

The "Vercel Rebuild" webhook listens on dataset `*` (all datasets). Webhooks fire **once per changed document**, so filling `development` with a few thousand documents would queue thousands of `tryllemuseet-web` deploys and exhaust Vercel's daily deployment cap — the same failure as the 2026-07-30 incident (see `deploy-debouncer-operations-routine.md`).

At <https://www.sanity.io/manage/project/n2ynpgty/api> → Webhooks:

- Edit **"Vercel Rebuild"** and change its dataset from `*` to `production`, **or** delete it — "Deploy test" (dataset `production`) already calls the same deploy hook, so the two are redundant.
- Leave "Deploy test" unchanged.

Verify: every remaining webhook lists dataset `production`, none `*`.

### 2. Create the dataset and copy production into it

Preferred — server-side copy (creates the dataset, copies documents and assets):

```
npx sanity dataset copy production development
```

The CLI prints a job ID and follows its progress. Add `--skip-history` to skip copying document history (faster; history isn't needed in a sandbox).

If the copy command is refused (e.g. not available on the plan), fall back to export/import:

```
npx sanity dataset create development --visibility private
npx sanity dataset export production production-YYYY-MM-DD.tar.gz
npx sanity dataset import production-YYYY-MM-DD.tar.gz development
```

Keep the `.tar.gz` outside the repo (it contains every document and asset). It doubles as a production backup.

**Visibility:** `production` is public (anyone with the project ID can read published content — fine, it's what the website shows). For `development`, choose **private** so half-finished test content isn't world-readable. Consequence: reading it requires a token — locally that's the existing `SANITY_PREVIEW_TOKEN` in `web/.env.local`. If the copy command creates it as public, change it with `npx sanity dataset visibility set development private`.

### 3. Deploy the schema to the new dataset (optional)

So tools that read the deployed schema (Sanity MCP `get_schema`, Vision) see it:

```
SANITY_STUDIO_DATASET=development npx sanity schema deploy
```

### 4. Verify

```
npx sanity dataset list                       # shows production and development
npx sanity documents query 'count(*[_type == "biography"])' --dataset production
npx sanity documents query 'count(*[_type == "biography"])' --dataset development
```

The two counts should match. Then start a local Studio against it (below) and open a few documents with images.

## Using the development dataset

Nothing is pointed at `development` by default — every tool falls back to `production` unless told otherwise.

| Tool | How to target `development` |
|---|---|
| Studio (local) | `SANITY_STUDIO_DATASET=development npm run dev` (or put it in the repo-root `.env`). **Unset it before `npm run deploy`** — the deployed Studio must stay on `production`. |
| Web (local) | `PUBLIC_SANITY_DATASET=development` in `web/.env`, plus `SANITY_PREVIEW_TOKEN` in `web/.env.local` (dataset is private). |
| Scripts in `scripts/` | `SANITY_DATASET=development node scripts/<script>.mjs` — most scripts read `SANITY_DATASET`. |
| Vercel (test/prod) | No change. Both stay on `production`. |

## Refreshing the copy

`development` drifts from `production` over time. To reset it to a fresh copy:

```
npx sanity dataset delete development
npx sanity dataset copy production development
```

Anything only in `development` is lost — that's the point of a sandbox, but check with whoever is using it first. Step 1 (webhooks) stays in effect, so refreshes are safe.

## Rollback

`npx sanity dataset delete development` removes it entirely. `production` is never touched by this routine (only read from).
