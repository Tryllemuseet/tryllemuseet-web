# Nattkabinettet — Game Concept (Vision)

> **Status: concept only — nothing is built.** This document captures the
> creative vision for a browser game on tryllemuseet.no, shaped through an
> interview with the museum (July 2026). It is deliberately ambitious; a
> scoped MVP is sketched at the end.

## The pitch

**Nattkabinettet** ("The Night Cabinet") is a fictional magic museum that only
exists between midnight and dawn. One night the player receives a sealed
apprentice letter: the Cabinet's mysterious keeper — *Direktøren* — takes on
one apprentice per generation, and the doors are open tonight.

Each room of the Cabinet holds the spirit of one era of magic's 4000-year
history. A room will not unlock the next door until the apprentice has
understood — and been fooled by — that era's central principle of deception.
The player solves escape-room-style puzzles, collects sigils and varieté
posters in their *kabinettbok*, and walks a path from **Lærling** to
**Mester**. When the final door opens, dawn breaks — and the epilogue reveals
that the Cabinet exists in daylight too: it is called Tryllemuseet.

The game is **inspired by, not built on,** the museum's collection: the
narrative and rooms are fictional, but every puzzle principle, era and
"did you know" is historically grounded, with soft links into the real
site (legends, archive, exhibition, visit page).

## Design pillars (from the interview)

| Decision | Choice |
|---|---|
| Audience | Everyone — scalable difficulty per puzzle |
| Context | Played at home on tryllemuseet.no |
| Genre | Mystery/escape + collect/discover + illusion experiences |
| Content | Fictional frame, historically authentic substance |
| Narrative | Museum at night × journey through 4000 years × apprentice |
| Illusions | Dedicated "experience rooms" between chapters |
| Museum goals | Learning/formidling first; soft nudge toward a physical visit |
| Tone | Theatrical varieté — velvet, gold frames, 1900s poster aesthetics |
| Structure | Unlockable chapters, 10–20 min each, progress saved |
| Physical tie-in | Soft foreshadowing only, no required visit |
| Social | Solo play, with shareable results |

## The rooms (chapters)

Working list — each chapter is one room, one era, one principle of deception,
one puzzle, one sigil. All names and characters are fictional; the history
inside them is real.

