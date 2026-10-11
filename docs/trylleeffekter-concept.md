# Trylleeffekter: concept

A public catalogue of magic **effects** and tricks, with Norwegian-produced effects as
the first focus. It's part of the archive under Tryllehistorie, alongside «Magiens hvem er
hvem» and the book register. Added 2026-10. It's hidden behind a feature flag until it has
enough content.

## What it is, and isn't

- **It is** the museum's record of an effect: what the audience sees, who created or
  produced it, when and where, which objects in the collection belong to it, and what
  has been written about it.
- **It isn't** an explanation. A *trylleeffekt* never describes the method. Methods
  stay in the closed area as *tryllebeskrivelser* (`kitTrick`, private `lukket`
  dataset), and original sheets stay there as *originalbeskrivelser* (`kitOriginal`).

```
Trylleeffekt (public, production dataset)          ← this module
 ├─ skapere      → biography   (Hvem er hvem)
 ├─ produsenter  → biography or free text (dealers, companies)
 ├─ gjenstander  → artifact    (the collection)
 ├─ litteratur   → book
 └─ kilder       → sourceItem / source
                                                     (no link to kitTrick/kitOriginal:
                                                      references can't cross datasets,
                                                      and a public page must not point
                                                      at a method)
```

## Schema: `magicEffect` (Studio: «Trylleeffekt», under Arkivet)

| Field | Type | Notes |
|---|---|---|
| `isVisible` | boolean | Visibility convention. |
| `title`, `slug` | string, slug | Norwegian name; slug per the project convention. |
| `alternativeNames` | string[] | Original or other names, e.g. «Cups and Balls». |
| `summary` | text (2 rows) | One or two sentences for cards and meta description. |
| `effect` | rich text | **What the audience sees.** Studio help text warns against describing the method. |
| `history` | rich text | Origin, variants, people, how it spread. |
| `creators` | ref[] → biography | Inventor(s)/creator(s). |
| `creatorNote` | string | When the creator isn't in Hvem er hvem, or is uncertain («tradisjonell»). |
| `producers` | object[] | `{ name, biography?, years? }`: dealers and companies that made or sold it. |
| `year`, `yearNote` | number, string | First known year, plus free text («ca. 1950-tallet»). |
| `countries` | string[] (list) | Country of origin/production. `no` = Norwegian, which drives the «Norskprodusert» filter. |
| `categories` | string[] (list) | Kort, mynter, tau, ringer, baller, papir, mentalisme, forsvinning, illusjon, barnetriks, annet. |
| `images` | image[] (alt, caption) | Props, adverts, packaging. **Never images that reveal the method.** |
| `artifacts` | ref[] → artifact | Objects in the collection. |
| `books` | ref[] → book | Literature in the library. |
| `sources` | sourceItem[] | Same citation pattern as legend/trick. |
| `internalNote` | text | Never shown, e.g. "method described in Bak teppet as «Begerspillet»". |

## Pages (static, production dataset)

- `/tryllehistorie/trylleeffekter`: the list.
  - Cards show image, title, year and country.
  - A «Bare norskproduserte» toggle and category chips filter client-side. The list is
    small, so it doesn't need search.
- `/tryllehistorie/trylleeffekter/[slug]`: the effect page.
  - Hero, then «Effekten» with a narration button, «Historikk» and facts (year, country,
    creators, producers).
  - Then images, objects in the collection, books, and sources.

## Launch flag

- `siteConfig.trylleeffekterActive`, default `false`, follows the same pattern as
  `laerEtTriksActive`.
- **Off:** the pages build and can be reached by full URL, so they can be tested on
  test.tryllemuseet.no, but they get `noindex` and aren't linked anywhere.
- **On:** the pages are indexed. Add «Trylleeffekter» under Tryllehistorie in
  `siteNavigation` (Studio) so the hub shows it. Turning it on needs no code change, only
  a rebuild, which publishing in Studio triggers on test and the next release triggers on
  production.

## Later

- Link effects from biography pages («Effekter skapt av …») and artifact pages.
- A «public» original (`kitOriginal.access = public`) could appear on the effect page.
  That needs a cross-dataset lookup by slug, which is deliberately left out of v1.
- Contributors outside the museum: add `contributor` and `permission` fields when the
  first outside description arrives.
