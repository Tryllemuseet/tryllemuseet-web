/**
 * NbUrlInput.tsx
 *
 * Custom Sanity Studio input for the historiskeKlippNb.sourceUrl field.
 * When the URL matches nb.no, a "Hent metadata" button appears.
 * Clicking it fetches api.nb.no and auto-fills sourceName + originalDate.
 */

import {useState, useCallback} from 'react'
import {Stack, Button, Card, Text, Flex, Spinner, Badge} from '@sanity/ui'
import type {StringInputProps} from 'sanity'
import {useDocumentOperation, useFormValue} from 'sanity'

const NB_API_BASE  = 'https://api.nb.no/catalog/v1/items'
const IIIF_BASE    = 'https://www.nb.no/services/image/resolver'

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractUrn(url: string): string | null {
  const m = url.match(/URN:[A-Z0-9:._-]+/i)
  return m ? m[0] : null
}

function parseDigavisUrn(urn: string): {newspaper: string | null; date: string | null} {
  const m = urn.match(/digavis_([^_]+)_[^_]+_[^_]+_(\d{8})/)
  if (!m) return {newspaper: null, date: null}
  const newspaper = m[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const raw = m[2]
  return {
    newspaper,
    date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
  }
}

function first<T>(val: T | T[] | null | undefined): T | null {
  if (val == null) return null
  return Array.isArray(val) ? (val[0] ?? null) : val
}

function iiifThumbUrl(urn: string): string {
  return `${IIIF_BASE}/${encodeURIComponent(urn)}/full/600,/0/native.jpg`
}

function isNbUrl(url: string): boolean {
  return /nb\.no\/items\//i.test(url) || /nb\.no\/nbsok\//i.test(url)
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface NbResult {
  sourceName: string
  originalDate: string
  thumbUrl: string
  urn: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NbUrlInput(props: StringInputProps) {
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<NbResult | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [patched,  setPatched]  = useState(false)

  const docId   = ((useFormValue(['_id'])   as string | undefined) ?? '').replace(/^drafts\./, '')
  const docType = (useFormValue(['_type'])  as string | undefined) ?? ''
  const {patch} = useDocumentOperation(docId, docType)

  const url = props.value ?? ''

  const handleFetch = useCallback(async () => {
    if (!url) return
    const urn = extractUrn(url)
    if (!urn) {
      setError('Fant ingen URN i URL-en. Kontroller at du har limt inn en nb.no-lenke.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setPatched(false)

    try {
      const apiUrl = `${NB_API_BASE}/${encodeURIComponent(urn)}`
      const res = await fetch(apiUrl, {headers: {Accept: 'application/json'}})

      if (!res.ok) throw new Error(`NB API svarte med ${res.status}`)

      const item = await res.json()
      const meta = item?.metadata ?? {}
      const apiTitle = first(meta.title)
      const apiDate  = first(first(meta.originInfo)?.dateIssued ?? meta.dateIssued)

      const {newspaper: urnNewspaper, date: urnDate} = parseDigavisUrn(urn)

      const sourceName   = apiTitle  ?? urnNewspaper ?? ''
      const originalDate = apiDate   ? apiDate.split('T')[0] : (urnDate ?? '')
      const thumbUrl     = item?._links?.thumbnail_custom?.href ?? iiifThumbUrl(urn)

      setResult({sourceName, originalDate, thumbUrl, urn})
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // Fallback: parse from URN without API
      const urn2 = extractUrn(url)
      if (urn2) {
        const {newspaper, date} = parseDigavisUrn(urn2)
        if (newspaper || date) {
          setResult({
            sourceName:   newspaper ?? '',
            originalDate: date ?? '',
            thumbUrl:     iiifThumbUrl(urn2),
            urn:          urn2,
          })
          setError(`API utilgjengelig (${msg}) — bruker URN-parsing som fallback.`)
        } else {
          setError(`Klarte ikke hente metadata: ${msg}`)
        }
      } else {
        setError(`Klarte ikke hente metadata: ${msg}`)
      }
    } finally {
      setLoading(false)
    }
  }, [url])

  const handleApply = useCallback(() => {
    if (!result) return
    const ops: object[] = []
    if (result.sourceName)   ops.push({set: {sourceName: result.sourceName}})
    if (result.originalDate) ops.push({set: {originalDate: result.originalDate}})
    if (ops.length) {
      patch.execute(ops)
      setPatched(true)
    }
  }, [result, patch])

  return (
    <Stack space={3}>
      {props.renderDefault(props)}

      {url && isNbUrl(url) && (
        <Flex gap={2} align="center">
          <Button
            text={loading ? 'Henter…' : 'Hent metadata fra nb.no'}
            tone="primary"
            mode="ghost"
            fontSize={1}
            padding={2}
            disabled={loading}
            onClick={handleFetch}
            icon={loading ? Spinner : undefined}
          />
          {patched && (
            <Badge tone="positive" fontSize={0}>
              Feltene er oppdatert ✓
            </Badge>
          )}
        </Flex>
      )}

      {error && (
        <Card padding={3} tone="caution" border radius={2}>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {result && (
        <Card padding={3} tone="transparent" border radius={2}>
          <Stack space={3}>
            <Flex gap={3} align="flex-start">
              {result.thumbUrl && (
                <img
                  src={result.thumbUrl}
                  alt="Faksimile-forhåndsvisning"
                  style={{width: 120, height: 'auto', borderRadius: 3, flexShrink: 0, border: '1px solid var(--card-border-color)'}}
                />
              )}
              <Stack space={2}>
                <Text size={1} weight="semibold">Hentet fra Nasjonalbiblioteket</Text>
                {result.sourceName && (
                  <Text size={1}>📰 <strong>Avis:</strong> {result.sourceName}</Text>
                )}
                {result.originalDate && (
                  <Text size={1}>📅 <strong>Dato:</strong> {result.originalDate}</Text>
                )}
                <Text size={0} muted>
                  Bilde-URL: <code style={{fontSize: '0.7em', wordBreak: 'break-all'}}>{result.thumbUrl}</code>
                </Text>
              </Stack>
            </Flex>

            {!patched && (
              <Button
                text="Fyll inn avis og dato automatisk"
                tone="positive"
                mode="default"
                fontSize={1}
                padding={2}
                onClick={handleApply}
              />
            )}

            <Card padding={2} tone="caution" radius={1}>
              <Text size={0} muted>
                💡 Bildet lastes ikke opp automatisk fra Studio — bruk terminalen:
                {' '}<code>node scripts/importNbArticle.mjs &lt;url&gt;</code>
              </Text>
            </Card>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
