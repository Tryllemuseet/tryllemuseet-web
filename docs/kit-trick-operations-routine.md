# Operations Routine: Adding a trick description to Bak teppet

How a new *tryllebeskrivelse* (`kitTrick`) goes from a draft to a live page at
`/bak-teppet/triks/<slug>`, linked from one or more *tryllesett* (`kitCollection`).
This routine is based on the first seven tricks, imported in October 2026.

Related files:

| What | Where |
|---|---|
| Writing instructions (Norwegian, for a claude.ai Project) | `docs/tryllebeskrivelser/prosjektinstruksjoner.md` |
| HTML template the importer understands | `docs/tryllebeskrivelser/mal.html` |
| Importer | `scripts/import-kit-trick-html.mjs` |
| Schema | `schemaTypes/kitTrick.ts`, `schemaTypes/kitCollection.ts` |
| Editor guide (Studio) | `docs/redaktor-bruksanvisning.md` §4d |
| Claude Code skill | `.claude/skills/import-kit-trick/SKILL.md` |

## 1. Write (claude.ai Project)

The editor writes the description in a claude.ai Project. The Project's instructions are
`prosjektinstruksjoner.md`, and `mal.html` is attached as knowledge. The output is one
self-contained HTML file per trick, with embedded images, plus a `.md` copy for reading.

## 2. Import (Claude Code session in this repo)

1. **Save the HTML file somewhere outside the repo**, e.g. the session's upload folder.
   Don't commit trick files: they contain the secrets the closed area protects.
2. **Dry run against production**, then read the output:
   ```
   SANITY_DATASET=production node scripts/import-kit-trick-html.mjs --dry-run --kit=<kit-slug> <file.html>
   ```
   Check that:
   - The title, slug and section list look right.
   - Every image is listed. A missing image means the markup isn't in the template.
   - The script doesn't say "already exists" (see step 4).
   - For a closer look, temporarily print the doc as JSON instead of the dry-run line.
3. **Import for real:**
   ```
   SANITY_DATASET=production node scripts/import-kit-trick-html.mjs --kit=<kit-slug> <file.html>
   ```
   - The document gets the private ID `lukket.kittrick-<slug>`.
   - `--kit` appends it to the tryllesett. It skips the kit if the trick is already there, or if the kit has an unpublished draft (then add it in Studio instead).
   - Kit slugs as of 2026-10: `tryllemuseets-utvalgte-2026`, `tryllekofferten-2026`. The script lists valid slugs if you get it wrong.
4. **Re-importing** an existing trick needs `--replace`. This overwrites the whole document, including any edits made in Studio since the last import. Prefer editing in Studio, or patching just the changed text (section 4), over re-importing.
5. **Verify:**
   - The kit lists the trick in the expected place.
   - An anonymous query still returns 0 private docs:
     ```js
     createClient({projectId: 'n2ynpgty', dataset: 'production', apiVersion: '2024-01-01', useCdn: false})
       .fetch('count(*[_id in path("lukket.**")])')   // must be 0
     ```

No build or release is needed. `/bak-teppet` renders on demand, so the trick is live on
test and production as soon as it's written.

## 3. Review the text

Read the imported text the way a buyer would, and propose (don't apply) changes. Things
that came up in the first seven:

- **Wrong effect:** the effect claimed four coins fly, but the routine moves eight. Count through the steps.
- **Mistranslations:** «legg begeret fra deg i skapet»; «forsvunnet fra lommen» where the ball actually returns *to* the pocket.
- **Inconsistent words:** «striper» and «streker» used for the same thing.
- **Gendered references:** «han/ham» for the spectator. Use «tilskueren» or «hen».
- **Unexplained jargon:** gimmick, palmere, steal.
- **Solution shown too early:** a photo of the finished puzzle placed under «Oppgaven».

Translations that end up noticeably simplified get relabelled «Bearbeidet oversettelse»,
both in `noticeLabel`/`notice` and in `sourceText`.

## 4. Apply text edits safely

When the editor approves changes:

1. **Check for a draft first.** If `drafts.<id>` exists, someone is editing in Studio. Stop and ask.
2. **Export the current documents to a scratch folder** as a backup. Studio history (90 days) is the fallback.
3. **Edit the exported JSON.** Replace exact substrings within single spans, and assert each one matches exactly once. Rewrite whole blocks only where needed, and keep `strong` marks.
4. **Patch only the changed fields** with `ifRevisionId(<_rev>)`, so concurrent Studio edits make the patch fail instead of being overwritten.
5. **Re-read the published text** to confirm.

## 5. Importer gotchas (fixed, kept for reference)

- A photo list where each `<li>` holds `<figure><img><figcaption>` used to be read as a text list, and the images were dropped. Fixed 2026-10.
- `.orig` lines starting with «På engelsk:» kept the prefix. Fixed 2026-10. «På norsk: X» under a foreign `<h1>` swaps title and original title.
- Content after a step list becomes an untitled continuation subsection, because steps always render after the body text.
- Identical images (same data URI) upload once.
