import { GitBranch, Bell, Check, AlertCircle } from "lucide-react";
import "./StatusBar.css";

interface StatusBarProps {
  branch?: string;
  line?: number;
  column?: number;
  language?: string;
  encoding?: string;
  status?: "ready" | "compiling" | "error";
}

export function StatusBar({
  branch = "main",
  line = 1,
  column = 1,
  language = "Flux",
  encoding = "UTF-8",
  status = "ready",
}: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="status-item branch">
          <GitBranch size={14} />
          <span>{branch}</span>
        </div>
        {status === "error" && (
          <div className="status-item error">
            <AlertCircle size={14} />
            <span>Error</span>
          </div>
        )}
        {status === "ready" && (
          <div className="status-item success">
            <Check size={14} />
            <span>Ready</span>
          </div>
        )}
      </div>
      <div className="status-bar-right">
        <div className="status-item">
          Ln {line}, Col {column}
        </div>
        <div className="status-item">{encoding}</div>
        <div className="status-item">{language}</div>
        <div className="status-item notifications">
          <Bell size={14} />
        </div>
      </div>
    </div>
  );
}
