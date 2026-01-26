import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { RefreshCw, ExternalLink, Play, Move } from "lucide-react";
import type { ComponentDefinition } from "../../types/visual-editor";
import "./Preview.css";

interface CanvasNodeInfo {
  id: string;
  componentName: string;
  className: string;
  isPositioned: boolean;
  x: number;
  y: number;
}

interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PreviewProps {
  html: string;
  isCompiling: boolean;
  onRefresh: () => void;
  onOpenInBrowser?: () => void;
  isDragging?: boolean;
  draggedComponent?: ComponentDefinition | null;
  canvasNodes?: CanvasNodeInfo[];
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onMoveNode?: (nodeId: string, x: number, y: number) => void;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

export function Preview({
  html,
  isCompiling,
  onRefresh,
  onOpenInBrowser,
  isDragging = false,
  draggedComponent,
  canvasNodes = [],
  selectedNodeId,
  onSelectNode,
  onMoveNode,
  iframeRef: externalIframeRef,
}: PreviewProps) {
  const internalIframeRef = useRef<HTMLIFrameElement>(null);
  const iframeRef = externalIframeRef || internalIframeRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);

  // State for dragging existing nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // State for node bounds (position + size) from iframe
  const [nodeBounds, setNodeBounds] = useState<Record<string, NodeBounds>>({});
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Track if overlay was just clicked to prevent iframe click from deselecting
  const overlayClickedRef = useRef(false);

  // Use a ref to store the current position for access during drag end
  const dropPositionRef = useRef<{ x: number; y: number } | null>(null);
  dropPositionRef.current = dropPosition;

  // Memoize droppable data to include a getter for the current position
  const droppableData = useMemo(() => ({
    type: 'preview',
    // Use a getter function so the position is read at drop time, not at registration time
    getPosition: () => dropPositionRef.current,
  }), []);

  // Set up droppable
  const { isOver, setNodeRef } = useDroppable({
    id: 'preview-drop-zone',
    data: droppableData,
  });

  // Track mouse position during drag
  useEffect(() => {
    if (!isDragging || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 36, // Subtract toolbar height
        };
        setDropPosition(newPosition);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDragging]);

  // Update iframe content when html changes
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html, key]);

  // Query iframe for element bounds (position + size) after content loads
  useEffect(() => {
    if (!iframeRef.current || canvasNodes.length === 0) return;

    const updateBounds = () => {
      const doc = iframeRef.current?.contentDocument;
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!doc || !iframeWindow) return;

      const newBounds: Record<string, NodeBounds> = {};

      canvasNodes.forEach(node => {
        // Find element by class name in iframe
        const element = doc.querySelector(`.${node.className}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Account for iframe scroll position
          // getBoundingClientRect returns position relative to viewport,
          // so we need to add scroll offset to get document-relative position
          newBounds[node.id] = {
            x: rect.left + iframeWindow.scrollX,
            y: rect.top + iframeWindow.scrollY,
            width: rect.width,
            height: rect.height,
          };
        }
      });

      setNodeBounds(newBounds);
    };

    // Wait for iframe content to render
    const timer = setTimeout(updateBounds, 100);

    // Also update on iframe load
    const iframe = iframeRef.current;
    iframe.addEventListener('load', updateBounds);

    // Also update on scroll inside iframe
    const handleScroll = () => updateBounds();
    const addScrollListener = () => {
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        iframeWindow.addEventListener('scroll', handleScroll);
      }
    };
    setTimeout(addScrollListener, 150);

    return () => {
      clearTimeout(timer);
      iframe?.removeEventListener('load', updateBounds);
      const iframeWindow = iframe?.contentWindow;
      if (iframeWindow) {
        iframeWindow.removeEventListener('scroll', handleScroll);
      }
    };
  }, [html, key, canvasNodes]);

  const handleRefresh = () => {
    setKey((k) => k + 1);
    onRefresh();
  };

  // Handle starting to drag an existing node
  const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const node = canvasNodes.find(n => n.id === nodeId);
    const bounds = nodeBounds[nodeId];
    if (!node || !contentRef.current) return;

    const rect = contentRef.current.getBoundingClientRect();
    // Use bounds from iframe if available, otherwise use node's stored position
    const nodeX = bounds?.x ?? node.x;
    const nodeY = bounds?.y ?? node.y;

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - nodeX,
      y: e.clientY - rect.top - nodeY,
    });
    setDragPosition({ x: nodeX, y: nodeY });
    onSelectNode?.(nodeId);
  }, [canvasNodes, nodeBounds, onSelectNode]);

  // Handle dragging an existing node
  useEffect(() => {
    if (!draggingNodeId || !contentRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
        const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);
        setDragPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (draggingNodeId && dragPosition) {
        onMoveNode?.(draggingNodeId, dragPosition.x, dragPosition.y);
      }
      setDraggingNodeId(null);
      setDragPosition(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, dragOffset, dragPosition, onMoveNode]);

  // Click on content area to deselect
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    // Deselect when clicking on the content area (not on an overlay)
    const target = e.target as HTMLElement;
    if (!target.closest('.preview-node-overlay')) {
      onSelectNode?.(null);
    }
  }, [onSelectNode]);

  // Add click listener to iframe document for deselection
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeClick = () => {
      // Skip deselection if overlay was just clicked
      if (overlayClickedRef.current) {
        overlayClickedRef.current = false;
        return;
      }
      onSelectNode?.(null);
    };

    // Wait for iframe to load then add listener
    const addListener = () => {
      const doc = iframe.contentDocument;
      if (doc) {
        doc.addEventListener('click', handleIframeClick);
      }
    };

    // Add listener after content loads
    const timer = setTimeout(addListener, 150);
    iframe.addEventListener('load', addListener);

    return () => {
      clearTimeout(timer);
      iframe.removeEventListener('load', addListener);
      const doc = iframe.contentDocument;
      if (doc) {
        doc.removeEventListener('click', handleIframeClick);
      }
    };
  }, [html, key, onSelectNode]);

  return (
    <div className="preview-container" ref={containerRef}>
      <div className="preview-toolbar">
        <span className="preview-title">Preview</span>
        <div className="preview-actions">
          <button
            className="preview-action"
            onClick={handleRefresh}
            disabled={isCompiling}
            title="Refresh preview"
          >
            <RefreshCw size={14} className={isCompiling ? "spinning" : ""} />
          </button>
          {onOpenInBrowser && (
            <button
              className="preview-action"
              onClick={onOpenInBrowser}
              title="Open in browser"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>
      <div
        ref={(el) => {
          setNodeRef(el);
          (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={`preview-content ${isDragging ? 'preview-drop-active' : ''} ${isOver ? 'preview-drop-over' : ''} ${draggingNodeId ? 'dragging-node' : ''}`}
        onClick={handleContentClick}
      >
        {isCompiling ? (
          <div className="preview-loading">
            <Play size={24} className="spinning" />
            <span>Compiling...</span>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              key={key}
              className="preview-iframe"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
            />
            {/* Node overlays - allows selecting and moving ALL components */}
            {canvasNodes.map((node) => {
              const bounds = nodeBounds[node.id];
              // Skip nodes we can't find in the iframe
              if (!bounds) return null;

              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isBeingDragged = draggingNodeId === node.id;
              const isVisible = isSelected || isHovered || isBeingDragged;

              // When dragging, use drag position; otherwise use iframe bounds
              const displayX = isBeingDragged && dragPosition ? dragPosition.x : bounds.x;
              const displayY = isBeingDragged && dragPosition ? dragPosition.y : bounds.y;

              return (
                <div
                  key={node.id}
                  className={`preview-node-overlay ${isSelected ? 'selected' : ''} ${isBeingDragged ? 'dragging' : ''} ${isVisible ? 'visible' : ''}`}
                  style={{
                    left: displayX,
                    top: displayY,
                    width: bounds.width,
                    height: bounds.height,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    overlayClickedRef.current = true;
                    onSelectNode?.(node.id);
                  }}
                  onMouseDown={(e) => {
                    overlayClickedRef.current = true;
                    handleNodeDragStart(node.id, e);
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  <div className="node-overlay-label">
                    <Move size={10} />
                    <span>{node.componentName}</span>
                  </div>
                </div>
              );
            })}
            {isDragging && dropPosition && (
              <div
                className="preview-drop-indicator"
                style={{
                  left: dropPosition.x,
                  top: dropPosition.y,
                }}
              >
                <div className="drop-indicator-box">
                  <span className="drop-indicator-name">{draggedComponent?.name || 'Component'}</span>
                </div>
              </div>
            )}
          </>
        )}
        {isDragging && (
          <div className="preview-drop-overlay">
            <span>Drop component here to position it</span>
          </div>
        )}
      </div>
    </div>
  );
}
