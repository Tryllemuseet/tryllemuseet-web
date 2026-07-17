// src/lib/sanity.ts
import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any

// "production" i Vercel prod-miljø, "preview" i preview-bygg, undefined lokalt
const isProd = import.meta.env.PUBLIC_VERCEL_ENV === 'production'

export const sanityClient = createClient({
  projectId:   import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? 'n2ynpgty',
  dataset:     import.meta.env.PUBLIC_SANITY_DATASET   ?? 'production',
  apiVersion:  '2024-01-01',
  useCdn:      isProd,
  perspective: isProd ? 'published' : 'drafts',
  token:       isProd ? undefined : (import.meta.env.SANITY_PREVIEW_TOKEN ?? undefined),
})

// ── Bildebygger ──────────────────────────────────────────────────
const builder = createImageUrlBuilder(sanityClient)

/**
 * Bygg en optimalisert bilde-URL fra et Sanity-bildeobjekt.
 * Eksempel: urlFor(image).width(800).format('webp').url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

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
  posterImage?:   { asset: { _ref: string; url: string }; alt: string }
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
  image?:     { asset: { _ref: string; url: string }; alt: string }
  bookingUrl?: string
}

export interface Artifact {
  _id:              string
  title:            string
  slug:             string
  description?:     string
  year?:            number
  yearNote?:        string
  origin?:          string
  category?:        string
  material?:        string
  dimensions?:      string
  condition?:       string
  provenance?:      string
  displayLocation?: string
  ownerType?:       'museum' | 'loan'
  lenderName?:      string
  lenderContact?:   string
  loanFrom?:        string
  loanTo?:          string
  loanReference?:   string
  featured?:        boolean
  order?:           number
  mainImage?:       { asset: { _ref: string; url: string }; alt?: string }
  gallery?:         { asset: { _ref: string; url: string }; alt?: string; caption?: string }[]
  tags?:            string[]
  notes?:           any[]
}

// ── Spørringer ───────────────────────────────────────────────────

// Alle magikere sortert — til oversiktssiden
export async function getAllMagicians(): Promise<Magician[]> {
  return sanityClient.fetch(`
    *[_type == "magician" && isVisible != false] | order(order asc) {
      _id, title, "slug": slug.current,
      order, qrNumber, years, tagline, mobileIntro,
      posterImage { asset->{ _ref, url }, alt }
    }
  `)
}

// Én magiker via slug — til detaljsiden
export async function getMagicianBySlug(slug: string): Promise<Magician | null> {
  return sanityClient.fetch(`
    *[_type == "magician" && slug.current == $slug && isVisible != false][0] {
      _id, title, "slug": slug.current,
      order, qrNumber, years, tagline,
      posterImage { asset->{ _ref, url }, alt },
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

// ── Utstillingen (legend: fysisk plassering + dybdeartikler) ─────
//
// Ett legend-dokument kan dekke veggpanel-dybden (physicalOrder/qrNumber,
// childText/wallText), stasjons-dybden (stations), eller begge — se
// schemaTypes/legend.ts og scripts/migrate-exhibits-to-legend.mjs.
// Erstatter de tidligere separate magician- og exhibitionShow/
// exhibitionStation-baserte spørringene for /utstillingen.

export interface UtstillingEntry {
  _id:            string
  title:          string
  slug:           string
  tagline?:       string
  years?:         string
  qrNumber?:      number
  physicalOrder?: number
  childText?:     string
  childActivity?: string
  wallText?:      any[]
  detailIntro?:   string
  sections?:      { heading: string; body: any[] }[]
  mainImage?:     { asset: { _ref: string; url: string }; alt?: string }
  gallery?:       { asset: { _ref: string; url: string }; alt?: string; caption?: string }[]
  stations?:      LegendStation[]
  sources?:       { label: string; url?: string }[]
  biographyRef?:  { name: string; slug: string; isVisible?: boolean }
}

// De fysiske veggfeltene i Gullalderen — til oversiktssiden
export async function getGullalderenPanels(): Promise<UtstillingEntry[]> {
  return sanityClient.fetch(`
    *[_type == "legend" && isVisible != false && defined(physicalOrder)] | order(physicalOrder asc) {
      _id, title, "slug": slug.current,
      physicalOrder, qrNumber, years, tagline, detailIntro,
      mainImage { asset->{ _ref, url }, alt }
    }
  `)
}

export interface UtstillingSummary {
  _id:          string
  title:        string
  slug:         string
  tagline?:     string
  detailIntro?: string
  mainImage?:   { asset: { _ref: string; url: string }; alt?: string }
  stationCount: number
}

// Dybdeartikler med stasjoner — «Aktuell utstilling» på utstillingen/index.astro
export async function getUtstillingDeepDives(): Promise<UtstillingSummary[]> {
  return sanityClient.fetch(`
    *[_type == "legend" && isVisible != false && count(stations) > 0] | order(_createdAt desc) {
      _id, title, "slug": slug.current, tagline, detailIntro,
      mainImage { asset->{ _ref, url }, alt },
      "stationCount": count(stations)
    }
  `)
}

// Én artikkel via slug — dekker både veggfelt og dybdeartikler under /utstillingen
export async function getUtstillingEntryBySlug(slug: string): Promise<UtstillingEntry | null> {
  return sanityClient.fetch(`
    *[_type == "legend" && slug.current == $slug && isVisible != false][0] {
      _id, title, "slug": slug.current,
      tagline, years, qrNumber, physicalOrder,
      childText, childActivity, wallText,
      detailIntro, sections[] { heading, body },
      mainImage { asset->{ _ref, url }, alt },
      gallery[] { asset->{ _ref, url }, alt, caption },
      stations[] { title, order, year, image { asset->{ _ref, url }, alt }, textKids, textAdults, activityPrompt },
      sources[] { label, url },
      "biographyRef": biographyRef->{ name, "slug": slug.current, isVisible }
    }
  `, { slug })
}

// Statiske stier for /utstillingen/[slug] — veggfelt og/eller dybdeartikler
export async function getUtstillingPaths() {
  const entries = await sanityClient.fetch(`
    *[_type == "legend" && isVisible != false && (defined(physicalOrder) || count(stations) > 0)] { "slug": slug.current }
  `)
  return entries
    .filter((e: { slug?: string }) => e.slug)
    .map((e: { slug: string }) => ({ params: { slug: e.slug } }))
}

// Kommende arrangementer
export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  return sanityClient.fetch(`
    *[_type == "event" && date >= now() && isVisible != false] | order(date asc) [0...$limit] {
      _id, title, "slug": slug.current,
      date, ageGroup, price, excerpt, featured,
      image { asset->{ _ref, url }, alt },
      bookingUrl
    }
  `, { limit })
}

// Alle arrangementer (kommende og tidligere) — til aktivitetssiden
export async function getAllEvents(): Promise<Event[]> {
  return sanityClient.fetch(`
    *[_type == "event" && isVisible != false] | order(date asc) {
      _id, title, "slug": slug.current,
      date, ageGroup, price, excerpt, featured,
      image { asset->{ _ref, url }, alt },
      bookingUrl
    }
  `)
}

export async function getStaticPaths() {
  const magicians = await getAllMagicians() // getAllMagicians already filters isVisible != false
  return magicians
    .filter(m => m.slug && typeof m.slug === 'string')
    .map(m => ({ params: { slug: String(m.slug) } }))
}

// ── Spørringer: Artefakter ───────────────────────────────────────

// Alle artefakter sortert — til oversiktssiden
export async function getAllArtifacts(): Promise<Artifact[]> {
  return sanityClient.fetch(`
    *[_type == "artifact" && isVisible != false] | order(coalesce(order, 9999) asc, title asc) {
      _id, title, "slug": slug.current,
      description, year, yearNote, origin,
      category, material, dimensions, condition,
      featured, order, tags,
      mainImage { asset->{ _ref, url }, alt }
    }
  `)
}

// Én artefakt via slug — til detaljsiden
export async function getArtifactBySlug(slug: string): Promise<Artifact | null> {
  return sanityClient.fetch(`
    *[_type == "artifact" && slug.current == $slug && isVisible != false][0] {
      _id, title, "slug": slug.current,
      description, year, yearNote, origin,
      category, material, dimensions, condition,
      provenance, displayLocation,
      ownerType, lenderName, loanFrom, loanTo, loanReference,
      featured, order, tags, notes,
      mainImage { asset->{ _ref, url }, alt },
      gallery[] { asset->{ _ref, url }, alt, caption }
    }
  `, { slug })
}

// Fremhevede artefakter — til forsiden / portalen
export async function getFeaturedArtifacts(limit = 6): Promise<Artifact[]> {
  return sanityClient.fetch(`
    *[_type == "artifact" && featured == true && isVisible != false] | order(coalesce(order, 9999) asc) [0...$limit] {
      _id, title, "slug": slug.current,
      description, year, category,
      mainImage { asset->{ _ref, url }, alt }
    }
  `, { limit })
}

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
  sourceReference?:    string
  sourceReferenceUrl?: string
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
export async function getAllBooks(): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && isVisible != false] | order(year asc) {
      _id, title, subtitle, year, yearNote,
      language, languageNote, bookType, section,
      availability, externalUrl, sourceLabel,
      sourceReference, sourceReferenceUrl,
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

export async function getPublicDomainBooks(): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && bookType == "publicDomain" && isVisible != false] | order(year asc) {
      _id, title, year, yearNote, section,
      externalUrl, sourceLabel, thumbnailUrl, tags,
      "authors": authors[] {
        "name": coalesce(personRef->title, nameText)
      },
      description
    }
  `)
}

export async function getNorwegianBooks(): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && bookType == "norwegian" && isVisible != false] | order(year asc) {
      _id, title, subtitle, year, publisher, tags,
      "authors": authors[] {
        "name": coalesce(personRef->title, nameText),
        "slug": personRef->slug.current,
        "hasProfile": defined(personRef)
      }
    }
  `)
}

export async function getBooksByMagician(magicianId: string): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && references($magicianId) && isVisible != false] | order(year asc) {
      _id, title, year, yearNote, bookType,
      availability, externalUrl, thumbnailUrl,
      "coverImage": coverImage.asset->url,
      tags
    }
  `, { magicianId })
}

// Bøker knyttet til en /utstillingen-artikkel (legend). Boken refererer
// fortsatt det opprinnelige magician-dokumentet (book.ts sitt referansefelt
// er ikke migrert) — slår derfor opp magician-dokumentets id via samme slug
// i stedet for å anta en id-konvensjon.
export async function getBooksByUtstillingSlug(slug: string): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && isVisible != false
      && references(*[_type == "magician" && slug.current == $slug][0]._id)
    ] | order(year asc) {
      _id, title, year, yearNote, bookType,
      availability, externalUrl, thumbnailUrl,
      "coverImage": coverImage.asset->url,
      tags
    }
  `, { slug })
}

export async function getFeaturedBooks(): Promise<Book[]> {
  return sanityClient.fetch(`
    *[_type == "book" && featured == true && isVisible != false] | order(year asc) {
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
    bgImage?:   { asset: { _ref: string; url: string }; hotspot: any }
  }
  infoBadges:       { label: string }[]
  utstillingsFokus: { eraLabel: string; heading: string; felt?: Magician[] }
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
  }
  omMuseet: {
    heading:     string
    tekst:       string
    sitat:       string
    sitatKilde:  string
  }
  kursSeksjon?: {
    heading:    string
    ingress:    string
    detaljer:   string[]
    pris:       string
    prisLabel:  string
    fondsBadge: string
    knappLabel: string
    knappHref:  string
  }
  kursSitat?: {
    tekst: string
    kilde: string
  }
}

export async function getHomepage(): Promise<Homepage | null> {
  return sanityClient.fetch(`
    *[_type == "homepage"][0] {
      hero {
        heading, headingEm, ingress,
        cta1Label, cta1Href, cta2Label, cta2Href,
        bgImage { asset->{ _ref, url }, hotspot }
      },
      infoBadges[] { label },
      utstillingsFokus {
        eraLabel, heading,
        felt[]->{ _id, title, "slug": slug.current, order, years, tagline, posterImage { asset->{ _ref, url }, alt } }
      },
      barnSeksjon {
        heading, ingress, features,
        sitater[] { emoji, tekst, kilde }
      },
      medlemSeksjon { heading, tekst, knappLabel },
      omMuseet { heading, tekst, sitat, sitatKilde },
      kursSeksjon { heading, ingress, detaljer, pris, prisLabel, fondsBadge, knappLabel, knappHref },
      kursSitat { tekst, kilde }
    }
  `)
}

// ── Typer: Triks (Lær et triks) ───────────────────────────────────
export interface Trick {
  _id: string
  title: string
  slug: string
  difficulty: 'enkel' | 'middels'
  shortDescription: string
  materials?: string[]
  instructions?: any[]
  videoUrl?: string
  externalUrl?: string
  order?: number
}

// ── Typer: Verdens mest… ──────────────────────────────────────────
export interface WorldRecordTrick {
  _id: string
  category: 'farligste' | 'eldste' | 'norske' | 'kopierte' | 'dyreste' | 'omdiskuterte'
  title: string
  teaserText: string
  fullStory: any[]
  relatedPerson?: { slug: string; name: string }
  sources?: string[]
  needsVerification?: boolean
  order?: number
}

// ── Typer: Konkurranseresultater ──────────────────────────────────
export interface CompetitionResult {
  _id: string
  personName: string
  personRef?: { slug: string; name: string }
  country: 'NO' | 'SE' | 'DK' | 'FI' | 'IS'
  competition: 'fism' | 'nordisk' | 'nm' | 'annet'
  year: number
  location?: string
  category?: string
  placement: string
  source?: string
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
  faktaboks: { stiftet: string; organisasjonsform: string; tilknytning: string; adresse: string; orgnr: string }
  styret: {
    heading: string; ingress: string
    medlemmer: { navn: string; rolle: string }[]
  }
  medlemskap: {
    heading: string; ingress: string; motivasjonsTekst: string
    nivaaer: { type: string; pris: string; anbefalt: boolean; fordeler: string[]; knappLabel: string; knappUrl: string }[]
    vippsInfo: string
  }
  presse: { label: string; heading: string; tekst: string; knappLabel: string; knappHref: string }
  partnere: { heading: string; liste: { navn: string; beskrivelse: string; url?: string }[] }
}

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

// ── Spørringer: Triks (Lær et triks) ──────────────────────────────

// Alle aktive triks, sortert — til /barn/laer-et-triks
export async function getAllTricks(): Promise<Trick[]> {
  return sanityClient.fetch(`
    *[_type == "trick" && isVisible != false] | order(coalesce(order, 9999) asc, title asc) {
      _id, title, "slug": slug.current,
      difficulty, shortDescription, materials, instructions,
      videoUrl, externalUrl, order
    }
  `)
}

// Ett triks via slug — hvis vi senere vil ha egne detaljsider
export async function getTrickBySlug(slug: string): Promise<Trick | null> {
  return sanityClient.fetch(`
    *[_type == "trick" && slug.current == $slug && isVisible != false][0] {
      _id, title, "slug": slug.current,
      difficulty, shortDescription, materials, instructions,
      videoUrl, externalUrl, order
    }
  `, { slug })
}

// ── Spørringer: Verdens mest… ──────────────────────────────────────

// Alle synlige oppføringer, gruppert etter kategori på siden selv
export async function getAllWorldRecordTricks(): Promise<WorldRecordTrick[]> {
  return sanityClient.fetch(`
    *[_type == "worldRecordTrick" && isVisible != false] | order(category asc, coalesce(order, 9999) asc) {
      _id, category, title, teaserText, fullStory,
      "relatedPerson": relatedPerson-> { "slug": slug.current, name },
      sources, needsVerification, order
    }
  `)
}

// ── Spørringer: Konkurranseresultater ─────────────────────────────

// Alle resultater, nyeste år først — til Norden-i-FISM-siden
export async function getAllCompetitionResults(): Promise<CompetitionResult[]> {
  return sanityClient.fetch(`
    *[_type == "competitionResult" && isVisible != false] | order(year desc) {
      _id, personName,
      "personRef": personRef-> { "slug": slug.current, name },
      country, competition, year, location, category, placement, source
    }
  `)
}

export async function getOmOssPage(): Promise<OmOssPage | null> {
  return sanityClient.fetch(`
    *[_type == "omOssPage"][0] {
      hero { label, heading, headingEm, ingress },
      omMuseet { historieHeading, historieTekst, formalHeading, formalTekst },
      faktaboks { stiftet, organisasjonsform, tilknytning, adresse, orgnr },
      styret { heading, ingress, medlemmer[] { navn, rolle } },
      medlemskap {
        heading, ingress, motivasjonsTekst,
        nivaaer[] { type, pris, anbefalt, fordeler, knappLabel, knappUrl },
        vippsInfo
      },
      presse { label, heading, tekst, knappLabel, knappHref },
      partnere { heading, liste[] { navn, beskrivelse, url } }
    }
  `)
}

// ── Typer: Besøk oss ─────────────────────────────────────────────
export interface BesokPage {
  hero: { label: string; heading: string; ingress: string }
  hurtiginfo: { inngangTekst: string; forestillingerTekst: string }
  apningstider: {
    rader: { dag: string; tid?: string; aapen: boolean }[]
    merknad: string
  }
  priser: {
    rader: { kategori: string; pris: string; gratis: boolean }[]
    merknad: string
  }
  medlemskapSeksjon: { label: string; heading: string; tekst: string }
  forestillingerSeksjon: { heading: string; tekst: string }
  sporsmalSeksjon: { tekst: string }
  transport: { badge: string; farge: 'rod' | 'blaa'; tekst: string }[]
}

export async function getBesokPage(): Promise<BesokPage> {
  const d = await sanityClient.fetch(`
    *[_type == "besokPage"][0] {
      hero { label, heading, ingress },
      hurtiginfo { inngangTekst, forestillingerTekst },
      apningstider { rader[] { dag, tid, aapen }, merknad },
      priser { rader[] { kategori, pris, gratis }, merknad },
      medlemskapSeksjon { label, heading, tekst },
      forestillingerSeksjon { heading, tekst },
      sporsmalSeksjon { tekst },
      transport[] { badge, farge, tekst }
    }
  `)
  return {
    hero: {
      label:   d?.hero?.label   ?? 'Planlegg besøket',
      heading: d?.hero?.heading ?? 'Besøk oss',
      ingress: d?.hero?.ingress ?? 'Vi holder til på Årvoll gård i Oslo — et av byens mest sjarmerende kultursteder. Kom og opplev magi på nært hold.',
    },
    hurtiginfo: {
      inngangTekst:        d?.hurtiginfo?.inngangTekst        ?? 'Gratis inngang for alle',
      forestillingerTekst: d?.hurtiginfo?.forestillingerTekst ?? '3 pr. halvår',
    },
    apningstider: {
      rader: d?.apningstider?.rader ?? [
        { dag: 'Søndag',          tid: '12:00 – 15:00', aapen: true  },
        { dag: 'Mandag – Lørdag', tid: '',               aapen: false },
      ],
      merknad: d?.apningstider?.merknad ?? 'Vi er også åpne ved spesielle arrangementer og etter avtale for grupper og skoler.',
    },
    priser: {
      rader: d?.priser?.rader ?? [
        { kategori: 'Barn (under 16 år)', pris: 'Gratis',       gratis: true  },
        { kategori: 'Voksne',             pris: 'Gratis',       gratis: true  },
        { kategori: 'Familie',            pris: 'Gratis',       gratis: true  },
        { kategori: 'Grupper (10+)',      pris: 'Etter avtale', gratis: false },
      ],
      merknad: d?.priser?.merknad ?? 'Trylleforestillinger kan ha egne priser.',
    },
    medlemskapSeksjon: {
      label:   d?.medlemskapSeksjon?.label   ?? 'Støtt museet',
      heading: d?.medlemskapSeksjon?.heading ?? 'Bli medlem!',
      tekst:   d?.medlemskapSeksjon?.tekst   ?? 'Som medlem støtter du Tryllemuseet og bidrar til å holde magien levende for kommende generasjoner. Medlemskapet er enkelt å tegne.',
    },
    forestillingerSeksjon: {
      heading: d?.forestillingerSeksjon?.heading ?? 'Trylleforestillinger',
      tekst:   d?.forestillingerSeksjon?.tekst   ?? 'Vi arrangerer tre trylleforestillinger hvert halvår — for familier, barn og alle som elsker magi. Forestillingene holdes på Årvoll gård og er åpne for alle.',
    },
    sporsmalSeksjon: {
      tekst: d?.sporsmalSeksjon?.tekst ?? 'Lurer du på noe om besøket, vil booke for en gruppe eller skole, eller ønsker mer informasjon?',
    },
    transport: d?.transport ?? [
      { badge: 'T', farge: 'rod',  tekst: 'T-bane linje 2 eller 3 til Grorud eller Furuset' },
      { badge: 'B', farge: 'blaa', tekst: 'Buss 31 eller 68 — stopp Årvoll' },
    ],
  }
}

// ── Typer: Kontakt ───────────────────────────────────────────────
export interface KontaktPage {
  hero:      { label: string; heading: string; ingress: string }
  skjemaUrl: string
  faq:       { sporsmal: string; svar: string }[]
}

export async function getKontaktPage(): Promise<KontaktPage> {
  const d = await sanityClient.fetch(`
    *[_type == "kontaktPage"][0] {
      hero { label, heading, ingress },
      skjemaUrl,
      faq[] { sporsmal, svar }
    }
  `)
  return {
    hero: {
      label:   d?.hero?.label   ?? 'Tryllemuseet',
      heading: d?.hero?.heading ?? 'Kontakt oss',
      ingress: d?.hero?.ingress ?? 'Vi svarer på e-post så snart vi kan. Send gjerne spørsmål eller booking-forespørsel.',
    },
    skjemaUrl: d?.skjemaUrl ?? 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=ntTGX9tmLEuCq9W0nbG7xw-QkId2PUtCgZXNTCF6McdUNjhIWjhENjhaWTA2U1ZCTjBKRjZIUjdSMy4u&embed=true',
    faq: d?.faq ?? [
      { sporsmal: 'Kan vi booke besøk for en skole eller gruppe?',   svar: 'Ja! Vi tar imot grupper og skoleklasser etter avtale. Send oss en melding med antall deltakere og ønsket dato.' },
      { sporsmal: 'Er museet tilgjengelig for rullestol?',           svar: 'Ta kontakt med oss på forhånd, så sørger vi for at besøket blir best mulig.' },
      { sporsmal: 'Holdes det bursdagsarrangementer?',               svar: 'Ta kontakt med oss for å høre om mulighetene — vi finner gjerne en magisk løsning!' },
      { sporsmal: 'Kan vi kjøpe tryllerekvisitter?',                 svar: 'Vi har et lite utvalg i museumsbutikken. Større utvalg finner du hos spesialforretninger som Egelos Crazy Shop.' },
    ],
  }
}

// ── Typer: Tryllehistorie ─────────────────────────────────────────
export interface TryllehistorieSeksjon {
  href:   string
  emoji:  string
  title:  string
  sub:    string
  desc:   string
  badge:  string
  soon:   boolean
}

export interface TryllehistoriePage {
  hero:              { label: string; heading: string; ingress: string }
  seksjoner:         TryllehistorieSeksjon[]
  tidslinjeHeading:  string
  tidslinje:         { aar: string; hendelse: string; siste: boolean }[]
}

export async function getTryllehistoriePage(): Promise<TryllehistoriePage> {
  const [d, counts] = await Promise.all([
    sanityClient.fetch(`
    *[_type == "tryllehistoriePage"][0] {
      hero { label, heading, ingress },
      seksjoner[] { href, emoji, title, sub, desc, badge, soon },
      tidslinjeHeading,
      tidslinje[] { aar, hendelse, siste }
    }
  `),
    sanityClient.fetch(`{
      "biografier": count(*[_type == "biography" && isVisible != false]),
      "legender":   count(*[_type == "legend" && isVisible != false && ${NOT_UTSTILLING}]),
      "gotTalent":  count(*[_type == "tvAppearance" && show in $shows && isVisible != false]),
      "foolUs":     count(*[_type == "tvAppearance" && show == "fool-us" && isVisible != false]),
      "opptak":     count(*[_type == "historicalClip" && isVisible != false]),
      "artikler":   count(*[_type == "historiskeKlippNb" && isVisible != false && publishedAt <= now()]),
      "magikere":   count(*[_type == "magician" && isVisible != false]),
      "hvemSkulleTrodd": count(*[_type == "whoKnew" && isVisible != false])
    }`, { shows: GOT_TALENT_SHOWS }),
  ])

  // Archive-card badges are counted at build time so they never go stale.
  // Cards whose href isn't listed here keep their editor-entered badge.
  const autoBadge: Record<string, string> = {
    '/tryllehistorie/magiens-hvem-er-hvem': `${counts.biografier} biografier`,
    '/tryllehistorie/fordypninger':         `${counts.legender} artikler`,
    '/tryllehistorie/got-talent':           `${counts.gotTalent} opptredener`,
    '/tryllehistorie/fool-us':              `${counts.foolUs} opptredener`,
    '/tryllehistorie/historiske-opptak':    `${counts.opptak} opptak`,
    '/tryllehistorie/historiske-artikler':  `${counts.artikler} artikler`,
    '/utstillingen':                        `${counts.magikere} utstillingsfelt`,
    '/tryllehistorie/hvem-skulle-trodd':    `${counts.hvemSkulleTrodd} oppføringer`,
  }
  const withAutoBadges = (seksjoner: TryllehistorieSeksjon[]) =>
    seksjoner.map(s => {
      if (s.soon) return s
      const auto = autoBadge[s.href?.replace(/\/+$/, '') ?? '']
      return auto ? { ...s, badge: auto } : s
    })

  return {
    hero: {
      label:   d?.hero?.label   ?? 'Tryllemuseet',
      heading: d?.hero?.heading ?? 'Tryllehistorie',
      ingress: d?.hero?.ingress ?? 'Fra begerspillet i Egypt for 4000 år siden til gullalderens store scenemagikere og norske tryllekunstnere i dag — magiens lange historie.',
    },
    seksjoner: withAutoBadges(d?.seksjoner ?? [
      { href: '/tryllehistorie/magiens-hvem-er-hvem',        emoji: '📖', title: 'Magiens Hvem er Hvem',               sub: 'Norske tryllekunstnere',      desc: 'Biografier over norske tryllekunstnere fra Terje Nordheims standardverk. Søk på navn, kunstnernavn og spesialitet.',                                                                    badge: 'Biografier',  soon: false },
      { href: '/utstillingen',                                emoji: '🎩', title: 'Gullalderen 1845–1930',              sub: 'Internasjonal tryllehistorie', desc: 'Robert-Houdin, Herrmann, Kellar, Thurston og Houdini — magikerne som forandret verden og skapte scenetryllingens gylne epoke.',                                                          badge: '7 utstillingsfelt', soon: false },
      { href: '/tryllehistorie/hvem-skulle-trodd',            emoji: '🎭', title: 'Hvem skulle trodd?',                 sub: 'Kjente ansikter, hemmelig magi',        desc: 'Visste du at Henrik Ibsen tryllet? Fra vitenskap til sport og kultur — kjente personligheter med et hemmelig forhold til magien.',                                                          badge: 'Artikler',         soon: false },
      { href: '/tryllehistorie/begerspillet',                 emoji: '🏺', title: 'Begerspillet',                       sub: 'Magiens opprinnelse',         desc: 'Verdens eldste kjente trylletriks — avbildet i Egypt for over 4000 år siden. Historien om magiens aller første triks.',                                                                     badge: 'Kommer snart',    soon: true  },
      { href: '/tryllehistorie/fordypninger',                 emoji: '⭐', title: 'Fordypninger',                       sub: 'Portretter og dypdykk',       desc: 'Egelo, Jan Crosby, Arnardo og andre — norske og internasjonale tryllekunstnere som har satt spor. Dyptgående portretter.',                                                                    badge: '8 artikler',      soon: false },
      { href: '/tryllehistorie/got-talent',                   emoji: '🏆', title: 'Got Talent',                         sub: 'Nordisk TV-magi',             desc: 'Norske, svenske, danske og finske tryllekunstnere i Norske Talenter, Talang, Danmark har Talent og Talent Suomi.',                                                                          badge: '35 opptredener',  soon: false },
      { href: '/tryllehistorie/fool-us',                      emoji: '🎯', title: 'Penn & Teller: Fool Us',             sub: 'Nordisk TV-magi',             desc: 'Nordiske magikere som har møtt Penn & Teller i den prestisjetunge fagduellen fra Las Vegas. 7 klarte å lure dem.',                                                                            badge: 'Opptredener',  soon: false },
    ]),
    tidslinjeHeading: d?.tidslinjeHeading ?? '4000 år med magi',
    tidslinje: d?.tidslinje ?? [
      { aar: 'ca. 2500 f.Kr.', hendelse: 'Magikeren Dedi skal ha opptrådt for farao Khufu — historiens eldste navngitte tryllekunstner',    siste: false },
      { aar: 'ca. 2000 f.Kr.', hendelse: 'Begerspillet avbildes i Egypt — verdens eldste kjente trylletriks',                               siste: false },
      { aar: '1584',           hendelse: 'Reginald Scots «The Discoverie of Witchcraft» — den første trykte boken som forklarer trylletriks', siste: false },
      { aar: '1600-tallet',    hendelse: 'Ordet «hokus pokus» dukker opp i England — en gjøglers liksom-latin, laget for å høres magisk ut', siste: false },
      { aar: '1770',           hendelse: 'Kempelens «sjakktyrker» forbløffer Europa — og spiller mot både Napoleon og Benjamin Franklin',    siste: false },
      { aar: 'ca. 1840',       hendelse: 'Unge Henrik Ibsen holder trylleforestillinger for naboene hjemme i Skien',                         siste: false },
      { aar: '1845',           hendelse: 'Robert-Houdin åpner sitt teater i Paris — den moderne scenetryllingens fødsel',                    siste: false },
      { aar: '1848',           hendelse: 'Fox-søstrene lar «åndene» banke i bordet — den moderne spiritismen fødes i USA',                   siste: false },
      { aar: '1856',           hendelse: 'Robert-Houdin stopper et opprør i Algerie — med tryllekunst',                                      siste: false },
      { aar: '1865',           hendelse: '«Sfinksen» vises i London — speilillusjonenes store gjennombrudd',                                 siste: false },
      { aar: '1896',           hendelse: 'Adelaide Herrmann overtar showet etter sin manns død — blir «The Queen of Magic»',                  siste: false },
      { aar: '1896',           hendelse: 'Méliès lar en dame forsvinne på film — trylleriet flytter inn i det nye mediet',                   siste: false },
      { aar: '1908',           hendelse: 'Kellar overrekker tittelen til Thurston — gullalderens store kroningsseremoni',                    siste: false },
      { aar: '1926',           hendelse: 'Houdini dør på Halloween — gullalderens slutt',                                                    siste: false },
      { aar: '1928',           hendelse: 'Magiske Cirkel Norge stiftes i Oslo 21. oktober — opprinnelig som Magisk Cirkel Oslo',             siste: false },
      { aar: '1947',           hendelse: 'Den Magiske Ring stiftes i Oslo — ti unge tryllekunstnere rundt et rundt bord',                    siste: false },
      { aar: '1997',           hendelse: 'David Blaines «Street Magic» — vendepunktet for gatemagien på TV',                                 siste: false },
      { aar: 'I dag',          hendelse: 'Tryllemuseet på Årvoll holder historien levende',                                                  siste: true  },
    ],
  }
}

// ── Typer: Ressurser ─────────────────────────────────────────────
export interface RessursKort {
  emoji:       string
  title:       string
  beskrivelse: string
  href:        string
  soon:        boolean
}

export interface RessurserPage {
  hero:      { label: string; heading: string; ingress: string }
  ressurser: RessursKort[]
}

export async function getRessurserPage(): Promise<RessurserPage> {
  const d = await sanityClient.fetch(`
    *[_type == "ressurserPage"][0] {
      hero { label, heading, ingress },
      ressurser[] { emoji, title, beskrivelse, href, soon }
    }
  `)
  return {
    hero: {
      label:   d?.hero?.label   ?? 'Tryllemuseet',
      heading: d?.hero?.heading ?? 'Ressurser',
      ingress: d?.hero?.ingress ?? 'Tryllekatalog, bibliotek, kunstnerregister og mer.',
    },
    ressurser: d?.ressurser ?? [
      { emoji: '📚', title: 'Bibliotek',                  beskrivelse: 'Norske tryllebøker og faglitteratur om illusjonismens kunst.',                                           href: '/ressurser/bibliotek',                                  soon: false },
      { emoji: '🪄', title: 'Hvem er hvem',               beskrivelse: 'Biografiregister over norske og nordiske tryllekunstnere.',                                              href: '/tryllehistorie/magiens-hvem-er-hvem',                  soon: false },
      { emoji: '📺', title: 'Nordiske magikere på TV',    beskrivelse: 'Oversikt over nordiske tryllekunstnere i Got Talent og Penn & Teller: Fool Us.',                        href: '/tryllehistorie/nordisk-tv-magi',                       soon: false },
      { emoji: '🎩', title: 'Tryllekatalogen ↗',          beskrivelse: 'Magiske Cirkel Norges katalog over norske tryllekunstnere.',                                            href: 'https://www.magiskecirkel.no/tryllekatalogen',           soon: false },
      { emoji: '🎭', title: 'Tryllekunstnere',            beskrivelse: 'Register over tryllekunstnere tilknyttet museet og MCN.',                                               href: '',                                                       soon: true  },
      { emoji: '✨', title: 'Magiske øyeblikk',           beskrivelse: 'Høydepunkter og øyeblikk fra museets liv og arrangementer.',                                            href: '',                                                       soon: true  },
      { emoji: '📰', title: 'Historiske avisartikler',    beskrivelse: 'Gamle avisartikler om norsk tryllekunst fra Nasjonalbibliotekets arkiv.',                              href: '/tryllehistorie/historiske-artikler',                    soon: false },
    ],
  }
}

// ── Typer: Arrangementer (side) ──────────────────────────────────
export interface ArrangementInfoItem {
  emoji:     string
  heading:   string
  tekst:     string
  linkHref?: string
  linkTekst?: string
}

export interface ArrangementPage {
  hero:      { label: string; heading: string; ingress: string }
  infoStrip: ArrangementInfoItem[]
}

export async function getArrangementPage(): Promise<ArrangementPage> {
  const d = await sanityClient.fetch(`
    *[_type == "arrangementPage"][0] {
      hero { label, heading, ingress },
      infoStrip[] { emoji, heading, tekst, linkHref, linkTekst }
    }
  `)
  return {
    hero: {
      label:   d?.hero?.label   ?? 'Tryllemuseet',
      heading: d?.hero?.heading ?? 'Arrangementer',
      ingress: d?.hero?.ingress ?? 'Tryllekurs, familieforestillinger og magiske opplevelser for alle aldre. Tre forestillinger og kurs hvert halvår.',
    },
    infoStrip: d?.infoStrip ?? [
      { emoji: '🎭', heading: '3 forestillinger pr. halvår',  tekst: 'Vi arrangerer familieforestillinger og tryllekurs jevnlig gjennom året.' },
      { emoji: '👥', heading: 'Grupper og skoler',            tekst: 'Vi tar imot grupper etter avtale.',          linkHref: '/kontakt', linkTekst: 'Ta kontakt' },
      { emoji: '📍', heading: 'Årvoll gård, Oslo',            tekst: 'Årvollveien 35, 0590 Oslo.',                linkHref: '/besok',   linkTekst: 'Se veibeskrivelse' },
    ],
  }
}

// ── Typer: Utstillingen (side) ────────────────────────────────────
export interface UtstillingPage {
  hero: { eraLabel: string; heading: string; ingress: string }
  gullalderSeksjon: { label: string; heading: string; ingress: string }
  fremhevedeSlugs: string[]
  kommerSnartSeksjon: { label: string; heading: string }
  seksjoner: { icon: string; label: string; title: string; description: string; slug: string; ready: boolean }[]
}

export async function getUtstillingPage(): Promise<UtstillingPage> {
  const d = await sanityClient.fetch(`
    *[_type == "utstillingPage"][0] {
      hero { eraLabel, heading, ingress },
      gullalderSeksjon { label, heading, ingress },
      fremhevedeSlugs,
      kommerSnartSeksjon { label, heading },
      seksjoner[] { icon, label, title, description, slug, ready }
    }
  `)
  return {
    hero: {
      eraLabel: d?.hero?.eraLabel ?? '1845 – 1930',
      heading:  d?.hero?.heading  ?? 'Utstillingen',
      ingress:  d?.hero?.ingress  ?? 'Tryllekunsten har en rik og fascinerende historie. Her møter du magikerne som formet verden — fra teatersalene i Paris til de store scenene i Amerika. Utforsk gullalderen, norske legender, og museets unike samling.',
    },
    gullalderSeksjon: {
      label:   d?.gullalderSeksjon?.label   ?? 'Fremhevet',
      heading: d?.gullalderSeksjon?.heading ?? 'Tryllingens gullalder',
      ingress: d?.gullalderSeksjon?.ingress ?? 'Tre ikoner som definerte en epoke. I det fysiske museet bærer filmene og den mystiske kula vitnesbyrd om gullalderens storhet.',
    },
    fremhevedeSlugs: d?.fremhevedeSlugs ?? ['robert-houdin', 'alexander', 'houdini'],
    kommerSnartSeksjon: {
      label:   d?.kommerSnartSeksjon?.label   ?? 'Mer å utforske',
      heading: d?.kommerSnartSeksjon?.heading ?? 'I utstillingen',
    },
    seksjoner: d?.seksjoner ?? [
      { icon: '⭐',   label: 'Portretter',          title: 'Fordypninger',       description: 'Fra Arnardo til Finn Jon — tryllekunstnerne som satte spor.',                                slug: 'fordypninger',       ready: false },
      { icon: '🎩',   label: 'Samlingen',           title: 'Artefakter',         description: 'Sjeldne rekvisitter, historiske gjenstander og mysterier fra museets samling.',              slug: 'artefakter',         ready: true  },
      { icon: '♣',    label: 'Organisasjonene',     title: 'Trylleforeningene',  description: 'Magiske Cirkel Norge og Den magiske ring — fellesskapet bak kunsten.',                      slug: 'trylleforeningene',  ready: true  },
      { icon: '🛍',   label: 'Butikken',             title: 'Tryllebutikken',     description: 'Bøker, rekvisitter og kuriositeter for den nysgjerrige.',                                   slug: 'tryllebutikken',     ready: true  },
    ],
  }
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
  mapEmbedUrl?:      string
  openingHoursShort: string
  openingHoursNote:  string
  membershipUrl:     string
  vippsNumber:       string
  facebook:          string
  instagram:         string
  youtube?:          string
  seoDescription:    string
}

// Kun e-post og adresse — til personvernsiden
export async function getSiteContactInfo(): Promise<{ email?: string; address?: string } | null> {
  return sanityClient.fetch(`*[_type == "siteConfig"][0] { email, address }`)
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const config = await sanityClient.fetch(`
    *[_type == "siteConfig"][0] {
      siteName, siteTagline, email, phone,
      address, addressShort, mapUrl, mapEmbedUrl,
      openingHoursShort, openingHoursNote,
      membershipUrl, vippsNumber,
      facebook, instagram, youtube,
      seoDescription
    }
  `)
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

// ── Legg til på slutten av src/lib/sanity.ts ────────────────────

// ── Typer: TV-opptreden ──────────────────────────────────────────
export interface TvAppearance {
  _id:           string
  slug:          string
  show:          string
  year:          number
  season?:       number
  episode?:      number
  episodeTitle?: string
  result:        string
  description?:  any[]
  videoUrl?:     string
  featuredImage?: { asset: { _ref: string; url: string }; alt?: string; caption?: string }
  magician: {
    _id:         string
    name:        string
    slug:        string
    artistName?: string
    nationality?: string
    years?:      string
    shortBio?:   string
    tags?:       string[]
    mainImage?:  { asset: { _ref: string; url: string }; alt?: string }
    links?:      { label: string; type?: string; url?: string; internalSlug?: string }[]
  }
}

// ── Hjelpefunksjoner ─────────────────────────────────────────────

export interface ShowMeta {
  label:    string
  category: 'got_talent' | 'fool_us' | 'other'
  country:  string
}

/** Utleder kategori og programland fra show-slug — ingen redundante felt i skjemaet. */
export const showMeta: Record<string, ShowMeta> = {
  'norske-talenter':    { label: 'Norske Talenter',        category: 'got_talent', country: 'Norsk'      },
  'talang':             { label: 'Talang',                  category: 'got_talent', country: 'Svensk'     },
  'fool-us':            { label: 'Penn & Teller: Fool Us',  category: 'fool_us',    country: 'Amerikansk' },
  'danmark-har-talent': { label: 'Danmark har Talent',      category: 'got_talent', country: 'Dansk'      },
  'talent-suomi':       { label: 'Talent Suomi',            category: 'got_talent', country: 'Finsk'      },
  'bgt':                { label: "Britain's Got Talent",    category: 'got_talent', country: 'Britisk'    },
  'das-supertalent':    { label: 'Das Supertalent',         category: 'got_talent', country: 'Tysk'       },
  'annet':              { label: 'Annet',                   category: 'other',      country: ''           },
}

