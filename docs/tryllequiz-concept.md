# Tryllequiz — Concept & Technical Design

A quiz about the world of magic, built on the museum's own content: Norwegian
legends, the history of magic, TV magic and the museum itself. Everything is in
place and dormant — editors add questions in Sanity, flip one switch, and the
quiz goes live on the next site rebuild.

## Concept

**One quiz page, many quizzes.** The visitor lands on `/tryllequiz`, picks a
*theme* ("Norske legender", "Magiens historie", …, or "Alle tema") and a
*difficulty* (Lett / Middels / Vanskelig / Blandet), and gets a round of random
questions from that selection. Every playthrough is different: both the
question selection and the answer order are shuffled.

**Learn something either way.** After each answer the visitor immediately sees
whether they were right, plus an optional "Visste du at …" explanation and a
"Les mer" link into the site's own content (a legend portrait, the Fool Us
archive, the exhibition page). The quiz doubles as a discovery engine for the
rest of the website.

**Playful magician ranks.** The final score maps to a rank — from "Nysgjerrig
lærling" to "Stormester i magi" — with a friendly message that nudges the
visitor toward visiting the museum. Ranks and messages are editable in Sanity.

**Difficulty as audience targeting** (guideline for editors):

| Difficulty | Audience | Tone |
|---|---|---|
| Lett | Children and beginners | Short questions, famous names, fun facts |
| Middels | The whole family | Site content a curious visitor would pick up |
| Vanskelig | Enthusiasts and members | Deep cuts from the archive and library |

Because a question carries both a difficulty *and* one or more themes, the same
content pool serves a kids' quiz at the museum, a family quiz at home, and a
nerd quiz for Magiske Cirkel members — no separate setups needed.

**Museum tie-in ideas (future, not built):** QR code on the physical info
screen or a poster ("Klarer du quizen?"), a monthly themed round, printable
diploma for kids who reach a rank.

## Content model (Sanity)

Three new types, all editable in Studio:

| Type | Purpose |
|---|---|
| `quizConfig` | Singleton. Master switch `isActive`, intro/coming-soon texts, `questionsPerRound`, editable result ranks (`resultLevels`). |
| `quizTheme` | A selectable theme: title, slug, emoji icon, description, order, `isVisible`. |
| `quizQuestion` | One question: text, optional image, 2–4 answers (validated: exactly one marked correct), explanation, "learn more" link, difficulty (`lett`/`middels`/`vanskelig`), theme references, `isVisible`. |

All types follow the repo's visibility convention (`isVisible != false` in every
query). Answer order is irrelevant in Sanity — the frontend shuffles it.

## Frontend behavior

`web/src/pages/tryllequiz.astro` (static, one page — no per-question routes):

- Fetches config, themes and questions at build time via `getQuizConfig()`,
  `getAllQuizThemes()`, `getAllQuizQuestions()` in `web/src/lib/sanity.ts`.
- **Inactive state** (`isActive` off, or zero visible questions): the page
  renders a "kommer snart" teaser instead of the quiz, and no nav link appears.
- **Active state**: start screen (theme + difficulty chips with a live count of
  available questions) → question flow (progress bar, instant feedback,
  explanation, learn-more link) → result screen (score, rank, replay).
- Question data is embedded in the page as JSON at build time; all game logic
  is client-side vanilla TS. No backend, no tracking, no localStorage.
- Themes with zero questions are hidden; a round uses
  `min(questionsPerRound, available)` questions.
- Only the malformed are excluded at query level: questions must have a
  difficulty and at least 2 answers.

Navigation: `BaseLayout.astro` fetches the quiz config and conditionally adds
"Tryllequiz" to the *Aktiviteter* dropdown (desktop + mobile) when active.

## Activation checklist

1. Deploy the studio so the new types appear: `npm run deploy` (repo root).
2. (Optional) Seed example content into the development dataset:
   `npx sanity exec scripts/createQuizExampleContent.mjs --with-user-token`.
   The examples are placeholders — review, edit or replace them.
3. Editors create themes and questions in Studio (see
   `docs/redaktor-bruksanvisning.md`, chapter "Tryllequiz").
4. Create/open the **Quiz: Innstillinger** document and toggle **Quizen er
   aktiv** on.
5. Wait for the nightly rebuild (05:30 UTC) or trigger **Daily rebuild**
   manually in GitHub Actions. The quiz and its menu entry appear together.

To take the quiz offline again, toggle `isActive` off and rebuild — the page
reverts to "kommer snart" and the menu entry disappears. Individual questions
or themes are hidden with their own `isVisible` toggle.

## Files

| What | Where |
|---|---|
| Schemas | `schemaTypes/quizConfig.ts`, `quizTheme.ts`, `quizQuestion.ts` |
| Queries & types | `web/src/lib/sanity.ts` (Tryllequiz section at the end) |
| Page | `web/src/pages/tryllequiz.astro` |
| Nav integration | `web/src/layouts/BaseLayout.astro` |
| Example content seed | `scripts/createQuizExampleContent.mjs` |
| Editor guide | `docs/redaktor-bruksanvisning.md` |
