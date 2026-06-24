# Technical Architecture — Tryllemuseet Web

> **Document type:** Operations Routine / Architecture Reference
> **Scope:** tryllemuseet-web monorepo — Sanity Studio + Astro frontend
> **Last updated:** 2026-06-24

---

## Table of Contents

1. [System Architecture & Data Flow](#1-system-architecture--data-flow)
2. [Configuration Synchronization and Git Philosophy](#2-configuration-synchronization-and-git-philosophy)
3. [Environment Variables and Security](#3-environment-variables-and-security)
4. [CI/CD and Deployment Pipeline](#4-cicd-and-deployment-pipeline)

---

## 1. System Architecture & Data Flow

### Overview

The system consists of three distinct layers that each have a clearly defined responsibility:

```
┌─────────────────────────────────────────────────────────────┐
│  CONTENT LAYER          Sanity Cloud (sanity.io)            │
│  tryllemuseet-no.sanity.studio                              │
│  Project ID: n2ynpgty  │  Dataset: production              │
└──────────────────────────────┬──────────────────────────────┘
                               │ GROQ API (REST/CDN)
                               ▼ (at build time only)
┌─────────────────────────────────────────────────────────────┐
│  BUILD LAYER            Astro (Static Site Generation)      │
│  Fetches all content → generates static HTML/CSS/JS files  │
│  Source: /web — runs in GitHub Actions / Vercel build env  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Static file upload
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVING LAYER          Vercel Edge Network (CDN)           │
│  Serves pre-rendered static files globally, zero server     │
└─────────────────────────────────────────────────────────────┘
```

### Rendering Mode: Static Site Generation (SSG)

The Astro frontend uses **pure SSG** — there is no server runtime. The `astro.config.mjs` file at `/web/astro.config.mjs` contains no `output: 'server'` or `output: 'hybrid'` directive, which means Astro defaults to fully static output:

```js
// web/astro.config.mjs
export default defineConfig({});  // no output directive = SSG
```

**What this means in practice:**

- At build time, Astro calls every GROQ query in `sanity.ts` to fetch all content from Sanity.
- The result is a directory of plain `.html`, `.css`, and `.js` files in `/web/dist/`.
- Vercel receives and serves these files from its global CDN — no Node.js process runs at request time.
- Content changes in Sanity do **not** appear on the live site until a new build is triggered.

### Dynamic Routes via `getStaticPaths()`

Pages with variable URL segments (e.g., `/utstillingen/houdini`) are generated at build time using Astro's `getStaticPaths()` mechanism. Every such function queries Sanity for all documents of the relevant type and maps them to route parameters:

```ts
// web/src/pages/utstillingen/[slug].astro
export async function getStaticPaths() {
  const magicians = await getAllMagicians()   // GROQ query at build time
  return magicians
    .filter(m => m.slug && typeof m.slug === 'string')
    .map(m => ({ params: { slug: String(m.slug) } }))
}
```

All dynamic routes in the project follow this pattern:

| Route file | Content type | Query function |
|---|---|---|
| `utstillingen/[slug].astro` | `magician` | `getAllMagicians()` |
| `utstillingen/artefakter/[slug].astro` | `artifact` | `getAllArtifacts()` |
| `tryllehistorie/norske-legender/[slug].astro` | `legend` | `getLegendPaths()` |
| `tryllehistorie/magiens-hvem-er-hvem/[slug].astro` | `biography` | `getBiographyPaths()` |
| `tryllehistorie/got-talent/[slug].astro` | `tvAppearance` | `getTvAppearancePaths()` |
| `tryllehistorie/fool-us/[slug].astro` | `tvAppearance` | `getTvAppearancePaths()` |
| `tryllehistorie/nordisk-tv-magi/[slug].astro` | `tvAppearance` | `getTvAppearancePaths()` |
| `tryllehistorie/historiske-opptak/[slug].astro` | `historicalClip` | (own paths query) |

All `getStaticPaths()` calls filter on `isVisible != false`, ensuring hidden documents never get static pages generated.

### Sanity Client Configuration

The client is initialized in `/web/src/lib/sanity.ts` with environment-aware settings:

```ts
const isProd = import.meta.env.PUBLIC_VERCEL_ENV === 'production'

export const sanityClient = createClient({
  projectId:   import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? 'n2ynpgty',
  dataset:     import.meta.env.PUBLIC_SANITY_DATASET   ?? 'production',
  apiVersion:  '2024-01-01',
  useCdn:      isProd,              // CDN cache in production only
  perspective: isProd ? 'published' : 'drafts',  // drafts visible locally
  token:       isProd ? undefined : (import.meta.env.SANITY_PREVIEW_TOKEN ?? undefined),
})
```

| Setting | Production | Local development |
|---|---|---|
| `useCdn` | `true` (Sanity CDN) | `false` (direct API) |
| `perspective` | `'published'` | `'drafts'` |
| `token` | `undefined` | Preview token from `.env.local` |

The CDN caches read queries for approximately 60 seconds in production. During local development, the direct API is used with the drafts perspective so unpublished Sanity content is visible while editing.

### Sanity Studio

The Sanity Studio (`/`) runs as a separate React application, hosted at `https://tryllemuseet.sanity.studio` (deployed via `npm run deploy` from the repo root). It connects to the same `production` dataset. Schema changes require a studio redeploy to become active in the editor UI.

The Studio and the Astro frontend share the same **dataset** but are entirely independent applications. A schema change in a `schemaTypes/` file must be deployed to the Studio before editors can use it, and affects what the frontend receives in GROQ responses immediately upon publication.

---

## 2. Configuration Synchronization and Git Philosophy

### Monorepo Structure

The repository is a **monorepo** containing two distinct Node.js applications:

```
tryllemuseet-web/               ← Git root
├── sanity.config.ts            ← Sanity Studio configuration
├── sanity.cli.ts               ← CLI config (project ID, studioHost)
├── schemaTypes/                ← All content type definitions
│   ├── index.ts                ← Schema registry (registers active types)
│   ├── magician.ts
│   ├── biography.ts
│   └── ...                     ← 25+ schema files
├── package.json                ← Sanity Studio dependencies
├── scripts/                    ← Utility/import scripts
├── .github/workflows/          ← GitHub Actions automation
└── web/                        ← Astro frontend (separate npm workspace)
    ├── astro.config.mjs
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── lib/sanity.ts       ← GROQ queries + TypeScript types
        ├── layouts/
        ├── pages/
        └── components/
```

Both applications have independent `package.json` files and `node_modules`. They are developed and deployed independently but share the same Git repository and the same Sanity dataset.

### Git as Single Source of Truth

Git tracks **all code and configuration** for both the Studio and the Astro frontend. The local disk (VS Code) and the GitHub remote are kept in sync by `git push` / `git pull` — at any point, `git clone` of the repository must be sufficient to reproduce the entire application, except for secrets.

**What Git tracks (always committed):**

| Category | Files |
|---|---|
| Studio schema | `schemaTypes/*.ts`, `schemaTypes/index.ts` |
| Studio config | `sanity.config.ts`, `sanity.cli.ts`, root `package.json` |
| Frontend config | `web/astro.config.mjs`, `web/tsconfig.json`, `web/package.json` |
| Query layer | `web/src/lib/sanity.ts` |
| Pages & components | `web/src/pages/**/*.astro`, `web/src/layouts/**`, `web/src/components/**` |
| Automation | `.github/workflows/*.yml` |
| Static assets | `web/public/` (logos, favicons, fonts) |
| Lock files | `package-lock.json`, `web/package-lock.json` |
| Project docs | `docs/*.md`, `CLAUDE.md` |

**What Git never tracks (always `.gitignore`d):**

| Category | Pattern | Reason |
|---|---|---|
| Secrets & env vars | `.env`, `.env.*` | Contains API tokens; Vercel Dashboard holds production values |
| Dependencies | `node_modules/` | Reproducible via `npm ci` |
| Build output | `dist/` | Generated at deploy time |
| Sanity runtime | `.sanity/` | Temporary dev-server state |
| Astro generated | `.astro/` | Auto-generated type definitions |
| Import data | `*.ndjson` | One-off seed files, not application code |

> **Important:** The web `.gitignore` ignores **both** `.env` and `.env.*`. This means neither the public config file (`.env`) nor the local secrets file (`.env.local`) are tracked in version control. Public values (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`) have hardcoded fallbacks directly in `sanity.ts` as a resilience measure.

### Content vs. Configuration Separation

The system enforces a strict boundary between **structure** (in Git) and **data** (in Sanity Cloud):

```
Git repository                    Sanity Cloud (production dataset)
─────────────────────────         ──────────────────────────────────
schemaTypes/magician.ts           171 magician documents
  → defines fields, types         → actual magician data
  → validation rules              → images, texts, slugs
  → display config                → published/draft state

web/src/lib/sanity.ts             Sanity GROQ API
  → defines queries               → executes those queries
  → TypeScript interfaces         → returns typed JSON

web/src/pages/*.astro             Vercel CDN
  → defines HTML structure        → serves rendered pages
  → defines layout logic          → to visitors worldwide
```

No production content (document data, images, editor-entered text) lives in Git. This means:
- Destroying and re-cloning the repository does not lose any content.
- Sanity outages affect content availability but not the deployed code.
- Content editors work in Sanity Studio without touching Git.

The `sanity.ts` file is the **single location for all GROQ queries** in the codebase. No page file contains inline GROQ. This ensures query logic is discoverable, testable, and versioned in one place.

---

## 3. Environment Variables and Security

### Variable Inventory

| Variable | Scope | Tracked in Git | Set where |
|---|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Public | No (hardcoded fallback in code) | Vercel Dashboard / `.env` locally |
| `PUBLIC_SANITY_DATASET` | Public | No (hardcoded fallback in code) | Vercel Dashboard / `.env` locally |
| `PUBLIC_VERCEL_ENV` | Public | No | Injected automatically by Vercel |
| `SANITY_PREVIEW_TOKEN` | Secret | No | `.env.local` locally only |
| `VERCEL_DEPLOY_HOOK_TEST` | Secret | No | GitHub Actions secret |
| `VERCEL_DEPLOY_HOOK_PROD` | Secret | No | GitHub Actions secret (prepared, not yet active) |
| `YOUTUBE_API_KEY` | Secret | No | GitHub Actions secret |
| `SANITY_TOKEN` | Secret | No | GitHub Actions secret |

### The `PUBLIC_` Prefix Convention

Astro enforces a naming convention for environment variables: only variables prefixed with `PUBLIC_` are accessible in client-side JavaScript and in `.astro` component frontmatter that renders on the client. Variables without the prefix are server-only (build-time only).

`PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` are safe to expose publicly — Sanity project IDs identify a project but do not grant write access. The dataset name (`production`) is not sensitive.

`SANITY_PREVIEW_TOKEN` intentionally lacks the `PUBLIC_` prefix and is only used locally during development for the drafts perspective. It is never set in the Vercel production environment (the client code explicitly passes `token: isProd ? undefined : ...`).

### Local Development Setup

A developer setting up the project locally needs a `.env.local` file in `/web/`:

```
# web/.env.local  (never committed)
PUBLIC_SANITY_PROJECT_ID=n2ynpgty
PUBLIC_SANITY_DATASET=production
SANITY_PREVIEW_TOKEN=<token-from-sanity-dashboard>
```

The first two variables have hardcoded fallbacks in `sanity.ts`, so they are optional. The preview token is required only to see unpublished draft content.

### Production Environment (Vercel Dashboard)

In Vercel, the following environment variables are set via the project dashboard under **Settings → Environment Variables**:

| Variable | Environment | Value |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Production, Preview | `n2ynpgty` |
| `PUBLIC_SANITY_DATASET` | Production, Preview | `production` |
| `PUBLIC_VERCEL_ENV` | — | Injected by Vercel automatically (`production` / `preview` / `development`) |

`SANITY_PREVIEW_TOKEN` is **not** set in the Vercel production environment. The production build runs with `isProd = true`, which sets `token: undefined` and `perspective: 'published'`, so no token is needed or used.

### GitHub Actions Secrets

The automation workflows require secrets stored in the GitHub repository under **Settings → Secrets and variables → Actions**:

| Secret | Used by | Purpose |
|---|---|---|
| `VERCEL_DEPLOY_HOOK_TEST` | `daily-rebuild.yml` | URL to trigger a Vercel rebuild |
| `VERCEL_DEPLOY_HOOK_PROD` | `daily-rebuild.yml` | Production hook (prepared, commented out) |
| `YOUTUBE_API_KEY` | `sync-youtube.yml` | YouTube Data API v3 key |
| `SANITY_TOKEN` | `sync-youtube.yml` | Write token for the Sanity dataset |

These secrets are injected as environment variables into the GitHub Actions runner at execution time and are never written to disk or exposed in logs.

---

## 4. CI/CD and Deployment Pipeline

### Web Frontend: Git Push → Vercel Auto-Deploy

```
Developer (VS Code)
       │
       │  git commit + git push origin main
       ▼
GitHub repository (tryllemuseet/tryllemuseet-web)
       │
       │  Vercel GitHub integration (webhook on push)
       ▼
Vercel Build Environment
  1. git clone repository
  2. cd web && npm ci
  3. astro build
     ├── Fetches all content from Sanity GROQ API
     ├── Runs getStaticPaths() for all dynamic routes
     └── Outputs /web/dist/ (static HTML/CSS/JS)
       │
       │  Upload to Vercel CDN
       ▼
Live site at tryllemuseet.no
```

Vercel monitors the GitHub repository via a webhook. Every push to `main` triggers a production build. Pushes to other branches trigger preview deployments at temporary URLs.

The build takes approximately 1–3 minutes, after which the new static files are globally available. There is no zero-downtime swap concern — Vercel atomically promotes the new deployment.

### Sanity Studio: Manual Deploy

The Studio is a separate deployment that is **not** triggered by Git pushes. It must be deployed manually:

```bash
# From the repository root
npm run deploy
```

This compiles the Studio (React app + schema) and uploads it to Sanity's own hosting at `https://tryllemuseet-no.sanity.studio`. The `sanity.cli.ts` file configures the target:

```ts
export default defineCliConfig({
  api: { projectId: 'n2ynpgty', dataset: 'production' },
  studioHost: 'tryllemuseet-no',
  deployment: { autoUpdates: true },
})
```

Studio deploys are required when schema files change (new fields, renamed types, validation rules, display settings). They are not required for content changes — those are always live in Sanity Cloud immediately upon publication.

### Scheduled Automation (GitHub Actions)

Two cron jobs run daily via GitHub Actions:

#### 1. Daily Rebuild (`daily-rebuild.yml`)

```
05:30 UTC daily
       │
       ▼
GitHub Actions runner
  curl -X POST "$VERCEL_DEPLOY_HOOK_TEST"
       │
       ▼
Vercel rebuild (same process as push-triggered build)
```

**Purpose:** Scheduled content (e.g., events with future dates, press clippings with `publishedAt` in the future) becomes visible once the date passes — but only after a rebuild. The daily trigger ensures such content appears within 24 hours of its scheduled date without any manual action.

#### 2. YouTube Sync (`sync-youtube.yml`)

```
06:00 UTC daily
       │
       ▼
GitHub Actions runner
  node scripts/importYouTubeClips.mjs
       │  (uses YOUTUBE_API_KEY + SANITY_TOKEN)
       ▼
YouTube Data API v3
  → fetches video metadata
       │
       ▼
Sanity Write API (dataset: production)
  → creates/updates historicalClip documents
```

**Purpose:** Automatically imports and updates video clip metadata from YouTube (currently Egelos's channel) into the Sanity dataset. The subsequent daily rebuild (05:30 the next day) will pick up the new content.

The two jobs are scheduled 30 minutes apart (05:30 and 06:00 UTC) to ensure any content changes from the YouTube sync are captured in the following day's rebuild, not the same-day one.

### Complete Content-Change-to-Live Timeline

When an editor publishes a document in Sanity Studio, the following sequence determines when it appears on the live site:

| Trigger | Time to live |
|---|---|
| Editor publishes in Studio → manual Vercel rebuild | ~1–3 minutes |
| Editor publishes in Studio → waits for daily cron | Up to 24 hours |
| Code push to `main` → Vercel auto-deploys | ~1–3 minutes |
| Schema change + `npm run deploy` (Studio) | Immediate for UI; no rebuild needed for API |

> **No webhooks from Sanity to Vercel are currently configured.** Content changes require either a manual redeploy or the daily scheduled rebuild. Adding a Sanity GROQ webhook pointing to the `VERCEL_DEPLOY_HOOK_PROD` URL would enable near-instant content updates.

### Build Verification

Before pushing, run the build locally to catch errors before Vercel does:

```bash
cd web
npm run build   # must complete without errors
```

A successful local build guarantees the Vercel deploy will succeed, since both environments use the same Astro version, the same `package-lock.json`, and the same Sanity dataset.
