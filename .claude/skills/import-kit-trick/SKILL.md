---
name: import-kit-trick
description: Import a trick description (tryllebeskrivelse) HTML file into the closed area /bak-teppet and add it to a tryllesett, or review/simplify the text of existing ones. Use when the user sends a trick HTML/MD file ("legg til denne", "denne også", "inn i trylleesken") or asks to improve trick texts.
---

# Import a tryllebeskrivelse

Follow `docs/kit-trick-operations-routine.md`. Short version:

1. **Clarify only what's missing.**
   - Which tryllesett? If it's the same one as earlier in the conversation, assume that one.
   - Is it a translation or the museum's own trick? «Direkte fra museet» means own: no notice, credit line only.
   - Images are normally embedded in the HTML, so separate photos aren't needed.
2. **Dry run against production:**
   ```
   SANITY_DATASET=production node scripts/import-kit-trick-html.mjs --dry-run --kit=<kit-slug> <file>
   ```
   Check the sections and that every image is listed. If something in the markup isn't handled, fix the importer first (on the session branch, PR), then import.
3. **Import:** run the same command without `--dry-run`. Never pass `--replace` unless the user wants Studio edits discarded.
4. **Verify:**
   - The kit's trick list.
   - An anonymous query sees 0 docs under `lukket.**`.
5. **Report in Norwegian:**
   - title, sections, image count, and position in the kit
   - anything odd you noticed in the text, e.g. a solution photo shown too early or a likely mistranslation
   - offer to fix it
6. **Text reviews:** propose changes, numbered per trick, and let the user decide. Apply approved edits as described in section 4 of the routine: check for drafts, back up, patch with `ifRevisionId`.

Writing rules for the content itself: `docs/tryllebeskrivelser/prosjektinstruksjoner.md`.
Never commit trick HTML files to the repo. They contain the secrets the area protects.
