import type { FluxTheme } from "./types";

export const fluxDarkTheme: FluxTheme = {
  name: "flux-dark",
  displayName: "Flux Dark",
  type: "dark",

  cssVariables: {
    // Background hierarchy - Deep purple-gray base
    bgPrimary: "#0d0d14",
    bgSecondary: "#13131d",
    bgTertiary: "#1a1a28",
    bgHover: "#252538",
    bgActive: "#2d2d48",
    bgOverlay: "rgba(13, 13, 20, 0.95)",

    // Text hierarchy
    textPrimary: "#e8e8f0",
    textSecondary: "#9090a8",
    textMuted: "#606078",
    textInverse: "#0d0d14",

    // Primary accent - Electric Violet
    accentPrimary: "#7c4dff",
    accentHover: "#9d7aff",
    accentActive: "#6930ff",
    accentMuted: "#4a2d99",

    // Secondary accent - Cyan Energy
    accentSecondary: "#00e5ff",
    accentSecondaryHover: "#40efff",

    // Semantic colors
    errorColor: "#ff5c8a",
    warningColor: "#ffb347",
    successColor: "#4ade80",
    infoColor: "#60a5fa",

    // Borders & dividers
    borderColor: "#2a2a40",
    borderHover: "#3d3d5c",
    borderFocus: "#7c4dff",

    // Special effects
    glowColor: "rgba(124, 77, 255, 0.4)",
    glowStrong: "rgba(124, 77, 255, 0.6)",
    gradientPrimary: "linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)",
    gradientSecondary: "linear-gradient(135deg, #1a1a28 0%, #0d0d14 100%)",
    gradientAccent: "linear-gradient(90deg, #7c4dff, #00e5ff, #7c4dff)",

    // Shadows
    shadowSmall: "0 2px 4px rgba(0, 0, 0, 0.3)",
    shadowMedium: "0 4px 12px rgba(0, 0, 0, 0.4)",
    shadowLarge: "0 8px 24px rgba(0, 0, 0, 0.5)",

    // Border radius - more rounded than VS Code
    radiusSmall: "6px",
    radiusMedium: "10px",
    radiusLarge: "14px",
    radiusXLarge: "20px",
  },

  monacoTheme: {
    base: "vs-dark",
    inherit: true,
    rules: [
      // Keywords & Control Flow
      { token: "keyword", foreground: "7c4dff", fontStyle: "bold" },
      { token: "keyword.control", foreground: "7c4dff" },
      { token: "keyword.operator", foreground: "00e5ff" },

      // Types & Classes
      { token: "type", foreground: "00e5ff" },
      { token: "type.identifier", foreground: "00e5ff" },
      { token: "class", foreground: "00e5ff" },

      // Variables & Identifiers
      { token: "variable", foreground: "e8e8f0" },
      { token: "variable.predefined", foreground: "9d7aff" },
      { token: "variable.parameter", foreground: "ffb347" },
      { token: "identifier", foreground: "e8e8f0" },

      // Functions
      { token: "function", foreground: "4ade80" },
      { token: "function.declaration", foreground: "4ade80" },

      // Strings
      { token: "string", foreground: "ffb347" },
      { token: "string.escape", foreground: "ff5c8a" },

      // Numbers
      { token: "number", foreground: "ff5c8a" },
      { token: "number.hex", foreground: "ff5c8a" },

      // Comments
      { token: "comment", foreground: "606078", fontStyle: "italic" },
      { token: "comment.doc", foreground: "7a7a90", fontStyle: "italic" },

      // Operators & Punctuation
      { token: "operator", foreground: "00e5ff" },
      { token: "delimiter", foreground: "9090a8" },
      { token: "delimiter.bracket", foreground: "9d7aff" },
      { token: "delimiter.parenthesis", foreground: "ffb347" },
      { token: "delimiter.square", foreground: "00e5ff" },

      // JSX/HTML
      { token: "tag", foreground: "ff5c8a" },
      { token: "tag.attribute.name", foreground: "9d7aff" },
      { token: "attribute.name", foreground: "9d7aff" },
      { token: "attribute.value", foreground: "ffb347" },

      // CSS
      { token: "attribute.value.css", foreground: "ffb347" },
      { token: "property.css", foreground: "00e5ff" },
      { token: "unit.css", foreground: "ff5c8a" },

      // State/Effect (Flux-specific)
      { token: "keyword.state", foreground: "ff5c8a", fontStyle: "bold" },
      { token: "keyword.effect", foreground: "4ade80", fontStyle: "bold" },
      { token: "keyword.computed", foreground: "00e5ff", fontStyle: "bold" },

      // Constants
      { token: "constant", foreground: "ff5c8a" },
      { token: "constant.language", foreground: "7c4dff" },

      // Regex
      { token: "regexp", foreground: "ff5c8a" },
    ],
    colors: {
      // Editor background
      "editor.background": "#0d0d14",
      "editor.foreground": "#e8e8f0",

      // Cursor & Selection
      "editorCursor.foreground": "#7c4dff",
      "editor.selectionBackground": "#7c4dff40",
      "editor.inactiveSelectionBackground": "#7c4dff20",
      "editor.selectionHighlightBackground": "#00e5ff20",

      // Line numbers
      "editorLineNumber.foreground": "#606078",
      "editorLineNumber.activeForeground": "#9d7aff",

      // Line highlight
      "editor.lineHighlightBackground": "#1a1a2880",
      "editor.lineHighlightBorder": "#2a2a4000",

      // Indentation guides
      "editorIndentGuide.background": "#2a2a40",
      "editorIndentGuide.activeBackground": "#7c4dff60",

      // Bracket match
      "editorBracketMatch.background": "#7c4dff30",
      "editorBracketMatch.border": "#7c4dff",

      // Bracket pair colorization
      "editorBracketHighlight.foreground1": "#7c4dff",
      "editorBracketHighlight.foreground2": "#00e5ff",
      "editorBracketHighlight.foreground3": "#ffb347",
      "editorBracketHighlight.foreground4": "#ff5c8a",
      "editorBracketHighlight.foreground5": "#4ade80",
      "editorBracketHighlight.foreground6": "#9d7aff",

      // Gutter
      "editorGutter.background": "#0d0d14",
      "editorGutter.modifiedBackground": "#00e5ff",
      "editorGutter.addedBackground": "#4ade80",
      "editorGutter.deletedBackground": "#ff5c8a",

      // Scrollbar
      "scrollbar.shadow": "#00000050",
      "scrollbarSlider.background": "#7c4dff30",
      "scrollbarSlider.hoverBackground": "#7c4dff50",
      "scrollbarSlider.activeBackground": "#7c4dff70",

      // Minimap
      "minimap.background": "#0d0d14",
      "minimap.selectionHighlight": "#7c4dff60",
      "minimapSlider.background": "#7c4dff20",
      "minimapSlider.hoverBackground": "#7c4dff40",
      "minimapSlider.activeBackground": "#7c4dff60",

      // Widget (autocomplete, hover)
      "editorWidget.background": "#13131d",
      "editorWidget.border": "#2a2a40",
      "editorSuggestWidget.background": "#13131d",
      "editorSuggestWidget.border": "#2a2a40",
      "editorSuggestWidget.foreground": "#e8e8f0",
      "editorSuggestWidget.selectedBackground": "#7c4dff40",
      "editorSuggestWidget.highlightForeground": "#00e5ff",

      // Hover widget
      "editorHoverWidget.background": "#13131d",
      "editorHoverWidget.border": "#2a2a40",

      // Find/Search
      "editor.findMatchBackground": "#7c4dff40",
      "editor.findMatchHighlightBackground": "#00e5ff30",
      "editor.findRangeHighlightBackground": "#7c4dff20",

      // Error/Warning squiggles
      "editorError.foreground": "#ff5c8a",
      "editorWarning.foreground": "#ffb347",
      "editorInfo.foreground": "#60a5fa",

      // Overview ruler
      "editorOverviewRuler.border": "#2a2a40",
      "editorOverviewRuler.errorForeground": "#ff5c8a",
      "editorOverviewRuler.warningForeground": "#ffb347",
      "editorOverviewRuler.infoForeground": "#60a5fa",

      // Peek view
      "peekView.border": "#7c4dff",
      "peekViewEditor.background": "#0d0d14",
      "peekViewResult.background": "#13131d",
      "peekViewTitle.background": "#1a1a28",

      // Input
      "input.background": "#1a1a28",
      "input.border": "#2a2a40",
      "input.foreground": "#e8e8f0",
      "input.placeholderForeground": "#606078",
      "inputOption.activeBorder": "#7c4dff",

      // Dropdown
      "dropdown.background": "#13131d",
      "dropdown.border": "#2a2a40",
      "dropdown.foreground": "#e8e8f0",

      // List/Tree
      "list.activeSelectionBackground": "#7c4dff40",
      "list.activeSelectionForeground": "#e8e8f0",
      "list.hoverBackground": "#25253820",
      "list.focusBackground": "#7c4dff30",
    },
  },

  terminalTheme: {
    background: "#0d0d14",
    foreground: "#e8e8f0",
    cursor: "#7c4dff",
    cursorAccent: "#0d0d14",
    selectionBackground: "#7c4dff40",
    selectionForeground: "#ffffff",
    black: "#0d0d14",
    red: "#ff5c8a",
    green: "#4ade80",
    yellow: "#ffb347",
    blue: "#60a5fa",
    magenta: "#9d7aff",
    cyan: "#00e5ff",
    white: "#e8e8f0",
    brightBlack: "#606078",
    brightRed: "#ff8fab",
    brightGreen: "#86efac",
    brightYellow: "#ffd699",
    brightBlue: "#93c5fd",
    brightMagenta: "#c4b5fd",
    brightCyan: "#67e8f9",
    brightWhite: "#ffffff",
  },
};