/** Bakoverkompatibel snarvei — brukes der bare etiketten trengs. */
export const showLabels: Record<string, string> = Object.fromEntries(
  Object.entries(showMeta).map(([k, v]) => [k, v.label])
)

export const resultLabels: Record<string, string> = {
  'fooled':         '✅ Fooled Us',
  'winner':         '🥇 Vinner',
  'second':         '🥈 2. plass',
  'third':          '🥉 3. plass',
  'finalist':       '🏅 Finalist',
  'golden-buzzer':  '⭐ Gullknapp',
  'semifinalist':   '🎯 Semifinalist',
  'not_fooled':     '✖️ Not Fooled',
  'participant':    '📋 Deltaker',
}

// ── Spørringer: TV-opptreden ─────────────────────────────────────

/** Show-slugs som regnes som Got Talent-formater. */
export const GOT_TALENT_SHOWS = [
  'norske-talenter', 'talang', 'danmark-har-talent',
  'talent-suomi', 'bgt', 'das-supertalent',
]

// Fool Us-opptredener — til /tryllehistorie/fool-us
export async function getFoolUsAppearances(): Promise<TvAppearance[]> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && show == "fool-us" && isVisible != false] | order(year desc, season asc, episode asc) {
      _id,
      "slug": slug.current,
      year, season, episode, episodeTitle,
      result,
      featuredImage { asset->{ url }, alt },
      videoUrl,
      magician-> {
        _id, name, "slug": slug.current,
        artistName, nationality,
        mainImage { asset->{ url }, alt }
      }
    }
  `)
}

// Got Talent-opptredener — til /tryllehistorie/got-talent
export async function getGotTalentAppearances(): Promise<TvAppearance[]> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && show in $shows && isVisible != false] | order(year desc, show asc) {
      _id,
      "slug": slug.current,
      show, year, season, episode, episodeTitle,
      result,
      featuredImage { asset->{ url }, alt },
      videoUrl,
      magician-> {
        _id, name, "slug": slug.current,
        artistName, nationality,
        mainImage { asset->{ url }, alt }
      }
    }
  `, { shows: GOT_TALENT_SHOWS })
}

