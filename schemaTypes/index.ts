import { magician }       from './magician'
import { historiskeKlippNb } from './historiskeKlippNb'
import { contentSection } from './contentSection'
import { sourceItem }     from './sourceItem'
import { event }          from './event'
import { siteConfig }     from './siteConfig'
import { biography }      from './biography'
import { legend }         from './legend'
import { book }           from './book'
import { homepage }       from './homepage'
import { barnPage }       from './barnPage'
import { omOssPage }      from './omOssPage'
import { besokPage }           from './besokPage'
import { kontaktPage }        from './kontaktPage'
import { tryllehistoriePage } from './tryllehistoriePage'
import { ressurserPage }      from './ressurserPage'
import { arrangementPage }   from './arrangementPage'
import { utstillingPage }    from './utstillingPage'
import { personvernPage } from './personvernPage'
import { partner }        from './partner'
import artifact           from './artifact'
import { tvAppearance }    from './tvAppearance'
import { historicalClip }  from './historicalClip'
import { mediaAppearance } from './mediaAppearance'
import signageQuote        from './signageQuote'
import signageConfig       from './signageConfig'
import signageVideo        from './signageVideo'
import magicOrganization   from './magicOrganization'
import { exhibitionShow }    from './exhibitionShow'
import { exhibitionStation } from './exhibitionStation'
import { quizConfig }      from './quizConfig'
import { quizTheme }       from './quizTheme'
import { quizQuestion }    from './quizQuestion'

export const schemaTypes = [
  // Sidetyper
  homepage,
  barnPage,
  omOssPage,
  besokPage,
  kontaktPage,
  tryllehistoriePage,
  ressurserPage,
  arrangementPage,
  utstillingPage,
  personvernPage,
  // Dokumenttyper
  signageQuote,
  signageConfig,
  signageVideo,
  magician,
  historiskeKlippNb,
  biography,
  legend,
  tvAppearance,
  historicalClip,
  mediaAppearance,
  book,
  event,
  artifact,
  partner,
  magicOrganization,
  exhibitionShow,
  exhibitionStation,
  quizConfig,
  quizTheme,
  quizQuestion,
  siteConfig,
  // Objekttyper
  contentSection,
  sourceItem,
]
