# Det trettende kabinett — Game Concept (Vision)

> **Status: concept only — nothing is built.** This document captures the
> creative vision for a browser game on tryllemuseet.no, shaped through an
> interview with the museum (July 2026). It is deliberately ambitious; a
> scoped MVP is sketched at the end. Working title was *Nattkabinettet*;
> renamed after the decisions below.

## The pitch

**Det trettende kabinett** ("The Thirteenth Cabinet") is a fictional magic
museum that only exists between midnight and dawn. One night the player
receives a sealed apprentice letter: the Cabinet's mysterious keeper —
*Direktøren* — takes on one apprentice per generation, and the doors are
open tonight.

The museum has twelve known rooms, each holding the spirit of one era of
magic's 4000-year history — and a rumored **thirteenth room** that no
apprentice has ever found. A room will not unlock the next door until the
apprentice has understood — and been fooled by — that era's central
principle of deception. Along the way the player collects playing cards:
**thirteen rooms, four cards each — a complete deck of 52** is the key to
the thirteenth cabinet, and the walk from **Lærling** to **Mester**.

When the final door opens, dawn breaks — and the epilogue reveals that the
Cabinet exists in daylight too: it is called Tryllemuseet.

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

## Decisions (July 2026 follow-up)

Answered by the museum after the first draft:

- **Language:** plan copy for **English from day one**. All visible text
  lives in Sanity with parallel nb/en fields (or document-level i18n);
  Norwegian launches first, but nothing is written into code that would
  block an `/en/` version later.
- **Title:** **Det trettende kabinett.** The museum floated 7/13 as
  alternatives and spotted the gold: *13 rooms × 4 collectibles = 52 —
  a complete deck of playing cards.* The deck is now the game's spine
  (see "Kortstokken" below), and the title refers to the hidden 13th room.
- **Editorial QA:** the museum (Trond) QAs all historical facts; same
  editorial flow as the quiz — editors own every visible sentence in Sanity.
- **Sound:** **launch silent.** The game is designed with no audio
  dependency; ambient sound (music-hall piano, creaking boards) is a
  future layer behind a toggle, never required.

## The rooms (chapters)

Thirteen rooms — a prologue, eleven eras, and the finale — one card *value*
per room. All names and characters are fictional; the history inside them
is real.

1. **Foajeen** *(prologue/tutorial — the four Aces)* — Arrive at night,
   meet Direktøren's voice, receive the empty deck box and the four aces.
   Teaches the interface through one tiny puzzle (the guest book won't
   take your name until you look away).
2. **Sandrommet** — *Antiquity.* Cups and balls, the legend of Dedi at
   Pharaoh's court. Puzzle: follow the ball — and fail — until you learn to
   watch the hand that *isn't* moving. Principle: **attention is steered,
   not outrun.**
3. **Markedsplassen** — *Medieval street conjurers.* "Hocus pocus", patter,
   the fine line between entertainer and accused witch. Puzzle: decode a
   mountebank's cant to find which cup hides the pea. Principle: **language
   is misdirection.**
4. **Biblioteket** — *The Renaissance in print.* Reginald Scot's
   *The Discoverie of Witchcraft* (1584) — the first printed explanations
   of conjuring. Puzzle: match woodcut illustrations to the tricks they
   expose. Principle: **a secret written down is a secret armed.**
5. **Salongen** — *1700s–1800s salons.* Automata, the Chess Turk,
   Pinetti, Robert-Houdin. Puzzle: deduce the automaton's secret — a logic
   puzzle about what the machine *cannot* be doing. Principle: **technology
   masquerading as magic.**
6. **Seansen** — *1800s spiritualism.* Table-rapping, spirit cabinets, and
   the magicians who exposed them. Puzzle: sit through a séance and catch
   the medium's three methods. Principle: **belief does half the trick.**
7. **Teateret** — *The golden age of varieté, ~1900.* Escape acts, grand
   illusions, lithograph posters. The most escape-room-like chapter: get out
   of a locked stage trunk using props rigged before the show. Principle:
   **the method is bought long before the effect is sold.**
8. **Kinoen** — *Magic becomes film.* Georges Méliès, the magician who
   invented movie tricks. Puzzle: reorder film strips to reconstruct how a
   stop-trick was shot. Principle: **the cut is the vanish.**
9. **Verkstedet** — *The illusion builders.* Where props are made: trap
   doors, mirrors, black art. Puzzle: assemble an illusion from blueprint
   fragments. Principle: **the effect is designed backwards from the
   audience's seat.**
10. **Studioet** — *TV and mentalism.* Camera framing, editing, forcing.
    The game "reads the player's mind" — then the puzzle is to deduce how
    the force worked. Principle: **the frame controls what you see.**
11. **Gatehjørnet** — *Street and close-up magic.* Cards and coins at
    arm's length, misdirection without a stage. Puzzle: spot the moment of
    the move in a filmed close-up routine. Principle: **the smaller the
    trick, the bigger the lie.**
12. **Vinterhagen** — *A Nordic room.* Aurora light, inspired by Norwegian
    stage legends. A synthesis puzzle that requires cards from earlier
    rooms.
13. **Det trettende kabinettet** *(finale — the four Kings)* — Only a
    complete deck opens the door. Inside: the empty stage. The apprentice
    composes their own act by combining collected cards into an effect, a
    method and a misdirection. Direktøren's last lesson: the Cabinet was
    never magic — the craft is. The doors open onto daylight. Epilogue
    links to the real museum.

