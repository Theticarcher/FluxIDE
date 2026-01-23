import { ChevronRight, ChevronDown, Folder, FileText, FileCode, FileJson } from "lucide-react";
import type { FileNode } from "../../types/file";
import "./FileTree.css";

interface FileTreeProps {
  files: FileNode[];
  onToggleDirectory: (path: string, isExpanded: boolean) => void;
  onFileClick: (path: string, name: string) => void;
  depth?: number;
}

export function FileTree({
  files,
  onToggleDirectory,
  onFileClick,
  depth = 0,
}: FileTreeProps) {
  return (
    <div className="file-tree">
      {files.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          depth={depth}
          onToggleDirectory={onToggleDirectory}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
}

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  onToggleDirectory: (path: string, isExpanded: boolean) => void;
  onFileClick: (path: string, name: string) => void;
}

function FileTreeItem({
  node,
  depth,
  onToggleDirectory,
  onFileClick,
}: FileTreeItemProps) {
  const handleClick = () => {
    if (node.is_dir) {
      onToggleDirectory(node.path, !!node.isExpanded);
    } else {
      onFileClick(node.path, node.name);
    }
  };

  const Icon = getFileIcon(node);
  const indent = depth * 12;

  return (
    <>
      <div
        className={`file-tree-item ${node.is_dir ? "directory" : "file"}`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={handleClick}
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
        <span className="file-name">{node.name}</span>
      </div>
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
