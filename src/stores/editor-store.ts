import { create } from "zustand";
import type { OpenFile } from "../types/file";
import { detectLanguage } from "../components/Editor";

interface EditorState {
  // Open files
  openFiles: Map<string, OpenFile>;
  activeFileId: string | null;

  // Actions
  openFile: (path: string, name: string, content: string) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  markSaved: (id: string) => void;
  getActiveFile: () => OpenFile | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  openFiles: new Map(),
  activeFileId: null,

  openFile: (path: string, name: string, content: string) => {
    const id = path; // Use path as unique ID

    set((state) => {
      // Check if file is already open
      if (state.openFiles.has(id)) {
        return { activeFileId: id };
      }

      const newFiles = new Map(state.openFiles);
      newFiles.set(id, {
        id,
        path,
        name,
        content,
        language: detectLanguage(name),
        isDirty: false,
        originalContent: content,
      });

      return {
        openFiles: newFiles,
        activeFileId: id,
      };
    });
  },

  closeFile: (id: string) => {
    set((state) => {
      const newFiles = new Map(state.openFiles);
      newFiles.delete(id);

      // If we closed the active file, activate another one
      let newActiveId = state.activeFileId;
      if (state.activeFileId === id) {
        const remaining = Array.from(newFiles.keys());
        newActiveId = remaining[remaining.length - 1] || null;
      }

      return {
        openFiles: newFiles,
        activeFileId: newActiveId,
      };
    });
  },

  setActiveFile: (id: string) => {
    set({ activeFileId: id });
  },

  updateContent: (id: string, content: string) => {
    set((state) => {
      const file = state.openFiles.get(id);
      if (!file) return state;

      const newFiles = new Map(state.openFiles);
      newFiles.set(id, {
        ...file,
        content,
        isDirty: content !== file.originalContent,
      });

      return { openFiles: newFiles };
    });
  },

  markSaved: (id: string) => {
    set((state) => {
      const file = state.openFiles.get(id);
      if (!file) return state;

      const newFiles = new Map(state.openFiles);
      newFiles.set(id, {
        ...file,
        isDirty: false,
        originalContent: file.content,
      });

      return { openFiles: newFiles };
    });
  },

  getActiveFile: () => {
    const state = get();
    if (!state.activeFileId) return null;
    return state.openFiles.get(state.activeFileId) || null;
  },
}));
