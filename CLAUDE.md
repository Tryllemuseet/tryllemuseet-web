# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tryllemuseet** is a magic museum website built with a monorepo architecture:
- **Sanity Studio** (root): Headless CMS for content management
- **Web Frontend** (`/web`): Astro-based static site generation

The site serves dual audiences: children (with interactive exhibitions and activities) and adults (with historical/biographical content about magicians). It also manages a library of magic-related books, historical TV appearances, press clippings, and a biographical who's-who reference.

## Architecture

### Content Layer (Sanity CMS)

The schema defines 24 active content types in `/schemaTypes`:

**Page Types** (singleton documents, one per page):
- `homepage.ts` — Hero, exhibitions focus, sections, partnerships, press highlight
- `barnPage.ts` — Children's section landing page
- `omOssPage.ts` — "About Us" page with museum history
- `besokPage.ts` — "Visit Us" page with practical information
- `kontaktPage.ts` — Contact page
- `tryllehistoriePage.ts` — "Magic History" section landing page
- `ressurserPage.ts` — Resources section landing page
- `arrangementPage.ts` — Events/courses section landing page
- `utstillingPage.ts` — Exhibition section landing page
- `personvernPage.ts` — Privacy policy page
- `siteConfig.ts` — Global settings (email, address, contact info, social links)

