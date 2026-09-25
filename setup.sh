#!/bin/bash
set -e

echo "============================================"
echo " AMX Agent Command — Codespace Setup"
echo "============================================"
echo ""

# Detect platform
if [ -f "/proc/version" ] && grep -qi microsoft /proc/version; then
  PLATFORM="linux"
elif [ "$(uname)" = "Darwin" ]; then
  PLATFORM="macos"
else
  PLATFORM="linux"
fi

echo "Platform: $PLATFORM"

# Install Node if not present (devcontainer image has it, but just in case)
if command -v node &>/dev/null; then
  echo "Node: $(node --version)"
else
  echo "Node not found — installing..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Install npm dependencies
echo ""
echo "Installing npm dependencies..."
npm install

# Install Expo SDK compatible packages
echo ""
echo "Installing Expo SDK packages..."
npx expo install --fix

# Install web platform packages
echo ""
echo "Installing web platform packages..."
npm install react-dom react-native-web

# Clean up
echo ""
echo "Cleaning up..."
npm cache clean --force 2>/dev/null || true

echo ""
echo "============================================"
echo " Setup complete"
echo "============================================"
echo ""
echo "Next: Open the Ports tab (port 8081) and click 'Open in Browser'"
echo "Or run: npx expo start --web --port 8081 --tunnel"
echo ""
