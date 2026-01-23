# Building from Source

This guide covers how to build FluxIDE from source code.

## Prerequisites

### All Platforms

- [Node.js](https://nodejs.org/) 18 or later
- [Rust](https://rustup.rs/) 1.70 or later
- [Git](https://git-scm.com/)

### Linux

Install the required system dependencies:

**Debian/Ubuntu:**
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  libgtk-3-dev
```

**Fedora:**
```bash
sudo dnf install -y \
  webkit2gtk4.1-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  gtk3-devel
```

**Arch Linux:**
```bash
sudo pacman -S \
  webkit2gtk-4.1 \
  libappindicator-gtk3 \
  librsvg \
  gtk3 \
  patchelf
```

### Windows

- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with C++ workload
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 10/11)

### macOS

```bash
xcode-select --install
```

## Clone the Repository

```bash
git clone https://github.com/yourusername/fluxide.git
cd fluxide
```

## Install Dependencies

```bash
npm install
```

## Development Mode

Run the IDE in development mode with hot-reload:

```bash
npm run tauri dev
```

This will:
1. Start the Vite dev server for the frontend
2. Compile the Rust backend
3. Open FluxIDE with dev tools enabled

## Production Build

Build optimized binaries for your platform:

```bash
npm run tauri build
```

Output locations:
- **Binary**: `src-tauri/target/release/fluxide`
- **Bundles**: `src-tauri/target/release/bundle/`

### Linux Outputs
- `.deb` - Debian package
- `.rpm` - RPM package
- `.AppImage` - Universal Linux binary

### Windows Outputs
- `.exe` - NSIS installer
- `.msi` - MSI installer

### macOS Outputs
- `.dmg` - Disk image
- `.app` - Application bundle

## Release Script

Use the release script for versioned builds:

```bash
# Build with specific version
./scripts/release.sh 1.0.0

# Interactive mode (prompts for version)
./scripts/release.sh
```

The release script:
1. Updates version in `package.json`, `Cargo.toml`, and `tauri.conf.json`
2. Builds the frontend and Tauri app
3. Copies binaries to `releases/` with versioned filenames

## Project Structure

```
fluxide/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # React hooks
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript types
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands/       # Tauri commands
│   │   ├── lib.rs          # App entry point
│   │   └── main.rs         # Binary entry
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── scripts/                # Build scripts
├── docs/                   # Documentation
└── releases/               # Built binaries (gitignored)
```

## Configuration Files

### `src-tauri/tauri.conf.json`

Main Tauri configuration:
- App metadata (name, version, identifier)
- Window settings
- Bundle settings per platform

### `src-tauri/Cargo.toml`

Rust dependencies and build settings.

### `package.json`

Node.js dependencies and scripts.

### `vite.config.ts`

Vite bundler configuration.

## Troubleshooting

### Linux: WebKitGTK not found

Make sure you have the correct version installed:
```bash
# Check installed version
pkg-config --modversion webkit2gtk-4.1
```

### Windows: Build fails with MSVC error

Ensure Visual Studio Build Tools are installed with the "Desktop development with C++" workload.

### macOS: Code signing errors

For local development, you can skip code signing:
```bash
npm run tauri build -- --no-bundle
```

### General: Cargo build fails

Update Rust and clean the build:
```bash
rustup update
cd src-tauri
cargo clean
cd ..
npm run tauri build
```

## CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/build.yml`) that automatically builds for all platforms when you push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This creates a draft release with binaries for:
- Linux x64 (deb, rpm, AppImage)
- Windows x64 (exe, msi)
- macOS x64 and ARM64 (dmg, app)
