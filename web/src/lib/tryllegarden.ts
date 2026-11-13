// src/lib/tryllegarden.ts
//
// Server side of "Tryllegården" (src/pages/barn/tryllegarden.astro), the
// children's farm game. Server-only: imported by the on-demand game page and
// /api/tryllegarden, never by client scripts.
//
// The mini-games run in the browser and hold no secrets (a random order of
// birds cannot be looked up). What must not be in the page, the repository or
// the public dataset is how the nisse's tricks are done. Those are kitTrick
// documents in the private "lukket" dataset, bundled in one kitCollection per
// season, and leave the server only through answer():
//
//   trick  → one trick's method, when the player has finished its place
//   finale → the way into the season's bundle in the closed area
//
// The server cannot see whether a mini-game was really played, so "finished"
// is the browser's word. That is accepted: the tricks are beginners' effects
// meant for anyone who plays, and the guard that matters is the other one —
// only tricks in the season's own bundle are ever handed out, so nothing in
// the public season document can point this endpoint at a paid tryllesett.
import type { AstroCookies } from 'astro'
import { BAK_TEPPET_PATH, getPrivateClient } from './bakTeppet'
import { activePreviewCode, hasPreviewAccess, hasPreviewCookie } from './kabinettPreview'
import {
  getFarmGameConfig,
  getFarmSeasonDoc,
  getGamePreview,
  getKitAccessList,
  getKitTrickBySlug,
  portableTextToHtml,
  portableTextToPlainText,
  privateUrlFor,
  type FarmGameConfig,
  type KitFigure,
  type KitTrick,
  type KitTrickSectionKind,
} from './sanity'
import { videoPayload } from './trickMedia'
import { BUILT_IN_SEASONS, DEFAULT_SEASON_KEY, mergeSeason, type FarmSeason } from './tryllegardenSeason'

export const TRYLLEGARDEN_PATH = '/barn/tryllegarden'

type PrivateClient = NonNullable<ReturnType<typeof getPrivateClient>>

/** The season the config points at: built-in pack + Sanity overrides. */
export async function loadFarmSeason(config: FarmGameConfig | null): Promise<FarmSeason | null> {
  const key = config?.activeSeason?.trim() || DEFAULT_SEASON_KEY
  let doc: Record<string, unknown> | null = null
  try {
    doc = await getFarmSeasonDoc(key)
  } catch (err) {
    console.error('[tryllegarden] could not load the season document', err)
  }
  const season = mergeSeason(BUILT_IN_SEASONS[key], doc)
  return season && season.places.length > 0 ? season : null
}

/** Does this browser hold the editors' preview cookie? (Shared with the
 *  Cabinet: one code opens both games — see kabinettPreview.ts.) */
export async function hasFarmPreview(cookies: AstroCookies, priv: PrivateClient | null): Promise<boolean> {
  if (!priv || !hasPreviewCookie(cookies)) return false
  try {
    const code = activePreviewCode(await getGamePreview(priv.client))
    return hasPreviewAccess(cookies, priv.token, code)
  } catch (err) {
    console.error('[tryllegarden] could not load the preview settings', err)
    return false
  }
}

// ── Trick → HTML ──────────────────────────────────────────────────

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const SECTION_TITLES: Record<KitTrickSectionKind, [nb: string, en: string]> = {
  effekt:        ['Dette ser publikum', 'What the audience sees'],
  hemmeligheten: ['Hemmeligheten', 'The secret'],
  rekvisitter:   ['Du trenger', 'You need'],
  forberedelse:  ['Gjør klart', 'Get ready'],
  utforelse:     ['Slik gjør du', 'How to do it'],
  tips:          ['Nissens tips', 'The nisse’s tips'],
  annet:         ['', ''],
}

function figuresHtml(figures: KitFigure[] | undefined): string {
  return (figures ?? [])
    .filter(f => f.image?.asset)
    .map(f => {
      const src = privateUrlFor(f.image!).width(720).format('webp').url()
      const alt = esc(f.image!.alt || f.caption || '')
      return `<figure><img src="${esc(src)}" alt="${alt}" loading="lazy">${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ''}</figure>`
    })
    .join('')
}

/** A compact rendering for the game's reveal card. The full page, with
 *  videos and sources, is /bak-teppet/triks/<slug>. */
