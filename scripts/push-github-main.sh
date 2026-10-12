#!/usr/bin/env bash
# Pusht Agent-main nach github.com/seidenraupe/kc3k (Cloud Agent mit Secret GITHUB_PAT).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [ -z "${GITHUB_PAT:-}" ]; then
  echo "GITHUB_PAT ist nicht gesetzt (Cloud Agent Secret)." >&2
  exit 1
fi
git push "https://x-access-token:${GITHUB_PAT}@github.com/seidenraupe/kc3k.git" "HEAD:main"
echo "GitHub main: $(git rev-parse --short HEAD)"
