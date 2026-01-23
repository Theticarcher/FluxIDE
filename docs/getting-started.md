# Getting Started with FluxIDE

This guide will help you get up and running with FluxIDE for Flux development.

## Installation

### Download

Download the appropriate installer for your operating system from the [Releases](https://github.com/yourusername/fluxide/releases) page.

### Linux

**AppImage (Universal)**
```bash
chmod +x FluxIDE_x.x.x_amd64.AppImage
./FluxIDE_x.x.x_amd64.AppImage
```

**Debian/Ubuntu**
```bash
sudo dpkg -i FluxIDE_x.x.x_amd64.deb
```

**Fedora/RHEL**
```bash
sudo rpm -i FluxIDE-x.x.x-1.x86_64.rpm
```

### Windows

Run the installer (`FluxIDE_x.x.x_x64-setup.exe`) and follow the prompts.

### macOS

1. Open the DMG file
2. Drag FluxIDE to your Applications folder
3. Right-click and select "Open" the first time (to bypass Gatekeeper)

## First Launch

When you first open FluxIDE, you'll see the welcome screen with:

- The FluxIDE logo
- Common keyboard shortcuts
- An "Open Folder" button

## Opening a Project

### Method 1: Welcome Screen
Click the "Open Folder" button on the welcome screen.

### Method 2: Keyboard Shortcut
Press `Ctrl+Shift+O` (or `Cmd+Shift+O` on macOS).

### Method 3: File Explorer
If the sidebar is open, click the folder icon in the File Explorer section.

## Creating Your First Flux File

1. Open a folder for your project
2. Right-click in the File Explorer
3. Select "New File"
4. Name it with a `.flux` extension (e.g., `app.flux`)

## Writing Flux Code

FluxIDE provides full syntax highlighting for Flux files:

```flux
component App {
  state count = 0

  fn increment() {
    count = count + 1
  }

  render {
    <div class="container">
      <h1>Counter: {count}</h1>
      <button onClick={increment}>
        Increment
      </button>
    </div>
  }

  style {
    .container {
      padding: 20px;
      text-align: center;
    }
  }
}
```

## Saving Files

Press `Ctrl+S` to save the current file. The tab will show a dot indicator (●) when there are unsaved changes.

## Using the Preview

When editing a `.flux` file, a preview panel appears on the right side showing the compiled output. The preview automatically updates when you save.

## Using the Terminal

Press `Ctrl+\`` to toggle the integrated terminal. You can:

- Run Flux compiler commands
- Execute shell commands
- Open multiple terminal tabs

## Next Steps

- Learn about [Editor Features](editor.md)
- Explore [Keyboard Shortcuts](shortcuts.md)
- Set up [Building from Source](building.md)