// Én Fool Us-opptreden via slug — til detaljsiden
export async function getFoolUsAppearanceBySlug(slug: string): Promise<TvAppearance | null> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && show == "fool-us" && slug.current == $slug && isVisible != false][0] {
      _id, "slug": slug.current,
      show, year, season, episode, episodeTitle,
      result, description, videoUrl,
      featuredImage { asset->{ url }, alt, caption },
      magician-> {
        _id, name, "slug": slug.current,
        artistName, nationality, years, shortBio, tags,
        mainImage { asset->{ url }, alt },
        links[] { label, type, url, "internalSlug": internalRef->slug.current }
      }
    }
  `, { slug })
}

// Én Got Talent-opptreden via slug — til detaljsiden
export async function getGotTalentAppearanceBySlug(slug: string): Promise<TvAppearance | null> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && show in $shows && slug.current == $slug && isVisible != false][0] {
      _id, "slug": slug.current,
      show, year, season, episode, episodeTitle,
      result, description, videoUrl,
      featuredImage { asset->{ url }, alt, caption },
      magician-> {
        _id, name, "slug": slug.current,
        artistName, nationality, years, shortBio, tags,
        mainImage { asset->{ url }, alt },
        links[] { label, type, url, "internalSlug": internalRef->slug.current }
      }
    }
  `, { slug, shows: GOT_TALENT_SHOWS })
}

