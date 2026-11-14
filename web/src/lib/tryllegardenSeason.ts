// src/lib/tryllegardenSeason.ts
//
// Season packs for "Tryllegården" (src/pages/barn/tryllegarden.astro), the
// children's game on the farm. Concept: docs/tryllegarden-concept.md.
//
// The game engine knows nothing about Christmas: it gets one FarmSeason — a
// map, a list of places, each with a mini-game mechanic, texts and a trick —
// and plays it. This file holds the types, the built-in Christmas pack (so the
// game works before any content exists in Sanity) and mergeSeason(), which
// lays an optional farmSeason document from Sanity on top of a built-in pack.
// A season that exists only in Sanity (no built-in pack) works too.
//
// No secrets here: the tricks' methods are kitTrick documents in the private
// dataset, and this file only names them by slug (see src/lib/tryllegarden.ts).
//
// Texts may use {jente}, {gutt} and {gard}: the two children's names and the
// farm's name come from farmGameConfig, so they can change without touching
// any text.

export type FarmLevel = 'smanisse' | 'laerling' | 'mester'
export const FARM_LEVELS: FarmLevel[] = ['smanisse', 'laerling', 'mester']

/** Mini-game mechanics the engine can play. A new one needs code. */
export type FarmMechanic = 'finn' | 'rekkefolge' | 'husk' | 'folg-traden' | 'monster' | 'flett' | 'forandret' | 'tenn' | 'gjett' | 'tell' | 'sorter'
export const FARM_MECHANICS: FarmMechanic[] = ['finn', 'rekkefolge', 'husk', 'folg-traden', 'monster', 'flett', 'forandret', 'tenn', 'gjett', 'tell', 'sorter']

export type FarmSpeaker = 'jente' | 'gutt' | 'nisse' | 'forteller' | 'jan'

export type FarmPose = 'hei' | 'peker' | 'overrasket' | 'jubler'

export interface FarmLine {
  who:     FarmSpeaker
  /** Which picture of the child to show. Default: chosen from the text. */
  pose?:   FarmPose
  text:    string
  textEn?: string
}

/** One thing in a mini-game: something to find, a step to order, a bird. */
export interface FarmItem {
  key:      string
  label:    string
  labelEn?: string
  /** Placeholder drawing until there is an image. */
  emoji?:    string
  imageUrl?: string
  /** Position in the scene, in percent of its width/height (finn, husk). */
  x?: number
  y?: number
  /** Lowest level the item appears on. Default: all levels. */
  from?: FarmLevel
  /** rekkefolge: the step's place in the right order (1, 2, 3 …). */
  order?: number
  /** rekkefolge: a card that does not belong at all. */
  decoy?: boolean
  /** rekkefolge: what the children say when a decoy is picked. */
  wrong?:   string
  wrongEn?: string
  /** husk: body, breast and cap colour of the placeholder bird. */
  colors?: string[]
  /** Width in percent of the scene (husk). */
  size?: number
  /** CSS filter on the picture, for example to tint one bell differently from another. */
  filter?: string
  /** gjett: show a number instead of the name, so the name does not give the answer away. */
  anon?: boolean
}

/** gjett: a riddle and the key of the item that answers it. */
export interface FarmClue {
  text:     string
  textEn?:  string
  answer:   string
  /** Levels the clue is used on. Default: every level where the answer is shown. */
  levels?:  FarmLevel[]
}

export interface FarmLevelParams {
  /**
   * One number per round. What the number means depends on the mechanic:
   * husk = birds to remember, folg-traden = braids, monster = biscuits in the
   * row, flett = squares per side, forandret = things on the shelf,
   * tenn = lanterns, gjett = the first number is how many rounds are played,
   * tell = the most things in a round, sorter = candles in a round.
   */
  rounds?: number[]
  /** husk: the last round must be answered backwards. */
  reverse?: boolean
}

export interface FarmCraft {
  title: string
  titleEn?: string
  /** What you need, one line. */
  needs?: string
  needsEn?: string
  steps: { text: string; textEn?: string; imageUrl?: string }[]
}

export interface FarmPlace {
  key:      string
  /** gjett: the riddles. */
  clues?:   FarmClue[]
  /** Not needed to open the finale. */
  bonus?:   boolean
  /** Fixed number 0–15 that identifies the place in a save code. Never change it once players may have codes. */
  slot?:    number
  title:    string
  titleEn?: string
  mechanic: FarmMechanic
  /** Emoji on the map button until the map is drawn. */
  icon: string
  /** Drawn map button; replaces the emoji in `icon`. */
  iconImageUrl?: string
  /** Position on the map, in percent. */
  mapX: number
  mapY: number
  /** What this place hangs on the tree (or puts in the basket …). */
  ornament: string
  /** Picture of the ornament; the emoji above is the fallback. */
  ornamentImageUrl?: string
  /** Built-in placeholder backdrop; ignored when sceneImageUrl is set. */
  backdrop?:      'tun' | 'fjos' | 'lave' | 'stall' | 'bakst' | 'stue' | 'stabbur' | 'sti'
  sceneImageUrl?: string
  sceneAlt?:      string
  intro:   FarmLine[]
  task:    string
  taskEn?: string
  items:   FarmItem[]
  levels?: Partial<Record<FarmLevel, FarmLevelParams>>
  /** Two spoken hints; the third step of the ladder shows the answer. */
  hints:    string[]
  hintsEn?: string[]
  /** The children's line when the mini-game is done. */
  done:    string
  doneEn?: string
  traditionShort:    string
  traditionShortEn?: string
  traditionLong?:    string
  traditionLongEn?:  string
  /** Shown instead of the «secret is kept in …» note when the place has no trick method (hasTrick false). */
  trickNote?:     string
  trickNoteEn?:   string
  /** What the child looks at in «forandret»: «hyllene» (default), «kortene» … */
  lookAt?:        string
  lookAtEn?:      string
  traditionLinkUrl?:   string
  traditionLinkLabel?: string
  /** The nisse's trick: what the audience sees. Never the method. */
  trickTitle:     string
  trickTitleEn?:  string
  trickEffect:    string
  /** Youngest age the trick suits (our estimate until children have tried it). */
  trickAge?:      number
  trickEffectEn?: string
  /** Slug of the kitTrick document (private dataset) with the method. */
  trickSlug?: string
  /** Where the nisse hides in this place's scene, in percent. */
  nisseX?: number
  nisseY?: number
  /** The scene picture already shows the nisse at nisseX/nisseY: the hidden hat is then an invisible target. */
  nisseInScene?: boolean
  /** A friend who stands in the scene and dances when the child gets it right (mechanic `tell`): Loco the cockatoo. */
  /** `danceImageUrl` is a second pose in the same frame (same size, perch in the same spot); the two are swapped while dancing. */
  /** `idleImageUrls`: more poses in the same frame (head tilts) shown now and then while he waits. */
  dancer?: { name: string; imageUrl: string; danceImageUrl?: string; idleImageUrls?: string[]; x: number; y: number; size?: number }
  /** "Make it yourself" instructions shown after the mini-game. Never a trick's method. */
  craft?: FarmCraft
}

