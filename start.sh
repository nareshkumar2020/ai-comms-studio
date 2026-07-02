#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

(
  cd backend
  source .venv/bin/activate
  uvicorn app.main:app --reload --port 8000
) &

(
  cd frontend
  npm install
  npm run dev -- --host 0.0.0.0
)
