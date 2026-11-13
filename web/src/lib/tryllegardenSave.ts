// src/lib/tryllegardenSave.ts
//
// The "lagrekode" of Tryllegården: a child's progress in one season, packed
// into a short code that can be written down and typed in on another device.
// Pure functions with no imports, so tests can run them directly.
//
// Nothing is stored on a server and nothing identifies the child: the code IS
// the progress. It is not a secret and not a security measure (anyone can
// make a code that marks every place as done; that changes nothing but their
// own tree). The checksum only catches typing mistakes.
//
// Layout (75 bits, 15 characters of Crockford base32, most significant first):
//   bits  0–15  place is done          (one bit per slot)
//   bits 16–31  butter-eye earned      (one bit per slot)
//   bits 32–47  nisse hat found        (one bit per slot)
//   bit     48  the finale is done
//   bits 49–50  level  (0 none, 1 smånisse, 2 lærling, 3 mester)
//   bits 51–52  read-aloud (0 unset, 1 off, 2 on)
//   bits 54–71  checksum of the season tag and the 54 bits above
//   bits 72–74  format version (1)
//
// Places are identified by their `slot` (0–15), a fixed number given to each
// place, so a code survives places being reordered or hidden. A place without
// a slot is simply not part of the code.
//
// Written out as "<SEASON>-XXXXX-XXXXX-XXXXX", for example "JUL-4F9KQ-0M2VX-7TZ1A".

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const PAYLOAD_CHARS = 15
const SLOTS = 16
const VERSION = 1n
const LEVELS = ['smanisse', 'laerling', 'mester'] as const

export type SaveLevel = (typeof LEVELS)[number]

export interface SavePlace { key: string; slot?: number }
export interface SaveProgress { done: Record<string, { smor: boolean }>; hats: string[]; finale: boolean }
export interface SavePrefs { level: SaveLevel | null; read: boolean | null }

export type DecodeResult =
  | ({ ok: true; level: SaveLevel | null; read: boolean | null } & SaveProgress)
  | { ok: false; reason: 'format' | 'checksum' | 'season' }

const seasonTag = (key: string) => key.toUpperCase().replace(/[^A-Z0-9]/g, '')
const slotOf = (p: SavePlace) =>
  Number.isInteger(p.slot) && (p.slot as number) >= 0 && (p.slot as number) < SLOTS ? (p.slot as number) : null

function checksum(tag: string, payload: bigint): bigint {
  // FNV-1a over the tag and the payload, 18 bits of it.
  let h = 0x811c9dc5
  for (const ch of `${tag}:${payload.toString(16)}`) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return BigInt(h & 0x3ffff)
}

export function encodeProgress(
  seasonKey: string,
  places: SavePlace[],
  progress: SaveProgress,
  prefs: SavePrefs,
): string {
  let payload = 0n
  for (const p of places) {
    const slot = slotOf(p)
    if (slot === null) continue
    const done = progress.done[p.key]
    if (done) payload |= 1n << BigInt(slot)
    if (done?.smor) payload |= 1n << BigInt(16 + slot)
    if (progress.hats.includes(p.key)) payload |= 1n << BigInt(32 + slot)
  }
  if (progress.finale) payload |= 1n << 48n
  const level = prefs.level ? LEVELS.indexOf(prefs.level) + 1 : 0
  payload |= BigInt(level) << 49n
  payload |= BigInt(prefs.read === null ? 0 : prefs.read ? 2 : 1) << 51n

  const tag = seasonTag(seasonKey)
  const value = payload | (checksum(tag, payload) << 54n) | (VERSION << 72n)
  let chars = ''
  for (let i = 0; i < PAYLOAD_CHARS; i++) {
    chars = ALPHABET[Number((value >> BigInt(5 * i)) & 31n)] + chars
  }
  const groups = chars.match(/.{5}/g) as string[]
  return `${tag}-${groups.join('-')}`
}

/** Reads a typed code. Case, spaces and hyphens do not matter, and the usual
 *  mix-ups (O for 0, I or L for 1, U for V) are forgiven. */
export function decodeProgress(code: string, seasonKey: string, places: SavePlace[]): DecodeResult {
  const clean = String(code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (clean.length <= PAYLOAD_CHARS) return { ok: false, reason: 'format' }
  const tag = clean.slice(0, clean.length - PAYLOAD_CHARS)
  const chars = clean.slice(-PAYLOAD_CHARS).replace(/O/g, '0').replace(/[IL]/g, '1').replace(/U/g, 'V')

  let value = 0n
  for (const ch of chars) {
    const n = ALPHABET.indexOf(ch)
    if (n < 0) return { ok: false, reason: 'format' }
    value = (value << 5n) | BigInt(n)
  }
  if (value >> 72n !== VERSION) return { ok: false, reason: 'format' }
  const payload = value & ((1n << 54n) - 1n)
  if (((value >> 54n) & 0x3ffffn) !== checksum(tag, payload)) return { ok: false, reason: 'checksum' }
  if (tag !== seasonTag(seasonKey)) return { ok: false, reason: 'season' }

  const done: SaveProgress['done'] = {}
  const hats: string[] = []
  for (const p of places) {
    const slot = slotOf(p)
    if (slot === null) continue
    if ((payload >> BigInt(slot)) & 1n) done[p.key] = { smor: Boolean((payload >> BigInt(16 + slot)) & 1n) }
    if ((payload >> BigInt(32 + slot)) & 1n) hats.push(p.key)
  }
  const level = Number((payload >> 49n) & 3n)
  const read = Number((payload >> 51n) & 3n)
  return {
    ok: true,
    done,
    hats,
    finale: Boolean((payload >> 48n) & 1n),
    level: level ? LEVELS[level - 1] : null,
    read: read === 0 ? null : read === 2,
  }
}

/** Progress from a code is added to what the browser already has. Nothing is
 *  ever taken away. */
export function mergeProgress(local: SaveProgress, incoming: SaveProgress): SaveProgress {
  const done: SaveProgress['done'] = { ...local.done }
  for (const [key, v] of Object.entries(incoming.done)) done[key] = { smor: v.smor || !!done[key]?.smor }
  return {
    done,
    hats: [...new Set([...local.hats, ...incoming.hats])],
    finale: local.finale || incoming.finale,
  }
}
