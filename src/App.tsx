import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Panel as ResizablePanel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Layout, EyeOff } from "lucide-react";
import {
  ActivityBar,
  Sidebar,
  StatusBar,
  EditorArea,
  Panel,
  type ActivityView,
  type PanelTab,
} from "./components/Layout";
import { Editor, EditorTabs } from "./components/Editor";
import { FileExplorer } from "./components/FileExplorer";
import { Preview } from "./components/Preview";
import { TerminalContainer } from "./components/Terminal";
import { VisualEditor } from "./components/VisualEditor";
import { ProblemsPanel } from "./components/ProblemsPanel";
import { OutputPanel } from "./components/OutputPanel";
import {
  ElementsTab as DevToolsElementsTab,
  ConsoleTab,
  SourcesTab,
  NetworkTab,
  PerformanceTab,
  MemoryTab,
  ApplicationTab,
  SecurityTab,
  FluxScoreTab,
  RecorderTab,
} from "./components/DevTools/tabs";
import { useEditorStore } from "./stores/editor-store";
import { useFileStore } from "./stores/file-store";
import { useVisualEditorStore, generateNodeId } from "./stores/visual-editor-store";
import { useFileSystem } from "./hooks/useFileSystem";
import { useCompiler } from "./hooks/useCompiler";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { ComponentDefinition, CanvasNode } from "./types/visual-editor";
import "./App.css";
import "./components/DevTools/DevTools.css";

