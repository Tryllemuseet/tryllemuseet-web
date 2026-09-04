# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tryllemuseet** is a magic museum website built with a monorepo architecture:
- **Sanity Studio** (root): Headless CMS for content management
- **Web Frontend** (`/web`): Astro-based static site generation

The site serves dual audiences: children (with interactive exhibitions and activities) and adults (with historical/biographical content about magicians). It also manages a library of magic-related books and historical TV appearances.

## Architecture

### Content Layer (Sanity CMS)

The schema defines 35 registered content types in `/schemaTypes` (see `schemaTypes/index.ts`):

**Page Types** (singletons):
- `homepage.ts` — Hero, exhibitions focus, sections, partnerships
- `barnPage.ts` — Children's section landing page
- `omOssPage.ts` — "About Us" page with museum history
- `besokPage.ts` — Visit page (opening hours, prices, transport)
- `kontaktPage.ts` — Contact page (form URL, FAQ)
- `tryllehistoriePage.ts` — Magic history landing page (sections, timeline)
- `ressurserPage.ts` — Resources landing page
- `aktiviteterPage.ts` — "Hva skjer" hub page (`/aktiviteter`) hero and curated section cards to sub-areas (Tryllekurs, Bestill tryllekunstner); the event calendar itself is not Sanity-backed here — see `event.ts` and `getAllEvents()`
- `utstillingPage.ts` — Exhibition landing page
- `personvernPage.ts` — Privacy policy content
- `siteConfig.ts` — Global settings (email, address, contact info); also holds the `laerEtTriksActive` feature flag (see below)

