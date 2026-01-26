import { useThemeStore } from "../../../stores/theme-store";
import { EDITOR_FONT_OPTIONS } from "../../../themes/types";

export function TerminalSettings() {
  const {
    terminalFontSize,
    terminalFontFamily,
    setTerminalFontSize,
    setTerminalFontFamily,
  } = useThemeStore();

  return (
    <div className="settings-section">
      {/* Font Settings */}
      <div className="settings-group">
        <h3 className="settings-group-title">Font</h3>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Font Family</div>
            <div className="setting-description">Monospace font used in the terminal</div>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={terminalFontFamily}
              onChange={(e) => setTerminalFontFamily(e.target.value)}
            >
              {EDITOR_FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Font Size</div>
            <div className="setting-description">Terminal font size (10-24px)</div>
          </div>
          <div className="setting-control">
            <div className="setting-slider">
              <input
                type="range"
                min="10"
                max="24"
                value={terminalFontSize}
                onChange={(e) => setTerminalFontSize(parseInt(e.target.value))}
              />
              <span className="slider-value">{terminalFontSize}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Info */}
      <div className="settings-group">
        <h3 className="settings-group-title">Terminal Colors</h3>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Theme Colors</div>
            <div className="setting-description">
              Terminal colors automatically match your selected theme.
              Change the theme in Appearance settings to update terminal colors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
