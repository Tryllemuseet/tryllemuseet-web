# Tryllegården — Game Concept (Vision)

> **Status: a first version with three places is built** and dormant behind
> the `isActive` switch (see "Implementation status" at the end). The rest of
> this document is the vision. Written November 2026 from the
> museum's brief: a cosy children's game about the magic of Norwegian
> Christmas, with the *fjøsnisse* on the farm and the museum's two
> *tryllebarn*, integrated in the website, with secrets kept in the closed
> area, adjustable difficulty and language, optional read-aloud, and built so
> other seasons can be switched in by configuration. The museum's answers to
> the first round of questions are recorded under "Decisions" at the end.

## The pitch

**Tryllegården** ("The Magic Farm") is what the tryllebarn call **Årvoll
gård** — the old farm in Oslo where Tryllemuseet lives — because small,
unexplainable things happen there. The hay is braided. The lantern is lit before anyone gets up.
Someone has eaten the porridge. The two tryllebarn know that every trick has a
method — so who is doing these?

The first season is **Jul på Tryllegården — Fjøsnissens hemmelighet**. The
children visit the farm in December and follow the traces of the fjøsnisse
from place to place: fjøset, låven, stallen, bakstehuset, stua. At each place
they help with one Christmas preparation, and learn the Norwegian tradition
behind it. The nisse is shy and never quite seen — a red hat behind a hay
bale, footprints in the snow — but he watches, and he turns out to love magic
as much as they do. For every place they help, he leaves them **one of his
own tricks**: a real trick a child can perform at home with things found in a
Norwegian house at Christmas.

On the last evening the tryllebarn put on a Christmas show on the barn stage
for the animals — and the nisse finally sits down on the bench to watch. As
thanks he hands over the key to **Nisseloftet**: his secret loft, where all
the trick secrets are kept.

It is a game about two kinds of magic: the *craft* (tricks you can learn) and
the *wonder* (traditions that make December feel enchanted). The game never
claims the nisse is real or not real. That is left to the child.

## Design pillars

| Decision | Choice |
|---|---|
| Audience | Children 4–10, playing alone or on a lap; three difficulty levels |
| Context | At home on tryllemuseet.no, phone/tablet first; also usable on a screen in the museum |
| Session | One place = 3–5 minutes; the whole season ≈ 40 minutes over several visits |
| Tone | Cosy, warm, funny. Lantern light, snow, hay, gingerbread. **Never scary** |
| Learning | One Norwegian Christmas tradition and one magic trick per place |
| Failure | None. No timers, no lives, no losing, no leaderboards |
| Reading | Not required on the easiest level — everything can be read aloud |
| Privacy | No accounts, no typed names, no tracking; progress in `localStorage` |
| Seasons | Christmas is a *season pack*; other seasons are content + art, not code |
| Secrets | Trick methods live only in the private dataset |

**Not cups and balls.** The supplied character illustrations show the
children at a cups-and-balls table. That is illustration style only: no
mini-game is a "which one is it under" game, and no trick is a cup trick
(*Det trettende kabinett* already owns that one, in Sandrommet).

### "Not scary" as rules

- The nisse is kind and shy. In folklore he takes revenge when he gets no
  butter in his porridge; here he at most gets *litt sur* and hides a mitten.
- His pranks are friendly and are always undone by the end of the place.
- No dark rooms: every scene has a lit lantern or window. No threats, no
  countdowns, no "you failed" wording — a wrong try gets a warm nudge.
- The animals are an audience and friends, never in danger.

## Characters

- **Tryllebarna** — the museum's two child magicians (girl with red hair, boy
  with brown hair, top hats). They speak to the player, explain and cheer.
  The player is the third apprentice, not one of them. Their names are
  **Tiril** and **Trym**.
- **Fjøsnissen** — small, grey wool clothes, red knitted hat, white beard.
  Seen only in glimpses until the finale. He "speaks" through notes with
  wobbly handwriting and through what he leaves behind. He lives on the farm
  all year, which is what makes the season system work (see "Seasons").
- **The farm animals** — cow, horse, sheep, cat, the birds at the julenek,
  and the white rabbit from the top hat. They react to what the player does
  and fill the benches at the final show.

## The farm (Christmas season)

The home screen is a picture map of the farm yard in the snow. Each building
is a *place* (`sted`). A place has four beats, always in the same order so
small children learn the rhythm:

