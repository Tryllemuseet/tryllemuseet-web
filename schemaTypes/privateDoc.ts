// schemaTypes/privateDoc.ts
//
// Shared rules for documents that must never be readable through Sanity's
// public API: tryllesett (kitCollection), tryllebeskrivelser (kitTrick),
// originalbeskrivelser (kitOriginal) and the rooms of "Det trettende
// kabinett" (gameChapter, which holds the answers, and gamePreview, the code
// for its preview link). They live in the private
// "lukket" dataset; the ID prefix is a second line of defence (Sanity never serves
// documents whose _id contains a "." to unauthenticated requests, and the web
// queries only serve "lukket.**" IDs). structure.ts creates these types with an
// ID under PRIVATE_ID_PREFIX, and privateIdValidation() blocks publishing one
// that isn't.
import type { CustomValidator } from 'sanity'

export const PRIVATE_ID_PREFIX = 'lukket.'

export const PRIVATE_DOC_TYPES = ['kitCollection', 'kitTrick', 'kitOriginal', 'gameChapter', 'gamePreview'] as const

export function isPrivateId(id: string | undefined): boolean {
  return (id ?? '').replace(/^drafts\./, '').startsWith(PRIVATE_ID_PREFIX)
}

/** Document-level validator: `createHint` names the Studio list and button
 *  editors should use instead, e.g. '«Tryllesett (lukket)» → «Nytt tryllesett»'. */
export function privateIdValidation(createHint: string): CustomValidator {
  return (_, context) =>
    isPrivateId(context.document?._id)
      ? true
      : `Dette dokumentet er ikke privat og vil ikke vises på nettsiden. Opprett det på nytt via ${createHint}, og slett denne.`
}
