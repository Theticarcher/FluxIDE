import type { FluxTheme } from "./types";

export const forestTheme: FluxTheme = {
  name: "forest",
  displayName: "Forest",
  type: "dark",

  cssVariables: {
    // Background hierarchy - Dark green-brown earth tones
    bgPrimary: "#0d1512",
    bgSecondary: "#121a16",
    bgTertiary: "#182420",
    bgHover: "#1f2e28",
    bgActive: "#263830",
    bgOverlay: "rgba(13, 21, 18, 0.95)",

    // Text hierarchy
    textPrimary: "#e8f0eb",
    textSecondary: "#9ca8a0",
    textMuted: "#6b7770",
    textInverse: "#0d1512",

    // Primary accent - Emerald
    accentPrimary: "#4ade80",
    accentHover: "#6ee7a0",
    accentActive: "#22c55e",
    accentMuted: "#1a4d32",

    // Secondary accent - Gold
    accentSecondary: "#fbbf24",
    accentSecondaryHover: "#fcd34d",

    // Semantic colors
    errorColor: "#f87171",
    warningColor: "#fbbf24",
    successColor: "#4ade80",
    infoColor: "#60a5fa",

    // Borders & dividers
    borderColor: "#2d3d34",
    borderHover: "#3d4d44",
    borderFocus: "#4ade80",

    // Special effects
    glowColor: "rgba(74, 222, 128, 0.35)",
    glowStrong: "rgba(74, 222, 128, 0.55)",
    gradientPrimary: "linear-gradient(135deg, #4ade80 0%, #fbbf24 100%)",
    gradientSecondary: "linear-gradient(135deg, #182420 0%, #0d1512 100%)",
    gradientAccent: "linear-gradient(90deg, #4ade80, #fbbf24, #4ade80)",

    // Shadows
    shadowSmall: "0 2px 4px rgba(0, 0, 0, 0.3)",
    shadowMedium: "0 4px 12px rgba(0, 0, 0, 0.4)",
    shadowLarge: "0 8px 24px rgba(0, 0, 0, 0.5)",

    // Border radius
    radiusSmall: "6px",
    radiusMedium: "10px",
    radiusLarge: "14px",
    radiusXLarge: "20px",
  },

  monacoTheme: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "4ade80", fontStyle: "bold" },
      { token: "keyword.control", foreground: "4ade80" },
      { token: "keyword.operator", foreground: "fbbf24" },
      { token: "type", foreground: "6ee7a0" },
      { token: "type.identifier", foreground: "6ee7a0" },
      { token: "class", foreground: "6ee7a0" },
      { token: "variable", foreground: "e8f0eb" },
      { token: "variable.predefined", foreground: "4ade80" },
      { token: "variable.parameter", foreground: "fbbf24" },
      { token: "identifier", foreground: "e8f0eb" },
      { token: "function", foreground: "60a5fa" },
      { token: "function.declaration", foreground: "60a5fa" },
      { token: "string", foreground: "fbbf24" },
      { token: "string.escape", foreground: "f87171" },
      { token: "number", foreground: "f87171" },
      { token: "comment", foreground: "6b7770", fontStyle: "italic" },
      { token: "operator", foreground: "fbbf24" },
      { token: "delimiter", foreground: "9ca8a0" },
      { token: "delimiter.bracket", foreground: "4ade80" },
      { token: "tag", foreground: "f87171" },
      { token: "attribute.name", foreground: "6ee7a0" },
      { token: "attribute.value", foreground: "fbbf24" },
    ],
    colors: {
      "editor.background": "#0d1512",
      "editor.foreground": "#e8f0eb",
      "editorCursor.foreground": "#4ade80",
      "editor.selectionBackground": "#4ade8040",
      "editor.inactiveSelectionBackground": "#4ade8020",
      "editor.selectionHighlightBackground": "#fbbf2420",
      "editorLineNumber.foreground": "#6b7770",
      "editorLineNumber.activeForeground": "#4ade80",
      "editor.lineHighlightBackground": "#18242080",
      "editorIndentGuide.background": "#2d3d34",
      "editorIndentGuide.activeBackground": "#4ade8060",
      "editorBracketMatch.background": "#4ade8030",
      "editorBracketMatch.border": "#4ade80",
      "editorBracketHighlight.foreground1": "#4ade80",
      "editorBracketHighlight.foreground2": "#fbbf24",
      "editorBracketHighlight.foreground3": "#60a5fa",
      "editorBracketHighlight.foreground4": "#f87171",
      "scrollbarSlider.background": "#4ade8030",
      "scrollbarSlider.hoverBackground": "#4ade8050",
      "editorWidget.background": "#121a16",
      "editorWidget.border": "#2d3d34",
      "editorSuggestWidget.selectedBackground": "#4ade8040",
      "editorSuggestWidget.highlightForeground": "#fbbf24",
      "editorError.foreground": "#f87171",
      "editorWarning.foreground": "#fbbf24",
      "input.background": "#182420",
      "input.border": "#2d3d34",
      "dropdown.background": "#121a16",
      "dropdown.border": "#2d3d34",
      "list.activeSelectionBackground": "#4ade8040",
      "list.hoverBackground": "#1f2e2840",
    },
  },

  terminalTheme: {
    background: "#0d1512",
    foreground: "#e8f0eb",
    cursor: "#4ade80",
    cursorAccent: "#0d1512",
    selectionBackground: "#4ade8040",
    selectionForeground: "#ffffff",
    black: "#0d1512",
    red: "#f87171",
    green: "#4ade80",
    yellow: "#fbbf24",
    blue: "#60a5fa",
    magenta: "#c084fc",
    cyan: "#22d3ee",
    white: "#e8f0eb",
    brightBlack: "#6b7770",
    brightRed: "#fca5a5",
    brightGreen: "#86efac",
    brightYellow: "#fcd34d",
    brightBlue: "#93c5fd",
    brightMagenta: "#d8b4fe",
    brightCyan: "#67e8f9",
    brightWhite: "#ffffff",
  },
};
