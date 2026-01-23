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

  // Actions
  setRootPath: (path: string, name: string) => void;
  setFiles: (files: FileNode[]) => void;
  setLoading: (loading: boolean) => void;
  toggleDirectory: (path: string) => void;
  updateDirectoryChildren: (path: string, children: FileNode[]) => void;
}

export const useFileStore = create<FileState>((set) => ({
  rootPath: null,
  rootName: null,
  files: [],
  isLoading: false,

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