// Andre opptredener av samme magiker — sidekolonnen på detaljsidene
export async function getOtherTvAppearances(slug: string, magicianId: string): Promise<{ slug: string; show: string; year?: number; result?: string }[]> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && slug.current != $slug && magician._ref == $magicianId && isVisible != false] | order(year asc) {
      "slug": slug.current, show, year, result
    }
  `, { slug, magicianId })
}

// Statiske stier for fool-us/[slug].astro
export async function getFoolUsPaths() {
  const slugs = await sanityClient.fetch(`
    *[_type == "tvAppearance" && show == "fool-us" && isVisible != false] { "slug": slug.current }
  `)
  return slugs
    .filter((s: { slug?: string }) => s.slug)
    .map((s: { slug: string }) => ({ params: { slug: s.slug } }))
}

// Statiske stier for got-talent/[slug].astro
export async function getGotTalentPaths() {
  const slugs = await sanityClient.fetch(`
    *[_type == "tvAppearance" && show in $shows && isVisible != false] { "slug": slug.current }
  `, { shows: GOT_TALENT_SHOWS })
  return slugs
    .filter((s: { slug?: string }) => s.slug)
    .map((s: { slug: string }) => ({ params: { slug: s.slug } }))
}

// Slug + show for alle opptredener — til redirect-ruten nordisk-tv-magi/[slug]
export async function getTvAppearanceSlugsWithShow(): Promise<{ slug: string; show: string }[]> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && isVisible != false] {
      "slug": slug.current,
      show
    }
  `)
}

