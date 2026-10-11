#!/usr/bin/env bash
# Manueller Deploy von dist/ nach kc3k.ch (falls GitHub Actions nicht läuft).
# Voraussetzung: npm run build, SSH-Schlüssel kc3k-deploy, Port 2121.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
KEY="${KC3K_DEPLOY_KEY:-$HOME/.ssh/kc3k-deploy}"
HOST="${KC3K_SSH_HOST:-80.74.151.81}"
USER="${KC3K_SSH_USER:-giger}"
TARGET="${KC3K_SSH_TARGET:-/kc3k.ch}"
PORT="${KC3K_SSH_PORT:-2121}"

if [[ ! -d "$DIST" ]]; then
  echo "dist/ fehlt — bitte zuerst: npm run build" >&2
  exit 1
fi

RSYNC_SSH="ssh -i $KEY -p $PORT -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

rsync -rlgoDzvc -i --delete \
  --exclude 'kc3k-kreativmedia.zip' \
  --exclude 'upload/config.php' \
  -e "$RSYNC_SSH" \
  "$DIST/" "${USER}@${HOST}:${TARGET}/"

rsync -rlgoDzvc --ignore-existing \
  -e "$RSYNC_SSH" \
  "$DIST/upload/config.php" "${USER}@${HOST}:${TARGET}/upload/config.php"

echo "Deploy abgeschlossen. Prüfen:"
echo "  https://kc3k.ch/documents/news/3k-news-nr-93-2026-09-29.pdf"
echo "  https://kc3k.ch/news.html"