**Document Types** (queryable collections, multiple documents per type):
- `magician.ts` — Exhibition displays (4000+ years of magic history). Fields: child text, adult text, detailed mobile sections, QR-linked content, source links, poster image
- `biography.ts` — "Hvem er hvem" (Who's Who) reference: full name, aliases, birth/death dates, nationality, magician references (172+ entries)
- `legend.ts` — Notable historical magicians with video, images, birth/death dates
- `tvAppearance.ts` — TV show appearances (Got Talent, Penn & Teller: Fool Us, etc.)
- `historicalClip.ts` — Archival video clips with metadata
- `mediaAppearance.ts` — Press and media mentions (newspaper, TV, radio, podcast) with featured flag
- `pressClipping.ts` — News articles/clippings about the museum, with `needsReview` flag for editorial workflow
- `book.ts` — Library catalog with author, publication year, availability status, type (Norwegian/international/public domain)
- `event.ts` — Upcoming events/courses with dates, pricing, booking URL, age group
- `artifact.ts` — Museum objects: origin, materials, condition, provenance, gallery images
- `partner.ts` — Sponsors/partners with category grouping (public/private/organization)

**Helper Types** (object types used inline by document types):
- `contentSection.ts` — Reusable heading + rich text block
- `sourceItem.ts` — External link with label

**Note**: The original Sanity template stubs (`author.ts`, `category.ts`, `post.ts`, `blockContent.ts`) have been removed — they were never registered in `schemaTypes/index.ts`.

**Custom Studio Components** (`/schemaTypes/components/`):
- `NbUrlInput.tsx` — Custom Sanity input field for Norwegian National Library (NB.no) URLs

### Query Layer (Sanity Client)

`/web/src/lib/sanity.ts` (~1200 lines) provides:
- **Client setup**: Sanity API v2024-01-01, CDN in production (`PUBLIC_VERCEL_ENV === 'production'`), draft perspective with preview token in local/non-prod environments
- **Type definitions**: TypeScript interfaces for all content types
- **GROQ query functions**: All exported async functions for fetching content
- **Image URL builder**: `urlFor()` for Sanity image optimization
- **Helper constants**: `showMeta`, `showLabels`, `resultLabels` — UI display maps for TV show types
- **`portableTextToHtml()`**: Converts Sanity Portable Text arrays to HTML strings

**All GROQ query functions:**

| Function | Returns |
|----------|---------|
| `getAllMagicians()` | All visible magicians (slug, order, years, tagline, image) |
| `getMagicianBySlug(slug)` | Full magician doc with mobile sections, sources |
| `getMagicianByQR(qrNumber)` | Magician looked up by QR code number |
| `getUpcomingEvents(limit?)` | Upcoming events, sorted by date |
| `getAllEvents()` | All events including past ones |
| `getAllArtifacts()` | All visible artifacts |
| `getArtifactBySlug(slug)` | Full artifact doc with gallery |
| `getFeaturedArtifacts()` | Artifacts marked as featured |
| `getAllBooks()` | Full book catalog |
| `getPublicDomainBooks()` | Books in the public domain |
| `getNorwegianBooks()` | Norwegian magic books |
| `getBooksByMagician(id)` | Books referencing a specific magician |
| `getFeaturedBooks()` | Books marked as featured |
| `getAllBiographies()` | Full "Hvem er hvem" list |
| `getBiographyBySlug(slug)` | Single biography with related magician refs |
| `getBiographyPaths()` | Slugs for static path generation |
| `getAllLegends()` | All legend profiles |
| `getLegendBySlug(slug)` | Full legend doc with video and images |
| `getLegendPaths()` | Slugs for static path generation |
| `getAllTvAppearances()` | All TV appearances |
| `getTvAppearanceBySlug(slug)` | Full TV appearance doc |
| `getTvAppearancesByMagician(id)` | TV appearances for a specific magician |
| `getTvAppearancePaths()` | Slugs for static path generation |
| `getLatestPressClipping()` | Most recent press clipping |
| `getPressClippingArchive()` | All press clippings for archive page |
| `getMediaAppearances()` | All media appearances |
| `getFeaturedMediaAppearance()` | Latest featured media appearance |
| `getHomepage()` | Hero, exhibition focus, all homepage sections |
| `getBarnPage()` | Children's section page content |
| `getOmOssPage()` | About Us page content |
| `getBesokPage()` | Visit Us page content |
| `getKontaktPage()` | Contact page content |
| `getTryllehistoriePage()` | Magic History section page content |
| `getRessurserPage()` | Resources section page content |
| `getArrangementPage()` | Events section page content |
| `getUtstillingPage()` | Exhibition section page content |
| `getPersonvernPage()` | Privacy policy page content |
| `getSiteConfig()` | Global site settings (email, address, hours, socials) |
| `getAllPartners()` | All partners sorted by category |

Update TypeScript interfaces in `sanity.ts` whenever schema fields change.

### Web Frontend (Astro)

**Components** (`/web/src/components/`):
- `AnimateIn.astro` — Wrapper that applies scroll-triggered fade/slide animations
- `MentionedMagicians.astro` — Inline list of magicians referenced from a biography or legend
- `Welcome.astro` — Welcome/intro block component

**Layouts** (`/web/src/layouts/`):
- `BaseLayout.astro` — Primary layout with header, nav, footer, and global styles
- `Layout.astro` — Minimal fallback layout

**Utility Library** (`/web/src/lib/`):
- `sanity.ts` — All Sanity client code, types, and queries (see above)
- `icalendar.ts` — Generates `.ics` iCalendar files for event download/subscription

**Full Page Structure** (`/web/src/pages/`):

```
pages/
├── index.astro                          # Homepage
├── barn.astro                           # Children's section
├── besok.astro                          # Visit Us
├── bibliotek.astro                      # Book library
├── arrangementer.astro                  # Events & courses
├── kontakt.astro                        # Contact
├── om-oss.astro                         # About Us
├── personvern.astro                     # Privacy policy
│
├── aktiviteter/
│   ├── index.astro                      # Activities section hub
│   └── tryllekunstnere.astro            # Magician performers page
│
├── ressurser/
│   └── index.astro                      # Resources hub
│
├── om-oss/
│   └── i-media/
│       └── index.astro                  # Museum in the media (press/appearances)
│
├── utstillingen/
│   ├── index.astro                      # Exhibition overview
│   ├── artefakter.astro                 # Museum artifacts listing
│   └── [slug].astro                     # Magician detail page (SSG)
│
└── tryllehistorie/
    ├── index.astro                      # Magic history portal/hub
    ├── historiske-artikler/
    │   └── index.astro                  # Historical articles listing
    ├── historiske-opptak/
    │   ├── index.astro                  # Archival clips listing
    │   └── [slug].astro                 # Clip detail page (SSG)
    ├── magiens-hvem-er-hvem/
    │   ├── index.astro                  # Who's Who biography index
    │   └── [slug].astro                 # Biography profile (SSG)
    ├── nordisk-tv-magi/
    │   ├── index.astro                  # Nordic TV magic listing
    │   └── [slug].astro                 # TV appearance detail (SSG)
    ├── norske-legender/
    │   ├── index.astro                  # Norwegian legends index
    │   └── [slug].astro                 # Legend article (SSG)
    ├── fool-us/
    │   ├── index.astro                  # Penn & Teller: Fool Us listing
    │   └── [slug].astro                 # Appearance detail (SSG)
    └── got-talent/
        ├── index.astro                  # Got Talent listing with filtering
        └── [slug].astro                 # Appearance detail (SSG)
```

**Environment** (`/web/`):
- `.env` — Public Sanity config (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`)
- `.env.local` — Preview token (`SANITY_PREVIEW_TOKEN`), git-ignored

## Utility Scripts

Node.js scripts in `/scripts/` for one-off data operations:

| Script | Purpose |
|--------|---------|
| `searchNb.mjs` | Searches the Norwegian National Library (NB.no) API and saves results to Markdown |
| `importNbArticle.mjs` | Imports an article from NB.no into Sanity as a press clipping |
| `importYouTubeClips.mjs` | Bulk-imports YouTube clips as `historicalClip` documents |
| `createPersonvernContent.mjs` | Generates the initial privacy policy document in Sanity |

Scripts are run with `node scripts/<name>.mjs` from the repo root.

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

All queries in `sanity.ts` are server-side (Astro pages). Fetch multiple in parallel:

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
- `->` — Follow a reference to expand the referenced document

### Static Generation

Dynamic routes use `getStaticPaths()`:

```typescript
export async function getStaticPaths() {
  const magicians = await getAllMagicians()
  return magicians.map(m => ({ params: { slug: m.slug } }))
}
```

Every visible magician gets its own HTML file at build time. Same pattern for biographies, legends, TV appearances, and historical clips.

### Rich Text (Portable Text)

Content from Sanity (e.g., `adultText`, `mobileSections.body`) is in Portable Text format:

```typescript
import { portableTextToHtml } from '../lib/sanity'
const html = portableTextToHtml(m.adultText)  // Renders as <p>, <strong>, etc.
```

### Image Optimization

```typescript
import { urlFor } from '../lib/sanity'
urlFor(image).width(800).format('webp').url()
```

## Visibility / Unpublish Convention

All content document types have a boolean field `isVisible` with `initialValue: true`. This applies to: `magician`, `biography`, `legend`, `event`, `tvAppearance`, `historicalClip`, `mediaAppearance`, `pressClipping`, `book`, `artifact`, `partner`.

**Rules:**
- Default is always `true` — new documents are visible automatically
- Setting `isVisible` to `false` hides the document from the website without deleting it
- All GROQ queries must include `&& isVisible != false` (not `== true`, so existing docs without the field are still shown)
- When adding a new queryable document type, add `isVisible` as the first field and add the filter to every query for that type
- `getStaticPaths()` calls must also filter by `isVisible != false` so hidden documents do not get their own static pages

## Common Gotchas

1. **Schema Changes**: After editing schema files, redeploy the studio (`npm run deploy` from root) for changes to appear in editor UI and API
2. **Slug Generation**: Slug fields auto-populate from name/title; manually edit if needed
3. **Image Assets**: Upload via Sanity UI; reference via `asset->{ _ref, url }` in queries
4. **Portable Text**: Always use `portableTextToHtml()` from `sanity.ts` to render rich text (not the raw `toHTML` from `@portabletext/to-html` directly)
5. **Env Variables**: Public vars prefixed `PUBLIC_*`; secret vars in `.env.local` (git-ignored)
6. **Static Generation**: Sanity content changes require web frontend rebuild to take effect on the live site
7. **Preview Mode**: Local dev uses `perspective: 'drafts'` and the preview token — draft documents are visible. Production uses published content only.

## Deployment

- **Studio**: Deployed via `npm run deploy` from repo root to Sanity hosting (managed by Sanity)
- **Web**: Static site deployed to Vercel
  - `PUBLIC_VERCEL_ENV` controls CDN and draft/published perspective
  - Any push to `main` triggers a Vercel rebuild

## Data Import Files

The repo root contains `.ndjson` bulk import files used to seed or restore Sanity data:

- `magicians-import.ndjson` — Magician documents
- `hvem-er-hvem-v2.ndjson` — Biography documents (171 entries, current version)
- `books-import-fixed.ndjson` — International/public domain book catalog
- `norwegian-books-import.ndjson` — Norwegian magic books
- `berthelsen-books-v2.ndjson` — Berthelsen collection books
- `tryllemuseet-tv-magi-v2.ndjson` — TV appearance data (current version)
- `tryllekurs-mai-2026.ndjson` — Event data
- `tryllehistorie-mestere-final.ndjson` — Legend documents
- `*-seed.ndjson` — Initial page content (homepage, barnPage, omOssPage, siteConfig)
- `rekkefolge-patch.ndjson` — Sort order patches for magicians

Import with: `npx sanity dataset import <file>.ndjson production` (from repo root).

## File Locations

| What | Where |
|------|-------|
| Schema definitions | `/schemaTypes/*.ts` |
| Studio custom components | `/schemaTypes/components/` |
| Sanity config | `/sanity.config.ts`, `/sanity.cli.ts` |
| Queries and types | `/web/src/lib/sanity.ts` |
| iCalendar utilities | `/web/src/lib/icalendar.ts` |
| Astro components | `/web/src/components/` |
| Layouts | `/web/src/layouts/` |
| Pages | `/web/src/pages/` |
| Dynamic routes | `/web/src/pages/utstillingen/[slug].astro` and similar |
| Env config | `/web/.env`, `/web/.env.local` |
| Data import files | `/*.ndjson` (repo root) |
| Utility scripts | `/scripts/*.mjs` |

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