// Alle opptredener — til oversiktssiden
export async function getAllTvAppearances(): Promise<TvAppearance[]> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && isVisible != false] | order(year desc, show asc) {
      _id,
      "slug": slug.current,
      show, year, season, episode, episodeTitle,
      result,
      featuredImage { asset->{ _ref, url }, alt },
      magician-> {
        _id, name, "slug": slug.current,
        artistName, nationality, years, shortBio,
        mainImage { asset->{ _ref, url }, alt }
      }
    }
  `)
}

// Én opptreden via slug — til detaljsiden
export async function getTvAppearanceBySlug(slug: string): Promise<TvAppearance | null> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && slug.current == $slug && isVisible != false][0] {
      _id,
      "slug": slug.current,
      show, year, season, episode, episodeTitle,
      result, description, videoUrl,
      featuredImage { asset->{ _ref, url }, alt, caption },
      magician-> {
        _id, name, "slug": slug.current,
        artistName, nationality, years, shortBio,
        mainImage { asset->{ _ref, url }, alt },
        tags,
        links[] {
          label, type, url,
          "internalSlug": internalRef->slug.current
        }
      }
    }
  `, { slug })
}

// Alle opptredener for én magiker — brukes på biography-detaljsiden
export async function getTvAppearancesByMagician(magicianId: string): Promise<TvAppearance[]> {
  return sanityClient.fetch(`
    *[_type == "tvAppearance" && magician._ref == $magicianId && isVisible != false] | order(year asc) {
      _id,
      "slug": slug.current,
      show, year, season, episode, episodeTitle,
      result,
      featuredImage { asset->{ _ref, url }, alt }
    }
  `, { magicianId })
}

