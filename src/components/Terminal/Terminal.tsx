import { useEffect, useRef, useCallback } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { useTerminal } from "../../hooks/useTerminal";
import { useTerminalStore } from "../../stores/terminal-store";
import "xterm/css/xterm.css";
import "./Terminal.css";

interface TerminalProps {
  sessionId: string;
  isActive: boolean;
}

export function Terminal({ sessionId, isActive }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { writeToTerminal, resizeTerminal, onTerminalOutput, onTerminalClosed } =
    useTerminal();

  // Initialize the terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 13,
      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
      theme: {
        background: "#1e1e1e",
        foreground: "#cccccc",
        cursor: "#cccccc",
        cursorAccent: "#1e1e1e",
        selectionBackground: "#264f78",
        selectionForeground: "#ffffff",
        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#ffffff",
      },
      allowTransparency: false,
      scrollback: 10000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Handle user input
    xterm.onData((data) => {
      writeToTerminal(sessionId, data);
    });

    // Resize the PTY when terminal resizes
    xterm.onResize(({ cols, rows }) => {
      resizeTerminal(sessionId, cols, rows);
    });

    // Initial resize
    const { cols, rows } = xterm;
    resizeTerminal(sessionId, cols, rows);

    return () => {
      xterm.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId, writeToTerminal, resizeTerminal]);

  // Listen for output from the backend
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    onTerminalOutput((output) => {
      if (output.id === sessionId && xtermRef.current) {
        xtermRef.current.write(output.data);
      }
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [sessionId, onTerminalOutput]);

  // Listen for terminal closed events
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    onTerminalClosed((id) => {
      if (id === sessionId) {
        // Terminal was closed from backend
        console.log("Terminal closed:", id);
      }
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [sessionId, onTerminalClosed]);

  // Handle resize when visibility changes or container size changes
  const handleResize = useCallback(() => {
    if (fitAddonRef.current && xtermRef.current && isActive) {
      try {
        fitAddonRef.current.fit();
      } catch {
        // Ignore fit errors
      }
    }
  }, [isActive]);

  // Resize when becoming active
  useEffect(() => {
    if (isActive) {
      // Small delay to ensure container is visible
      const timer = setTimeout(handleResize, 50);
      return () => clearTimeout(timer);
    }
  }, [isActive, handleResize]);

  // Resize observer for container
  useEffect(() => {
    if (!terminalRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Focus terminal when active
  useEffect(() => {
    if (isActive && xtermRef.current) {
      xtermRef.current.focus();
    }
  }, [isActive]);

  return (
    <div
      className={`terminal-wrapper ${isActive ? "active" : ""}`}
      ref={terminalRef}
    />
  );
}

// Terminal tabs component
interface TerminalTabsProps {
  onNewTerminal: () => void;
}

export function TerminalTabs({ onNewTerminal }: TerminalTabsProps) {
  const { sessions, activeSessionId, setActiveSession } = useTerminalStore();
  const { closeTerminal } = useTerminal();

  const handleClose = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await closeTerminal(id);
  };

  return (
    <div className="terminal-tabs">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`terminal-tab ${
            activeSessionId === session.id ? "active" : ""
          }`}
          onClick={() => setActiveSession(session.id)}
        >
          <span className="terminal-tab-name">{session.name}</span>
          <button
            className="terminal-tab-close"
            onClick={(e) => handleClose(session.id, e)}
            title="Close terminal"
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="terminal-new-btn"
        onClick={onNewTerminal}
        title="New terminal"
      >
        +
      </button>
    </div>
  );
}

// Container that manages multiple terminals
interface TerminalContainerProps {
  cwd?: string;
}

export function TerminalContainer({ cwd }: TerminalContainerProps) {
  const { sessions, activeSessionId } = useTerminalStore();
  const { spawnTerminal } = useTerminal();

  const handleNewTerminal = async () => {
    await spawnTerminal(cwd);
  };

  // Auto-spawn a terminal if there are none
  useEffect(() => {
    if (sessions.length === 0) {
      spawnTerminal(cwd);
    }
  }, []); // Only on mount

  return (
    <div className="terminal-container">
      <TerminalTabs onNewTerminal={handleNewTerminal} />
      <div className="terminal-content">
        {sessions.map((session) => (
          <Terminal
            key={session.id}
            sessionId={session.id}
            isActive={session.id === activeSessionId}
          />
        ))}
        {sessions.length === 0 && (
          <div className="terminal-empty">
            <p>No terminal sessions</p>
            <button onClick={handleNewTerminal}>Create Terminal</button>
          </div>
        )}
      </div>
    </div>
  );
}
