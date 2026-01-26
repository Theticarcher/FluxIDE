import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Filter, Globe } from "lucide-react";

interface NetworkRequest {
  id: number;
  method: string;
  url: string;
  status: number | null;
  statusText: string;
  type: string;
  size: number | null;
  time: number | null;
  startTime: number;
  headers: Record<string, string>;
  responseHeaders: Record<string, string>;
  initiator: string;
  responseBody?: string;
}

interface NetworkTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function NetworkTab({ iframeRef }: NetworkTabProps) {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const requestIdRef = useRef(0);

  const addRequest = useCallback((request: Omit<NetworkRequest, "id">) => {
    const newRequest = { ...request, id: ++requestIdRef.current };
    setRequests(prev => [...prev, newRequest]);
    return newRequest.id;
  }, []);

  const updateRequest = useCallback((id: number, updates: Partial<NetworkRequest>) => {
    setRequests(prev => prev.map(req =>
      req.id === id ? { ...req, ...updates } : req
    ));
  }, []);

  // Hook into iframe network requests
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const setupNetworkHooks = () => {
      const iframeWindow = iframe.contentWindow as (Window & typeof globalThis) | null;
      if (!iframeWindow) return;

      // Intercept fetch
      const originalFetch = iframeWindow.fetch;
      iframeWindow.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const method = init?.method || "GET";
        const startTime = performance.now();

        const requestId = addRequest({
          method,
          url,
          status: null,
          statusText: "",
          type: "fetch",
          size: null,
          time: null,
          startTime,
          headers: init?.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {},
          responseHeaders: {},
          initiator: "fetch",
        });

        try {
          const response = await originalFetch.call(iframeWindow, input, init);
          const endTime = performance.now();

          // Clone to read body
          const clone = response.clone();
          let responseBody: string | undefined;
          let size: number | null = null;

          try {
            const text = await clone.text();
            responseBody = text.slice(0, 10000); // Limit preview
            size = text.length;
          } catch {
            // Ignore body read errors
          }

          updateRequest(requestId, {
            status: response.status,
            statusText: response.statusText,
            time: endTime - startTime,
            size,
            responseHeaders: Object.fromEntries(response.headers.entries()),
            responseBody,
          });

          return response;
        } catch (error) {
          updateRequest(requestId, {
            status: 0,
            statusText: "Failed",
            time: performance.now() - startTime,
          });
          throw error;
        }
      };

      // Intercept XMLHttpRequest
      const OriginalXHR = iframeWindow.XMLHttpRequest;
      iframeWindow.XMLHttpRequest = class extends OriginalXHR {
        private _requestId: number | null = null;
        private _method: string = "GET";
        private _url: string = "";
        private _startTime: number = 0;

        open(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
          this._method = method;
          this._url = typeof url === "string" ? url : url.href;
          return super.open(method, url, async ?? true, username, password);
        }

        send(body?: Document | XMLHttpRequestBodyInit | null) {
          this._startTime = performance.now();
          this._requestId = addRequest({
            method: this._method,
            url: this._url,
            status: null,
            statusText: "",
            type: "xhr",
            size: null,
            time: null,
            startTime: this._startTime,
            headers: {},
            responseHeaders: {},
            initiator: "XMLHttpRequest",
          });

          this.addEventListener("load", () => {
            if (this._requestId) {
              updateRequest(this._requestId, {
                status: this.status,
                statusText: this.statusText,
                time: performance.now() - this._startTime,
                size: this.responseText?.length || null,
                responseBody: this.responseText?.slice(0, 10000),
              });
            }
          });

          this.addEventListener("error", () => {
            if (this._requestId) {
              updateRequest(this._requestId, {
                status: 0,
                statusText: "Error",
                time: performance.now() - this._startTime,
              });
            }
          });

          return super.send(body);
        }
      } as typeof XMLHttpRequest;

