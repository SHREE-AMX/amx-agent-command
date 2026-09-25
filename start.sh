#!/bin/bash
# Start the Expo dev server for the AMX Agent Command app
# Usage: bash start.sh [--web] [--tunnel] [--port PORT]
#
# In a GitHub Codespace, just run: bash start.sh
# Expo will auto-forward port 8081 and give you a public URL.

set -e

PORT=8081
MODE="mobile"
TUNNEL=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --web) MODE="web"; shift ;;
    --tunnel) TUNNEL="--tunnel"; shift ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    *) shift ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo " AMX Agent Command — Dev Server"
echo "============================================"
echo "Mode:      $MODE"
echo "Port:      $PORT"
echo "Tunnel:    ${TUNNEL:-no}"
echo ""

# Kill any existing Expo/Metro on the target port
if command -v lsof &>/dev/null; then
  EXISTING=$(lsof -ti :$PORT 2>/dev/null || true)
  if [ -n "$EXISTING" ]; then
    echo "Killing existing process on port $PORT (PID $EXISTING)..."
    kill $EXISTING 2>/dev/null || true
    sleep 2
  fi
elif command -v fuser &>/dev/null; then
  fuser -k $PORT/tcp 2>/dev/null || true
  sleep 2
fi

echo ""
echo "Starting Metro bundler..."
echo ""

if [ "$MODE" = "web" ]; then
  exec npx expo start --web --port $PORT $TUNNEL
else
  exec npx expo start --port $PORT $TUNNEL
fi
