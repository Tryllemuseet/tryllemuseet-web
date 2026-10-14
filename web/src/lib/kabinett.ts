// src/lib/kabinett.ts
//
// Server side of "Det trettende kabinett" (src/pages/det-trettende-kabinett.astro).
// Server-only: imported by /api/kabinett and the on-demand game page, never by
// client scripts.
//
// The game page ships the puzzle mechanics but none of the answers. Everything
// a player could use to skip a puzzle — the answer key, the hints, the replies
// that depend on the answer, the explanation and the "visste du at" facts —
// lives in the gameChapter documents in the private "lukket" dataset, and
// leaves the server only through answer():
//
//   start  → texts a room needs when it opens (the Director's whisper for the
//            chosen path, the principle labels in Vinterhagen, …)
//   hint   → one hint at a time
//   check  → is this answer right? The solution and facts of a puzzle room
//            come back only with a correct, complete answer.
//
// The rules below say how each room's answer is checked; the answer keys
// themselves are only in Sanity (gameChapter.answer).
import { getPrivateClient } from './bakTeppet'
import {
  getGameConfig,
  getGameRoomSecrets,
  portableTextToHtml,
  privateUrlFor,
  type GameRoomSecrets,
} from './sanity'

export type Lang = 'nb' | 'en'

type Kind =
  | 'choice'    // one value; answer: the right value
  | 'set'       // pick n of many; answer: comma list (any order)
  | 'pairs'     // match item i to a partner; answer: comma list, partner of item 0, 1, …
  | 'sequence'  // actions in order; answer: comma list
  | 'film'      // put strips in order, then point at the cut; answer: "<order>|<cut>"
  | 'illusion'  // one or more questions where every answer moves on; answer: "<part 1>|<part 2>…"
  | 'memory'    // yes/no questions; answer: index of the lure question
  | 'equivoque' // the prediction (answer) is handed out at start: the room is a demonstration
  | 'open'      // no question; check just reveals the explanation and facts

const ROOMS: Record<string, Kind> = {
  sandrommet:     'choice',
  speilgangen:    'open',
  markedsplassen: 'choice',
  galleriet:      'open',
  biblioteket:    'pairs',
  oyet:           'illusion',
  salongen:       'choice',
  seansen:        'set',
  frievalget:     'equivoque',
  teateret:       'sequence',
  kinoen:         'film',
  lerretet:       'open',
  verkstedet:     'set',
  minnet:         'memory',
  studioet:       'choice',
  trekanten:      'illusion',
  gatehjornet:    'choice',
  fargene:        'illusion',
  vinterhagen:    'pairs',
  kabinettet:     'open',
  daggry:         'open',
}

export interface KabinettFact {
  text:       string
  linkUrl?:   string
  linkLabel?: string
  imageUrl?:  string
  imageAlt?:  string
}

export interface KabinettSolution {
  html:  string
  facts: KabinettFact[]
}

export interface KabinettRequest {
  action?: unknown
  room?:   unknown
  lang?:   unknown
  path?:   unknown
  n?:      unknown
  part?:   unknown
  value?:  unknown
  values?: unknown
  steps?:  unknown
  pairs?:  unknown
}

export type KabinettResult =
  | { status: 200; body: Record<string, unknown> }
  | { status: 400 | 404 | 503; body: { error: string } }

// ── Data, cached per server instance ─────────────────────────────
// Answers change rarely; a short cache keeps Sanity API usage to about one
// request per minute per running function instead of one per click.
const CACHE_MS = 60_000
let cache: { at: number; active: boolean; rooms: Map<string, GameRoomSecrets> } | null = null

async function loadData() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache
  const priv = getPrivateClient()
  if (!priv) return null
  const [config, rooms] = await Promise.all([getGameConfig(), getGameRoomSecrets(priv.client)])
  cache = {
    at: Date.now(),
    active: config?.isActive === true,
    rooms: new Map(rooms.map(r => [r.key, r])),
  }
  return cache
}

