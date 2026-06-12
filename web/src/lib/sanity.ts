// src/lib/sanity.ts
import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

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
  _id:          string
  title:        string
  slug:         string
  description?: string
  year?:        number
  yearNote?:    string
  origin?:      string
  category?:    string
  material?:    string
  dimensions?:  string
  condition?:   string
  provenance?:  string
  featured?:    boolean
  order?:       number
  mainImage?:   { asset: { _ref: string; url: string }; alt?: string }
  gallery?:     { asset: { _ref: string; url: string }; alt?: string; caption?: string }[]
  tags?:        string[]
  notes?:       any[]
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
      provenance, featured, order, tags, notes,
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

export async function getHomepage(): Promise<Homepage | null> {
  return sanityClient.fetch(`
    *[_type == "homepage"][0] {
      hero {
        heading, headingEm, ingress,
        cta1Label, cta1Href, cta2Label, cta2Href,
        bgImage { asset->{ _ref, url }, hotspot }
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
    mainImage?:  { asset: { _ref: string; url: string }; alt?: string }
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
  legendRef?:  { _ref: string; slug: string }
  sources?:    { label: string; url?: string }[]
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
      sources[] { label, url }
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

// ── Spørringer: Legend ───────────────────────────────────────────

// Alle legender — til oversiktssiden
export async function getAllLegends(): Promise<Legend[]> {
  return sanityClient.fetch(`
    *[_type == "legend" && isVisible != false] | order(title asc) {
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
    *[_type == "legend" && slug.current == $slug && isVisible != false][0] {
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
    *[_type == "legend" && isVisible != false] { "slug": slug.current }
  `)
  return legends
    .filter((l: { slug?: string }) => l.slug)
    .map((l: { slug: string }) => ({ params: { slug: l.slug } }))
}

// ── Typer: PressClipping ─────────────────────────────────────────

export interface PressClipping {
  _id:          string
  title:        string
  slug:         string
  publishedAt:  string
  originalDate?: string
  sourceName?:  string
  sourceUrl:    string
  image?:       { asset: { _ref: string; url: string }; alt?: string }
  teaser:       string
  commentary?:  string
  someText?:    string
  category?:    string
}

// ── Spørringer: PressClipping ────────────────────────────────────

// Newest article with publishedAt <= now() — for homepage widget
export async function getLatestPressClipping(): Promise<PressClipping | null> {
  return sanityClient.fetch(`
    *[_type == "pressClipping" && isVisible != false && publishedAt <= now()] | order(publishedAt desc) [0] {
      _id, title, "slug": slug.current,
      publishedAt, originalDate, sourceName, sourceUrl,
      image { asset->{ _ref, url }, alt },
      teaser, commentary, someText, category
    }
  `)
}

// All published articles — for archive page
export async function getPressClippingArchive(): Promise<PressClipping[]> {
  return sanityClient.fetch(`
    *[_type == "pressClipping" && isVisible != false && publishedAt <= now()] | order(publishedAt desc) {
      _id, title, "slug": slug.current,
      publishedAt, originalDate, sourceName, sourceUrl,
      image { asset->{ _ref, url }, alt },
      teaser, commentary, category
    }
  `)
}

// ── Typer: Partner ───────────────────────────────────────────────

export interface Partner {
  _id:          string
  name:         string
  category:     'public' | 'private' | 'org'
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
