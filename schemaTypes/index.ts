import { historiskeKlippNb } from './historiskeKlippNb'
import { contentSection } from './contentSection'
import { sourceItem }     from './sourceItem'
import { partialDate }    from './partialDate'
import { source }         from './source'
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
import { omOssPage }      from './omOssPage'
import { besokPage }           from './besokPage'
import { kontaktPage }        from './kontaktPage'
import { tryllehistoriePage } from './tryllehistoriePage'
import { ressurserPage }      from './ressurserPage'
import { utstillingPage }    from './utstillingPage'
import { personvernPage } from './personvernPage'
import { tryllebutikkenPage } from './tryllebutikkenPage'
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
import { story }           from './story'

export const schemaTypes = [
  // Sidetyper — rekkefølge følger hovedmenyen (se siteNavigation)
  homepage,
  besokPage,
  utstillingPage,
  tryllebutikkenPage,
  barnPage,
  tryllehistoriePage,
  ressurserPage,
  omOssPage,
  kontaktPage,
  personvernPage,

  // Dokumenttyper — Utstillingen
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
  gameChapter,
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
  book,
  source,

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
