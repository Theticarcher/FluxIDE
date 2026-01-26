import { create } from 'zustand';
import { CanvasNode, ComponentCategory, HistoryEntry } from '../types/visual-editor';

interface VisualEditorState {
  // Canvas tree (array of root-level nodes)
  nodes: CanvasNode[];

  // Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // UI state
  searchQuery: string;
  expandedCategories: Set<ComponentCategory>;
  isVisualPanelVisible: boolean;

  // Actions
  setNodes: (nodes: CanvasNode[]) => void;
  addNode: (node: CanvasNode, parentId: string | null, index: number) => void;
  removeNode: (nodeId: string) => void;
  moveNode: (nodeId: string, newParentId: string | null, newIndex: number) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  updateNodeStyles: (nodeId: string, styles: Record<string, string>) => void;
  updateNodeEvents: (nodeId: string, events: Record<string, string>) => void;
  duplicateNode: (nodeId: string) => void;

  selectNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;

  setSearchQuery: (query: string) => void;
  toggleCategory: (category: ComponentCategory) => void;
  setVisualPanelVisible: (visible: boolean) => void;

  // Utilities
  findNodeById: (nodeId: string) => CanvasNode | null;
  getParentNode: (nodeId: string) => CanvasNode | null;
  getSelectedNode: () => CanvasNode | null;
}

// Generate unique IDs with high randomness to avoid collisions
let idCounter = 0;
export function generateNodeId(): string {
  // Use a combination of timestamp, counter, and random to ensure uniqueness
  const timestamp = Date.now().toString(36); // Base36 for shorter string
  const random = Math.random().toString(36).substring(2, 8); // 6 random chars
  const counter = (++idCounter).toString(36).padStart(2, '0');
  return `n${timestamp}${random}${counter}`;
}

// Deep clone a node tree
function cloneNode(node: CanvasNode): CanvasNode {
  return {
    ...node,
    id: generateNodeId(),
    children: node.children.map(cloneNode),
  };
}

// Deep clone nodes array
function cloneNodes(nodes: CanvasNode[]): CanvasNode[] {
  return JSON.parse(JSON.stringify(nodes));
}

// Find a node by ID in a tree
function findNode(nodes: CanvasNode[], nodeId: string): CanvasNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    const found = findNode(node.children, nodeId);
    if (found) return found;
  }
  return null;
}

// Find parent of a node
function findParent(nodes: CanvasNode[], nodeId: string, parent: CanvasNode | null = null): CanvasNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return parent;
    const found = findParent(node.children, nodeId, node);
    if (found !== null) return found;
  }
  return null;
}

// Remove a node from tree
function removeFromTree(nodes: CanvasNode[], nodeId: string): CanvasNode[] {
  return nodes
    .filter(node => node.id !== nodeId)
    .map(node => ({
      ...node,
      children: removeFromTree(node.children, nodeId),
    }));
}

// Insert a node into tree at specific position
function insertIntoTree(
  nodes: CanvasNode[],
  parentId: string | null,
  index: number,
  newNode: CanvasNode
): CanvasNode[] {
  if (parentId === null) {
    // Insert at root level
    const result = [...nodes];
    result.splice(index, 0, { ...newNode, parentId: null });
    return result;
  }

  return nodes.map(node => {
    if (node.id === parentId) {
      const newChildren = [...node.children];
      newChildren.splice(index, 0, { ...newNode, parentId });
      return { ...node, children: newChildren };
    }
    return {
      ...node,
      children: insertIntoTree(node.children, parentId, index, newNode),
    };
  });
}

// Update a node in tree
function updateInTree(
  nodes: CanvasNode[],
  nodeId: string,
  updater: (node: CanvasNode) => CanvasNode
): CanvasNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return updater(node);
    }
    return {
      ...node,
      children: updateInTree(node.children, nodeId, updater),
    };
  });
}


