#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
STORYBOOK_PORT=6006
FLUTTER_PORT=8080
CHROME_DIR="/tmp/ids-dev-chrome"

cleanup() {
  printf "\nStopping...\n"
  kill "$STORYBOOK_PID" "$FLUTTER_PID" 2>/dev/null
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM

echo "[storybook] starting on :$STORYBOOK_PORT..."
cd "$ROOT/packages/react"
mise exec -- node_modules/.bin/storybook dev -p "$STORYBOOK_PORT" --no-open &
STORYBOOK_PID=$!
cd "$ROOT"

echo "[flutter] starting on :$FLUTTER_PORT..."
cd "$ROOT/packages/flutter/example"
mise exec -- flutter run -d web-server --web-port "$FLUTTER_PORT" &
FLUTTER_PID=$!
cd "$ROOT"

wait_port() {
  local port=$1 name=$2
  printf "[%s] waiting for :%s..." "$name" "$port"
  until nc -z localhost "$port" 2>/dev/null; do sleep 1; printf "."; done
  printf " ready!\n"
}

wait_port "$STORYBOOK_PORT" storybook
wait_port "$FLUTTER_PORT" flutter

echo "Opening Chrome..."
open -na "Google Chrome" --args \
  --user-data-dir="$CHROME_DIR" \
  --no-first-run \
  "http://localhost:$STORYBOOK_PORT" \
  "http://localhost:$FLUTTER_PORT"

wait "$STORYBOOK_PID" "$FLUTTER_PID"
