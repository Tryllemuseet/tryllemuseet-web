// src/lib/tryllegardenAudio.ts
//
// Recorded voice lines for "Tryllegården" (src/pages/barn/tryllegarden.astro).
//
// Every spoken line gets a short id computed from its language and its final
// text (names filled in). The game looks the id up in
// /audio/tryllegarden/manifest.json and plays the clip if there is one, else
// it falls back to the browser's speech synthesis. Because the id comes from
// the text, a line that is edited in Studio, or a child whose name is changed,
// simply has no clip any more and falls back: the voice can never say
// something different from what is on screen.
//
// Shared by the page script and scripts/tryllegarden-audio.mjs. Keep it free
// of imports so Node can run it directly.

export type AudioLang = 'nb' | 'en'

/** manifest.json: id → path of the clip, relative to /audio/tryllegarden/. */
export interface AudioManifest {
  version: 1
  lines: Record<string, string>
}

/** The words a clip must say: whitespace collapsed, ends trimmed. */
export function audioText(text: string): string {
  return String(text ?? '').replace(/\s+/g, ' ').trim()
}

/** 32-bit FNV-1a of "<lang>|<text>" as 7 base-36 characters. */
export function audioKey(lang: AudioLang, text: string): string {
  const s = `${lang}|${audioText(text)}`
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).padStart(7, '0')
}
