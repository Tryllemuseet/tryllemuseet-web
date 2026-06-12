import { magician }       from './magician'
import { pressClipping }  from './pressClipping'
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
import { partner }        from './partner'
import artifact           from './artifact'
import { tvAppearance }   from './tvAppearance'
import { historicalClip } from './historicalClip'

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
  // Dokumenttyper
  magician,
  pressClipping,
  biography,
  legend,
  tvAppearance,
  historicalClip,
  book,
  event,
  artifact,
  partner,
  siteConfig,
  // Objekttyper
  contentSection,
  sourceItem,
]
