#!/usr/bin/env bash
# Dev-Server für Cloud Agents (Port wie in vite.config.js).
set -euo pipefail
cd "${CURSOR_WORKSPACE:-/workspace}"
SESSION="vite-kc3k-dev"
TMUX="tmux -f /exec-daemon/tmux.portal.conf"
if ! $TMUX has-session -t "=$SESSION" 2>/dev/null; then
  $TMUX new-session -d -s "$SESSION" -c "$PWD" -- "${SHELL:-bash}" -l -c "npm run dev"
fi
