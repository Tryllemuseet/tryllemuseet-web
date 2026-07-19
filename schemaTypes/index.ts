import { historiskeKlippNb } from './historiskeKlippNb'
import { contentSection } from './contentSection'
import { sourceItem }     from './sourceItem'
import { event }          from './event'
import { siteConfig }     from './siteConfig'
import { biography }      from './biography'
import { legend }         from './legend'
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
import { worldRecordTrick } from './worldRecordTrick'
import { competitionResult } from './competitionResult'

export const schemaTypes = [
  // Sidetyper
  homepage,
  barnPage,
  omOssPage,
  besokPage,
  kontaktPage,
  tryllehistoriePage,
  ressurserPage,
  utstillingPage,
  personvernPage,
  tryllebutikkenPage,
  // Dokumenttyper
  signageQuote,
  signageConfig,
  signageVideo,
  historiskeKlippNb,
  biography,
  legend,
  whoKnew,
  tvAppearance,
  historicalClip,
  mediaAppearance,
  book,
  event,
  artifact,
  partner,
  magicOrganization,
  quizConfig,
  quizTheme,
  quizQuestion,
  gameConfig,
  gameChapter,
  trick,
  worldRecordTrick,
  competitionResult,
  godeRadConfig,
  siteConfig,
  // Objekttyper
  contentSection,
  sourceItem,
]
