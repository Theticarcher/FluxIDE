// Type definitions for the Visual Drag-and-Drop Editor

export type ComponentCategory =
  | 'Layout'
  | 'Typography'
  | 'Button'
  | 'Form'
  | 'Feedback'
  | 'Navigation'
  | 'Data Display'
  | 'Media'
  | 'Overlay'
  | 'E-commerce'
  | 'Social'
  | 'Marketing'
  | 'Utility';

export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'expression'
  | 'array'
  | 'object';

export interface PropDefinition {
  name: string;
  type: PropType;
  required: boolean;
  defaultValue?: unknown;
  description: string;
  options?: string[]; // For select type
  placeholder?: string;
}

export interface EventDefinition {
  name: string;
  description: string;
  eventObjectProps?: string[]; // e.g., ['target.value', 'key']
}

export interface ComponentDefinition {
  name: string;
  category: ComponentCategory;
  description: string;
  icon: string; // Lucide icon name
  props: PropDefinition[];
  events: EventDefinition[];
  acceptsChildren: boolean;
  childrenTypes?: string[]; // Restrict which components can be children
  preview: string; // Simple HTML for palette preview
}

// Canvas node representing a component instance in the visual tree
export interface CanvasNode {
  id: string;
  componentName: string;
  props: Record<string, unknown>;
  styles: Record<string, string>;
  events: Record<string, string>; // event name -> handler code
  children: CanvasNode[];
  parentId: string | null;
}

// Drag data passed during drag operations
export interface DragData {
  type: 'palette' | 'canvas';
  componentDef?: ComponentDefinition;
  node?: CanvasNode;
}

// Drop position info
export interface DropPosition {
  parentId: string;
  index: number;
}

// History entry for undo/redo
export interface HistoryEntry {
  nodes: CanvasNode[];
  timestamp: number;
}

// Visual editor state
export interface VisualEditorState {
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

  setSearchQuery: (query: string) => void;
  toggleCategory: (category: ComponentCategory) => void;
  setVisualPanelVisible: (visible: boolean) => void;

  // Utilities
  findNodeById: (nodeId: string) => CanvasNode | null;
  getParentNode: (nodeId: string) => CanvasNode | null;
}
