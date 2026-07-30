# Operations Routine: deploy-debouncer

## What this solves

Sanity's GROQ-powered webhooks fire once per document affected by a mutation, not once per transaction or API call. The Sanity `production` dataset has (at least) one webhook pointed directly at Vercel deploy hook URLs, so any operation touching many documents at once — a bulk migration script, the daily YouTube sync — queues one Vercel deployment *per document changed*. A 35-document cleanup on 2026-07-30 queued 18 deployments in 27 seconds and burned through the account's free-tier daily deployment cap (`api-deployments-free-per-day`), failing both `tryllemuseet-web` and `tryllemuseet-prod` deployments (including PR #107's preview) for 24 hours.

`deploy-debouncer/` is a small standalone HTTP endpoint that sits between Sanity's webhook and the real Vercel deploy hooks. It collapses any burst of calls within a cooldown window (default 3 minutes) into a single real deploy.

## How it works

- Sanity's webhook calls this endpoint's URL instead of the Vercel deploy hooks directly.
- The endpoint reads a single Sanity document (`_id: "deployDebounceState"`) holding the timestamp of the last real deploy it fired.
- If less than `DEBOUNCE_COOLDOWN_MS` has passed since that timestamp, the call is a no-op (HTTP 202).
- Otherwise it updates the timestamp (using `ifRevisionId` so a burst of near-simultaneous calls only lets one through) and POSTs to both real Vercel deploy hook URLs.

No new database — the debounce state lives in Sanity, which this already has full read/write access to.

## One-time setup

1. **Deploy this as its own Vercel project**, with **Root Directory** set to `deploy-debouncer/` in that project's settings (Vercel supports multiple projects from one GitHub repo this way — it does not need its own repo).
2. **Set the env vars** listed in `deploy-debouncer/.env.example` on that new project:
   - `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN` — same values used elsewhere.
   - `VERCEL_DEPLOY_HOOK_WEB` / `VERCEL_DEPLOY_HOOK_PROD` — the two deploy hook URLs Sanity's webhook currently calls directly (find them in the `tryllemuseet-web` and `tryllemuseet-prod` Vercel projects' Settings → Git → Deploy Hooks, or in the existing Sanity webhook config before you change it).
3. **Update the Sanity webhook**, at `https://www.sanity.io/manage/project/n2ynpgty/api` (requires an Administrator-role account — this project's editor-scoped API token cannot read or modify webhook config): change its target URL from the Vercel deploy hooks to this new project's `/api/hook` URL (e.g. `https://tryllemuseet-deploy-debouncer.vercel.app/api/hook`). Filter and trigger settings (create/update/delete) can stay as they are — the debouncing happens on the receiving end, not by narrowing what Sanity sends.
4. **Verify**: make a multi-document change in Sanity (or re-run a migration script's `--dry-run`-free path) and confirm in each Vercel project's Deployments tab that only one deployment is queued, not one per document.

## Known limitation

This is a leading-edge throttle, not a trailing-edge debounce: the first call in a burst triggers the deploy immediately; everything else within the cooldown window is dropped, with no follow-up deploy scheduled after the window closes. In practice this is fine here — a Vercel build takes minutes, so by the time it fetches from Sanity, the rest of the burst has almost always already landed. The one edge case is a second, unrelated change arriving just inside the cooldown after the first — it will only go live once something else triggers a subsequent deploy (another content change outside the cooldown, or the nightly `daily-rebuild.yml` run at 05:30 UTC).
