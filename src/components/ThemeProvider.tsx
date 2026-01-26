import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "../stores/theme-store";
import type { ThemeCSSVariables } from "../themes/types";

interface ThemeProviderProps {
  children: ReactNode;
}

// Map theme CSS variables to CSS custom property names
const cssVariableMap: Record<keyof ThemeCSSVariables, string> = {
  bgPrimary: "--bg-primary",
  bgSecondary: "--bg-secondary",
  bgTertiary: "--bg-tertiary",
  bgHover: "--bg-hover",
  bgActive: "--bg-active",
  bgOverlay: "--bg-overlay",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  textMuted: "--text-muted",
  textInverse: "--text-inverse",
  accentPrimary: "--accent-primary",
  accentHover: "--accent-hover",
  accentActive: "--accent-active",
  accentMuted: "--accent-muted",
  accentSecondary: "--accent-secondary",
  accentSecondaryHover: "--accent-secondary-hover",
  errorColor: "--error-color",
  warningColor: "--warning-color",
  successColor: "--success-color",
  infoColor: "--info-color",
  borderColor: "--border-color",
  borderHover: "--border-hover",
  borderFocus: "--border-focus",
  glowColor: "--glow-color",
  glowStrong: "--glow-strong",
  gradientPrimary: "--gradient-primary",
  gradientSecondary: "--gradient-secondary",
  gradientAccent: "--gradient-accent",
  shadowSmall: "--shadow-small",
  shadowMedium: "--shadow-medium",
  shadowLarge: "--shadow-large",
  radiusSmall: "--radius-small",
  radiusMedium: "--radius-medium",
  radiusLarge: "--radius-large",
  radiusXLarge: "--radius-xlarge",
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const {
    currentTheme,
    fontSize,
    fontFamily,
    enableAnimations,
    enableGlowEffects,
  } = useThemeStore();

  // Apply CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Apply all theme CSS variables
    const cssVars = currentTheme.cssVariables;
    for (const [key, value] of Object.entries(cssVars)) {
      const cssProperty = cssVariableMap[key as keyof ThemeCSSVariables];
      if (cssProperty) {
        root.style.setProperty(cssProperty, value);
      }
    }

    // Also set the legacy --accent-color for backward compatibility
    root.style.setProperty("--accent-color", cssVars.accentPrimary);

    // Apply font settings
    root.style.setProperty("--font-size", `${fontSize}px`);
    root.style.setProperty("--font-family", fontFamily);

    // Add/remove animation and glow effect classes
    if (!enableAnimations) {
      document.body.classList.add("no-animations");
    } else {
      document.body.classList.remove("no-animations");
    }

    if (!enableGlowEffects) {
      document.body.classList.add("no-glow-effects");
    } else {
      document.body.classList.remove("no-glow-effects");
    }

    // Set theme type on body for potential CSS selectors
    document.body.dataset.themeType = currentTheme.type;
    document.body.dataset.themeName = currentTheme.name;
  }, [currentTheme, fontSize, fontFamily, enableAnimations, enableGlowEffects]);

  return <>{children}</>;
}
