// deploy-debouncer/api/hook.js
//
// Sits between the Sanity "on publish" webhook and the real Vercel deploy
// hooks. Sanity fires one webhook call per document affected by a mutation
// (not one per transaction), so a bulk script touching N documents used to
// queue N separate Vercel deployments — burning through the account's daily
// deployment cap in seconds. This endpoint collapses any burst of calls
// within COOLDOWN_MS into a single deploy.
//
// State (the timestamp of the last deploy we actually fired) is kept as a
// single Sanity document rather than a separate database, since this
// project already has full read/write access to Sanity. That document's
// _type must stay out of whatever GROQ filter the Sanity webhook uses, or
// writing it becomes a mutation that calls this endpoint again (harmless —
// it lands inside the same cooldown and gets skipped — but pointless).
//
// Required env vars (set on this Vercel project, not on tryllemuseet-web):
//   SANITY_PROJECT_ID       (n2ynpgty)
//   SANITY_DATASET          (production)
//   SANITY_TOKEN            (editor/write token)
//   VERCEL_DEPLOY_HOOK_WEB  (the existing tryllemuseet-web deploy hook URL)
//   VERCEL_DEPLOY_HOOK_PROD (the existing tryllemuseet-prod deploy hook URL)
//   DEBOUNCE_COOLDOWN_MS    (optional, default 180000 = 3 minutes)

import { createClient } from '@sanity/client'

const STATE_ID = 'deployDebounceState'
const COOLDOWN_MS = Number(process.env.DEBOUNCE_COOLDOWN_MS ?? 180_000)

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

function deployHookUrls() {
  return [process.env.VERCEL_DEPLOY_HOOK_WEB, process.env.VERCEL_DEPLOY_HOOK_PROD].filter(Boolean)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const state = await client.fetch(`*[_id == $id][0]{lastDeployAt, _rev}`, { id: STATE_ID })
  const lastDeployAt = state?.lastDeployAt ? new Date(state.lastDeployAt).getTime() : 0
  const now = Date.now()

  if (now - lastDeployAt < COOLDOWN_MS) {
    res.status(202).json({ deployed: false, reason: 'cooldown', msSinceLastDeploy: now - lastDeployAt })
    return
  }

  // Optimistic concurrency: if two calls race past the cooldown check at
  // once, only the one whose expected revision still matches wins — the
  // loser's patch is rejected and it skips instead of firing a second deploy.
  try {
    await client
      .transaction()
      .createIfNotExists({ _id: STATE_ID, _type: 'deployDebounceState', lastDeployAt: new Date(0).toISOString() })
      .patch(STATE_ID, p =>
        state?._rev ? p.ifRevisionId(state._rev).set({ lastDeployAt: new Date(now).toISOString() })
                     : p.set({ lastDeployAt: new Date(now).toISOString() })
      )
      .commit()
  } catch (err) {
    res.status(202).json({ deployed: false, reason: 'lost race to another call', detail: String(err?.message ?? err) })
    return
  }

  const hooks = deployHookUrls()
  const results = await Promise.allSettled(hooks.map(url => fetch(url, { method: 'POST' })))

  res.status(200).json({
    deployed: true,
    hooksCalled: hooks.length,
    failures: results.filter(r => r.status === 'rejected').length,
  })
}