1. **Noe rart har skjedd** — the tryllebarn find a trace of the nisse.
2. **Hjelp til** — the mini-game: one Christmas preparation.
3. **Visste du at …** — the tradition, in two or three sentences, with an
   optional link into the site.
4. **Nissens triks** — the nisse leaves a trick. The game shows the *effect*
   (what the audience sees). The *secret* goes into the player's tryllesekk
   and is read in the closed area (see "Secrets").

| # | Place | Mini-game (mechanic) | Tradition taught | Nissens triks (effect only) |
|---|---|---|---|---|
| 1 | **Tunet** (prologue) | Find the nisse's traces in the yard (`finn`) | Who the fjøsnisse is: the farm's little guardian | **Strikken som hopper** — a rubber band jumps from two fingers to the other two |
| 2 | **Fjøset** | Make the Christmas porridge in the right order (`rekkefolge`) | Porridge with a *smørøye* for the nisse on Christmas Eve | **Kanelstanga av gummi** — a stiff cinnamon stick turns soft and wobbly |
| 3 | **Låven** | Repeat the order the birds landed on the julenek (`husk`) | The *julenek* — a sheaf of oats for the birds | **Thaumatropen** — a bird on one side of a paper disc, the julenek on the other; spin it and the bird sits on the nest. Told as magic from before film (a Victorian optical toy sold in London from 1825); the tryllebeskrivelse has a history section for the museum angle. The trick's slug is still `fuglen-pa-neket` |
| 4 | **Stallen** | Follow the strands in the horse's braided mane (`folg-traden`) | *Nisseflette* — the belief that the nisse braids the mane at night | **Den umulige knuten** — tie a knot in a ribbon without letting go of the ends |
| 5 | **Bakstehuset** | Fill the cake tins so the pattern is right (`monster`) | *Sju slag* — seven kinds of Christmas biscuits | **Pepperkaka som vet svaret** — a friend thinks of any number; the answer was already written under the biscuit |
| 6 | **Stua** | Weave a paper heart, over and under (`flett`) | *Julekurver* on the tree, and making your own decorations | **Gå gjennom et julekort** — step right through an ordinary Christmas card |
| 7 | **Stabburet** | The nisse has moved things — what changed? (`forandret`) | Christmas food, the almond in the porridge and the marzipan pig | **Klementinen som teller** — say how many segments are inside before it is peeled |
| 8 | **Lyktestien** | Light the four lanterns along the path (`tenn`) | Advent — four Sundays, four candles | **Tankeleser-lysene** — one magician leaves the room, comes back and knows which candle was chosen |
| 9 | **Låvescenen** (finale) | Put together your own Christmas show (`forestilling`) | The animals get extra food on Christmas Eve; the nisse comes to watch | **Tryllekunstnerens tre regler** — how to present a trick (no new effect) |
| + | *Bonus:* **Porten** | Who is behind the costume? (`gjett-hvem`) | *Å gå julebukk* between Christmas and New Year | **Maska som bytter ansikt** — a folded paper mask shows a new face every time it opens |

**All places are open from the first day** and can be played in any order
(decided November 2026). The finale opens when the eight ornaments hang on
the tree; the bonus place is open like the others.

**How the tricks were chosen.** All ten are classic beginners' effects of
the kind found in children's magic books: self-working or nearly so, done
with things already in the house (a rubber band, a ribbon, paper, a
clementine, a biscuit), with no fire, nothing sharp beyond children's
scissors, and no wasted food. None comes from the museum's tryllesett or
from working magicians' repertoire, so giving the methods to anyone who
finishes a place costs nobody a secret worth keeping. Tankeleser-lysene
needs two people — on purpose: it is Tiril and Trym's trick, and it gets a
sibling or a parent involved. The table gives effects only; the methods are
written as `kitTrick` documents in the private dataset.

The tradition texts are drafted during the build and are **not verified
folklore** until the museum has approved them. Approval happens once, before
launch (see "Decisions").

**The finale.** On the barn stage the player picks an opening, a middle and a
closing number from the tricks collected, chooses a magic word, and watches
the tryllebarn perform it for the animals. There are no wrong choices. The
nisse comes out of hiding, claps, and hands over the key to Nisseloftet and a
downloadable **nissediplom** (client-side SVG → PNG, like the Cabinet's
lærlingbrev).

**Magic principle per mini-game.** The mechanics are chosen so each one
quietly trains something a magician needs — observation (`finn`,
`forandret`), memory (`husk`), order and preparation (`rekkefolge`), pattern
(`monster`, `flett`), following one thing among many (`folg-traden`) and
planning ahead (`tenn`). The tryllebarn say so in one line after each game:
*«En tryllekunstner må se det ingen andre ser.»*

