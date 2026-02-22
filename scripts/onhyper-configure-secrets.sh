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

if [[ -z "$ONHYPER_TOKEN" ]]; then
  echo "Missing ONHYPER_TOKEN. Set it in .env, .env.local, or shell env."
  exit 1
fi

upsert_secret() {
  local secret_name="$1"
  local secret_value="$2"
  local tmp_file

  if [[ -z "$secret_value" ]]; then
    echo "Skipping $secret_name secret (value not provided)."
    return 0
  fi

  tmp_file="$(mktemp)"
  local payload
  payload="$(node -e "console.log(JSON.stringify({name: process.argv[1], value: process.argv[2]}))" "$secret_name" "$secret_value")"

  local status
  status="$(curl -sS -o "$tmp_file" -w "%{http_code}" -X POST "$ONHYPER_API_BASE/api/secrets" -H "X-API-Key: $ONHYPER_TOKEN" -H "Content-Type: application/json" -d "$payload")"

  if [[ "$status" =~ ^2 ]]; then
    echo "Configured $secret_name secret."
    rm -f "$tmp_file"
    return 0
  fi

  if [[ "$status" == "409" ]]; then
    echo "$secret_name already exists; keeping existing value."
    rm -f "$tmp_file"
    return 0
  fi

  echo "Failed to configure $secret_name secret (HTTP $status)."
  echo "Response:"
  cat "$tmp_file"
  rm -f "$tmp_file"
  return 1
}

OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}"
HYPER_MICRO_API_KEY="${HYPER_MICRO_API_KEY:-}"
HYPERMICRO_API_KEY="${HYPERMICRO_API_KEY:-$HYPER_MICRO_API_KEY}"
HYPERMICRO_URL="${HYPERMICRO_URL:-${HYPER_MICRO_TARGET:-}}"

upsert_secret "OPENROUTER_API_KEY" "$OPENROUTER_API_KEY"

if [[ -n "$HYPERMICRO_API_KEY" ]]; then
  upsert_secret "HYPERMICRO_API_KEY" "$HYPERMICRO_API_KEY"
fi

if [[ -n "$HYPERMICRO_URL" ]]; then
  upsert_secret "HYPERMICRO_URL" "$HYPERMICRO_URL"
fi

echo "Secret configuration complete."
