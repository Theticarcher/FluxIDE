import { useEffect, useRef } from 'react';
import { useVisualEditorStore } from '../../stores/visual-editor-store';
import { ComponentPalette } from './ComponentPalette';
import { Canvas } from './Canvas';
import { PropertyPanel } from './PropertyPanel';
import { generateFluxCode } from './CodeGenerator/codeGenerator';
import { parseFluxToTree, extractName } from './CodeGenerator/codeParser';
import './VisualEditor.css';

interface VisualEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  fileName?: string;
}

export function VisualEditor({ code, onCodeChange, fileName }: VisualEditorProps) {
  const {
    nodes,
    setNodes,
    selectedNodeId,
    selectNode,
  } = useVisualEditorStore();

  const lastCodeRef = useRef<string>('');
  const lastNodesJsonRef = useRef<string>('[]');
  const syncSourceRef = useRef<'code' | 'visual' | null>(null);

  // Sync code -> visual tree when code changes externally
  useEffect(() => {
    // Skip if this change originated from the visual editor
    if (syncSourceRef.current === 'visual') {
      syncSourceRef.current = null;
      return;
    }

    if (code !== lastCodeRef.current) {
      syncSourceRef.current = 'code';
      lastCodeRef.current = code;

      // Parse code to tree
      const parsedNodes = parseFluxToTree(code);
      const nodesJson = JSON.stringify(parsedNodes);

      // Only update if the parsed structure is different
      if (nodesJson !== lastNodesJsonRef.current) {
        lastNodesJsonRef.current = nodesJson;
        setNodes(parsedNodes);
      }

      // Reset sync source after a tick to allow the nodes effect to see it
      setTimeout(() => {
        if (syncSourceRef.current === 'code') {
          syncSourceRef.current = null;
        }
      }, 0);
    }
  }, [code, setNodes]);

  // Sync visual tree -> code when tree changes
  useEffect(() => {
    const nodesJson = JSON.stringify(nodes);

    // Skip if this change originated from parsing code
    if (syncSourceRef.current === 'code') {
      lastNodesJsonRef.current = nodesJson;
      return;
    }

    // Skip if nodes haven't actually changed
    if (nodesJson === lastNodesJsonRef.current) {
      return;
    }

    lastNodesJsonRef.current = nodesJson;
    syncSourceRef.current = 'visual';

    const pageName = extractName(code) || fileName?.replace('.flux', '') || 'MyPage';
    const generatedCode = generateFluxCode(nodes, pageName, false);

    if (generatedCode !== lastCodeRef.current) {
      lastCodeRef.current = generatedCode;
      onCodeChange(generatedCode);
    }
  }, [nodes, code, fileName, onCodeChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected node
      if (e.key === 'Delete' && selectedNodeId) {
        e.preventDefault();
        const { removeNode } = useVisualEditorStore.getState();
        removeNode(selectedNodeId);
      }

      // Duplicate selected node
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        const { duplicateNode } = useVisualEditorStore.getState();
        duplicateNode(selectedNodeId);
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const { undo, canUndo } = useVisualEditorStore.getState();
        if (canUndo()) undo();
      }

      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        const { redo, canRedo } = useVisualEditorStore.getState();
        if (canRedo()) redo();
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        selectNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectNode]);

  return (
    <div className="visual-editor">
      <ComponentPalette />
      <Canvas />
      <PropertyPanel />
    </div>
  );
}