function App() {
  const [activeView, setActiveView] = useState<ActivityView>("explorer");
  const [activePanel, setActivePanel] = useState<PanelTab>("terminal");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showPreview] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");
  const [compiledHtml, setCompiledHtml] = useState<string | null>(null);
  const [compiledCss, setCompiledCss] = useState<string | null>(null);
  const [compiledJs, setCompiledJs] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<ComponentDefinition | null>(null);

  // Ref for preview iframe - shared between Preview and DevTools tabs
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // Visual editor store
  const {
    isVisualPanelVisible,
    setVisualPanelVisible,
    addNode,
    nodes,
    moveNode,
    selectedNodeId,
    selectNode,
    updateNodeStyles,
  } = useVisualEditorStore();

  // Configure drag sensors for app-level DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Editor store
  const {
    openFiles,
    activeFileId,
    openFile,
    closeFile,
    setActiveFile,
    updateContent,
    markSaved,
    getActiveFile,
  } = useEditorStore();

  // File system hook
  const { writeFile, readDirectory } = useFileSystem();

  // File store for current working directory
  const { rootPath, setRootPath, setFiles, setLoading } = useFileStore();

  // Compiler hook
  const { compileFile, compileContent, generatePreviewHtml, isCompiling, errors: compilerErrors, lastResult: compilerResult } = useCompiler();

  // Get the active file
  const activeFile = getActiveFile();

  // Ref for debouncing live preview
  const livePreviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if active file is a Flux file
  const isFluxFile = activeFile?.name.endsWith(".flux");

  // Compute all canvas nodes from visual editor store
  // This includes ALL nodes so they can be selected/moved in the preview
  const allCanvasNodes = useMemo(() => {
    const result: { id: string; componentName: string; className: string; isPositioned: boolean; x: number; y: number }[] = [];

    function collectAllNodes(nodeList: CanvasNode[]) {
      for (const node of nodeList) {
        // The className is now the full node.id in the code generator
        const isPositioned = node.styles.position === 'absolute' && !!node.styles.left && !!node.styles.top;
        result.push({
          id: node.id,
          componentName: node.componentName,
          className: node.id, // Use full ID as class name
          isPositioned: isPositioned,
          x: isPositioned ? (parseFloat(node.styles.left) || 0) : 0,
          y: isPositioned ? (parseFloat(node.styles.top) || 0) : 0,
        });
        if (node.children.length > 0) {
          collectAllNodes(node.children);
        }
      }
    }

    collectAllNodes(nodes);
    return result;
  }, [nodes]);

  // Handle moving a positioned node in the preview
  const handleMoveNode = useCallback((nodeId: string, x: number, y: number) => {
    updateNodeStyles(nodeId, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
    });
  }, [updateNodeStyles]);

  const handleViewChange = (view: ActivityView) => {
    if (view === activeView) {
      setIsSidebarVisible(!isSidebarVisible);
    } else {
      setActiveView(view);
      setIsSidebarVisible(true);
    }
  };

  // Handle file open from explorer
  const handleFileOpen = useCallback(
    (path: string, name: string, content: string) => {
      openFile(path, name, content);
    },
    [openFile]
  );

  // Handle content change in editor
  const handleContentChange = useCallback(
    (content: string) => {
      if (activeFileId) {
        updateContent(activeFileId, content);
      }
    },
    [activeFileId, updateContent]
  );

  // Compile the current file
  const handleCompile = useCallback(async () => {
    if (!activeFile || !isFluxFile) return;

    // Use /tmp as output directory
    const outputDir = "/tmp/fluxide-preview";
    const result = await compileFile(activeFile.path, outputDir);
    const html = generatePreviewHtml(result);
    setPreviewHtml(html);
  }, [activeFile, isFluxFile, compileFile, generatePreviewHtml]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!activeFile) return;

    // Always try to save, even if not marked dirty (visual editor might not mark it correctly)
    try {
      await writeFile(activeFile.path, activeFile.content);
      markSaved(activeFile.id);

      // Auto-compile on save if it's a Flux file
      if (isFluxFile) {
        handleCompile();
      }
    } catch (error) {
      console.error("Failed to save file:", error);
    }
  }, [activeFile, writeFile, markSaved, isFluxFile, handleCompile]);

  // Initial compile when opening a Flux file
  useEffect(() => {
    if (isFluxFile && activeFile && !activeFile.isDirty) {
      handleCompile();
    }
  }, [activeFileId]); // Only on file change, not on every render

  // Live preview: compile content on change (debounced)
  useEffect(() => {
    if (!isFluxFile || !activeFile || !activeFile.content.trim()) return;

    // Clear any pending timeout
    if (livePreviewTimeoutRef.current) {
      clearTimeout(livePreviewTimeoutRef.current);
    }

    // Debounce the compilation by 500ms for smoother editing
    livePreviewTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await compileContent(activeFile.content, activeFile.name);
        const html = generatePreviewHtml(result);
        // Only update if we got valid HTML back
        if (html) {
          setPreviewHtml(html);
        }
        // Store individual compiled parts for the Elements panel
        setCompiledHtml(result.html);
        setCompiledCss(result.css);
        setCompiledJs(result.js);
      } catch (error) {
        console.error("Live preview compilation error:", error);
        // On error, show error in preview instead of going blank
        setPreviewHtml(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: system-ui; padding: 20px; background: #1e1e1e; }
                .error { color: #f14c4c; background: #2d2020; padding: 16px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <div class="error">Live preview error: ${String(error)}</div>
            </body>
          </html>
        `);
        // Clear compiled parts on error
        setCompiledHtml(null);
        setCompiledCss(null);
        setCompiledJs(null);
      }
    }, 500);

    return () => {
      if (livePreviewTimeoutRef.current) {
        clearTimeout(livePreviewTimeoutRef.current);
      }
    };
  }, [activeFile?.content, isFluxFile, compileContent, generatePreviewHtml]);

  // Open folder handler
  const handleOpenFolder = useCallback(async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Open Folder",
    });
    if (selected && typeof selected === "string") {
      // Extract folder name from path
      const name = selected.split("/").pop() || selected;
      setRootPath(selected, name);
      setLoading(true);

      try {
        const entries = await readDirectory(selected);
        setFiles(entries);
      } catch (error) {
        console.error("Failed to load directory:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [setRootPath, setLoading, readDirectory, setFiles]);

  // Close current tab
  const handleCloseCurrentTab = useCallback(() => {
    if (activeFileId) {
      closeFile(activeFileId);
    }
  }, [activeFileId, closeFile]);

  // Navigate to next tab
  const handleNextTab = useCallback(() => {
    const files = Array.from(openFiles.values());
    if (files.length <= 1) return;
    const currentIndex = files.findIndex((f) => f.id === activeFileId);
    const nextIndex = (currentIndex + 1) % files.length;
    setActiveFile(files[nextIndex].id);
  }, [openFiles, activeFileId, setActiveFile]);

  // Navigate to previous tab
  const handlePrevTab = useCallback(() => {
    const files = Array.from(openFiles.values());
    if (files.length <= 1) return;
    const currentIndex = files.findIndex((f) => f.id === activeFileId);
    const prevIndex = (currentIndex - 1 + files.length) % files.length;
    setActiveFile(files[prevIndex].id);
  }, [openFiles, activeFileId, setActiveFile]);

  // Toggle terminal visibility
  const handleToggleTerminal = useCallback(() => {
    if (isPanelCollapsed) {
      setIsPanelCollapsed(false);
      setActivePanel("terminal");
    } else if (activePanel === "terminal") {
      setIsPanelCollapsed(true);
    } else {
      setActivePanel("terminal");
    }
  }, [isPanelCollapsed, activePanel]);

  // Toggle sidebar visibility
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarVisible((prev) => !prev);
  }, []);

  // Keyboard shortcuts
  const shortcuts = useMemo(
    () => [
      { key: "s", ctrl: true, handler: handleSave },
      { key: "b", ctrl: true, handler: handleToggleSidebar },
      { key: "Backquote", ctrl: true, handler: handleToggleTerminal },
      { key: "o", ctrl: true, shift: true, handler: handleOpenFolder },
      { key: "w", ctrl: true, handler: handleCloseCurrentTab },
      { key: "Tab", ctrl: true, handler: handleNextTab },
      { key: "Tab", ctrl: true, shift: true, handler: handlePrevTab },
    ],
    [
      handleSave,
      handleToggleSidebar,
      handleToggleTerminal,
      handleOpenFolder,
      handleCloseCurrentTab,
      handleNextTab,
      handlePrevTab,
    ]
  );

  useKeyboardShortcuts(shortcuts);

  // Handle drag start - track what's being dragged
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeData = event.active.data.current as { type: string; componentDef?: ComponentDefinition };
    if (activeData?.type === 'palette' && activeData.componentDef) {
      setActiveDragItem(activeData.componentDef);
    }
  }, []);

  // Handle drag end - create node with position if dropped on preview
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as { type: string; componentDef?: ComponentDefinition; node?: CanvasNode };
    const overData = over.data.current as {
      type: string;
      parentId?: string | null;
      depth?: number;
      position?: { x: number; y: number };
      getPosition?: () => { x: number; y: number } | null;
    };

    // Dragging from palette
    if (activeData?.type === 'palette' && activeData.componentDef) {
      const newNode: CanvasNode = {
        id: generateNodeId(),
        componentName: activeData.componentDef.name,
        props: {},
        styles: {},
        events: {},
        children: [],
        parentId: null,
      };

      // Set default props
      activeData.componentDef.props.forEach(prop => {
        if (prop.defaultValue !== undefined) {
          newNode.props[prop.name] = prop.defaultValue;
        }
      });

      // If dropped on preview with position, add absolute positioning and add to ROOT only
      // Use getPosition() if available (for real-time position), fall back to static position
      const dropPosition = overData?.getPosition?.() ?? overData?.position;
      if (overData?.type === 'preview' && dropPosition) {
        newNode.styles = {
          position: 'absolute',
          left: `${dropPosition.x}px`,
          top: `${dropPosition.y}px`,
        };
        // Always add to root level when dropping on preview - no nesting
        addNode(newNode, null, nodes.length);
      } else if (overData?.type === 'dropzone') {
        // Dropped on a specific dropzone in the visual canvas - nest inside parent
        const parentId = overData.parentId ?? null;
        addNode(newNode, parentId, 0);
      } else if (overData?.type === 'root' || overData?.type === 'canvas') {
        // Dropped on root canvas - add to root level
        addNode(newNode, null, nodes.length);
      }
    }

    // Dragging within canvas - reorder
    if (activeData?.type === 'canvas' && activeData.node) {
      const nodeId = active.id as string;
      if (overData?.type === 'dropzone') {
        const newParentId = overData.parentId ?? null;
        moveNode(nodeId, newParentId, 0);
      } else if (over.id !== active.id) {
        const targetNode = nodes.find(n => n.id === over.id);
        if (targetNode) {
          const targetParentId = targetNode.parentId;
          moveNode(nodeId, targetParentId, 1);
        }
      }
    }
  }, [addNode, moveNode, nodes]);

  // Render sidebar content based on active view
  const renderSidebarContent = () => {
    switch (activeView) {
      case "explorer":
        return <FileExplorer onFileOpen={handleFileOpen} />;
      case "search":
        return (
          <div className="placeholder-content">
            <p>Search</p>
            <p className="muted">Coming soon</p>
          </div>
        );
      case "git":
        return (
          <div className="placeholder-content">
            <p>Source Control</p>
            <p className="muted">Coming soon</p>
          </div>
        );
      case "run":
        return (
          <div className="placeholder-content">
            <p>Run and Debug</p>
            <p className="muted">Coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
    <div className="app-container">
      <div className="app-main">
        <ActivityBar activeView={activeView} onViewChange={handleViewChange} />

        <PanelGroup direction="horizontal" className="main-panel-group">
          {isSidebarVisible && (
            <>
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={40}
                className="sidebar-panel"
              >
                <Sidebar title={activeView.toUpperCase()}>
                  {renderSidebarContent()}
                </Sidebar>
              </ResizablePanel>
              <PanelResizeHandle className="resize-handle-horizontal" />
            </>
          )}

          <ResizablePanel minSize={30} className="editor-panel">
            <PanelGroup direction="vertical">
              <ResizablePanel minSize={20} className="editor-content-panel">
                <PanelGroup direction="horizontal">
                  <ResizablePanel minSize={isFluxFile && isVisualPanelVisible ? 25 : 30} className="code-panel">
                    <EditorArea>
                      <div className="editor-toolbar">
                        <EditorTabs
                          files={openFiles}
                          activeFileId={activeFileId}
                          onSelectTab={setActiveFile}
                          onCloseTab={closeFile}
                        />
                        {isFluxFile && (
                          <button
                            className="visual-toggle-btn"
                            onClick={() => setVisualPanelVisible(!isVisualPanelVisible)}
                            title={isVisualPanelVisible ? "Hide Visual Editor" : "Show Visual Editor"}
                          >
                            {isVisualPanelVisible ? <EyeOff size={14} /> : <Layout size={14} />}
                            <span>{isVisualPanelVisible ? "Hide Visual" : "Show Visual"}</span>
                          </button>
                        )}
                      </div>
                      {activeFile ? (
                        <Editor
                          filePath={activeFile.path}
                          content={activeFile.content}
                          onChange={handleContentChange}
                          onSave={handleSave}
                        />
                      ) : (
                        <div className="welcome-screen">
                          <div className="welcome-logo">F</div>
                          <h1>FluxIDE</h1>
                          <p>A standalone IDE for the Flux programming language</p>
                          <div className="welcome-shortcuts">
                            <div className="shortcut">
                              <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd>
                              <span>Open Folder</span>
                            </div>
                            <div className="shortcut">
                              <kbd>Ctrl</kbd>+<kbd>S</kbd>
                              <span>Save File</span>
                            </div>
                            <div className="shortcut">
                              <kbd>Ctrl</kbd>+<kbd>`</kbd>
                              <span>Toggle Terminal</span>
                            </div>
                            <div className="shortcut">
                              <kbd>Ctrl</kbd>+<kbd>B</kbd>
                              <span>Toggle Sidebar</span>
                            </div>
                          </div>
                          <button
                            className="welcome-button"
                            onClick={handleOpenFolder}
                          >
                            Open Folder
                          </button>
                        </div>
                      )}
                    </EditorArea>
                  </ResizablePanel>

                  {/* Visual Editor Panel - shown for .flux files */}
                  {isFluxFile && isVisualPanelVisible && activeFile && (
                    <>
                      <PanelResizeHandle className="resize-handle-horizontal" />
                      <ResizablePanel
                        defaultSize={40}
                        minSize={25}
                        maxSize={60}
                        className="visual-editor-panel"
                      >
                        <VisualEditor
                          code={activeFile.content}
                          onCodeChange={handleContentChange}
                          fileName={activeFile.name}
                        />
                      </ResizablePanel>
                    </>
                  )}

                  {showPreview && isFluxFile && (
                    <>
                      <PanelResizeHandle className="resize-handle-horizontal" />
                      <ResizablePanel
                        defaultSize={isVisualPanelVisible ? 25 : 40}
                        minSize={15}
                        maxSize={50}
                        className="preview-panel"
                      >
                        <Preview
                          html={previewHtml}
                          isCompiling={isCompiling}
                          onRefresh={handleCompile}
                          isDragging={activeDragItem !== null}
                          draggedComponent={activeDragItem}
                          canvasNodes={allCanvasNodes}
                          selectedNodeId={selectedNodeId}
                          onSelectNode={selectNode}
                          onMoveNode={handleMoveNode}
                          iframeRef={previewIframeRef}
                        />
                      </ResizablePanel>
                    </>
                  )}
                </PanelGroup>
              </ResizablePanel>

              <PanelResizeHandle className="resize-handle-vertical" />

              <ResizablePanel
                defaultSize={30}
                minSize={isPanelCollapsed ? 3 : 10}
                maxSize={isPanelCollapsed ? 3 : 50}
                className="bottom-panel"
              >
                <Panel
                  activeTab={activePanel}
                  onTabChange={setActivePanel}
                  isCollapsed={isPanelCollapsed}
                  onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
                >
                  {/* Always render terminal but hide when not active to preserve PTY connections */}
                  <div style={{
                    display: activePanel === "terminal" && !isPanelCollapsed ? "flex" : "none",
                    flexDirection: "column",
                    height: "100%",
                    width: "100%"
                  }}>
                    <TerminalContainer cwd={rootPath || undefined} />
                  </div>
                  {activePanel === "problems" && !isPanelCollapsed && (
                    <ProblemsPanel
                      problems={compilerErrors.map(e => ({
                        ...e,
                        severity: "error" as const,
                        file: activeFile?.name,
                      }))}
                    />
                  )}
                  {activePanel === "output" && !isPanelCollapsed && (
                    <OutputPanel
                      stdout={compilerResult?.stdout || null}
                      stderr={compilerResult?.stderr || null}
                      success={compilerResult?.success ?? null}
                      fileName={activeFile?.name}
                    />
                  )}
                  {activePanel === "elements" && !isPanelCollapsed && (
                    <DevToolsElementsTab iframeRef={previewIframeRef} />
                  )}
                  {activePanel === "console" && !isPanelCollapsed && (
                    <ConsoleTab iframeRef={previewIframeRef} />
                  )}
                  {activePanel === "sources" && !isPanelCollapsed && (
                    <SourcesTab
                      iframeRef={previewIframeRef}
                      compiledHtml={compiledHtml}
                      compiledCss={compiledCss}
                      compiledJs={compiledJs}
                    />
                  )}
                  {activePanel === "network" && !isPanelCollapsed && (
                    <NetworkTab iframeRef={previewIframeRef} />
                  )}
                  {activePanel === "performance" && !isPanelCollapsed && (
                    <PerformanceTab iframeRef={previewIframeRef} />
                  )}
                  {activePanel === "memory" && !isPanelCollapsed && (
                    <MemoryTab iframeRef={previewIframeRef} />
                  )}
                  {activePanel === "application" && !isPanelCollapsed && (
                    <ApplicationTab iframeRef={previewIframeRef} />
                  )}
                  {activePanel === "security" && !isPanelCollapsed && (
                    <SecurityTab iframeRef={previewIframeRef} />
                  )}
                  {activePanel === "fluxscore" && !isPanelCollapsed && (
                    <FluxScoreTab iframeRef={previewIframeRef} />
                  )}
                  {activePanel === "recorder" && !isPanelCollapsed && (
                    <RecorderTab iframeRef={previewIframeRef} />
                  )}
                </Panel>
              </ResizablePanel>
            </PanelGroup>
          </ResizablePanel>
        </PanelGroup>
      </div>

      <StatusBar
        branch="main"
        line={1}
        column={1}
        language={activeFile?.language || "Flux"}
        encoding="UTF-8"
        status={isCompiling ? "compiling" : "ready"}
      />
    </div>
    <DragOverlay>
      {activeDragItem && (
        <div className="drag-overlay-component">
          {activeDragItem.name}
        </div>
      )}
    </DragOverlay>
    </DndContext>
  );
}

export default App;