export interface FarmSeason {
  key:         string
  title:       string
  titleEn?:    string
  subtitle?:   string
  subtitleEn?: string
  intro:       string
  introEn?:    string
  heroImageUrl?: string
  heroAlt?:      string
  /** Picture of the whole farm, 4:3. Places sit on it at mapX/mapY. Without one, a drawn placeholder is used. */
  mapImageUrl?: string
  mapAlt?:      string
  /** The tree the ornaments hang on, drawn big over the middle of the map. Without one, a small drawn fir is used. */
  treeImageUrl?: string
  /** Picture on the Nisseloftet screen at the end (the key and the box). */
  loftImageUrl?: string
  /** Colours of the game's frame. Any CSS colour. */
  palette: { sky: string; ground: string; accent: string; accent2: string; glow: string }
  /** The thing being filled: "Juletreet", "Påskekurven" … */
  collectionName:    string
  collectionNameEn?: string
  /** What crowns the collection when everything is done. */
  collectionTop: string
  collectionTopUrl?: string
  places: FarmPlace[]
  finaleTitle:    string
  finaleTitleEn?: string
  finale: FarmLine[]
  /** Name of the season's bundle in the closed area, as the child sees it. */
  loftName:    string
  /** Magic words to choose between for the final show. */
  showWords?:   string[]
  showWordsEn?: string[]
  loftNameEn?: string
  /** Slug of the kitCollection (private dataset) the finished game opens. */
  kitSlug?: string
}

// ── Built-in pack: Christmas ──────────────────────────────────────
// Tradition texts are drafts until the museum has approved them (one review
// before launch — see the concept document).