1. **Foajeen** *(prologue/tutorial)* — Arrive at night, meet Direktøren's
   voice, receive the empty kabinettbok. Teaches the interface through one
   tiny puzzle (the guest book won't take your name until you look away).
2. **Sandrommet** — *Antiquity.* Cups and balls, the legend of Dedi at
   Pharaoh's court. Puzzle: follow the ball — and fail — until you learn to
   watch the hand that *isn't* moving. Principle: **attention is steered,
   not outrun.**
3. **Markedsplassen** — *Medieval street conjurers.* "Hocus pocus", patter,
   the fine line between entertainer and accused witch. Puzzle: decode a
   mountebank's cant to find which cup hides the pea. Principle: **language
   is misdirection.**
4. **Salongen** — *1700s–1800s salons.* Automata, the Chess Turk,
   Pinetti, Robert-Houdin. Puzzle: deduce the automaton's secret — a logic
   puzzle about what the machine *cannot* be doing. Principle: **technology
   masquerading as magic.**
5. **Teateret** — *The golden age of varieté, ~1900.* Escape acts, grand
   illusions, lithograph posters. The most escape-room-like chapter: get out
   of a locked stage trunk using props rigged before the show. Principle:
   **the method is bought long before the effect is sold.**
6. **Studioet** — *TV and mentalism.* Camera framing, editing, forcing.
   The game "reads the player's mind" — then the puzzle is to deduce how the
   force worked. Principle: **the frame controls what you see.**
7. **Vinterhagen** — *A Nordic room.* Aurora light, inspired by Norwegian
   stage legends. A synthesis puzzle that requires sigils from earlier rooms.
8. **Den tomme scenen** *(finale)* — The apprentice composes their own act by
   combining collected sigils into an effect, a method and a misdirection.
   Direktøren's last lesson: the Cabinet was never magic — the craft is.
   The doors open onto daylight. Epilogue links to the real museum.

Chapters unlock in order; progress is saved locally so players return for the
next room. Rooms can be **released over time** (Act I at launch, later rooms
as episodes) — turning the chapter structure into a reason to come back.

## Speilgangen — the illusion experience rooms

Between chapters the apprentice crosses *Speilgangen* (the Mirror Passage):
short, self-contained experiences where the game performs on **you**. No
puzzle, no failure — you are simply fooled, and may then lift the curtain.

- **Galleriet som endrer seg** — change blindness: a painting gallery where
  things swap while you blink/scroll, then a replay shows what you missed.
- **Kortet du valgte** — a self-working digital card trick; the game names
  your card. "Vil du vite hvorfor?" unlocks the perception explanation.
- **Øyet som lyver** — optical illusions staged as varieté acts (afterimages,
  impossible figures, motion illusions).
- **Det frie valget** — a psychological forcing demo: every "free" choice the
  player made this session was steered — with the receipts shown.

Each reveal is optional and written as formidling: what it teaches about
attention, memory and perception, with a link to related site content.

## Mechanics

**Kabinettboken (the collection).** The player's persistent book:

- **Sigill** — one per chapter for solving its puzzle; a second *mestersigill*
  for solving without hints. Sigils are keys in the finale.
- **Plakater** — a varieté poster is generated per chapter with the player's
  stage name and current rank; designed to be downloaded/shared.
- **Kuriositeter** — hidden objects tucked into room scenery; pure discovery
  and replay value, each with a real historical "visste du at …".

**Scalable difficulty.** Every puzzle offers two paths into the same room:
*Lærlingens vei* (guided, readable by ~8-year-olds) and *Mesterens vei*
(the same puzzle, cryptic clues, no hand-holding). Plus a three-step hint
ladder — *Direktørens hvisken* — so nobody gets stuck; hints cost only the
mestersigill, never progress. There are no fail states.

**Ranks.** Progress maps to magician ranks (reusing the tone of the quiz's
"Nysgjerrig lærling" → "Stormester i magi" ladder). The finale grants a
downloadable **lærlingbrev** (apprentice diploma).

**Soft museum tie-in.** No mechanic requires a visit. Instead: the epilogue
reveal, collection cards noting "denne finnes i den ekte utstillingen", and
natural links to `/besok`, legend portraits and the archives. (Future idea,
not in scope: a small stamp or greeting for those who show their lærlingbrev
at the museum.)

## Art direction

Theatrical varieté, not gothic horror: deep velvet reds and midnight blues,
gold frames and filigree, lithograph-poster typography, warm lamplight,
paper and canvas textures. Rooms are staged as **theatre sets** (layered
SVG/CSS scenes, subtle parallax) rather than heavy 3D — beautiful on mobile,
light to load. Optional ambient sound (music-hall piano, creaking boards)
behind a toggle. Reduced-motion and no-audio paths are first-class: every
puzzle must be solvable without sound or color perception alone.

## Technical sketch (grounded in this repo)

Follows the Tryllequiz pattern — static Astro page, Sanity-editable content,
client-side game engine, master switch:

- **Page:** `web/src/pages/nattkabinettet.astro` (linked from *Aktiviteter*
  when active). One page; chapters are client-side scenes, not routes.
- **Engine:** vanilla TS, no backend. Progress (chapters, sigils, hints,
  stage name) in `localStorage`. No accounts, no tracking.
- **Sanity types (new):** `gameConfig` (singleton with `isActive` master
  switch, intro/coming-soon copy, rank ladder), `gameChapter` (title, order,
  era intro, epilogue text, "visste du at" facts, learn-more links,
  `isVisible`), `gameIllusionRoom` (reveal texts), `gameCuriosity` (hidden
  object copy). **Puzzle logic lives in code; editors own every visible
  sentence** — same split as the quiz.
- **Queries:** added to `web/src/lib/sanity.ts`, all filtered
  `isVisible != false`, per repo convention.
- **Posters/diploma:** generated client-side (SVG → PNG download). Sharing is
  "download and share", no server rendering needed.
- **Rollout:** `isActive` off = "kommer snart" teaser, exactly like the quiz.
  Ship Act I (Foajeen + Sandrommet + Markedsplassen + one mirror room),
  release later rooms as episodes via content + code updates.

## MVP — smallest launchable slice

1. `gameConfig` + teaser page behind `isActive` (zero risk to ship early).
2. Prologue + chapters 2–3 with lærling/mester paths and the hint ladder.
3. One Speilgangen room ("Kortet du valgte" — highest wow per line of code).
4. Kabinettbok with sigils and one shareable poster.
5. Epilogue stub pointing to the real museum.

Everything else — remaining rooms, curiosities, diploma, episode cadence —
layers on without rework.

## Open questions

- Norwegian-only at launch, or plan copy for English from day one?
- Name check: is **Nattkabinettet** free of conflicts, and does the museum
  prefer another title (e.g. *Nattforestillingen*, *Det trettende kabinett*)?
- Who writes/QAs the historical facts in each room (same editorial flow as
  the quiz)?
- Sound design: budget for a few ambient loops, or launch silent?
