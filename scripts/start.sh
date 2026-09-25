#!/bin/bash
# start.sh — Start the AMX Agent Command Expo dev server
# Works in GitHub Codespaces, local dev, or any Unix-like environment.
#
# Usage:
#   bash start.sh             # mobile mode, port 8081
#   bash start.sh --web       # web mode, port 8081
#   bash start.sh --web --tunnel   # web mode with expo tunnel (public URL)
#   bash start.sh --port 8082      # custom port
#
# In a Codespace, the port is auto-forwarded. Open the "Ports" tab,
# find port 8081, and click "Open in Browser" (or "Open Preview").

set -e

PORT=8081
MODE="mobile"
TUNNEL=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --web)     MODE="web"; shift ;;
    --tunnel)  TUNNEL="--tunnel"; shift ;;
    --port)
      PORT="$2"
      shift 2 ;;
    -h|--help)
      echo "Usage: bash start.sh [--web] [--tunnel] [--port PORT]"
      exit 0
      ;;
    *) shift ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  AMX Agent Command — Dev Server"
echo "============================================"
echo "  Mode:      $MODE"
echo "  Port:      $PORT"
echo "  Tunnel:    ${TUNNEL:-no (Codespace forwards ports automatically)}"
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

# Ensure node_modules exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies (first run)..."
  npm install
fi

echo ""
echo "Starting Metro bundler on port $PORT..."
echo ""

if [ "$MODE" = "web" ]; then
  exec npx expo start --web --port $PORT $TUNNEL
else
  exec npx expo start --port $PORT $TUNNEL
fi