export const useVisualEditorStore = create<VisualEditorState>((set, get) => ({
  // Initial state
  nodes: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  history: [],
  historyIndex: -1,
  searchQuery: '',
  expandedCategories: new Set(['Layout', 'Typography', 'Button']),
  isVisualPanelVisible: true,

  // Set entire nodes tree
  setNodes: (nodes) => {
    set({ nodes });
  },

  // Add a new node
  addNode: (node, parentId, index) => {
    const { nodes, pushHistory } = get();
    pushHistory();
    const newNodes = insertIntoTree(nodes, parentId, index, node);
    set({ nodes: newNodes, selectedNodeId: node.id });
  },

  // Remove a node
  removeNode: (nodeId) => {
    const { nodes, selectedNodeId, pushHistory } = get();
    pushHistory();
    const newNodes = removeFromTree(nodes, nodeId);
    set({
      nodes: newNodes,
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
    });
  },

  // Move a node to new position
  moveNode: (nodeId, newParentId, newIndex) => {
    const { nodes, pushHistory } = get();
    const node = findNode(nodes, nodeId);
    if (!node) return;

    pushHistory();

    // Remove from old position
    let newNodes = removeFromTree(nodes, nodeId);

    // Insert at new position
    newNodes = insertIntoTree(newNodes, newParentId, newIndex, node);

    set({ nodes: newNodes });
  },

  // Update node props
  updateNodeProps: (nodeId, props) => {
    const { nodes, pushHistory } = get();
    pushHistory();
    const newNodes = updateInTree(nodes, nodeId, (node) => ({
      ...node,
      props: { ...node.props, ...props },
    }));
    set({ nodes: newNodes });
  },

  // Update node styles
  updateNodeStyles: (nodeId, styles) => {
    const { nodes, pushHistory } = get();
    pushHistory();
    const newNodes = updateInTree(nodes, nodeId, (node) => ({
      ...node,
      styles: { ...node.styles, ...styles },
    }));
    set({ nodes: newNodes });
  },

  // Update node events
  updateNodeEvents: (nodeId, events) => {
    const { nodes, pushHistory } = get();
    pushHistory();
    const newNodes = updateInTree(nodes, nodeId, (node) => ({
      ...node,
      events: { ...node.events, ...events },
    }));
    set({ nodes: newNodes });
  },

  // Duplicate a node
  duplicateNode: (nodeId) => {
    const { nodes, pushHistory } = get();
    const node = findNode(nodes, nodeId);
    if (!node) return;

    pushHistory();

    const cloned = cloneNode(node);
    const parent = findParent(nodes, nodeId, null);
    const parentId = parent?.id ?? null;

    // Find index of original node
    const siblings = parent ? parent.children : nodes;
    const originalIndex = siblings.findIndex(n => n.id === nodeId);

    // Insert cloned node after original
    const newNodes = insertIntoTree(nodes, parentId, originalIndex + 1, cloned);
    set({ nodes: newNodes, selectedNodeId: cloned.id });
  },

  // Selection
  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  setHoveredNode: (nodeId) => {
    set({ hoveredNodeId: nodeId });
  },

  // History management
  pushHistory: () => {
    const { nodes, history, historyIndex } = get();
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      nodes: cloneNodes(nodes),
      timestamp: Date.now(),
    });
    // Keep only last 50 history entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex, nodes } = get();
    if (historyIndex < 0) return;

    // Save current state to allow redo
    if (historyIndex === history.length - 1) {
      const newHistory = [...history, { nodes: cloneNodes(nodes), timestamp: Date.now() }];
      set({
        nodes: cloneNodes(history[historyIndex].nodes),
        history: newHistory,
        historyIndex: historyIndex - 1,
        selectedNodeId: null,
      });
    } else {
      set({
        nodes: cloneNodes(history[historyIndex].nodes),
        historyIndex: historyIndex - 1,
        selectedNodeId: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    set({
      nodes: cloneNodes(history[historyIndex + 1].nodes),
      historyIndex: historyIndex + 1,
      selectedNodeId: null,
    });
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex >= 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  clearHistory: () => {
    set({ history: [], historyIndex: -1 });
  },

  // UI state
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  toggleCategory: (category) => {
    const { expandedCategories } = get();
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    set({ expandedCategories: newExpanded });
  },

  setVisualPanelVisible: (visible) => {
    set({ isVisualPanelVisible: visible });
  },

  // Utilities
  findNodeById: (nodeId) => {
    const { nodes } = get();
    return findNode(nodes, nodeId);
  },

  getParentNode: (nodeId) => {
    const { nodes } = get();
    return findParent(nodes, nodeId, null);
  },

  getSelectedNode: () => {
    const { nodes, selectedNodeId } = get();
    if (!selectedNodeId) return null;
    return findNode(nodes, selectedNodeId);
  },
}));
