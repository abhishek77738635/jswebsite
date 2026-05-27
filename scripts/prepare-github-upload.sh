#!/usr/bin/env bash
# Zip source only (no node_modules, secrets, or build output) for GitHub drag-and-drop upload.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/../js-website-upload.zip"
cd "$ROOT"
zip -r "$OUT" . \
  -x "node_modules/*" \
  -x "client/build/*" \
  -x ".env" \
  -x "**/serviceAccountKey.json" \
  -x ".DS_Store" \
  -x "js-website-upload.zip"
echo "Created: $OUT"
echo "Upload this zip on GitHub (Add file → Upload files), then connect the repo to Vercel."
