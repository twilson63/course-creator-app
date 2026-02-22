# OnHyper Release Plan (`course-creator-4473b404`)

## Objective

Deploy the static app ZIP to OnHyper with slug `course-creator-4473b404`, route LLM calls through OpenRouter proxy, and route data calls through hyper-micro proxy.

## Target Runtime

- App URL (path fallback): `https://onhyper.io/a/course-creator-4473b404`
- App URL (subdomain target): `https://course-creator-4473b404.onhyper.io`
- LLM proxy: `/proxy/openrouter/v1/chat/completions`
- Data proxy: `/proxy/hypermicro/*`

## Phase 1: Configuration Hardening

1. Set app slug for static build routing:
   - `NEXT_PUBLIC_ONHYPER_APP_SLUG=course-creator-4473b404`
2. Ensure client API defaults are proxy-first:
   - `NEXT_PUBLIC_LLM_API_URL=/proxy/openrouter/v1`
   - `NEXT_PUBLIC_HYPER_MICRO_URL=/proxy/hypermicro`
3. Ensure publish endpoint base is correct:
   - `NEXT_PUBLIC_ZENBIN_URL=https://zenbin.org`

## Phase 2: Secret/API Setup via `ONHYPER_TOKEN`

1. Load token in shell or `.env`:
   - `ONHYPER_TOKEN=oh_live_...`
2. Configure provider secrets:
   - `OPENROUTER_API_KEY=...`
   - `HYPER_MICRO_API_KEY=...` (attempted through secrets API; if unsupported, configure in dashboard app settings)
3. Run:
   - `npm run onhyper:configure`

## Phase 3: Build and ZIP Publish

1. Build static output:
   - `npm run build:static`
2. Publish via zip upload + publish endpoint:
   - `npm run onhyper:publish`
3. Script behavior:
   - finds app by slug (creates if missing)
   - uploads ZIP to `/api/apps/:id/zip`
   - publishes with optional subdomain
   - resolves final persisted slug from `/api/apps`

## Phase 4: Post-Deploy Verification

1. Open path URL and confirm app boot:
   - `https://onhyper.io/a/{final_slug}`
2. Validate auth and CRUD:
   - signup/login
   - create/edit/save/delete course
3. Validate AI flow:
   - transcript generation
   - refine prompt
4. Validate publish flow:
   - `Generate + Publish` creates new ZenBin URL
   - video embeds render in published output
5. Confirm proxy traffic:
   - browser network requests target `/proxy/openrouter/*` and `/proxy/hypermicro/*`

## Rollback

1. Re-run `npm run onhyper:publish` with last known-good bundle.
2. If subdomain publish fails, continue using path URL `/a/{slug}`.

## Notes

- OnHyper can auto-suffix slugs; always trust slug returned by `GET /api/apps` after publish.
- `X-App-Slug` must match the persisted slug exactly for proxy routing.
