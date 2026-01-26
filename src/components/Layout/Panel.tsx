import { type ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  Terminal,
  AlertCircle,
  FileText,
  Code2,
  Network,
  Gauge,
  HardDrive,
  Database,
  Shield,
  Zap,
  Video,
} from "lucide-react";
import "./Panel.css";

export type PanelTab =
  | "terminal"
  | "problems"
  | "output"
  | "elements"
  | "console"
  | "sources"
  | "network"
  | "performance"
  | "memory"
  | "application"
  | "security"
  | "fluxscore"
  | "recorder";

interface PanelProps {
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  children: ReactNode;
}

const tabs: { id: PanelTab; label: string; icon: typeof Terminal }[] = [
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "problems", label: "Problems", icon: AlertCircle },
  { id: "output", label: "Output", icon: FileText },
  { id: "elements", label: "Elements", icon: Code2 },
  { id: "console", label: "Console", icon: Terminal },
  { id: "sources", label: "Sources", icon: Code2 },
  { id: "network", label: "Network", icon: Network },
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "memory", label: "Memory", icon: HardDrive },
  { id: "application", label: "Application", icon: Database },
  { id: "security", label: "Security", icon: Shield },
  { id: "fluxscore", label: "FluxScore", icon: Zap },
  { id: "recorder", label: "Recorder", icon: Video },
];

export function Panel({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  children,
}: PanelProps) {
  return (
    <div className={`panel ${isCollapsed ? "collapsed" : ""}`}>
      <div className="panel-header">
        <div className="panel-tabs-wrapper">
          <div className="panel-tabs">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`panel-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => onTabChange(id)}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel-actions">
          <button
            className="panel-action"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button className="panel-action" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>
      {!isCollapsed && <div className="panel-content">{children}</div>}
    </div>
  );
}
