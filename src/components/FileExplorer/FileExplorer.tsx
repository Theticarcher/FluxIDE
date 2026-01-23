import { useCallback } from "react";
import { FolderOpen } from "lucide-react";
import { useFileStore } from "../../stores/file-store";
import { useFileSystem } from "../../hooks/useFileSystem";
import { FileTree } from "./FileTree";
import "./FileExplorer.css";

interface FileExplorerProps {
  onFileOpen: (path: string, name: string, content: string) => void;
}

export function FileExplorer({ onFileOpen }: FileExplorerProps) {
  const {
    rootPath,
    rootName,
    files,
    isLoading,
    setRootPath,
    setFiles,
    setLoading,
    toggleDirectory,
    updateDirectoryChildren,
  } = useFileStore();

  const { readDirectory, readFile, openFolderDialog } = useFileSystem();

  // Handle opening a folder
  const handleOpenFolder = useCallback(async () => {
    const folderPath = await openFolderDialog();
    if (!folderPath) return;

    const folderName = folderPath.split("/").pop() || folderPath;
    setRootPath(folderPath, folderName);
    setLoading(true);

    try {
      const entries = await readDirectory(folderPath);
      setFiles(entries);
    } catch (error) {
      console.error("Failed to open folder:", error);
    } finally {
      setLoading(false);
    }
  }, [openFolderDialog, readDirectory, setFiles, setLoading, setRootPath]);

  // Handle directory expansion
  const handleToggleDirectory = useCallback(
    async (path: string, isExpanded: boolean) => {
      toggleDirectory(path);

      if (!isExpanded) {
        // Loading children
        try {
          const entries = await readDirectory(path);
          updateDirectoryChildren(path, entries);
        } catch (error) {
          console.error("Failed to load directory:", error);
        }
      }
    },
    [readDirectory, toggleDirectory, updateDirectoryChildren]
  );

  // Handle file click
  const handleFileClick = useCallback(
    async (path: string, name: string) => {
      try {
        const content = await readFile(path);
        onFileOpen(path, name, content);
      } catch (error) {
        console.error("Failed to open file:", error);
      }
    },
    [readFile, onFileOpen]
  );

  // No folder open state
  if (!rootPath) {
    return (
      <div className="file-explorer-empty">
        <p>No folder opened</p>
        <button className="open-folder-btn" onClick={handleOpenFolder}>
          <FolderOpen size={16} />
          Open Folder
        </button>
      </div>
    );
  }

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span className="folder-name">{rootName}</span>
      </div>
      {isLoading ? (
        <div className="file-explorer-loading">Loading...</div>
      ) : (
        <FileTree
          files={files}
          onToggleDirectory={handleToggleDirectory}
          onFileClick={handleFileClick}
        />
      )}
    </div>
  );
}
