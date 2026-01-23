import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useTerminalStore } from "../stores/terminal-store";

interface TerminalInfo {
  id: string;
  shell: string;
}

interface TerminalOutput {
  id: string;
  data: string;
}

export function useTerminal() {
  const { addSession, removeSession, sessions } = useTerminalStore();

  const spawnTerminal = useCallback(
    async (cwd?: string): Promise<TerminalInfo> => {
      const info = await invoke<TerminalInfo>("terminal_spawn", {
        shell: null,
        cwd: cwd || null,
      });

      // Generate a name like "bash 1", "bash 2", etc.
      const shellName = info.shell.split("/").pop() || "terminal";
      const count = sessions.filter((s) => s.shell === info.shell).length + 1;
      const name = `${shellName} ${count}`;

      addSession({
        id: info.id,
        name,
        shell: info.shell,
      });

      return info;
    },
    [addSession, sessions]
  );

  const writeToTerminal = useCallback(
    async (id: string, data: string): Promise<void> => {
      await invoke("terminal_write", { id, data });
    },
    []
  );

  const resizeTerminal = useCallback(
    async (id: string, cols: number, rows: number): Promise<void> => {
      await invoke("terminal_resize", { id, cols, rows });
    },
    []
  );

  const closeTerminal = useCallback(
    async (id: string): Promise<void> => {
      await invoke("terminal_close", { id });
      removeSession(id);
    },
    [removeSession]
  );

  const onTerminalOutput = useCallback(
    (callback: (output: TerminalOutput) => void): Promise<UnlistenFn> => {
      return listen<TerminalOutput>("terminal-output", (event) => {
        callback(event.payload);
      });
    },
    []
  );

  const onTerminalClosed = useCallback(
    (callback: (id: string) => void): Promise<UnlistenFn> => {
      return listen<string>("terminal-closed", (event) => {
        callback(event.payload);
        removeSession(event.payload);
      });
    },
    [removeSession]
  );

  return {
    spawnTerminal,
    writeToTerminal,
    resizeTerminal,
    closeTerminal,
    onTerminalOutput,
    onTerminalClosed,
  };
}
