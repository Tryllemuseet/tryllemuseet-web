// structure.ts
//
// Egendefinert Studio-navigasjon. Uten dette viser structureTool() alle 30+
// dokumenttyper som én lang, flat liste (rekkefølgen i schemaTypes/index.ts)
// — det er derfor sidepanelet i Studio i dag ikke skiller mellom «dette
// hører til Utstillingen» og «dette hører til Aktiviteter». Grupperingen her
// speiler kommentarene som allerede fantes i schemaTypes/index.ts, bare løftet
// inn i selve UI-et.
//
// Bruker bevisst S.documentTypeListItem() overalt (også for «singleton»-
// sidene) i stedet for å tvinge et fast dokument-ID — de finnes i dag som
// vanlige dokumenter med auto-generert _id, og å anta et fast ID-mønster her
// ville skjult det eksisterende dokumentet i Studio i stedet for å åpne det.
// Rene UI-/navigasjonsendringer — ingen skjema- eller innholdsendringer.
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Innhold')
    .items([

      S.listItem()
        .title('Sideinnhold')
        .child(
          S.list()
            .title('Sideinnhold')
            .items([
              S.documentTypeListItem('homepage').title('Forside'),
              S.documentTypeListItem('besokPage').title('Besøk oss'),
              S.documentTypeListItem('utstillingPage').title('Utstilling (innledning)'),
              S.documentTypeListItem('tryllebutikkenPage').title('Tryllebutikken'),
              S.documentTypeListItem('barnPage').title('Barnesiden'),
              S.documentTypeListItem('tryllehistoriePage').title('Tryllehistorie'),
              S.documentTypeListItem('ressurserPage').title('Ressurser'),
              S.documentTypeListItem('omOssPage').title('Om oss'),
              S.documentTypeListItem('kontaktPage').title('Kontakt'),
              S.documentTypeListItem('personvernPage').title('Personvern'),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title('Utstillingen')
        .child(
          S.list()
            .title('Utstillingen')
            .items([
              S.documentTypeListItem('tema').title('Tema'),
              S.documentTypeListItem('legend').title('Fordypning'),
              S.documentTypeListItem('artifact').title('Artefakt'),
              S.documentTypeListItem('magicOrganization').title('Trylleforening'),
              S.documentTypeListItem('qrCode').title('QR-kode'),
            ]),
        ),

      S.listItem()
        .title('Aktiviteter')
        .child(
          S.list()
            .title('Aktiviteter')
            .items([
              S.documentTypeListItem('trick').title('Triks (Lær et triks)'),
              S.documentTypeListItem('comicStory').title('Interaktiv historie (tegneserie)'),
              S.documentTypeListItem('event').title('Arrangement'),
              S.divider(),
              S.documentTypeListItem('quizConfig').title('Quiz: Innstillinger'),
              S.documentTypeListItem('quizTheme').title('Quiz: Tema'),
              S.documentTypeListItem('quizQuestion').title('Quiz: Spørsmål'),
              S.divider(),
              S.documentTypeListItem('gameConfig').title('Kabinettet: Innstillinger'),
              S.documentTypeListItem('gameChapter').title('Kabinettet: Rom'),
              S.divider(),
              S.documentTypeListItem('godeRadConfig').title('Gode råd'),
            ]),
        ),

      S.listItem()
        .title('Arkivet')
        .child(
          S.list()
            .title('Arkivet')
            .items([
              S.documentTypeListItem('biography').title('Magiker — Hvem er hvem'),
              S.documentTypeListItem('whoKnew').title('Visste du at'),
              S.documentTypeListItem('story').title('Historie'),
              S.documentTypeListItem('tvAppearance').title('TV-opptreden'),
              S.documentTypeListItem('historicalClip').title('Historisk TV-opptak'),
              S.documentTypeListItem('youtubeSource').title('YouTube-kilde'),
              S.documentTypeListItem('historiskeKlippNb').title('Historisk avisartikkel'),
              S.documentTypeListItem('worldRecordTrick').title('Verdensrekord-triks'),
              S.documentTypeListItem('competitionResult').title('Konkurranseresultat'),
              S.documentTypeListItem('book').title('Bok'),
              S.documentTypeListItem('source').title('Kilde'),
            ]),
        ),

      S.listItem()
        .title('Om oss')
        .child(
          S.list()
            .title('Om oss')
            .items([
              S.documentTypeListItem('mediaAppearance').title('Tryllemuseet i media'),
              S.documentTypeListItem('partner').title('Partner / Sponsor'),
            ]),
        ),

      S.listItem()
        .title('Infoskjerm')
        .child(
          S.list()
            .title('Infoskjerm')
            .items([
              S.documentTypeListItem('signageConfig').title('Infoskjerm – konfigurasjon'),
              S.documentTypeListItem('signageQuote').title('Infoskjerm – sitat'),
              S.documentTypeListItem('signageVideo').title('Infoskjerm – video'),
            ]),
        ),

      S.divider(),

      S.documentTypeListItem('siteConfig').title('Globale innstillinger'),
      S.documentTypeListItem('siteNavigation').title('Sitenavigasjon'),

    ])
