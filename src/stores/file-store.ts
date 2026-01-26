import { create } from "zustand";
import type { FileNode } from "../types/file";

interface FileState {
  // Root directory
  rootPath: string | null;
  rootName: string | null;

  // File tree
  files: FileNode[];

  // Loading state
  isLoading: boolean;

  // Selected file/folder for context operations
  selectedPath: string | null;

  // Actions
  setRootPath: (path: string, name: string) => void;
  setFiles: (files: FileNode[]) => void;
  setLoading: (loading: boolean) => void;
  toggleDirectory: (path: string) => void;
  updateDirectoryChildren: (path: string, children: FileNode[]) => void;
  setSelectedPath: (path: string | null) => void;
  removeNode: (path: string) => void;
  addNode: (parentPath: string, node: FileNode) => void;
  updateNodeName: (oldPath: string, newPath: string, newName: string) => void;
}

export const useFileStore = create<FileState>((set) => ({
  rootPath: null,
  rootName: null,
  files: [],
  isLoading: false,
  selectedPath: null,

  setRootPath: (path: string, name: string) => {
    set({ rootPath: path, rootName: name, files: [] });
  },

  setFiles: (files: FileNode[]) => {
    set({ files });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  toggleDirectory: (path: string) => {
    set((state) => ({
      files: toggleNode(state.files, path),
    }));
  },

  updateDirectoryChildren: (path: string, children: FileNode[]) => {
    set((state) => ({
      files: updateNodeChildren(state.files, path, children),
    }));
  },

  setSelectedPath: (path: string | null) => {
    set({ selectedPath: path });
  },

  removeNode: (path: string) => {
    set((state) => ({
      files: removeNodeFromTree(state.files, path),
    }));
  },

  addNode: (parentPath: string, node: FileNode) => {
    set((state) => ({
      files: addNodeToTree(state.files, parentPath, node, state.rootPath),
    }));
  },

  updateNodeName: (oldPath: string, newPath: string, newName: string) => {
    set((state) => ({
      files: updateNodeInTree(state.files, oldPath, newPath, newName),
    }));
  },
}));

// Helper functions for tree manipulation
function toggleNode(nodes: FileNode[], path: string): FileNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    if (node.children) {
      return { ...node, children: toggleNode(node.children, path) };
    }
    return node;
  });
}

function updateNodeChildren(
  nodes: FileNode[],
  path: string,
  children: FileNode[]
): FileNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return { ...node, children, isLoading: false };
    }
    if (node.children) {
      return { ...node, children: updateNodeChildren(node.children, path, children) };
    }
    return node;
  });
}

function removeNodeFromTree(nodes: FileNode[], path: string): FileNode[] {
  return nodes
    .filter((node) => node.path !== path)
    .map((node) => {
      if (node.children) {
        return { ...node, children: removeNodeFromTree(node.children, path) };
      }
      return node;
    });
}

function addNodeToTree(
  nodes: FileNode[],
  parentPath: string,
  newNode: FileNode,
  rootPath: string | null
): FileNode[] {
  // If adding to root level
  if (parentPath === rootPath) {
    const updated = [...nodes, newNode];
    return sortNodes(updated);
  }

  return nodes.map((node) => {
    if (node.path === parentPath && node.is_dir) {
      const children = node.children ? [...node.children, newNode] : [newNode];
      return { ...node, children: sortNodes(children), isExpanded: true };
    }
    if (node.children) {
      return { ...node, children: addNodeToTree(node.children, parentPath, newNode, rootPath) };
    }
    return node;
  });
}

function updateNodeInTree(
  nodes: FileNode[],
  oldPath: string,
  newPath: string,
  newName: string
): FileNode[] {
  return nodes.map((node) => {
    if (node.path === oldPath) {
      return { ...node, path: newPath, name: newName };
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, oldPath, newPath, newName) };
    }
    return node;
  });
}

function sortNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    // Directories first
    if (a.is_dir && !b.is_dir) return -1;
    if (!a.is_dir && b.is_dir) return 1;
    // Then alphabetically
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
}
