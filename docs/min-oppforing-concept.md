# Min oppføring — Concept & Technical Design

Self-service editing of "Magiens hvem er hvem" entries. A magician logs in with
Vipps (or a one-time email link), sees their own biography, and proposes
changes or a brand-new entry. **Nothing is published automatically** — every
proposal lands in an approval queue in Sanity Studio, and an editor approves or
rejects it after quality control.

Status: **concept only, nothing built.** Several decisions below need approval
before implementation (marked ⚠️).

## Background

Magiske Cirkel Norge (MCN) has offered to help bring the register up to date: everyone active on stage from 2000 to
today should be included. MCN is currently collecting data through a Google
Form and will hand over entries after its own manual quality check. This module
gives the same people a permanent way to keep their own entry current
afterwards, so the register does not go stale again.

## Goals and non-goals

**Goals**
- A magician can update *their own* entry, and only their own.
- New magicians (2000–today) can request a new entry.
- Every change is reviewed by an editor before it is visible on the site.
- Free to run, at the museum's scale.
- Security first: no passwords, no secrets in the browser, minimal personal
  data stored.

**Non-goals**
- Editing anything other than `biography`.
- Real-time publishing (the site stays statically built; approved changes go
  live with the next rebuild, like any other Sanity edit).
- Giving magicians Sanity Studio accounts.

## Login

Three free building blocks:

| Mechanism | Role | Cost |
|---|---|---|
| **Vipps Logg inn** (OpenID Connect) | Primary login. Vipps returns a *verified* phone number. | Free for businesses (⚠️ confirm in portal.vipps.no when activating) |
| **One-time email link** | Fallback for people without Vipps (foreign magicians, no Norwegian BankID). | Free tier of an email provider (e.g. Resend: 3,000/month) or the museum's own mailbox |
| **Cloudflare Turnstile** | Bot protection on the email form and the "new entry" form. Works on any host; no DNS move needed. | Free, no user limit |

### Vipps flow

1. Visitor clicks "Logg inn med Vipps" on `/min-oppforing`.
2. Server redirects to Vipps with `scope=openid phoneNumber name`, plus a
   random `state` and a `nonce` (PKCE as well), all stored in a short-lived
   signed cookie.
3. Vipps redirects back to `/api/min-oppforing/vipps/callback` with a code.
   Server verifies `state`, exchanges the code server-side (client secret never
   leaves the server), validates the ID token (signature, `iss`, `aud`, `exp`,
   `nonce`) and reads `phone_number`.
4. Server looks up the normalized phone number (E.164, `+47…`) in the private
   contact registry (see Data model). Match → session for that biography.
   No match → "Vi fant ingen oppføring knyttet til dette nummeret" + option to
   request a new entry.

### Email flow

1. Visitor enters an email address and solves Turnstile.
2. Server verifies the Turnstile token with Cloudflare's `siteverify` endpoint
   before doing anything else.
3. If the address matches a contact record, a link with a random 256-bit token
   is emailed. Only a SHA-256 hash of the token is stored, with a 15-minute
   expiry, and it is single-use.
