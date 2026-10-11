#!/usr/bin/env bash
# Einmalig auf einem Rechner mit Zugriff auf github.com/seidenraupe/kc3k ausführen.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
CURSOR_REMOTE="${CURSOR_REMOTE:-https://origin.cursor.com/git/thomas-giger/tmp-db38e0d395290f50.git}"
GITHUB_REMOTE="${GITHUB_REMOTE:-git@github.com:seidenraupe/kc3k.git}"
git fetch "$CURSOR_REMOTE" main
git push "$GITHUB_REMOTE" FETCH_HEAD:main
echo "GitHub main aktualisiert. In GitHub: Actions → Deployment → Run workflow."
