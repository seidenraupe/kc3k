#!/usr/bin/env bash
# Prüft Cloud-Agent-Secret GITHUB_PAT (ohne Push).
set -euo pipefail
if [ -z "${GITHUB_PAT:-}" ]; then
  echo "FAIL: GITHUB_PAT ist in dieser Shell nicht gesetzt."
  echo "Hinweis: Secret im Cloud-Agent-Environment speichern und Agent neu starten (neue Nachricht)."
  exit 1
fi
code=$(curl -sS -o /tmp/gh-user.json -w "%{http_code}" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  "https://api.github.com/user")
if [ "$code" != "200" ]; then
  echo "FAIL: GitHub API /user → HTTP $code"
  exit 1
fi
login=$(python3 -c "import json; print(json.load(open('/tmp/gh-user.json')).get('login','?'))")
echo "OK: Token gültig (User: ${login})"
scopes=$(curl -sSI -H "Authorization: Bearer ${GITHUB_PAT}" "https://api.github.com/user" | tr -d '\r' | grep -i '^x-oauth-scopes:' | cut -d: -f2- | xargs)
echo "Scopes: ${scopes:-<none>}"
repo_code=$(curl -sS -o /tmp/gh-repo.json -w "%{http_code}" \
  -H "Authorization: Bearer ${GITHUB_PAT}" \
  "https://api.github.com/repos/seidenraupe/kc3k")
if [ "$repo_code" != "200" ]; then
  echo "FAIL: Kein Zugriff auf seidenraupe/kc3k (HTTP $repo_code)"
  exit 1
fi
echo "OK: Repo seidenraupe/kc3k lesbar"
if ! curl -sSI -H "Authorization: Bearer ${GITHUB_PAT}" "https://api.github.com/user" | tr -d '\r' | grep -i '^x-oauth-scopes:' | grep -q workflow; then
  echo "WARN: Scope 'workflow' fehlt — Workflow-Dateien können nicht gepusht werden."
fi
cd "$(dirname "$0")/.."
git fetch "https://oauth2:${GITHUB_PAT}@github.com/seidenraupe/kc3k.git" main 2>/dev/null
local=$(git rev-parse --short HEAD)
remote=$(git rev-parse --short FETCH_HEAD 2>/dev/null || echo "?")
echo "Stand Agent HEAD: ${local}, GitHub main: ${remote}"
if [ "$local" = "$remote" ]; then
  echo "OK: Kein Push nötig (bereits gleich)."
else
  echo "INFO: Push würde Agent → GitHub aktualisieren (scripts/push-github-main.sh)."
fi
echo "PASS: GITHUB_PAT funktioniert."
