import { useCallback, useState } from "react";
import { FolderOpen, FilePlus, FolderPlus, RefreshCw } from "lucide-react";
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
    addNode,
  } = useFileStore();

  const { readDirectory, readFile, openFolderDialog, createFile, createDirectory } = useFileSystem();
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState("");

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

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!rootPath) return;
    setLoading(true);
    try {
      const entries = await readDirectory(rootPath);
      setFiles(entries);
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setLoading(false);
    }
  }, [rootPath, readDirectory, setFiles, setLoading]);

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

  // Handle new file creation from header
  const handleNewFile = () => {
    setIsCreatingFile(true);
    setIsCreatingFolder(false);
    setNewItemName("");
  };

  // Handle new folder creation from header
  const handleNewFolder = () => {
    setIsCreatingFolder(true);
    setIsCreatingFile(false);
    setNewItemName("");
  };

  // Handle creating the new item
  const handleCreateItem = async () => {
    if (!newItemName.trim() || !rootPath) {
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      return;
    }

    const name = newItemName.trim();
    const newPath = `${rootPath}/${name}`;
    const extension = name.includes(".") ? name.split(".").pop() : undefined;

    try {
      if (isCreatingFile) {
        await createFile(newPath);
        const newNode = {
          name,
          path: newPath,
          is_dir: false,
          is_file: true,
          extension,
          isExpanded: false,
          isLoading: false,
        };
        addNode(rootPath, newNode);
      } else if (isCreatingFolder) {
        await createDirectory(newPath);
        const newNode = {
          name,
          path: newPath,
          is_dir: true,
          is_file: false,
          extension: undefined,
          isExpanded: false,
          isLoading: false,
        };
        addNode(rootPath, newNode);
      }
    } catch (error) {
      console.error("Failed to create item:", error);
      alert(`Failed to create: ${error}`);
    }

    setIsCreatingFile(false);
    setIsCreatingFolder(false);
    setNewItemName("");
  };

  // Handle keyboard events for new item input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateItem();
    } else if (e.key === "Escape") {
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
    }
  };

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
        <div className="file-explorer-actions">
          <button
            className="file-explorer-action-btn"
            onClick={handleNewFile}
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            className="file-explorer-action-btn"
            onClick={handleNewFolder}
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
          <button
            className="file-explorer-action-btn"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* New item input at root level */}
      {(isCreatingFile || isCreatingFolder) && (
        <div className="file-explorer-new-item">
          <input
            type="text"
            className="file-explorer-new-input"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleCreateItem}
            placeholder={isCreatingFile ? "file name" : "folder name"}
            autoFocus
          />
        </div>
      )}

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
