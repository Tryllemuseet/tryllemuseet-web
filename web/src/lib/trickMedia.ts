// src/lib/trickMedia.ts
//
// Video links on a tryllebeskrivelse (kitTrick.videos), turned into what a
// page may embed. Pure functions, no imports, so tests can run them directly.
// Used by the closed area's trick page (via bakTeppet.ts) and by the farm
// game's trick card (src/lib/tryllegarden.ts).

/** YouTube (incl. unlisted) and Vimeo (incl. private-link "/123/abc") URLs →
 *  embeddable player URL; anything else → null (rendered as a plain link). */
export function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([\da-f]+))?/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}${vimeo[2] ? `?h=${vimeo[2]}` : ''}`
  return null
}

/**
 * Asks the player for Norwegian subtitles: YouTube turns captions on and
 * prefers Norwegian (shown when the video has a Norwegian track or one the
 * viewer's settings translate), Vimeo picks its Norwegian text track. A video
 * without subtitles simply plays as before.
 */
export function withNorwegianCaptions(embed: string): string {
  const add = (q: string) => embed + (embed.includes('?') ? '&' : '?') + q
  if (embed.includes('youtube-nocookie.com')) return add('cc_load_policy=1&cc_lang_pref=no&hl=no')
  if (embed.includes('player.vimeo.com')) return add('texttrack=no')
  return embed
}

/** Standing (9:16) video: a YouTube Shorts link, or one the editor has marked as standing. */
export function isPortraitVideo(url: string, marked?: boolean | null): boolean {
  return !!marked || /youtube\.com\/shorts\//.test(url)
}

export interface TrickVideo {
  label: string
  /** Standing video: the player gets a 9:16 frame. */
  portrait?: true
  /** Player URL when the link can be embedded. */
  embed?: string
  /** Plain link, only for videos that cannot be embedded. */
  url?: string
}

/**
 * The videos of a trick for the game's card. A video titled "Effekt" (what
 * the audience sees) comes first, the rest keep their order. YouTube players
 * only suggest videos from the same channel (rel=0), and every player is
 * asked for Norwegian subtitles. Links that are not http(s) are dropped.
 */
export function videoPayload(videos: { label?: string; url?: string; portrait?: boolean | null }[] | null | undefined): TrickVideo[] {
  const out: TrickVideo[] = []
  for (const v of videos ?? []) {
    const url = (v?.url ?? '').trim()
    if (!/^https:\/\//i.test(url)) continue
    const label = (v.label ?? '').trim()
    const embed = videoEmbedUrl(url)
    if (!embed) { out.push({ label, url }); continue }
    const player = embed.includes('youtube-nocookie.com') ? `${embed}?rel=0` : embed
    out.push({ label, embed: withNorwegianCaptions(player), ...(isPortraitVideo(url, v.portrait) ? { portrait: true as const } : {}) })
  }
  const effect = (v: TrickVideo) => (/effekt|effect/i.test(v.label) ? 0 : 1)
  return out
    .map((v, i) => ({ v, i }))
    .sort((a, b) => effect(a.v) - effect(b.v) || a.i - b.i)
    .map(x => x.v)
}
