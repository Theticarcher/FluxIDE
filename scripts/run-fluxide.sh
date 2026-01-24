#!/bin/bash
# FluxIDE launcher script with WebKitGTK workarounds for NVIDIA GPUs
# Use this script if you encounter EGL errors when running FluxIDE

export WEBKIT_DISABLE_DMABUF_RENDERER=1

# Find the FluxIDE binary or AppImage
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_ROOT/src-tauri/target/release/fluxide" ]; then
    exec "$PROJECT_ROOT/src-tauri/target/release/fluxide" "$@"
elif [ -f "/usr/bin/fluxide" ]; then
    exec /usr/bin/fluxide "$@"
else
    echo "FluxIDE not found. Please build it first with 'npm run tauri build'"
    exit 1
fi
