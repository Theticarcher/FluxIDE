import { useState } from "react";
import {
  Code2,
  Terminal,
  FileCode,
  Network,
  Gauge,
  HardDrive,
  Database,
  Shield,
  Zap,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ElementsTab,
  ConsoleTab,
  SourcesTab,
  NetworkTab,
  PerformanceTab,
  MemoryTab,
  ApplicationTab,
  SecurityTab,
  FluxScoreTab,
  RecorderTab,
} from "./tabs";
import "./DevTools.css";

type DevToolsTab =
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

interface DevToolsProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isVisible: boolean;
  onClose: () => void;
  compiledHtml?: string | null;
  compiledCss?: string | null;
  compiledJs?: string | null;
}

const tabs: { id: DevToolsTab; label: string; icon: typeof Code2 }[] = [
  { id: "elements", label: "Elements", icon: Code2 },
  { id: "console", label: "Console", icon: Terminal },
  { id: "sources", label: "Sources", icon: FileCode },
  { id: "network", label: "Network", icon: Network },
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "memory", label: "Memory", icon: HardDrive },
  { id: "application", label: "Application", icon: Database },
  { id: "security", label: "Security", icon: Shield },
  { id: "fluxscore", label: "FluxScore", icon: Zap },
  { id: "recorder", label: "Recorder", icon: Video },
];

export function DevTools({
  iframeRef,
  isVisible,
  onClose,
  compiledHtml,
  compiledCss,
  compiledJs,
}: DevToolsProps) {
  const [activeTab, setActiveTab] = useState<DevToolsTab>("elements");
  const [tabScrollOffset, setTabScrollOffset] = useState(0);

  if (!isVisible) return null;

  const scrollTabs = (direction: "left" | "right") => {
    setTabScrollOffset(prev => {
      const maxOffset = Math.max(0, tabs.length * 90 - 500);
      if (direction === "left") {
        return Math.max(0, prev - 180);
      } else {
        return Math.min(maxOffset, prev + 180);
      }
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "elements":
        return <ElementsTab iframeRef={iframeRef} />;
      case "console":
        return <ConsoleTab iframeRef={iframeRef} />;
      case "sources":
        return (
          <SourcesTab
            iframeRef={iframeRef}
            compiledHtml={compiledHtml}
            compiledCss={compiledCss}
            compiledJs={compiledJs}
          />
        );
      case "network":
        return <NetworkTab iframeRef={iframeRef} />;
      case "performance":
        return <PerformanceTab iframeRef={iframeRef} />;
      case "memory":
        return <MemoryTab iframeRef={iframeRef} />;
      case "application":
        return <ApplicationTab iframeRef={iframeRef} />;
      case "security":
        return <SecurityTab iframeRef={iframeRef} />;
      case "fluxscore":
        return <FluxScoreTab iframeRef={iframeRef} />;
      case "recorder":
        return <RecorderTab iframeRef={iframeRef} />;
      default:
        return null;
    }
  };

  return (
    <div className="devtools">
      <div className="devtools-header">
        <button
          className="tab-scroll-btn"
          onClick={() => scrollTabs("left")}
          disabled={tabScrollOffset === 0}
        >
          <ChevronLeft size={14} />
        </button>
        <div className="devtools-tabs-container">
          <div
            className="devtools-tabs"
            style={{ transform: `translateX(-${tabScrollOffset}px)` }}
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`devtools-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          className="tab-scroll-btn"
          onClick={() => scrollTabs("right")}
        >
          <ChevronRight size={14} />
        </button>
        <div className="devtools-actions">
          <button className="devtools-action" onClick={onClose} title="Close DevTools">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="devtools-content">
        {renderTabContent()}
      </div>
    </div>
  );
}
