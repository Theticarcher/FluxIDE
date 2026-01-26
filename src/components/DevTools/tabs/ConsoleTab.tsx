import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Filter, AlertCircle, AlertTriangle, Info, ChevronRight } from "lucide-react";

export interface ConsoleMessage {
  id: number;
  type: "log" | "warn" | "error" | "info" | "debug" | "table" | "group" | "groupEnd";
  message: string;
  timestamp: Date;
  stack?: string;
  count?: number;
}

interface ConsoleTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function ConsoleTab({ iframeRef }: ConsoleTabProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const messageIdRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((type: ConsoleMessage["type"], args: unknown[], stack?: string) => {
    const message = args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    setMessages((prev) => {
      // Group similar consecutive messages
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.message === message && lastMsg.type === type) {
        return prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, count: (msg.count || 1) + 1 } : msg
        );
      }

      return [
        ...prev,
        {
          id: ++messageIdRef.current,
          type,
          message,
          timestamp: new Date(),
          stack,
          count: 1,
        },
      ];
    });
  }, []);

  // Hook into iframe console
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const setupConsole = () => {
      const iframeWindow = iframe.contentWindow as (Window & typeof globalThis) | null;
      if (!iframeWindow) return;

      const originalConsole = {
        log: iframeWindow.console.log,
        warn: iframeWindow.console.warn,
        error: iframeWindow.console.error,
        info: iframeWindow.console.info,
        debug: iframeWindow.console.debug,
        table: iframeWindow.console.table,
        group: iframeWindow.console.group,
        groupEnd: iframeWindow.console.groupEnd,
        clear: iframeWindow.console.clear,
      };

      iframeWindow.console.log = (...args: unknown[]) => {
        originalConsole.log.apply(iframeWindow.console, args);
        addMessage("log", args);
      };

      iframeWindow.console.warn = (...args: unknown[]) => {
        originalConsole.warn.apply(iframeWindow.console, args);
        addMessage("warn", args);
      };

      iframeWindow.console.error = (...args: unknown[]) => {
        originalConsole.error.apply(iframeWindow.console, args);
        const stack = new Error().stack;
        addMessage("error", args, stack);
      };

      iframeWindow.console.info = (...args: unknown[]) => {
        originalConsole.info.apply(iframeWindow.console, args);
        addMessage("info", args);
      };

      iframeWindow.console.debug = (...args: unknown[]) => {
        originalConsole.debug.apply(iframeWindow.console, args);
        addMessage("debug", args);
      };

      iframeWindow.console.table = (data: unknown) => {
        originalConsole.table.call(iframeWindow.console, data);
        addMessage("table", [data]);
      };

      iframeWindow.console.clear = () => {
        originalConsole.clear.call(iframeWindow.console);
        setMessages([]);
      };

      // Error handling
      iframeWindow.onerror = (message, source, lineno, colno, error) => {
        addMessage("error", [`${message}`], error?.stack || `at ${source}:${lineno}:${colno}`);
      };

      iframeWindow.onunhandledrejection = (event) => {
        addMessage("error", [`Unhandled Promise Rejection: ${event.reason}`]);
      };

      return () => {
        if (iframeWindow && iframeWindow.console) {
          Object.assign(iframeWindow.console, originalConsole);
        }
      };
    };

    const cleanup = setupConsole();
    iframe.addEventListener("load", () => {
      setMessages([]);
      setupConsole();
    });

    return cleanup;
  }, [iframeRef, addMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const executeCommand = () => {
    if (!inputValue.trim()) return;

    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    // Add to history
    setCommandHistory(prev => [...prev, inputValue]);
    setHistoryIndex(-1);

    // Log the command
    addMessage("log", [`> ${inputValue}`]);

    try {
      // Execute in iframe context
      const result = (iframe.contentWindow as Window & typeof globalThis).eval(inputValue);
      if (result !== undefined) {
        addMessage("log", [result]);
      }
    } catch (error) {
      addMessage("error", [String(error)]);
    }

    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else {
        setHistoryIndex(-1);
        setInputValue("");
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertCircle size={12} className="msg-icon error" />;
      case "warn": return <AlertTriangle size={12} className="msg-icon warn" />;
      case "info": return <Info size={12} className="msg-icon info" />;
      default: return <ChevronRight size={12} className="msg-icon" />;
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter !== "all" && msg.type !== filter) return false;
    if (searchQuery && !msg.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const errorCount = messages.filter(m => m.type === "error").length;
  const warnCount = messages.filter(m => m.type === "warn").length;

  return (
    <div className="console-tab">
      <div className="console-toolbar">
        <button className="toolbar-btn" onClick={() => setMessages([])} title="Clear console">
          <Trash2 size={12} />
        </button>
        <div className="filter-group">
          <Filter size={12} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All levels</option>
            <option value="error">Errors ({errorCount})</option>
            <option value="warn">Warnings ({warnCount})</option>
            <option value="info">Info</option>
            <option value="log">Log</option>
            <option value="debug">Debug</option>
          </select>
        </div>
        <input
          type="text"
          className="console-search"
          placeholder="Filter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="console-stats">
          {errorCount > 0 && <span className="stat error">{errorCount} errors</span>}
          {warnCount > 0 && <span className="stat warn">{warnCount} warnings</span>}
        </div>
      </div>
      <div className="console-messages">
        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <p>No console output</p>
            <p className="hint">Console messages from the preview will appear here</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} className={`console-message ${msg.type}`}>
              {getIcon(msg.type)}
              <span className="console-time">
                {msg.timestamp.toLocaleTimeString()}
              </span>
              <pre className="console-text">{msg.message}</pre>
              {msg.count && msg.count > 1 && (
                <span className="msg-count">{msg.count}</span>
              )}
              {msg.stack && (
                <details className="stack-trace">
                  <summary>Stack trace</summary>
                  <pre>{msg.stack}</pre>
                </details>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="console-input-container">
        <ChevronRight size={12} className="input-prompt" />
        <input
          type="text"
          className="console-input"
          placeholder="Execute JavaScript..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
