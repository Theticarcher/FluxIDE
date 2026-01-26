import { type ReactNode, useRef, useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  const tabsWrapperRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const wrapper = tabsWrapperRef.current;
    if (wrapper) {
      setCanScrollLeft(wrapper.scrollLeft > 0);
      setCanScrollRight(
        wrapper.scrollLeft < wrapper.scrollWidth - wrapper.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScroll();
    const wrapper = tabsWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);

      // Handle mouse wheel scrolling horizontally
      const handleWheel = (e: WheelEvent) => {
        if (wrapper.scrollWidth > wrapper.clientWidth) {
          e.preventDefault();
          wrapper.scrollLeft += e.deltaY;
          checkScroll();
        }
      };

      wrapper.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        wrapper.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        wrapper.removeEventListener("wheel", handleWheel);
      };
    }
  }, []);

  const scrollTabs = (direction: "left" | "right") => {
    const wrapper = tabsWrapperRef.current;
    if (wrapper) {
      const scrollAmount = 150;
      wrapper.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`panel ${isCollapsed ? "collapsed" : ""}`}>
      <div className="panel-header">
        {canScrollLeft && (
          <button
            className="panel-scroll-btn panel-scroll-left"
            onClick={() => scrollTabs("left")}
            title="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <div className="panel-tabs-wrapper" ref={tabsWrapperRef}>
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
        {canScrollRight && (
          <button
            className="panel-scroll-btn panel-scroll-right"
            onClick={() => scrollTabs("right")}
            title="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}
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
