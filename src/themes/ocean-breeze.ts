import type { FluxTheme } from "./types";

export const oceanBreezeTheme: FluxTheme = {
  name: "ocean-breeze",
  displayName: "Ocean Breeze",
  type: "dark",

  cssVariables: {
    // Background hierarchy - Deep ocean blues
    bgPrimary: "#0a1929",
    bgSecondary: "#0d2137",
    bgTertiary: "#132f4c",
    bgHover: "#1a3d5c",
    bgActive: "#214b6f",
    bgOverlay: "rgba(10, 25, 41, 0.95)",

    // Text hierarchy
    textPrimary: "#e0f2fe",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    textInverse: "#0a1929",

    // Primary accent - Teal
    accentPrimary: "#00bcd4",
    accentHover: "#26c6da",
    accentActive: "#0097a7",
    accentMuted: "#004d5a",

    // Secondary accent - Seafoam
    accentSecondary: "#4dd0e1",
    accentSecondaryHover: "#80deea",

    // Semantic colors
    errorColor: "#f87171",
    warningColor: "#fbbf24",
    successColor: "#34d399",
    infoColor: "#38bdf8",

    // Borders & dividers
    borderColor: "#1e3a5f",
    borderHover: "#2d4a6f",
    borderFocus: "#00bcd4",

    // Special effects
    glowColor: "rgba(0, 188, 212, 0.35)",
    glowStrong: "rgba(0, 188, 212, 0.55)",
    gradientPrimary: "linear-gradient(135deg, #00bcd4 0%, #4dd0e1 100%)",
    gradientSecondary: "linear-gradient(135deg, #132f4c 0%, #0a1929 100%)",
    gradientAccent: "linear-gradient(90deg, #00bcd4, #4dd0e1, #00bcd4)",

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
      { token: "keyword", foreground: "00bcd4", fontStyle: "bold" },
      { token: "keyword.control", foreground: "00bcd4" },
      { token: "keyword.operator", foreground: "4dd0e1" },
      { token: "type", foreground: "4dd0e1" },
      { token: "type.identifier", foreground: "4dd0e1" },
      { token: "class", foreground: "4dd0e1" },
      { token: "variable", foreground: "e0f2fe" },
      { token: "variable.predefined", foreground: "26c6da" },
      { token: "variable.parameter", foreground: "fbbf24" },
      { token: "identifier", foreground: "e0f2fe" },
      { token: "function", foreground: "34d399" },
      { token: "function.declaration", foreground: "34d399" },
      { token: "string", foreground: "fbbf24" },
      { token: "string.escape", foreground: "f87171" },
      { token: "number", foreground: "f87171" },
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "operator", foreground: "4dd0e1" },
      { token: "delimiter", foreground: "94a3b8" },
      { token: "delimiter.bracket", foreground: "00bcd4" },
      { token: "tag", foreground: "f87171" },
      { token: "attribute.name", foreground: "26c6da" },
      { token: "attribute.value", foreground: "fbbf24" },
    ],
    colors: {
      "editor.background": "#0a1929",
      "editor.foreground": "#e0f2fe",
      "editorCursor.foreground": "#00bcd4",
      "editor.selectionBackground": "#00bcd440",
      "editor.inactiveSelectionBackground": "#00bcd420",
      "editor.selectionHighlightBackground": "#4dd0e120",
      "editorLineNumber.foreground": "#64748b",
      "editorLineNumber.activeForeground": "#00bcd4",
      "editor.lineHighlightBackground": "#132f4c80",
      "editorIndentGuide.background": "#1e3a5f",
      "editorIndentGuide.activeBackground": "#00bcd460",
      "editorBracketMatch.background": "#00bcd430",
      "editorBracketMatch.border": "#00bcd4",
      "editorBracketHighlight.foreground1": "#00bcd4",
      "editorBracketHighlight.foreground2": "#4dd0e1",
      "editorBracketHighlight.foreground3": "#fbbf24",
      "editorBracketHighlight.foreground4": "#34d399",
      "scrollbarSlider.background": "#00bcd430",
      "scrollbarSlider.hoverBackground": "#00bcd450",
      "editorWidget.background": "#0d2137",
      "editorWidget.border": "#1e3a5f",
      "editorSuggestWidget.selectedBackground": "#00bcd440",
      "editorSuggestWidget.highlightForeground": "#4dd0e1",
      "editorError.foreground": "#f87171",
      "editorWarning.foreground": "#fbbf24",
      "input.background": "#132f4c",
      "input.border": "#1e3a5f",
      "dropdown.background": "#0d2137",
      "dropdown.border": "#1e3a5f",
      "list.activeSelectionBackground": "#00bcd440",
      "list.hoverBackground": "#1a3d5c40",
    },
  },

  terminalTheme: {
    background: "#0a1929",
    foreground: "#e0f2fe",
    cursor: "#00bcd4",
    cursorAccent: "#0a1929",
    selectionBackground: "#00bcd440",
    selectionForeground: "#ffffff",
    black: "#0a1929",
    red: "#f87171",
    green: "#34d399",
    yellow: "#fbbf24",
    blue: "#38bdf8",
    magenta: "#a78bfa",
    cyan: "#00bcd4",
    white: "#e0f2fe",
    brightBlack: "#64748b",
    brightRed: "#fca5a5",
    brightGreen: "#6ee7b7",
    brightYellow: "#fcd34d",
    brightBlue: "#7dd3fc",
    brightMagenta: "#c4b5fd",
    brightCyan: "#67e8f9",
    brightWhite: "#ffffff",
  },
};