// Statiske stier for [slug].astro
export async function getTvAppearancePaths() {
  const appearances = await sanityClient.fetch(`
    *[_type == "tvAppearance" && isVisible != false] { "slug": slug.current }
  `)
  return appearances
    .filter((a: { slug?: string }) => a.slug)
    .map((a: { slug: string }) => ({ params: { slug: a.slug } }))
}

// ── PortableText → HTML ──────────────────────────────────────────
import { toHTML } from '@portabletext/to-html'
import type { PortableTextBlock } from '@portabletext/types'

/**
 * Converts Sanity PortableText (any[]) to an HTML string.
 * Usage:  const html = portableTextToHtml(doc.fullBio)
 * In .astro: <div set:html={html} />
 *
 * Handles: paragraphs, headings (h2–h4), bold, italic,
 * underline, links, bullet lists, numbered lists, blockquotes.
 */
export function portableTextToHtml(blocks: PortableTextBlock[] | undefined | null): string {
  if (!blocks?.length) return ''
  return toHTML(blocks, {
    components: {
      marks: {
        link: ({ children, value }) =>
          `<a href="${value?.href ?? '#'}" target="_blank" rel="noopener noreferrer">${children}</a>`,
        internalLink: ({ children, value }) => {
          const slug = value?.reference?.slug ?? ''
          return slug
            ? `<a href="/tryllehistorie/magiens-hvem-er-hvem/${slug}">${children}</a>`
            : `<span>${children}</span>`
        },
      },
    },
  })
}

// ── Typer: Biography ─────────────────────────────────────────────

export interface BiographyVideo {
  title:        string
  url:          string
  type?:        'tv' | 'intervju' | 'opptreden' | 'annet'
  year?:        number
}

export interface BiographyLink {
  label:         string
  type?:         string
  url?:          string
  internalSlug?: string
}

export interface BiographyImage {
  asset:    { _ref: string; url: string }
  alt?:     string
  caption?: string
}

export interface Biography {
  _id:         string
  name:        string
  slug:        string
  artistName?: string
  aliases?:    string[]
  nationality?: string
  birthDate?:  string
  deathDate?:  string
  years?:      string
  collection?: string[]
  featured?:   boolean
  tags?:       string[]
  mainImage?:  BiographyImage
  gallery?:    BiographyImage[]
  shortBio?:   string
  fullBio?:    any[]
  videos?:     BiographyVideo[]
  links?:      BiographyLink[]
  legendRef?:    { _ref: string; slug: string }
  sources?:      { label: string; url?: string }[]
  lastVerified?: string
  needsUpdate?:  boolean
}

// ── Typer: Legend ────────────────────────────────────────────────

export interface Legend {
  _id:          string
  title:        string
  slug:         string
  excerpt?:     string
  biographyRef?: {
    _id:         string
    name:        string
    slug:        string
    artistName?: string
    birthDate?:  string
    deathDate?:  string
    years?:      string
    mainImage?:  BiographyImage
  }
  mainImage?:   BiographyImage
  gallery?:     BiographyImage[]
  content?:     any[]
  videos?:      BiographyVideo[]
  tags?:        string[]
  sources?:     { label: string; url?: string }[]
  // Utstillingen-felt — se schemaTypes/legend.ts. Kun satt på dokumenter som
  // også har physicalOrder og/eller stasjoner (filtrert bort fra getAllLegends
  // / getLegendBySlug / getLegendPaths under, som er for /tryllehistorie).
  tagline?:       string
  years?:         string
  qrNumber?:      number
  physicalOrder?: number
  childText?:     string
  childActivity?: string
  wallText?:      any[]
  detailIntro?:   string
  sections?:      { heading: string; body: any[] }[]
  stations?:      LegendStation[]
}

export interface LegendStation {
  title:           string
  order?:          number
  year?:           string
  image?:          { asset: { _ref: string; url: string }; alt?: string }
  textKids?:       string
  textAdults?:     string
  activityPrompt?: string
}

// ── Spørringer: Biography ────────────────────────────────────────

// Alle biografier i HEH-oversikten
export async function getAllBiographies(): Promise<Biography[]> {
  return sanityClient.fetch(`
    *[_type == "biography" && isVisible != false] | order(name asc) {
      _id, name, "slug": slug.current,
      artistName, nationality, years,
      birthDate, deathDate,
      collection, featured, tags,
      shortBio,
      mainImage { asset->{ _ref, url }, alt }
    }
  `)
}

// Én biografi via slug — til profilsiden
export async function getBiographyBySlug(slug: string): Promise<Biography | null> {
  return sanityClient.fetch(`
    *[_type == "biography" && slug.current == $slug && isVisible != false][0] {
      _id, name, "slug": slug.current,
      artistName, aliases, nationality,
      birthDate, deathDate, years,
      collection, featured, tags,
      mainImage { asset->{ _ref, url }, alt, caption },
      gallery[] { asset->{ _ref, url }, alt, caption },
      shortBio, fullBio,
      videos[] { title, url, type, year },
      links[] {
        label, type, url,
        "internalSlug": internalRef->slug.current
      },
      "legendRef": legendRef-> { "slug": slug.current },
      sources[] { label, url },
      lastVerified, needsUpdate
    }
  `, { slug })
}

// Statiske stier for biography [slug].astro
export async function getBiographyPaths() {
  const bios = await sanityClient.fetch(`
    *[_type == "biography" && isVisible != false] { "slug": slug.current }
  `)
  return bios
    .filter((b: { slug?: string }) => b.slug)
    .map((b: { slug: string }) => ({ params: { slug: b.slug } }))
}

// Kompakt katalogvisning — til /tryllehistorie/magiens-hvem-er-hvem
export async function getBiographyDirectory(): Promise<Biography[]> {
  return sanityClient.fetch(`
    *[_type == "biography" && isVisible != false] | order(name asc) {
      _id,
      name,
      artistName,
      aliases,
      years,
      nationality,
      shortBio,
      tags,
      needsUpdate,
      featured,
      "slug": slug.current,
      mainImage { asset->{ url }, alt }
    }
  `)
}

// ── Spørringer: Legend ───────────────────────────────────────────

// Filter delt av alle spørringer under: ekskluderer utstillingen-artikler
// (fysisk plassert i museet og/eller med stasjoner) — de hører hjemme under
// /utstillingen, se getGullalderenPanels / getUtstillingDeepDives / getUtstillingEntryBySlug.
const NOT_UTSTILLING = `!defined(physicalOrder) && (!defined(stations) || count(stations) == 0)`

// Alle legender — til oversiktssiden
export async function getAllLegends(): Promise<Legend[]> {
  return sanityClient.fetch(`
    *[_type == "legend" && isVisible != false && ${NOT_UTSTILLING}] | order(title asc) {
      _id, title, "slug": slug.current,
      excerpt, tags,
      mainImage { asset->{ _ref, url }, alt },
      biographyRef-> {
        _id, name, "slug": slug.current,
        artistName, birthDate, deathDate, years,
        mainImage { asset->{ _ref, url }, alt }
      }
    }
  `)
}

// Én legende via slug — til artikkelsiden
export async function getLegendBySlug(slug: string): Promise<Legend | null> {
  return sanityClient.fetch(`
    *[_type == "legend" && slug.current == $slug && isVisible != false && ${NOT_UTSTILLING}][0] {
      _id, title, "slug": slug.current,
      excerpt, tags,
      mainImage { asset->{ _ref, url }, alt, caption },
      gallery[] { asset->{ _ref, url }, alt, caption },
      content,
      videos[] { title, url, type, year },
      sources[] { label, url },
      biographyRef-> {
        _id, name, "slug": slug.current,
        artistName, birthDate, deathDate, years,
        mainImage { asset->{ _ref, url }, alt }
      }
    }
  `, { slug })
}

