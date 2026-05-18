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
// ── Typer: Forside ───────────────────────────────────────────────
export interface Homepage {
  hero: {
    heading:    string
    headingEm:  string
    ingress:    string
    cta1Label:  string
    cta1Href:   string
    cta2Label:  string
    cta2Href:   string
    bgImage?:   { asset: { url: string }; hotspot: any }
  }
  infoBadges:       { label: string }[]
  utstillingsFokus: { eraLabel: string; heading: string }
  barnSeksjon: {
    heading:   string
    ingress:   string
    features:  string[]
    sitater:   { emoji: string; tekst: string; kilde: string }[]
  }
  medlemSeksjon: {
    heading:    string
    tekst:      string
    knappLabel: string
    knappUrl:   string
  }
  omMuseet: {
    heading:     string
    tekst:       string
    sitat:       string
    sitatKilde:  string
  }
}

// ── Spørring: Forside ────────────────────────────────────────────
export async function getHomepage(): Promise<Homepage | null> {
  return sanityClient.fetch(`
    *[_type == "homepage"][0] {
      hero {
        heading, headingEm, ingress,
        cta1Label, cta1Href, cta2Label, cta2Href,
        bgImage { asset->{ url }, hotspot }
      },
      infoBadges[] { label },
      utstillingsFokus { eraLabel, heading },
      barnSeksjon {
        heading, ingress, features,
        sitater[] { emoji, tekst, kilde }
      },
      medlemSeksjon { heading, tekst, knappLabel, knappUrl },
      omMuseet { heading, tekst, sitat, sitatKilde }
    }
  `)
}
// ── Typer: Barn & unge ───────────────────────────────────────────
export interface BarnPage {
  hero: {
    label: string; heading: string; headingEm: string; ingress: string
    cta1Label: string; cta1Href: string; cta2Label: string; cta2Href: string
  }
  aldersgrupper: { alder: string; ikon: string; tekst: string }[]
  aktiviteter:   { tittel: string; beskrivelse: string; ikon: string }[]
  skolebesok: {
    label: string; heading: string; tekst: string
    detaljer: string[]; knappLabel: string; knappHref: string
  }
  kursBanner: { heading: string; tekst: string; knappLabel: string; knappHref: string }
}

// ── Typer: Om oss ────────────────────────────────────────────────
export interface OmOssPage {
  hero: { label: string; heading: string; headingEm: string; ingress: string }
  omMuseet: { historieHeading: string; historieTekst: any[]; formalHeading: string; formalTekst: string }
  faktaboks: { stiftet: string; organisasjonsform: string; tilknytning: string; adresse: string; epost: string; orgnr: string }
  styret: {
    heading: string; ingress: string
    medlemmer: { navn: string; rolle: string }[]
  }
  medlemskap: {
    heading: string; ingress: string; motivasjonsTekst: string
    nivaaer: { type: string; pris: string; anbefalt: boolean; fordeler: string[]; knappLabel: string; knappUrl: string }[]
    vippsNummer: string; vippsInfo: string
  }
  presse: { label: string; heading: string; tekst: string; knappLabel: string; knappHref: string }
  partnere: { heading: string; liste: { navn: string; beskrivelse: string; url?: string }[] }
}

// ── Spørring: Barn & unge ────────────────────────────────────────
export async function getBarnPage(): Promise<BarnPage | null> {
  return sanityClient.fetch(`
    *[_type == "barnPage"][0] {
      hero { label, heading, headingEm, ingress, cta1Label, cta1Href, cta2Label, cta2Href },
      aldersgrupper[] { alder, ikon, tekst },
      aktiviteter[] { tittel, beskrivelse, ikon },
      skolebesok { label, heading, tekst, detaljer, knappLabel, knappHref },
      kursBanner { heading, tekst, knappLabel, knappHref }
    }
  `)
}

// ── Spørring: Om oss ─────────────────────────────────────────────
export async function getOmOssPage(): Promise<OmOssPage | null> {
  return sanityClient.fetch(`
    *[_type == "omOssPage"][0] {
      hero { label, heading, headingEm, ingress },
      omMuseet { historieHeading, historieTekst, formalHeading, formalTekst },
      faktaboks { stiftet, organisasjonsform, tilknytning, adresse, epost, orgnr },
      styret { heading, ingress, medlemmer[] { navn, rolle } },
      medlemskap {
        heading, ingress, motivasjonsTekst,
        nivaaer[] { type, pris, anbefalt, fordeler, knappLabel, knappUrl },
        vippsNummer, vippsInfo
      },
      presse { label, heading, tekst, knappLabel, knappHref },
      partnere { heading, liste[] { navn, beskrivelse, url } }
    }
  `)
}

// ── Typer: SiteConfig ────────────────────────────────────────────
export interface SiteConfig {
  siteName:          string
  siteTagline:       string
  email:             string
  phone?:            string
  address:           string
  addressShort:      string
  mapUrl:            string
  openingHoursShort: string
  openingHoursNote:  string
  membershipUrl:     string
  vippsNumber:       string
  facebook:          string
  instagram:         string
  youtube?:          string
  seoDescription:    string
}

// ── Spørring: SiteConfig ─────────────────────────────────────────
export async function getSiteConfig(): Promise<SiteConfig> {
  const config = await sanityClient.fetch(`
    *[_type == "siteConfig"][0] {
      siteName, siteTagline, email, phone,
      address, addressShort, mapUrl,
      openingHoursShort, openingHoursNote,
      membershipUrl, vippsNumber,
      facebook, instagram, youtube,
      seoDescription
    }
  `)
  // Fallback om Sanity er tom
  return config ?? {
    siteName:          'Tryllemuseet',
    siteTagline:       'Norges minste, merkeligste og mest magiske museum',
    email:             'post@tryllemuseet.no',
    address:           'Årvoll gård, Årvollveien 35\n0590 Oslo',
    addressShort:      'Årvoll gård, Oslo',
    mapUrl:            'https://maps.google.com/?q=Årvollveien+35,+0590+Oslo',
    openingHoursShort: 'Søndager 12–15',
    openingHoursNote:  'og etter avtale',
    membershipUrl:     'https://blimedlem.tryllemuseet.no',
    vippsNumber:       '95626',
    facebook:          'https://www.facebook.com/tryllemuseet',
    instagram:         'https://www.instagram.com/tryllemuseet',
    seoDescription:    'Norges minste, merkeligste og mest magiske museum. Besøk oss på Årvoll gård i Oslo — søndager 12–15. Gratis inngang.',
  }
}

