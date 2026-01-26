import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Folder, FileText, FileCode, FileJson, FilePlus, FolderPlus, Pencil, Trash2, Copy } from "lucide-react";
import type { FileNode } from "../../types/file";
import { ContextMenu, type ContextMenuItem } from "../ContextMenu";
import { useFileStore } from "../../stores/file-store";
import { useFileSystem } from "../../hooks/useFileSystem";
import "./FileTree.css";

interface FileTreeProps {
  files: FileNode[];
  onToggleDirectory: (path: string, isExpanded: boolean) => void;
  onFileClick: (path: string, name: string) => void;
  depth?: number;
}

interface ContextMenuState {
  x: number;
  y: number;
  node: FileNode | null;
}

export function FileTree({
  files,
  onToggleDirectory,
  onFileClick,
  depth = 0,
}: FileTreeProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [newItemState, setNewItemState] = useState<{ parentPath: string; type: "file" | "folder" } | null>(null);
  const { rootPath, removeNode, addNode, updateNodeName, selectedPath, setSelectedPath } = useFileStore();
  const { deletePath, renamePath, createFile, createDirectory } = useFileSystem();

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPath(node.path);
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleRootContextMenu = (e: React.MouseEvent) => {
    // Only trigger if clicking on the empty space in the tree
    if (e.target === e.currentTarget) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, node: null });
    }
  };

  const handleDelete = async (node: FileNode) => {
    const typeLabel = node.is_dir ? "folder" : "file";
    const confirmed = window.confirm(`Are you sure you want to delete "${node.name}"? ${node.is_dir ? "This will delete all contents inside." : ""}`);
    if (confirmed) {
      try {
        await deletePath(node.path);
        removeNode(node.path);
      } catch (error) {
        console.error(`Failed to delete ${typeLabel}:`, error);
        alert(`Failed to delete ${typeLabel}: ${error}`);
      }
    }
  };

  const handleRename = (node: FileNode) => {
    setRenamingPath(node.path);
  };

  const handleRenameComplete = async (oldPath: string, newName: string, oldName: string) => {
    setRenamingPath(null);
    if (newName && newName !== oldName) {
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/"));
      const newPath = `${parentPath}/${newName}`;
      try {
        await renamePath(oldPath, newPath);
        updateNodeName(oldPath, newPath, newName);
      } catch (error) {
        console.error("Failed to rename:", error);
        alert(`Failed to rename: ${error}`);
      }
    }
  };

  const handleNewFile = (parentPath: string) => {
    setNewItemState({ parentPath, type: "file" });
  };

  const handleNewFolder = (parentPath: string) => {
    setNewItemState({ parentPath, type: "folder" });
  };

  const handleNewItemComplete = async (name: string) => {
    if (!newItemState || !name) {
      setNewItemState(null);
      return;
    }

    const { parentPath, type } = newItemState;
    const newPath = `${parentPath}/${name}`;
    const extension = name.includes(".") ? name.split(".").pop() : undefined;

    try {
      if (type === "file") {
        await createFile(newPath);
      } else {
        await createDirectory(newPath);
      }

      const newNode: FileNode = {
        name,
        path: newPath,
        is_dir: type === "folder",
        is_file: type === "file",
        extension: type === "file" ? extension : undefined,
        isExpanded: false,
        isLoading: false,
      };

      addNode(parentPath, newNode);
    } catch (error) {
      console.error(`Failed to create ${type}:`, error);
      alert(`Failed to create ${type}: ${error}`);
    }

    setNewItemState(null);
  };

  const getContextMenuItems = (node: FileNode | null): ContextMenuItem[] => {
    if (!node) {
      // Context menu for root/empty area
      return [
        {
          label: "New File",
          icon: <FilePlus size={14} />,
          onClick: () => rootPath && handleNewFile(rootPath),
        },
        {
          label: "New Folder",
          icon: <FolderPlus size={14} />,
          onClick: () => rootPath && handleNewFolder(rootPath),
        },
      ];
    }

    const items: ContextMenuItem[] = [];

    if (node.is_dir) {
      items.push({
        label: "New File",
        icon: <FilePlus size={14} />,
        onClick: () => handleNewFile(node.path),
      });
      items.push({
        label: "New Folder",
        icon: <FolderPlus size={14} />,
        onClick: () => handleNewFolder(node.path),
      });
      items.push({ label: "", onClick: () => {}, divider: true });
    }

    items.push({
      label: "Rename",
      icon: <Pencil size={14} />,
      onClick: () => handleRename(node),
    });

    items.push({
      label: "Copy Path",
      icon: <Copy size={14} />,
      onClick: () => navigator.clipboard.writeText(node.path),
    });

    items.push({ label: "", onClick: () => {}, divider: true });

    items.push({
      label: "Delete",
      icon: <Trash2 size={14} />,
      onClick: () => handleDelete(node),
      danger: true,
    });

    return items;
  };

  return (
    <div
      className="file-tree"
      onContextMenu={depth === 0 ? handleRootContextMenu : undefined}
    >
      {/* Show new item input at root level if creating in root */}
      {depth === 0 && newItemState && newItemState.parentPath === rootPath && (
        <NewItemInput
          type={newItemState.type}
          depth={0}
          onComplete={handleNewItemComplete}
          onCancel={() => setNewItemState(null)}
        />
      )}

      {files.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          depth={depth}
          onToggleDirectory={onToggleDirectory}
          onFileClick={onFileClick}
          onContextMenu={handleContextMenu}
          isRenaming={renamingPath === node.path}
          onRenameComplete={handleRenameComplete}
          isSelected={selectedPath === node.path}
          newItemState={newItemState}
          onNewItemComplete={handleNewItemComplete}
          onNewItemCancel={() => setNewItemState(null)}
        />
      ))}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems(contextMenu.node)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  onToggleDirectory: (path: string, isExpanded: boolean) => void;
  onFileClick: (path: string, name: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  isRenaming: boolean;
  onRenameComplete: (oldPath: string, newName: string, oldName: string) => void;
  isSelected: boolean;
  newItemState: { parentPath: string; type: "file" | "folder" } | null;
  onNewItemComplete: (name: string) => void;
  onNewItemCancel: () => void;
}

