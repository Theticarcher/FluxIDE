# Integrated Terminal

FluxIDE includes a fully-featured integrated terminal powered by xterm.js.

## Opening the Terminal

### Keyboard Shortcut
Press `Ctrl+\`` (backtick) to toggle the terminal panel.

### Panel Tabs
Click the "Terminal" tab in the bottom panel.

## Terminal Features

### Multiple Sessions
- Click the `+` button to create a new terminal
- Each terminal runs in its own shell session
- Click terminal tabs to switch between sessions
- Click the `×` on a tab to close that terminal

### Shell Detection
The terminal automatically uses your system's default shell:
- Linux: `$SHELL` (typically bash or zsh)
- macOS: `$SHELL` (typically zsh)
- Windows: PowerShell or cmd.exe

### Working Directory
New terminals open in the currently opened folder's directory.

## Terminal Appearance

The terminal uses a dark theme matching the IDE:

| Element | Color |
|---------|-------|
| Background | #1e1e1e |
| Text | #cccccc |
| Cursor | Block, blinking |
| Selection | #264f78 |

### ANSI Colors
Full 16-color ANSI support:
- Standard colors (black, red, green, yellow, blue, magenta, cyan, white)
- Bright variants of each color

## Terminal Capabilities

### Features
- Full PTY (pseudo-terminal) support
- Auto-resize when panel is resized
- Scrollback buffer (10,000 lines)
- Copy/paste support
- Clickable URLs

### Keyboard Shortcuts
Standard terminal shortcuts work:
- `Ctrl+C` - Send interrupt signal
- `Ctrl+D` - Send EOF
- `Ctrl+L` - Clear screen
- `Ctrl+Shift+C` - Copy selection
- `Ctrl+Shift+V` - Paste

## Common Tasks

### Running Flux Commands

```bash
# Compile a Flux file
flux build app.flux

# Run the development server
flux dev

# Check for errors
flux check app.flux
```

### Git Operations

```bash
# Check status
git status

# Stage and commit
git add .
git commit -m "Add new feature"

# Push changes
git push
```

### Package Management

```bash
# Install dependencies (if using npm in your Flux project)
npm install

# Run scripts
npm run build
```

## Resizing the Terminal

### Drag to Resize
Drag the resize handle between the editor and terminal to adjust the terminal height.

### Collapse/Expand
Click the collapse button in the panel header to minimize the terminal.

## Tips

1. **Quick Toggle**: Use `Ctrl+\`` to quickly show/hide the terminal while coding
2. **Multiple Terminals**: Open separate terminals for different tasks (server, git, tests)
3. **Full Screen**: Drag the resize handle to make the terminal larger for complex tasks
4. **Copy Output**: Select text and use `Ctrl+Shift+C` to copy terminal output
