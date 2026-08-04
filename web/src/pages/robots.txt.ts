// src/pages/robots.txt.ts
// "production" i Vercel prod-miljø; alt annet (test, preview, lokalt) skal ikke crawles
const isProdEnv = import.meta.env.PUBLIC_VERCEL_ENV === 'production'

const body = isProdEnv
  ? `User-agent: *\nAllow: /\n`
  : `User-agent: *\nDisallow: /\n`

export async function GET() {
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
