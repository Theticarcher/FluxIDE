import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import type { FileEntry, FileNode } from "../types/file";

export function useFileSystem() {
  /**
   * Read directory contents
   */
  const readDirectory = async (path: string): Promise<FileNode[]> => {
    try {
      const entries: FileEntry[] = await invoke("read_directory", { path });
      return entries.map((entry) => ({
        ...entry,
        children: entry.is_dir ? undefined : undefined,
        isExpanded: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to read directory:", error);
      throw error;
    }
  };

  /**
   * Read file contents
   */
  const readFile = async (path: string): Promise<string> => {
    try {
      return await invoke("read_file", { path });
    } catch (error) {
      console.error("Failed to read file:", error);
      throw error;
    }
  };

  /**
   * Write file contents
   */
  const writeFile = async (path: string, content: string): Promise<void> => {
    try {
      await invoke("write_file", { path, content });
    } catch (error) {
      console.error("Failed to write file:", error);
      throw error;
    }
  };

  /**
   * Create a new file
   */
  const createFile = async (path: string): Promise<void> => {
    try {
      await invoke("create_file", { path });
    } catch (error) {
      console.error("Failed to create file:", error);
      throw error;
    }
  };

  /**
   * Create a new directory
   */
  const createDirectory = async (path: string): Promise<void> => {
    try {
      await invoke("create_directory", { path });
    } catch (error) {
      console.error("Failed to create directory:", error);
      throw error;
    }
  };

  /**
   * Delete a file or directory
   */
  const deletePath = async (path: string): Promise<void> => {
    try {
      await invoke("delete_path", { path });
    } catch (error) {
      console.error("Failed to delete:", error);
      throw error;
    }
  };

  /**
   * Rename a file or directory
   */
  const renamePath = async (oldPath: string, newPath: string): Promise<void> => {
    try {
      await invoke("rename_path", { oldPath, newPath });
    } catch (error) {
      console.error("Failed to rename:", error);
      throw error;
    }
  };

  /**
   * Open folder picker dialog
   */
  const openFolderDialog = async (): Promise<string | null> => {
    try {
      const result = await openDialog({
        directory: true,
        multiple: false,
        title: "Open Folder",
      });
      return result as string | null;
    } catch (error) {
      console.error("Failed to open folder dialog:", error);
      return null;
    }
  };

  return {
    readDirectory,
    readFile,
    writeFile,
    createFile,
    createDirectory,
    deletePath,
    renamePath,
    openFolderDialog,
  };
}