## Collecting: the Christmas tree

In the middle of the yard stands a bare spruce. Every finished place hangs
one ornament on it; the finale puts the star on top. The map is therefore
also the progress bar, and a child can see at a glance what is left.

Two optional collections reward curiosity and replay, and gate nothing:

- **Nisseluer** — the nisse hides somewhere in every scene. Tapping him gives
  a red hat and a giggle. Found hats are counted on the map.
- **Smørøyne** — finishing a place without asking for a hint puts a golden
  butter-eye in that place's porridge bowl.

## Difficulty

Three levels, chosen on the start screen with pictures, changeable at any
time from the game bar (also in the middle of a place — the mini-game simply
restarts gently on the new level). The level is a property of the player, not
of the content: each place stores three parameter sets.

| Level | For | What changes |
|---|---|---|
| **Smånisse** | ca. 4–6, with a grown-up nearby | 2–4 elements, big touch targets, everything read aloud automatically, pictures instead of text in choices, the answer glows after two tries |
| **Tryllelærling** | ca. 7–9 | 4–6 elements, short texts, hints on request |
| **Tryllemester** | 10+ and grown-ups | 6–9 elements, a twist per mechanic (e.g. the bird order must be given backwards), hints are riddles |

Hints are a three-step ladder, **Nissen hvisker**: a nudge, a clearer clue,
then the answer shown. Hints cost only the golden smørøye. The tradition
text has a short and a long version; Smånisse gets the short one.

## Language

Norwegian (bokmål) first, English as a parallel layer, following what the
Cabinet already does: every visible string has a Norwegian field and an
English sibling, defaults live in code, and a language switch appears in the
game bar only when `englishEnabled` is on in the config. The choice is stored
per player in `localStorage`.

Two things are different from the Cabinet:

- **Traditions need explaining, not translating.** The English text for
  *julenek* is a new sentence for a child who has never seen one. English is
  therefore also the "visiting family" version of the game.
- **Language-bound content is authored per language.** Magic words, rhymes
  and the nisse's notes are written fresh in English, not translated.

If nynorsk or Sami versions become relevant, the `*En` sibling-field pattern
gets heavy; that would be the moment to move the game's strings to
locale-keyed objects. Not proposed for the first version.

## Read-aloud (browser speech)

Small children cannot read, so speech matters more here than anywhere else on
the site. The game reuses the Web Speech API approach behind
`NarrateButton` and adds a game-level mode:

- On load the game checks `speechSynthesis` and looks for a voice matching
  the active language (`nb-NO`/`no`, or `en-GB`/`en-US`). If none exists, all
  speech controls are hidden and nothing else changes.
- **Les for meg** in the game bar turns automatic reading on or off. It
  defaults to on for Smånisse and off for the other levels. Every speech
  bubble also has its own speaker button.
- Speech is never required: every spoken line is also on screen, the active
  sentence is highlighted while it is read, and no mini-game depends on
  hearing something.
- Synthetic voices cannot act. The nisse therefore does not talk; his notes
  are read by the tryllebarn. Each line has an optional `audio` field, so
  recorded voices can replace the synthetic one line by line later, with no
  code change.
- **Speech input is deliberately left out.** "Say the magic word" is tempting,
  but browser speech recognition works in few browsers and sends the child's
  voice to a third-party service. The magic word is tapped or drawn instead.

Sound effects and music follow the Cabinet's decision: the game works fully
silent; any ambience sits behind a toggle that is off by default.

## Secrets: Nisseloftet in the closed area

What must not appear in the repository or the public dataset (the repository
is public) is **how the nisse's tricks are done**. That reuses what is
already built:

- The tricks are ordinary **`kitTrick`** documents, and each season's bundle
  is an ordinary **`kitCollection`** — "Nissens tryllesekk" — in the private
  `lukket` dataset. No new content type is needed for the secrets, and the
  existing trick page (`/bak-teppet/triks/<slug>`) renders them, with
  figures, steps and read-aloud.
- Each finished place reveals its one trick inside the game, fetched from a
  small endpoint (`/api/tryllegarden`, modelled on `/api/kabinett`), so the
  child gets something to perform straight away.
- **The game is the key.** At the finale the endpoint hands over the way
  into that season's tryllesekk — presented to the child as **Nisseloftet**
  — through the closed area's ordinary code link. No code is in the page
  source.
