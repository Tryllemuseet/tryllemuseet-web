// src/pages/api/tryllegarden.ts
//
// Hands out the nisse's trick secrets to the farm game
// (src/pages/barn/tryllegarden.astro). See src/lib/tryllegarden.ts.
// Runs on demand; responses are never cached.
import type { APIRoute } from 'astro'
import { answer, type TryllegardenRequest } from '../../lib/tryllegarden'

export const prerender = false

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex',
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: TryllegardenRequest
  try {
    const text = await request.text()
    if (text.length > 1000) throw new Error('too large')
    body = JSON.parse(text)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object')
  } catch {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers })
  }
  const result = await answer(body, cookies)
  return new Response(JSON.stringify(result.body), { status: result.status, headers })
}
