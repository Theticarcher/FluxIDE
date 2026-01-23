# Editor Features

FluxIDE uses Monaco Editor (the same editor that powers VS Code) with custom Flux language support.

## Syntax Highlighting

The editor provides comprehensive syntax highlighting for Flux files (`.flux`):

### Keywords
- Control flow: `if`, `else`, `for`, `while`, `return`, `break`, `continue`
- Declarations: `let`, `const`, `fn`, `component`, `state`, `prop`
- Special: `render`, `style`, `import`, `export`, `from`

### Types
- Built-in types: `string`, `number`, `boolean`, `void`, `any`, `null`
- Type annotations are highlighted differently from values

### JSX Support
- HTML tags: `<div>`, `<span>`, `<button>`, etc.
- Component tags: `<MyComponent />`
- Attributes and event handlers
- Embedded expressions: `{variable}`

### CSS Support
Inside `style` blocks:
- Selectors (class, id, element)
- Properties and values
- Units and colors

## Code Completion

FluxIDE provides intelligent code completion (IntelliSense):

### Flux Keywords
Start typing and press `Ctrl+Space` to see suggestions for:
- Language keywords
- Built-in functions
- Component lifecycle methods

### HTML Tags
Inside JSX blocks, get suggestions for:
- All standard HTML5 elements
- Common attributes for each element
- Event handlers (`onClick`, `onChange`, etc.)

### CSS Properties
Inside `style` blocks:
- CSS property names
- Common values for properties

## Hover Information

Hover over keywords to see documentation:

- **Keywords**: Description and usage examples
- **Components**: Component signature and props
- **HTML Tags**: Element description and common attributes

## Editor Settings

The editor is configured with sensible defaults:

| Setting | Value |
|---------|-------|
| Tab Size | 2 spaces |
| Word Wrap | On |
| Minimap | Hidden |
| Font | System monospace |
| Theme | Dark (VS Code-like) |

## Multi-File Editing

### Tabs
- Click a file in the explorer to open it in a new tab
- Click a tab to switch to that file
- Click the X on a tab to close it
- Unsaved files show a dot (●) indicator

### Tab Navigation
- `Ctrl+Tab` - Next tab
- `Ctrl+Shift+Tab` - Previous tab
- `Ctrl+W` - Close current tab

## Find and Replace

Use Monaco's built-in find and replace:
- `Ctrl+F` - Find
- `Ctrl+H` - Find and Replace
- `F3` / `Shift+F3` - Find next/previous

## Multiple Cursors

- `Alt+Click` - Add cursor
- `Ctrl+Alt+Up/Down` - Add cursor above/below
- `Ctrl+D` - Select next occurrence

## Code Folding

Click the arrows in the gutter to fold/unfold code blocks:
- Functions
- Components
- Style blocks
- JSX elements

## Bracket Matching

The editor automatically:
- Highlights matching brackets
- Auto-closes brackets, quotes, and tags
- Shows bracket pair colors
