// src/pages/robots.txt.ts
import { isIndexable } from '../lib/site'

const body = isIndexable
  ? `User-agent: *\nAllow: /\n`
  : `User-agent: *\nDisallow: /\n`

export async function GET() {
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