function FileTreeItem({
  node,
  depth,
  onToggleDirectory,
  onFileClick,
  onContextMenu,
  isRenaming,
  onRenameComplete,
  isSelected,
  newItemState,
  onNewItemComplete,
  onNewItemCancel,
}: FileTreeItemProps) {
  const [editName, setEditName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      // Select name without extension for files
      if (node.is_file && node.extension) {
        const nameWithoutExt = node.name.substring(0, node.name.lastIndexOf("."));
        inputRef.current.setSelectionRange(0, nameWithoutExt.length);
      } else {
        inputRef.current.select();
      }
    }
  }, [isRenaming, node.is_file, node.extension, node.name]);

  const handleClick = () => {
    if (isRenaming) return;
    if (node.is_dir) {
      onToggleDirectory(node.path, !!node.isExpanded);
    } else {
      onFileClick(node.path, node.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onRenameComplete(node.path, editName, node.name);
    } else if (e.key === "Escape") {
      setEditName(node.name);
      onRenameComplete(node.path, node.name, node.name);
    }
  };

  const handleBlur = () => {
    onRenameComplete(node.path, editName, node.name);
  };

  const Icon = getFileIcon(node);
  const indent = depth * 12;

  const showNewItemInput = newItemState && newItemState.parentPath === node.path && node.is_dir;

  return (
    <>
      <div
        className={`file-tree-item ${node.is_dir ? "directory" : "file"} ${isSelected ? "active" : ""}`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        {node.is_dir && (
          <span className="expand-icon">
            {node.isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </span>
        )}
        {!node.is_dir && <span className="expand-icon-spacer" />}
        <span className="file-icon">
          <Icon size={16} />
        </span>
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            className="file-rename-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="file-name">{node.name}</span>
        )}
      </div>

      {/* Show new item input inside expanded directory */}
      {showNewItemInput && node.isExpanded && (
        <NewItemInput
          type={newItemState.type}
          depth={depth + 1}
          onComplete={onNewItemComplete}
          onCancel={onNewItemCancel}
        />
      )}

      {node.is_dir && node.isExpanded && node.children && (
        <FileTree
          files={node.children}
          depth={depth + 1}
          onToggleDirectory={onToggleDirectory}
          onFileClick={onFileClick}
        />
      )}
    </>
  );
}

interface NewItemInputProps {
  type: "file" | "folder";
  depth: number;
  onComplete: (name: string) => void;
  onCancel: () => void;
}

function NewItemInput({ type, depth, onComplete, onCancel }: NewItemInputProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const indent = depth * 12;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      onComplete(name.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (name.trim()) {
      onComplete(name.trim());
    } else {
      onCancel();
    }
  };

  const Icon = type === "folder" ? Folder : FileText;

  return (
    <div
      className={`file-tree-item new-item ${type === "folder" ? "directory" : "file"}`}
      style={{ paddingLeft: `${indent + 8}px` }}
    >
      <span className="expand-icon-spacer" />
      <span className="file-icon">
        <Icon size={16} />
      </span>
      <input
        ref={inputRef}
        type="text"
        className="file-rename-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={type === "folder" ? "folder name" : "file name"}
      />
    </div>
  );
}

function getFileIcon(node: FileNode) {
  if (node.is_dir) {
    return Folder;
  }

  const extension = node.extension?.toLowerCase();
  switch (extension) {
    case "flux":
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "rs":
    case "py":
    case "go":
      return FileCode;
    case "json":
      return FileJson;
    default:
      return FileText;
  }
}
