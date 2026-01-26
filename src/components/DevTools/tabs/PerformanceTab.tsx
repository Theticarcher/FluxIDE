import { useState, useEffect, useCallback } from "react";
import { Play, Square, RefreshCw, Gauge, Clock, Zap, Eye, MousePointer } from "lucide-react";

interface WebVitals {
  lcp: number | null;  // Largest Contentful Paint
  fid: number | null;  // First Input Delay
  cls: number | null;  // Cumulative Layout Shift
  fcp: number | null;  // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null;  // Interaction to Next Paint
  domContentLoaded: number | null;
  load: number | null;
}

interface CustomPerformanceEntry {
  name: string;
  type: string;
  startTime: number;
  duration: number;
}

interface PerformanceTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function PerformanceTab({ iframeRef }: PerformanceTabProps) {
  const [vitals, setVitals] = useState<WebVitals>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
    domContentLoaded: null,
    load: null,
  });
  const [entries, setEntries] = useState<CustomPerformanceEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  const measureVitals = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const iframeWindow = iframe.contentWindow as Window & typeof globalThis;
    const perf = iframeWindow.performance;
    if (!perf) return;

    const newVitals: WebVitals = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null,
      inp: null,
      domContentLoaded: null,
      load: null,
    };

    // Navigation timing
    const navEntries = perf.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      newVitals.ttfb = nav.responseStart - nav.requestStart;
      newVitals.domContentLoaded = nav.domContentLoadedEventEnd - nav.startTime;
      newVitals.load = nav.loadEventEnd - nav.startTime;
    }

    // Paint timing
    const paintEntries = perf.getEntriesByType("paint");
    paintEntries.forEach(entry => {
      if (entry.name === "first-contentful-paint") {
        newVitals.fcp = entry.startTime;
      }
    });

    // LCP (if available)
    const lcpEntries = perf.getEntriesByType("largest-contentful-paint");
    if (lcpEntries.length > 0) {
      const lastLcp = lcpEntries[lcpEntries.length - 1];
      newVitals.lcp = lastLcp.startTime;
    }

    // CLS calculation
    let clsValue = 0;
    const layoutShiftEntries = perf.getEntriesByType("layout-shift") as unknown as { hadRecentInput?: boolean; value?: number }[];
    layoutShiftEntries.forEach(entry => {
      if (!entry.hadRecentInput && entry.value) {
        clsValue += entry.value;
      }
    });
    newVitals.cls = clsValue;

    // Collect all entries for timeline
    const allEntries: CustomPerformanceEntry[] = [];

    ["navigation", "resource", "paint", "mark", "measure"].forEach(type => {
      perf.getEntriesByType(type).forEach(entry => {
        allEntries.push({
          name: entry.name,
          type: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration,
        });
      });
    });

    setVitals(newVitals);
    setEntries(allEntries.sort((a, b) => a.startTime - b.startTime));
  }, [iframeRef]);

  useEffect(() => {
    measureVitals();

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", measureVitals);
      return () => iframe.removeEventListener("load", measureVitals);
    }
  }, [iframeRef, measureVitals]);

  // Continuous measurement during recording
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(measureVitals, 1000);
    return () => clearInterval(interval);
  }, [isRecording, measureVitals]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingStartTime(Date.now());
    setEntries([]);
  };

  const stopRecording = () => {
    setIsRecording(false);
    measureVitals();
  };

  const getVitalRating = (metric: string, value: number | null): "good" | "needs-improvement" | "poor" | "unknown" => {
    if (value === null) return "unknown";

    const thresholds: Record<string, [number, number]> = {
      lcp: [2500, 4000],
      fid: [100, 300],
      cls: [0.1, 0.25],
      fcp: [1800, 3000],
      ttfb: [800, 1800],
      inp: [200, 500],
    };

    const [good, poor] = thresholds[metric] || [Infinity, Infinity];
    if (value <= good) return "good";
    if (value <= poor) return "needs-improvement";
    return "poor";
  };

  const formatMetric = (value: number | null, unit: string = "ms") => {
    if (value === null) return "-";
    if (unit === "ms") return `${value.toFixed(0)} ms`;
    if (unit === "s") return `${(value / 1000).toFixed(2)} s`;
    return value.toFixed(3);
  };

  const vitalsConfig = [
    { key: "lcp", name: "LCP", fullName: "Largest Contentful Paint", icon: Eye, unit: "ms", description: "Time until largest content element is visible" },
    { key: "fcp", name: "FCP", fullName: "First Contentful Paint", icon: Zap, unit: "ms", description: "Time until first content is painted" },
    { key: "cls", name: "CLS", fullName: "Cumulative Layout Shift", icon: MousePointer, unit: "", description: "Visual stability score (lower is better)" },
    { key: "inp", name: "INP", fullName: "Interaction to Next Paint", icon: MousePointer, unit: "ms", description: "Responsiveness to user interactions" },
    { key: "ttfb", name: "TTFB", fullName: "Time to First Byte", icon: Clock, unit: "ms", description: "Server response time" },
    { key: "fid", name: "FID", fullName: "First Input Delay", icon: Zap, unit: "ms", description: "Time until page is interactive" },
  ];

  return (
    <div className="performance-tab">
      <div className="performance-toolbar">
        {!isRecording ? (
          <button className="toolbar-btn primary" onClick={startRecording}>
            <Play size={12} /> Record
          </button>
        ) : (
          <button className="toolbar-btn danger" onClick={stopRecording}>
            <Square size={12} /> Stop
          </button>
        )}
        <button className="toolbar-btn" onClick={measureVitals} title="Refresh metrics">
          <RefreshCw size={12} />
        </button>
        {isRecording && (
          <span className="recording-indicator">
            <span className="recording-dot" />
            Recording... {recordingStartTime && `${((Date.now() - recordingStartTime) / 1000).toFixed(1)}s`}
          </span>
        )}
      </div>

      <div className="performance-content">
        <div className="vitals-section">
          <h3><Gauge size={16} /> Core Web Vitals</h3>
          <div className="vitals-grid">
            {vitalsConfig.map(({ key, name, fullName, icon: Icon, unit, description }) => {
              const value = vitals[key as keyof WebVitals];
              const rating = getVitalRating(key, value);

              return (
                <div key={key} className={`vital-card ${rating}`}>
                  <div className="vital-header">
                    <Icon size={16} />
                    <span className="vital-name">{name}</span>
                  </div>
                  <div className="vital-value">
                    {formatMetric(value, unit)}
                  </div>
                  <div className="vital-fullname">{fullName}</div>
                  <div className="vital-description">{description}</div>
                  <div className={`vital-rating ${rating}`}>
                    {rating === "good" && "Good"}
                    {rating === "needs-improvement" && "Needs Improvement"}
                    {rating === "poor" && "Poor"}
                    {rating === "unknown" && "No data"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="timing-section">
          <h3><Clock size={16} /> Page Load Timing</h3>
          <div className="timing-bar">
            <div className="timing-segment ttfb" style={{ width: `${Math.min((vitals.ttfb || 0) / (vitals.load || 1) * 100, 100)}%` }}>
              <span>TTFB: {formatMetric(vitals.ttfb)}</span>
            </div>
            <div className="timing-segment fcp" style={{ width: `${Math.min(((vitals.fcp || 0) - (vitals.ttfb || 0)) / (vitals.load || 1) * 100, 100)}%` }}>
              <span>FCP: {formatMetric(vitals.fcp)}</span>
            </div>
            <div className="timing-segment lcp" style={{ width: `${Math.min(((vitals.lcp || 0) - (vitals.fcp || 0)) / (vitals.load || 1) * 100, 100)}%` }}>
              <span>LCP: {formatMetric(vitals.lcp)}</span>
            </div>
            <div className="timing-segment load" style={{ flex: 1 }}>
              <span>Load: {formatMetric(vitals.load)}</span>
            </div>
          </div>
        </div>

        <div className="entries-section">
          <h3>Performance Entries ({entries.length})</h3>
          <div className="entries-table">
            <div className="entries-header">
              <span className="col-name">Name</span>
              <span className="col-type">Type</span>
              <span className="col-start">Start</span>
              <span className="col-duration">Duration</span>
            </div>
            <div className="entries-body">
              {entries.slice(0, 50).map((entry, i) => (
                <div key={i} className={`entry-row ${entry.type}`}>
                  <span className="col-name" title={entry.name}>
                    {entry.name.length > 50 ? entry.name.slice(-50) : entry.name}
                  </span>
                  <span className="col-type">{entry.type}</span>
                  <span className="col-start">{entry.startTime.toFixed(1)} ms</span>
                  <span className="col-duration">{entry.duration.toFixed(1)} ms</span>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="empty-state">
                  <p>No performance entries</p>
                  <p className="hint">Click Record to capture performance data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
