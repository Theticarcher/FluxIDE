import {
  Files,
  Search,
  GitBranch,
  Play,
  Settings,
  type LucideIcon,
} from "lucide-react";
import "./ActivityBar.css";

export type ActivityView = "explorer" | "search" | "git" | "run";

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
  onSettingsClick?: () => void;
}

interface ActivityItem {
  id: ActivityView;
  icon: LucideIcon;
  title: string;
}

const activities: ActivityItem[] = [
  { id: "explorer", icon: Files, title: "Explorer" },
  { id: "search", icon: Search, title: "Search" },
  { id: "git", icon: GitBranch, title: "Source Control" },
  { id: "run", icon: Play, title: "Run and Debug" },
];

export function ActivityBar({ activeView, onViewChange, onSettingsClick }: ActivityBarProps) {
  return (
    <div className="activity-bar">
      <div className="activity-bar-top">
        {activities.map(({ id, icon: Icon, title }) => (
          <button
            key={id}
            className={`activity-item ${activeView === id ? "active" : ""}`}
            onClick={() => onViewChange(id)}
            title={title}
          >
            <Icon size={24} />
          </button>
        ))}
      </div>
      <div className="activity-bar-bottom">
        <button
          className="activity-item"
          title="Settings"
          onClick={onSettingsClick}
        >
          <Settings size={24} />
        </button>
      </div>
    </div>
  );
}
