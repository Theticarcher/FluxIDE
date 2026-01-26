import { useThemeStore } from "../../../stores/theme-store";
import { themes, themeNames } from "../../../themes";
import { UI_FONT_OPTIONS } from "../../../themes/types";
import type { ThemeName } from "../../../themes/types";

export function AppearanceSettings() {
  const {
    themeName,
    fontSize,
    fontFamily,
    enableAnimations,
    enableGlowEffects,
    compactMode,
    setTheme,
    setFontSize,
    setFontFamily,
    setEnableAnimations,
    setEnableGlowEffects,
    setCompactMode,
  } = useThemeStore();

  return (
    <div className="settings-section">
      {/* Theme Selection */}
      <div className="settings-group">
        <h3 className="settings-group-title">Theme</h3>
        <div className="theme-grid">
          {themeNames.map((name) => {
            const theme = themes[name];
            return (
              <button
                key={name}
                className={`theme-card ${themeName === name ? "active" : ""}`}
                onClick={() => setTheme(name as ThemeName)}
              >
                <div className="theme-preview">
                  <div
                    className="theme-preview-sidebar"
                    style={{ background: theme.cssVariables.bgSecondary }}
                  />
                  <div className="theme-preview-main">
                    <div
                      className="theme-preview-editor"
                      style={{ background: theme.cssVariables.bgPrimary }}
                    />
                    <div
                      className="theme-preview-status"
                      style={{ background: theme.cssVariables.gradientPrimary }}
                    />
                  </div>
                </div>
                <div className="theme-name">{theme.displayName}</div>
                <div className="theme-type">{theme.type}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Settings */}
      <div className="settings-group">
        <h3 className="settings-group-title">Font</h3>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">UI Font Family</div>
            <div className="setting-description">Font used for menus, buttons, and labels</div>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {UI_FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">UI Font Size</div>
            <div className="setting-description">Base font size for the interface (10-18px)</div>
          </div>
          <div className="setting-control">
            <div className="setting-slider">
              <input
                type="range"
                min="10"
                max="18"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
              <span className="slider-value">{fontSize}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* UI Effects */}
      <div className="settings-group">
        <h3 className="settings-group-title">Effects</h3>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Enable Animations</div>
            <div className="setting-description">Smooth transitions and hover effects</div>
          </div>
          <div className="setting-control">
            <button
              className={`toggle-switch ${enableAnimations ? "active" : ""}`}
              onClick={() => setEnableAnimations(!enableAnimations)}
            />
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Enable Glow Effects</div>
            <div className="setting-description">Glowing accents on active elements</div>
          </div>
          <div className="setting-control">
            <button
              className={`toggle-switch ${enableGlowEffects ? "active" : ""}`}
              onClick={() => setEnableGlowEffects(!enableGlowEffects)}
            />
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Compact Mode</div>
            <div className="setting-description">Reduce spacing and padding for more content</div>
          </div>
          <div className="setting-control">
            <button
              className={`toggle-switch ${compactMode ? "active" : ""}`}
              onClick={() => setCompactMode(!compactMode)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
