# Det trettende kabinett — Full Game & Content Reference

This document is a complete content and mechanics reference for **Det trettende kabinett** ("The Thirteenth Cabinet"), the museum's browser story game. It exists so the game can be recreated or reimagined in another tool (e.g. Lovable) without needing the original Astro/TypeScript source.

For the creative vision and design rationale, see `docs/det-trettende-kabinett-concept.md`. This document instead captures **everything the player actually sees**: every room's narration, every puzzle mechanic, every button label, every hint, every success/failure message, every "did you know" fact, and every piece of copy in both Norwegian and English — plus the systems (cards, saves, poster, diploma) that tie it all together.

**Current status:** the full game (Acts I–IV + finale) is built and live in code, but shipped dormant behind a CMS master switch (`isActive`). It is not currently visible on tryllemuseet.no.

---

## 1. The pitch

**Det trettende kabinett** is a fictional magic museum that only exists between midnight and dawn. The player receives a sealed apprentice letter: the Cabinet's keeper — **Direktøren** ("the Director") — takes on one apprentice per generation, and tonight the doors are open.

The museum has twelve known rooms, each holding the spirit of one era of magic's history — plus a rumored **thirteenth room** no apprentice has ever found. A room won't unlock the next door until the apprentice has understood — and been fooled by — that era's central principle of deception. Along the way the player collects playing cards: **thirteen rooms, four cards each — a complete deck of 52** — the key to the thirteenth cabinet, and the walk from *Lærling* (Apprentice) to *Mester* (Master).

When the final door opens, dawn breaks — and the epilogue reveals the Cabinet exists in daylight too: it is called **Tryllemuseet**.

The narrative and rooms are fictional; every puzzle principle, era, and historical fact is real, with soft links into the real site (legends, archive, exhibition, visit page).

**Tone & art direction:** theatrical varieté, not gothic horror — deep velvet reds and midnight blues, gold frames and filigree, lithograph-poster typography, warm lamplight. Silent by design (no required audio). Reduced-motion accessible throughout — every puzzle is solvable without relying on animation, sound, or color alone.

---

## 2. Structure at a glance

- **27 scenes** in fixed sequence: a prologue, 12 numbered "puzzle rooms" (one per card value 2–12, plus the Foajeen prologue = value 1/Ace and the finale = value 13/King), **8 "Speilgangen" (Mirror Passage) illusion interludes**, and **4 act epilogues** + a finale sequence (Porten → Kabinettet → Daggry).
- Organized into **four Acts**, each ending in an epilogue/progress-summary screen, plus a finale:
  - **Act I:** Foajeen → Sandrommet → Speilgangen (Kortet du valgte) → Markedsplassen → Epilog
  - **Act II:** Galleriet → Biblioteket → Øyet som lyver → Salongen → Seansen → Epilog II
  - **Act III:** Det frie valget → Teateret → Kinoen → Ånden på lerretet → Verkstedet → Epilog III
  - **Act IV:** Minnet som dikter → Studioet → Trekanten som ikke finnes → Gatehjørnet → Fargene som lyver → Vinterhagen → Epilog IV
  - **Finale:** Porten → Det trettende kabinettet → Daggry
- Progress is saved automatically in the browser (`localStorage`); the player can close the tab and resume later from the same scene. A "Begynn på nytt" ("Start over") option wipes progress.
- The whole game exists in **Norwegian and English**; a language toggle appears once the museum turns on the English content (currently prepared but off). Switching language reloads the page; progress is kept.

---

## 3. The core systems (apply to every room)

### 3.1 The deck — 52 collectible cards

The player's persistent collection is a deck of playing cards: **13 values (one per room) × 4 suits (one per way of earning a card) = 52.**

| Suit | Symbol | Earned by |
|---|---|---|
| Spades | ♠ | Solving the room's puzzle ("Løs rommets gåte") |
| Hearts | ♥ | Completing the room — pressing the final "Fullfør rommet →" button ("Fullfør rommet") |
| Diamonds | ♦ | Experiencing the room's Speilgangen (Mirror Passage) illusion ("Opplev Speilgangen") |
| Clubs | ♣ | Finding the room's hidden curiosity object ("Finn rommets kuriositet") |

Card values 1–13 map onto the 13 "room slots": Ace=Foajeen, 2=Sandrommet, 3=Markedsplassen, 4=Biblioteket, 5=Salongen, 6=Seansen, 7=Teateret, 8=Kinoen, 9=Verkstedet, 10=Studioet, 11=Gatehjørnet, 12=Vinterhagen, 13=Kabinettet (Kings). The four Speilgangen illusion rooms that don't have their own numbered room (values 10♦, 11♦, 12♦) are held back and granted together at the finale's door puzzle ("Porten").

- Every card award triggers a small toast: *"🃏 Nytt kort: **{value}{suit-symbol}** — {note}"* / *"🃏 New card: **{value}{suit-symbol}** — {note}"*.
- A "Kortstokken" (deck) button in the top bar always shows live progress, e.g. `12/52`. Opening it shows all 13 rows with 4 slots each; missing cards show a `?` placeholder explaining how to earn them; locked future-act cards say *"kommer i finalen" / "comes in the finale"* etc.
- **Gilding:** in every puzzle room that offers a path choice (see below), solving the puzzle on **Mesterens vei** with **zero hints used and zero wrong attempts** gilds that room's spade (♠) card — a cosmetic flourish shown as a gold ring around the card, never a gameplay requirement. Non-puzzle Speilgangen rooms are never gildable.

### 3.2 Path choice — Lærlingens vei / Mesterens vei

Most puzzle rooms (not the Speilgangen illusion interludes) open with a choice:

- **Lærlingens vei** ("The Apprentice's Path") — a calm pace, extra guidance baked into the room text.
- **Mesterens vei** ("The Master's Path") — the same puzzle, cryptic/terser wording, no hand-holding. Solving it flawlessly (no hints, no wrong guesses) gilds the room's spade card.

There is **no fail state** anywhere in the game — wrong answers only cost a line of in-character mockery from Direktøren; the player can always try again.

### 3.3 Hints — "Direktørens hvisken" (the Director's whisper)

Every puzzle room with a path choice also has a 3-step hint ladder. A single button — *"Direktørens hvisken (hint) 🤫"* / *"The Director's whisper (a hint) 🤫"* — reveals one hint at a time, appended cumulatively to a list, wrapped in quotation marks («…» in Norwegian, "…" in English). The button disables after the third hint. Taking any hint disqualifies that solve from gilding, but never blocks progress.

### 3.4 Curiosities (♣)

Every puzzle room hides one small clickable object in its scenery (a scarab, a mouse, a cogwheel, a snowflake…). Finding and clicking it awards the room's club card — optional, never required, and rewards exploring/replaying.

### 3.5 "Visste du at …" facts

Every solved room shows one or more historical fact cards: kicker *"✦ Visste du at …"* / *"✦ Did you know …"*, a teaser (truncated to ~96 characters), and a "Les hele →" / "Read it all →" link that opens a modal with the full fact, an optional image, and — for facts with a source link — an outbound link (labelled distinctly if it leaves tryllemuseet.no). These facts are all listed room-by-room in Section 5 below, alongside each room's narrative intro.

### 3.6 Save/resume, restart, and language