4. The response is **identical whether or not the address exists** ("Hvis
   adressen er registrert, har vi sendt en lenke"), so the form can't be used
   to find out who is in the register.

### Session

- `HttpOnly`, `Secure`, `SameSite=Lax` cookie, HMAC-signed with
  `SESSION_SECRET`, containing only the biography `_id` and an expiry
  (30 minutes, no silent renewal).
- All state-changing requests are `POST` and check the `Origin` header
  (CSRF protection on top of `SameSite`).
- "Logg ut" clears the cookie.

## What a magician can edit

Allowlist enforced **server-side** (the form is just a convenience — the API
ignores any other field):

| Editable | Not editable (editor only) |
|---|---|
| `artistName`, `aliases` | `name`, `slug` |
| `birthPlace`, `birthDate` (year at minimum) | `deathDate` |
| `years` (active period) | `tags`, `featured` |
| `shortBio`, `fullBio` (plain text, converted to Portable Text) | `sources`, `lastVerified`, `editorNote` |
| `mainImage`, `gallery` (max 5 images) | `isVisible` |
| `links`, `videos` | |
| Free-text "Melding til redaksjonen" | |

Input limits: text length caps per field, URLs must be `https://`, images must
be JPEG/PNG/WebP under 5 MB (checked by magic bytes, not just file name).

## Data model (Sanity)

Two new document types. **Both must be unreadable to the public**, since they
hold contact details and unreviewed content.

⚠️ If the `production` dataset is public, *every* normal document in it can be
read by anyone through the API. Two options:

- **A — ID-path documents (recommended, to verify):** Sanity treats documents
  whose `_id` contains a dot (e.g. `selfservice.contact.<id>`) as private even
  in a public dataset; they can only be read with a token. Keeps everything in
  one dataset and visible in Studio for editors.
- **B — Separate private dataset** (e.g. `selvbetjening`) with its own Studio
  workspace. Stronger isolation, slightly more setup.

Must be verified against the current Sanity docs and tested before any contact
data is stored.

### `selfServiceContact` (private)

| Field | Notes |
|---|---|
| `biography` | Reference to `biography` |
| `phone` | E.164, entered by the museum (from the phone numbers you're collecting) |
| `email` | Optional, lower-cased |
| `isActive` | Allows revoking access without deleting |
| `lastLoginAt` | Audit |

One person can only ever be linked to one biography, and only the museum
creates these records — a login can never create or change one.

### `biographySubmission` (private) — "Endringsforslag"

| Field | Notes |
|---|---|
| `kind` | `update` or `new` |
| `biography` | Reference (for `update`) |
| `proposed` | Object with only the allowlisted fields |
| `message` | Note to editors |
| `status` | `pending` / `approved` / `rejected` |
| `loginMethod` | `vipps` / `email` |
| `submittedAt`, `reviewedAt`, `reviewedBy`, `rejectReason` | Audit |

### Studio

- New desk folder **"Til godkjenning"** in `structure.ts`, listing pending
  submissions newest first.
- Custom document view showing **current vs. proposed** side by side for each
  field.
- Custom document actions:
  - **Godkjenn** — copies the proposed fields into the biography *as a draft*;
    the editor reviews and publishes it as usual. Marks the submission
    `approved`.
  - **Avvis** — requires a reason, marks `rejected`.
- For `kind: new`, Godkjenn creates a new draft biography for the editor to
  complete (slug, tags, sources).

The frontend never queries either type; `getBiography*()` in `sanity.ts` is
unchanged.

## Technical architecture

The site is fully static today (no adapter, no API routes). This module needs
a small server side:

- ⚠️ Add `@astrojs/vercel`. All existing pages stay prerendered; only
  `/min-oppforing` and `/api/min-oppforing/*` opt out with
  `export const prerender = false`.
- ⚠️ New Vercel environment variables (server-only, never `PUBLIC_` except the
  Turnstile site key):

  | Variable | Purpose |
  |---|---|
  | `SANITY_SELFSERVICE_TOKEN` | Write token, used only by the API routes |
  | `SESSION_SECRET` | Cookie signing |
  | `VIPPS_CLIENT_ID`, `VIPPS_CLIENT_SECRET` | Vipps Logg inn |
  | `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Turnstile |
  | `EMAIL_API_KEY` (or SMTP credentials) | Sending login links |

- Sanity tokens on the museum's plan can't be scoped to specific document
  types, so the API code itself is the boundary: the only mutations it can
  perform are *create `biographySubmission`*, *upload image asset* and *update
  `selfServiceContact.lastLoginAt`*. These are implemented as a few fixed
  functions, never a generic "patch" endpoint.
- Rate limits: per IP and per phone number/email (e.g. 5 login attempts per
  15 min, 10 submissions per day per biography).
- Logging: login success/failure and submissions, without logging tokens or
  full phone numbers.
- Turnstile can also be added in front of the new-entry form for anonymous
  "Foreslå en ny oppføring" without login.

### Email delivery

⚠️ Sending from `@tryllemuseet.no` via an email provider requires SPF/DKIM DNS
records at the registrar (hyp.net). Alternative: send through the museum's
existing mailbox. Decide before phase 2.

## Feature flag

Follows the repo's pattern (`docs/architecture.md` § Feature Flags):
`siteConfig.selfServiceActive` (default `false`). While off, `/min-oppforing`
shows a "kommer snart" page with `noindex`, the API routes return 404, and no
links point to it. Turning it on needs only a rebuild.

## Privacy (GDPR)

- Store only what's needed: phone and/or email per contact, nothing from Vipps
  beyond the phone number used for matching (name is used only to greet).
- Update `personvernPage` with what is stored, why, and for how long.
- Submissions are deleted 12 months after review; contact records on request
  or when a biography is removed.
- Rejected image uploads are removed by a cleanup step.

## Rollout

1. **Approval queue + import.** `biographySubmission` type, Studio folder and
   actions, plus a script that imports MCN's Google Form responses as
   submissions. Useful on its own, no login yet.
2. **Email login + Turnstile.** Server side, contact registry, `/min-oppforing`
   behind the feature flag. Test on `test.tryllemuseet.no`.
3. **Vipps Logg inn.** Added once the museum has activated the product in the
   Vipps portal.
4. Turn on the flag, inform MCN.

## Open items / prerequisites

- ⚠️ Approval to add `@astrojs/vercel` and the new Vercel environment variables.
- ⚠️ A `development` dataset in Sanity (still missing) to test the new types
  outside production.
- ⚠️ Verify how private documents work in a public dataset (option A vs. B).
- Activate Vipps Logg inn in portal.vipps.no and confirm it's free.
- Create a Turnstile widget in a (free) Cloudflare account — no DNS move needed.
- Decide on email sending (provider + DNS records, or museum mailbox).
- Phone numbers: collected by the museum and entered into the contact registry
  — never into `biography`.