// ── Helpers ──────────────────────────────────────────────────────
const str = (v: unknown, max = 40) => (typeof v === 'string' && v.length <= max ? v : undefined)
const strList = (v: unknown, maxLen = 12) =>
  Array.isArray(v) && v.length <= maxLen && v.every(x => typeof x === 'string' || typeof x === 'number')
    ? v.map(x => String(x).slice(0, 40))
    : undefined

function line(room: GameRoomSecrets, lang: Lang, ...keys: string[]): string {
  for (const key of keys) {
    const r = room.responses?.find(x => x.when === key)
    if (r) return (lang === 'en' && r.textEn) || r.text || ''
  }
  return ''
}

function solution(room: GameRoomSecrets, lang: Lang): KabinettSolution {
  const blocks = (lang === 'en' && room.solutionEn?.length) ? room.solutionEn : room.solution
  return {
    html: portableTextToHtml(blocks, privateUrlFor),
    facts: (room.facts ?? []).map(f => ({
      text: (lang === 'en' && f.textEn) || f.text,
      linkUrl: f.linkUrl,
      linkLabel: (lang === 'en' && f.linkLabelEn) || f.linkLabel,
      ...(f.image?.asset
        ? {
            imageUrl: privateUrlFor(f.image).width(640).format('webp').url(),
            imageAlt: (lang === 'en' && f.image.altEn) || f.image.alt || '',
          }
        : {}),
    })),
  }
}

const parts = (answer: string | undefined) => (answer ?? '').split('|')
const list = (s: string | undefined) => (s ?? '').split(',').map(x => x.trim()).filter(Boolean)
const isPrefix = (steps: string[], of: string[]) => steps.length < of.length && steps.every((s, i) => s === of[i])

// ── Checking an answer ───────────────────────────────────────────
function check(kind: Kind, room: GameRoomSecrets, lang: Lang, req: KabinettRequest): Record<string, unknown> | null {
  const solved = () => solution(room, lang)

  switch (kind) {
    case 'choice': {
      const value = str(req.value)
      if (value === undefined) return null
      const ok = value === room.answer
      return ok
        ? { ok, msg: line(room, lang, 'correct'), solved: solved() }
        : { ok, msg: line(room, lang, `wrong:${value}`, 'wrong') }
    }

    case 'set': {
      const values = strList(req.values)
      if (!values) return null
      const expected = list(room.answer)
      const picked = [...new Set(values)]
      if (picked.length !== expected.length) return { ok: false, invalid: true, msg: line(room, lang, 'count') }
      const hits = picked.filter(v => expected.includes(v)).length
      if (hits === expected.length) return { ok: true, msg: line(room, lang, 'correct'), solved: solved() }
      const path = str(req.path) ?? ''
      return { ok: false, msg: line(room, lang, `wrong:${path}`, 'wrong').replace('{n}', String(hits)) }
    }

    case 'pairs': {
      // All matches so far, the newest last: the room is solved by presenting
      // the complete, correct set.
      if (!Array.isArray(req.pairs) || req.pairs.length > 12) return null
      const expected = list(room.answer)
      const pairs = req.pairs.map(p => strList(p, 2))
      if (pairs.some(p => !p || p.length !== 2)) return null
      const seen = new Set<string>()
      const ok = (pairs as string[][]).every(([item, partner]) => {
        if (seen.has(item)) return false
        seen.add(item)
        return expected[Number(item)] === partner
      })
      if (!ok) return { ok, msg: line(room, lang, 'pair:wrong') }
      return pairs.length === expected.length
        ? { ok, msg: line(room, lang, 'correct'), solved: solved() }
        : { ok, msg: line(room, lang, 'pair:ok') }
    }

    case 'sequence': {
      const steps = strList(req.steps) ?? []
      const value = str(req.value)
      const expected = list(room.answer)
      if (value === undefined || !isPrefix(steps, expected)) return null
      if (value === expected[steps.length]) {
        const done = steps.length + 1 === expected.length
        return { ok: true, msg: line(room, lang, `step:${value}`), ...(done ? { solved: solved() } : {}) }
      }
      if (expected.includes(value) && !steps.includes(value)) {
        return { ok: false, early: true, msg: line(room, lang, `early:${value}`, 'early') }
      }
      return { ok: false, msg: line(room, lang, `wrong:${value}`, 'wrong') }
    }

    case 'film': {
      const [orderKey, cut] = parts(room.answer)
      const order = list(orderKey)
      const steps = strList(req.steps) ?? []
      const value = str(req.value)
      if (value === undefined) return null
      if (req.part === 'order') {
        if (!isPrefix(steps, order)) return null
        const ok = value === order[steps.length]
        return { ok, msg: line(room, lang, ok ? 'order:ok' : 'order:wrong') }
      }
      if (req.part === 'cut') {
        if (steps.length !== order.length || !steps.every((s, i) => s === order[i])) return null
        const ok = value === cut
        return ok
          ? { ok, msg: line(room, lang, 'correct'), solved: solved() }
          : { ok, msg: line(room, lang, 'wrong') }
      }
      return null
    }

    case 'illusion': {
      const answers = parts(room.answer)
      const part = Number(req.part)
      const value = str(req.value)
      if (!Number.isInteger(part) || part < 1 || part > answers.length || value === undefined) return null
      const ok = value === answers[part - 1]
      const msg = line(room, lang, `${part}:${ok ? 'correct' : 'wrong'}`)
      return part === answers.length ? { ok, msg, solved: solved() } : { ok, msg }
    }

    case 'memory': {
      const values = strList(req.values)
      if (!values) return null
      const fooled = values[Number(room.answer)] === 'yes'
      return { ok: !fooled, msg: line(room, lang, fooled ? 'fooled' : 'notFooled'), solved: solved() }
    }

    case 'equivoque':
    case 'open':
      return { ok: true, solved: solved() }
  }
}

