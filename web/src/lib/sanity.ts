// src/lib/sanity.ts
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? 'n2ynpgty',
  dataset:   import.meta.env.PUBLIC_SANITY_DATASET   ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:    true,
})

// ── Typer ────────────────────────────────────────────────────────

export interface Magician {
  _id:            string
  title:          string
  slug:           string
  order:          number
  qrNumber:       number
  years:          string
  tagline:        string
  mobileIntro:    string
  posterImage?:   { asset: { url: string }; alt: string }
  adultText?:     any[]
  childText?:     string
  childActivity?: string
  mobileSections?: { heading: string; body: any[] }[]
  sources?:       { label: string; url?: string }[]
}

export interface Event {
  _id:        string
  title:      string
  slug:       string
  date:       string
  ageGroup?:  string
  price?:     string
  excerpt?:   string
  featured?:  boolean
  image?:     { asset: { url: string }; alt: string }
  bookingUrl?: string
}

// ── Spørringer ───────────────────────────────────────────────────

// Alle magikere sortert — til oversiktssiden
export async function getAllMagicians(): Promise<Magician[]> {
  return sanityClient.fetch(`
    *[_type == "magician"] | order(order asc) {
      _id, title, "slug": slug.current,
      order, qrNumber, years, tagline, mobileIntro,
      posterImage { asset->{ url }, alt }
    }
  `)
}

// Én magiker via slug — til detaljsiden
export async function getMagicianBySlug(slug: string): Promise<Magician | null> {
  return sanityClient.fetch(`
    *[_type == "magician" && slug.current == $slug][0] {
      _id, title, "slug": slug.current,
      order, qrNumber, years, tagline,
      posterImage { asset->{ url }, alt },
      adultText, childText, childActivity,
      mobileIntro,
      mobileSections[] { heading, body },
      sources[] { label, url }
    }
  `, { slug })
}

// Én magiker via QR-nummer — til QR-landingssiden
export async function getMagicianByQR(qrNumber: number): Promise<Magician | null> {
  return sanityClient.fetch(`
    *[_type == "magician" && qrNumber == $qrNumber][0] {
      "slug": slug.current
    }
  `, { qrNumber })
}

// Kommende arrangementer
export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  return sanityClient.fetch(`
    *[_type == "event" && date >= now()] | order(date asc) [0...$limit] {
      _id, title, "slug": slug.current,
      date, ageGroup, price, excerpt, featured,
      image { asset->{ url }, alt },
      bookingUrl
    }
  `, { limit })
}

export async function getStaticPaths() {
  const magicians = await getAllMagicians()
  return magicians
    .filter(m => m.slug && typeof m.slug === 'string')
    .map(m => ({ params: { slug: String(m.slug) } }))
}