- Progress (`stage`, `stageName`, owned `cards`, `gilded` cards, and per-room path choices) is saved to `localStorage` after every change. Returning players are welcomed back by name: *"Velkommen tilbake{, name} — Kabinettet husker deg. 🕯️"* / *"Welcome back{, name} — the Cabinet remembers you. 🕯️"* Resuming mid-puzzle re-shows the path-choice screen for that room (in-room puzzle progress itself isn't saved, only which scene/cards you have).
- **"Begynn på nytt" / "Start over"** (confirmation: *"Begynne helt på nytt? Kortene og fremdriften din slettes."* / *"Start over completely? Your cards and progress will be deleted."*) wipes everything.
- A language toggle (**"In English"** / **"På norsk"**) — hidden until the museum turns it on — switches every piece of game text and reloads the page; progress carries over. All room copy exists in complete NO/EN pairs; two language-coupled puzzles (Markedsplassen's acrostic verse, Studioet's digit force) were **re-authored**, not literally translated, so the puzzle still works in English (see their sections below).
- Reduced-motion players get every timed sequence either skipped or drastically shortened — except the Ånden på lerretet afterimage timer, which is deliberately kept at its full 12 seconds because it is real eye physiology, not decoration.

### 3.7 The shareable poster

Once the player has earned at least one heart (♥) card, a "Last ned plakaten din 🖼️" ("Download your poster 🖼️") button generates a 900×1200 burgundy-and-gold "varieté poster" (client-side, SVG → PNG) reading:

> TRYLLEMUSEET PRESENTERER / TRYLLEMUSEET PRESENTS
> DET TRETTENDE / THE THIRTEENTH
> KABINETT / CABINET
> *{a subtitle that updates with the player's progress}*
> MED DEN LOVENDE LÆRLINGEN / FEATURING THE PROMISING APPRENTICE
> **{PLAYER'S STAGE NAME}**
> opptatt av Direktøren selv / taken on by the Director himself
> ♠ ♥ ♦ ♣
> KUN ÉN FORESTILLING / ONE PERFORMANCE ONLY
> MELLOM MIDNATT OG DAGGRY / BETWEEN MIDNIGHT AND DAWN
> *{museum address}*

The subtitle changes with progress, from *"— akt I: natten da porten gikk opp —"* ("— act I: the night the gate swung open —") up through *"— alle tretten rom: natten som ble dag —"* ("— all thirteen rooms: the night that became day —") at the finale.

### 3.8 The diploma ("lærlingbrev")

At the very end (Daggry), a downloadable certificate (SVG → PNG) reads:

> DET TRETTENDE KABINETT / THE THIRTEENTH CABINET
> LÆRLINGBREV / LETTER OF APPRENTICESHIP
> *Det bevitnes herved at / This is to certify that*
> **{PLAYER NAME}**
> har vandret gjennom Kabinettets tretten rom, samlet {n} av 52 kort, / has wandered the Cabinet's thirteen rooms, collected {n} of 52 cards,
> og opptas i lauget med tittelen / and is admitted to the guild with the title
> **{RANK}**
> ♠ ♥ ♦ ♣
> *gitt i daggryet, mellom natt og dag — Direktøren / given at dawn, between night and day — the Director*
> TRYLLEMUSEET · ÅRVOLL GÅRD

**Rank** is based on total cards collected out of 52:

| Cards owned | Norwegian rank | English rank |
|---|---|---|
| 52 (all) | Kabinettets mester | Master of the Cabinet |
| 49–51 | Direktørens fortrolige | The Director's Confidant |
| fewer | Direktørens lærling | The Director's Apprentice |

### 3.9 Scene transitions

Moving between rooms plays a short (520ms) full-screen transition: a 🚪 door icon and *"Kabinettet åpner en ny dør"* / *"The Cabinet opens a new door"* for ordinary rooms, or a 🪞 mirror icon and *"Ut i Speilgangen"* / *"Into the Mirror Passage"* for the eight illusion interludes — showing the destination room's title before the scene swaps in.

### 3.10 Help panel (always accessible)

> **Slik spiller du / How to play** — the Cabinet opens one room at a time; you can never lose.
> **Veivalg / Choosing a path** — Lærlingens vei vs. Mesterens vei (gilding explained).
> **Hint — Direktørens hvisken / Hints — the Director's whisper** — up to 3 hints, never cost progress.
> **Kortstokken / The deck** — explains the four suits.
> **Kuriositetene / The curiosities** — hidden objects in every room.
> **Fremdrift / Progress** — autosave explained, "Start over" explained.

---

## 4. Framing texts (outside any room)

**Game title:** Det trettende kabinett / The Thirteenth Cabinet
**Game intro (hero banner):** *"Et tryllemuseum som bare finnes mellom midnatt og daggry. Direktøren tar opp én lærling per generasjon — og i natt står dørene åpne."* / *"A magic museum that only exists between midnight and dawn. The Director takes on one apprentice per generation — and tonight, the doors stand open."*

**"Coming soon" state** (shown while the game is switched off):
- Title: *"Dørene er ennå låst …"* / (untranslated placeholder used until launch)
- Text: *"Det trettende kabinett åpner snart for sin neste lærling. Kom tilbake litt senere — eller besøk oss på Årvoll gård i mellomtiden!"*

**Museum address** (used on poster/diploma): *Årvoll gård, Årvollveien 35, 0590 Oslo*

---

## 5. Room-by-room content, in play order

Each entry below gives: the room's narrative intro (NO/EN), its puzzle mechanic explained plainly, every piece of player-visible text (choices, feedback, hints), what cards it awards, its curiosity object, and its "did you know" facts.

### 5.0 Prologue — "Et forseglet brev" (A sealed letter)

The game's landing screen.

> NB: *«Til den som finner dette: Kabinettet åpner i natt, mellom midnatt og daggry. Direktøren tar opp én lærling per generasjon. Tolv rom kjenner vi. Det trettende har ingen lærling noensinne funnet. Ta med deg et navn du tør å skrive, og bank tre ganger.»*
> EN: *"To whoever finds this: the Cabinet opens tonight, between midnight and dawn. The Director takes on one apprentice per generation. Twelve rooms are known to us. The thirteenth, no apprentice has ever found. Bring a name you dare to write, and knock three times."*
> Signature: *"— uleselig signatur, men blekket er ferskt"* / *"— an illegible signature, but the ink is fresh"*

Single action: **"Bank på porten 🚪"** / **"Knock on the gate 🚪"** → enters Foajeen.

---

### 5.1 Foajeen — The Foyer *(prologue room — the four Aces)*

**Intro:**
> NB: «Porten gir etter, og du står i en foajé av fløyel og gull. Ingen mennesker — bare en talerstol med en oppslått gjestebok, og en stemme som ser ut til å komme fra lysekronen: «Velkommen, lærling. Skriv deg inn. Kabinettet liker å vite hvem det lurer.»»
> EN: "The gate gives way, and you stand in a foyer of velvet and gold. No people — only a lectern with an open guest book, and a voice that seems to come from the chandelier: 'Welcome, apprentice. Sign your name. The Cabinet likes to know whom it is fooling.'"

**Mechanic:** a small piece of staging rather than a logic puzzle — this is the game's tutorial and the moment the player names their stage persona.

1. The player types a stage name into a form (**"Scenenavnet ditt"** / **"Your stage name"**, placeholder *"Den store …"* / *"The Great …"*) and clicks **"Skriv med fjærpennen ✒️"** / **"Write with the quill ✒️"**.
2. First submission: *"Blekket renner av arket og samler seg i en liten, fornærmet dam. Gjesteboken vil tydeligvis ikke bli sett på mens den tar imot navn."* / *"The ink runs off the page and gathers in a small, offended puddle. The guest book clearly refuses to be watched while it accepts names."* — reveals a new button, **"Se bort et øyeblikk 👀"** / **"Look away for a moment 👀"**.
3. Clicking it shows a full-screen overlay: *"Du ser bort. Bak deg skraper en penn mot papir …"* / *"You look away. Behind you, a pen scratches against paper …"* After ~2 seconds, the guestbook line fills in with `~ {stageName} ~`.
4. **All four Aces are awarded at once**: *"🃏 Fire nye kort: **essene** — Direktørens forskudd"* / *"🃏 Four new cards: **the aces** — the Director's advance"*. Success text: *"Boken tar imot navnet ditt. Fra et sted bak talerstolen rekker Direktøren deg fire kort — **essene**. «Resten av stokken må du gjøre deg fortjent til.»"* / *"The book accepts your name. From somewhere behind the lectern, the Director hands you four cards — **the aces**. 'The rest of the deck you will have to earn.'"*
5. **"Ta imot kortene og gå videre →"** / **"Accept the cards and move on →"** → Sandrommet.

No path choice, no hints, no wrong state — this room can't be "failed."

**Cards:** A♠ A♥ A♦ A♣, all unconditional.

---

### 5.2 Sandrommet — The Sand Room *(Antiquity — the Twos)* — cups and balls

**Intro:**
> NB: «Rommet lukter varm sand og gammelt krydder. På et lavt bord står tre kopper av leire, og bak bordet: en skikkelse i skygge som stokker dem med hender eldre enn skrift. «Begerspillet,» hvisker Direktøren. «Verdens eldste triks. Følg kulen — om du klarer.»»
> EN: "The room smells of warm sand and old spice. On a low table stand three cups of clay, and behind the table: a figure in shadow, shuffling them with hands older than writing. 'The cups and balls,' whispers the Director. 'The oldest trick in the world. Follow the ball — if you can.'"

**Path choice:**
- Lærlingens vei — *"Rolig tempo og hjelp underveis"* / *"A calm pace and help along the way"*
- Mesterens vei — *"Raskere stokking, ingen slingring — løser du gåten uten hint, gylles sparkortet ditt"* / *"Faster shuffling, no slack — solve the riddle without hints and your spade card is gilded"*

**Mechanic — three rounds:**

- **Round 1–2 ("Følg kulen" / "Follow the ball"):** the ball is shown under a random cup, then hidden. A series of cup swaps is logged one at a time (*"Koppen {A} bytter plass med koppen {B}"* / *"The cup {A} swaps places with the cup {B}"*). The player then clicks a cup to guess. Correct → *"Riktig! Kulen er der. «Ikke verst,» sier skikkelsen — og stokker videre."* / *"Right! The ball is there. 'Not bad,' says the figure — and shuffles on."* Wrong → *"Tomt! Kulen lå {position}. «Igjen,» sier skikkelsen, og samler koppene."* / *"Empty! The ball was {position}. 'Again,' says the figure, gathering the cups."* → round restarts.
  - Midway through round 2, a scarab curiosity appears: *"I det samme piler noe blankt over bordet — en skarabé!"* / *"Just then, something shiny darts across the table — a scarab!"*
- **Round 3 (the actual trick):** the ball is never really under any cup this round. During the swap sequence: *"Magikerens frie hånd stryker langs bordkanten, rolig som en katt."* / *"The magician's free hand strokes along the table edge, calm as a cat."* Clicking any of the three cups is **always wrong**: *"Tomt. Alle koppene klinger hult. Men kulen forsvant jo ikke opp i røyk …"* / *"Empty. All the cups ring hollow. But the ball didn't vanish into smoke …"* The only solution is clicking the magician's resting **hand**: *"Skikkelsen åpner langsomt hånden. Der ligger kulen — den lå der før første bytte."* / *"The figure slowly opens the hand. There lies the ball — it was there before the first swap."*

**Hints:**
1. *"Du fulgte koppene, lærling. Men fulgte du magikeren?"* / *"You followed the cups, apprentice. But did you follow the magician?"*
2. *"Kulen forlot bordet før første bytte."* / *"The ball left the table before the first swap."*
3. *"Se på hånden som «hviler» på bordkanten."* / *"Look at the hand 'resting' on the edge of the table."*

**Principle (on solve):** «Hånden er ikke raskere enn øyet, lærling. Den trenger ikke være det. **Oppmerksomheten din styres** — og mens du fulgte koppene, fulgte ingen magikeren.» / "The hand is not quicker than the eye, apprentice. It doesn't need to be. **Your attention is steered** — and while you followed the cups, nobody followed the magician."

**Facts:**
- Et rundt 4000 år gammelt gravmaleri fra Beni Hasan i Egypt er blitt tolket som verdens eldste avbildning av begerspillet — selv om forskere fortsatt diskuterer hva maleriet egentlig viser. *(→ Cups and balls, Wikipedia)*
- I Westcar-papyrusen fortelles det om magikeren Dedi, som skal ha opptrådt for farao Khufu for om lag 4500 år siden — historiens eldste navngitte tryllekunstner. *(→ /utstillingen)*

**Cards:** 2♠ (solve, gildable) · 2♣ (scarab curiosity) · 2♥ (room completion). 2♦ comes from the next room (Speilgangen).

---

### 5.3 Speilgangen — The Mirror Passage *(illusion interlude — "Kortet du valgte" / "The Card You Chose")*

**Intro:**
> NB: «En smal gang kledd med speil i gullrammer. Ett av speilene er ikke et speil. «Her opptrer Kabinettet for deg,» sier Direktøren. «Du skal ikke løse noe. Du skal bare bli lurt.»»
> EN: "A narrow passage lined with mirrors in gilded frames. One of the mirrors is not a mirror. 'Here, the Cabinet performs for you,' says the Director. 'You are not here to solve anything. You are only here to be fooled.'"

**Mechanic — a self-working "any-card-can-vanish" style forcing trick:** two fixed 6-card sets exist (Set A: K♥ Q♠ J♦ K♣ Q♦ J♠; Set B: K♠ Q♥ J♣ K♦ Q♣ J♥).

1. Six cards from Set A are shown: *"Speilet viser seks kort. **Velg ett av dem — bare i tankene.** Ikke pek, ikke klikk. Stirr på kortet ditt til du er sikker på at du husker det."* / *"The mirror shows six cards. **Choose one of them — in your mind only.** Don't point, don't click. Stare at your card until you are sure you will remember it."* → **"Jeg har memorert kortet mitt"** / **"I have memorised my card"**.
2. *"Speilet dugger til … Kabinettet gransker tankene dine …"* / *"The mirror mists over … The Cabinet is examining your thoughts …"* (a short wait).
3. Five cards from Set B (one removed) are shown: *"**Kortet ditt er borte.** Speilet har fjernet nøyaktig det kortet du tenkte på:"* / *"**Your card is gone.** The mirror has removed exactly the card you were thinking of:"* — this "succeeds" 100% of the time regardless of what was picked, since Set B shares no cards with Set A.
4. Options: **"Utrolig — gjør det igjen 🔁"** / **"Incredible — do it again 🔁"** (repeats with the sets swapped) and **"Løft forhenget: hvordan? 🎭"** / **"Lift the curtain: how? 🎭"**, which shows a side-by-side comparison of the original 6 cards vs. the "returned" 6 cards, revealing they're two entirely different sets: *"Se nøye: **alle** kortene ble byttet ut. Du husket bare ditt eget kort — så du merket ikke at de fem andre også forsvant. Hjernen din lagret det du ga oppmerksomhet, og fylte inn resten selv."* / *"Look closely: **all** of the cards were swapped out. You only remembered your own card — so you never noticed that the five others disappeared too. Your brain stored what you paid attention to, and filled in the rest by itself."*
5. **"Videre til neste rom →"** / **"On to the next room →"** → Markedsplassen.

**Facts:** Hjernen din lagrer bare det du gir oppmerksomhet. Resten fyller den inn selv — og merker ikke engang at den gjør det. *(→ Inattentional blindness, Wikipedia)*

**Cards:** 2♦ only (always awarded on the first reveal). No curiosity, no completion card — pure Speilgangen room (this pattern repeats for all 8 Speilgangen interludes).

---

### 5.4 Markedsplassen — The Market Square *(Medieval — the Threes)* — mountebank's acrostic verse

**Intro:**
> NB: «Du trer ut på en middelaldersk markedsplass — inne i museet, umulig nok. En gjøgler i fillete fløyel roper over mengden du ikke kan se, og tre krus står på tønna foran ham. «Taskenspillerne,» sier Direktøren. «De gjemte aldri noe i hendene. De gjemte det i ordene.»»
> EN: "You step out onto a medieval market square — inside the museum, impossibly enough. A mountebank in ragged velvet shouts over a crowd you cannot see, and three mugs stand on the barrel before him. 'The street conjurers,' says the Director. 'They never hid anything in their hands. They hid it in their words.'"

**Path choice:**
- Lærlingens vei — *"Direktøren minner deg om hvor gjøglere gjemmer hemmeligheter"* / *"The Director reminds you where conjurers hide their secrets"* → pretext: *"Direktøren lener seg inntil øret ditt: «Gjøglere gjemmer alltid hemmelighetene sine i ordene. Hør på verset — ordentlig.»"* / *"The Director leans close to your ear: 'Conjurers always hide their secrets in the words. Listen to the verse — properly.'"*
- Mesterens vei — *"Bare verset og ørene dine — løser du gåten uten hint, gylles sparkortet ditt"* / *"Just the verse and your ears — solve the riddle without hints and your spade card is gilded"* → pretext: *"Gjøgleren roper verset sitt én gang. Mer får du ikke."* / *"The conjurer shouts his verse once. That is all you get."*

**The puzzle — an acrostic verse.** Norwegian original (first letters spell **M-I-D-T-E-N**, "the middle"):

> Mine damer og herrer, kom nærmere nå!
> Ingen har øyne som klarer å slå
> Den flinkeste hånd på torget i dag.
> Tre krus og en ert — et lurendreiers slag!
> Ei skal dere tro det dere *ser*,
> Nei — hør etter nøye, så vinner du mer!

English (**re-authored, not translated**, so the acrostic still works — spells **M-I-D-D-L-E**):

> My lords and ladies, gather round the show!
> In all the town, no eye is quick enough to know
> Deft little pea, three mugs upon the board,
> Dancing away from the quickest eye abroad!
> Look all you like — your eyes will lead you wrong,
> Ears open wide, my friends: the truth is in the song!

Prompt: *"Under hvilket krus ligger erten? Gjøgleren har allerede røpet det — for den som legger merke til det."* / *"Which mug hides the pea? The conjurer has already given it away — to anyone paying attention."* Three buttons: **Venstre krus / The left mug**, **Midterste krus / The middle mug** (correct), **Høyre krus / The right mug**.

- Correct: *"Gjøgleren løfter det midterste kruset: erten! Han bukker dypt. «Endelig én som hører etter!»"* / *"The conjurer lifts the middle mug: the pea! He bows deeply. 'At last, someone who listens!'"*
- Wrong: *"Gjøgleren løfter kruset: tomt! Han ler rått. «Nei og nei! Hørte du ikke etter? Jeg sa jo hvor den lå!»"* / *"The conjurer lifts the mug: empty! He laughs coarsely. 'Dear, dear! Weren't you listening? I told you where it was!'"*

**Hints:**
1. *"Svaret står i verset. Alt sammen gjør det."* / *"The answer is in the verse. All of it is."*
2. *"Les nedover, ikke bortover."* / *"Read downwards, not across."*
3. *"Første bokstav i hver linje, lærling."* / *"The first letter of every line, apprentice."*

**Principle:** «**Språket er misdireksjon**, lærling. Gjøgleren pekte aldri med hånden — han pekte med verset. Første bokstav i hver linje: M-I-D-T-E-N. Folk hører historien og overser bokstavene.» / "**Language is misdirection**, apprentice. The conjurer never pointed with his hand — he pointed with the verse. The first letter of every line: M-I-D-D-L-E. People hear the story and overlook the letters."

**Curiosity:** a mouse (🐁) visible from the start: *"Kuriositeten: musa med erten i munnen"* / *"The curiosity: the mouse with the pea in its mouth"*.

**Facts:**
- Ordet «hokus pokus» dukker opp i England på 1600-tallet — trolig fra en gjøglers liksom-latin, laget for å høres magisk ut.
- Middelalderens taskenspillere balanserte på en farlig grense: det samme trikset kunne gi applaus på markedet og en anklage om trolldom i retten. *(→ /tryllehistorie)*

**Cards:** 3♠ (solve, gildable) · 3♣ (mouse curiosity) · 3♥ (completion).

---

### 5.5 Epilog (Act I) — "Bak forhenget" / "Behind the Curtain"

**Intro:**
> NB: «Direktøren møter deg ved et tungt, rødt forheng. Bak det: en trapp videre opp i mørket. «Du har kommet lenger enn de fleste, lærling. Men Kabinettet har tretten rom, og natten er ikke lang nok for dem alle. Kom tilbake — dørene husker deg nå.»»
> EN: "The Director meets you by a heavy red curtain. Behind it: a staircase climbing on into the dark. 'You have come further than most, apprentice. But the Cabinet has thirteen rooms, and the night is not long enough for them all. Come back — the doors remember you now.'"

**Dynamic summary:** *"Du forlater Akt I med {n} av 12 kort i kortstokken"* / *"You leave Act I with {n} of 12 cards in your deck"*, plus a gilding note if applicable, then either *"Direktøren hever et øyenbryn: «Imponerende samling, lærling.»"* / *"The Director raises an eyebrow: 'An impressive collection, apprentice.'"* (11+/12 cards) or *"Rommene husker deg — det som ennå mangler, kan finnes en annen natt."* / *"The rooms remember you — what is still missing can be found another night."*

Fixed line: «…Og skulle du savne magien i dagslys: Kabinettet finnes på dagtid også. Da heter det **Tryllemuseet**, og det står på Årvoll gård.» / "'… And should you miss the magic in daylight: the Cabinet exists in the daytime too. Then it is called **Tryllemuseet**, and it stands at Årvoll gård.'"

Buttons: **"Løft forhenget — Akt II venter →"** / **"Lift the curtain — Act II awaits →"** · download poster · visit-museum link · view deck.

---

### 5.6 Galleriet som endrer seg — The Gallery That Changes *(illusion interlude — change blindness)*

**Intro:**
> NB: «Speilgangen har fått nye vegger siden sist: et galleri av malerier i tunge gullrammer. «Velkommen tilbake dit du ikke skal løse noe,» sier Direktøren. «Bare se. Se så godt du kan — og stol ikke på at det holder.»»
> EN: "The Mirror Passage has new walls tonight: a gallery of paintings in heavy gilded frames. 'Welcome back to where nothing needs solving,' says the Director. 'Just look. Look as closely as you can — and do not trust that to be enough.'"

**Mechanic:** six paintings hang on the wall (*"Seks malerier henger på veggen. Se nøye på hvert av dem — så nøye du klarer."* / "Six paintings hang on the wall. Look closely at each of them — as closely as you can."). The six paintings, each with two possible "states":

| Title (NO/EN) | State A | State B |
|---|---|---|
| Skip i storm / Ship in a Storm | 🚢 steamship on a raging sea | ⛵ small sailboat on a raging sea |
| Kurv med frukt / Basket of Fruit | 🍎 red apple at the top | 🍐 green pear at the top |
| Husdyret / The Pet | 🐈‍⬛ black cat, sleeping | 🐕 little dog, sleeping |
| Natt over Årvoll / Night over Årvoll | 🌕 full moon | 🌙 crescent moon |
| Blomster i vase / Flowers in a Vase | 🌹 red roses | 🌷 red tulips |
| Direktørens hodeplagg / The Director's Hat | 🎩 tall black top hat | 👒 wide-brimmed summer hat |

1. Player clicks **"Jeg har sett nok — blunk 👁️"** / **"I've seen enough — blink 👁️"**. A "blink" overlay flashes; one random painting silently swaps to its alternate state. Message: *"Noe på veggen er ikke som det var. Trykk på maleriet som endret seg — eller blunk igjen om du trenger å sammenligne."* / *"Something on the wall is not as it was. Press the painting that changed — or blink again if you need to compare."* (Blinking again toggles the changed painting back and forth for comparison.)
2. Guessing correctly: *"Riktig — «{title}» byttet motiv rett foran øynene dine. Og de fleste netter går det ingen opp i."* / *"Right — '{title}' swapped its motif right before your eyes. And most nights, nobody notices."* Wrong: *"«{title}» henger som det alltid har hengt. Blunk igjen og sammenlign."* / *"'{title}' hangs as it has always hung. Blink again and compare."* After 2 wrong guesses, **"Gi meg svaret 🎭"** / **"Give me the answer 🎭"** appears. Giving up: *"Direktøren peker på «{title}». «Du så på det, lærling. To ganger. Det er hele poenget.»"* / *"The Director points at '{title}'. 'You looked at it, apprentice. Twice. That is the whole point.'"*

**Facts:** fenomenet kalles endringsblindhet: selv store endringer rett foran øynene dine kan forsvinne helt når de skjer i et blunk eller bak en kort forstyrrelse. Hjernen lagrer en grov skisse — ikke bildet. *(→ Change blindness, Wikipedia)*

**Cards:** 3♦ only.

---

### 5.7 Biblioteket — The Library *(Renaissance — the Fours)* — match woodcuts to secrets

**Intro:**
> NB: «Rommet er en katedral av bokrygger, og støvet står som røkelse i lyset fra én eneste lampe. På lesepulten ligger en bok slått opp, trykt i 1584. «Her,» sier Direktøren, «skjedde det farligste som kan skje et triks: noen skrev det ned.»»
> EN: "The room is a cathedral of book spines, and the dust hangs like incense in the light of a single lamp. On the reading desk lies a book, open, printed in 1584. 'Here,' says the Director, 'happened the most dangerous thing that can happen to a trick: someone wrote it down.'"

**Path choice:** Lærlingens vei — *"Bokens forklaringer står med rene ord"* / *"The book's explanations are written in plain words"*; Mesterens vei — *"Boken snakker i gåter — løser du alt uten hint, gylles sparkortet ditt"* / *"The book speaks in riddles — solve it all without hints and your spade card is gilded"*.

**Mechanic:** *"Fire tresnitt er revet løs fra boken, og fire forklaringer står igjen på siden. **Sett hvert tresnitt sammen med hemmeligheten det avslører:** trykk på et tresnitt, så på en forklaring."* / *"Four woodcuts have been torn loose from the book, and four explanations remain on the page. **Match each woodcut with the secret it reveals:** press a woodcut, then an explanation."* The four pairs:

| Woodcut | Lærling explanation (NO) | Lærling (EN) | Mester (NO) | Mester (EN) |
|---|---|---|---|---|
| 🗡️ Kniven gjennom armen / The knife through the arm | Bladet glir inn i skaftet — kniven var aldri hel. | The blade slides into the handle — the knife was never whole. | Stålet viker hjem dit det kom fra. | The steel retreats home to where it came from. |
| 🍽️ Hodet på fatet / The head on the platter | Bordet har to hull — og plass til to gutter. | The table has two holes — and room for two boys. | Fatet er ærlig. Møbelet lyver. | The platter is honest. The furniture lies. |
| 🪙 Mynten som forsvinner / The vanishing coin | Mynten forlater aldri hånden — den hviler skjult i grepet. | The coin never leaves the hand — it rests hidden in the grip. | Det som forsvant, har aldri reist. | What vanished never travelled. |
| 🪢 Snoren som deles og heles / The rope cut and restored | En ekstra bit snor byttes inn — det er den som ofres for kniven. | An extra piece of rope is switched in — that is the piece sacrificed to the knife. | Den som ofres, er ikke den du så. | The one sacrificed is not the one you saw. |

Correct match: *"Riktig — tresnittet legger seg til ro på siden sin."* / *"Right — the woodcut settles onto its page."* Wrong: *"Boken blafrer irritert med sidene. Det paret hører ikke sammen."* / *"The book flutters its pages in irritation. That pair does not belong together."*

**Hints:**
1. *"Begynn med hodet på fatet: hva slags møbel trenger det trikset?"* / *"Start with the head on the platter: what kind of furniture does that trick need?"*
2. *"En kniv som ikke skader, er en kniv som ikke er hel."* / *"A knife that does no harm is a knife that is not whole."*
3. *"Snoren som ble hel igjen, var aldri den som ble klippet."* / *"The rope that was made whole again was never the one that was cut."*

**Principle:** «**En nedskrevet hemmelighet er en bevæpnet hemmelighet**, lærling. Scot skrev for å redde liv fra bålet — og bevæpnet i samme åndedrag fire hundre år med tryllekunstnere. Boken du nettopp bladde i, er stammor til alle tryllebøker.»

**Curiosity:** a bookworm 🐛, *"En liten bokorm titter frem mellom to bind"* / *"A little bookworm peeks out between two volumes"*.

**Facts:**
- Reginald Scots «The Discoverie of Witchcraft» (1584) regnes som den første trykte boken som forklarer tryllekunster i detalj — skrevet for å forsvare mennesker som var anklaget for trolldom. *(→ Wikipedia)*
- Samme år, 1584, kom også franskmannen Jean Prévosts bok om «subtile og fornøyelige oppfinnelser» — den eldste kjente boken viet utelukkende tryllekunst. *(→ /ressurser/bibliotek)*

**Cards:** 4♠ (solve, gildable) · 4♣ (bookworm) · 4♥ (completion).

---

### 5.8 Øyet som lyver — The Eye That Lies *(illusion interlude — optical illusions)*

**Intro:**
> NB: «Speilgangen smalner, og på veggene henger ikke speil lenger, men plansjer og instrumenter. «Nå skal du få se med dine egne øyne,» sier Direktøren. «Det er nettopp det som er problemet.»»
> EN: "The Mirror Passage narrows, and the walls no longer hold mirrors, but charts and instruments. 'Now you shall see with your own eyes,' says the Director. 'That is precisely the problem.'"

**Mechanic — two acts, no fail state, both "wrong" answers just get corrected:**

- **Act 1 — Müller-Lyer illusion.** *"Første plansje: to linjer. **Hvilken er lengst?**"* / *"First chart: two lines. **Which is longest?**"* Two equal lines, one with outward arrowheads, one inward. Options: top / bottom / **"they are the same length"** (correct). Any answer reveals a measuring overlay: if correct, *"Riktig — de er nøyaktig like lange. Men se på dem: ser de like ut? Ikke i det hele tatt."* / *"Right — they are exactly the same length. But look at them: do they look the same? Not at all."*; if wrong, *"De er nøyaktig like lange — mål selv langs de røde strekene. Pilene i endene bestemmer hva hjernen din ser."* / *"They are exactly the same length — measure along the red lines yourself. The arrowheads at the ends decide what your brain sees."*
- **Act 2 — Ebbinghaus illusion.** *"Andre plansje: to oransje sirkler. **Hvilken er størst?**"* / *"Second chart: two orange circles. **Which is biggest?**"* Two equal circles, one ringed by large grey circles, one by small ones. Options: left / right / **"they are the same size"** (correct). Correct: *"Riktig — nøyaktig like store. Men den høyre ser fortsatt størst ut, gjør den ikke?"* / *"Right — exactly the same size. But the right one still looks bigger, doesn't it?"* Wrong: *"De er nøyaktig like store — selskapet rundt bestemmer hvor store de ser ut."* / *"They are exactly the same size — the company around them decides how big they look."*

Closing text: *"Begge plansjene er ærlige — det er øynene dine som ikke er det. Selv nå, når du *vet* at linjene er like lange og sirklene like store, klarer ikke hjernen å se det. «Husk dette,» sier Direktøren. «Publikum tror de ser med øynene. De ser med vanene sine.»"*

**Facts:** synsbedrag oppstår ikke i øyet, men i hjernen: den tolker alt du ser ut fra erfaring — og lar seg ikke overstyre selv når du vet fasiten. *(→ Müller-Lyer illusion, Wikipedia)*

**Cards:** 4♦ only.

---

### 5.9 Salongen — The Salon *(the automata — the Fives)* — deduce the Chess Turk's secret

**Intro:**
> NB: «En salong fra en annen tid: silketapet, kandelabre — og midt i rommet en skikkelse i turban bak et sjakkbrett, montert på et skap av lakkert tre. Det tikker. «Maskinen som tenker,» sier Direktøren tørt. «Eller: det var det folk betalte for å tro.»»
> EN: "A salon from another age: silk wallpaper, candelabras — and in the middle of the room, a turbaned figure behind a chessboard, mounted on a cabinet of lacquered wood. It ticks. 'The machine that thinks,' says the Director drily. 'Or rather: that is what people paid to believe.'"

**Path choice:** Lærlingens vei — *"Direktøren hvisker et spørsmål som hjelper deg å tenke"* / *"The Director whispers a question that helps you think"*; Mesterens vei — *"Bare observasjonene — løser du gåten uten hint, gylles sparkortet ditt"* / *"Only the observations — solve the riddle without hints and your spade card is gilded"*.

**Mechanic:** three observations are revealed one at a time (*"Tyrkeren spiller parti etter parti — og slår alle. Direktøren lar deg se tre forestillinger på rad. Observasjonene dine:"* / "The Turk plays game after game — and beats everyone. The Director lets you watch three performances in a row. Your observations:"):

1. *"Fremviseren åpner skapet dør for dør — aldri alle dørene på én gang."* / *"The presenter opens the cabinet door by door — never all the doors at once."*
2. *"Midt i partiet hører du et lite host. Det kom ikke fra publikum."* / *"In the middle of a game you hear a small cough. It did not come from the audience."*
3. *"Tyrkeren spiller strålende — men gjør slurvefeil i kveldens siste parti, som om noen begynner å bli trett."* / *"The Turk plays brilliantly — but makes careless mistakes in the evening's final game, as if someone were getting tired."*

Lærling path only sees a 4th line: *"Direktøren hvisker: «Spør deg selv hva hemmeligheten trenger. Plass. Luft. Og pauser.»"* / *"The Director whispers: 'Ask yourself what the secret needs. Space. Air. And breaks.'"*

Four choices, one correct:
- Et urverk avansert nok til å spille sjakk / A clockwork advanced enough to play chess → *"«Et urverk hoster ikke, lærling — og blir ikke trett.» Prøv igjen."* / *"'A clockwork does not cough, apprentice — and does not get tired.' Try again."*
- Magneter under gulvet styrer brikkene / Magnets under the floor control the pieces → *"«Magneter flytter brikker, kanskje. Men velger de trekk?» Prøv igjen."* / *"'Magnets may move pieces. But do they choose moves?' Try again."*
- **Det sitter et menneske gjemt i skapet / A person sits hidden in the cabinet** — correct.
- Fremviseren trekker i usynlige tråder / The presenter pulls invisible threads → *"«Fremviseren sto ti skritt unna med hendene bak ryggen.» Prøv igjen."* / *"'The presenter stood ten paces away with his hands behind his back.' Try again."*

Correct: *"Direktøren banker to ganger på skapet — og innenfra banker det tilbake. «God kveld, mester Schlumberger. Partiet er over.»"* / *"The Director knocks twice on the cabinet — and from inside comes a knock in reply. 'Good evening, master Schlumberger. The game is over.'"*

**Hints:**
1. *"Hva gjør mennesker som maskiner aldri gjør?"* / *"What do humans do that machines never do?"*
2. *"Dørene åpnes én og én. Hvorfor ikke alle samtidig?"* / *"The doors are opened one by one. Why not all at once?"*
3. *"Det er plass til mer enn tannhjul i det skapet."* / *"There is room for more than cogwheels in that cabinet."*

**Principle:** «**Teknologi utkledd som magi**, lærling. Publikum stirret på tannhjulene — og tannhjulene var kostymet. Det eneste maskinen aldri kunne gjøre, var det eneste den måtte: tenke. Så tenkte noen for den.»

**Curiosity:** a cogwheel ⚙️, *"Et lite messingtannhjul ligger gjenglemt på teppet"* / *"A small brass cogwheel lies forgotten on the carpet"*.

**Facts:**
- Wolfgang von Kempelens «sjakktyrker» (1770) forbløffet Europa i over 60 år og spilte mot både Napoleon og Benjamin Franklin — med en menneskelig sjakkspiller skjult i skapet. *(→ Mechanical Turk, Wikipedia)*
- Urmakeren Jean-Eugène Robert-Houdin, «den moderne tryllekunstens far», fylte 1800-tallets salonger med automater — og en ung amerikaner tok senere navn etter ham: Houdini. *(→ /tryllehistorie)*

**Cards:** 5♠ (solve, gildable) · 5♣ (cogwheel) · 5♥ (completion).

---

### 5.10 Seansen — The Séance *(spiritualism — the Sixes)* — spot the medium's methods

**Intro:**
> NB: «Et rundt bord, sju stoler, gasslampen skrudd ned til en hvisken. Mediet sitter allerede klar med lukkede øyne. «Sett deg, lærling,» sier Direktøren fra mørket. «I dette rommet gjør troen halve trikset. Din jobb er å se hvem som gjør resten.»»
> EN: "A round table, seven chairs, the gas lamp turned down to a whisper. The medium is already seated, eyes closed. 'Sit down, apprentice,' says the Director from the dark. 'In this room, belief does half the trick. Your job is to see who does the rest.'"

**Path choice:** Lærlingens vei — *"Direktøren forteller deg hva du skal se etter — og hvor nære du er"* / *"The Director tells you what to look for — and how close you are"*; Mesterens vei — *"Du får bare seansen — løser du gåten uten hint, gylles sparkortet ditt"* / *"You get only the séance — solve the riddle without hints and your spade card is gilded"*.

**Mechanic:** *"Seansen tar til. Åtte ting skjer rundt bordet — **tre av dem er mediets metoder**, resten er undre og teater. Merk av de tre metodene:"* / *"The séance begins. Eight things happen around the table — **three of them are the medium's methods**, the rest are wonders and theatre. Mark the three methods:"* Eight checkboxable events (★ = one of the three correct methods):

1. ★ Mediet krever stummende mørke: «åndene skyr lyset». / The medium demands pitch darkness: "the spirits shun the light".
2. Bordet vipper og løfter det ene beinet fra gulvet. / The table tips and lifts one leg off the floor.
3. ★ Mediet rykker nærmere bordet og ber begge naboene holde ekstra godt fast i hendene sine. / The medium edges closer to the table and asks both neighbours to hold on extra tightly to her hands.
4. En trompet svever gjennom mørket og spiller en skjelvende tone. / A trumpet floats through the darkness and plays a trembling note.
5. ★ Tidligere på kvelden pratet mediets assistent lenge og vennlig med hver eneste gjest i entreen. / Earlier in the evening, the medium's assistant chatted long and warmly with every single guest in the hallway.
6. Mediet faller i transe og snakker med en fremmed, dyp stemme. / The medium falls into a trance and speaks in a strange, deep voice.
7. Det banker i bordplaten: ett bank for ja, to for nei. / Knocks sound in the tabletop: one knock for yes, two for no.
8. Ånden vet navnet på tante Agnes og hilser kjærlig fra henne. / The spirit knows Aunt Agnes's name and sends her loving regards.

**"Avslør mediet 🔍" / "Expose the medium 🔍":**
- Not exactly 3 checked: *"Mediet har nøyaktig tre metoder i sving. Merk av tre — verken flere eller færre."* / *"The medium has exactly three methods at work. Mark three — no more, no fewer."*
- 3 checked, not all correct: Lærling sees a hit count (*"{correct} av tre treff. Husk: metodene skjer før og rundt undrene — ikke i dem."* / *"{correct} of three hits. Remember: the methods happen before and around the wonders — not in them."*); Mester sees only *"«Åndene ler av deg,» sier Direktøren tørt. Prøv igjen."* / *"'The spirits are laughing at you,' says the Director drily. Try again."*
- All 3 correct: *"Lyset skrus opp. Mediet ser på deg lenge — og bukker så, langsomt, som for en kollega."* / *"The lights come up. The medium looks at you for a long time — and then bows, slowly, as to a colleague."*

**Hints:**
1. *"Ikke se på undrene. Se på det som gjorde undrene mulige."* / *"Don't look at the wonders. Look at what made the wonders possible."*
2. *"Hva ba mediet om — før noe som helst begynte å skje?"* / *"What did the medium ask for — before anything at all began to happen?"*
3. *"Mørket. Hendene. Og samtalen i entreen."* / *"The darkness. The hands. And the conversation in the hallway."*

**Principle:** «**Troen gjør halve trikset**, lærling. Mørket, den frie hånden og den pratsomme assistenten gjorde resten. Og la du merke til én ting til? Åndene visste aldri noe som ikke gjestene visste fra før.»

**Curiosity:** a bell 🔔, *"En liten klokke er festet under bordkanten"* / *"A small bell is attached under the table edge"*.

**Facts:**
- Den moderne spiritismen startet i 1848 med søstrene Fox i USA, som lot «åndene» banke svar i bordet — mange år senere tilsto Margaret Fox at lydene ble laget med tå- og kneledd. *(→ Fox sisters, Wikipedia)*
- Harry Houdini brukte sine siste år på å avsløre falske medier — han kjente alle metodene deres fra scenen selv. *(→ /tryllehistorie/magiens-hvem-er-hvem)*

**Cards:** 6♠ (solve, gildable) · 6♣ (bell) · 6♥ (completion).

---

### 5.11 Epilog (Act II) — "Trappen videre" / "The Staircase Onward"

**Intro:**
> NB: «Direktøren venter ved foten av en trapp som skrur seg opp i mørket. Ovenfra: lyden av et teater som gjør seg klart — tau som strammes, en kiste som låses. «Seks rom, lærling. Sju igjen. Men daggryet kommer, og teateret får vente til en annen natt.»»
> EN: "The Director waits at the foot of a staircase spiralling up into the dark. From above: the sound of a theatre making ready — ropes being tightened, a trunk being locked. 'Six rooms, apprentice. Seven to go. But dawn is coming, and the theatre must wait for another night.'"

**Dynamic summary:** *"Etter to netter i Kabinettet har du {n} av 24 kort i kortstokken"* / *"After two nights in the Cabinet you have {n} of 24 cards in your deck"*, plus gilding note, then either *"Direktøren nikker langsomt: «En samler. Det lover godt for det trettende rommet.»"* / *"The Director nods slowly: 'A collector. That bodes well for the thirteenth room.'"* (22+/24) or the shared *"Rommene husker deg — det som ennå mangler, kan finnes en annen natt."* / *"The rooms remember you — what is still missing can be found another night."*

Fixed line: «Og husk, lærling: alt du har sett i natt, står i glassmontere når solen er oppe. Kabinettet heter **Tryllemuseet** om dagen.»

Buttons: **"Opp trappen — Akt III venter →"** / **"Up the stairs — Act III awaits →"** · poster · visit link · deck.

---

### 5.12 Det frie valget — The Free Choice *(illusion interlude — equivoque / "magician's choice")*

**Intro:**
> NB: «Øverst i trappen: et lite kammer med et bord, tre gjenstander — og en forseglet konvolutt. «Spådommen der inne ble skrevet før du kom inn i huset,» sier Direktøren. «Nå skal du velge. Helt fritt. Det er det som er det vakre.»»
> EN: "At the top of the stairs: a small chamber with a table, three objects — and a sealed envelope. 'The prediction in there was written before you entered the house,' says the Director. 'Now you will choose. Completely freely. That is the beautiful part.'"

Envelope teaser: *"✉️ «Spådom — skrevet i går kveld»"* / *"✉️ 'A prediction — written last night'"*

**Mechanic — the three objects:** 🏮 Lykten/The lantern, 🪞 Speilet/The mirror, 🃏 Kortstokken/The deck of cards. The secret target is always **the mirror** — the equivoque is rigged so the player always ends up "keeping" it, no matter what they pick.

1. *"Tre gjenstander står på bordet. **Pek på to av dem** — helt fritt."* / *"Three objects stand on the table. **Point at two of them** — completely freely."* Player points at two.
   - **If the mirror is in that pair:** *"Du pekte på {item1} og {item2}. «De to beholder vi,» sier Direktøren — og rydder bort {other}."* / *"You pointed at {item1} and {item2}. 'Those two we keep,' says the Director — and clears away {other}."* → advances to a second round: *"To gjenstander igjen. **Pek på én av dem** — fortsatt helt fritt."* / *"Two objects left. **Point at one of them** — still entirely freely."*
     - Point at the mirror: *"Du pekte på speilet. «Det beholder du,» sier Direktøren — og rydder bort det siste."* / *"You pointed at the mirror. 'That one you keep,' says the Director — and clears away the last one."*
     - Point at the other: *"Du pekte på {item}. «Det rydder vi bort,» sier Direktøren."* / *"You pointed at {item}. 'That one we clear away,' says the Director."*
   - **If the mirror is NOT in the first pair:** *"Du pekte på {item1} og {item2}. «De to rydder vi bort,» sier Direktøren."* / *"You pointed at {item1} and {item2}. 'Those two we clear away,' says the Director."* — resolves immediately (the untouched item is, by construction, the mirror).
2. Either path always ends with only the mirror remaining: *"Én gjenstand står igjen på bordet: speilet."* / *"One object remains on the table: the mirror."* The envelope opens: *"✉️ Direktøren bryter seglet og leser høyt: «Lærlingen velger fritt — og ender med speilet. Slik måtte det gå.»"* / *"✉️ The Director breaks the seal and reads aloud: 'The apprentice chooses freely — and ends up with the mirror. It had to go this way.'"* Verdict: *"Spådommen stemmer. Selvfølgelig gjør den det."* / *"The prediction is correct. Of course it is."*
3. **"Vent litt — vis kvitteringene 🧾"** / **"Wait a moment — show the receipts 🧾"** reveals the log of "interpreted as keep/remove" decisions plus the explanation: *"Valgene dine var ekte — men **hva de skulle bety, ble bestemt etterpå.** Pekte du på speilet, «beholdt» du det. Pekte du på noe annet, «ryddet» Direktøren det bort. Alle veier endte ved speilet; du gikk bare én av dem."* / *"Your choices were real — but **what they were to mean was decided afterwards.** If you pointed at the mirror, you 'kept' it. If you pointed at something else, the Director 'cleared it away'. All paths ended at the mirror; you just walked one of them."*

**Facts:** teknikken kalles «magician's choice» (equivoque) og har vært brukt i århundrer: valget ditt er ekte — men hva valget skal bety, bestemmes først etterpå.

**Cards:** 5♦ only.

---

### 5.13 Teateret — The Theatre *(golden age of varieté — the Sevens)* — escape from a locked trunk

**Intro:**
> NB: «Et varietéteater i full mørklagt prakt: fløyel, gasslamper, plakater med sterke menn og svevende damer. På scenen står en kiste med åpne lokk. «Utbryterkunstens gullalder,» sier Direktøren — og før du rekker å svare, har to sceneknekter løftet deg oppi. Lokket smeller. Hengelåsen klikker. Applaus.»
> EN: "A variety theatre in full darkened splendour: velvet, gas lamps, posters of strongmen and floating ladies. On the stage stands a trunk with its lid open. 'The golden age of escape artistry,' says the Director — and before you can answer, two stagehands have lifted you in. The lid slams. The padlock clicks. Applause."

**Path choice:** Lærlingens vei — *"Direktørens stemme følger deg inn i mørket"* / *"The Director's voice follows you into the darkness"*; Mesterens vei — *"Bare deg og kisten — løser du gåten uten hint, gylles sparkortet ditt"* / *"Just you and the trunk — solve the riddle without hints and your spade card is gilded"*.

**Mechanic:** *"Det er trangt, mørkt og varmt. Publikum teller høyt der ute. **Hva gjør du — og i hvilken rekkefølge?**"* / *"It's cramped, dark and hot. The audience counts aloud out there. **What do you do — and in what order?**"* Six actions available, three decoys and a required 3-step sequence:

- **Decoys** (always wrong): Dytt lokket med all kraft/Push the lid with all your strength (*"Låst utenfra — selvsagt. Hele salen så hengelåsen klikke."*/"Locked from the outside — of course. The whole house saw the padlock click."); Rop om hjelp/Shout for help (*"Orkesteret spiller bare høyere. Ingen redder en utbryter."*/"The orchestra just plays louder. Nobody rescues an escape artist."); Bank SOS i bunnplaten/Knock SOS on the bottom board (*"Morse imponerer ingen når du er alene om å høre det."*/"Morse impresses nobody when you are the only one who hears it.")
- **Step 1:** Kjenn langs sømmen i kistens kortside / Feel along the seam in the trunk's short side → *"Fingrene finner en forsenket knott i sømmen — en som ikke synes fra salen."* / *"Your fingers find a recessed catch in the seam — one that cannot be seen from the house."*
- **Step 2:** Vri knotten en halv omdreining / Turn the catch half a turn → *"Noe gir etter med et mykt klikk: sidepanelet er løst."* / *"Something gives way with a soft click: the side panel is loose."*
- **Step 3 (wins):** Skyv panelet til side og smyg deg ut / Slide the panel aside and slip out → *"Panelet glir til side. Du ruller ut i kulissene, bak kisten — usett."* / *"The panel slides aside. You roll out into the wings, behind the trunk — unseen."*

Trying step 2/3 out of order: *"Hvilken knott? Du famler i blinde mot glatt treverk."* / *"What catch? You fumble blindly against smooth wood."* or *"Panelet sitter bom fast. Noe må løsne først."* / *"The panel is stuck fast. Something must come loose first."* Decoys always log: *"Publikum teller videre. Prøv noe annet."* / *"The audience keep counting. Try something else."*

**Hints:**
1. *"Effekten selges i kveld — metoden ble kjøpt i går, i verkstedet."* / *"The effect is sold tonight — the method was bought yesterday, in the workshop."*
2. *"Ikke lokket. Publikum ser lokket. Tenk på det de ikke ser."* / *"Not the lid. The audience see the lid. Think of what they don't see."*
3. *"Kortsiden. Sømmen. En knott som ikke synes fra salen."* / *"The short side. The seam. A catch that cannot be seen from the house."*

**Principle:** «Du ruller ut bak kisten idet publikum når null. **Metoden ble kjøpt lenge før effekten ble solgt**, lærling: knotten satt der før teppet gikk opp. Utbryteren rømmer aldri fra kisten — han rømmer fra i går.»

**Curiosity:** a theatre ticket 🎟️, *"En gammel teaterbillett stikker frem av kistens fôr"* / *"An old theatre ticket sticks out of the trunk's lining"*.

**Facts:**
- Harry Houdini og kona Bess slo gjennom med «Metamorfose» på 1890-tallet: de byttet plass i en låst kiste — på sekunder. *(→ /tryllehistorie/magiens-hvem-er-hvem)*
- Utbrytere sjelden «brøt seg ut» av noe de ikke kjente: utfordringskister og -jern ble som regel undersøkt, preparert eller valgt med omhu lenge før forestillingen.

**Cards:** 7♠ (solve, gildable) · 7♣ (ticket) · 7♥ (completion).

---

### 5.14 Kinoen — The Cinema *(Méliès — the Eights)* — reorder film strips + spot the cut

**Intro:**
> NB: «En sal med plysjseter og et lerret som flimrer hvitt. Bak deg surrer en prosjektor av messing. «Georges Méliès var tryllekunstner før han ble filmpioner,» sier Direktøren. «Han oppdaget at kameraet kunne gjøre det ingen scene kunne. Men filmen hans har falt fra hverandre — sett den sammen igjen.»»
> EN: "A hall of plush seats and a screen flickering white. Behind you hums a projector of brass. 'Georges Méliès was a magician before he became a film pioneer,' says the Director. 'He discovered that the camera could do what no stage could. But his film has fallen apart — put it back together.'"

**Path choice:** Lærlingens vei — *"Direktøren minner deg om hvordan historien skal henge sammen"* / *"The Director reminds you how the story should hang together"*; Mesterens vei — *"Bare filmbitene — løser du gåten uten hint, gylles sparkortet ditt"* / *"Just the film strips — solve the riddle without hints and your spade card is gilded"*.

**Mechanic, phase 1 — reorder five shuffled strips into story order:** *"Fem filmbiter ligger hulter til bulter. **Trykk på dem i riktig rekkefølge** — fra første til siste bilde."* / *"Five film strips lie scattered every which way. **Press them in the correct order** — from first to last frame."* Correct order:

1. Damen tar plass i stolen / The lady takes her seat in the chair
2. Kledet bres over henne / The cloth is spread over her
3. Kledet rives bort — stolen er tom / The cloth is whipped away — the chair is empty
4. Magikeren maner — et skjelett sitter i stolen! / The magician conjures — a skeleton sits in the chair!
5. Damen er tilbake, og bukker mot salen / The lady is back, and bows to the house

Correct pick: *"Riktig — filmen vokser."* / *"Right — the film is growing."* Wrong pick: *"Prosjektoren hakker: den biten hører ikke hjemme der."* / *"The projector stutters: that strip does not belong there."*

**Phase 2 — find the stop-trick cut:** *"Filmen løper: damen forsvinner — og salen gisper. Men Direktøren lener seg frem: **«Hvor stanset kameraet første gang?»**"* / *"The film runs: the lady vanishes — and the house gasps. But the Director leans forward: **'Where did the camera stop for the first time?'**"* Four gap options ("Mellom 1 og 2" … "Mellom 4 og 5" / "Between 1 and 2" … "Between 4 and 5"); correct = between frames 2 and 3.

- Correct: *"Riktig: kledet lå over stolen, kameraet stanset — og damen gikk rolig ut av bildet."* / *"Right: the cloth lay over the chair, the camera stopped — and the lady calmly walked out of frame."*
- Wrong: *"Direktøren rister på hodet: «Der skjer det noe i bildet. Klippet gjemmer seg der ingenting ser ut til å skje.»"* / *"The Director shakes his head: 'Something happens in the frame there. The cut hides where nothing seems to happen.'"*

**Hints:**
1. *"Historien er enkel: en dame, et klede, en stol. Begynn der."* / *"The story is simple: a lady, a cloth, a chair. Start there."*
2. *"Det umulige skjer aldri mens du ser det. Det skjer mellom to bilder."* / *"The impossible never happens while you watch it. It happens between two frames."*
3. *"Kameraet stanset første gang i det kledet lå over stolen."* / *"The camera stopped the first time while the cloth lay over the chair."*

**Principle:** «**Klippet er forsvinningsnummeret**, lærling. Det umulige skjer aldri mens du ser på — det skjer mellom to bilder, der kameraet sto stille og verden fikk ordne seg. Méliès skjønte det før noen andre: filmen er en tryllekunstner som aldri blir avslørt av første rad.»

**Curiosity:** a film scrap 🎞️, *"En avklippet filmbit ligger på gulvet"* / *"A cut-off film scrap lies on the floor"*.

**Facts:**
- Georges Méliès var sceneillusjonist og drev Théâtre Robert-Houdin i Paris før han ble en av filmkunstens pionerer. *(→ Wikipedia)*
- I «Escamotage d'une dame» (1896) lot Méliès en dame forsvinne med stopptrikset — oppdaget ved en tilfeldighet, da kameraet hans kilte seg midt i et gateopptak. *(→ /tryllehistorie/historiske-opptak)*

**Cards:** 8♠ (solve, gildable) · 8♣ (film scrap) · 8♥ (completion).

---

### 5.15 Ånden på lerretet — The Ghost on the Canvas *(illusion interlude — afterimage, real 12-second timer)*

**Intro:**
> NB: «Speilgangen ender i et kammer med ett eneste, tomt lerret. «Siste akt i kveldens forestilling,» sier Direktøren. «Nå skal øynene dine mane frem et bilde som ikke finnes. Ikke tro meg — se selv.»»
> EN: "The Mirror Passage ends in a chamber with a single, empty canvas. 'The final act of tonight's performance,' says the Director. 'Now your eyes will conjure up a picture that does not exist. Don't take my word for it — see for yourself.'"

**Mechanic — this is the one room where the timer is deliberately real and not shortened for reduced motion**, since it's eye physiology, not decoration. Instruction: *"Når lampen tennes: **stirr på den hvite prikken i midten** uten å flytte blikket, helt til lyset slukker."* / *"When the lamp lights: **stare at the white dot in the middle** without moving your gaze, until the light goes out."*

1. **"Tenn lampen 🕯️"** / **"Light the lamp 🕯️"** — a bright pink/magenta shape with a white center dot appears for a full **12-second** countdown (*"Stirr på den hvite prikken … {s}"* / *"Stare at the white dot … {s}"*).
2. Lamp goes out: *"Lampen slukker. Se på det tomme lerretet — hva ser du?"* / *"The lamp goes out. Look at the empty canvas — what do you see?"* Two options:
   - **"Jeg ser det — et blekt gjenferd! 👻"** / **"I see it — a pale ghost! 👻"**
   - **"Jeg ser ingenting"** / **"I see nothing"** — first click re-encourages a retry: *"Direktøren: «Tenn lampen igjen — og hold blikket helt, helt stille på prikken.»"* / *"The Director: 'Light the lamp again — and keep your gaze completely, completely still on the dot.'"*; second click ends the exercise anyway.
3. A **"Fortell meg hva jeg ville sett"** / **"Tell me what I would have seen"** skip option is always available.
4. Resolution — if they saw it: *"Direktøren smiler i mørket. «Der. Kabinettets billigste spøkelse — og det bor i deg.»"* / *"The Director smiles in the dark. 'There. The Cabinet's cheapest ghost — and it lives in you.'"* If not: *"Direktøren nikker. «Noen øyne er mer lettlurte enn andre. Her er det du ville sett:»"* / *"The Director nods. 'Some eyes are more easily fooled than others. Here is what you would have seen:'"*
5. Explanation: *"Gjenferdet på lerretet er **ditt eget syn som dikter**: synscellene som stirret på det rosa lyset er «slitne», og når lyset forsvinner, svarer de med komplementærfargen — et blekgrønt etterbilde av lykten, på et lerret som hele tiden var tomt. «Husk det,» sier Direktøren. «Publikum trenger ikke se noe for å se noe.»"*

**Facts:** etterbilder oppstår fordi synscellene «slites» når du stirrer lenge på noe sterkt farget — etterpå serverer hjernen deg et gjenferd i komplementærfargen, på helt tomme flater. *(→ Afterimage, Wikipedia)*

**Cards:** 6♦ only. Cannot be "failed" — both outcomes award the card.

---

### 5.16 Verkstedet — The Workshop *(illusion builders — the Nines)* — pick the right blueprint parts

**Intro:**
> NB: «Sagflis, blåkopier og halvbygde mirakler: et bord med falluker, et speil i vinkel, en kiste med dobbel bunn. «Her tegnes effekten baklengs,» sier Direktøren, «fra salens stol og innover. På bordet ligger en bestilling — og seks deler. Bare tre av dem hører hjemme i illusjonen.»»
> EN: "Sawdust, blueprints and half-built miracles: a table with trapdoors, an angled mirror, a chest with a false bottom. 'Here, the effect is drawn backwards,' says the Director, 'from the seats of the house inwards. On the table lies a commission — and six parts. Only three of them belong in the illusion.'"

**Path choice:** Lærlingens vei — *"Delene er merket med byggmesterens rene ord"* / *"The parts are labeled in the builder's plain words"*; Mesterens vei — *"Bare verkstedets stikkord — løser du gåten uten hint, gylles sparkortet ditt"* / *"Just the workshop's keywords — solve the riddle without hints and your spade card is gilded"*.

**The commission:** *"Bestilling: «Den svevende damen». Damen svever midt på åpen scene. En ring føres langs hele kroppen hennes. Salen ser henne hele tiden."* ("Commission: 'The Floating Lady'. The lady floats in the middle of the open stage. A hoop is passed along her entire body. The house sees her the entire time.")

**Mechanic:** *"Seks deler ligger på bordet — **bare tre hører hjemme i illusjonen.** Velg dem, og bygg."* / *"Six parts lie on the table — **only three belong in the illusion.** Choose them, and build."* Six checkboxes (✅ correct, ❌ decoy), shown with plain (Lærling) or cryptic (Mester) labels:

| Correct? | Lærling label | Mester label |
|---|---|---|
| ✅ | En s-formet stålarm («svanehals») fra en søyle bak sceneteppet / An S-shaped steel arm (a "gooseneck") from a column behind the stage curtain | Stål som svinger seg dit ingen ser / Steel that curves where no one looks |
| ❌ | Tynne tråder fra snorloftet / Thin threads from the fly loft | Det som henger, henger i noe / What hangs, hangs from something |
| ✅ | En tung motvekt skjult under scenegulvet / A heavy counterweight hidden beneath the stage floor | Det som svever, hviler på det som ligger / What floats rests on what lies |
| ❌ | En kraftig magnet under scenen / A powerful magnet under the stage | Jernvilje under gulvplankene / An iron will beneath the floorboards |
| ✅ | Et draperi i samme farge som bakteppet, som skjuler armen / A drape in the same colour as the backdrop, concealing the arm | Fløyel mot fløyel: intet å se / Velvet against velvet: nothing to see |
| ❌ | Et vinklet speil foran damen / An angled mirror in front of the lady | Salen ser det salen bør se / The house sees what the house should see |

Each decoy is individually ruled out by one line of the commission (threads are visible with the hoop passing over; a magnet can't work with a metal hoop in play; a mirror can't work on an open stage viewed from all sides).

**"Bygg illusjonen 🔨" / "Build the illusion 🔨":**
- Not exactly 3 checked: *"Illusjonen trenger nøyaktig tre deler — verken flere eller færre."* / *"The illusion needs exactly three parts — no more, no fewer."*
- 3 checked, not all correct: Lærling — *"{correct} av tre deler stemmer med bestillingen. Sjekk kravene — ringen, den åpne scenen, blikket som aldri slipper henne."* / *"{correct} of three parts match the commission. Check the requirements — the hoop, the open stage, the gaze that never leaves her."*; Mester — *"«Bygget faller sammen på generalprøven,» sier Direktøren tørt. Prøv igjen."* / *"'The build collapses at the dress rehearsal,' says the Director drily. Try again."*
- All 3 correct: *"Delene finner hverandre som om de har ventet: armen, vekten, draperiet. På prøvescenen svever damen."* / *"The parts find each other as if they had been waiting: the arm, the weight, the drape. On the rehearsal stage, the lady floats."*

**Hints:**
1. *"Les bestillingen igjen. Hvert krav dreper én løsning."* / *"Read the commission again. Each requirement kills one solution."*
2. *"Ringen dreper trådene. «Salen ser henne hele tiden» dreper speilet — og en magnet som bærer en dame, ville låst hvert verktøy i huset."* / *"The hoop kills the threads. 'The audience see her the entire time' kills the mirror — and a magnet that could carry a lady would seize every tool in the house."*
3. *"Armen som bærer, vekten som holder, stoffet som skjuler."* / *"The arm that carries, the weight that holds, the fabric that hides."*

**Principle:** «Stålarmen bærer, motvekten holder, draperiet skjuler — og ringen glir langs den s-formede armen som om ingenting var der. **Effekten tegnes baklengs fra salens stol**, lærling: byggmesteren setter seg der publikum sitter, og fjerner alt de kan se.»

**Curiosity:** a brass screw 🔩, *"En blank messingskrue ligger i sagflisen"* / *"A shiny brass screw lies in the sawdust"*.

**Facts:**
- «Sfinksen» (London 1865) regnes som gjennombruddet for speilillusjonene: et hode på et bord uten kropp.
- «Black art»-prinsippet — svart fløyel mot svart bakgrunn i presist lys — gjør gjenstander og hjelpere usynlige på åpen scene, og brukes fortsatt i teater og film. *(→ /utstillingen)*

**Cards:** 9♠ (solve, gildable) · 9♣ (screw) · 9♥ (completion).

---

### 5.17 Epilog (Act III) — "Daggryets terskel" / "The Threshold of Dawn"

**Intro:**
> NB: «Direktøren står ved et vindu der nattemørket så vidt har begynt å gråne. «Ni rom, lærling. Fire igjen — studioet, gatehjørnet, vinterhagen … og det trettende. Men det trettende rommet åpner seg ikke for nøkler. Det åpner seg for en full kortstokk.»»
> EN: "The Director stands by a window where the dark of night has only just begun to grey. 'Nine rooms, apprentice. Four to go — the studio, the street corner, the winter garden … and the thirteenth. But the thirteenth room does not open for keys. It opens for a complete deck of cards.'"

**Dynamic summary:** *"Etter tre netter i Kabinettet har du {n} av 36 kort i kortstokken"* / *"After three nights in the Cabinet you have {n} of 36 cards in your deck"*, plus gilding note, then either *"Direktøren stryker over kortene: «Tre netter — og en nesten full stokk. Det trettende rommet har begynt å lytte.»"* / *"The Director runs a hand over the cards: 'Three nights — and a nearly full deck. The thirteenth room has begun to listen.'"* (33+/36) or the shared remember-line.

Fixed line: «Og når du savner nettene, lærling: Kabinettet står i dagslys på Årvoll gård. Der heter det **Tryllemuseet** — og dørene der trenger ingen full kortstokk.»

Buttons: **"Inn i Speilgangen — Akt IV venter →"** / **"Into the Mirror Passage — Act IV awaits →"** · poster · visit link · deck.

---

### 5.18 Minnet som dikter — The Memory That Invents *(illusion interlude — false-memory word list)*

**Intro:**
> NB: «Speilgangen er kald i natt, og på det største speilet står det skrevet ord i dugg. «Speilet vil vise deg noe om hukommelsen din,» sier Direktøren. «Les ordene. Husk dem. Og stol ikke på resten.»»
> EN: "The Mirror Passage is cold tonight, and on the largest mirror, words are written in mist. 'The mirror wants to show you something about your memory,' says the Director. 'Read the words. Remember them. And do not trust the rest.'"

**Mechanic — a classic DRM false-memory paradigm:** *"Tolv ord står skrevet i dugg. **Les dem rolig, ett for ett** — de forsvinner når du er ferdig."* → **"Vis ordene på speilet 🪞"** ("Show the words on the mirror") reveals the 12-word study list:

- **NO:** seng, pute, natt, drøm, våkne, trøtt, dyne, gjespe, hvile, mørke, snorke, kveld (bed, pillow, night, dream, wake, tired, blanket, yawn, rest, darkness, snore, evening)
- **EN:** bed, pillow, night, dream, wake, tired, blanket, yawn, rest, darkness, snore, evening

The word **"søvn" / "sleep"** never appears — every word is thematically about sleep without naming it.

After **"Jeg har lest dem — visk dem ut"** ("I have read them — wipe them away"), a quiz asks about three words one at a time: *"Sto ordet «{word}» på speilet?"* / *"Was the word '{word}' on the mirror?"* — probes are **pute/pillow** (was there, true), **søvn/sleep** (the lure — was NOT there), **lampe/lamp** (was not there). Two buttons each time: **"Ja, det sto der"** / **"Yes, it was there"** and **"Nei, det sto der ikke"** / **"No, it was not there"**.

- If the player is fooled by the lure (says "sleep" was there): *"Speilet dugger til av noe som ligner latter. «Søvn, ja,» sier Direktøren. «Alle husker søvn. Se på listen igjen.»"* / *"The mirror mists over with something like laughter. 'Sleep, yes,' says the Director. 'Everyone remembers sleep. Look at the list again.'"*
- If not fooled: *"«Du er blant de få,» sier Direktøren. «De fleste sverger på at søvn sto der. Se hvorfor:»"* / *"'You are among the few,' says the Director. 'Most people swear that sleep was there. See why:'"*
- Either way, the list re-displays with: *"Her er listen slik den faktisk sto — **ordet «søvn» var aldri med.** Alle ordene *handlet* om søvn, og hukommelsen din lagret meningen, ikke listen. Så diktet den resten."*

**Facts:** hukommelsen er ikke et arkiv, men en gjenfortelling: hjernen lagrer meningen og dikter detaljene — derfor kan hele saler «huske» ting som aldri skjedde. *(→ False memory, Wikipedia)*

**Cards:** 7♦ only (unconditional — fooled or not).

---

### 5.19 Studioet — The Studio *(TV & mentalism — the Tens)* — the ×9 digit-sum force

**Intro:**
> NB: «Blendende studiolys, tre kameraer, en programleder med for hvite tenner. «TV-magiens tid,» sier Direktøren fra mørket bak kamera to. «Her leser de tankene dine — direktesendt. Sett deg i stolen, lærling. Sendingen har alt begynt.»»
> EN: "Blinding studio lights, three cameras, a host with teeth a shade too white. 'The age of TV magic,' says the Director from the dark behind camera two. 'Here they read your mind — live on air. Take the chair, apprentice. The broadcast has already begun.'"

**Path choice:** Lærlingens vei — pretext *"Direktøren hvisker bak kamera to: «Mentalisten gjør tre ting: regner, gjetter sannsynlig — og lar rammen gjøre resten. Se etter regnestykket.»"* / *"The Director whispers from behind camera two: 'The mentalist does three things: calculates, guesses the probable — and lets the frame do the rest. Look for the arithmetic.'"*; Mesterens vei — pretext *"Studiolyset blender. Programlederen smiler litt for bredt. «Direktesending om tre … to …»"* / *"The studio lights are blinding. The host smiles a touch too widely. 'Live in three … two …'"*

**The force**, revealed one line at a time via a **"Neste →" / "Next →"** button:

1. *"Programlederen: «Velg et helt tall fra 1 til 9. Hold det hemmelig — også for kamera to.»"* / *"The host: 'Pick a whole number from 1 to 9. Keep it secret — even from camera two.'"*
2. *"«Gang tallet ditt med 9.»"* / *"'Multiply your number by 9.'"*
3. *"«Har svaret to sifre? Legg dem sammen, så du står igjen med ett siffer.»"* / *"'Does the answer have two digits? Add them together, so you are left with a single digit.'"*
4. *"«Trekk fra 5.»"* / *"'Subtract 5.'"*
5. *"«Gjør tallet om til en bokstav: 1 er A, 2 er B, 3 er C, 4 er D — og så videre.»"* / *"'Turn the number into a letter: 1 is A, 2 is B, 3 is C, 4 is D — and so on.'"*
6. *"«Tenk på et land i Europa som begynner på bokstaven din.»"* / *"'Think of a country in Europe that begins with your letter.'"*
7. *"«Og til slutt: tenk på et husdyr som begynner på landets siste bokstav.»"* / *"'And finally: think of a pet that begins with the last letter of the country.'"*

(The multiplication by 9 always forces the digit **4 → letter D → Denmark**, since almost everyone thinks of Denmark for a European country starting with D, and a pet ending in the last letter of "Denmark"/"Danmark" — **k** — is almost always a cat/kitten.)

Reveal: *"Programlederen ser rett i kamera én, og så rett på deg: **«Du tenker på … en KATT. I DANMARK.»**"* / *"The host looks straight into camera one, and then straight at you: **'You are thinking of … a KITTEN. In DENMARK.'**"* — **"Stemmer! 🤯" / "Correct! 🤯"** or **"Nei, jeg tenkte på noe annet" / "No, I thought of something else"** (*"Programlederen blunker uanfektet: «Da er du blant de få, seer. Men de fleste der hjemme sitter med en katt i Danmark akkurat nå.»"* / *"The host winks, unfazed: 'Then you are among the few, dear viewer. But most people at home are sitting with a kitten in Denmark right now.'"*) — both lead onward.

**Deduction quiz:** *"«Sendingen er over,» sier Direktøren. «Nå: hvor forsvant friheten din?»"* / *"'The broadcast is over,' says the Director. 'Now: where did your freedom disappear?'"* Four options:
- Da jeg valgte tallet / When I chose the number → *"«Nei — tallet ditt var fritt. Det var det siste frie du gjorde.» Prøv igjen."* / *"'No — your number was free. It was the last free thing you did.' Try again."*
- **Da jeg ganget med 9 / When I multiplied by 9 — correct.**
- Da jeg valgte land / When I chose the country → *"«Nesten — men bokstaven var alt bestemt. Landet var bare sannsynlighet: nesten alle sier Danmark.» Prøv igjen."* / *"'Close — but the letter was already decided. The country was just probability: nearly everyone says Denmark.' Try again."*
- Programmet leste blikket mitt / The program read my gaze → *"«Kameraet er en rekvisitt, lærling.» Prøv igjen."* / *"'The camera is a prop, apprentice.' Try again."*

Correct: *"Direktøren slår av studiolyset med ett klapp. «Riktig. Ni-gangen låste tallet — alt etterpå gikk på skinner.»"* / *"The Director switches off the studio lights with a single clap. 'Correct. The nine locked the number — everything after that ran on rails.'"*

**Hints:**
1. *"Gå baklengs gjennom sendingen. Når kunne du fortsatt ha endret utfallet?"* / *"Walk backwards through the broadcast. When could you still have changed the outcome?"*
2. *"Ni er et pussig tall: gang det med hva som helst og legg sammen sifrene."* / *"Nine is a peculiar number: multiply it by anything and add up the digits."*
3. *"Tverrsummen av ni ganger noe er alltid ni. Resten av sendingen var teater."* / *"The digit sum of nine times anything is always nine. The rest of the broadcast was theatre."*

**Principle:** «**Rammen styrer hva du ser**, lærling. På TV velger kameraet for deg — i mentalisme velger regnestykket. Tverrsummen av ni ganger hva som helst er alltid ni; alt etter det var på skinner. Friheten din var manus.»

**Curiosity:** a cue card 🗒️, *"Et manuskort med regien ligger gjenglemt ved kamera to"* / *"A cue card with the script has been forgotten by camera two"*.

**Facts:**
- En «force» er mentalistens grunnverktøy: et valg som føles helt fritt, men der alle veier fører til samme svar.
- I museets arkiv kan du se nordiske TV-opptredener fra Norske Talenter, Talang og Penn & Teller: Fool Us. *(→ /tryllehistorie)*

**Cards:** 10♠ (solve, gildable) · 10♣ (cue card) · 10♥ (completion).

*Language note:* the English version keeps the mechanism identical but the reveal ends on "a kitten in Denmark" — the puzzle was re-authored around the ×9 force, not literally translated.

---

### 5.20 Trekanten som ikke finnes — The Triangle That Isn't There *(illusion interlude — Kanizsa illusory contours)*

**Intro:**
> NB: «En plansje på staffeli, opplyst av én lampe. «Speilgangen igjen, lærling,» sier Direktøren. «Denne gangen skal du få se noe som ikke er der — og du kommer til å se det likevel.»»
> EN: "A chart on an easel, lit by a single lamp. 'The Mirror Passage again, apprentice,' says the Director. 'This time you will be shown something that is not there — and you will see it all the same.'"

**Visual:** a classic Kanizsa figure — three dark discs with pac-man-style wedges cut out, arranged so the eye perceives a bright triangle "floating" on top with edges that were never drawn.

**Mechanic:** *"**Hvor mange trekanter er tegnet på plansjen?**"* / *"**How many triangles are drawn on the chart?**"* Options: Én/One, Tre/Three, **Ingen/None (correct)**. Correct: *"Riktig — og likevel: du ser den fortsatt, gjør du ikke?"* / *"Right — and yet: you still see it, don't you?"* Wrong: *"Se en gang til. Følg «kantene» på trekanten — og finn stedet der de faktisk er tegnet."* / *"Look again. Follow the 'edges' of the triangle — and find the place where they are actually drawn."*

Reveal (always shown, regardless of answer): *"Det er ikke tegnet én eneste trekant — bare tre sirkler med kiler skåret ut. Den lyse trekanten du ser «oppå», med kanter og det hele, er **tegnet av hjernen din**: den fyller inn konturer der den venter dem. Mange synes til og med flaten ser lysere ut enn resten — det gjør den ikke."*

**Facts:** hjernen tegner ferdig det øynene bare antyder: konturene «finnes» fordi synssystemet ditt fyller inn kanter der det forventer dem — helt gratis og helt uten lov. *(→ Illusory contours, Wikipedia)*

**Cards:** 8♦ only.

---

### 5.21 Gatehjørnet — The Street Corner *(close-up magic — the Jacks)* — spot the moment of the move

**Intro:**
> NB: «Brostein, en lyktestolpe, lyden av en by som ikke finnes. Under lykten: en gatekunstner med oppbrettede ermer og en blank mynt. «Nærmagi,» sier Direktøren. «Ingen scene, ingen røyk — publikums øyne tretti centimeter unna. Se godt etter, lærling. Han gjør det bare én gang til.»»
> EN: "Cobblestones, a lamppost, the sound of a city that does not exist. Under the lamp: a street performer with rolled-up sleeves and a shining coin. 'Close-up magic,' says the Director. 'No stage, no smoke — the audience's eyes thirty centimetres away. Watch closely, apprentice. He will only do it once more.'"

**Path choice:** Lærlingens vei — pretext *"Direktøren hvisker: «Ikke se der det skjer noe. Se der det ikke skjer noe.»"* / *"The Director whispers: 'Don't look where something happens. Look where nothing happens.'"*; Mesterens vei — pretext *"Gatekunstneren knipser. «Følg med nå — én gang gjør jeg det.»"* / *"The street performer snaps his fingers. 'Watch closely now — I do it once.'"*

**The routine — six beats, played out as a growing log:**

1. Han viser mynten på flat høyrehånd. Alle ser den. / He shows the coin on his flat right hand. Everyone sees it.
2. **Venstre hånd griper over mynten — fingrene lukker seg om den. / The left hand reaches over the coin — the fingers close around it.** *(this is where the actual move happens — a false transfer; the coin is secretly retained in the right hand)*
3. Høyre hånd faller avslappet ned langs låret. / The right hand drops, relaxed, to his thigh.
4. Han hever venstre neve mot lykten og blåser på den. / He raises the left fist towards the lamp and blows on it.
5. Fingrene åpner seg, én etter én: hånden er tom. / The fingers open, one by one: the hand is empty.
6. Han bøyer seg — og plukker mynten opp bak øret ditt. / He bends down — and plucks the coin from behind your ear.

Prompt: *"**I hvilket øyeblikk skjedde selve trikset?**"* / *"**At which moment did the trick itself happen?**"* — six "Øyeblikk 1–6" / "Moment 1–6" buttons.

- **Correct (Moment 2):** *"Gatekunstneren stopper midt i bukket og ser på deg. Så åpner han høyrehånden: mynten. Den lå der hele tiden."* / *"The street performer stops mid-bow and looks at you. Then he opens his right hand: the coin. It was there all along."*
- **Near-miss (Moment 3, the resting-hand beat):** *"Nei — i det øyeblikket så det ut som ingenting skjedde. Men du er nære: hvorfor sluttet du å se på den hånden?"* / *"No — at that moment, nothing seemed to be happening. But you are close: why did you stop watching that hand?"*
- **Any other wrong guess:** *"Gatekunstneren ler. «Der? Der var det bare teater.» Se rutinen igjen om du trenger."* / *"The street performer laughs. 'There? That was just theatre.' Watch the routine again if you need to."*

A quiet **"Se rutinen én gang til 🔁" / "Watch the routine once more 🔁"** button replays the beats.

**Hints:**
1. *"Trikset skjer aldri når det ser ut som noe skjer."* / *"The trick never happens when something seems to be happening."*
2. *"Hvilken hånd sluttet du å se på — og når?"* / *"Which hand did you stop watching — and when?"*
3. *"Grepet, lærling. Grep hånden noe som helst?"* / *"The grab, apprentice. Did the hand grab anything at all?"*

**Principle:** «Grepet som aldri grep, lærling — mynten forlot aldri høyrehånden. Og løgnen som solgte det, var hånden som falt så kjedelig ned langs låret at ingen i verden så på den. **Jo mindre trikset er, desto større er løgnen.**»

**Curiosity:** an old coin 🪙, *"En gammel skilling ligger i rennesteinen"* / *"An old coin lies in the gutter"*.

**Facts:**
- Begerspillet på oldtidens markeder og «three card monte» på gatehjørnene i dag er samme håndverk: nærmagi, der trikset skjer en armlengde fra publikums øyne. *(→ Three-card monte, Wikipedia)*
- David Blaines TV-spesial «Street Magic» (1997) regnes som et vendepunkt for gatemagien. *(→ /tryllehistorie)*

**Cards:** 11♠ (solve, gildable) · 11♣ (coin) · 11♥ (completion).

---

### 5.22 Fargene som lyver — The Colours That Lie *(illusion interlude — simultaneous contrast)*

**Intro:**
> NB: «Siste dør i Speilgangen. Bak den: én eneste plansje i skumringslys. «En siste løgn fra øynene dine,» sier Direktøren. «Den enkleste av dem alle — og du går på den hver dag.»»
> EN: "The last door in the Mirror Passage. Behind it: a single chart in twilight. 'One last lie from your eyes,' says the Director. 'The simplest of them all — and you fall for it every day.'"

**Visual:** a gradient bar (dark on the left, light on the right) with two identical mid-grey squares placed near each end, appearing to be different shades until a hidden connecting bridge (same grey, painted continuously) is revealed.

**Mechanic:** *"**Hvilken grå firkant er lysest?**"* / *"**Which grey square is lighter?**"* Options: Den venstre/The left one, Den høyre/The right one, **De er helt like/They are exactly the same (correct)**.

- Correct: *"Riktig — helt like. Men se på dem: øynene dine nekter fortsatt."* / *"Right — exactly the same. But look at them: your eyes still refuse."*
- Wrong: *"De er nøyaktig samme grå — se broen som nå binder dem sammen, malt i ett strøk."* / *"They are exactly the same grey — see the bridge now joining them, painted in a single stroke."*

Reveal (always shown): *"Firkantene er **nøyaktig samme grå** — broen mellom dem er malt i samme farge, uten skjøter. Øyet måler aldri en farge alene; det sammenligner med naboene. Mot mørkt ser grått lyst ut, mot lyst ser det mørkt ut — hver eneste dag, overalt."*

**Facts:** øyet måler aldri farger alene: det sammenligner med omgivelsene. Samme grå kan se lys ut i skygge og mørk ut i sollys — scenografer og tryllekunstnere utnytter det hver kveld.

**Cards:** 9♦ only.

---

### 5.23 Vinterhagen — The Winter Garden *(the Nordic room — the Queens)* — synthesis puzzle

**Intro:**
> NB: «Glasstak mot vinternatten, isroser på rutene — og over himmelen: nordlys som bølger i grønt og fiolett. «Nordens rom,» sier Direktøren stille. «Her voktes alt du har lært. Damene slipper ingen videre som ikke kan bruke det — alt sammen, på én gang.»»
> EN: "A glass roof against the winter night, frost roses on the panes — and across the sky: northern lights rippling in green and violet. 'The room of the North,' says the Director quietly. 'Everything you have learned is guarded here. The queens let no one pass who cannot use it — all of it, at once.'"

(Styled with an aurora-gradient background: dark teal into deep violet.)

**Path choice:** Lærlingens vei — *"Rommene står oppført med prinsippene sine"* / *"The rooms are listed with their principles"*; Mesterens vei — *"Bare romnavnene — løser du gåten uten hint, gylles sparkortet ditt"* / *"Just the room names — solve the riddle without hints and your spade card is gilded"*.

**Mechanic:** *"Fire fortellinger fryser i luften under glasstaket. **Sett hver av dem sammen med rommet der du lærte prinsippet:** trykk på en fortelling, så på et rom."* / *"Four tales freeze in the air beneath the glass roof. **Match each of them with the room where you learned the principle:** press a tale, then a room."*

Six candidate rooms are listed (**two are decoys with no matching scenario** — Sandrommet and Markedsplassen): Sandrommet ("oppmerksomheten styres"/"attention is steered"), Markedsplassen ("språket er misdireksjon"/"language is misdirection"), Salongen ("teknologi utkledd som magi"/"technology dressed up as magic"), Seansen ("troen gjør halve trikset"/"belief does half the trick"), Teateret ("metoden kjøpes før effekten selges"/"the method is bought before the effect is sold"), Kinoen ("klippet er forsvinningsnummeret"/"the cut is the vanish").

The four scenarios to match:
1. En «tenkende maskin» slår alle i sjakk på verdensutstillingen. / A "thinking machine" beats everyone at chess at the world exhibition. → **Salongen**
2. I stummende mørke letter bordet — og alle rundt det kjenner det. / In pitch darkness the table lifts — and everyone around it feels it. → **Seansen**
3. På lerretet svever helten til værs — uten et klipp å se. / On the screen, the hero floats into the air — with no cut to be seen. → **Kinoen**
4. Utbryteren lar salen «velge» kisten han skal låses inn i. / The escape artist lets the house "choose" the trunk he will be locked into. → **Teateret**

Correct match: *"Riktig — nordlyset bølger anerkjennende over glasstaket."* / *"Right — the northern lights ripple approvingly across the glass roof."* Wrong: *"Isrosene på ruten tetner. Det paret hører ikke sammen."* / *"The frost roses on the pane thicken. That pair does not belong together."*

**Hints:**
1. *"To av rommene på listen hører ikke hjemme i noen av fortellingene."* / *"Two of the rooms on the list belong to none of the tales."*
2. *"Maskinen som tenker … hvem satt inni skapet i Salongen?"* / *"The machine that thinks … who sat inside the cabinet in the Salon?"*
3. *"Kisten som «velges fritt» ble valgt lenge før forestillingen — som i Teateret."* / *"The trunk 'freely chosen' was chosen long before the performance — as in the Theatre."*

**Principle:** «Damene bukker — det gjør de sjelden. Fire netters lærdom, brukt i ett rom: **oppmerksomheten, troen, metoden og klippet.** Norden har alltid fostret magikere som kunne alt dette på én gang, lærling. Nå er du nesten en av dem.»

**Curiosity:** a snowflake ❄️, *"Et snøfnugg som aldri smelter ligger på karmen"* / *"A snowflake that never melts lies on the windowsill"*.

**Facts:**
- I museets arkiv finner du portrettene av norske tryllelegender — fra varietéscenenes gullalder til TV-tiden. *(→ /tryllehistorie/fordypninger)*
- Prinsippene du nettopp brukte — styrt oppmerksomhet, tro, forberedt metode og klippet — er de samme i dag som for hundre år siden; bare innpakningen skifter.

**Cards:** 12♠ (solve, gildable) · 12♣ (snowflake) · 12♥ (completion).

---

### 5.24 Epilog (Act IV) — "Den siste terskelen" / "The Final Threshold"

**Intro:**
> NB: «Direktøren venter ved en dør uten håndtak, uten nøkkelhull — bare et grunt, kortformet søkk i treverket. «Tolv rom, lærling. Ett igjen. Denne døren åpner seg ikke for deg. Den åpner seg for stokken din — når den er hel.»»
> EN: "The Director waits by a door with no handle, no keyhole — just a shallow, card-shaped recess in the woodwork. 'Twelve rooms, apprentice. One to go. This door does not open for you. It opens for your deck — when it is whole.'"

**Dynamic summary:** *"Etter fire netter i Kabinettet har du {n} av 48 kort i kortstokken"* / *"After four nights in the Cabinet you have {n} of 48 cards in your deck"*, plus gilding note, then either *"Direktøren legger hånden mot døren uten håndtak. Innenfra svarer det — ett bank. «Den hører deg, lærling.»"* / *"The Director lays a hand on the door without a handle. From inside comes an answer — a single knock. 'It hears you, apprentice.'"* (45+/48) or *"Døren uten håndtak tier ennå. Det som mangler i stokken, kan finnes en annen natt — rommene husker deg."* / *"The door without a handle is still silent. What is missing from the deck can be found another night — the rooms remember you."*

Fixed line: «Til du kommer tilbake, lærling: Kabinettet står i dagslys på Årvoll gård. Der heter det **Tryllemuseet** — og der er alle dører åpne.»

Buttons: **"Gå til døren 🚪"** / **"Go to the door 🚪"** · poster · visit link · deck.

---

### 5.25 Porten — The Gate *(finale threshold — the last three diamonds)*

**Intro:**
> NB: «Døren uten håndtak venter. Søkket i treverket har form som en kortstokk, og for første gang i natt senker Direktøren stemmen til noe som ligner ærefrykt. «Nå, lærling. Legg stokken din i døren.»»
> EN: "The door without a handle waits. The recess in the woodwork has the shape of a deck of cards, and for the first time tonight the Director lowers his voice to something like awe. 'Now, apprentice. Place your deck in the door.'"

**Mechanic — the gate check:** the door checks only that the player owns **at least one card of every value 1–12** (regardless of suit) — not the full 48-card set.

- All 12 values present: *"Søkket i treverket har nøyaktig stokkens form. Døren venter."* / *"The recess in the woodwork has exactly the shape of your deck. The door waits."* — **"Legg stokken i døren 🃏" / "Place the deck in the door 🃏"** button enables.
- Missing values: *"Døren teller tolv verdier — og stokken din mangler noen. Rommene husker deg; en ny natt kan samle resten."* / *"The door counts twelve values — and your deck is missing some. The rooms remember you; a new night can gather the rest."*

**Placing the deck:** *"Døren tar imot stokken — og gir tre kort tilbake: **de tre siste ruterne.**"* / *"The door accepts the deck — and gives three cards back: **the last three diamonds.**"* Awards 10♦, 11♦, 12♦ unconditionally.

Meta-lesson (tying together Act IV's three illusion beats): «Illusjonskortene for de tre siste rommene?» Direktøren smiler skjevt. «De har vært dine hele natten. I Studioet lurte du deg selv med regnestykket. På Gatehjørnet valgte du selv å se bort. I Vinterhagen malte hjernen din nordlyset ferdig. Den største illusjonisten i Kabinettet, lærling — det var aldri meg.»

Door outcome: if the player now genuinely owns all 48 cards for values 1–12, *"Døren gir etter med noe som ligner en akkord: hel stokk, hel dør. Den svinger opp uten en lyd."* / *"The door gives way with something like a chord: whole deck, whole door. It swings open without a sound."*; otherwise *"Døren gir etter, tung og langsom. Den teller det som teller — og du har det med deg."* / *"The door gives way, heavy and slow. It counts what counts — and you carry it with you."* Either way the door opens — this is never a hard block.

**"Gå inn i Det trettende kabinettet →"** / **"Enter the Thirteenth Cabinet →"** → Kabinettet.

---

### 5.26 Det trettende kabinettet — The Thirteenth Cabinet *(finale — compose your own act, the Kings)*

**Intro:**
> NB: «Rommet bak den siste døren er … en scene. Tom. Støvete gulvplanker, ett arbeidslys, en sal uten stoler. «Skuffet?» spør Direktøren. «Ikke vær det. Dette er Det trettende kabinettet: scenen som venter på sitt neste nummer. Ditt nummer.»»
> EN: "The room behind the last door is … a stage. Empty. Dusty floorboards, one work light, a house with no seats. 'Disappointed?' asks the Director. 'Don't be. This is the Thirteenth Cabinet: the stage that waits for its next act. Your act.'"

**Mechanic:** *"«Sett sammen nummeret ditt av det du har lært,» sier Direktøren. «Én effekt. Én metode. Én misdireksjon. Det finnes ingen gale svar — bare ditt svar.»"* / *"'Assemble your act from what you have learned,' says the Director. 'One effect. One method. One misdirection. There are no wrong answers — only your answer.'"* The player picks one option from each of three categories (4 options each — **4×4×4 = 64 possible acts**); the **"Fremfør nummeret 🎭" / "Perform the act 🎭"** button unlocks once all three are chosen.

**Category 1 — Effekten / The effect** ("det salen skal oppleve" / "what the house will experience"):
- Noe forsvinner / Something vanishes — *"lar museets gamle lykt forsvinne i løse luften"* / *"make the museum's old lantern vanish into thin air"*
- Noe svever / Something floats — *"lar speilet fra Speilgangen sveve fritt over scenekanten"* / *"let the mirror from the Mirror Passage float freely over the edge of the stage"*
- Tankene leses / A mind is read — *"leser tanken til en fremmed i salen — riktig på første forsøk"* / *"read the mind of a stranger in the house — right on the first try"*
- Noe knust heles / Something broken is made whole — *"knuser Direktørens lommeur og gir det tilbake helt"* / *"smash the Director's pocket watch and hand it back whole"*

**Category 2 — Metoden / The method** ("det som faktisk skjer" / "what actually happens"):
- Forberedt lenge før forestillingen / Prepared long before the performance — *"metoden ble kjøpt i går, slik Teateret lærte deg"* / *"the method was bought yesterday, as the Theatre taught you"*
- Skjult i mekanikken / Hidden in the mechanics — *"et håndverk av tannhjul og motvekter, arvet fra Salongen og Verkstedet"* / *"a craft of cogwheels and counterweights, inherited from the Salon and the Workshop"*
- Gjemt i ordene / Hidden in the words — *"hemmeligheten ropes høyt i patteren, slik gjøgleren gjorde på Markedsplassen"* / *"the secret is shouted aloud in the patter, as the conjurer did on the Market Square"*
- Lagt i øyeblikket ingen ser / Placed in the moment no one sees — *"selve grepet skjer i et blunk, som Kinoens klipp og Galleriets bytte"* / *"the move itself happens in a blink, like the Cinema's cut and the Gallery's swap"*

**Category 3 — Misdireksjonen / The misdirection** ("det som holder de to fra hverandre" / "what keeps the two apart"):
- Den hvilende hånden / The resting hand — *"mens alle øyne følger det som beveger seg, gjør den rolige hånden jobben — Sandrommets eldste lekse"* / *"while every eye follows what moves, the calm hand does the work — the Sand Room's oldest lesson"*
- Det frie valget / The free choice — *"publikums «frie» valg leder dem selv til utfallet, slik Speilgangen viste deg"* / *"the audience's 'free' choices lead them to the outcome themselves, as the Mirror Passage showed you"*
- Mørket og troen / The darkness and the belief — *"salen tror før den ser, og troen gjør halve trikset — Seansens lærdom"* / *"the house believes before it sees, and belief does half the trick — the Séance's lesson"*
- Rammen / The frame — *"du viser dem nøyaktig hvor de skal se, og aldri hvor de ikke skal — slik Studioet rammet inn blikket"* / *"you show them exactly where to look, and never where not to — as the Studio framed the gaze"*

**The performance is narrated dynamically from the three picks**, using the player's stage name (from Foajeen, uppercased; falls back to "Den navnløse" / "The Nameless"):

> NB: *"Arbeidslyset dør. Ett hjerteslag av mørke — så flammer scenen opp. PÅ SCENEN: **{NAME}**! For et publikum som ikke finnes ennå, {effect line}. Ingen i salen aner at {method line}. Og ingen ser det — for {misdirection line}."*
> EN: *"The work light dies. One heartbeat of darkness — then the stage blazes up. ON STAGE: **{NAME}**! For an audience that does not exist yet, you {effect line}. Nobody in the house suspects that {method line}. And nobody sees it — because {misdirection line}."*

Example (picking "Noe svever" + "Skjult i mekanikken" + "Rammen"): *"Arbeidslyset dør. Ett hjerteslag av mørke — så flammer scenen opp. PÅ SCENEN: **TROND**! For et publikum som ikke finnes ennå, lar speilet fra Speilgangen sveve fritt over scenekanten. Ingen i salen aner at et håndverk av tannhjul og motvekter, arvet fra Salongen og Verkstedet. Og ingen ser det — for du viser dem nøyaktig hvor de skal se, og aldri hvor de ikke skal — slik Studioet rammet inn blikket."*

**Direktørens final lesson** (fixed, always shown after the performance): «Direktøren applauderer — langsomt, og helt alene, og det er nok. «**Kabinettet var aldri magisk, lærling. Håndverket er det.** Det var den siste leksen.» Så rekker han deg fire kort: **kongene.**» ("The Director applauds — slowly, and entirely alone, and it is enough. 'The Cabinet was never magic, apprentice. The craft is. That was the final lesson.' Then he hands you four cards: the kings.")

**Cards:** all four Kings (K♠ K♥ K♦ K♣) unconditionally.

**Facts:** tryllekunstnere beskriver ofte et nummer i tre lag: effekten (det publikum opplever), metoden (det som faktisk skjer) og misdireksjonen (det som sørger for at de to aldri møtes).

**"Mot lyset →" / "Toward the light →"** → Daggry.

---

### 5.27 Daggry — Dawn *(finale epilogue — rank & diploma)*

**Intro:**
> NB: «Bak scenen: en dobbeltdør av glass. Og bak den — ikke enda et rom, men morgen. «Kabinettets siste hemmelighet, lærling: det finnes i dagslys også. Da heter det Tryllemuseet, og det står på Årvoll gård. Rommene der er ekte. Historiene også.»»
> EN: "Behind the stage: a double door of glass. And beyond it — not another room, but morning. 'The Cabinet's last secret, apprentice: it exists in daylight too. Then it is called Tryllemuseet, the Museum of Magic, and it stands at Årvoll gård in Oslo. The rooms there are real. So are the stories.'"

**Summary:** *"Du går ut i morgenlyset med {n} av 52 kort"* / *"You step out into the morning light with {n} of 52 cards"*, plus gilding note, then either *"En hel stokk. Direktøren sier ingenting — han bukker."* / *"A complete deck. The Director says nothing — he bows."* (all 52) or *"Det som mangler, venter i rommene: kuriositetene gjemmer seg fortsatt for den som begynner en ny natt."* / *"What is missing waits in the rooms: the curiosities are still hiding for whoever begins a new night."*

**Rank line:** *"Lærlingbrevet ditt er skrevet ut med tittelen **{rank}**."* / *"Your letter of apprenticeship has been made out with the title **{rank}**."* (see rank table in §3.8)

**Facts:** Tryllemuseet på Årvoll gård i Oslo forteller 4000 år med tryllekunstens historie — den samme historien du nettopp har vandret gjennom en fiksjonsversjon av, rom for rom. *(→ /besok, "Planlegg besøket")*

**Buttons:** download diploma · download poster · **"Besøk Tryllemuseet →"** / **"Visit Tryllemuseet →"** (`/besok`) · view deck.

**Closing line:** *"Takk for at du var Kabinettets lærling. Rommene står her — og en ny natt kan alltid begynne på nytt fra spill-linjen øverst."* ("Thank you for being the Cabinet's apprentice. The rooms remain here — and a new night can always begin again from the game bar up top.")

---

## 6. Cross-room card summary

| # | Room | ♠ Solve | ♥ Complete | ♦ Illusion (own or paired room) | ♣ Curiosity |
|---|---|---|---|---|---|
| 1 (A) | Foajeen | — (all 4 awarded together) | | | |
| 2 | Sandrommet | Sigillet fra Sandrommet | Plakatkortet fra Sandrommet | (2♦ from Speilgangen) | Skarabeen |
| — | Speilgangen | | | Illusjonskortet fra Speilgangen (2♦) | |
| 3 | Markedsplassen | Sigillet fra Markedsplassen | Plakatkortet fra Markedsplassen | (3♦ from Galleriet) | Musa |
| — | Galleriet | | | Illusjonskortet fra Galleriet (3♦) | |
| 4 | Biblioteket | Sigillet fra Biblioteket | Plakatkortet fra Biblioteket | (4♦ from Øyet) | Bokormen |
| — | Øyet som lyver | | | Illusjonskortet fra Øyet (4♦) | |
| 5 | Salongen | Sigillet fra Salongen | Plakatkortet fra Salongen | (5♦ from Frievalget) | Tannhjulet |
| 6 | Seansen | Sigillet fra Seansen | Plakatkortet fra Seansen | (6♦ from Lerretet) | Klokka |
| — | Det frie valget | | | Illusjonskortet fra Det frie valget (5♦) | |
| 7 | Teateret | Sigillet fra Teateret | Plakatkortet fra Teateret | (7♦ from Minnet) | Teaterbilletten |
| 8 | Kinoen | Sigillet fra Kinoen | Plakatkortet fra Kinoen | (8♦ from Trekanten) | Filmbiten |
| — | Ånden på lerretet | | | Illusjonskortet fra Lerretet (6♦) | |
| 9 | Verkstedet | Sigillet fra Verkstedet | Plakatkortet fra Verkstedet | (9♦ from Fargene) | Messingskruen |
| — | Minnet som dikter | | | Illusjonskortet fra Minnet (7♦) | |
| 10 | Studioet | Sigillet fra Studioet | Plakatkortet fra Studioet | (10♦ from Porten) | Manuskortet |
| — | Trekanten som ikke finnes | | | Illusjonskortet fra Trekanten (8♦) | |
| 11 | Gatehjørnet | Sigillet fra Gatehjørnet | Plakatkortet fra Gatehjørnet | (11♦ from Porten) | Skillingen |
| — | Fargene som lyver | | | Illusjonskortet fra Fargene (9♦) | |
| 12 | Vinterhagen | Sigillet fra Vinterhagen | Plakatkortet fra Vinterhagen | (12♦ from Porten) | Snøfnugget |
| 13 | Det trettende kabinettet | — (all 4 Kings awarded together) | | | |

All ♠ "solve" cards are gildable (Mesterens vei + zero hints + zero wrong attempts). Every award is idempotent — repeat clicks never duplicate a card or re-fire its toast.

---

## 7. For a Lovable rebuild — practical notes

- **No backend required.** The original is a static Astro page with all logic client-side; progress lives in `localStorage`; content overrides come from a headless CMS (Sanity) but the game ships with complete built-in Norwegian + English defaults, so a rebuild doesn't strictly need a CMS at all — the text in Section 5 above is the full content set.
- **Fail-safe design principle to preserve:** there is no lose state anywhere. Wrong answers only produce flavor text and (in gildable rooms) forfeit the cosmetic gilding — never block progress.
- **Reduced-motion note:** every timed sequence should be skippable/instant except the Ånden på lerretet 12-second afterimage stare, which is real physiology and should stay full-length even in a reduced-motion rebuild.
- **Language coupling:** two puzzles (Markedsplassen's acrostic, Studioet's digit force) only work if the puzzle mechanism is re-derived per language, not translated word-for-word — the English acrostic spells a different word (MIDDLE vs. MIDTEN) and the English digit-force ends on a different flavor answer (kitten in Denmark) that still mathematically works the same way.
- **Visual identity:** deep maroon/gold varieté palette (`#3D0E15` background, `#C9A227`/gold accents, `#F5EBD8` cream text), Georgia/serif display type, gilded card motif (♠♥♦♣), aurora gradient reserved for Vinterhagen only.