- The finale also shows the tryllesekk's code, as "nissens hemmelige ord",
  so a parent can write it down for another device. The same code can be
  printed on a card handed out at the museum's Christmas events — a
  physical way in that needs no playing. The code is changed each season.

**The mini-games themselves hold no secrets** and run in the browser: a
random order of birds or the steps of making porridge cannot be "looked
up", and there is nothing to win by cheating. This differs from *Det
trettende kabinett*, where every answer is checked on the server. The
consequence is that the server cannot know whether a place was really
played: "finished" is the browser's word, and someone determined could ask
the endpoint for a trick without playing. That is accepted — the tricks are
beginners' effects meant for anyone who plays — and the guard that matters
is a different one: the endpoint only hands out tricks that are in the
season's own tryllesekk, so nothing in the public season document can point
it at a tryllesett someone has paid for.

This also keeps the magicians' rule the site already follows: public pages
describe **effects**; methods are only behind the curtain. The tricks
are listed, as effects, in the table of places above. This document names
no methods on purpose.

## Seasons: one farm, several packs

The engine knows nothing about Christmas. It knows about a **farm map**, a
list of **places**, a library of **mini-game mechanics**, a **collection** and
a **closed-area bundle**. A season pack fills those in:

| Part of a season pack | Christmas | Easter (example) | Summer (example) | Autumn (example) |
|---|---|---|---|---|
| Title | Jul på Tryllegården | Påske på Tryllegården | Sommer på Tryllegården | Høst på Tryllegården |
| Mystery | Who eats the porridge? | Who hid the eggs? | Who lit the bonfire lantern? | Who has been in the apple loft? |
| Palette and map art | Snow, lanterns, red and green | Thaw, yellow, catkins | Light night, meadow | Golden leaves, harvest |
| The nisse's outfit | Red hat, grey wool | Yellow scarf | Rolled-up sleeves, straw hat | Knitted jumper |
| Collection | Ornaments on the tree | Eggs in the basket | Seven flowers in the wreath | Apples in the crate |
| Closed-area bundle | Nissens tryllesekk | Påskekurven | Sommerkofferten | Høstsekken |

The nisse stays the host all year — in the tradition he is the farm's
guardian, not a Christmas figure — so the characters, the map layout and the
player's habits carry over. Autumn is harvest and cosy dark evenings, not
Halloween horror.

What configuration can change **without code**: which season is active (by
date window or by hand), texts in both languages, images, palette, the order
and number of places, which mechanic each place uses and its three difficulty
parameter sets, the collection, the tricks, the unlock mode, and which places
are visible.

What needs code: a new *mechanic* (the library starts with the ten in the
table above), and new art has to be drawn.

**Unlock modes** (per season): `open` (everything at once — chosen for
Christmas), `sequential` (one place opens the next) or `dated` (each place has an
`availableFrom` date). `dated` would give an advent rhythm without the
content burden of a 24-door calendar; it stays available for a later year. Out of season, the game shows the most recent
season as a replay, or a "kommer snart" teaser; that is a config choice.

## How it fits the website

- **Route:** `/barn/tryllegarden` (slug convention: å → a). One page; places
  are client-side scenes, not routes — the Cabinet model.
- **Entry points:** a teaser card on `/barn`, a card on the *Hva skjer* hub
  while a season is active, and optionally a menu entry — all following the
  config's `isActive`, like the quiz and the Cabinet. Flag off: "kommer
  snart" teaser, `noindex`, no links.
- **Links out of the game:** each "visste du at" can link to site content;
  the nisse's tricks cross-link to *Lær et triks* (filtered by
  `laerEtTriksActive`, per the existing convention); the finale points to
  `/besok` and to upcoming Christmas events (`getUpcomingEvents()`).
- **Tema:** a `tema` hub "Jul på Tryllemuseet" can collect the game, a
  Christmas `comicStory` with the same characters and a Christmas
  `quizTheme` — the type exists for exactly this.
- **The physical museum:** a small nisse door somewhere in the exhibition
  with a QR code that hangs a bonus ornament on the tree
  (`/barn/tryllegarden?pynt=<code>`, checked by the endpoint). Optional, never
  required.
- **Preview:** a private preview code for editors while the flag is off, as
  the Cabinet has.

## Art direction

Based on the supplied illustrations: flat storybook cartoon with a bold dark
outline, round faces, warm lantern light against cold blue windows, wood and
hay textures, strings of lights and spruce garlands. Scenes are layered
(background, props, characters) so the nisse can peek out from behind things
and so reduced-motion users get still pictures that work just as well.

