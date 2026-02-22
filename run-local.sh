#!/usr/bin/env bash
set -euo pipefail

# Usage:
# 1) Copy this file and fill values below, OR
# 2) export these vars in your shell before running.

export ONHYPER_APP_SLUG="${ONHYPER_APP_SLUG:-course-creator-30c2a685}"
export HYPER_MICRO_TARGET="${HYPER_MICRO_TARGET:-https://desirable-beauty-production-d4d8.up.railway.app}"
export HYPER_MICRO_API_KEY="${HYPER_MICRO_API_KEY:-}"

# Use 'mock' for fake LLM responses, 'passthrough' to call real OpenAI.
export OPENAI_PROXY_MODE="${OPENAI_PROXY_MODE:-passthrough}"
export OPENAI_BASE_URL="${OPENAI_BASE_URL:-https://api.openai.com/v1}"
export OPENAI_API_KEY="${OPENAI_API_KEY:-}"
export PORT="${PORT:-4173}"

if [[ "$OPENAI_PROXY_MODE" == "passthrough" && -z "$OPENAI_API_KEY" ]]; then
  echo "OPENAI_API_KEY is required when OPENAI_PROXY_MODE=passthrough"
  exit 1
fi

if [[ -z "$HYPER_MICRO_API_KEY" ]]; then
  echo "Warning: HYPER_MICRO_API_KEY is empty. Hyper-micro proxy may fail if auth is required."
fi

EXISTING_PID="$(lsof -ti tcp:"$PORT" || true)"
if [[ -n "$EXISTING_PID" ]]; then
  echo "Stopping existing process on port $PORT (PID: $EXISTING_PID)"
  kill $EXISTING_PID || true
  sleep 1
fi

npm run build:static
npm run serve:local
