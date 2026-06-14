/**
 * createPersonvernContent.mjs
 *
 * Oppretter eller erstatter personvernPage-dokumentet i Sanity med
 * norsk personvernerklæring for tryllemuseet.no.
 *
 * Usage:
 *   SANITY_TOKEN=<token> node scripts/createPersonvernContent.mjs
 *   SANITY_TOKEN=<token> SANITY_DATASET=production node scripts/createPersonvernContent.mjs
 *
 * Hent token fra sanity.io/manage → prosjekt → API → Tokens (editor-tilgang).
 */

import { createClient } from '@sanity/client'

const dataset = process.env.SANITY_DATASET ?? 'production'

if (!process.env.SANITY_TOKEN) {
  console.error('❌ Mangler SANITY_TOKEN. Kjør: SANITY_TOKEN=<token> node scripts/createPersonvernContent.mjs')
  process.exit(1)
}

if (dataset === 'production') {
  console.log('⚠️  Du skriver til PRODUKSJONSDATASETTET. Venter 5 sekunder...')
  await new Promise(r => setTimeout(r, 5000))
}

const client = createClient({
  projectId: 'n2ynpgty',
  dataset,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

// ── Hjelpefunksjoner for PortableText ────────────────────────────

let keyIdx = 0
function k() { return `k${++keyIdx}` }

function p(text) {
  const ki = k()
  return {
    _type: 'block', _key: ki, style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: ki + 's', text, marks: [] }],
  }
}

function bullet(text) {
  const ki = k()
  return {
    _type: 'block', _key: ki, style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: ki + 's', text, marks: [] }],
  }
}

function section(heading, ...blocks) {
  return { _type: 'object', _key: k(), heading, body: blocks }
}

// ── Dokumentinnhold ───────────────────────────────────────────────

const doc = {
  _id: 'personvernPage',
  _type: 'personvernPage',

  lastUpdated: '2026-06-13',

  intro:
    'Tryllemuseet respekterer ditt personvern. Denne erklæringen forklarer hvilke opplysninger som behandles når du besøker tryllemuseet.no, hvem som behandler dem, og hvilke rettigheter du har.',

  sections: [

    section(
      'Behandlingsansvarlig',
      p('Behandlingsansvarlig for personopplysninger på tryllemuseet.no er:'),
      p('Tryllemuseet\nÅrvollveien 35, 0590 Oslo\nOrganisasjonsnummer: 989 347 500'),
      p('Ta kontakt med oss på e-post (se kontaktsiden) dersom du har spørsmål om vår behandling av personopplysninger.'),
    ),

    section(
      'Vi samler ikke inn brukerdata',
      p('Tryllemuseet benytter ikke egne analyseverktøy og registrerer ikke din adferd på nettsiden. Vi setter ingen egne informasjonskapsler (cookies).'),
      p('Serverlogger føres av vår hostingleverandør Vercel og kan inneholde IP-adresser. Disse slettes etter standard driftsperiode og brukes utelukkende til teknisk drift og feilsøking.'),
    ),

    section(
      'Kontaktskjema',
      p('Kontaktskjemaet på tryllemuseet.no/kontakt er levert av Microsoft (Microsoft Forms). Opplysninger du fyller inn – navn, e-postadresse og melding – overføres til og lagres hos Microsoft i henhold til Microsofts personvernpolicy.'),
      p('Behandlingsgrunnlaget er ditt samtykke ved innsending av skjemaet. Du kan be om sletting av dine opplysninger ved å kontakte oss på e-post.'),
    ),

    section(
      'Tredjepartstjenester',
      p('Nettsiden benytter følgende tredjepartstjenester som kan behandle personopplysninger:'),
      p('Google Fonter – Vi laster fonter fra Googles servere (fonts.googleapis.com). Google kan logge IP-adressen din ved lasting av fonter. Se Googles personvernpolicy for detaljer.'),
      p('Google Maps – Besøkssiden (tryllemuseet.no/besok) viser et interaktivt kart fra Google Maps. Når kartet lastes, kan Google sette informasjonskapsler og logge brukerinteraksjoner. Se Googles personvernpolicy.'),
      p('YouTube – Videoer i historiearkivet spilles av via YouTubes personvernvennlige modus (youtube-nocookie.com). Informasjonskapsler settes ikke av YouTube før du samhandler med videospilleren. Se Googles personvernpolicy.'),
      p('Magiske Cirkel Norge – Siden /aktiviteter/tryllekunstnere viser Tryllekatalogen i en innebygd ramme fra Magiske Cirkel Norges nettsted. Tryllemuseet har ikke kontroll over databehandlingen der. Se Magiske Cirkel Norges egne vilkår.'),
      p('Alle ovennevnte tredjeparter er selvstendige behandlingsansvarlige. Vi oppfordrer deg til å lese deres personvernpolicyer.'),
    ),

    section(
      'Informasjonskapsler (cookies)',
      p('Tryllemuseet setter ingen egne informasjonskapsler.'),
      p('Tredjepartstjenester som Google og YouTube kan sette informasjonskapsler i nettleseren din uavhengig av oss. Du kan se, administrere og slette informasjonskapsler i nettleserens innstillinger.'),
    ),

    section(
      'Dine rettigheter',
      p('Etter personvernforordningen (GDPR) og norsk personopplysningslov har du rett til:'),
      bullet('Innsyn i opplysninger vi eventuelt behandler om deg'),
      bullet('Retting av uriktige opplysninger'),
      bullet('Sletting («retten til å bli glemt»)'),
      bullet('Begrensning av behandling'),
      bullet('Dataportabilitet'),
      bullet('Å protestere mot behandling'),
      p('For å benytte dine rettigheter, kontakt oss på e-post. Vi besvarer henvendelser innen 30 dager.'),
    ),

    section(
      'Klage til Datatilsynet',
      p('Dersom du mener vi behandler personopplysninger i strid med regelverket, har du rett til å klage til Datatilsynet.'),
      p('Datatilsynet\nPostboks 458 Sentrum, 0105 Oslo\nwww.datatilsynet.no'),
    ),

    section(
      'Endringer i denne erklæringen',
      p('Denne personvernserklæringen kan oppdateres. Vesentlige endringer varsles på nettsiden. Gjeldende versjon er alltid tilgjengelig på tryllemuseet.no/personvern.'),
    ),

  ],
}

// ── Lagre ────────────────────────────────────────────────────────

try {
  await client.createOrReplace(doc)
  console.log(`✅ Personvernside opprettet i dataset: ${dataset}`)
  console.log('   Neste steg:')
  console.log('   1. Åpne Sanity Studio og juster teksten om nødvendig')
  console.log('   2. Publiser dokumentet i Studio')
} catch (err) {
  console.error('❌ Feil:', err.message)
  process.exit(1)
}