const jul: FarmSeason = {
  key: 'jul',
  title: 'Jul på Tryllegården',
  subtitle: 'Fjøsnissens hemmelighet',
  intro:
    'På {gard} (Årvoll gård?) skjer det rare ting før jul. Noen har spist grøten. Noen har flettet høyet. {jente} og {gutt} tror det bor en nisse i fjøset – og at han kan trylle!',
  mapImageUrl: '/images/tryllegarden/kart-jul.webp',
  treeImageUrl: '/images/tryllegarden/juletre.webp',
  loftImageUrl: '/images/tryllegarden/scene/nisseloftet.webp',
  mapAlt: 'Tryllegården sett ovenfra en vinterkveld: låven, stabburet og stua i snøen, med lykter langs stien.',
  heroImageUrl: '/images/tryllegarden/jul-laven.webp',
  heroAlt: 'To tryllebarn med flosshatt tryller en hvit kanin opp av en hatt på låven, mens fjøsnissen ser på og klapper.',
  palette: { sky: '#14213d', ground: '#eef3f8', accent: '#b3262d', accent2: '#1f5c3a', glow: '#f6c453' },
  collectionName: 'Juletreet',
  collectionTop: '⭐',
  collectionTopUrl: '/images/tryllegarden/pynt/stjerne.webp',
  loftName: 'Nisseloftet',
  kitSlug: 'nissens-tryllesekk',
  showWords: ['Hokus pokus', 'Sim sala bim', 'Snipp snapp snute', 'Nisselue og grøt'],
  places: [
    {
      key: 'tunet',
      slot: 0,
      title: 'Tunet',
      mechanic: 'finn',
      icon: '👣',
      mapX: 62, mapY: 54,
      ornament: '🔴',
      ornamentImageUrl: '/images/tryllegarden/pynt/kule-rod.webp',
      sceneImageUrl: '/images/tryllegarden/scene/tunet.webp',
      sceneAlt: 'Tunet en vinterkveld: den røde bygningen med lys i vinduene, vedstabel, grantrær, gjerde og mye urørt snø. Nissen titter fram over mønet.',
      intro: [
        { who: 'jente', text: 'Se, {gutt}! Noen har gått over tunet i natt.' },
        { who: 'gutt',  text: 'Bittesmå fotspor … Jeg tror det bor en nisse her på {gard}!' },
        { who: 'jente', text: 'Han har mistet noen ting i snøen. Hjelper du oss å finne dem?' },
      ],
      task: 'Finn alle tingene nissen har lagt igjen på tunet.',
      items: [
        { key: 'fotspor', label: 'Fotsporene',  emoji: '👣', imageUrl: '/images/tryllegarden/ting/fotspor.webp', x: 30, y: 84 },
        { key: 'vott',    label: 'Votten',      emoji: '🧤', imageUrl: '/images/tryllegarden/ting/vott.webp', x: 72, y: 77 },
        { key: 'lykt',    label: 'Lykta',       emoji: '🏮', imageUrl: '/images/tryllegarden/ting/lykt.webp', x: 40, y: 70 },
        { key: 'skje',    label: 'Grøtskjeen',  emoji: '🥄', imageUrl: '/images/tryllegarden/ting/skje.webp', x: 14, y: 68, from: 'laerling' },
        { key: 'bjelle',  label: 'Bjella',      emoji: '🔔', imageUrl: '/images/tryllegarden/ting/bjelle.webp', x: 87, y: 72, from: 'laerling' },
        { key: 'garn',    label: 'Garnnøstet',  emoji: '🧶', imageUrl: '/images/tryllegarden/ting/garn.webp', x: 55, y: 91, from: 'mester' },
        { key: 'gulrot',  label: 'Gulrota',     emoji: '🥕', imageUrl: '/images/tryllegarden/ting/gulrot.webp', x: 8,  y: 90, from: 'mester' },
      ],
      hints: [
        'Se nøye i snøen, helt nederst.',
        'Noe ligger ved den røde veggen, og noe ligger ved gjerdet.',
      ],
      done: 'Bra sett! En tryllekunstner må se det ingen andre ser.',
      traditionShort:
        'Fjøsnissen er en liten kar som bor på gården og passer på dyra. Han er sjenert, så nesten ingen får se ham.',
      traditionLong:
        'I gamle dager trodde folk at det bodde en nisse på hver gård. Han hadde grå klær og rød lue, og var ikke større enn et barn. Var folk snille mot dyra, hjalp nissen til om natta.',
      trickTitle: 'Strikken som hopper',
      trickEffect:
        'Du setter en strikk rundt pekefingeren og langfingeren. Du knytter hånda og sier trylleordet. Vips – strikken har hoppet over til de to andre fingrene!',
      trickAge: 6,
      trickSlug: 'strikken-som-hopper',
      nisseX: 63, nisseY: 19, nisseInScene: true,
    },
    {
      key: 'fjoset',
      slot: 1,
      title: 'Fjøset',
      mechanic: 'rekkefolge',
      icon: '🥣',
      mapX: 66, mapY: 37,
      ornament: '🟡',
      ornamentImageUrl: '/images/tryllegarden/pynt/kule-gul.webp',
      sceneImageUrl: '/images/tryllegarden/scene/fjoset.webp',
      sceneAlt: 'Inne i fjøset: en tent lykt, høyballer, en tom gryte på bordet og en nysgjerrig ku. Nissen titter fram bak høyet.',
      intro: [
        { who: 'gutt',  text: 'Det lukter grøt her! Men gryta er tom …' },
        { who: 'jente', text: 'Nissen blir så glad for julegrøt. Skal vi koke en ny til ham?' },
        { who: 'gutt',  text: 'Da må vi gjøre alt i riktig rekkefølge. Kan du hjelpe oss?' },
      ],
      task: 'Trykk på det som skal skje først. Så det neste, helt til grøten er ferdig.',
      items: [
        { key: 'gryte', label: 'Ha melk og ris i gryta',         emoji: '🥛', imageUrl: '/images/tryllegarden/kort/helle.webp', order: 1 },
        { key: 'ror',   label: 'Rør og rør til grøten er tykk',  emoji: '🥄', imageUrl: '/images/tryllegarden/kort/ror.webp', order: 2, from: 'laerling' },
        { key: 'skal',  label: 'Øs grøten opp i skåla',          emoji: '🥣', imageUrl: '/images/tryllegarden/kort/skal.webp', order: 3, from: 'laerling' },
        { key: 'kanel', label: 'Dryss på sukker og kanel',       emoji: '✨', imageUrl: '/images/tryllegarden/kort/kanel.webp', order: 4, from: 'mester' },
        { key: 'smor',  label: 'Legg en klatt smør i midten',    emoji: '🧈', imageUrl: '/images/tryllegarden/kort/smor.webp', order: 5 },
        { key: 'lave',  label: 'Bær skåla ut på låven',          emoji: '🏮', imageUrl: '/images/tryllegarden/kort/lave.webp', order: 6 },
        { key: 'sokk',  label: 'Legg en sokk oppi',              emoji: '🧦', imageUrl: '/images/tryllegarden/kort/sokk.webp', decoy: true, from: 'mester',
          wrong: 'Sokk i grøten? Nei, fy da! Den hører ikke hjemme her.' },
        { key: 'agurk', label: 'Pynt med sylteagurk',            emoji: '🥒', imageUrl: '/images/tryllegarden/kort/agurk.webp', decoy: true, from: 'mester',
          wrong: 'Sylteagurk? Det liker ikke nissen. Den hører ikke hjemme her.' },
      ],
      hints: [
        'Grøten må kokes før noen kan spise den.',
        'Smøret kommer oppå til slutt, og helt sist bæres skåla ut.',
      ],
      done: 'Nydelig grøt! En tryllekunstner gjør alltid klart i riktig rekkefølge.',
      traditionShort:
        'På julaften setter mange ut en skål grøt til nissen. På toppen skal det ligge en klatt smør. Det heter smørøye.',
      traditionLong:
        'Grøten er en gammel måte å si takk på, fordi nissen har passet på gården hele året. I sagnene blir han sur hvis smøret mangler!',
      trickTitle: 'Kanelstanga av gummi',
      trickEffect:
        'Du viser fram en hard kanelstang. Så rister du forsiktig på den – og plutselig ser den myk ut, som om den var av gummi!',
      trickAge: 5,
      trickSlug: 'kanelstanga-av-gummi',
      nisseX: 90, nisseY: 83, nisseInScene: true,
    },
    {
      key: 'laven',
      slot: 2,
      title: 'Låven',
      mechanic: 'husk',
      icon: '🌾',
      mapX: 19, mapY: 38,
      ornament: '🔵',
      ornamentImageUrl: '/images/tryllegarden/pynt/fugl-bla.webp',
      backdrop: 'lave',
      sceneImageUrl: '/images/tryllegarden/scene/laven.webp',
      sceneAlt: 'Juleneket står på en stang foran den røde låven en stjerneklar kveld. Lykta lyser ved låvedøra, og nissen titter fram bak en snøfonn.',
      intro: [
        { who: 'jente', text: 'Hysj! Det sitter fugler på juleneket.' },
        { who: 'gutt',  text: 'De lander én og én. Nissen vet nok hvem som kom først.' },
        { who: 'jente', text: 'Klarer du å huske rekkefølgen?' },
      ],
      task: 'Se hvem som lander først. Trykk på fuglene i samme rekkefølge.',
      items: [
        { key: 'dompap',    label: 'Dompap',    imageUrl: '/images/tryllegarden/fugler/dompap.webp', x: 34, y: 24, size: 13, colors: ['#5b6470', '#d9423a', '#1b1b1f'] },
        { key: 'kjottmeis', label: 'Kjøttmeis', imageUrl: '/images/tryllegarden/fugler/kjottmeis.webp', x: 66, y: 23, size: 13, colors: ['#6f8f3a', '#f2d13d', '#1b1b1f'] },
        { key: 'graspurv',  label: 'Gråspurv',  imageUrl: '/images/tryllegarden/fugler/graspurv.webp', x: 50, y: 12, size: 13, colors: ['#8a6a4a', '#d8cbb8', '#6b4a2e'] },
        { key: 'blameis',   label: 'Blåmeis',   imageUrl: '/images/tryllegarden/fugler/blameis.webp', x: 31, y: 45, size: 13, colors: ['#5f86b8', '#f2d86a', '#2f6fc0'], from: 'laerling' },
        { key: 'gulspurv',  label: 'Gulspurv',  imageUrl: '/images/tryllegarden/fugler/gulspurv.webp', x: 68, y: 46, size: 13, colors: ['#a07a3c', '#f0cf3a', '#f0cf3a'], from: 'mester' },
        { key: 'skjaere',   label: 'Skjære',    imageUrl: '/images/tryllegarden/fugler/skjaere.webp', x: 45, y: 70, size: 13, colors: ['#1b1b1f', '#ffffff', '#1b1b1f'], from: 'mester' },
      ],
      levels: {
        smanisse: { rounds: [2, 3] },
        laerling: { rounds: [3, 4] },
        mester:   { rounds: [4, 5], reverse: true },
      },
      hints: [
        'Si navnene høyt mens fuglene lander. Da er det lettere å huske.',
        'Trykk på «Vis en gang til» og følg med på den første fuglen.',
      ],
      done: 'For en hukommelse! En tryllekunstner må huske alt – uten å se på lappen.',
      traditionShort:
        'Juleneket er et knippe med havre som henges opp ute til jul. Da får småfuglene også julemat.',
      traditionLong:
        'Før i tida sparte bonden de fineste kornstråene fra høsten til juleneket. Kom det mange fugler, trodde folk at det ble et godt år.',
      trickTitle: 'Fuglen på neket',
      trickEffect:
        'På den ene siden av en snurreskive er det en fugl. På den andre siden er det et julenek. Du snurrer skiva – og plutselig sitter fuglen på neket! En slik snurreskive kalles en thaumatrope, og folk trylte med dem for 200 år siden, lenge før film var funnet opp.',
      trickAge: 6,
      trickSlug: 'fuglen-pa-neket',
      nisseX: 12, nisseY: 60, nisseInScene: true,
    },
    {
      key: 'stallen',
      slot: 3,
      title: 'Stallen',
      mechanic: 'folg-traden',
      icon: '🐴',
      mapX: 43, mapY: 32,
      ornament: '🟣',
      ornamentImageUrl: '/images/tryllegarden/pynt/hestesko.webp',
      backdrop: 'stall',
      sceneImageUrl: '/images/tryllegarden/scene/stallen.webp',
      sceneAlt: 'Inne i stallen. Fjordhesten Blakken står i boksen sin med lang, lys man. Seletøy, bjelle og lykt henger på veggen, og nissen titter fram bak en høyball.',
      intro: [
        { who: 'gutt',  text: 'Se på Blakken! Noen har flettet manken hans i natt.' },
        { who: 'jente', text: 'Det heter nisseflette. Og nissen har knyttet noe fast i enden av hver flette!' },
        { who: 'gutt',  text: 'Men flettene går i kryss og krok. Kan du følge dem med øynene?' },
      ],
      task: 'Følg fletta fra sløyfa og helt ned. Trykk på riktig sløyfe.',
      items: [
        { key: 'bjelle',   label: 'bjella',      emoji: '🔔', imageUrl: '/images/tryllegarden/ting/bjelle.webp' },
        { key: 'eple',     label: 'eplet',       emoji: '🍎', imageUrl: '/images/tryllegarden/ting/eple.webp' },
        { key: 'gulrot',   label: 'gulrota',     emoji: '🥕', imageUrl: '/images/tryllegarden/ting/gulrot.webp' },
        { key: 'sokk',     label: 'sokken',      emoji: '🧦', imageUrl: '/images/tryllegarden/pynt/sokk.webp', from: 'laerling' },
        { key: 'sukker',   label: 'sukkertøyet', emoji: '🍬', from: 'mester', imageUrl: '/images/tryllegarden/ting/sukkertoy.webp' },
        { key: 'stjerne',  label: 'stjerna',     emoji: '⭐', imageUrl: '/images/tryllegarden/pynt/stjerne8.webp', from: 'mester' },
      ],
      levels: {
        smanisse: { rounds: [3, 3] },
        laerling: { rounds: [4, 4] },
        mester:   { rounds: [5, 6] },
      },
      hints: [
        'Start nederst ved tingen, og følg fletta oppover i stedet.',
        'Følg med fingeren på skjermen, sakte, gjennom alle kryssene.',
      ],
      done: 'Du mistet ikke tråden! En tryllekunstner følger med på én ting, selv når mye skjer.',
      traditionShort:
        'Fant bonden fletter i manken på hesten om morgenen, sa folk at nissen hadde vært der. Det het nisseflette.',
      traditionLong:
        'Folk trodde nissen stelte ekstra godt med hesten han likte best. Flettene skulle få være i fred. Klipte man dem av, kunne nissen bli fornærmet.',
      trickTitle: 'Den umulige knuten',
      trickEffect:
        'Du ber en venn knyte en knute på et bånd uten å slippe endene. Det går ikke! Men du klarer det på et blunk.',
      trickAge: 7,
      trickSlug: 'den-umulige-knuten',
      nisseX: 24, nisseY: 50, nisseInScene: true,
    },
    {
      key: 'bakstehuset',
      slot: 4,
      title: 'Bakstehuset',
      mechanic: 'monster',
      icon: '🍪',
      mapX: 88, mapY: 67,
      ornament: '🟠',
      ornamentImageUrl: '/images/tryllegarden/pynt/pepperkakehjerte.webp',
      backdrop: 'bakst',
      sceneImageUrl: '/images/tryllegarden/scene/bakstehuset.webp',
      sceneAlt: 'Bakstehuset: bakerovn med glør, et stort bord med mel og kjevle, kakebokser og kaker til avkjøling. Nissen titter fram bak ovnen.',
      intro: [
        { who: 'jente', text: 'Mmm, det lukter julekaker! Her bakes det sju slag.' },
        { who: 'gutt',  text: 'Kakene skal ligge i mønster i boksen. Men nissen har smakt på noen av dem!' },
        { who: 'jente', text: 'Ser du hvilke kaker som mangler?' },
      ],
      task: 'Se på mønsteret. Trykk på kaka som skal ligge i den tomme plassen.',
      items: [
        { key: 'pepperkake',    label: 'Pepperkake',    emoji: '🍪', imageUrl: '/images/tryllegarden/kaker/pepperkake.webp' },
        { key: 'smultring',     label: 'Smultring',     emoji: '🍩', imageUrl: '/images/tryllegarden/kaker/smultring.webp' },
        { key: 'krumkake',      label: 'Krumkake',      emoji: '🥐', imageUrl: '/images/tryllegarden/kaker/krumkake.webp' },
        { key: 'sandkake',      label: 'Sandkake',      emoji: '🧁', from: 'laerling', imageUrl: '/images/tryllegarden/kaker/sandkake.webp' },
        { key: 'berlinerkrans', label: 'Berlinerkrans', emoji: '🥨', from: 'mester', imageUrl: '/images/tryllegarden/kaker/berlinerkrans.webp' },
        { key: 'goro',          label: 'Goro',          emoji: '🧇', from: 'mester', imageUrl: '/images/tryllegarden/kaker/goro.webp' },
      ],
      levels: {
        smanisse: { rounds: [6, 6] },
        laerling: { rounds: [8, 8, 9] },
        mester:   { rounds: [9, 10, 12] },
      },
      hints: [
        'Si navnene på kakene høyt, som en regle. Da hører du mønsteret.',
        'Se på de første kakene i raden. Mønsteret begynner på nytt etter dem.',
      ],
      done: 'Alle kakene er på plass! En tryllekunstner ser mønsteret før alle andre.',
      traditionShort:
        'Til jul skal det være sju slag kaker i huset. Det er en gammel norsk tradisjon.',
      traditionLong:
        'Ingen er helt enige om hvilke sju det skal være. Pepperkaker, smultringer, krumkaker, sandkaker, berlinerkranser, goro og fattigmann er blant de vanligste.',
      trickTitle: 'Pepperkaka som vet svaret',
      trickEffect:
        'En venn tenker på et hemmelig tall og regner litt i hodet. Så løfter du på en pepperkake. Under den ligger en lapp – med svaret!',
      trickAge: 8,
      trickSlug: 'pepperkaka-som-vet-svaret',
      nisseX: 32, nisseY: 37, nisseInScene: true,
    },
    {
      key: 'stua',
      slot: 5,
      title: 'Stua',
      mechanic: 'flett',
      icon: '❤️',
      mapX: 66, mapY: 83,
      ornament: '💗',
      ornamentImageUrl: '/images/tryllegarden/pynt/julehjerte.webp',
      backdrop: 'stue',
      sceneImageUrl: '/images/tryllegarden/scene/stua.webp',
      sceneAlt: 'Stua: peis med strikkede strømper, bord med glanspapir, saks og flettede julekurver, og et juletre. Nissen titter fram bak treet.',
      intro: [
        { who: 'gutt',  text: 'I stua lager de julepynt. Se, flettede julekurver, formet som hjerter!' },
        { who: 'jente', text: 'Nissen har begynt på en, men den ble ikke ferdig.' },
        { who: 'gutt',  text: 'Annenhver rute skal være rød og hvit. Rutene står på skrå, som ruter i en kortstokk. Kan du flette hjertet ferdig?' },
      ],
      task: 'Trykk på rutene til hjertet ditt er likt mønsteret.',
      items: [
        { key: 'rod',  label: 'rød',  colors: ['#b3262d'] },
        { key: 'hvit', label: 'hvit', colors: ['#ffffff'] },
      ],
      levels: {
        smanisse: { rounds: [2, 3] },
        laerling: { rounds: [3, 4] },
        mester:   { rounds: [4, 5] },
      },
      hints: [
        'Ta én skrå rad om gangen.',
        'Sammenlign rute for rute med mønsteret. Trykk på dem som har feil farge.',
      ],
      done: 'For et fint julehjerte! En tryllekunstner har tålmodige fingre.',
      traditionShort:
        'Julekurver flettes av to papirbiter til et hjerte og henges på juletreet. Ofte ligger det godteri oppi.',
      traditionLong:
        'En ekte julekurv er litt magisk: Papirremsene er doble og tres gjennom hverandre, ikke bare over og under. Derfor kan hjertet åpnes, som en liten pose.',
      craft: {
        title: 'Lag din egen julekurv',
        needs: 'Du trenger: tynt papir i to farger, saks, blyant, linjal, litt papp og lim. Be gjerne en voksen om hjelp til klippingen.',
        steps: [
          { imageUrl: '/images/tryllegarden/lag/julekurv-1.svg', text: 'Lag en mal av papp: en firkant på 10 ganger 10 centimeter, med en halv sirkel på toppen.' },
          { imageUrl: '/images/tryllegarden/lag/julekurv-2.svg', text: 'Brett et ark dobbelt. Legg den rette kanten på malen helt inntil bretten, tegn rundt og klipp ut. Ikke klipp i bretten! Lag en del i hver farge.' },
          { imageUrl: '/images/tryllegarden/lag/julekurv-3.svg', text: 'Klipp tre snitt fra bretten og opp til der buen begynner. Nå har hver del fire doble remser.' },
          { imageUrl: '/images/tryllegarden/lag/julekurv-4.svg', text: 'Flett! Remsene er doble, som små løkker. Tre den første remsa gjennom en løkke, og la neste løkke gå gjennom remsa. Annenhver gang, hele veien. Neste rad begynner motsatt.' },
          { imageUrl: '/images/tryllegarden/lag/julekurv-5.svg', text: 'Skyv remsene forsiktig på plass. Lim på en papirremse som hank. Nå kan kurven åpnes, og du kan henge den på treet!' },
        ],
      },
      trickTitle: 'Gå gjennom et julekort',
      trickEffect:
        'Du viser fram et helt vanlig julekort og sier at du kan gå tvers gjennom det. Ingen tror deg. Noen klipp senere stiger du rett gjennom kortet!',
      trickAge: 8,
      trickSlug: 'ga-gjennom-et-julekort',
      nisseX: 88, nisseY: 39, nisseInScene: true,
    },
    {
      key: 'stabburet',
      slot: 6,
      title: 'Stabburet',
      mechanic: 'forandret',
      icon: '🧀',
      mapX: 42, mapY: 56,
      ornament: '🟢',
      ornamentImageUrl: '/images/tryllegarden/pynt/gris.webp',
      backdrop: 'stabbur',
      sceneImageUrl: '/images/tryllegarden/scene/stabburet.webp',
      sceneAlt: 'Inne i stabburet: to hyller på tømmerveggen, spekemat og flatbrød under taket og en tent lykt. Nissen titter fram bak ei tønne.',
      intro: [
        { who: 'jente', text: 'Her på stabburet står all julematen.' },
        { who: 'gutt',  text: 'Nissen pleier å stikke innom og bytte om på ting. Bare på moro!' },
        { who: 'jente', text: 'Se godt på hyllene først. Så ser vi om du merker hva han gjør.' },
      ],
      task: 'Se nøye på hyllene. Finn det nissen har byttet ut.',
      items: [
        { key: 'ost',      label: 'Osten',         emoji: '🧀', imageUrl: '/images/tryllegarden/stabbur/ost.webp', x: 27, y: 37.5 },
        { key: 'syltetoy', label: 'Syltetøyet',    emoji: '🫙', imageUrl: '/images/tryllegarden/stabbur/syltetoy.webp', x: 40.5, y: 37.5 },
        { key: 'epler',    label: 'Eplet',         emoji: '🍎', imageUrl: '/images/tryllegarden/stabbur/eple.webp', x: 54, y: 37.5 },
        { key: 'gris',     label: 'Marsipangrisen', emoji: '🐷', imageUrl: '/images/tryllegarden/stabbur/gris.webp', x: 67.5, y: 37.5 },
        { key: 'brod',     label: 'Brødet',        emoji: '🍞', imageUrl: '/images/tryllegarden/stabbur/brod.webp', x: 27, y: 56 },
        { key: 'smor',     label: 'Smøret',        emoji: '🧈', imageUrl: '/images/tryllegarden/stabbur/smor.webp', x: 40.5, y: 56 },
        { key: 'notter',   label: 'Nøttene',       emoji: '🌰', imageUrl: '/images/tryllegarden/stabbur/notter.webp', x: 54, y: 56 },
        { key: 'honning',  label: 'Honningen',     emoji: '🍯', imageUrl: '/images/tryllegarden/stabbur/honning.webp', x: 67.5, y: 56 },
        { key: 'lys',      label: 'Lyset',         emoji: '🕯️', imageUrl: '/images/tryllegarden/stabbur/lys.webp', x: 81, y: 37.5 },
        { key: 'kurv',     label: 'Kurven',        emoji: '🧺', imageUrl: '/images/tryllegarden/stabbur/kurv.webp', x: 81, y: 56 },
      ],
      levels: {
        smanisse: { rounds: [3, 4] },
        laerling: { rounds: [5, 6] },
        mester:   { rounds: [7, 8, 9] },
      },
      hints: [
        'Si høyt hva som står på hyllene før du trykker på «Jeg er klar».',
        'Trykk på «Se hvordan det var» og sammenlign én hylle om gangen.',
      ],
      done: 'Deg lurer han ikke! En tryllekunstner legger merke til det minste som forandrer seg.',
      traditionShort:
        'På stabburet oppbevarte gården maten gjennom vinteren. Huset står på stolper, så musene ikke kommer seg inn.',
      traditionLong:
        'Til jul hentet man fram det beste fra stabburet. I julegrøten gjemmes det en mandel, og den som finner mandelen, får en marsipangris!',
      trickTitle: 'Klementinen som teller',
      trickEffect:
        'Du holder opp en klementin og sier hvor mange båter den har inni. Så skreller du den, og alle teller. Det stemmer!',
      trickAge: 8,
      trickSlug: 'klementinen-som-teller',
      nisseX: 15, nisseY: 61, nisseInScene: true,
    },
    {
      key: 'lyktestien',
      slot: 7,
      title: 'Lyktestien',
      mechanic: 'tenn',
      icon: '🏮',
      mapX: 36, mapY: 82,
      ornament: '🟤',
      ornamentImageUrl: '/images/tryllegarden/pynt/lykt.webp',
      backdrop: 'sti',
      sceneAlt: 'En snødekt sti med fire lykter på rekke.',
      intro: [
        { who: 'gutt',  text: 'Langs stien står det fire lykter. Én for hver søndag i advent.' },
        { who: 'jente', text: 'Men nissen har tullet med dem. Noen lykter henger sammen!' },
        { who: 'gutt',  text: 'Klarer du å få alle fire til å lyse samtidig?' },
      ],
      task: 'Trykk på lyktene til alle lyser.',
      items: [
        { key: 'lykt', label: 'Lykt', emoji: '🏮', imageUrl: '/images/tryllegarden/ting/lykt.webp' },
      ],
      levels: {
        smanisse: { rounds: [4] },
        laerling: { rounds: [4, 4] },
        mester:   { rounds: [4, 5] },
      },
      hints: [
        'Trykk på én lykt og se nøye etter hvilke som forandrer seg.',
        'Noen ganger må du slukke en lykt for å få tent en annen.',
      ],
      done: 'Nå lyser hele stien! En tryllekunstner tenker ett steg fram.',
      traditionShort:
        'I advent tenner vi ett lys hver søndag. Når alle fire lysene brenner, er det snart jul.',
      traditionLong:
        'Advent betyr «komme». Det er de fire ukene før jul, da vi venter og gjør alt klart.',
      trickTitle: 'Tankeleser-lysene',
      trickEffect:
        'Den ene tryllekunstneren går ut av rommet. Publikum velger ett lys. Tryllekunstneren kommer inn igjen – og vet hvilket lys det var!',
      trickAge: 9,
      trickSlug: 'tankeleser-lysene',
      nisseX: 6, nisseY: 70,
    },
    {
      key: 'klokketarnet',
      slot: 8,
      title: 'Klokketårnet',
      mechanic: 'husk',
      icon: '🔔',
      mapX: 46, mapY: 9,
      ornament: '🔔',
      ornamentImageUrl: '/images/tryllegarden/pynt/gullbjelle.webp',
      sceneImageUrl: '/images/tryllegarden/scene/klokketarnet.webp',
      sceneAlt: 'Inne i det lille klokketårnet: bjeller på en bjelke, et tykt bjelletau, et vindu med nattehimmel og en tent lykt. Nissen titter over en bjelke.',
      intro: [
        { who: 'jente', text: 'Hører du det? Noen har ringt i bjellene i klokketårnet!' },
        { who: 'gutt',  text: 'På julaften klokka fem ringer klokkene inn julen. Nissen øver i hemmelighet.' },
        { who: 'jente', text: 'Klarer du å huske hvilken bjelle som ringte først, og hvilken som kom etterpå?' },
      ],
      task: 'Se hvilken bjelle som ringer først. Trykk på bjellene i samme rekkefølge.',
      items: [
        { key: 'gull',   label: 'Gullbjella',   imageUrl: '/images/tryllegarden/klokker/gull.webp',   x: 14, y: 72, size: 14 },
        { key: 'grønn',  label: 'Grønn bjelle', imageUrl: '/images/tryllegarden/klokker/gronn.webp',  x: 30, y: 72, size: 14 },
        { key: 'rød',    label: 'Rød bjelle',   imageUrl: '/images/tryllegarden/klokker/rod.webp',    x: 64, y: 72, size: 14 },
        { key: 'sølv',   label: 'Sølvbjella',   imageUrl: '/images/tryllegarden/klokker/solv.webp',   x: 80, y: 72, size: 14, from: 'laerling' },
        { key: 'kobber', label: 'Kobberbjella', imageUrl: '/images/tryllegarden/klokker/kobber.webp', x: 44, y: 72, size: 14, from: 'mester' },
      ],
      levels: {
        smanisse: { rounds: [2, 3] },
        laerling: { rounds: [3, 4] },
        mester:   { rounds: [4, 5], reverse: true },
      },
      hints: [
        'Si fargene høyt mens bjellene ringer: gull, grønn, rød …',
        'Trykk på «Vis en gang til» og følg med på den første bjella.',
      ],
      done: 'For en hukommelse! En tryllekunstner husker rekkefølgen, selv når mye skjer.',
      traditionShort:
        'På julaften klokka 17 ringer kirkeklokkene inn julen. Da skal alt være gjort ferdig, og høytiden begynner.',
      traditionLong:
        'Klokkene er et signal. Når de ringer, legger man fra seg arbeidet og setter seg til å feire.',
      trickTitle: 'Bjella som lystrer',
      trickEffect:
        'Du holder opp en liten bjelle og ber den ringe – og den ringer. Du ber den være stille – og det blir helt stille!',
      trickAge: 7,
      trickSlug: 'bjella-som-lystrer',
      nisseX: 38, nisseY: 47, nisseInScene: true,
    },
    {
      key: 'skogen',
      slot: 9,
      title: 'Skogen',
      mechanic: 'gjett',
      icon: '🌲',
      mapX: 9, mapY: 18,
      ornament: '🌲',
      ornamentImageUrl: '/images/tryllegarden/pynt/gran.webp',
      sceneImageUrl: '/images/tryllegarden/scene/skogen.webp',
      sceneAlt: 'Skogen en stjerneklar vinternatt. Fotspor i snøen fører til et stort tre, og nissen titter fram bak stammen.',
      intro: [
        { who: 'gutt',  text: 'Nissen vil ha et juletre, men han har glemt hvordan et fint tre ser ut!' },
        { who: 'jente', text: 'Han har gitt oss små ledetråder. Se godt på trærne og finn det rette.' },
        { who: 'gutt',  text: 'Fotsporene går mellom trærne. Er det nissen som har gått her?' },
      ],
      task: 'Les ledetråden. Trykk på treet nissen vil ha.',
      items: [
        { key: 'tre1', label: 'Tre 1', imageUrl: '/images/tryllegarden/traer/tre-1.webp', anon: true },
        { key: 'tre2', label: 'Tre 2', imageUrl: '/images/tryllegarden/traer/tre-2.webp', anon: true },
        { key: 'tre3', label: 'Tre 3', imageUrl: '/images/tryllegarden/traer/tre-3.webp', anon: true, from: 'laerling' },
        { key: 'tre4', label: 'Tre 4', imageUrl: '/images/tryllegarden/traer/tre-4.webp', anon: true },
        { key: 'tre5', label: 'Tre 5', imageUrl: '/images/tryllegarden/traer/tre-5.webp', anon: true, from: 'mester' },
        { key: 'tre6', label: 'Tre 6', imageUrl: '/images/tryllegarden/traer/tre-6.webp', anon: true, from: 'mester' },
      ],
      clues: [
        { text: 'Nissen vil ha det høyeste treet.', answer: 'tre1', levels: ['smanisse', 'mester'] },
        { text: 'Nissen vil ha det laveste treet.', answer: 'tre2' },
        { text: 'Nissen vil ha treet med færrest greiner.', answer: 'tre4' },
        { text: 'Nissen vil ha et tre som er høyt og tett.', answer: 'tre1', levels: ['laerling'] },
        { text: 'Nissen vil ha et lavt og tett tre.', answer: 'tre2', levels: ['laerling'] },
        { text: 'Nissen vil ha treet som er midt imellom i høyde, og tett.', answer: 'tre3', levels: ['laerling'] },
        { text: 'Nissen vil ha det nest høyeste treet.', answer: 'tre6', levels: ['mester'] },
        { text: 'Nissen vil ha det tredje høyeste treet.', answer: 'tre5', levels: ['mester'] },
      ],
      levels: {
        smanisse: { rounds: [3] },
        laerling: { rounds: [3] },
        mester:   { rounds: [5] },
      },
      hints: [
        'Se på alle trærne før du velger. Sammenlikn toppene.',
        'Se hvor mange greiner hvert tre har, og hvor høyt det rekker.',
      ],
      done: 'Det var det rette treet! En tryllekunstner ser forskjeller andre overser.',
      traditionShort:
        'Å hente juletre i skogen er en gammel tradisjon i mange familier.',
      traditionLong:
        'Juletreet ble vanlig i norske hjem på 1800-tallet.',
      trickTitle: 'Binders som kobler seg selv',
      trickEffect:
        'To binders sitter løst på en brettet papirstripe. Du drar i endene – og binderne henger plutselig sammen i en lenke!',
      trickAge: 8,
      trickSlug: 'binders-som-kobler-seg',
      nisseX: 79, nisseY: 56, nisseInScene: true,
    },
    {
      key: 'porten',
      slot: 10,
      bonus: true,
      title: 'Porten',
      mechanic: 'gjett',
      icon: '🎭',
      mapX: 21, mapY: 68,
      ornament: '🎭',
      ornamentImageUrl: '/images/tryllegarden/pynt/halmbukk.webp',
      sceneImageUrl: '/images/tryllegarden/scene/porten.webp',
      sceneAlt: 'Gårdsporten en snøfull kveld, med røde hus og lys i vinduene. Nissen titter fram bak en grindstolpe.',
      intro: [
        { who: 'jente', text: 'Mellom jul og nyttår kommer julebukkene! De er utkledd og banker på dørene.' },
        { who: 'gutt',  text: 'Ingen skal vite hvem de er. Men vi kan gjette!' },
        { who: 'jente', text: 'Jeg gir deg en ledetråd, og du finner kostymet.' },
      ],
      task: 'Les ledetråden. Trykk på kostymet som passer.',
      items: [
        { key: 'bukk',    label: 'Julebukken',   emoji: '🐐', imageUrl: '/images/tryllegarden/kostymer/julebukk.webp' },
        { key: 'bjorn',   label: 'Bjørnen',      emoji: '🐻', imageUrl: '/images/tryllegarden/kostymer/bjorn.webp' },
        { key: 'trylle',  label: 'Tryllekunstneren', emoji: '🎩', imageUrl: '/images/tryllegarden/kostymer/tryllekunstner.webp' },
        { key: 'kone',    label: 'Gamle Marit',  emoji: '👵', from: 'laerling', imageUrl: '/images/tryllegarden/kostymer/marit.webp' },
        { key: 'ridder',  label: 'Ridderen',     emoji: '🛡️', from: 'mester', imageUrl: '/images/tryllegarden/kostymer/ridder.webp' },
        { key: 'stjerne', label: 'Stjernegutten', emoji: '⭐', from: 'mester', imageUrl: '/images/tryllegarden/kostymer/stjernegutt.webp' },
      ],
      clues: [
        { text: 'Hvem har horn?', answer: 'bukk' },
        { text: 'Hvem er lodden og elsker honning?', answer: 'bjorn' },
        { text: 'Hvem har flosshatt og tryllestav?', answer: 'trylle' },
        { text: 'Hvem har sjal og går med stokk?', answer: 'kone' },
        { text: 'Hvem har skjold og sverd?', answer: 'ridder' },
        { text: 'Hvem bærer en lysende stjerne og synger?', answer: 'stjerne' },
      ],
      levels: {
        smanisse: { rounds: [3] },
        laerling: { rounds: [4] },
        mester:   { rounds: [5] },
      },
      hints: [
        'Se på alle kostymene før du velger.',
        'Hva har kostymet på hodet, eller i hånda?',
      ],
      done: 'Du kjente dem igjen! En tryllekunstner skjønner hvem som gjemmer seg.',
      traditionShort:
        'Å gå julebukk er å kle seg ut og gå fra hus til hus mellom jul og nyttår. Man synger og får noe godt.',
      traditionLong:
        'Før i tida var det ofte bare de voksne som gikk. Maskene gjorde at ingen visste hvem som banket på.',
      trickTitle: 'Mynten bak øret',
      trickEffect:
        'Du får en mynt til å forsvinne fra hånda – og finner den igjen bak øret til en venn!',
      trickAge: 9,
      trickSlug: 'mynten-bak-oret',
      nisseX: 35, nisseY: 71, nisseInScene: true,
    },
    {
      key: 'sykkelverkstedet',
      slot: 11,
      bonus: true,
      title: 'Sykkelverkstedet',
      mechanic: 'sorter',
      icon: '🚲',
      iconImageUrl: '/images/tryllegarden/verktoy/sykkel-knapp.webp',
      mapX: 80, mapY: 22,
      ornament: '🔧',
      ornamentImageUrl: '/images/tryllegarden/pynt/sykkelbjelle.webp',
      sceneImageUrl: '/images/tryllegarden/scene/sykkelverkstedet.webp',
      sceneAlt: 'Inne i sykkelverkstedet: en sykkel i reparasjonsstativ, en spark, hjul på veggen og en verktøytavle. Nissen titter fram bak et sykkelhjul.',
      intro: [
        { who: 'gutt',  text: 'Her er sykkelverkstedet! Om vinteren fikser de sparker og kjelker her også.' },
        { who: 'jente', text: 'Men se på verktøytavla. Nissen har lånt fastnøklene og hengt dem hulter til bulter.' },
        { who: 'gutt',  text: 'Kan du henge dem på rekke, fra den korteste til den lengste?' },
      ],
      task: 'Trykk på fastnøklene i rekkefølge: først den korteste, så den neste, helt til den lengste.',
      items: [
        { key: 'nokkel1', label: 'Fastnøkkel', imageUrl: '/images/tryllegarden/verktoy/nokkel-1.webp', size: 124 },
        { key: 'nokkel2', label: 'Fastnøkkel', imageUrl: '/images/tryllegarden/verktoy/nokkel-2.webp', size: 156 },
        { key: 'nokkel3', label: 'Fastnøkkel', imageUrl: '/images/tryllegarden/verktoy/nokkel-3.webp', size: 184 },
        { key: 'nokkel4', label: 'Fastnøkkel', imageUrl: '/images/tryllegarden/verktoy/nokkel-4.webp', size: 203 },
        { key: 'nokkel5', label: 'Fastnøkkel', imageUrl: '/images/tryllegarden/verktoy/nokkel-5.webp', size: 222 },
        { key: 'nokkel6', label: 'Fastnøkkel', imageUrl: '/images/tryllegarden/verktoy/nokkel-6.webp', size: 250 },
      ],
      levels: {
        smanisse: { rounds: [3] },
        laerling: { rounds: [4, 5] },
        mester:   { rounds: [5, 6] },
      },
      hints: [
        'Se først hvilken fastnøkkel som er aller kortest.',
        'Sammenlign to og to som henger ved siden av hverandre.',
      ],
      done: 'Alle fastnøklene henger på rekke! En tryllekunstner har orden på tingene sine.',
      traditionShort:
        'Før i tida reparerte folk tingene sine i stedet for å kjøpe nytt. Før jul ble sleder, kjelker og sparker satt i stand.',
      traditionLong:
        'En spark eller en kjelke var en stor julegave. Med den kunne barna renne i bakkene hele romjula.',
      trickTitle: 'Pendelen som lystrer',
      trickEffect:
        'En mutter henger i en tråd og står helt stille. Du ber den svinge – og den begynner å svinge, uten at du tar på den!',
      trickAge: 7,
      trickSlug: 'pendelen-som-lystrer',
      nisseX: 9, nisseY: 43, nisseInScene: true,
    },
    {
      key: 'honsehuset',
      slot: 12,
      bonus: true,
      title: 'Fuglehuset',
      mechanic: 'tell',
      icon: '🐔',
      mapX: 90, mapY: 43,
      ornament: '🥚',
      ornamentImageUrl: '/images/tryllegarden/honsehus/egg-1.webp',
      sceneImageUrl: '/images/tryllegarden/scene/honsehuset.webp',
      sceneAlt: 'Inne i fuglehuset: reirkasser med halm og egg, en tent lykt, et vindu mot nattehimmelen og et trau. Nissen titter fram fra en reirkasse.',
      intro: [
        { who: 'gutt',  text: 'Dette er fuglehuset! Her bor hønene, og en kanin.' },
        { who: 'jente', text: 'Og der sitter kakaduen Loco! Han er på julebesøk. Loco danser når han blir glad.' },
        { who: 'gutt',  text: 'Dyra skal ha ekstra god mat på julaften. Også hønene.' },
        { who: 'jente', text: 'Nissen har prøvd å telle hønene og eggene, men han mister alltid tellingen.' },
        { who: 'gutt',  text: 'Kan du hjelpe ham? Tell riktig, så danser Loco for deg.' },
      ],
      task: 'Se godt etter. Tell, og trykk på riktig tall.',
      items: [
        { key: 'egg1',  label: 'Egg',        imageUrl: '/images/tryllegarden/honsehus/egg-1.webp' },
        { key: 'egg2',  label: 'Egg',        imageUrl: '/images/tryllegarden/honsehus/egg-2.webp', from: 'laerling' },
        { key: 'hone1', label: 'Hvit høne',  imageUrl: '/images/tryllegarden/honsehus/hone-1.webp', from: 'laerling' },
        { key: 'hone2', label: 'Brun høne',  imageUrl: '/images/tryllegarden/honsehus/hone-2.webp', from: 'laerling' },
        { key: 'hone3', label: 'Rød høne',   imageUrl: '/images/tryllegarden/honsehus/hone-3.webp', from: 'laerling' },
      ],
      levels: {
        smanisse: { rounds: [3, 4] },
        laerling: { rounds: [4, 5, 6] },
        mester:   { rounds: [6, 7, 8, 9] },
      },
      hints: [
        'Tell høyt, én og én. Pek med fingeren på skjermen.',
        'Trykk på «Vis en gang til» og tell enda en gang, litt saktere.',
      ],
      done: 'Du teller som en ekte regnemester! En tryllekunstner har god oversikt.',
      traditionShort:
        'På julaften fikk husdyra ekstra mat. Mange mente at dyra skulle ha det fint før menneskene satte seg til bords.',
      traditionLong:
        'Hønene fikk gjerne litt ekstra korn, og noen satte ut en skål grøt til nissen.',
      trickTitle: 'Egget som røper seg',
      trickEffect:
        'To egg ser helt like ut. Du kan si hvilket som er kokt og hvilket som er rått, uten å knekke dem!',
      trickAge: 8,
      trickSlug: 'egget-som-roper-seg',
      nisseX: 66, nisseY: 59, nisseInScene: true,
      dancer: { name: 'Loco', imageUrl: '/images/tryllegarden/honsehus/loco.webp', danceImageUrl: '/images/tryllegarden/honsehus/loco-danser.webp', idleImageUrls: ['/images/tryllegarden/honsehus/loco-skra-1.webp', '/images/tryllegarden/honsehus/loco-skra-2.webp'], x: 24.5, y: 24.7, size: 22 },
    },
    {
      key: 'tryllemuseet',
      slot: 13,
      bonus: true,
      title: 'Tryllemuseet',
      mechanic: 'forandret',
      icon: '🎩',
      iconImageUrl: '/hero-mark-gold.png',
      mapX: 27, mapY: 20,
      ornament: '🃏',
      sceneImageUrl: '/images/tryllegarden/scene/tryllemuseet.webp',
      sceneAlt: 'Inne i Tryllemuseet: tryllekunstneren Jan holder opp et ess og viser to barn i flosshatt et triks rundt et grønt kortbord. På veggen henger en tavle, plakater og hyller med bøker, og en kanin titter opp av en hatt.',
      intro: [
        { who: 'jente', text: 'Bak låven, over låvebrua, ligger Tryllemuseet! Der bor tryllekunsten hele året.' },
        { who: 'jan',   text: 'Hei, jeg heter Jan, og jeg er tryllekunstner her. Se på kortene på bordet. Når du ikke ser etter, bytter jeg ett av dem.' },
        { who: 'gutt',  text: 'Klarer du å se hvilket kort som er byttet?' },
      ],
      task: 'Se nøye på kortene. Finn kortet Jan har byttet ut.',
      lookAt: 'kortene',
      lookAtEn: 'the cards',
      items: [
        { key: 'kort1', label: 'Spar ess', imageUrl: '/images/tryllegarden/kortspill/kort-01.svg', x: 11.0, y: 95, size: 8.6 },
        { key: 'kort2', label: 'Hjerter konge', imageUrl: '/images/tryllegarden/kortspill/kort-02.svg', x: 19.7, y: 95, size: 8.6 },
        { key: 'kort3', label: 'Ruter dame', imageUrl: '/images/tryllegarden/kortspill/kort-03.svg', x: 28.3, y: 95, size: 8.6 },
        { key: 'kort4', label: 'Kløver knekt', imageUrl: '/images/tryllegarden/kortspill/kort-04.svg', x: 37.0, y: 95, size: 8.6 },
        { key: 'kort5', label: 'Hjerter ti', imageUrl: '/images/tryllegarden/kortspill/kort-05.svg', x: 45.7, y: 95, size: 8.6 },
        { key: 'kort6', label: 'Spar sju', imageUrl: '/images/tryllegarden/kortspill/kort-06.svg', x: 54.4, y: 95, size: 8.6 },
        { key: 'kort7', label: 'Ruter fem', imageUrl: '/images/tryllegarden/kortspill/kort-07.svg', x: 63.0, y: 95, size: 8.6 },
        { key: 'kort8', label: 'Kløver to', imageUrl: '/images/tryllegarden/kortspill/kort-08.svg', x: 71.7, y: 95, size: 8.6 },
        { key: 'kort9', label: 'Kløver ni', imageUrl: '/images/tryllegarden/kortspill/kort-09.svg', x: 80.4, y: 95, size: 8.6 },
        { key: 'kort10', label: 'Hjerter fire', imageUrl: '/images/tryllegarden/kortspill/kort-10.svg', x: 89.0, y: 95, size: 8.6 },
      ],
      levels: {
        smanisse: { rounds: [3, 4] },
        laerling: { rounds: [5, 6] },
        mester:   { rounds: [7, 8, 9] },
      },
      hints: [
        'Si kortene høyt, fra venstre mot høyre, før du trykker på «Jeg er klar».',
        'Trykk på «Se hvordan det var» og sammenlign ett kort om gangen.',
      ],
      done: 'Skarpe øyne! Jan ble imponert. En tryllekunstner ser det minste som forandrer seg.',
      traditionShort:
        'Tryllemuseet ligger på Årvoll gård, på baksiden av låven. Der samles tryllekunstens historie, og der kan du møte ekte tryllekunstnere.',
      traditionLong:
        'Tryllegården er laget ut fra Årvoll gård i Oslo, der Tryllemuseet holder til. Museet er åpent søndager kl. 12–15, og inngangen er gratis.',
      traditionLinkUrl: '/aktiviteter',
      traditionLinkLabel: 'Se når det er kurs og forestilling',
      trickTitle: 'Møt Jan på ekte',
      trickEffect:
        'Jan tryller for deg i museet, og på kurs kan du lære å gjøre det selv. Hemmeligheten hans må du få fortalt av ham selv!',
      trickNote: 'Kom innom Tryllemuseet søndager kl. 12–15, så viser Jan deg hvordan.',
      nisseX: 94, nisseY: 52,
    },
  ],
  finaleTitle: 'Stjerna på treet',
  finale: [
    { who: 'forteller', text: 'All pynten henger på treet. Inne på låven er det tent lykter, og dyra har satt seg på benkene.' },
    { who: 'jente',     text: 'I kveld holder vi juleforestilling – for alle som bor på {gard}!' },
    { who: 'gutt',      text: 'Og du bestemmer hva vi skal vise.' },
  ],
}

