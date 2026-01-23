import { type ReactNode } from "react";
import "./Sidebar.css";

interface SidebarProps {
  title: string;
  children: ReactNode;
}

export function Sidebar({ title, children }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">{title}</span>
      </div>
      <div className="sidebar-content">{children}</div>
    </div>
  );
}
