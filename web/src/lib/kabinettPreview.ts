// src/lib/kabinettPreview.ts
//
// Preview link for "Det trettende kabinett" while the game is switched off
// (gameConfig.isActive). Server-only.
//
// /det-trettende-kabinett?forhandsvisning=<code> with the code from the
// private gamePreview document (schemaTypes/gamePreview.ts) sets a cookie and
// redirects to the plain URL; that browser then gets the full game page and
// answers from /api/kabinett, everyone else still sees "coming soon". Same
// model as Bak teppet (src/lib/bakTeppet.ts): the cookie holds an HMAC of the
// current code, keyed from the Sanity read token, so changing the code or
// switching the preview off in Studio revokes every cookie at once.
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { AstroCookies } from 'astro'
import { normalizeAccessCode } from './bakTeppet'
import type { GamePreview } from './sanity'

export const PREVIEW_PARAM = 'forhandsvisning'

const COOKIE_NAME = 'kabinett_forhandsvisning'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

/** The usable (normalized) code, or null when the preview is off or unset. */
export function activePreviewCode(preview: GamePreview | null): string | null {
  if (!preview || preview.isActive === false || !preview.previewCode) return null
  const code = normalizeAccessCode(preview.previewCode)
  return code.length >= 8 ? code : null
}

function grantFor(token: string, code: string): string {
  const key = createHmac('sha256', token).update('kabinett-preview-cookie-v1').digest()
  return createHmac('sha256', key).update(code).digest('base64url').slice(0, 32)
}

function sameString(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

/** Cheap pre-check, so ordinary visitors cost no Sanity request. */
export function hasPreviewCookie(cookies: AstroCookies): boolean {
  return cookies.has(COOKIE_NAME)
}

export function hasPreviewAccess(cookies: AstroCookies, token: string, code: string | null): boolean {
  const value = cookies.get(COOKIE_NAME)?.value
  return !!code && !!value && sameString(value, grantFor(token, code))
}

export function codeMatches(typed: string, code: string | null): boolean {
  return !!code && sameString(normalizeAccessCode(typed), code)
}

export function grantPreview(cookies: AstroCookies, token: string, code: string, secure: boolean) {
  // Path "/": the game page and /api/kabinett both need it.
  cookies.set(COOKIE_NAME, grantFor(token, code), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: COOKIE_MAX_AGE,
  })
}