The supplied images show the children in two different styles: taller
figures with purple hat bands, and rounder figures with red hat bands and a
silver star. The game follows the rounder style from the barn picture with
the nisse (confirmed by the museum), and the hat band is a natural season
marker (red for Christmas). Every scene needs the same two children, so a character
sheet (front, side, cheering, pointing, surprised) should be drawn before any
scene.

Accessibility is part of the design, as in the Cabinet: no mini-game depends
on colour or sound alone, touch targets are at least 48 px on Smånisse,
everything works with keyboard and screen reader, and `prefers-reduced-motion`
is respected.

## Technical sketch (grounded in this repo)

| Piece | As built |
|---|---|
| Page | `web/src/pages/barn/tryllegarden.astro`, rendered on demand (the preview link needs a cookie) and CDN-cached while live |
| Engine | Vanilla TS in the page: map, dialogue, three mechanics, hint ladder, read-aloud, `localStorage` |
| Season packs | `web/src/lib/tryllegardenSeason.ts`: types, the built-in Christmas pack and `mergeSeason()` |
| Endpoint | `web/src/pages/api/tryllegarden.ts` + `web/src/lib/tryllegarden.ts`: `trick` (one method) and `finale` (the way into the bundle) |
| Config | `farmGameConfig` singleton in `production`: `isActive`, `activeSeason`, the farm's and the children's names, teaser texts, `englishEnabled` |
| Season in Sanity | `farmSeason` in `production`, every field optional: a document with the key of a built-in pack overrides it field by field; a new key is a new season. Nothing secret |
| Tricks | Existing `kitTrick` + `kitCollection` (one per season) in `lukket`, named by slug from the season |
| Queries | `getFarmGameConfig()`, `getFarmSeasonDoc()` in `web/src/lib/sanity.ts`; the private side reuses `getKitTrickBySlug()` and `getKitAccessList()` |
| Progress | `localStorage` (`tryllegarden-v1`), keyed by season so a new season starts fresh and old trees are kept |
| Preview | The Cabinet's preview code also opens this game: `/barn/tryllegarden?forhandsvisning=<code>` |

No new dataset or private content type is needed. The game adds a third
on-demand page and a second endpoint; the rest of the site stays static.

## Smallest launchable slice

1. Config + "kommer snart" teaser behind the flag.
2. Map, Christmas tree and three places — Tunet, Fjøset, Låven — on all three
   levels, with read-aloud and the hint ladder.
3. One trick per place, revealed in the game; the finale stub unlocks
   Nisseloftet with those three tricks.
4. Norwegian only; English fields exist but the switch is off.

Everything else — the remaining places, the full finale, the diploma, the
museum QR ornament, English, and the next season — layers on without rework.

## Decisions (museum, November 2026)

| Question | Decision |
|---|---|
| The farm's name | **Årvoll gård**, by name |
| The children's names | **Tiril and Trym** |
| Which tricks, and whether to give methods away | Left to the concept: the ten beginners' effects in the table of places, methods included in Nisseloftet |
| Rhythm | **Everything open at once** (`open`) |
| Illustration style | The rounder style from the barn picture |
| Titles | *Tryllegården* (engine) and *Jul på Tryllegården — Fjøsnissens hemmelighet* (season) |
| Folklore and other texts | The museum approves **once, before launch** — not along the way. Drafts are written during the build, and the game stays behind `isActive` until that review is done |

Still open: who draws the art, and whether whoever runs Årvoll gård should
be told that the farm appears by name in a game.

## Implementation status (November 2026)

Built and dormant: `/barn/tryllegarden` shows "kommer snart", is `noindex` and
is not linked from `/barn` until **Tryllegården: Innstillinger** → `isActive`
is on. Editors test it with the preview link.

**What is in it**

