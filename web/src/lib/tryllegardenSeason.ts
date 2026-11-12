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
export type FarmMechanic = 'finn' | 'rekkefolge' | 'husk'
export const FARM_MECHANICS: FarmMechanic[] = ['finn', 'rekkefolge', 'husk']

export type FarmSpeaker = 'jente' | 'gutt' | 'nisse' | 'forteller'

export interface FarmLine {
  who:     FarmSpeaker
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
}

export interface FarmLevelParams {
  /** husk: length of each round's sequence. */
  rounds?: number[]
  /** husk: the last round must be answered backwards. */
  reverse?: boolean
}

export interface FarmPlace {
  key:      string
  title:    string
  titleEn?: string
  mechanic: FarmMechanic
  /** Emoji on the map button until the map is drawn. */
  icon: string
  /** Position on the map, in percent. */
  mapX: number
  mapY: number
  /** What this place hangs on the tree (or puts in the basket …). */
  ornament: string
  /** Built-in placeholder backdrop; ignored when sceneImageUrl is set. */
  backdrop?:      'tun' | 'fjos' | 'lave'
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
  traditionLinkUrl?:   string
  traditionLinkLabel?: string
  /** The nisse's trick: what the audience sees. Never the method. */
  trickTitle:     string
  trickTitleEn?:  string
  trickEffect:    string
  trickEffectEn?: string
  /** Slug of the kitTrick document (private dataset) with the method. */
  trickSlug?: string
  /** Where the nisse hides in this place's scene, in percent. */
  nisseX?: number
  nisseY?: number
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
  /** Colours of the game's frame. Any CSS colour. */
  palette: { sky: string; ground: string; accent: string; accent2: string; glow: string }
  /** The thing being filled: "Juletreet", "Påskekurven" … */
  collectionName:    string
  collectionNameEn?: string
  /** What crowns the collection when everything is done. */
  collectionTop: string
  places: FarmPlace[]
  finaleTitle:    string
  finaleTitleEn?: string
  finale: FarmLine[]
  /** Name of the season's bundle in the closed area, as the child sees it. */
  loftName:    string
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
    'På {gard} skjer det rare ting før jul. Noen har spist grøten. Noen har flettet høyet. {jente} og {gutt} tror det bor en nisse i fjøset – og at han kan trylle!',
  heroImageUrl: '/images/tryllegarden/jul-laven.webp',
  heroAlt: 'To tryllebarn med flosshatt tryller en hvit kanin opp av en hatt på låven, mens fjøsnissen ser på og klapper.',
  palette: { sky: '#14213d', ground: '#eef3f8', accent: '#b3262d', accent2: '#1f5c3a', glow: '#f6c453' },
  collectionName: 'Juletreet',
  collectionTop: '⭐',
  loftName: 'Nisseloftet',
  kitSlug: 'nissens-tryllesekk',
  places: [
    {
      key: 'tunet',
      title: 'Tunet',
      mechanic: 'finn',
      icon: '👣',
      mapX: 20, mapY: 66,
      ornament: '🔴',
      backdrop: 'tun',
      sceneAlt: 'Tunet på gården en vinterkveld, med låve, grantrær og snø.',
      intro: [
        { who: 'jente', text: 'Se, {gutt}! Noen har gått over tunet i natt.' },
        { who: 'gutt',  text: 'Bittesmå fotspor … Jeg tror det bor en nisse her på {gard}!' },
        { who: 'jente', text: 'Han har mistet noen ting i snøen. Hjelper du oss å finne dem?' },
      ],
      task: 'Finn alle tingene nissen har lagt igjen på tunet.',
      items: [
        { key: 'fotspor', label: 'Fotsporene',  emoji: '👣', x: 34, y: 82 },
        { key: 'vott',    label: 'Votten',      emoji: '🧤', x: 71, y: 74 },
        { key: 'lykt',    label: 'Lykta',       emoji: '🏮', x: 54, y: 55 },
        { key: 'skje',    label: 'Grøtskjeen',  emoji: '🥄', x: 14, y: 66, from: 'laerling' },
        { key: 'bjelle',  label: 'Bjella',      emoji: '🔔', x: 86, y: 47, from: 'laerling' },
        { key: 'garn',    label: 'Garnnøstet',  emoji: '🧶', x: 45, y: 91, from: 'mester' },
        { key: 'gulrot',  label: 'Gulrota',     emoji: '🥕', x: 6,  y: 88, from: 'mester' },
      ],
      hints: [
        'Se nøye i snøen, helt nederst.',
        'Noe ligger ved låveveggen, og noe ligger ved gjerdet.',
      ],
      done: 'Bra sett! En tryllekunstner må se det ingen andre ser.',
      traditionShort:
        'Fjøsnissen er en liten kar som bor på gården og passer på dyra. Han er sjenert, så nesten ingen får se ham.',
      traditionLong:
        'I gamle dager trodde folk at det bodde en nisse på hver gård. Han hadde grå klær og rød lue, og var ikke større enn et barn. Var folk snille mot dyra, hjalp nissen til om natta.',
      trickTitle: 'Strikken som hopper',
      trickEffect:
        'Du setter en strikk rundt pekefingeren og langfingeren. Du knytter hånda og sier trylleordet. Vips – strikken har hoppet over til de to andre fingrene!',
      trickSlug: 'strikken-som-hopper',
      nisseX: 90, nisseY: 28,
    },
    {
      key: 'fjoset',
      title: 'Fjøset',
      mechanic: 'rekkefolge',
      icon: '🥣',
      mapX: 50, mapY: 24,
      ornament: '🟡',
      backdrop: 'fjos',
      sceneAlt: 'Inne i fjøset, med lykt, høy og en gryte på bordet.',
      intro: [
        { who: 'gutt',  text: 'Det lukter grøt her! Men gryta er tom …' },
        { who: 'jente', text: 'Nissen blir så glad for julegrøt. Skal vi koke en ny til ham?' },
        { who: 'gutt',  text: 'Da må vi gjøre alt i riktig rekkefølge. Kan du hjelpe oss?' },
      ],
      task: 'Trykk på det som skal skje først. Så det neste, helt til grøten er ferdig.',
      items: [
        { key: 'gryte', label: 'Ha melk og ris i gryta',         emoji: '🥛', order: 1 },
        { key: 'ror',   label: 'Rør og rør til grøten er tykk',  emoji: '🥄', order: 2, from: 'laerling' },
        { key: 'skal',  label: 'Øs grøten opp i skåla',          emoji: '🥣', order: 3, from: 'laerling' },
        { key: 'kanel', label: 'Dryss på sukker og kanel',       emoji: '✨', order: 4, from: 'mester' },
        { key: 'smor',  label: 'Legg en klatt smør i midten',    emoji: '🧈', order: 5 },
        { key: 'lave',  label: 'Bær skåla ut på låven',          emoji: '🏮', order: 6 },
        { key: 'sokk',  label: 'Legg en sokk oppi',              emoji: '🧦', decoy: true, from: 'mester',
          wrong: 'Sokk i grøten? Nei, fy da! Den hører ikke hjemme her.' },
        { key: 'agurk', label: 'Pynt med sylteagurk',            emoji: '🥒', decoy: true, from: 'mester',
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
      trickSlug: 'kanelstanga-av-gummi',
      nisseX: 8, nisseY: 30,
    },
    {
      key: 'laven',
      title: 'Låven',
      mechanic: 'husk',
      icon: '🌾',
      mapX: 80, mapY: 62,
      ornament: '🔵',
      backdrop: 'lave',
      sceneAlt: 'Juleneket henger på en stang utenfor låven. Det snør.',
      intro: [
        { who: 'jente', text: 'Hysj! Det sitter fugler på juleneket.' },
        { who: 'gutt',  text: 'De lander én og én. Nissen vet nok hvem som kom først.' },
        { who: 'jente', text: 'Klarer du å huske rekkefølgen?' },
      ],
      task: 'Se hvem som lander først. Trykk på fuglene i samme rekkefølge.',
      items: [
        { key: 'dompap',    label: 'Dompap',    x: 30, y: 30, colors: ['#5b6470', '#d9423a', '#1b1b1f'] },
        { key: 'kjottmeis', label: 'Kjøttmeis', x: 70, y: 30, colors: ['#6f8f3a', '#f2d13d', '#1b1b1f'] },
        { key: 'graspurv',  label: 'Gråspurv',  x: 50, y: 62, colors: ['#8a6a4a', '#d8cbb8', '#6b4a2e'] },
        { key: 'blameis',   label: 'Blåmeis',   x: 18, y: 64, colors: ['#5f86b8', '#f2d86a', '#2f6fc0'], from: 'laerling' },
        { key: 'gulspurv',  label: 'Gulspurv',  x: 82, y: 64, colors: ['#a07a3c', '#f0cf3a', '#f0cf3a'], from: 'mester' },
        { key: 'skjaere',   label: 'Skjære',    x: 50, y: 14, colors: ['#1b1b1f', '#ffffff', '#1b1b1f'], from: 'mester' },
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
        'På den ene siden av en papirskive er det en fugl. På den andre siden er det et julenek. Du snurrer skiva – og plutselig sitter fuglen på neket!',
      trickSlug: 'fuglen-pa-neket',
      nisseX: 92, nisseY: 84,
    },
  ],
  finaleTitle: 'Stjerna på treet',
  finale: [
    { who: 'forteller', text: 'Juletreet på tunet lyser. På låvebrua ligger det en lapp med skjeve bokstaver.' },
    { who: 'nisse',     text: 'Takk for hjelpa. Triksene mine ligger på loftet. Hilsen N.' },
    { who: 'jente',     text: 'Nissen har gitt oss nøkkelen til Nisseloftet!' },
    { who: 'gutt',      text: 'Der ligger alle hemmelighetene. Men husk: En tryllekunstner forteller aldri hvordan det gjøres.' },
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
