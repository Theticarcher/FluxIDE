import { useState, useEffect, useCallback } from "react";
import { Database, Key, Trash2, RefreshCw, ChevronRight, ChevronDown, Plus, Cookie } from "lucide-react";

interface StorageItem {
  key: string;
  value: string;
  size: number;
}

interface ApplicationTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function ApplicationTab({ iframeRef }: ApplicationTabProps) {
  const [activeSection, setActiveSection] = useState<"localStorage" | "sessionStorage" | "cookies">("localStorage");
  const [localStorageItems, setLocalStorageItems] = useState<StorageItem[]>([]);
  const [sessionStorageItems, setSessionStorageItems] = useState<StorageItem[]>([]);
  const [cookies, setCookies] = useState<StorageItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Storage"]));
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const loadStorage = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const iframeWindow = iframe.contentWindow as Window & typeof globalThis;

    // Load localStorage
    try {
      const localItems: StorageItem[] = [];
      for (let i = 0; i < iframeWindow.localStorage.length; i++) {
        const key = iframeWindow.localStorage.key(i);
        if (key) {
          const value = iframeWindow.localStorage.getItem(key) || "";
          localItems.push({
            key,
            value,
            size: new Blob([value]).size,
          });
        }
      }
      setLocalStorageItems(localItems);
    } catch {
      // localStorage not available
    }

    // Load sessionStorage
    try {
      const sessionItems: StorageItem[] = [];
      for (let i = 0; i < iframeWindow.sessionStorage.length; i++) {
        const key = iframeWindow.sessionStorage.key(i);
        if (key) {
          const value = iframeWindow.sessionStorage.getItem(key) || "";
          sessionItems.push({
            key,
            value,
            size: new Blob([value]).size,
          });
        }
      }
      setSessionStorageItems(sessionItems);
    } catch {
      // sessionStorage not available
    }