// ── Entry point ──────────────────────────────────────────────────
export async function answer(req: KabinettRequest): Promise<KabinettResult> {
  const roomKey = str(req.room)
  const kind = roomKey ? ROOMS[roomKey] : undefined
  if (!roomKey || !kind) return { status: 404, body: { error: 'unknown room' } }
  const lang: Lang = req.lang === 'en' ? 'en' : 'nb'

  let data
  try {
    data = await loadData()
  } catch (err) {
    console.error('[kabinett] could not load the rooms from Sanity', err)
    return { status: 503, body: { error: 'unavailable' } }
  }
  if (!data) {
    console.error('[kabinett] SANITY_PRIVATE_READ_TOKEN is not set')
    return { status: 503, body: { error: 'unavailable' } }
  }
  // While the game is switched off, nothing is handed out.
  if (!data.active) return { status: 404, body: { error: 'inactive' } }
  const room = data.rooms.get(roomKey)
  if (!room) return { status: 503, body: { error: 'room missing' } }

  switch (req.action) {
    case 'start': {
      const lines: Record<string, string> = {}
      for (const r of room.responses ?? []) {
        if (r.when.startsWith('start:')) lines[r.when.slice(6)] = (lang === 'en' && r.textEn) || r.text || ''
      }
      return { status: 200, body: { lines, ...(kind === 'equivoque' ? { answer: room.answer ?? '' } : {}) } }
    }

    case 'hint': {
      const hints = room.hints ?? []
      const n = Number(req.n)
      if (!Number.isInteger(n) || n < 0 || n >= hints.length) return { status: 404, body: { error: 'no hint' } }
      return { status: 200, body: { text: (lang === 'en' && hints[n].textEn) || hints[n].text, total: hints.length } }
    }

    case 'check': {
      const result = check(kind, room, lang, req)
      return result ? { status: 200, body: result } : { status: 400, body: { error: 'bad answer' } }
    }
  }
  return { status: 400, body: { error: 'unknown action' } }
}
