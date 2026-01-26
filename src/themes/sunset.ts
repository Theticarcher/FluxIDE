import type { FluxTheme } from "./types";

export const sunsetTheme: FluxTheme = {
  name: "sunset",
  displayName: "Sunset",
  type: "dark",

  cssVariables: {
    // Background hierarchy - Deep purple-red
    bgPrimary: "#1a0a14",
    bgSecondary: "#200f18",
    bgTertiary: "#2a1520",
    bgHover: "#3a1f2c",
    bgActive: "#4a2838",
    bgOverlay: "rgba(26, 10, 20, 0.95)",

    // Text hierarchy
    textPrimary: "#fce7f0",
    textSecondary: "#c9a8b8",
    textMuted: "#8a6878",
    textInverse: "#1a0a14",

    // Primary accent - Orange
    accentPrimary: "#ff6b35",
    accentHover: "#ff8855",
    accentActive: "#e55520",
    accentMuted: "#662810",

    // Secondary accent - Magenta
    accentSecondary: "#e040fb",
    accentSecondaryHover: "#ea80fc",

    // Semantic colors
    errorColor: "#ff5c7a",
    warningColor: "#ffb347",
    successColor: "#4ade80",
    infoColor: "#60a5fa",

    // Borders & dividers
    borderColor: "#3d2030",
    borderHover: "#4d2840",
    borderFocus: "#ff6b35",

    // Special effects
    glowColor: "rgba(255, 107, 53, 0.4)",
    glowStrong: "rgba(255, 107, 53, 0.6)",
    gradientPrimary: "linear-gradient(135deg, #ff6b35 0%, #e040fb 100%)",
    gradientSecondary: "linear-gradient(135deg, #2a1520 0%, #1a0a14 100%)",
    gradientAccent: "linear-gradient(90deg, #ff6b35, #e040fb, #ff6b35)",

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
      { token: "keyword", foreground: "ff6b35", fontStyle: "bold" },
      { token: "keyword.control", foreground: "ff6b35" },
      { token: "keyword.operator", foreground: "e040fb" },
      { token: "type", foreground: "e040fb" },
      { token: "type.identifier", foreground: "e040fb" },
      { token: "class", foreground: "e040fb" },
      { token: "variable", foreground: "fce7f0" },
      { token: "variable.predefined", foreground: "ff8855" },
      { token: "variable.parameter", foreground: "ffb347" },
      { token: "identifier", foreground: "fce7f0" },
      { token: "function", foreground: "4ade80" },
      { token: "function.declaration", foreground: "4ade80" },
      { token: "string", foreground: "ffb347" },
      { token: "string.escape", foreground: "ff5c7a" },
      { token: "number", foreground: "ff5c7a" },
      { token: "comment", foreground: "8a6878", fontStyle: "italic" },
      { token: "operator", foreground: "e040fb" },
      { token: "delimiter", foreground: "c9a8b8" },
      { token: "delimiter.bracket", foreground: "ff6b35" },
      { token: "tag", foreground: "ff5c7a" },
      { token: "attribute.name", foreground: "ff8855" },
      { token: "attribute.value", foreground: "ffb347" },
    ],
    colors: {
      "editor.background": "#1a0a14",
      "editor.foreground": "#fce7f0",
      "editorCursor.foreground": "#ff6b35",
      "editor.selectionBackground": "#ff6b3540",
      "editor.inactiveSelectionBackground": "#ff6b3520",
      "editor.selectionHighlightBackground": "#e040fb20",
      "editorLineNumber.foreground": "#8a6878",
      "editorLineNumber.activeForeground": "#ff6b35",
      "editor.lineHighlightBackground": "#2a152080",
      "editorIndentGuide.background": "#3d2030",
      "editorIndentGuide.activeBackground": "#ff6b3560",
      "editorBracketMatch.background": "#ff6b3530",
      "editorBracketMatch.border": "#ff6b35",
      "editorBracketHighlight.foreground1": "#ff6b35",
      "editorBracketHighlight.foreground2": "#e040fb",
      "editorBracketHighlight.foreground3": "#ffb347",
      "editorBracketHighlight.foreground4": "#4ade80",
      "scrollbarSlider.background": "#ff6b3530",
      "scrollbarSlider.hoverBackground": "#ff6b3550",
      "editorWidget.background": "#200f18",
      "editorWidget.border": "#3d2030",
      "editorSuggestWidget.selectedBackground": "#ff6b3540",
      "editorSuggestWidget.highlightForeground": "#e040fb",
      "editorError.foreground": "#ff5c7a",
      "editorWarning.foreground": "#ffb347",
      "input.background": "#2a1520",
      "input.border": "#3d2030",
      "dropdown.background": "#200f18",
      "dropdown.border": "#3d2030",
      "list.activeSelectionBackground": "#ff6b3540",
      "list.hoverBackground": "#3a1f2c40",
    },
  },

  terminalTheme: {
    background: "#1a0a14",
    foreground: "#fce7f0",
    cursor: "#ff6b35",
    cursorAccent: "#1a0a14",
    selectionBackground: "#ff6b3540",
    selectionForeground: "#ffffff",
    black: "#1a0a14",
    red: "#ff5c7a",
    green: "#4ade80",
    yellow: "#ffb347",
    blue: "#60a5fa",
    magenta: "#e040fb",
    cyan: "#22d3ee",
    white: "#fce7f0",
    brightBlack: "#8a6878",
    brightRed: "#ff8fa3",
    brightGreen: "#86efac",
    brightYellow: "#ffd699",
    brightBlue: "#93c5fd",
    brightMagenta: "#ea80fc",
    brightCyan: "#67e8f9",
    brightWhite: "#ffffff",
  },
};
