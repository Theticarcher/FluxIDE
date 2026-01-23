# Live Preview

FluxIDE includes a live preview panel that shows the compiled output of your Flux files in real-time.

## How It Works

1. When you open a `.flux` file, the preview panel appears on the right
2. The file is compiled using the Flux compiler
3. The compiled HTML, CSS, and JavaScript are rendered in an iframe
4. When you save, the preview automatically updates

## Preview Panel

### Location
The preview panel appears to the right of the editor when viewing Flux files.

### Controls

| Button | Action |
|--------|--------|
| Refresh | Manually refresh the preview |
| External | Open preview in system browser |

## Auto-Compilation

### On Save
When you save a Flux file (`Ctrl+S`), the IDE automatically:
1. Saves the file to disk
2. Runs the Flux compiler
3. Updates the preview with the new output

### Compilation Status
The status bar shows the current compilation state:
- **Ready** - No compilation in progress
- **Compiling** - Compilation is running

## Error Handling

### Compilation Errors
If the Flux compiler encounters errors:
- The preview shows an error message
- Error details are displayed in the preview panel
- The editor may show error markers (red squiggles)

### Example Error Display
```
Compilation Error

app.flux:15:3 - Unexpected token 'if'
  Expected expression but found keyword
```

## Preview Sandbox

The preview runs in a sandboxed iframe with:
- JavaScript execution enabled
- Same-origin access (for component interactivity)
- No access to parent window
- No access to local storage

This ensures your preview code runs safely without affecting the IDE.

## Resizing the Preview

### Drag to Resize
Drag the vertical resize handle between the editor and preview to adjust the split.

### Default Split
- Editor: 60% width
- Preview: 40% width

You can resize from 30% to 60% for the preview panel.

## When Preview Appears

The preview panel only appears when:
- A `.flux` file is open
- The file is the active tab

For non-Flux files (`.js`, `.css`, `.html`, etc.), the editor takes the full width.

## Manual Refresh

Click the refresh button in the preview toolbar to:
- Re-compile the current file
- Update the preview

This is useful if:
- The preview got out of sync
- You want to see the latest changes without saving

## Open in Browser

Click the "Open in Browser" button to:
- Open the compiled output in your system's default browser
- View the preview in a full browser window
- Test browser-specific features

## Tips

1. **Quick Preview**: Save frequently (`Ctrl+S`) to see changes
2. **Full Width Preview**: Resize the editor smaller to see more preview
3. **Debug in Browser**: Use "Open in Browser" to access browser dev tools
4. **Check Errors**: If preview looks wrong, check the status bar for compilation errors
