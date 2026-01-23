#!/bin/bash

# FluxIDE Release Script
# Usage: ./scripts/release.sh [version]
# Example: ./scripts/release.sh 0.2.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Get version from argument or prompt
if [ -n "$1" ]; then
    VERSION="$1"
else
    # Read current version from package.json
    CURRENT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
    echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"
    read -p "Enter new version (or press Enter to keep current): " VERSION
    if [ -z "$VERSION" ]; then
        VERSION="$CURRENT_VERSION"
    fi
fi

echo -e "${GREEN}Building FluxIDE v${VERSION}${NC}"
echo "=================================="

# Update version in package.json
echo -e "${YELLOW}Updating package.json...${NC}"
sed -i "s/\"version\": \".*\"/\"version\": \"${VERSION}\"/" package.json

# Update version in Cargo.toml
echo -e "${YELLOW}Updating Cargo.toml...${NC}"
sed -i "s/^version = \".*\"/version = \"${VERSION}\"/" src-tauri/Cargo.toml

# Update version in tauri.conf.json
echo -e "${YELLOW}Updating tauri.conf.json...${NC}"
sed -i "s/\"version\": \".*\"/\"version\": \"${VERSION}\"/" src-tauri/tauri.conf.json

# Create releases directory
RELEASES_DIR="$PROJECT_ROOT/releases"
mkdir -p "$RELEASES_DIR"

# Clean ALL old releases
echo -e "${YELLOW}Cleaning old releases...${NC}"
rm -f "$RELEASES_DIR"/*.deb 2>/dev/null || true
rm -f "$RELEASES_DIR"/*.rpm 2>/dev/null || true
rm -f "$RELEASES_DIR"/*.AppImage 2>/dev/null || true
rm -f "$RELEASES_DIR"/fluxide-* 2>/dev/null || true
rm -f "$RELEASES_DIR"/*.exe 2>/dev/null || true
rm -f "$RELEASES_DIR"/*.msi 2>/dev/null || true
rm -f "$RELEASES_DIR"/*.dmg 2>/dev/null || true

# Build the application
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

echo -e "${YELLOW}Building Tauri application (this may take a few minutes)...${NC}"
npm run tauri build 2>&1 | tee /tmp/tauri-build.log || true

# Copy built files to releases directory
echo -e "${YELLOW}Copying release files...${NC}"

# Raw binary
if [ -f "src-tauri/target/release/fluxide" ]; then
    cp "src-tauri/target/release/fluxide" "$RELEASES_DIR/fluxide-${VERSION}-linux-x64"
    chmod +x "$RELEASES_DIR/fluxide-${VERSION}-linux-x64"
    echo -e "${GREEN}✓ Created: fluxide-${VERSION}-linux-x64${NC}"
fi

# DEB package
DEB_FILE=$(find src-tauri/target/release/bundle/deb -name "*.deb" 2>/dev/null | head -1)
if [ -n "$DEB_FILE" ] && [ -f "$DEB_FILE" ]; then
    cp "$DEB_FILE" "$RELEASES_DIR/FluxIDE_${VERSION}_amd64.deb"
    echo -e "${GREEN}✓ Created: FluxIDE_${VERSION}_amd64.deb${NC}"
fi

# RPM package
RPM_FILE=$(find src-tauri/target/release/bundle/rpm -name "*.rpm" 2>/dev/null | head -1)
if [ -n "$RPM_FILE" ] && [ -f "$RPM_FILE" ]; then
    cp "$RPM_FILE" "$RELEASES_DIR/FluxIDE-${VERSION}-1.x86_64.rpm"
    echo -e "${GREEN}✓ Created: FluxIDE-${VERSION}-1.x86_64.rpm${NC}"
fi

# AppImage - try to build manually if Tauri's bundler failed
APPDIR="src-tauri/target/release/bundle/appimage/FluxIDE.AppDir"
if [ -d "$APPDIR" ]; then
    echo -e "${YELLOW}Building AppImage...${NC}"

    # Ensure icon exists in AppDir
    if [ ! -f "$APPDIR/fluxide.png" ]; then
        cp "src-tauri/icons/128x128@2x.png" "$APPDIR/fluxide.png" 2>/dev/null || true
    fi

    # Check if appimagetool is available
    APPIMAGETOOL="/tmp/squashfs-root/AppRun"
    if [ ! -f "$APPIMAGETOOL" ]; then
        echo -e "${YELLOW}Downloading appimagetool...${NC}"
        cd /tmp
        wget -q https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage -O appimagetool 2>/dev/null || true
        chmod +x appimagetool 2>/dev/null || true
        ./appimagetool --appimage-extract 2>/dev/null || true
        cd "$PROJECT_ROOT"
    fi

    if [ -f "$APPIMAGETOOL" ]; then
        ARCH=x86_64 "$APPIMAGETOOL" "$APPDIR" "$RELEASES_DIR/FluxIDE_${VERSION}_amd64.AppImage" 2>/dev/null && \
            echo -e "${GREEN}✓ Created: FluxIDE_${VERSION}_amd64.AppImage${NC}" || \
            echo -e "${RED}✗ Failed to create AppImage${NC}"
    else
        echo -e "${YELLOW}⚠ AppImage tools not available, skipping AppImage creation${NC}"
    fi
fi

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}Release v${VERSION} complete!${NC}"
echo "=================================="
echo ""
echo "Release files:"
ls -lh "$RELEASES_DIR" | grep -E "${VERSION}|total"
echo ""
echo -e "${YELLOW}Note: Windows (.exe, .msi) and macOS (.dmg) builds require building on those platforms.${NC}"
echo -e "${YELLOW}Use GitHub Actions or build manually on Windows/macOS machines.${NC}"
