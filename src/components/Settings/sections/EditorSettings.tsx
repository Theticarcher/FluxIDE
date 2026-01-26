import { useThemeStore } from "../../../stores/theme-store";
import { EDITOR_FONT_OPTIONS } from "../../../themes/types";

export function EditorSettings() {
  const {
    editorFontSize,
    editorFontFamily,
    editorLineHeight,
    editorTabSize,
    editorWordWrap,
    editorMinimap,
    editorFontLigatures,
    setEditorFontSize,
    setEditorFontFamily,
    setEditorLineHeight,
    setEditorTabSize,
    setEditorWordWrap,
    setEditorMinimap,
    setEditorFontLigatures,
  } = useThemeStore();

  return (
    <div className="settings-section">
      {/* Font Settings */}
      <div className="settings-group">
        <h3 className="settings-group-title">Font</h3>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Font Family</div>
            <div className="setting-description">Monospace font used in the code editor</div>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={editorFontFamily}
              onChange={(e) => setEditorFontFamily(e.target.value)}
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
            <div className="setting-description">Code editor font size (10-24px)</div>
          </div>
          <div className="setting-control">
            <div className="setting-slider">
              <input
                type="range"
                min="10"
                max="24"
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(parseInt(e.target.value))}
              />
              <span className="slider-value">{editorFontSize}px</span>
            </div>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Line Height</div>
            <div className="setting-description">Spacing between lines of code (1.0-2.0)</div>
          </div>
          <div className="setting-control">
            <div className="setting-slider">
              <input
                type="range"
                min="10"
                max="20"
                value={editorLineHeight * 10}
                onChange={(e) => setEditorLineHeight(parseInt(e.target.value) / 10)}
              />
              <span className="slider-value">{editorLineHeight.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Font Ligatures</div>
            <div className="setting-description">Enable programming ligatures (e.g., =&gt; becomes arrow)</div>
          </div>
          <div className="setting-control">
            <button
              className={`toggle-switch ${editorFontLigatures ? "active" : ""}`}
              onClick={() => setEditorFontLigatures(!editorFontLigatures)}
            />
          </div>
        </div>
      </div>

      {/* Editor Behavior */}
      <div className="settings-group">
        <h3 className="settings-group-title">Behavior</h3>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Tab Size</div>
            <div className="setting-description">Number of spaces per tab</div>
          </div>
          <div className="setting-control">
            <select
              className="setting-select"
              value={editorTabSize}
              onChange={(e) => setEditorTabSize(parseInt(e.target.value))}
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Word Wrap</div>
            <div className="setting-description">Wrap long lines to fit the editor width</div>
          </div>
          <div className="setting-control">
            <button
              className={`toggle-switch ${editorWordWrap ? "active" : ""}`}
              onClick={() => setEditorWordWrap(!editorWordWrap)}
            />
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Minimap</div>
            <div className="setting-description">Show code overview on the right side</div>
          </div>
          <div className="setting-control">
            <button
              className={`toggle-switch ${editorMinimap ? "active" : ""}`}
              onClick={() => setEditorMinimap(!editorMinimap)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