export const BUILT_IN_SEASONS: Record<string, FarmSeason> = { jul }
export const DEFAULT_SEASON_KEY = 'jul'

// ── Sanity overrides ──────────────────────────────────────────────

type Loose = Record<string, unknown>

const isEmpty = (v: unknown) =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)

/** Fields of `over` that are filled in win; everything else stays. */
function overlay<T>(base: T, over: Loose | null | undefined): T {
  if (!over) return base
  const out = { ...(base as Loose) }
  for (const [k, v] of Object.entries(over)) {
    if (k.startsWith('_') || isEmpty(v)) continue
    out[k] = v
  }
  return out as T
}

/**
 * A farmSeason document from Sanity on top of a built-in pack. Places are
 * matched by key: a known key overrides the built-in place field by field
 * (arrays as a whole), an unknown key adds a place after the built-in ones.
 * `hidden` lists place keys switched off in Studio.
 */
export function mergeSeason(
  base: FarmSeason | undefined,
  doc: (Loose & { places?: Loose[]; hidden?: string[] }) | null,
): FarmSeason | null {
  if (!base && !doc) return null
  if (!doc) return base!
  const { places: docPlaces, hidden, palette, ...rest } = doc
  const start: FarmSeason = base ?? ({
    key: String(doc.key ?? ''), title: '', intro: '',
    palette: jul.palette, collectionName: '', collectionTop: '⭐',
    places: [], finaleTitle: '', finale: [], loftName: '',
  })
  const season = overlay(start, rest)
  season.palette = overlay(start.palette, palette as Loose | undefined)

  // Built-in places keep their order; places only the document has follow.
  const docByKey = new Map<string, Loose>()
  for (const dp of docPlaces ?? []) if (typeof dp.key === 'string' && dp.key) docByKey.set(dp.key, dp)
  const places = start.places.map(p => {
    const dp = docByKey.get(p.key)
    docByKey.delete(p.key)
    return overlay(p, dp)
  })
  for (const [key, dp] of docByKey) {
    places.push(overlay({ key, items: [], intro: [], hints: [] } as unknown as FarmPlace, dp))
  }
  const off = new Set(hidden ?? [])
  season.places = places.filter(p => !off.has(p.key) && isPlayable(p))
  return season
}

/** A place the engine can actually run. */
export function isPlayable(p: FarmPlace): boolean {
  return !!p.key && !!p.title && FARM_MECHANICS.includes(p.mechanic) && Array.isArray(p.items) && p.items.length > 0
}
