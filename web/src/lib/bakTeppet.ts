// src/lib/bakTeppet.ts
//
// Access control for "Bak teppet" — the closed area for buyers of the
// museum's magic kits (src/pages/bak-teppet/). Server-only: imported by
// on-demand (prerender = false) pages, never by client scripts.
//
// Model: one shared access code per kit type (kitCollection.accessCode), no
// personal data. A correct code sets a cookie holding an HMAC of
// "<kit id>:<current code>" per unlocked kit. Because the current code is
// part of the HMAC, changing a kit's code in Sanity immediately revokes every
// cookie issued for the old one. The HMAC key is derived from the Sanity
// read token, so rotating that token logs everyone out too — no second
// secret to manage.
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { AstroCookies } from 'astro'
import { getSecret } from 'astro:env/server'
import {
  createPrivateSanityClient,
  getKitAccessList,
  type KitAccessEntry,
} from './sanity'

export const BAK_TEPPET_PATH = '/bak-teppet'

const COOKIE_NAME = 'bak_teppet'
// Kits are bought, not subscribed to — keep buyers logged in for a long time.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2

// Must match normalizeAccessCode() in schemaTypes/kitCollection.ts
export function normalizeAccessCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function getPrivateClient() {
  // Locally, fall back to the same preview token sanity.ts uses for drafts.
  const token = getSecret('SANITY_PRIVATE_READ_TOKEN')
    ?? (import.meta.env.DEV ? import.meta.env.SANITY_PREVIEW_TOKEN : undefined)
  return token ? { client: createPrivateSanityClient(token), token } : null
}

function grantFor(token: string, kit: KitAccessEntry): string {
  const key = createHmac('sha256', token).update('bak-teppet-cookie-v1').digest()
  return createHmac('sha256', key)
    .update(`${kit._id}:${normalizeAccessCode(kit.accessCode)}`)
    .digest('base64url')
    .slice(0, 32)
}

function readGrants(cookies: AstroCookies): string[] {
  return (cookies.get(COOKIE_NAME)?.value ?? '').split('.').filter(Boolean)
}

function sameString(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export interface BakTeppetSession {
  client: ReturnType<typeof createPrivateSanityClient>
  /** All active kits (with codes) — server-side use only. */
  kits: KitAccessEntry[]
  /** Kits this visitor's cookie currently unlocks. */
  unlocked: KitAccessEntry[]
  token: string
}

export async function loadSession(cookies: AstroCookies): Promise<BakTeppetSession | null> {
  const priv = getPrivateClient()
  if (!priv) return null
  const kits = await getKitAccessList(priv.client)
  const grants = readGrants(cookies)
  const unlocked = kits.filter(kit => {
    const expected = grantFor(priv.token, kit)
    return grants.some(g => sameString(g, expected))
  })
  return { ...priv, kits, unlocked }
}

export function findKitByCode(kits: KitAccessEntry[], code: string): KitAccessEntry | undefined {
  const typed = normalizeAccessCode(code)
  if (typed.length < 8) return undefined
  return kits.find(k => sameString(normalizeAccessCode(k.accessCode), typed))
}

export function grantAccess(
  cookies: AstroCookies,
  session: BakTeppetSession,
  kit: KitAccessEntry,
  secure: boolean,
) {
  // Keep only grants that still match an active kit, then add the new one.
  const valid = session.unlocked.filter(k => k._id !== kit._id).map(k => grantFor(session.token, k))
  cookies.set(COOKIE_NAME, [...valid, grantFor(session.token, kit)].join('.'), {
    path: BAK_TEPPET_PATH,
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: COOKIE_MAX_AGE,
  })
}

export function clearAccess(cookies: AstroCookies) {
  cookies.delete(COOKIE_NAME, { path: BAK_TEPPET_PATH })
}

/** Where to send a visitor after a correct code: `?neste=` if it points
 *  inside Bak teppet (so links to a trick page survive the code form),
 *  otherwise null. Rejects anything that could leave the site. */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null
  return /^\/bak-teppet\/[a-z0-9/_-]+$/i.test(value) && !value.includes('//') ? value : null
}

/** Code-form URL that returns to `path` after login. */
export function loginUrl(path: string): string {
  return `${BAK_TEPPET_PATH}?neste=${encodeURIComponent(path)}`
}

/** Headers for every Bak teppet response: never indexed, never cached. */
export function setPrivateHeaders(headers: Headers) {
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  headers.set('Cache-Control', 'private, no-store')
}

/** Slows down wrong guesses a little. Codes are ~40 bits, so this is a
 *  courtesy, not the protection. */
export function failedAttemptDelay() {
  return new Promise(resolve => setTimeout(resolve, 800))
}

/** YouTube (incl. unlisted) and Vimeo (incl. private-link "/123/abc") URLs →
 *  embeddable player URL; anything else → null (rendered as a plain link). */
export function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([\da-f]+))?/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}${vimeo[2] ? `?h=${vimeo[2]}` : ''}`
  return null
}
