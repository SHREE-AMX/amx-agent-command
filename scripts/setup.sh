#!/bin/bash
# setup.sh — One-time setup for the AMX Agent Command project
# Runs automatically in a Codespace via devcontainer.json postCreateCommand.
# Can also be run manually: bash .devcontainer/setup.sh

set -e

echo "============================================"
echo "  AMX Agent Command — Setup"
echo "============================================"
echo ""

# Detect platform
PLATFORM="linux"
if [ "$(uname)" = "Darwin" ]; then
  PLATFORM="macos"
fi
echo "Platform: $PLATFORM"

# Node version check
if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version)
  echo "Node: $NODE_VERSION"
  if [[ "$NODE_VERSION" < "v18" ]]; then
    echo "WARNING: Node $NODE_VERSION is below v18. Expo SDK 57 recommends Node 18+."
  fi
else
  echo "ERROR: Node.js is required but not found."
  echo "Install Node 18+ from https://nodejs.org/"
  exit 1
fi

# npm version check
if command -v npm &>/dev/null; then
  NPM_VERSION=$(npm --version)
  echo "npm: $NPM_VERSION"
else
  echo "ERROR: npm is required but not found."
  exit 1
fi

# Install npm dependencies
echo ""
echo "Installing npm dependencies..."
npm install

# Install Expo SDK-compatible packages
echo ""
echo "Aligning Expo SDK packages..."
npx expo install --fix

# Install web platform packages (for web mode in Codespaces)
echo ""
echo "Installing web platform packages..."
npm install react-dom react-native-web

# Clean up
echo ""
echo "Cleaning up..."
npm cache clean --force 2>/dev/null || true

echo ""
echo "============================================"
echo "  Setup complete"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Open the Ports tab in your Codespace"
echo "  2. Find port 8081 (Expo Dev Server) and click 'Open in Browser'"
echo "  3. Or run: npx expo start --web --port 8081 --tunnel"
echo ""