- Start screen with the three levels, the farm map with the Christmas tree,
  and **thirteen places**. Porten, Sykkelverkstedet and Fuglehuset (key `honsehuset`) are extras (`bonus`) and are not needed to open the finale. Each has dialogue, a mini-game, "visste du at", the
  nisse's trick and an ornament for the tree.

  | Place | Mechanic | What changes with the level |
  |---|---|---|
  | Tunet | `finn` | 3 → 7 things, smaller on harder levels |
  | Fjøset | `rekkefolge` | 4 → 8 cards, decoy cards on Tryllemester |
  | Låven | `husk` | 2 → 5 birds, last round backwards on Tryllemester |
  | Stallen | `folg-traden` | 3 → 6 braids, same colour on harder levels |
  | Bakstehuset | `monster` | 1 → 3 missing biscuits, longer and more complex rows |
  | Stua | `flett` | 2×2 → 5×5 basket, other weaves on Tryllemester |
  | Stabburet | `forandret` | 3 → 9 things on the shelves |
  | Lyktestien | `tenn` | in order → a lantern also flips its neighbours |
  | Klokketårnet | `husk` | 2 → 6 bells that differ in colour, last round backwards on Tryllemester |
  | Skogen | `gjett` | 3 → 6 trees; "find the tallest" → "the second tallest" and combined clues |
  | Porten (extra) | `gjett` | 3 → 6 costumes (emoji until drawn) and riddles |
  | Sykkelverkstedet (extra) | `sorter` | 3 → 6 spanners to put in order by length, the last round the other way on Tryllemester. Replaced Bryggerhuset (same slot 11); an item with key `lys` is drawn as a candle, anything else as a spanner |
  | Fuglehuset (extra, key `honsehuset`; the cockatoo Loco is the place's `dancer` and dances at every right answer) | `tell` | count eggs, and hens on harder levels; Smånisse can look as long as they like, older children see them for a few seconds and can look again |

- Hint ladder "Nissen hvisker" (two spoken hints, then the answer glows),
  golden smørøyne for hint-free places, and a hidden nisse in every scene.
- Read-aloud through the browser's speech synthesis when it has a matching
  voice; on by default for Smånisse.
- **Finale:** when all eight ornaments hang, the player composes a show
  (three of the nisse's tricks and a magic word), the animals watch, and the
  nisse hands over the key to Nisseloftet (`/bak-teppet/nissens-tryllesekk`).
- **Progress across visits and devices.** Progress is kept in the browser. A
  **save code** ("lagrekode", `JUL-XXXXX-XXXXX-XXXXX`) carries it to another
  device: "Lagre fremgang" on the map shows it with a copy button, and "Har du
  en lagrekode fra før?" on the start page takes it back. The code packs the
  done places, butter-eyes, found hats, finale, level and read-aloud choice into
  75 bits with a checksum; nothing is stored on a server and nothing identifies
  the child. Restoring only adds progress, it never takes any away. Places are
  identified by a fixed `slot` (0–15), so codes survive places being reordered
  or hidden; a slot must never be changed once codes exist, and new places
  need one (Studio: "Plassnummer"). The game also asks the browser for
  persistent storage after the first ornament, because Safari may otherwise
  clear it after a week without a visit (Firefox may ask the grown-up first).
- **The trick card** reuses the closed area's tryllebeskrivelser: text, steps
  and step pictures, plus a read-aloud button and the trick's videos (a video
  titled "Effekt" is shown first; embedded players load only after the child
  taps "Vis hemmeligheten"; YouTube players only suggest videos from the same
  channel). The card shows the trick's recommended age (`trickAge` on the
  place), and Smånisse is asked to get a grown-up's help for tricks from age 7.
- Nine tricks and the bundle "Nissens tryllesekk" exist in the `lukket`
  dataset. The ninth, "Tryllekunstnerens tre regler", is the finale's lesson.
- Norwegian only. The interface has English strings and every content field
  has an English sibling, but no place text is translated and
  `englishEnabled` is off.

**Art.** The museum's illustrations are in use: the farm map
(`kart-jul.webp`; places sit on it at `mapX`/`mapY` and follow its buildings),
the seven things from Tunet (also reused in Fjøset, Stallen and Lyktestien),
the children in four poses (faces in the speech bubbles, whole figures in the
finale), the nisse (face, two standing poses, two peeking heads) and the
start picture, the ornaments for Tunet, Fjøset and Låven, the star for the tree, the three level badges (sock, top hat, star), the key to Nisseloftet and the scenes for Tunet and Fjøset. All are files in `web/public/images/tryllegarden/`. Scenes,
the other mini-game objects (birds, biscuits, shelf food) and the tree are
still simple drawings or emoji. See `docs/tryllegarden-art-brief.md`. The
lantern picture has a ragged lower edge from the original sheet.

**Not built yet:** the diploma, the museum QR ornament, seasons by date,
recorded voices, English texts, scene pictures.

**Before switching it on:** the museum's one review of all texts — the
tradition texts in particular are drafts — and of the tricks; scene art; and
a decision on whether the game gets a place in the menu (`siteNavigation`,
feature flag "Tryllegården").
