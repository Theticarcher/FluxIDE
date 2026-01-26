import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ThemeName,
  ThemeSettings,
  FluxTheme,
} from "../themes/types";
import { DEFAULT_THEME_SETTINGS } from "../themes/types";
import { themes } from "../themes";

interface ThemeState extends ThemeSettings {
  // Computed: current theme object
  currentTheme: FluxTheme;

  // Actions
  setTheme: (name: ThemeName) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setEditorFontSize: (size: number) => void;
  setEditorFontFamily: (family: string) => void;
  setEditorLineHeight: (height: number) => void;
  setEditorTabSize: (size: number) => void;
  setEditorWordWrap: (enabled: boolean) => void;
  setEditorMinimap: (enabled: boolean) => void;
  setEditorFontLigatures: (enabled: boolean) => void;
  setTerminalFontSize: (size: number) => void;
  setTerminalFontFamily: (family: string) => void;
  setEnableAnimations: (enabled: boolean) => void;
  setEnableGlowEffects: (enabled: boolean) => void;
  setCompactMode: (enabled: boolean) => void;
  updateSettings: (partial: Partial<ThemeSettings>) => void;
  resetToDefaults: () => void;
}

// Helper to get theme by name
const getThemeByName = (name: ThemeName): FluxTheme => {
  return themes[name] || themes["flux-dark"];
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial settings
      ...DEFAULT_THEME_SETTINGS,
      currentTheme: getThemeByName(DEFAULT_THEME_SETTINGS.themeName),

      // Actions
      setTheme: (name: ThemeName) => {
        const theme = getThemeByName(name);
        set({ themeName: name, currentTheme: theme });
      },

      setFontSize: (size: number) => {
        const clamped = Math.min(Math.max(size, 10), 18);
        set({ fontSize: clamped });
      },

      setFontFamily: (family: string) => {
        set({ fontFamily: family });
      },

      setEditorFontSize: (size: number) => {
        const clamped = Math.min(Math.max(size, 10), 24);
        set({ editorFontSize: clamped });
      },

      setEditorFontFamily: (family: string) => {
        set({ editorFontFamily: family });
      },

      setEditorLineHeight: (height: number) => {
        const clamped = Math.min(Math.max(height, 1.0), 2.0);
        set({ editorLineHeight: clamped });
      },

      setEditorTabSize: (size: number) => {
        set({ editorTabSize: size });
      },

      setEditorWordWrap: (enabled: boolean) => {
        set({ editorWordWrap: enabled });
      },

      setEditorMinimap: (enabled: boolean) => {
        set({ editorMinimap: enabled });
      },

      setEditorFontLigatures: (enabled: boolean) => {
        set({ editorFontLigatures: enabled });
      },

      setTerminalFontSize: (size: number) => {
        const clamped = Math.min(Math.max(size, 10), 24);
        set({ terminalFontSize: clamped });
      },

      setTerminalFontFamily: (family: string) => {
        set({ terminalFontFamily: family });
      },

      setEnableAnimations: (enabled: boolean) => {
        set({ enableAnimations: enabled });
      },

      setEnableGlowEffects: (enabled: boolean) => {
        set({ enableGlowEffects: enabled });
      },

      setCompactMode: (enabled: boolean) => {
        set({ compactMode: enabled });
      },

      updateSettings: (partial: Partial<ThemeSettings>) => {
        const newSettings = { ...get(), ...partial };
        if (partial.themeName) {
          newSettings.currentTheme = getThemeByName(partial.themeName);
        }
        set(newSettings);
      },

      resetToDefaults: () => {
        set({
          ...DEFAULT_THEME_SETTINGS,
          currentTheme: getThemeByName(DEFAULT_THEME_SETTINGS.themeName),
        });
      },
    }),
    {
      name: "fluxide-theme-settings",
      // Only persist settings, not the computed theme object
      partialize: (state) => ({
        themeName: state.themeName,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        editorFontSize: state.editorFontSize,
        editorFontFamily: state.editorFontFamily,
        editorLineHeight: state.editorLineHeight,
        editorTabSize: state.editorTabSize,
        editorWordWrap: state.editorWordWrap,
        editorMinimap: state.editorMinimap,
        editorFontLigatures: state.editorFontLigatures,
        terminalFontSize: state.terminalFontSize,
        terminalFontFamily: state.terminalFontFamily,
        enableAnimations: state.enableAnimations,
        enableGlowEffects: state.enableGlowEffects,
        compactMode: state.compactMode,
      }),
      // Rehydrate the currentTheme when loading from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.currentTheme = getThemeByName(state.themeName);
        }
      },
    }
  )
);
