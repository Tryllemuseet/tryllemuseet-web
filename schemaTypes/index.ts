import { historiskeKlippNb } from './historiskeKlippNb'
import { contentSection } from './contentSection'
import { sourceItem }     from './sourceItem'
import { partialDate }    from './partialDate'
import { source }         from './source'
import { tema }           from './tema'
import { event }          from './event'
import { siteConfig }     from './siteConfig'
import { siteNavigation } from './siteNavigation'
import { biography }      from './biography'
import { legend }         from './legend'
import { magicClubEdition } from './magicClubEdition'
import { qrCode }         from './qrCode'
import { whoKnew }        from './whoKnew'
import { book }           from './book'
import { homepage }       from './homepage'
import { barnPage }       from './barnPage'
import { aktiviteterPage } from './aktiviteterPage'
import { omOssPage }      from './omOssPage'
import { besokPage }           from './besokPage'
import { kontaktPage }        from './kontaktPage'
import { tryllehistoriePage } from './tryllehistoriePage'
import { hvemErHvemPage } from './hvemErHvemPage'
import { ressurserPage }      from './ressurserPage'
import { utstillingPage }    from './utstillingPage'
import { personvernPage } from './personvernPage'
import { tryllebutikkenPage } from './tryllebutikkenPage'
import { kursPage }           from './kursPage'
import { godeRadConfig }      from './godeRadConfig'
import { partner }        from './partner'
import artifact           from './artifact'
import { tvAppearance }    from './tvAppearance'
import { historicalClip }  from './historicalClip'
import { youtubeSource }    from './youtubeSource'
import { mediaAppearance } from './mediaAppearance'
import signageQuote        from './signageQuote'
import signageConfig       from './signageConfig'
import signageVideo        from './signageVideo'
import magicOrganization   from './magicOrganization'
import { quizConfig }      from './quizConfig'
import { quizTheme }       from './quizTheme'
import { quizQuestion }    from './quizQuestion'
import { gameConfig }      from './gameConfig'
import { gameChapter }     from './gameChapter'
import { trick }           from './trick'
import { comicStory }      from './comicStory'
import { worldRecordTrick } from './worldRecordTrick'
import { competitionResult } from './competitionResult'
import { organizationRole } from './organizationRole'
import { historicalSection } from './historicalSection'
import { story }           from './story'
import { magicEffect }     from './magicEffect'
import { kitCollection }   from './kitCollection'
import { kitTrick }        from './kitTrick'
import { kitOriginal }     from './kitOriginal'

export const schemaTypes = [
  // Sidetyper — rekkefølge følger hovedmenyen (se siteNavigation)
  homepage,
  besokPage,
  utstillingPage,
  tryllebutikkenPage,
  barnPage,
  aktiviteterPage,
  tryllehistoriePage,
  hvemErHvemPage,
  ressurserPage,
  omOssPage,
  kontaktPage,
  personvernPage,
  kursPage,

  // Dokumenttyper — Utstillingen
  tema,
  legend,
  artifact,
  magicOrganization,
  qrCode,

  // Dokumenttyper — Magic Club (Oslo, 2015–)
  magicClubEdition,

  // Dokumenttyper — Aktiviteter
  trick,
  comicStory,
  godeRadConfig,
  quizConfig,
  quizTheme,
  quizQuestion,
  gameConfig,
  event,

  // Dokumenttyper — Opptredener
  tvAppearance,
  historicalClip,
  youtubeSource,

  // Dokumenttyper — Arkivet
  biography,
  whoKnew,
  story,
  historiskeKlippNb,
  worldRecordTrick,
  competitionResult,
  organizationRole,
  historicalSection,
  book,
  source,
  magicEffect,

  // Dokumenttyper — Om oss
  mediaAppearance,
  partner,

  // Infoskjerm og globale innstillinger
  signageQuote,
  signageConfig,
  signageVideo,
  siteConfig,
  siteNavigation,

  // Objekttyper
  contentSection,
  sourceItem,
  partialDate,
]

// Private types: Bak teppet (closed area for kit buyers) and the rooms of
// "Det trettende kabinett" (answers, hints, explanations). These types live
// only in the private "lukket" dataset, in their own Studio workspace
// (sanity.config.ts), so the documents and their image/file assets can't be
// listed without a token. They must not reference anything in `schemaTypes`
// above: references can't cross datasets.
export const privateSchemaTypes = [
  kitCollection,
  kitTrick,
  kitOriginal,
  gameChapter,
]
