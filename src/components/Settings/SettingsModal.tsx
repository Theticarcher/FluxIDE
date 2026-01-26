import { useState } from "react";
import { X, Palette, Type, Terminal, Sparkles, RotateCcw } from "lucide-react";
import { useThemeStore } from "../../stores/theme-store";
import { AppearanceSettings } from "./sections/AppearanceSettings";
import { EditorSettings } from "./sections/EditorSettings";
import { TerminalSettings } from "./sections/TerminalSettings";
import "./SettingsModal.css";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = "appearance" | "editor" | "terminal";

const sections = [
  { id: "appearance" as const, label: "Appearance", icon: Palette },
  { id: "editor" as const, label: "Editor", icon: Type },
  { id: "terminal" as const, label: "Terminal", icon: Terminal },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");
  const resetToDefaults = useThemeStore((s) => s.resetToDefaults);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleReset = () => {
    if (confirm("Reset all settings to defaults? This cannot be undone.")) {
      resetToDefaults();
    }
  };

  return (
    <div className="settings-modal-backdrop" onClick={handleBackdropClick}>
      <div className="settings-modal">
        <div className="settings-header">
          <div className="settings-header-left">
            <Sparkles size={20} className="settings-icon" />
            <h2>Settings</h2>
          </div>
          <div className="settings-header-actions">
            <button
              className="settings-reset-btn"
              onClick={handleReset}
              title="Reset to defaults"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button className="settings-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="settings-body">
          <nav className="settings-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`settings-nav-item ${activeSection === section.id ? "active" : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon size={18} />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {activeSection === "appearance" && <AppearanceSettings />}
            {activeSection === "editor" && <EditorSettings />}
            {activeSection === "terminal" && <TerminalSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