// Statiske stier for legend [slug].astro
export async function getLegendPaths() {
  const legends = await sanityClient.fetch(`
    *[_type == "legend" && isVisible != false && ${NOT_UTSTILLING}] { "slug": slug.current }
  `)
  return legends
    .filter((l: { slug?: string }) => l.slug)
    .map((l: { slug: string }) => ({ params: { slug: l.slug } }))
}

// ── Typer: WhoKnew ────────────────────────────────────────────────

export type WhoKnewCategory = 'vitenskap' | 'politikk' | 'sport' | 'kultur'

export interface WhoKnewRelated {
  _type: 'legend' | 'magician' | 'biography'
  title: string
  slug:  string
}

export interface WhoKnew {
  _id:                string
  name:                string
  slug:                string
  category:            WhoKnewCategory
  hook:                string
  body?:               any[]
  image?:              { asset: { _ref: string; url: string }; alt?: string }
  relatedRef?:         WhoKnewRelated
  sources?:            { label: string; url?: string }[]
  featureOnFrontpage?: boolean
}

// ── Spørringer: WhoKnew ("Hvem skulle trodd?") ────────────────────

const whoKnewCardProjection = `
  _id, name, "slug": slug.current, category, hook,
  image { asset->{ _ref, url }, alt },
  relatedRef-> { _type, "title": coalesce(title, name), "slug": slug.current }
`

// Fremhevede kort til forsiden
export async function getFrontpageWhoKnew(limit = 3): Promise<WhoKnew[]> {
  return sanityClient.fetch(`
    *[_type == "whoKnew" && isVisible != false && featureOnFrontpage == true]
      | order(frontpageOrder asc, name asc) [0...$limit] {
      ${whoKnewCardProjection}
    }
  `, { limit })
}

// Alle oppføringer — til arkivsiden
export async function getAllWhoKnew(): Promise<WhoKnew[]> {
  return sanityClient.fetch(`
    *[_type == "whoKnew" && isVisible != false] | order(name asc) {
      ${whoKnewCardProjection}
    }
  `)
}

// Én oppføring via slug — til artikkelsiden
export async function getWhoKnewBySlug(slug: string): Promise<WhoKnew | null> {
  return sanityClient.fetch(`
    *[_type == "whoKnew" && slug.current == $slug && isVisible != false][0] {
      ${whoKnewCardProjection},
      body,
      sources[] { label, url }
    }
  `, { slug })
}

// Lenke til den fulle historien for en relatedRef (legend, magician eller biography)
export function whoKnewRelatedHref(related: WhoKnewRelated): string {
  if (related._type === 'magician') return `/utstillingen/${related.slug}`
  if (related._type === 'biography') return `/tryllehistorie/magiens-hvem-er-hvem/${related.slug}`
  return `/tryllehistorie/fordypninger/${related.slug}`
}

// Statiske stier for whoKnew [slug].astro
export async function getWhoKnewPaths() {
  const entries = await sanityClient.fetch(`
    *[_type == "whoKnew" && isVisible != false] { "slug": slug.current }
  `)
  return entries
    .filter((e: { slug?: string }) => e.slug)
    .map((e: { slug: string }) => ({ params: { slug: e.slug } }))
}

// ── Typer: HistoricalClip ────────────────────────────────────────

export interface HistoricalClip {
  _id:            string
  slug:           string
  title:          string
  year?:          number
  broadcaster?:   string
  show?:          string
  category?:      string
  description?:   any[]
  videoUrl?:      string
  videoUrlAlt?:   string
  source?:        string
  featuredImage?: { asset: { url: string }; alt?: string; caption?: string }
  magician?: {
    _id:          string
    name:         string
    slug:         string
    artistName?:  string
    nationality?: string
    years?:       string
    shortBio?:    string
    tags?:        string[]
    mainImage?:   { asset: { url: string }; alt?: string }
    links?:       { label: string; type?: string; url?: string }[]
  }
}

// ── Spørringer: HistoricalClip ───────────────────────────────────

// Alle historiske opptak — til oversiktssiden
export async function getAllHistoricalClips(): Promise<HistoricalClip[]> {
  return sanityClient.fetch(`
    *[_type == "historicalClip" && isVisible != false] | order(year asc) {
      _id,
      "slug": slug.current,
      title, year, broadcaster, show, category,
      featuredImage { asset->{ url }, alt },
      videoUrl,
      magician-> {
        _id, name, "slug": slug.current,
        artistName, nationality,
        mainImage { asset->{ url }, alt }
      }
    }
  `)
}

// Ett opptak via slug — til detaljsiden
export async function getHistoricalClipBySlug(slug: string): Promise<HistoricalClip | null> {
  return sanityClient.fetch(`
    *[_type == "historicalClip" && slug.current == $slug && isVisible != false][0] {
      _id, "slug": slug.current,
      title, year, broadcaster, show, category,
      description, videoUrl, videoUrlAlt, source,
      featuredImage { asset->{ url }, alt, caption },
      magician-> {
        _id, name, "slug": slug.current,
        artistName, nationality, years, shortBio, tags,
        mainImage { asset->{ url }, alt },
        links[] { label, type, url }
      }
    }
  `, { slug })
}

// Andre opptak av samme magiker — sidekolonnen på detaljsiden
export async function getOtherHistoricalClips(slug: string, magicianId: string): Promise<{ slug: string; title: string; year?: number }[]> {
  return sanityClient.fetch(`
    *[_type == "historicalClip" && slug.current != $slug && magician._ref == $magicianId && isVisible != false] | order(year asc) {
      "slug": slug.current, title, year
    }
  `, { slug, magicianId })
}

// Statiske stier for historiske-opptak/[slug].astro
export async function getHistoricalClipPaths() {
  const slugs = await sanityClient.fetch(`
    *[_type == "historicalClip" && isVisible != false] { "slug": slug.current }
  `)
  return slugs
    .filter((s: { slug?: string }) => s.slug)
    .map((s: { slug: string }) => ({ params: { slug: s.slug } }))
}

// ── Typer: HistoriskKlippNb ───────────────────────────────────────

export interface HistoriskKlippNb {
  _id:          string
  title:        string
  slug:         string
  publishedAt:  string
  featuredDurationDays?: number
  originalDate?: string
  originalKicker?: string
  originalMainTitle?: string
  originalIngress?: string
  sourceName?:  string
  sourceUrl:    string
  copyrightOverride?: 'auto' | 'show' | 'hide'
  images?:      { asset: { _ref: string; url: string }; alt?: string; caption?: string }[]
  teaser:       string
  rewrittenText?: string
  commentary?:  string
  someText?:    string
  category?:    string
  mentionedMagicians?: {
    _id:         string
    name:        string
    slug:        string
    artistName?: string
  }[]
}

// ── Spørringer: HistoriskKlippNb ─────────────────────────────────

// Cutoff date for the 70-year copyright rule, computed at build time.
// The daily rebuild keeps this current without manual work.
function publicDomainCutoffIso(): string {
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 70)
  return cutoff.toISOString().split('T')[0] // YYYY-MM-DD
}

// Shared projection. originalFullText is deliberately excluded —
// it must never reach the frontend, regardless of article age.
// Facsimile images are gated in GROQ: editor override wins, otherwise
// the 70-year rule applies; missing originalDate means images stay hidden.
const historiskKlippProjection = `
  _id, title, "slug": slug.current,
  publishedAt, featuredDurationDays,
  originalDate, originalKicker, originalMainTitle, originalIngress,
  sourceName, sourceUrl, copyrightOverride,
  "images": select(
    copyrightOverride == "show" => images[]{ asset->{ _ref, url }, alt, caption },
    copyrightOverride == "hide" => [],
    originalDate < $publicDomainCutoff => images[]{ asset->{ _ref, url }, alt, caption },
    []
  ),
  teaser, rewrittenText, commentary, category,
  mentionedMagicians[]-> { _id, name, "slug": slug.current, artistName }
`

// Newest article within its featured window (default 7 days) — for homepage
export async function getLatestHistoriskKlipp(): Promise<HistoriskKlippNb | null> {
  return sanityClient.fetch(
    `
    *[_type == "historiskeKlippNb" && isVisible != false && publishedAt <= now()
      && (dateTime(now()) - dateTime(publishedAt)) < coalesce(featuredDurationDays, 7) * 86400
    ] | order(publishedAt desc) [0] {
      ${historiskKlippProjection}, someText
    }
    `,
    { publicDomainCutoff: publicDomainCutoffIso() }
  )
}

// All published articles, regardless of featured window — for archive page
export async function getHistoriskKlippArchive(): Promise<HistoriskKlippNb[]> {
  return sanityClient.fetch(
    `
    *[_type == "historiskeKlippNb" && isVisible != false && publishedAt <= now()] | order(publishedAt desc) {
      ${historiskKlippProjection}
    }
    `,
    { publicDomainCutoff: publicDomainCutoffIso() }
  )
}

// ── Typer: MediaAppearance ────────────────────────────────────────

export interface MediaAppearance {
  _id:               string
  title:             string
  slug:              string
  type:              'avis' | 'nettavis' | 'tv' | 'radio' | 'podkast'
  publishedAt:       string
  sourceName:        string
  sourceUrl?:        string
  image?:            { asset: { _ref: string; url: string }; alt?: string }
  quote?:            string
  teaser:            string
  videoUrl?:         string
  videoId?:          string
  featureOnFrontpage?: boolean
  frontpageUntil?:   string
}

