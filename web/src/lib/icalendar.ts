// src/lib/icalendar.ts
//
// Minimal iCalendar (RFC 5545) parser for the Magiske Cirkel calendar feed.
// Fetched at build time (SSG). All failures degrade to an empty list so an
// unreachable or malformed feed can never break the static build.

export interface CalendarEvent {
  uid:          string
  title:        string
  start:        string   // ISO 8601
  end?:         string
  location?:    string
  url?:         string
  description?: string
}

// webcal:// is just https:// with a different scheme for calendar apps
const FEED_URL = 'https://kalender.magiskecirkel.no/'

// RFC 5545 §3.1: long lines are folded with CRLF followed by space/tab
function unfoldLines(ics: string): string[] {
  return ics
    .replace(/\r\n[ \t]/g, '')
    .replace(/\n[ \t]/g, '')
    .split(/\r?\n/)
}

// RFC 5545 §3.3.11: TEXT values escape newline, comma, semicolon, backslash
function unescapeText(s: string): string {
  return s
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

// Accepts 20260611, 20260611T180000 and 20260611T180000Z.
// Times without Z are kept as naive local time — close enough for a listing.
function parseIcsDate(value: string): string | undefined {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!m) return undefined
  const [, y, mo, d, h = '00', mi = '00', s = '00', z] = m
  return `${y}-${mo}-${d}T${h}:${mi}:${s ?? '00'}${z ?? ''}`
}

export function parseIcs(ics: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  let cur: Partial<CalendarEvent> | null = null

  for (const line of unfoldLines(ics)) {
    if (line === 'BEGIN:VEVENT') { cur = {}; continue }
    if (line === 'END:VEVENT') {
      if (cur?.title && cur.start) {
        events.push({
          uid: cur.uid ?? `${cur.start}-${cur.title}`,
          ...cur,
        } as CalendarEvent)
      }
      cur = null
      continue
    }
    if (!cur) continue

    const sep = line.indexOf(':')
    if (sep < 0) continue
    const value = line.slice(sep + 1)
    // Property may carry params, e.g. DTSTART;TZID=Europe/Oslo:20260611T180000
    const key = line.slice(0, sep).split(';')[0]

    switch (key) {
      case 'UID':         cur.uid         = value;                break
      case 'SUMMARY':     cur.title       = unescapeText(value);  break
      case 'DTSTART':     cur.start       = parseIcsDate(value);  break
      case 'DTEND':       cur.end         = parseIcsDate(value);  break
      case 'LOCATION':    cur.location    = unescapeText(value);  break
      case 'URL':         cur.url         = value;                break
      case 'DESCRIPTION': cur.description = unescapeText(value);  break
    }
  }

  return events
}

export async function getMagiskeCirkelEvents(): Promise<CalendarEvent[]> {
  try {
    const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return []
    const text = await res.text()
    if (!text.includes('BEGIN:VCALENDAR')) return []
    return parseIcs(text)
  } catch {
    return []
  }
}
