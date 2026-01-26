import type { FluxTheme } from "./types";

export const fluxLightTheme: FluxTheme = {
  name: "flux-light",
  displayName: "Flux Light",
  type: "light",

  cssVariables: {
    // Background hierarchy - Clean whites
    bgPrimary: "#ffffff",
    bgSecondary: "#f8f8fc",
    bgTertiary: "#f0f0f6",
    bgHover: "#e8e8f0",
    bgActive: "#dcdce8",
    bgOverlay: "rgba(255, 255, 255, 0.95)",

    // Text hierarchy
    textPrimary: "#1a1a28",
    textSecondary: "#5c5c70",
    textMuted: "#8c8ca0",
    textInverse: "#ffffff",

    // Primary accent - Deeper Violet for contrast
    accentPrimary: "#6930ff",
    accentHover: "#5020e0",
    accentActive: "#4010c0",
    accentMuted: "#e8e0ff",

    // Secondary accent - Deeper Cyan
    accentSecondary: "#00b8d4",
    accentSecondaryHover: "#0090a8",

    // Semantic colors
    errorColor: "#e53e5c",
    warningColor: "#e89000",
    successColor: "#22a855",
    infoColor: "#2563eb",

    // Borders & dividers
    borderColor: "#e0e0e8",
    borderHover: "#c8c8d8",
    borderFocus: "#6930ff",

    // Special effects
    glowColor: "rgba(105, 48, 255, 0.2)",
    glowStrong: "rgba(105, 48, 255, 0.35)",
    gradientPrimary: "linear-gradient(135deg, #6930ff 0%, #00b8d4 100%)",
    gradientSecondary: "linear-gradient(135deg, #f8f8fc 0%, #ffffff 100%)",
    gradientAccent: "linear-gradient(90deg, #6930ff, #00b8d4, #6930ff)",

    // Shadows - lighter
    shadowSmall: "0 2px 4px rgba(0, 0, 0, 0.08)",
    shadowMedium: "0 4px 12px rgba(0, 0, 0, 0.12)",
    shadowLarge: "0 8px 24px rgba(0, 0, 0, 0.16)",

    // Border radius
    radiusSmall: "6px",
    radiusMedium: "10px",
    radiusLarge: "14px",
    radiusXLarge: "20px",
  },

  monacoTheme: {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "6930ff", fontStyle: "bold" },
      { token: "keyword.control", foreground: "6930ff" },
      { token: "keyword.operator", foreground: "00b8d4" },
      { token: "type", foreground: "00b8d4" },
      { token: "type.identifier", foreground: "00b8d4" },
      { token: "class", foreground: "00b8d4" },
      { token: "variable", foreground: "1a1a28" },
      { token: "variable.predefined", foreground: "6930ff" },
      { token: "variable.parameter", foreground: "e89000" },
      { token: "identifier", foreground: "1a1a28" },
      { token: "function", foreground: "22a855" },
      { token: "function.declaration", foreground: "22a855" },
      { token: "string", foreground: "e89000" },
      { token: "string.escape", foreground: "e53e5c" },
      { token: "number", foreground: "e53e5c" },
      { token: "comment", foreground: "8c8ca0", fontStyle: "italic" },
      { token: "operator", foreground: "00b8d4" },
      { token: "delimiter", foreground: "5c5c70" },
      { token: "tag", foreground: "e53e5c" },
      { token: "attribute.name", foreground: "6930ff" },
      { token: "attribute.value", foreground: "e89000" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#1a1a28",
      "editorCursor.foreground": "#6930ff",
      "editor.selectionBackground": "#6930ff30",
      "editor.inactiveSelectionBackground": "#6930ff15",
      "editorLineNumber.foreground": "#8c8ca0",
      "editorLineNumber.activeForeground": "#6930ff",
      "editor.lineHighlightBackground": "#f0f0f680",
      "editorIndentGuide.background": "#e0e0e8",
      "editorIndentGuide.activeBackground": "#6930ff40",
      "editorBracketMatch.background": "#6930ff20",
      "editorBracketMatch.border": "#6930ff",
      "scrollbarSlider.background": "#6930ff20",
      "scrollbarSlider.hoverBackground": "#6930ff40",
      "editorWidget.background": "#f8f8fc",
      "editorWidget.border": "#e0e0e8",
      "editorSuggestWidget.selectedBackground": "#6930ff20",
      "editorError.foreground": "#e53e5c",
      "editorWarning.foreground": "#e89000",
      "input.background": "#f8f8fc",
      "input.border": "#e0e0e8",
      "dropdown.background": "#ffffff",
      "dropdown.border": "#e0e0e8",
      "list.activeSelectionBackground": "#6930ff25",
      "list.hoverBackground": "#e8e8f040",
    },
  },

  terminalTheme: {
    background: "#ffffff",
    foreground: "#1a1a28",
    cursor: "#6930ff",
    cursorAccent: "#ffffff",
    selectionBackground: "#6930ff30",
    selectionForeground: "#1a1a28",
    black: "#1a1a28",
    red: "#e53e5c",
    green: "#22a855",
    yellow: "#e89000",
    blue: "#2563eb",
    magenta: "#6930ff",
    cyan: "#00b8d4",
    white: "#f8f8fc",
    brightBlack: "#5c5c70",
    brightRed: "#ff5c7a",
    brightGreen: "#34d068",
    brightYellow: "#ffa620",
    brightBlue: "#3b82f6",
    brightMagenta: "#8b5cf6",
    brightCyan: "#22d3ee",
    brightWhite: "#ffffff",
  },
};
