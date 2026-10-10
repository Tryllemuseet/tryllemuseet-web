// schemaTypes/privateDoc.ts
//
// Shared rules for documents that must never be readable through Sanity's
// public API: tryllesett (kitCollection) and tryllebeskrivelser (kitTrick).
// Privacy relies on the document ID: Sanity never serves documents whose _id
// contains a "." to unauthenticated requests, even in the public production
// dataset. structure.ts creates these types with an ID under PRIVATE_ID_PREFIX,
// and privateIdValidation() blocks publishing one that isn't.
import type { CustomValidator } from 'sanity'

export const PRIVATE_ID_PREFIX = 'lukket.'

export const PRIVATE_DOC_TYPES = ['kitCollection', 'kitTrick'] as const

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
