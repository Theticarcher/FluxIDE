import { X } from "lucide-react";
import type { OpenFile } from "../../types/file";
import "./EditorTabs.css";

interface EditorTabsProps {
  files: Map<string, OpenFile>;
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export function EditorTabs({
  files,
  activeFileId,
  onSelectTab,
  onCloseTab,
}: EditorTabsProps) {
  const fileArray = Array.from(files.values());

  if (fileArray.length === 0) {
    return null;
  }

  return (
    <div className="editor-tabs">
      {fileArray.map((file) => (
        <div
          key={file.id}
          className={`editor-tab ${activeFileId === file.id ? "active" : ""}`}
          onClick={() => onSelectTab(file.id)}
        >
          <span className="tab-label">
            {file.isDirty && <span className="dirty-indicator">●</span>}
            {file.name}
          </span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(file.id);
            }}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
