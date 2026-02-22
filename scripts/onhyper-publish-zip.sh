#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

if [[ -f .env.local ]]; then
  set -a
  source .env.local
  set +a
fi

ONHYPER_API_BASE="${ONHYPER_API_BASE:-https://onhyper.io}"
ONHYPER_TOKEN="${ONHYPER_TOKEN:-}"
APP_SLUG="${ONHYPER_APP_SLUG:-course-creator-4473b404}"
APP_NAME="${ONHYPER_APP_NAME:-Course Creator}"
ONHYPER_SUBDOMAIN="${ONHYPER_SUBDOMAIN:-$APP_SLUG}"

export NEXT_PUBLIC_ONHYPER_APP_SLUG="$APP_SLUG"
export NEXT_PUBLIC_LLM_API_URL="${NEXT_PUBLIC_LLM_API_URL:-/proxy/openrouter/v1}"
export NEXT_PUBLIC_HYPER_MICRO_URL="${NEXT_PUBLIC_HYPER_MICRO_URL:-/proxy/hypermicro}"
if [[ "$NEXT_PUBLIC_HYPER_MICRO_URL" == "/proxy/hyper-micro" ]]; then
  export NEXT_PUBLIC_HYPER_MICRO_URL="/proxy/hypermicro"
fi
export ONHYPER_USE_SUBDOMAIN="true"
export NEXT_PUBLIC_ONHYPER_USE_SUBDOMAIN="true"

if [[ -z "$ONHYPER_TOKEN" ]]; then
  echo "Missing ONHYPER_TOKEN. Set it in .env, .env.local, or shell env."
  exit 1
fi

echo "Building static app..."
npm run build:static

if [[ ! -d out ]]; then
  echo "Missing out/ directory after build."
  exit 1
fi

ZIP_PATH="/tmp/onhyper-course-creator-$(date +%s).zip"
rm -f "$ZIP_PATH"
echo "Creating deployment zip: $ZIP_PATH"
(
  cd out
  # OnHyper ZIP processing can flatten nested route files (e.g. edit/index.html)
  # into root files. Package root app shell + _next assets only.
  for entry in *; do
    if [[ "$entry" == "_next" || -f "$entry" ]]; then
      zip -rq "$ZIP_PATH" "$entry"
    fi
  done
)

echo "Fetching app list..."
apps_json="$(curl -sS "$ONHYPER_API_BASE/api/apps" -H "X-API-Key: $ONHYPER_TOKEN")"

app_lookup="$(printf '%s' "$apps_json" | APP_SLUG="$APP_SLUG" node -e "
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync(0, 'utf8'));
const list = Array.isArray(raw) ? raw : Array.isArray(raw.apps) ? raw.apps : Array.isArray(raw.data) ? raw.data : [];
const slug = process.env.APP_SLUG;
const app = list.find((item) => item.slug === slug);
if (app) {
  process.stdout.write(JSON.stringify({ id: app.id || app.app_id || '', slug: app.slug || slug }));
}
")"

APP_ID=""
ACTUAL_SLUG="$APP_SLUG"

if [[ -n "$app_lookup" ]]; then
  APP_ID="$(printf '%s' "$app_lookup" | node -e "const fs=require('fs'); const obj=JSON.parse(fs.readFileSync(0,'utf8')); process.stdout.write(obj.id || '')")"
  ACTUAL_SLUG="$(printf '%s' "$app_lookup" | node -e "const fs=require('fs'); const obj=JSON.parse(fs.readFileSync(0,'utf8')); process.stdout.write(obj.slug || '')")"
  echo "Using existing app: $APP_ID ($ACTUAL_SLUG)"
else
  echo "App not found for slug '$APP_SLUG'. Creating app..."
  create_payload="$(APP_NAME="$APP_NAME" APP_SLUG="$APP_SLUG" node -e "
const payload = {
  name: process.env.APP_NAME,
  slug: process.env.APP_SLUG,
  html: '<div id=\"root\"></div><script>location.href=\"/a/' + process.env.APP_SLUG + '/\";</script>',
};
console.log(JSON.stringify(payload));
")"

  create_response="$(curl -sS -X POST "$ONHYPER_API_BASE/api/apps" -H "X-API-Key: $ONHYPER_TOKEN" -H "Content-Type: application/json" -d "$create_payload")"
  APP_ID="$(printf '%s' "$create_response" | node -e "
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync(0, 'utf8'));
const app = raw.app || raw.data || raw;
process.stdout.write(app.id || app.app_id || '');
")"
  ACTUAL_SLUG="$(printf '%s' "$create_response" | node -e "
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync(0, 'utf8'));
const app = raw.app || raw.data || raw;
process.stdout.write(app.slug || process.env.APP_SLUG || '');
")"

  if [[ -z "$APP_ID" ]]; then
    echo "Failed to create app. Response:"
    printf '%s\n' "$create_response"
    exit 1
  fi

  echo "Created app: $APP_ID ($ACTUAL_SLUG)"
fi

echo "Uploading zip..."
upload_status="$(curl -sS -o /tmp/onhyper-upload-response.json -w "%{http_code}" -X POST "$ONHYPER_API_BASE/api/apps/$APP_ID/zip" -H "X-API-Key: $ONHYPER_TOKEN" -F "file=@$ZIP_PATH")"

if [[ ! "$upload_status" =~ ^2 ]]; then
  echo "ZIP upload failed (HTTP $upload_status)."
  cat /tmp/onhyper-upload-response.json
  rm -f "$ZIP_PATH"
  exit 1
fi

echo "ZIP uploaded successfully."

echo "Publishing app..."
publish_payload="$(ONHYPER_SUBDOMAIN="$ONHYPER_SUBDOMAIN" node -e "console.log(JSON.stringify({ subdomain: process.env.ONHYPER_SUBDOMAIN }))")"
publish_status="$(curl -sS -o /tmp/onhyper-publish-response.json -w "%{http_code}" -X POST "$ONHYPER_API_BASE/api/apps/$APP_ID/publish" -H "X-API-Key: $ONHYPER_TOKEN" -H "Content-Type: application/json" -d "$publish_payload")"

if [[ ! "$publish_status" =~ ^2 ]]; then
  echo "Publish endpoint returned HTTP $publish_status."
  cat /tmp/onhyper-publish-response.json
  echo "Continuing with path-based URL fallback."
fi

echo "Resolving final slug..."
apps_json_after="$(curl -sS "$ONHYPER_API_BASE/api/apps" -H "X-API-Key: $ONHYPER_TOKEN")"
final_slug="$(printf '%s' "$apps_json_after" | APP_ID="$APP_ID" APP_SLUG="$APP_SLUG" node -e "
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync(0, 'utf8'));
const list = Array.isArray(raw) ? raw : Array.isArray(raw.apps) ? raw.apps : Array.isArray(raw.data) ? raw.data : [];
const byId = list.find((item) => (item.id || item.app_id) === process.env.APP_ID);
if (byId && byId.slug) {
  process.stdout.write(byId.slug);
} else {
  process.stdout.write(process.env.APP_SLUG);
}
")"

echo "Deployment complete."
echo "App ID: $APP_ID"
echo "Slug: $final_slug"
echo "Path URL: $ONHYPER_API_BASE/a/$final_slug"
echo "Subdomain URL: https://$ONHYPER_SUBDOMAIN.onhyper.io"

rm -f "$ZIP_PATH"
