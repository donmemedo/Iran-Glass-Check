#!/usr/bin/env bash
# Starts the FastAPI backend and the Next.js frontend together.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"

cleanup() { kill 0 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo "→ API   http://127.0.0.1:8000/docs"
"$ROOT/api/.venv/bin/uvicorn" app.main:app --app-dir "$ROOT/api" --host 127.0.0.1 --port 8000 &

echo "→ Web   http://localhost:3000"
(cd "$ROOT/web" && npm run dev) &

wait
