// src/lib/sanity.ts
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? 'n2ynpgty',
  dataset:   import.meta.env.PUBLIC_SANITY_DATASET   ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:    false,
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

// ── Legg til i src/lib/sanity.ts ────────────────────────────────
// Kopier alt under denne linjen og lim inn på slutten av sanity.ts

// ── Typer: Bok ───────────────────────────────────────────────────
export interface BookAuthor {
  name:       string
  slug?:      string
  hasProfile: boolean
  role?:      string
}

export interface Book {
  _id:            string
  title:          string
  subtitle?:      string
  year?:          number
  yearNote?:      string
  language?:      string
  languageNote?:  string
  bookType?:      'norwegian' | 'international' | 'publicDomain'
  section?:       string
  availability?:  'inPrint' | 'freeDownload' | 'checkAvailability' | 'rare'
  externalUrl?:   string
  sourceLabel?:   string
  thumbnailUrl?:  string
  coverImage?:    string
  coverImageAlt?: string
  publisher?:     string
  isbn?:          string
  edition?:       string
  featured?:      boolean
  tags?:          string[]
  authors?:       BookAuthor[]
  description?:   any[]
}

// ── Spørringer: Bok ──────────────────────────────────────────────
// Alle bøker sortert på år — til boklistesiden
export async function getAllBooks(): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book"] | order(year asc) {
      _id, title, subtitle, year, yearNote,
      language, languageNote, bookType, section,
      availability, externalUrl, sourceLabel,
      thumbnailUrl,
      "coverImage": coverImage.asset->url,
      "coverImageAlt": coverImage.alt,
      publisher, edition, featured, tags,
      "authors": authors[] {
        role,
        "name": coalesce(personRef->title, nameText),
        "slug": personRef->slug.current,
        "hasProfile": defined(personRef)
      },
      description
    }
  `)
}

// Kun public domain — til biblioteksiden
export async function getPublicDomainBooks(): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && bookType == "publicDomain"] | order(year asc) {
      _id, title, year, yearNote, section,
      externalUrl, sourceLabel, thumbnailUrl, tags,
      "authors": authors[] {
        "name": coalesce(personRef->title, nameText)
      },
      description
    }
  `)
}

// Kun norske bøker
export async function getNorwegianBooks(): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && bookType == "norwegian"] | order(year asc) {
      _id, title, subtitle, year, publisher, tags,
      "authors": authors[] {
        "name": coalesce(personRef->title, nameText),
        "slug": personRef->slug.current,
        "hasProfile": defined(personRef)
      }
    }
  `)
}

// Bøker av én magiker — til magiker-profilsiden
export async function getBooksByMagician(magicianId: string): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && references($magicianId)] | order(year asc) {
      _id, title, year, yearNote, bookType,
      availability, externalUrl, thumbnailUrl,
      "coverImage": coverImage.asset->url,
      tags
    }
  `, { magicianId })
}

// Fremhevede bøker — til forsiden
export async function getFeaturedBooks(): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && featured == true] | order(year asc) {
      _id, title, year, bookType,
      thumbnailUrl,
      "coverImage": coverImage.asset->url,
      "authors": authors[] {
        "name": coalesce(personRef->title, nameText)
      }
    }
  `)
}
