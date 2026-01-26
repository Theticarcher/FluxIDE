import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Camera, Trash2, HardDrive, Cpu, TrendingUp } from "lucide-react";

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface HeapSnapshot {
  id: number;
  timestamp: Date;
  usedHeap: number;
  totalHeap: number;
  domNodes: number;
  eventListeners: number;
}

interface MemoryTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function MemoryTab({ iframeRef }: MemoryTabProps) {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [snapshots, setSnapshots] = useState<HeapSnapshot[]>([]);
  const [domNodeCount, setDomNodeCount] = useState<number>(0);
  const [eventListenerCount, setEventListenerCount] = useState<number>(0);
  const [memoryHistory, setMemoryHistory] = useState<{ time: number; heap: number }[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const measureMemory = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const iframeWindow = iframe.contentWindow as Window & typeof globalThis & { performance: Performance & { memory?: MemoryInfo } };

    // Memory info (Chrome only)
    if (iframeWindow.performance?.memory) {
      const memory = iframeWindow.performance.memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      });

      if (isMonitoring) {
        setMemoryHistory(prev => [
          ...prev.slice(-59),
          { time: Date.now(), heap: memory.usedJSHeapSize }
        ]);
      }
    }

    // DOM node count
    const doc = iframe.contentDocument;
    if (doc) {
      const allNodes = doc.querySelectorAll("*");
      setDomNodeCount(allNodes.length);

      // Estimate event listeners (count elements with on* attributes)
      let listeners = 0;
      allNodes.forEach(node => {
        for (const attr of Array.from(node.attributes)) {
          if (attr.name.startsWith("on")) {
            listeners++;
          }
        }
      });
      setEventListenerCount(listeners);
    }
  }, [iframeRef, isMonitoring]);

  useEffect(() => {
    measureMemory();
    const interval = setInterval(measureMemory, isMonitoring ? 1000 : 5000);
    return () => clearInterval(interval);
  }, [measureMemory, isMonitoring]);

  const takeSnapshot = () => {
    const newSnapshot: HeapSnapshot = {
      id: Date.now(),
      timestamp: new Date(),
      usedHeap: memoryInfo?.usedJSHeapSize || 0,
      totalHeap: memoryInfo?.totalJSHeapSize || 0,
      domNodes: domNodeCount,
      eventListeners: eventListenerCount,
    };
    setSnapshots(prev => [...prev, newSnapshot]);
  };

  const clearSnapshots = () => {
    setSnapshots([]);
    setMemoryHistory([]);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const heapUsagePercent = memoryInfo
    ? (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
    : 0;

  const getUsageClass = (percent: number) => {
    if (percent < 50) return "good";
    if (percent < 80) return "warning";
    return "danger";
  };

  // Calculate memory graph
  const maxHeap = Math.max(...memoryHistory.map(h => h.heap), 1);
  const graphPoints = memoryHistory.map((h, i) => {
    const x = (i / 59) * 100;
    const y = 100 - (h.heap / maxHeap) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="memory-tab">
      <div className="memory-toolbar">
        <button className="toolbar-btn" onClick={measureMemory} title="Refresh">
          <RefreshCw size={12} />
        </button>
        <button className="toolbar-btn primary" onClick={takeSnapshot} title="Take heap snapshot">
          <Camera size={12} /> Snapshot
        </button>
        <button className="toolbar-btn" onClick={clearSnapshots} title="Clear">
          <Trash2 size={12} />
        </button>
        <label className="monitor-toggle">
          <input
            type="checkbox"
            checked={isMonitoring}
            onChange={(e) => setIsMonitoring(e.target.checked)}
          />
          <span>Live monitoring</span>
        </label>
      </div>

      <div className="memory-content">
        <div className="memory-overview">
          <div className="memory-card">
            <div className="card-header">
              <HardDrive size={16} />
              <span>JS Heap</span>
            </div>
            {memoryInfo ? (
              <>
                <div className="heap-bar">
                  <div
                    className={`heap-used ${getUsageClass(heapUsagePercent)}`}
                    style={{ width: `${heapUsagePercent}%` }}
                  />
                </div>
                <div className="heap-stats">
                  <span>Used: {formatBytes(memoryInfo.usedJSHeapSize)}</span>
                  <span>Total: {formatBytes(memoryInfo.totalJSHeapSize)}</span>
                  <span>Limit: {formatBytes(memoryInfo.jsHeapSizeLimit)}</span>
                </div>
              </>
            ) : (
              <div className="no-data">Memory API not available</div>
            )}
          </div>

          <div className="memory-card">
            <div className="card-header">
              <Cpu size={16} />
              <span>DOM Stats</span>
            </div>
            <div className="dom-stats">
              <div className="stat-item">
                <span className="stat-value">{domNodeCount.toLocaleString()}</span>
                <span className="stat-label">DOM Nodes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{eventListenerCount.toLocaleString()}</span>
                <span className="stat-label">Event Listeners</span>
              </div>
            </div>
          </div>
        </div>

        {isMonitoring && memoryHistory.length > 1 && (
          <div className="memory-graph">
            <div className="graph-header">
              <TrendingUp size={14} />
              <span>Heap Usage Over Time</span>
            </div>
            <svg viewBox="0 0 100 100" className="graph-svg" preserveAspectRatio="none">
              <polyline
                points={graphPoints}
                fill="none"
                stroke="var(--accent-color)"
                strokeWidth="1"
              />
            </svg>
            <div className="graph-labels">
              <span>0</span>
              <span>{formatBytes(maxHeap)}</span>
            </div>
          </div>
        )}

        <div className="snapshots-section">
          <h3>Heap Snapshots ({snapshots.length})</h3>
          {snapshots.length === 0 ? (
            <div className="empty-state">
              <Camera size={24} />
              <p>No snapshots</p>
              <p className="hint">Click "Snapshot" to capture memory state</p>
            </div>
          ) : (
            <div className="snapshots-table">
              <div className="snapshots-header">
                <span className="col-time">Time</span>
                <span className="col-heap">Used Heap</span>
                <span className="col-total">Total Heap</span>
                <span className="col-nodes">DOM Nodes</span>
                <span className="col-listeners">Listeners</span>
              </div>
              {snapshots.map((snapshot, i) => {
                const prevSnapshot = snapshots[i - 1];
                const heapDiff = prevSnapshot
                  ? snapshot.usedHeap - prevSnapshot.usedHeap
                  : 0;

                return (
                  <div key={snapshot.id} className="snapshot-row">
                    <span className="col-time">
                      {snapshot.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="col-heap">
                      {formatBytes(snapshot.usedHeap)}
                      {heapDiff !== 0 && (
                        <span className={heapDiff > 0 ? "diff-up" : "diff-down"}>
                          {heapDiff > 0 ? "+" : ""}{formatBytes(Math.abs(heapDiff))}
                        </span>
                      )}
                    </span>
                    <span className="col-total">{formatBytes(snapshot.totalHeap)}</span>
                    <span className="col-nodes">{snapshot.domNodes}</span>
                    <span className="col-listeners">{snapshot.eventListeners}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