function trickHtml(trick: KitTrick, en: boolean): string {
  const parts: string[] = []
  for (const s of trick.sections ?? []) {
    // The place has already shown the effect.
    if (s.kind === 'effekt') continue
    const heading = s.heading || SECTION_TITLES[s.kind]?.[en ? 1 : 0] || ''
    if (heading) parts.push(`<h4>${esc(heading)}</h4>`)
    parts.push(portableTextToHtml(s.body, privateUrlFor))
    if (s.listItems?.length) parts.push(`<ul>${s.listItems.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`)
    parts.push(figuresHtml(s.figures))
    if (s.steps?.length) {
      parts.push('<ol>' + s.steps.map(step =>
        `<li>${step.title ? `<strong>${esc(step.title)}</strong> ` : ''}${portableTextToHtml(step.text, privateUrlFor)}${figuresHtml(step.figures)}</li>`,
      ).join('') + '</ol>')
    }
  }
  return parts.join('')
}

/** The same card as plain text, for the read-aloud button. */
function trickText(trick: KitTrick, en: boolean): string {
  const parts: string[] = [trick.title]
  for (const s of trick.sections ?? []) {
    if (s.kind === 'effekt') continue
    const heading = s.heading || SECTION_TITLES[s.kind]?.[en ? 1 : 0] || ''
    if (heading) parts.push(`${heading}.`)
    const body = portableTextToPlainText(s.body)
    if (body) parts.push(body)
    if (s.listItems?.length) parts.push(s.listItems.join('. ') + '.')
    ;(s.steps ?? []).forEach((step, n) => {
      const text = portableTextToPlainText(step.text)
      parts.push(`${n + 1}. ${step.title ? `${step.title}. ` : ''}${text}`)
    })
  }
  return parts.join(' ')
}

// ── The endpoint ──────────────────────────────────────────────────

export interface TryllegardenRequest {
  action?: unknown
  place?:  unknown
  lang?:   unknown
}

interface Reply { status: number; body: Record<string, unknown> }

const reply = (status: number, body: Record<string, unknown>): Reply => ({ status, body })

export async function answer(req: TryllegardenRequest, cookies: AstroCookies): Promise<Reply> {
  const action = req.action === 'trick' || req.action === 'finale' ? req.action : null
  if (!action) return reply(400, { error: 'bad request' })
  const en = req.lang === 'en'

  const priv = getPrivateClient()
  if (!priv) return reply(503, { error: 'unavailable' })

  let config: FarmGameConfig | null
  try {
    config = await getFarmGameConfig()
  } catch (err) {
    console.error('[tryllegarden] could not load the config', err)
    return reply(503, { error: 'unavailable' })
  }
  // Nothing is handed out while the game is off, except to preview browsers.
  if (config?.isActive !== true && !(await hasFarmPreview(cookies, priv))) {
    return reply(403, { error: 'closed' })
  }

  const season = await loadFarmSeason(config)
  if (!season?.kitSlug) return reply(404, { error: 'missing' })

  try {
    const kit = (await getKitAccessList(priv.client)).find(k => k.slug === season.kitSlug)
    if (!kit) return reply(404, { error: 'missing' })

    if (action === 'finale') {
      // The ordinary code link of the closed area (as on a QR card): it adds
      // this bundle to whatever the browser has already unlocked.
      const next = `${BAK_TEPPET_PATH}/${kit.slug}`
      return reply(200, {
        url: `${BAK_TEPPET_PATH}?kode=${encodeURIComponent(kit.accessCode)}&neste=${encodeURIComponent(next)}`,
        code: kit.accessCode,
      })
    }

    const key = typeof req.place === 'string' ? req.place : ''
    const place = season.places.find(p => p.key === key)
    if (!place?.trickSlug) return reply(404, { error: 'missing' })
    const trick = await getKitTrickBySlug(priv.client, place.trickSlug)
    // Only tricks in the season's own bundle.
    if (!trick || !trick.kitIds.includes(kit._id)) return reply(404, { error: 'missing' })
    return reply(200, {
      title: trick.title,
      html: trickHtml(trick, en),
      text: trickText(trick, en),
      videos: videoPayload(trick.videos),
    })
  } catch (err) {
    console.error('[tryllegarden] could not read the private dataset', err)
    return reply(503, { error: 'unavailable' })
  }
}