      return () => {
        if (iframeWindow) {
          iframeWindow.fetch = originalFetch;
          iframeWindow.XMLHttpRequest = OriginalXHR;
        }
      };
    };

    const cleanup = setupNetworkHooks();
    iframe.addEventListener("load", () => {
      setRequests([]);
      setupNetworkHooks();
    });

    return cleanup;
  }, [iframeRef, addRequest, updateRequest]);

  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
  };

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ms: number | null) => {
    if (ms === null) return "pending";
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const getStatusClass = (status: number | null) => {
    if (status === null) return "pending";
    if (status === 0) return "error";
    if (status >= 400) return "error";
    if (status >= 300) return "redirect";
    return "success";
  };

  const filteredRequests = requests.filter(req => {
    if (filter !== "all" && req.type !== filter) return false;
    if (searchQuery && !req.url.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalSize = requests.reduce((sum, req) => sum + (req.size || 0), 0);
  const totalTime = requests.length > 0
    ? Math.max(...requests.map(r => (r.time || 0)))
    : 0;

  return (
    <div className="network-tab">
      <div className="network-toolbar">
        <button className="toolbar-btn" onClick={clearRequests} title="Clear">
          <Trash2 size={12} />
        </button>
        <div className="filter-group">
          <Filter size={12} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="fetch">Fetch</option>
            <option value="xhr">XHR</option>
            <option value="doc">Document</option>
            <option value="css">CSS</option>
            <option value="js">JS</option>
            <option value="img">Images</option>
          </select>
        </div>
        <input
          type="text"
          className="network-search"
          placeholder="Filter URLs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="network-stats">
          <span>{requests.length} requests</span>
          <span>{formatSize(totalSize)} transferred</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>

      <div className="network-content">
        <div className="network-table-container">
          <div className="network-header">
            <span className="col-status">Status</span>
            <span className="col-method">Method</span>
            <span className="col-name">Name</span>
            <span className="col-type">Type</span>
            <span className="col-size">Size</span>
            <span className="col-time">Time</span>
          </div>
          <div className="network-rows">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <Globe size={24} />
                <p>No network activity</p>
                <p className="hint">Network requests will appear here</p>
              </div>
            ) : (
              filteredRequests.map(req => (
                <div
                  key={req.id}
                  className={`network-row ${getStatusClass(req.status)} ${selectedRequest?.id === req.id ? "selected" : ""}`}
                  onClick={() => setSelectedRequest(req)}
                >
                  <span className={`col-status ${getStatusClass(req.status)}`}>
                    {req.status === null ? "..." : req.status === 0 ? "Failed" : req.status}
                  </span>
                  <span className="col-method">{req.method}</span>
                  <span className="col-name" title={req.url}>
                    {req.url.split("/").pop() || req.url}
                  </span>
                  <span className="col-type">{req.type}</span>
                  <span className="col-size">{formatSize(req.size)}</span>
                  <span className="col-time">{formatTime(req.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedRequest && (
          <div className="request-details">
            <div className="details-header">
              <span className="details-title">{selectedRequest.url}</span>
              <button className="toolbar-btn" onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <div className="details-tabs">
              <div className="details-section">
                <h4>General</h4>
                <div className="details-grid">
                  <span className="label">Request URL:</span>
                  <span className="value">{selectedRequest.url}</span>
                  <span className="label">Request Method:</span>
                  <span className="value">{selectedRequest.method}</span>
                  <span className="label">Status Code:</span>
                  <span className={`value ${getStatusClass(selectedRequest.status)}`}>
                    {selectedRequest.status} {selectedRequest.statusText}
                  </span>
                </div>
              </div>
              {Object.keys(selectedRequest.responseHeaders).length > 0 && (
                <div className="details-section">
                  <h4>Response Headers</h4>
                  <div className="details-grid">
                    {Object.entries(selectedRequest.responseHeaders).map(([key, value]) => (
                      <>
                        <span key={`${key}-label`} className="label">{key}:</span>
                        <span key={`${key}-value`} className="value">{value}</span>
                      </>
                    ))}
                  </div>
                </div>
              )}
              {selectedRequest.responseBody && (
                <div className="details-section">
                  <h4>Response Preview</h4>
                  <pre className="response-preview">{selectedRequest.responseBody}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
