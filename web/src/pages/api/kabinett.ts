// src/pages/api/kabinett.ts
//
// The game's answer desk: checks answers, hands out hints and, after a
// correct answer, the explanation and facts. See src/lib/kabinett.ts.
// Runs on demand; responses are never cached.
import type { APIRoute } from 'astro'
import { answer, type KabinettRequest } from '../../lib/kabinett'

export const prerender = false

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex',
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: KabinettRequest
  try {
    const text = await request.text()
    if (text.length > 4000) throw new Error('too large')
    body = JSON.parse(text)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object')
  } catch {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers })
  }
  const result = await answer(body, cookies)
  return new Response(JSON.stringify(result.body), { status: result.status, headers })
}