Chapters unlock in order; progress is saved locally so players return for
the next room. Rooms can be **released over time** (Act I at launch, later
rooms as episodes) — turning the chapter structure into a reason to come
back.

## Kortstokken — the deck as collection

The player's persistent collection is a deck of playing cards: **13 values
(one per room) × 4 suits (one per way of earning) = 52.** Each room grants
its value's four cards:

| Suit | Card | Earned by |
|---|---|---|
| ♠ Spar | **Sigillkortet** | Solving the room's puzzle (the "method" card) |
| ♥ Hjerter | **Plakatkortet** | Finishing the room — a varieté poster with the player's stage name, designed to be shared |
| ♦ Ruter | **Illusjonskortet** | Completing the room's Speilgangen experience |
| ♣ Kløver | **Kuriositetskortet** | Finding the hidden object tucked into the room's scenery |

Spades and hearts come from just playing through; diamonds and clubs reward
curiosity — so every player finishes with a deck, but only explorers finish
with a *full* one. Missing cards can be hunted by revisiting rooms (replay
value), and the complete deck is the key to the thirteenth room. Each card
back carries a real historical "visste du at …" with a link into the site.

Solving a puzzle on *Mesterens vei* without hints **gilds** that room's
spade card — a cosmetic flourish, never a gate.

## Speilgangen — the illusion experience rooms

Between chapters the apprentice crosses *Speilgangen* (the Mirror Passage):
short, self-contained experiences where the game performs on **you**. No
puzzle, no failure — you are simply fooled, and may then lift the curtain.
Each is tied to a room and awards its ♦ card.

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

**Scalable difficulty.** Every puzzle offers two paths into the same room:
*Lærlingens vei* (guided, readable by ~8-year-olds) and *Mesterens vei*
(the same puzzle, cryptic clues, no hand-holding). Plus a three-step hint
ladder — *Direktørens hvisken* — so nobody gets stuck; hints cost only the
gilding on the spade card, never progress. There are no fail states.

**Ranks.** Progress maps to magician ranks (reusing the tone of the quiz's
"Nysgjerrig lærling" → "Stormester i magi" ladder). The finale grants a
downloadable **lærlingbrev** (apprentice diploma).

**Soft museum tie-in.** No mechanic requires a visit. Instead: the epilogue
reveal, cards noting "denne finnes i den ekte utstillingen", and natural
links to `/besok`, legend portraits and the archives. (Future idea, not in
scope: a small stamp or greeting for those who show their lærlingbrev at
the museum.)

## Art direction

Theatrical varieté, not gothic horror: deep velvet reds and midnight blues,
gold frames and filigree, lithograph-poster typography, warm lamplight,
paper and canvas textures. The 52 cards are a design centerpiece — one
consistent deck design where each era colors its own value. Rooms are
staged as **theatre sets** (layered SVG/CSS scenes, subtle parallax) rather
than heavy 3D — beautiful on mobile, light to load. **Launches silent** by
decision; if ambient sound is added later it sits behind a toggle and is
never required. Reduced-motion paths are first-class: every puzzle must be
solvable without sound or color perception alone.

## Technical sketch (grounded in this repo)

Follows the Tryllequiz pattern — static Astro page, Sanity-editable content,
client-side game engine, master switch:

- **Page:** `web/src/pages/det-trettende-kabinett.astro` (linked from
  *Aktiviteter* when active). One page; chapters are client-side scenes,
  not routes.
- **Engine:** vanilla TS, no backend. Progress (chapters, cards, hints,
  stage name) in `localStorage`. No accounts, no tracking.
- **Sanity types (new):** `gameConfig` (singleton with `isActive` master
  switch, intro/coming-soon copy, rank ladder), `gameChapter` (title, order,
  era intro, epilogue text, "visste du at" facts, learn-more links,
  `isVisible`), `gameIllusionRoom` (reveal texts), `gameCuriosity` (hidden
  object copy). **Puzzle logic lives in code; editors own every visible
  sentence** — same split as the quiz. All text fields are planned as
  nb/en pairs from day one (Norwegian launches first; English is a content
  task, not a rebuild).
- **Queries:** added to `web/src/lib/sanity.ts`, all filtered
  `isVisible != false`, per repo convention.
- **Cards/posters/diploma:** generated client-side (SVG → PNG download).
  Sharing is "download and share", no server rendering needed.
- **Rollout:** `isActive` off = "kommer snart" teaser, exactly like the
  quiz. Ship Act I (Foajeen + Sandrommet + Markedsplassen + one mirror
  room), release later rooms as episodes via content + code updates.

## MVP — smallest launchable slice ("Akt I")

1. `gameConfig` + teaser page behind `isActive` (zero risk to ship early).
2. Prologue (the four aces) + chapters 2–3 with lærling/mester paths and
   the hint ladder.
3. One Speilgangen room ("Kortet du valgte" — highest wow per line of code).
4. The deck UI with the first 12 cards and one shareable poster card.
5. Epilogue stub pointing to the real museum.

Everything else — remaining rooms, curiosities, diploma, episode cadence —
layers on without rework. Historical facts are QA'd by the museum before
each act ships.
