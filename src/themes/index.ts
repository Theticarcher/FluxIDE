import type { FluxTheme, ThemeName } from "./types";
import { fluxDarkTheme } from "./flux-dark";
import { fluxLightTheme } from "./flux-light";
import { neonNightsTheme } from "./neon-nights";
import { oceanBreezeTheme } from "./ocean-breeze";
import { forestTheme } from "./forest";
import { sunsetTheme } from "./sunset";

// Export all themes as a record for easy lookup
export const themes: Record<ThemeName, FluxTheme> = {
  "flux-dark": fluxDarkTheme,
  "flux-light": fluxLightTheme,
  "neon-nights": neonNightsTheme,
  "ocean-breeze": oceanBreezeTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
};

// Export all theme names for iteration
export const themeNames: ThemeName[] = [
  "flux-dark",
  "flux-light",
  "neon-nights",
  "ocean-breeze",
  "forest",
  "sunset",
];

// Export individual themes
export { fluxDarkTheme } from "./flux-dark";
export { fluxLightTheme } from "./flux-light";
export { neonNightsTheme } from "./neon-nights";
export { oceanBreezeTheme } from "./ocean-breeze";
export { forestTheme } from "./forest";
export { sunsetTheme } from "./sunset";

// Export types
export * from "./types";