// ── Spørringer: MediaAppearance ───────────────────────────────────

export async function getMediaAppearances(): Promise<MediaAppearance[]> {
  return sanityClient.fetch(`
    *[_type == "mediaAppearance" && isVisible != false] | order(publishedAt desc) {
      _id, title, "slug": slug.current,
      type, publishedAt, sourceName, sourceUrl,
      image { asset->{ _ref, url }, alt },
      quote, teaser, videoUrl, videoId,
      featureOnFrontpage, frontpageUntil
    }
  `)
}

// Single featured item for the homepage widget — respects frontpageUntil date
export async function getFeaturedMediaAppearance(today: string): Promise<MediaAppearance | null> {
  return sanityClient.fetch(`
    *[
      _type == "mediaAppearance" &&
      isVisible != false &&
      featureOnFrontpage == true &&
      (frontpageUntil == null || frontpageUntil >= $today)
    ] | order(publishedAt desc) [0] {
      _id, title, "slug": slug.current,
      type, publishedAt, sourceName, sourceUrl,
      image { asset->{ _ref, url }, alt },
      quote, teaser, videoUrl, videoId,
      featureOnFrontpage, frontpageUntil
    }
  `, { today })
}

// ── Typer: PersonvernPage ────────────────────────────────────────

export interface PersonvernSection {
  _key:    string
  heading: string
  body?:   any[]
}

export interface PersonvernPage {
  lastUpdated?: string
  intro?:       string
  sections?:    PersonvernSection[]
}

// ── Spørringer: PersonvernPage ───────────────────────────────────

export async function getPersonvernPage(): Promise<PersonvernPage | null> {
  return sanityClient.fetch(`
    *[_type == "personvernPage"][0] {
      lastUpdated, intro,
      sections[] { _key, heading, body }
    }
  `)
}

// ── Typer: Partner ───────────────────────────────────────────────

export interface Partner {
  _id:          string
  name:         string
  category:     'public' | 'private' | 'org' | 'benefit'
  url?:         string
  logo?:        { asset: { _ref: string; url: string } }
  description?: string
  order?:       number
}

// ── Spørringer: Partner ──────────────────────────────────────────

export async function getAllPartners(): Promise<Partner[]> {
  return sanityClient.fetch(`
    *[_type == "partner" && isVisible != false] | order(coalesce(order, 99) asc, name asc) {
      _id, name, category, url, order, description,
      logo { asset->{ _ref, url } }
    }
  `)
}

// ── Typer: MagicOrganization ─────────────────────────────────────

export interface MagicOrgLogoEntry {
  year?: number
  logo?: { asset: { _ref: string; url: string }; alt?: string }
  note?: string
}

export interface MagicOrgPerson {
  person: { name: string; slug: string }
  role?: string
  years?: string
}

export interface MagicOrgArticle {
  title: string
  articleSlug?: string
  ingress?: string
  body?: any[]
}

export interface MagicOrganization {
  _id:             string
  name:            string
  slug:            string
  abbreviation?:   string
  country?:        string
  foundedYear?:    number
  dissolutionYear?: number
  website?:        string
  ingress?:        string
  logo?:           { asset: { _ref: string; url: string }; alt?: string }
  logoHistory?:    MagicOrgLogoEntry[]
  body?:           any[]
  keyPeople?:      MagicOrgPerson[]
  articles?:       MagicOrgArticle[]
  gallery?:        { asset: { _ref: string; url: string }; alt?: string; caption?: string; year?: number }[]
  sources?:        { label: string; url?: string }[]
}

// ── Spørringer: MagicOrganization ────────────────────────────────

export async function getAllMagicOrganizations(): Promise<MagicOrganization[]> {
  return sanityClient.fetch(`
    *[_type == "magicOrganization" && isVisible != false] | order(name asc) {
      _id, name, "slug": slug.current,
      abbreviation, country, foundedYear, dissolutionYear,
      website, ingress,
      "logo": logoHistory[-1].logo { asset->{ _ref, url }, alt }
    }
  `)
}

export async function getMagicOrganizationBySlug(slug: string): Promise<MagicOrganization | null> {
  return sanityClient.fetch(`
    *[_type == "magicOrganization" && slug.current == $slug && isVisible != false][0] {
      _id, name, "slug": slug.current,
      abbreviation, country, foundedYear, dissolutionYear,
      website, ingress,
      logoHistory[] {
        year, note,
        logo { asset->{ _ref, url }, alt }
      },
      body[]{
        ...,
        markDefs[]{
          ...,
          "reference": reference->{ "slug": slug.current }
        }
      },
      keyPeople[] {
        person->{ name, "slug": slug.current },
        role, years
      },
      articles[] {
        title,
        "articleSlug": slug.current,
        ingress,
        body[]{
          ...,
          markDefs[]{
            ...,
            "reference": reference->{ "slug": slug.current }
          }
        }
      },
      gallery[] { asset->{ _ref, url }, alt, caption, year },
      sources[] { label, url }
    }
  `, { slug })
}

export async function getMagicOrganizationPaths() {
  const orgs = await sanityClient.fetch(`
    *[_type == "magicOrganization" && isVisible != false] { "slug": slug.current }
  `)
  return orgs
    .filter((o: { slug?: string }) => o.slug)
    .map((o: { slug: string }) => ({ params: { slug: o.slug } }))
}

// ── Typer: Tryllequiz ────────────────────────────────────────────

export interface QuizAnswer {
  text:       string
  isCorrect?: boolean
}

export interface QuizQuestion {
  _id:             string
  question:        string
  image?:          { asset: { _ref: string; url: string }; alt?: string }
  answers:         QuizAnswer[]
  explanation?:    string
  learnMoreUrl?:   string
  learnMoreLabel?: string
  difficulty:      'lett' | 'middels' | 'vanskelig'
  themeSlugs?:     string[]
}

export interface QuizTheme {
  _id:          string
  title:        string
  slug:         string
  icon?:        string
  description?: string
  order?:       number
}

export interface QuizResultLevel {
  minPercent: number
  title:      string
  message?:   string
}

export interface QuizConfig {
  isActive?:          boolean
  title?:             string
  intro?:             string
  comingSoonTitle?:   string
  comingSoonText?:    string
  questionsPerRound?: number
  resultLevels?:      QuizResultLevel[]
}

// ── Spørringer: Tryllequiz ───────────────────────────────────────

export async function getQuizConfig(): Promise<QuizConfig | null> {
  return sanityClient.fetch(`
    *[_type == "quizConfig"][0] {
      isActive, title, intro,
      comingSoonTitle, comingSoonText,
      questionsPerRound,
      resultLevels[] { minPercent, title, message }
    }
  `)
}

export async function getAllQuizThemes(): Promise<QuizTheme[]> {
  return sanityClient.fetch(`
    *[_type == "quizTheme" && isVisible != false] | order(order asc, title asc) {
      _id, title, "slug": slug.current, icon, description, order
    }
  `)
}

export async function getAllQuizQuestions(): Promise<QuizQuestion[]> {
  return sanityClient.fetch(`
    *[_type == "quizQuestion" && isVisible != false && defined(difficulty) && count(answers) >= 2] {
      _id, question,
      image { asset->{ _ref, url }, alt },
      answers[] { text, isCorrect },
      explanation, learnMoreUrl, learnMoreLabel,
      difficulty,
      "themeSlugs": themes[]->slug.current
    }
  `)
}

// ── Typer: Det trettende kabinett ────────────────────────────────

export interface GameImage {
  asset:  { _ref: string; url: string }
  alt?:   string
  altEn?: string
}

export interface GameFact {
  text:         string
  textEn?:      string
  linkUrl?:     string
  linkLabel?:   string
  linkLabelEn?: string
  image?:       GameImage
}

export interface GameChapter {
  key:          string
  title?:       string
  titleEn?:     string
  intro?:       string
  introEn?:     string
  introRich?:   PortableTextBlock[]
  introRichEn?: PortableTextBlock[]
  image?:       GameImage
  facts?:       GameFact[]
}

export interface GameConfig {
  isActive?:        boolean
  englishEnabled?:  boolean
  title?:           string
  titleEn?:         string
  intro?:           string
  introEn?:         string
  comingSoonTitle?: string
  comingSoonText?:  string
}

// ── Spørringer: Det trettende kabinett ───────────────────────────

export async function getGameConfig(): Promise<GameConfig | null> {
  return sanityClient.fetch(`
    *[_type == "gameConfig"][0] {
      isActive, englishEnabled,
      title, titleEn, intro, introEn,
      comingSoonTitle, comingSoonText
    }
  `)
}

export async function getAllGameChapters(): Promise<GameChapter[]> {
  return sanityClient.fetch(`
    *[_type == "gameChapter" && isVisible != false && defined(key)] {
      key, title, titleEn, intro, introEn,
      introRich[] {
        ...,
        _type == "image" => { ..., asset->{ _ref, url } }
      },
      introRichEn[] {
        ...,
        _type == "image" => { ..., asset->{ _ref, url } }
      },
      image { asset->{ _ref, url }, alt, altEn },
      facts[] {
        text, textEn, linkUrl, linkLabel, linkLabelEn,
        image { asset->{ _ref, url }, alt, altEn }
      }
    }
  `)
}
