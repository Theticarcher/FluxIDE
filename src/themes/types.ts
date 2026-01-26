import type * as monaco from "monaco-editor";

// Available theme names
export type ThemeName =
  | "flux-dark"
  | "flux-light"
  | "neon-nights"
  | "ocean-breeze"
  | "forest"
  | "sunset";

// CSS Custom Properties for theming
export interface ThemeCSSVariables {
  // Background hierarchy
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgHover: string;
  bgActive: string;
  bgOverlay: string;

  // Text hierarchy
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Primary accent (brand color)
  accentPrimary: string;
  accentHover: string;
  accentActive: string;
  accentMuted: string;

  // Secondary accent
  accentSecondary: string;
  accentSecondaryHover: string;

  // Semantic colors
  errorColor: string;
  warningColor: string;
  successColor: string;
  infoColor: string;

  // Borders & dividers
  borderColor: string;
  borderHover: string;
  borderFocus: string;

  // Special effects (Flux distinctive features)
  glowColor: string;
  glowStrong: string;
  gradientPrimary: string;
  gradientSecondary: string;
  gradientAccent: string;

  // Shadows
  shadowSmall: string;
  shadowMedium: string;
  shadowLarge: string;

  // Border radius
  radiusSmall: string;
  radiusMedium: string;
  radiusLarge: string;
  radiusXLarge: string;
}

// Terminal theme colors (xterm.js)
export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
  selectionForeground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

// Complete theme definition
export interface FluxTheme {
  name: ThemeName;
  displayName: string;
  type: "dark" | "light";
  cssVariables: ThemeCSSVariables;
  monacoTheme: monaco.editor.IStandaloneThemeData;
  terminalTheme: TerminalTheme;
}

// User-customizable settings
export interface ThemeSettings {
  // Core theme
  themeName: ThemeName;

  // UI customization
  fontSize: number; // 10-18, default 13
  fontFamily: string;

  // Editor customization
  editorFontSize: number; // 10-24, default 14
  editorFontFamily: string;
  editorLineHeight: number; // 1.0-2.0, default 1.5
  editorTabSize: number; // 2, 4, 8
  editorWordWrap: boolean;
  editorMinimap: boolean;
  editorFontLigatures: boolean;

  // Terminal customization
  terminalFontSize: number;
  terminalFontFamily: string;

  // UI options
  enableAnimations: boolean;
  enableGlowEffects: boolean;
  compactMode: boolean;
}

// Default settings
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  themeName: "flux-dark",
  fontSize: 13,
  fontFamily:
    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  editorFontSize: 14,
  editorFontFamily:
    "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace",
  editorLineHeight: 1.5,
  editorTabSize: 2,
  editorWordWrap: true,
  editorMinimap: true,
  editorFontLigatures: true,
  terminalFontSize: 13,
  terminalFontFamily:
    "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
  enableAnimations: true,
  enableGlowEffects: true,
  compactMode: false,
};

// Font options for dropdowns
export const UI_FONT_OPTIONS = [
  {
    value:
      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    label: "Inter (Default)",
  },
  {
    value:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
    label: "System Default",
  },
  {
    value: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    label: "SF Pro Display",
  },
  { value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", label: "Segoe UI" },
  { value: "'Roboto', 'Helvetica Neue', Arial, sans-serif", label: "Roboto" },
];

export const EDITOR_FONT_OPTIONS = [
  {
    value:
      "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace",
    label: "JetBrains Mono (Default)",
  },
  {
    value: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
    label: "Fira Code",
  },
  {
    value: "'Cascadia Code', 'Fira Code', Consolas, monospace",
    label: "Cascadia Code",
  },
  { value: "'SF Mono', Monaco, 'Courier New', monospace", label: "SF Mono" },
  { value: "Consolas, 'Courier New', monospace", label: "Consolas" },
  {
    value: "'Source Code Pro', 'DejaVu Sans Mono', monospace",
    label: "Source Code Pro",
  },
];