**Document Types** (queryable collections):
- `tema.ts` (Studio label: "Tema", added 2026-08) — Optional collection hub sitting *above* the other content types: a Tema references any mix of `legend`, `comicStory`, `quizTheme`, `artifact` and `magicOrganization` docs that belong to the same museum experience (e.g. Houdini: the station-based `legend` exhibition + the `comicStory` for kids + the `quizTheme`). Renders as a hub page at `/utstillingen/{tema-slug}` (see `TemaHub.astro`) that `web/src/pages/utstillingen/[slug].astro` serves in place of a plain `legend` entry when the slug matches a Tema. Most Fordypninger (simple portrait articles with no physical placement, comic or quiz) don't need a Tema at all — it's opt-in for content that genuinely has more than one "leg". **Important:** give a Tema a slug distinct from any `legend` doc it wraps — if they share a slug, the Tema hub's own "Fordypning" card links back to itself (see the comment in `scripts/create-houdini-tema.mjs`, which deliberately uses `harry-houdini` for the Tema since the legend already owns `houdini`).
- `magician.ts`, `exhibitionShow.ts`, `exhibitionStation.ts` — **Removed (2026-07)**, superseded by `legend.ts`. Content was migrated to `legend` docs via `scripts/migrate-exhibits-to-legend.mjs`, then the old documents and schema types were deleted once nothing referenced them.
- `biography.ts` — "Hvem er hvem" (Who's Who) reference: full name, aliases, birth/death (`partialDate` — supports year-only or full precision, plus a `circa` flag), nationality, magician references. `sources` is an array of direct references to `source` docs (migrated from free text; see `scripts/migrate-biography-sources.mjs`).
- `legend.ts` (Studio label: "Fordypning") — Unified deep-dive article type: dual-audience wall-panel text (`childText`/`wallText`), free-form article body (`content`, or `detailIntro`/`sections`), an optional multi-part `stations` array, and optional physical-placement metadata (`qrNumber`/`physicalOrder`). Covers everything from short biographical portraits to the Gullalderen wall panels and the Houdini exhibition. A doc with `physicalOrder` and/or `stations` set routes to `/utstillingen`; otherwise to `/tryllehistorie/fordypninger` (see `NOT_UTSTILLING` in `sanity.ts`). Both routes render through `web/src/components/LegendBody.astro`.
- `tvAppearance.ts` — TV show appearances (Got Talent formats, Penn & Teller: Fool Us)
- `historicalClip.ts` — Archival video clips with metadata (synced daily from YouTube via GitHub Actions)
- `youtubeSource.ts` — YouTube channel(s) the daily sync pulls from (`channelId`, `sourceLabel`, `isActive`). Add a document here to subscribe to another channel — no code change needed. `scripts/importYouTubeClips.mjs` matches existing `historicalClip` docs by `youtubeId` (not `_id`), so hand-curated entries get updated in place instead of duplicated.
- `historiskeKlippNb.ts` — Historical newspaper articles (nb.no references, rewritten text, 70-year copyright gating for facsimiles)
- `mediaAppearance.ts` — The museum's own press/media coverage ("I media")
- `book.ts` — Library catalog with author, publication, availability status
- `source.ts` (Studio label: "Kilde") — Reusable citation registry (title, type, author, year, URL, optional `bookRef` link to a `book` doc). `biography.sources` references it directly; `sourceItem` (see Helper Types below) references it via an optional `sourceRef` field for every other content type's `sources` array.
- `event.ts` — Upcoming events/courses with dates, pricing, booking
- `artifact.ts` — Museum objects: origin, materials, condition, gallery images
- `partner.ts` — Sponsors/partners with category grouping
- `signageConfig.ts`, `signageVideo.ts`, `signageQuote.ts` — Content for the physical info screen (`/skjerm.html`)
- `quizConfig.ts`, `quizTheme.ts`, `quizQuestion.ts` — Tryllequiz (`/tryllequiz`): settings singleton with `isActive` master switch, selectable themes, and questions with difficulty + validated answers (see `docs/tryllequiz-concept.md`)
- `gameConfig.ts`, `gameChapter.ts` — "Det trettende kabinett" story game (`/det-trettende-kabinett`): settings singleton with `isActive` master switch (plus `englishEnabled` for the in-game language toggle), and per-room copy overrides with optional room/fact images, rich-text intros and parallel English fields. Puzzle logic lives in the page code (see `docs/det-trettende-kabinett-concept.md`)

**Helper Types** (object types used inline by document types):
- `contentSection.ts` — Reusable heading + rich text block
- `partialDate.ts` — Flexible date object (`year` required, `month`/`day` optional, `circa` flag) used by `biography.birthDate`/`deathDate`. Render via `formatBioAge()`/`formatLifespan()` in `sanity.ts`, never inline.
- `sourceItem.ts` — Citation used in `legend`, `whoKnew`, `story`, `magicOrganization`, `trick` `sources` arrays: prefer `sourceRef` (reference to a `source` doc); `label`/`url` remain as free-text fallback for one-off citations or a per-use URL override. (`biography.sources` bypasses this — see `source.ts` above.)

### Query Layer (Sanity Client)

`/web/src/lib/sanity.ts` provides:
- **Client setup**: Uses Sanity API v2024-01-01, CDN in production, preview mode with token locally
- **Type definitions**: TypeScript interfaces for Magician, Event, Artifact, Biography, Legend, Book, etc.
- **GROQ queries**: Exported async functions like getAllMagicians(), getMagicianBySlug(), getUpcomingEvents(), getBooksByMagician(), getHomepage(), getSiteConfig(), getAllPartners(), etc.
- **Image URL builder**: urlFor() function for Sanity image optimization (width, format, etc.)

### Web Frontend (Astro)

**Page Structure** (`/web/src/pages`):
- `index.astro` — Homepage: fetches magicians, events, homepage config, partners in parallel
- `barn.astro`, `besok.astro`, `arrangementer.astro`, `om-oss.astro`, `kontakt.astro`, `personvern.astro` — Main pages. `barn.astro`'s "Lær et triks" teaser and second hero CTA are gated by `siteConfig.laerEtTriksActive` (default `false`) — same launch-scoping pattern as `quizConfig`/`gameConfig` below, except there's no single page to show a "coming soon" state for since it hides entry points into an otherwise-normal sub-section (`/barn/laer-et-triks/*`, which stays reachable but gets `noindex` while the flag is off)
- `tryllequiz.astro` — Interactive quiz; renders a "coming soon" teaser until `quizConfig.isActive` is on (the nav link in `BaseLayout.astro` follows the same flag)
- `det-trettende-kabinett.astro` — Story game "Det trettende kabinett" (Act I); same `isActive`/coming-soon/nav pattern via `gameConfig` (see `docs/det-trettende-kabinett-concept.md`)
- `om-oss/i-media/` — Museum press coverage
- `aktiviteter/`, `ressurser/` — Section landing pages; the library lives at `ressurser/bibliotek.astro` (`/bibliotek` redirects there)
- `utstillingen/` — Exhibition: `index` (shows `tema` cards, then any not-yet-migrated `legend` station exhibits, then the curated "coming" sections), `[slug]` (checks `tema` first via `TemaHub.astro`, then falls back to a `legend` doc with `physicalOrder`/`stations` — Gullalderen panels, Houdini), `artefakter` (+ `[slug]`), `trylleforeningene/` (+ `[slug]`), `tryllebutikken`
- `tryllehistorie/` — Magic history archive:
  - `magiens-hvem-er-hvem` (+ `[slug]`) — biography directory
  - `fordypninger/` (+ `[slug]`) — deep-dive articles, norske og internasjonale (incl. `henrik-ibsen` as a slug); renamed 2026-07 from `norske-legender`, old URL redirects
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
// utstillingen/[slug].astro — Gullalderen panel / exhibition detail page generation
export async function getStaticPaths() {
  return getUtstillingPaths()
}
```

Every `legend` document gets its own HTML file at build time.

### Rich Text (Portable Text)

Content from Sanity (e.g., legend.wallText, legend.sections[].body) is in Portable Text format. Always render it via the shared helper in `sanity.ts` — never import `toHTML` directly in a page:

```typescript
import { portableTextToHtml } from '../lib/sanity'
const html = portableTextToHtml(entry.wallText)  // <p>, <strong>, links, inline images, etc.
```

`portableTextToHtml()` centralizes link/internalLink mark handling and inline image rendering, so every page benefits when it's improved once.

### Read-Aloud (Narration)

Prose-heavy content — anything a visitor might want read aloud instead of just reading (legend entries, biographies, artifacts, magic organizations, TV appearance descriptions, articles, trick instructions) — should get a `<NarrateButton>` next to its main heading, following the pattern in `LegendBody.astro`:

```astro
import NarrateButton from '../components/NarrateButton.astro'
import { portableTextToPlainText } from '../lib/sanity'

<div class="section-head">
  <h2 class="section-heading">Om {entry.title}</h2>
  <NarrateButton text={portableTextToPlainText(entry.wallText)} label={`Les om ${entry.title} høyt`} />
</div>
```

`NarrateButton.astro` renders markup only (`data-narrate="<plain text>"`); the actual speech-synthesis handling (Web Speech API, `nb-NO` voice, play/stop toggle) lives once in `BaseLayout.astro`'s global script via event delegation on `[data-narrate]` — so any page gets working narration for free just by dropping the button in, no per-page script needed. Always pass plain text via `portableTextToPlainText()`, never raw Portable Text or HTML. When adding a new prose-heavy page or content type, add the button then — don't wait for it to be requested separately.

### Image Optimization

```typescript
import { urlFor } from '../lib/sanity'
urlFor(image).width(800).format('webp').url()
```

### Feature Flags

A built, content-complete feature that isn't ready for public launch gets a boolean singleton flag (`quizConfig.isActive`, `gameConfig.isActive`, `siteConfig.laerEtTriksActive`) rather than being deleted or commented out — content, schema, and routes stay fully intact, and turning it on later needs no code change, just a rebuild. See `docs/architecture.md` § Feature Flags for the full list and behavior.

When editor content (`relatedLinks` on `legend`/`comicStory`, `barnPage.hero`) already links into a flagged-off feature, filter those links out at render time rather than asking editors to avoid linking there early:

```typescript
const relatedLinks = (entry.relatedLinks ?? []).filter(l =>
  siteConfig.laerEtTriksActive || !l.path.startsWith('/barn/laer-et-triks')
)
```

This keeps the flag as the single source of truth — editors can write cross-links whenever they want, and the flag alone decides what's actually visible.

## Important Queries & Types

ALL GROQ queries live in `web/src/lib/sanity.ts` — pages must import query functions from there, never call `sanityClient.fetch()` inline. (Exception: `web/public/skjerm.html`, which queries Sanity client-side by design.)

Key GROQ functions in `sanity.ts`:
- `getGullalderenPanels()` / `getUtstillingDeepDives()` / `getUtstillingEntryBySlug(slug)` / `getUtstillingPaths()` — `legend` docs for `/utstillingen` (physical wall panels and/or `stations`). `getUtstillingDeepDives()` excludes any `legend` already referenced by a `tema` doc, so a wrapped exhibition doesn't also show as its own raw card.
- `getAllTemaer()` / `getTemaBySlug(slug)` / `getTemaPaths()` — `tema` hub docs for `/utstillingen/{slug}`; each item in `Tema.content` carries a pre-computed `cardHref`/`cardImage`/`cardExcerpt` so the hub page can render `legend`/`comicStory`/`quizTheme`/`artifact`/`magicOrganization` cards uniformly without branching per type.
- `getAllLegends()` / `getLegendBySlug(slug)` / `getLegendPaths()` — `legend` docs for `/tryllehistorie/fordypninger` (everything else)
- `getBooksByUtstillingSlug(slug)` — Books linked to a Gullalderen/utstilling entry (looks up the legacy `magician` doc by slug, since `book.ts` still references `magician`, not `legend`)
- `getAllMagicians()` / `getMagicianBySlug(slug)` — **Legacy**, still used by the homepage carousel (`index.astro`) and `hp.utstillingsFokus.felt`; do not use for new `/utstillingen` or `/tryllehistorie` work
- `getHomepage()` — Hero, exhibition focus, sections
- `getUpcomingEvents(limit)` — Upcoming courses/events
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

| Environment | URL | Hook secret | Workflow |
|---|---|---|---|
| Test | `test.tryllemuseet.no` | `VERCEL_DEPLOY_HOOK_TEST` | `.github/workflows/daily-rebuild.yml` |
| Production | `tryllemuseet.no` | `VERCEL_DEPLOY_HOOK_PROD` | same |

The `daily-rebuild.yml` workflow runs automatically at 05:30 UTC every day and can also be triggered manually via **Actions → Daily rebuild → Run workflow** on GitHub — this refreshes both sites with the latest Sanity content on a schedule, independent of any code push.

**Correction (2026-08, verified against live Vercel deployment history):** contrary to what this section previously said, the `tryllemuseet-prod` Vercel project's production deploy hook (`Prod-hook-git`) is bound to the `main` branch, and Vercel's git integration deploys `main` straight to `tryllemuseet.no` on every push (confirmed via the project's `-git-main-` domain alias and a run of `target: "production"` deployments tracking `main` commits directly, including same-day production deploys of merged PRs). So **pushing/merging to `main` does ship new code to production** — there is no separate promotion step required. The repo still has a `prod` git branch, but it does not appear to be wired to any live deployment; treat it as vestigial unless someone confirms otherwise. If you're planning a change that should NOT go live immediately, hold it in a PR rather than merging to `main`.

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
4. **Portable Text**: Always use `portableTextToHtml()` from `web/src/lib/sanity.ts` to render rich text — never import `toHTML` directly in a page
5. **Env Variables**: Public vars prefixed PUBLIC_*; secret vars in .env.local (git-ignored)
6. **Static Generation**: Sanity content changes require web frontend rebuild

## File Locations

| What | Where |
|------|-------|
| Schema definitions | `/schemaTypes/*.ts` |
| Sanity config | `/sanity.config.ts`, `/sanity.cli.ts` |
| Studio navigation (desk structure) | `/structure.ts` — groups the flat document-type list into folders (Utstillingen, Aktiviteter, Arkivet, …) |
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
  - NB (juli 2026): development-datasettet finnes ikke i prosjektet ennå — API-et svarer «Dataset not found», og å opprette det krever admin-rettigheter (sanity.io/manage → prosjekt `n2ynpgty` → Datasets, eller `npx sanity dataset create development` som innlogget admin). Inntil det er opprettet: vær ekstra varsom med skjemaendringer, og flagg det i PR-en.
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
