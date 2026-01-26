import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Copy, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useVisualEditorStore } from '../../../stores/visual-editor-store';
import { getComponentByName } from '../../../data/flux-components';
import { CanvasNode as CanvasNodeType } from '../../../types/visual-editor';
import './Canvas.css';

// Get icon component by name
function getIcon(name: string): React.ComponentType<{ size?: number }> {
  const iconName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[iconName] || Icons.Box;
}

// Individual canvas node
function CanvasNode({ node, depth = 0 }: { node: CanvasNodeType; depth?: number }) {
  const {
    selectedNodeId,
    hoveredNodeId,
    selectNode,
    setHoveredNode,
    removeNode,
    duplicateNode,
  } = useVisualEditorStore();

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: 'canvas',
      node,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const componentDef = getComponentByName(node.componentName);
  const Icon = getIcon(componentDef?.icon || 'box');
  const acceptsChildren = componentDef?.acceptsChildren ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(node.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(node.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-node ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setHoveredNode(node.id)}
      onMouseLeave={() => setHoveredNode(null)}
    >
      <div className="node-header">
        <div className="node-drag-handle" {...attributes} {...listeners}>
          <GripVertical size={12} />
        </div>
        <Icon size={14} />
        <span className="node-name">{node.componentName}</span>
        {Object.keys(node.props).length > 0 && (
          <span className="node-props-count">{Object.keys(node.props).length} props</span>
        )}
        {isSelected && (
          <div className="node-actions">
            <button className="node-action" onClick={handleDuplicate} title="Duplicate">
              <Copy size={12} />
            </button>
            <button className="node-action delete" onClick={handleDelete} title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {acceptsChildren && (
        <DropZone parentId={node.id} depth={depth}>
          {node.children.length > 0 ? (
            <SortableContext
              items={node.children.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {node.children.map((child) => (
                <CanvasNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </SortableContext>
          ) : (
            <div className="drop-placeholder">
              Drop components here
            </div>
          )}
        </DropZone>
      )}
    </div>
  );
}

// Drop zone for children
function DropZone({
  parentId,
  depth,
  children,
}: {
  parentId: string;
  depth: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `dropzone-${parentId}`,
    data: {
      type: 'dropzone',
      parentId,
      depth,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`node-children ${isOver ? 'drag-over' : ''}`}
    >
      {children}
    </div>
  );
}

// Root drop zone for the entire canvas
function RootDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: {
      type: 'root',
      parentId: null,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`canvas-root-dropzone ${isOver ? 'drag-over' : ''}`}
    >
      {children}
    </div>
  );
}

export function Canvas() {
  const { nodes, selectNode } = useVisualEditorStore();

  const handleCanvasClick = () => {
    selectNode(null);
  };

  return (
    <div className="visual-canvas" onClick={handleCanvasClick}>
      <div className="canvas-toolbar">
        <span className="canvas-title">Visual Canvas</span>
        <span className="canvas-hint">Drag components from the palette</span>
      </div>

      <div className="canvas-content">
        <RootDropZone>
          {nodes.length > 0 ? (
            <SortableContext
              items={nodes.map((n) => n.id)}
              strategy={verticalListSortingStrategy}
            >
              {nodes.map((node) => (
                <CanvasNode key={node.id} node={node} depth={0} />
              ))}
            </SortableContext>
          ) : (
            <div className="canvas-empty">
              <Icons.MousePointerClick size={32} className="empty-icon" />
              <p className="empty-text">Drag components here to start building</p>
              <p className="empty-hint">
                Components from the palette can be dropped here
              </p>
            </div>
          )}
        </RootDropZone>
      </div>
    </div>
  );
}
