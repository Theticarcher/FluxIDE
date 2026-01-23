import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Panel as ResizablePanel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { open } from "@tauri-apps/plugin-dialog";
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
import { useEditorStore } from "./stores/editor-store";
import { useFileStore } from "./stores/file-store";
import { useFileSystem } from "./hooks/useFileSystem";
import { useCompiler } from "./hooks/useCompiler";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import "./App.css";

function App() {
  const [activeView, setActiveView] = useState<ActivityView>("explorer");
  const [activePanel, setActivePanel] = useState<PanelTab>("terminal");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showPreview] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");

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
  const { compileFile, generatePreviewHtml, isCompiling } = useCompiler();

  // Get the active file
  const activeFile = getActiveFile();

  // Check if active file is a Flux file
  const isFluxFile = activeFile?.name.endsWith(".flux");

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
    if (!activeFile || !activeFile.isDirty) return;

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
                  <ResizablePanel minSize={30} className="code-panel">
                    <EditorArea>
                      <EditorTabs
                        files={openFiles}
                        activeFileId={activeFileId}
                        onSelectTab={setActiveFile}
                        onCloseTab={closeFile}
                      />
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

                  {showPreview && isFluxFile && (
                    <>
                      <PanelResizeHandle className="resize-handle-horizontal" />
                      <ResizablePanel
                        defaultSize={40}
                        minSize={20}
                        maxSize={60}
                        className="preview-panel"
                      >
                        <Preview
                          html={previewHtml}
                          isCompiling={isCompiling}
                          onRefresh={handleCompile}
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
                  {activePanel === "terminal" && !isPanelCollapsed && (
                    <TerminalContainer cwd={rootPath || undefined} />
                  )}
                  {activePanel === "problems" && !isPanelCollapsed && (
                    <div className="panel-placeholder">
                      <p>No problems detected</p>
                    </div>
                  )}
                  {activePanel === "output" && !isPanelCollapsed && (
                    <div className="panel-placeholder">
                      <p>Output will appear here</p>
                    </div>
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
  );
}

export default App;
