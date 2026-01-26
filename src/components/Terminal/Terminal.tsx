import { useEffect, useRef, useCallback } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useTerminalStore } from "../../stores/terminal-store";
import { useThemeStore } from "../../stores/theme-store";
import "xterm/css/xterm.css";
import "./Terminal.css";

interface TerminalOutput {
  id: string;
  data: number[];
}

interface TerminalProps {
  sessionId: string;
  isActive: boolean;
}

export function Terminal({ sessionId, isActive }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const initializedRef = useRef(false);
  const cleanedUpRef = useRef(false);

  // Get theme settings from store
  const { currentTheme, terminalFontSize, terminalFontFamily } = useThemeStore();

  // Initialize the terminal - only once
  useEffect(() => {
    if (!terminalRef.current || initializedRef.current) return;
    initializedRef.current = true;
    cleanedUpRef.current = false;

    const terminalTheme = currentTheme.terminalTheme;

    const xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: terminalFontSize,
      fontFamily: terminalFontFamily,
      lineHeight: 1.1,
      letterSpacing: 0,
      theme: {
        background: terminalTheme.background,
        foreground: terminalTheme.foreground,
        cursor: terminalTheme.cursor,
        cursorAccent: terminalTheme.cursorAccent,
        selectionBackground: terminalTheme.selectionBackground,
        selectionForeground: terminalTheme.selectionForeground,
        black: terminalTheme.black,
        red: terminalTheme.red,
        green: terminalTheme.green,
        yellow: terminalTheme.yellow,
        blue: terminalTheme.blue,
        magenta: terminalTheme.magenta,
        cyan: terminalTheme.cyan,
        white: terminalTheme.white,
        brightBlack: terminalTheme.brightBlack,
        brightRed: terminalTheme.brightRed,
        brightGreen: terminalTheme.brightGreen,
        brightYellow: terminalTheme.brightYellow,
        brightBlue: terminalTheme.brightBlue,
        brightMagenta: terminalTheme.brightMagenta,
        brightCyan: terminalTheme.brightCyan,
        brightWhite: terminalTheme.brightWhite,
      },
      allowTransparency: false,
      scrollback: 10000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    xterm.open(terminalRef.current);

    // Delay fit to ensure proper sizing
    setTimeout(() => {
      if (cleanedUpRef.current) return;
      fitAddon.fit();
      // Send initial resize to backend
      invoke("terminal_resize", {
        id: sessionId,
        cols: xterm.cols,
        rows: xterm.rows,
      }).catch(console.error);
    }, 100);

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Handle user input - send to PTY as raw bytes
    const dataDisposable = xterm.onData((data) => {
      if (cleanedUpRef.current) return;
      // Convert string to byte array for proper handling of control characters
      const bytes = Array.from(new TextEncoder().encode(data));
      invoke("terminal_write", { id: sessionId, data: bytes }).catch(console.error);
    });

    // Resize the PTY when terminal resizes
    const resizeDisposable = xterm.onResize(({ cols, rows }) => {
      if (cleanedUpRef.current) return;
      invoke("terminal_resize", { id: sessionId, cols, rows }).catch(console.error);
    });

    // Track listeners to ensure proper cleanup
    let unlisten: UnlistenFn | null = null;
    let unlistenClosed: UnlistenFn | null = null;

    // Listen for output from the backend
    const outputPromise = listen<TerminalOutput>("terminal-output", (event) => {
      if (cleanedUpRef.current) return;
      if (event.payload.id === sessionId && xtermRef.current) {
        // Convert byte array back to Uint8Array for xterm
        const bytes = new Uint8Array(event.payload.data);
        xtermRef.current.write(bytes);
      }
    });

    outputPromise.then((fn) => {
      if (cleanedUpRef.current) {
        // Component was unmounted before listener was set up, clean it immediately
        fn();
      } else {
        unlisten = fn;
      }
    });

    // Listen for terminal closed events
    const closedPromise = listen<string>("terminal-closed", (event) => {
      if (cleanedUpRef.current) return;
      if (event.payload === sessionId) {
        console.log("Terminal closed:", sessionId);
      }
    });

    closedPromise.then((fn) => {
      if (cleanedUpRef.current) {
        fn();
      } else {
        unlistenClosed = fn;
      }
    });

    return () => {
      cleanedUpRef.current = true;
      initializedRef.current = false;
      dataDisposable.dispose();
      resizeDisposable.dispose();
      if (unlisten) unlisten();
      if (unlistenClosed) unlistenClosed();
      xterm.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId]);

  // Update terminal theme and font when settings change
  useEffect(() => {
    if (!xtermRef.current) return;

    const terminalTheme = currentTheme.terminalTheme;

    xtermRef.current.options.theme = {
      background: terminalTheme.background,
      foreground: terminalTheme.foreground,
      cursor: terminalTheme.cursor,
      cursorAccent: terminalTheme.cursorAccent,
      selectionBackground: terminalTheme.selectionBackground,
      selectionForeground: terminalTheme.selectionForeground,
      black: terminalTheme.black,
      red: terminalTheme.red,
      green: terminalTheme.green,
      yellow: terminalTheme.yellow,
      blue: terminalTheme.blue,
      magenta: terminalTheme.magenta,
      cyan: terminalTheme.cyan,
      white: terminalTheme.white,
      brightBlack: terminalTheme.brightBlack,
      brightRed: terminalTheme.brightRed,
      brightGreen: terminalTheme.brightGreen,
      brightYellow: terminalTheme.brightYellow,
      brightBlue: terminalTheme.brightBlue,
      brightMagenta: terminalTheme.brightMagenta,
      brightCyan: terminalTheme.brightCyan,
      brightWhite: terminalTheme.brightWhite,
    };

    xtermRef.current.options.fontSize = terminalFontSize;
    xtermRef.current.options.fontFamily = terminalFontFamily;

    // Refit after font changes
    if (fitAddonRef.current) {
      try {
        fitAddonRef.current.fit();
      } catch {
        // Ignore fit errors
      }
    }
  }, [currentTheme, terminalFontSize, terminalFontFamily]);

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
  const removeSession = useTerminalStore((state) => state.removeSession);

  const handleClose = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("terminal_close", { id });
      removeSession(id);
    } catch (error) {
      console.error("Failed to close terminal:", error);
    }
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

interface TerminalInfo {
  id: string;
  shell: string;
}

export function TerminalContainer({ cwd }: TerminalContainerProps) {
  const { sessions, activeSessionId, addSession } = useTerminalStore();
  const spawnedRef = useRef(false);
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  const handleNewTerminal = useCallback(async () => {
    try {
      const info = await invoke<TerminalInfo>("terminal_spawn", {
        shell: null,
        cwd: cwd || null,
      });

      // Generate a name like "bash 1", "bash 2", etc.
      const shellName = info.shell.split("/").pop() || "terminal";
      const currentSessions = sessionsRef.current;
      const count = currentSessions.filter((s) => s.shell === info.shell).length + 1;
      const name = `${shellName} ${count}`;

      addSession({
        id: info.id,
        name,
        shell: info.shell,
      });
    } catch (error) {
      console.error("Failed to spawn terminal:", error);
    }
  }, [cwd, addSession]);

  // Auto-spawn a terminal if there are none - only once
  useEffect(() => {
    if (sessions.length === 0 && !spawnedRef.current) {
      spawnedRef.current = true;
      handleNewTerminal();
    }
  }, [sessions.length, handleNewTerminal]);

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
