# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tryllemuseet** is a magic museum website built with a monorepo architecture:
- **Sanity Studio** (root): Headless CMS for content management
- **Web Frontend** (`/web`): Astro-based static site generation

The site serves dual audiences: children (with interactive exhibitions and activities) and adults (with historical/biographical content about magicians). It also manages a library of magic-related books and historical TV appearances.

## Architecture

### Content Layer (Sanity CMS)

The schema defines 31 registered content types in `/schemaTypes` (see `schemaTypes/index.ts`):

**Page Types** (singletons):
- `homepage.ts` — Hero, exhibitions focus, sections, partnerships
- `barnPage.ts` — Children's section landing page
- `omOssPage.ts` — "About Us" page with museum history
- `besokPage.ts` — Visit page (opening hours, prices, transport)
- `kontaktPage.ts` — Contact page (form URL, FAQ)
- `tryllehistoriePage.ts` — Magic history landing page (sections, timeline)
- `ressurserPage.ts` — Resources landing page
- `arrangementPage.ts` — Events page hero and info strip
- `utstillingPage.ts` — Exhibition landing page
- `personvernPage.ts` — Privacy policy content
- `siteConfig.ts` — Global settings (email, address, contact info)

**Document Types** (queryable collections):
- `magician.ts` — Exhibition displays (4000+ years of magic history). Fields: child text, adult text, detailed mobile sections, QR-linked content, source links
- `biography.ts` — "Hvem er hvem" (Who's Who) reference: full name, aliases, birth/death dates, nationality, magician references
- `legend.ts` — Notable historical magicians with video, images, birth/death dates
- `tvAppearance.ts` — TV show appearances (Got Talent formats, Penn & Teller: Fool Us)
- `historicalClip.ts` — Archival video clips with metadata (synced daily from YouTube via GitHub Actions)
- `historiskeKlippNb.ts` — Historical newspaper articles (nb.no references, rewritten text, 70-year copyright gating for facsimiles)
- `mediaAppearance.ts` — The museum's own press/media coverage ("I media")
- `book.ts` — Library catalog with author, publication, availability status
- `event.ts` — Upcoming events/courses with dates, pricing, booking
- `artifact.ts` — Museum objects: origin, materials, condition, gallery images
- `partner.ts` — Sponsors/partners with category grouping
- `signageConfig.ts`, `signageVideo.ts`, `signageQuote.ts` — Content for the physical info screen (`/skjerm.html`)
- `quizConfig.ts`, `quizTheme.ts`, `quizQuestion.ts` — Tryllequiz (`/tryllequiz`): settings singleton with `isActive` master switch, selectable themes, and questions with difficulty + validated answers (see `docs/tryllequiz-concept.md`)

**Helper Types** (object types used inline by document types):
- `contentSection.ts` — Reusable heading + rich text block
- `sourceItem.ts` — External link with label

### Query Layer (Sanity Client)

`/web/src/lib/sanity.ts` provides:
- **Client setup**: Uses Sanity API v2024-01-01, CDN in production, preview mode with token locally
- **Type definitions**: TypeScript interfaces for Magician, Event, Artifact, Biography, Legend, Book, etc.
- **GROQ queries**: Exported async functions like getAllMagicians(), getMagicianBySlug(), getUpcomingEvents(), getBooksByMagician(), getHomepage(), getSiteConfig(), getAllPartners(), etc.
- **Image URL builder**: urlFor() function for Sanity image optimization (width, format, etc.)

### Web Frontend (Astro)

**Page Structure** (`/web/src/pages`):
- `index.astro` — Homepage: fetches magicians, events, homepage config, partners in parallel
- `barn.astro`, `besok.astro`, `arrangementer.astro`, `om-oss.astro`, `kontakt.astro`, `personvern.astro` — Main pages
- `tryllequiz.astro` — Interactive quiz; renders a "coming soon" teaser until `quizConfig.isActive` is on (the nav link in `BaseLayout.astro` follows the same flag)
- `om-oss/i-media/` — Museum press coverage
- `aktiviteter/`, `ressurser/` — Section landing pages; the library lives at `ressurser/bibliotek.astro` (`/bibliotek` redirects there)
- `utstillingen/` — Exhibition: `index`, `[slug]` (magician detail), `artefakter` (+ `[slug]`), `trylleforeningene/` (+ `[slug]`), `tryllebutikken`
- `tryllehistorie/` — Magic history archive:
  - `magiens-hvem-er-hvem` (+ `[slug]`) — biography directory
  - `norske-legender/` (+ `[slug]`) — legend portraits (incl. `henrik-ibsen` as a slug)
  - `got-talent/` and `fool-us/` (+ `[slug]`) — TV show archives with filtering/sorting
  - `historiske-opptak/` (+ `[slug]`) — archival TV clips
  - `historiske-artikler/` — press clipping archive
  - `nordisk-tv-magi/` — combined overview; its `[slug]` route 301-redirects to got-talent/fool-us
- `web/public/skjerm.html` — physical info screen; fetches Sanity client-side (live, not SSG) plus Entur bus departures. `/skjerm` redirects to it.
- Legacy/short URL redirects (QR codes, print) are defined in `web/astro.config.mjs` under `redirects`.

**Layout** (`/web/src/layouts`):
- `BaseLayout.astro` — Wrapper with header, nav, footer, global styles, Vercel Analytics

**Environment** (see `web/.env.example`):
- `.env`: Public Sanity config (project ID, dataset)
- `.env.local`: Preview token for draft content (git-ignored)

## Development Workflow

### Setup

Root (Sanity Studio):
```
npm install
npm run dev
```
Studio runs at http://localhost:3333

Web (Astro frontend):
```
cd web
npm install
npm run dev
```
Astro dev server at http://localhost:4321

### Common Tasks

**Content Editing**:
```
npm run dev   # from repo root
# Open http://localhost:3333 — Browse/edit documents
```

**Web Development**:
```
cd web
npm run dev
# Edit pages, components, or lib/sanity.ts queries
```

**Build & Deploy**:
```
# Sanity studio
npm run build        # Compiles to /dist
npm run deploy       # Deploys to Sanity hosting

# Web
cd web
npm run build        # Generates static HTML to ./dist/
npm run preview      # Preview production build locally

npm run deploy-graphql  # Syncs schema to Sanity GraphQL API
```

## Key Patterns

### Content Fetching (Frontend)

All queries in `sanity.ts` are server-side (Astro pages):

```typescript
// In index.astro
const [magicians, events, hp, config, partners] = await Promise.all([
  getAllMagicians(),
  getUpcomingEvents(3),
  getHomepage(),
  getSiteConfig(),
  getAllPartners(),
])
```

Queries use GROQ (Sanity Query Language):
- `*[_type == "magician"]` — Query by type
- `| order(order asc)` — Sort
- `{ _id, title, "slug": slug.current, ... }` — Project fields
- `[0]` — Get first doc
- `asset->{ _ref, url }` — Expand image references

### Static Generation

Dynamic routes use getStaticPaths():

```typescript
// Magician detail page generation
export async function getStaticPaths() {
  const magicians = await getAllMagicians()
  return magicians.map(m => ({ params: { slug: m.slug } }))
}
```

Every magician gets its own HTML file at build time.

### Rich Text (Portable Text)

Content from Sanity (e.g., adultText, mobileSections.body) is in Portable Text format:

```typescript
import { toHTML } from '@portabletext/to-html'
const html = toHTML(m.adultText)  // Renders as <p>, <strong>, etc.
```

### Image Optimization

```typescript
import { urlFor } from '../lib/sanity'
urlFor(image).width(800).format('webp').url()
```

## Important Queries & Types

ALL GROQ queries live in `web/src/lib/sanity.ts` — pages must import query functions from there, never call `sanityClient.fetch()` inline. (Exception: `web/public/skjerm.html`, which queries Sanity client-side by design.)

Key GROQ functions in `sanity.ts`:
- `getAllMagicians()` — Returns slug, order, years, tagline, image
- `getMagicianBySlug(slug)` — Full magician doc with mobile sections, sources
- `getHomepage()` — Hero, exhibition focus, sections
- `getUpcomingEvents(limit)` — Upcoming courses/events
- `getBooksByMagician(id)` — Books by/referencing a magician
- `getAllPartners()` — Sponsors grouped by category
- `getFoolUsAppearances()` / `getGotTalentAppearances()` — TV show archives
- `getAllHistoricalClips()` / `getHistoricalClipBySlug(slug)` — archival clips
- `getBiographyDirectory()` — compact biography list for Hvem er hvem
- Per-type `get*Paths()` helpers for `getStaticPaths()` (all filter `isVisible != false`)

Update TypeScript interfaces in sanity.ts when schema changes.

## Deployment

- **Studio**: Deployed via npm run deploy to Sanity hosting
- **Web**: Hosted on Vercel. `PUBLIC_VERCEL_ENV` controls CDN usage in production.

### Deploy hooks (web)

The web frontend is **not** auto-deployed on push to `main`. Deploys are triggered via Vercel deploy hooks called from GitHub Actions:

| Environment | URL | Hook secret | Workflow |
|---|---|---|---|
| Test | `test.tryllemuseet.no` | `VERCEL_DEPLOY_HOOK_TEST` | `.github/workflows/daily-rebuild.yml` |
| Production | `tryllemuseet.no` | `VERCEL_DEPLOY_HOOK_PROD` | same |

The `daily-rebuild.yml` workflow runs automatically at 05:30 UTC every day and can also be triggered manually via **Actions → Daily rebuild → Run workflow** on GitHub. Both hooks rebuild their branch with fresh Sanity content — they never ship new code; code reaches production only when the `prod` branch itself is updated. Both steps fail loudly if their hook secret is empty (this silently broke the test rebuild June 28 – July 1).

## Visibility / Unpublish Convention

All content document types (`magician`, `biography`, `legend`, `event`, `tvAppearance`, `historicalClip`, `book`, `artifact`, `partner`, `quizTheme`, `quizQuestion`) have a boolean field `isVisible` with `initialValue: true`.

**Rules:**
- Default is always `true` — new documents are visible automatically
- Setting `isVisible` to `false` hides the document from the website without deleting it
- All GROQ queries must include `&& isVisible != false` (not `== true`, so existing docs without the field are still shown)
- When adding a new queryable document type, add `isVisible` as the first field and add the filter to every query for that type
- `getStaticPaths()` calls must also filter by `isVisible != false` so hidden documents do not get their own static pages

## Common Gotchas

1. **Schema Changes**: After editing schema files, redeploy the studio for changes to appear in editor UI and API
2. **Slug Generation**: Slug fields auto-populate from name/title; manually edit if needed
3. **Image Assets**: Upload via Sanity UI; reference via asset->{ _ref, url } in queries
4. **Portable Text**: Always use toHTML() or astro-portabletext to render rich text
5. **Env Variables**: Public vars prefixed PUBLIC_*; secret vars in .env.local (git-ignored)
6. **Static Generation**: Sanity content changes require web frontend rebuild

## File Locations

| What | Where |
|------|-------|
| Schema definitions | `/schemaTypes/*.ts` |
| Sanity config | `/sanity.config.ts`, `/sanity.cli.ts` |
| Queries and types | `/web/src/lib/sanity.ts` |
| Pages | `/web/src/pages/*.astro` |
| Dynamic routes | `/web/src/pages/utstillingen/` and similar |
| Layouts | `/web/src/layouts/*.astro` |
| Styles | Scoped in .astro files |
| Env config | `/web/.env`, `/web/.env.local` |

## Git Conventions

Recent commits use patterns:
- `feat: add X` or `feat(section): implement Y`
- `fix: correct Z behavior`
- `feat(sanity): update schema types`
- `feat(pages): add new route`

Messages are concise; use body for detail if needed.

# Prosjektregler (lim inn nederst i generert CLAUDE.md)

## Arbeidsflyt og git

- Commit og push alle endringer ved slutten av hver arbeidsøkt. GitHub main er alltid sannheten.
- Sky-økter (Claude Code on the web) jobber alltid på egen gren og leverer pull request — aldri push direkte til main.
- Skriv beskrivende commit-meldinger på engelsk.
- Ved merge-konflikter eller uventet divergens mellom lokal og remote: stopp og spør, ikke løs automatisk.

## Sanity og innhold

- Produksjonsdatasettet inneholder ekte innhold (bl.a. 171 magikerbiografier, bokregister, arrangementer). Test alltid skjemaendringer mot development-datasettet først.
- Skjemaendringer som kan bryte eksisterende dokumenter (felt som fjernes, endrer type eller blir påkrevd): flagg konsekvensene og spør før implementering.
- Ikke slett eller masseoppdater dokumenter i produksjonsdatasettet uten eksplisitt bekreftelse.
- GROQ-spørringer holdes samlet på ett sted i kodebasen (følg eksisterende struktur).

## Språk og innhold

- Alt synlig innhold på nettsiden er på norsk (bokmål).
- Kode, kommentarer og commit-meldinger på engelsk.
- Norske tegn (æ, ø, å) skal håndteres korrekt i URL-er/slugs — bruk eksisterende slug-konvensjon i prosjektet.

## Kvalitet og forsiktighet

- Ved inkonsistenser i eksisterende kode eller konfigurasjon (navn, stier, versjoner som ikke stemmer overens): flagg og spør — aldri rett stille.
- Kjør `astro build` lokalt (eller verifiser at bygget går gjennom) før push, slik at Vercel-deploy ikke knekker.
- Ikke endre Vercel-konfigurasjon, miljøvariabler eller deploy-oppsett uten å spørre.
- Ikke oppgrader avhengigheter (Astro, Sanity-pakker) som del av andre oppgaver — det gjøres som egne, dedikerte oppgaver.

## Dokumentasjon

- Teknisk dokumentasjon skrives på engelsk.
- Bruk begrepet "Operations Routine" for prosedyredokumenter, ikke "runbook" eller "playbook".