    // Load cookies
    try {
      const doc = iframe.contentDocument;
      if (doc) {
        const cookieItems: StorageItem[] = [];
        const cookieStr = doc.cookie;
        if (cookieStr) {
          cookieStr.split(";").forEach(cookie => {
            const [key, ...valueParts] = cookie.trim().split("=");
            const value = valueParts.join("=");
            if (key) {
              cookieItems.push({
                key: key.trim(),
                value: value || "",
                size: new Blob([cookie]).size,
              });
            }
          });
        }
        setCookies(cookieItems);
      }
    } catch {
      // cookies not available
    }
  }, [iframeRef]);

  useEffect(() => {
    loadStorage();
    const interval = setInterval(loadStorage, 2000);
    return () => clearInterval(interval);
  }, [loadStorage]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getActiveItems = () => {
    switch (activeSection) {
      case "localStorage": return localStorageItems;
      case "sessionStorage": return sessionStorageItems;
      case "cookies": return cookies;
    }
  };

  const deleteItem = (key: string) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const iframeWindow = iframe.contentWindow as Window & typeof globalThis;

    try {
      if (activeSection === "localStorage") {
        iframeWindow.localStorage.removeItem(key);
      } else if (activeSection === "sessionStorage") {
        iframeWindow.sessionStorage.removeItem(key);
      } else if (activeSection === "cookies") {
        const doc = iframe.contentDocument;
        if (doc) {
          doc.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      }
      loadStorage();
      if (selectedKey === key) {
        setSelectedKey(null);
      }
    } catch (e) {
      console.error("Failed to delete item:", e);
    }
  };

  const clearAll = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const iframeWindow = iframe.contentWindow as Window & typeof globalThis;

    try {
      if (activeSection === "localStorage") {
        iframeWindow.localStorage.clear();
      } else if (activeSection === "sessionStorage") {
        iframeWindow.sessionStorage.clear();
      } else if (activeSection === "cookies") {
        const doc = iframe.contentDocument;
        if (doc) {
          cookies.forEach(c => {
            doc.cookie = `${c.key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          });
        }
      }
      loadStorage();
      setSelectedKey(null);
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }
  };

  const startEditing = (key: string, value: string) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  const saveEdit = () => {
    if (!editingKey) return;

    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const iframeWindow = iframe.contentWindow as Window & typeof globalThis;

    try {
      if (activeSection === "localStorage") {
        iframeWindow.localStorage.setItem(editingKey, editingValue);
      } else if (activeSection === "sessionStorage") {
        iframeWindow.sessionStorage.setItem(editingKey, editingValue);
      }
      loadStorage();
      setEditingKey(null);
    } catch (e) {
      console.error("Failed to save:", e);
    }
  };

  const addNewItem = () => {
    const key = prompt("Enter key name:");
    if (!key) return;

    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const iframeWindow = iframe.contentWindow as Window & typeof globalThis;

    try {
      if (activeSection === "localStorage") {
        iframeWindow.localStorage.setItem(key, "");
      } else if (activeSection === "sessionStorage") {
        iframeWindow.sessionStorage.setItem(key, "");
      }
      loadStorage();
      setSelectedKey(key);
      startEditing(key, "");
    } catch (e) {
      console.error("Failed to add item:", e);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const selectedItem = getActiveItems().find(item => item.key === selectedKey);
  const totalSize = getActiveItems().reduce((sum, item) => sum + item.size, 0);

  return (
    <div className="application-tab">
      <div className="application-sidebar">
        <div className="sidebar-section">
          <div
            className="section-header"
            onClick={() => toggleSection("Storage")}
          >
            {expandedSections.has("Storage") ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Database size={14} />
            <span>Storage</span>
          </div>
          {expandedSections.has("Storage") && (
            <div className="section-items">
              <div
                className={`section-item ${activeSection === "localStorage" ? "active" : ""}`}
                onClick={() => { setActiveSection("localStorage"); setSelectedKey(null); }}
              >
                <Key size={12} />
                <span>Local Storage</span>
                <span className="item-count">{localStorageItems.length}</span>
              </div>
              <div
                className={`section-item ${activeSection === "sessionStorage" ? "active" : ""}`}
                onClick={() => { setActiveSection("sessionStorage"); setSelectedKey(null); }}
              >
                <Key size={12} />
                <span>Session Storage</span>
                <span className="item-count">{sessionStorageItems.length}</span>
              </div>
              <div
                className={`section-item ${activeSection === "cookies" ? "active" : ""}`}
                onClick={() => { setActiveSection("cookies"); setSelectedKey(null); }}
              >
                <Cookie size={12} />
                <span>Cookies</span>
                <span className="item-count">{cookies.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="application-content">
        <div className="content-toolbar">
          <span className="storage-title">
            {activeSection === "localStorage" && "Local Storage"}
            {activeSection === "sessionStorage" && "Session Storage"}
            {activeSection === "cookies" && "Cookies"}
          </span>
          <div className="toolbar-actions">
            <button className="toolbar-btn" onClick={loadStorage} title="Refresh">
              <RefreshCw size={12} />
            </button>
            {activeSection !== "cookies" && (
              <button className="toolbar-btn" onClick={addNewItem} title="Add item">
                <Plus size={12} />
              </button>
            )}
            <button className="toolbar-btn danger" onClick={clearAll} title="Clear all">
              <Trash2 size={12} />
            </button>
          </div>
          <span className="storage-stats">
            {getActiveItems().length} items, {formatBytes(totalSize)}
          </span>
        </div>

        <div className="storage-table-container">
          <div className="storage-table">
            <div className="table-header">
              <span className="col-key">Key</span>
              <span className="col-value">Value</span>
              <span className="col-size">Size</span>
              <span className="col-actions"></span>
            </div>
            <div className="table-body">
              {getActiveItems().length === 0 ? (
                <div className="empty-state">
                  <Database size={24} />
                  <p>No data stored</p>
                  <p className="hint">
                    {activeSection === "cookies"
                      ? "Cookies will appear here"
                      : "Click + to add an item"
                    }
                  </p>
                </div>
              ) : (
                getActiveItems().map(item => (
                  <div
                    key={item.key}
                    className={`table-row ${selectedKey === item.key ? "selected" : ""}`}
                    onClick={() => setSelectedKey(item.key)}
                  >
                    <span className="col-key" title={item.key}>{item.key}</span>
                    <span className="col-value" title={item.value}>
                      {item.value.length > 50 ? item.value.slice(0, 50) + "..." : item.value}
                    </span>
                    <span className="col-size">{formatBytes(item.size)}</span>
                    <span className="col-actions">
                      <button
                        className="action-btn danger"
                        onClick={(e) => { e.stopPropagation(); deleteItem(item.key); }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {selectedItem && (
          <div className="item-details">
            <div className="details-header">
              <span className="details-key">{selectedItem.key}</span>
              {activeSection !== "cookies" && (
                <button
                  className="toolbar-btn"
                  onClick={() => startEditing(selectedItem.key, selectedItem.value)}
                >
                  Edit
                </button>
              )}
            </div>
            {editingKey === selectedItem.key ? (
              <div className="edit-container">
                <textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="edit-textarea"
                />
                <div className="edit-actions">
                  <button className="toolbar-btn primary" onClick={saveEdit}>Save</button>
                  <button className="toolbar-btn" onClick={() => setEditingKey(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <pre className="details-value">{selectedItem.value}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
