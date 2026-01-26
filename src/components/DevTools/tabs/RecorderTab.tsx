import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Square, Trash2, Download, Copy, MousePointer, Type, Navigation, Clock } from "lucide-react";

interface RecordedAction {
  id: number;
  type: "click" | "input" | "navigate" | "scroll" | "keypress" | "hover";
  timestamp: number;
  selector: string;
  value?: string;
  position?: { x: number; y: number };
  details: string;
}

interface RecorderTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function RecorderTab({ iframeRef }: RecorderTabProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  const actionIdRef = useRef(0);

  const getSelector = useCallback((element: Element): string => {
    // Try to get a unique, readable selector
    if (element.id) {
      return `#${element.id}`;
    }

    const classes = Array.from(element.classList).filter(c => !c.includes("__"));
    if (classes.length > 0) {
      const classSelector = `.${classes.slice(0, 2).join(".")}`;
      const doc = element.ownerDocument;
      if (doc.querySelectorAll(classSelector).length === 1) {
        return classSelector;
      }
    }

    // Use tag name with nth-child
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      const tagName = element.tagName.toLowerCase();
      return `${getSelector(parent)} > ${tagName}:nth-child(${index + 1})`;
    }

    return element.tagName.toLowerCase();
  }, []);

  const addAction = useCallback((action: Omit<RecordedAction, "id" | "timestamp">) => {
    if (!startTime) return;

    const newAction: RecordedAction = {
      ...action,
      id: ++actionIdRef.current,
      timestamp: Date.now() - startTime,
    };

    setActions(prev => [...prev, newAction]);
  }, [startTime]);

  // Set up event listeners on iframe
  useEffect(() => {
    if (!isRecording) return;

    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target) return;

      addAction({
        type: "click",
        selector: getSelector(target),
        position: { x: e.clientX, y: e.clientY },
        details: `Click on ${target.tagName.toLowerCase()}${target.textContent?.slice(0, 20) ? ` "${target.textContent.slice(0, 20)}..."` : ""}`,
      });
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target) return;

      addAction({
        type: "input",
        selector: getSelector(target),
        value: target.value,
        details: `Type "${target.value.slice(0, 30)}${target.value.length > 30 ? "..." : ""}" into ${target.tagName.toLowerCase()}`,
      });
    };

    const handleKeydown = (e: KeyboardEvent) => {
      // Only record special keys
      if (["Enter", "Tab", "Escape", "Backspace", "Delete"].includes(e.key)) {
        const target = e.target as Element;
        addAction({
          type: "keypress",
          selector: getSelector(target),
          value: e.key,
          details: `Press ${e.key}`,
        });
      }
    };

    const handleScroll = () => {
      const win = iframe.contentWindow;
      if (!win) return;

      // Debounce scroll events
      addAction({
        type: "scroll",
        selector: "window",
        position: { x: win.scrollX, y: win.scrollY },
        details: `Scroll to (${win.scrollX}, ${win.scrollY})`,
      });
    };

    // Debounced scroll handler
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    doc.addEventListener("click", handleClick, true);
    doc.addEventListener("input", handleInput, true);
    doc.addEventListener("keydown", handleKeydown, true);
    iframe.contentWindow?.addEventListener("scroll", debouncedScroll);

    return () => {
      doc.removeEventListener("click", handleClick, true);
      doc.removeEventListener("input", handleInput, true);
      doc.removeEventListener("keydown", handleKeydown, true);
      iframe.contentWindow?.removeEventListener("scroll", debouncedScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isRecording, iframeRef, addAction, getSelector]);

  const startRecording = () => {
    setIsRecording(true);
    setStartTime(Date.now());
    setActions([]);
    actionIdRef.current = 0;
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const clearRecording = () => {
    setActions([]);
    setStartTime(null);
    setSelectedAction(null);
  };

  const formatTimestamp = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${milliseconds.toString().padStart(3, "0")}s`;
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "click": return <MousePointer size={12} />;
      case "input": return <Type size={12} />;
      case "navigate": return <Navigation size={12} />;
      case "keypress": return <Type size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const generateCode = (format: "playwright" | "cypress" | "puppeteer" | "flux-test") => {
    let code = "";

    switch (format) {
      case "playwright":
        code = `import { test, expect } from '@playwright/test';\n\n`;
        code += `test('recorded test', async ({ page }) => {\n`;
        code += `  await page.goto('YOUR_URL');\n\n`;
        actions.forEach(action => {
          switch (action.type) {
            case "click":
              code += `  await page.click('${action.selector}');\n`;
              break;
            case "input":
              code += `  await page.fill('${action.selector}', '${action.value}');\n`;
              break;
            case "keypress":
              code += `  await page.keyboard.press('${action.value}');\n`;
              break;
          }
        });
        code += `});\n`;
        break;

      case "cypress":
        code = `describe('Recorded Test', () => {\n`;
        code += `  it('should perform recorded actions', () => {\n`;
        code += `    cy.visit('YOUR_URL');\n\n`;
        actions.forEach(action => {
          switch (action.type) {
            case "click":
              code += `    cy.get('${action.selector}').click();\n`;
              break;
            case "input":
              code += `    cy.get('${action.selector}').type('${action.value}');\n`;
              break;
            case "keypress":
              code += `    cy.get('${action.selector}').type('{${action.value?.toLowerCase()}}');\n`;
              break;
          }
        });
        code += `  });\n`;
        code += `});\n`;
        break;

      case "puppeteer":
        code = `const puppeteer = require('puppeteer');\n\n`;
        code += `(async () => {\n`;
        code += `  const browser = await puppeteer.launch();\n`;
        code += `  const page = await browser.newPage();\n`;
        code += `  await page.goto('YOUR_URL');\n\n`;
        actions.forEach(action => {
          switch (action.type) {
            case "click":
              code += `  await page.click('${action.selector}');\n`;
              break;
            case "input":
              code += `  await page.type('${action.selector}', '${action.value}');\n`;
              break;
            case "keypress":
              code += `  await page.keyboard.press('${action.value}');\n`;
              break;
          }
        });
        code += `\n  await browser.close();\n`;
        code += `})();\n`;
        break;

      case "flux-test":
        code = `// Flux Test Recording\n`;
        code += `// Generated: ${new Date().toISOString()}\n\n`;
        code += `test "Recorded User Flow" {\n`;
        actions.forEach(action => {
          switch (action.type) {
            case "click":
              code += `  click "${action.selector}"\n`;
              break;
            case "input":
              code += `  type "${action.selector}" "${action.value}"\n`;
              break;
            case "keypress":
              code += `  press "${action.value}"\n`;
              break;
            case "scroll":
              code += `  scroll to ${action.position?.x}, ${action.position?.y}\n`;
              break;
          }
        });
        code += `}\n`;
        break;
    }

    return code;
  };

  const copyCode = (format: "playwright" | "cypress" | "puppeteer" | "flux-test") => {
    const code = generateCode(format);
    navigator.clipboard.writeText(code);
  };

  const downloadCode = (format: "playwright" | "cypress" | "puppeteer" | "flux-test") => {
    const code = generateCode(format);
    const extensions = {
      playwright: "spec.ts",
      cypress: "cy.js",
      puppeteer: "test.js",
      "flux-test": "flux-test",
    };

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recorded-test.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="recorder-tab">
      <div className="recorder-toolbar">
        {!isRecording ? (
          <button className="toolbar-btn primary" onClick={startRecording}>
            <Play size={12} /> Start Recording
          </button>
        ) : (
          <button className="toolbar-btn danger" onClick={stopRecording}>
            <Square size={12} /> Stop Recording
          </button>
        )}
        <button className="toolbar-btn" onClick={clearRecording} disabled={actions.length === 0}>
          <Trash2 size={12} /> Clear
        </button>
        {isRecording && (
          <span className="recording-indicator">
            <span className="recording-dot" />
            Recording... {actions.length} action(s)
          </span>
        )}
      </div>

      <div className="recorder-content">
        <div className="actions-panel">
          <h3>Recorded Actions ({actions.length})</h3>
          {actions.length === 0 ? (
            <div className="empty-state">
              <MousePointer size={24} />
              <p>No actions recorded</p>
              <p className="hint">
                {isRecording
                  ? "Interact with the preview to record actions"
                  : "Click 'Start Recording' and interact with the preview"
                }
              </p>
            </div>
          ) : (
            <div className="actions-list">
              {actions.map((action, index) => (
                <div
                  key={action.id}
                  className={`action-item ${selectedAction === action.id ? "selected" : ""}`}
                  onClick={() => setSelectedAction(action.id)}
                >
                  <span className="action-number">{index + 1}</span>
                  <span className="action-icon">{getActionIcon(action.type)}</span>
                  <span className="action-details">{action.details}</span>
                  <span className="action-time">{formatTimestamp(action.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {actions.length > 0 && (
          <div className="export-panel">
            <h3>Export Recording</h3>
            <div className="export-options">
              <div className="export-option">
                <span className="export-name">Playwright</span>
                <div className="export-actions">
                  <button onClick={() => copyCode("playwright")} title="Copy">
                    <Copy size={12} />
                  </button>
                  <button onClick={() => downloadCode("playwright")} title="Download">
                    <Download size={12} />
                  </button>
                </div>
              </div>
              <div className="export-option">
                <span className="export-name">Cypress</span>
                <div className="export-actions">
                  <button onClick={() => copyCode("cypress")} title="Copy">
                    <Copy size={12} />
                  </button>
                  <button onClick={() => downloadCode("cypress")} title="Download">
                    <Download size={12} />
                  </button>
                </div>
              </div>
              <div className="export-option">
                <span className="export-name">Puppeteer</span>
                <div className="export-actions">
                  <button onClick={() => copyCode("puppeteer")} title="Copy">
                    <Copy size={12} />
                  </button>
                  <button onClick={() => downloadCode("puppeteer")} title="Download">
                    <Download size={12} />
                  </button>
                </div>
              </div>
              <div className="export-option">
                <span className="export-name">Flux Test</span>
                <div className="export-actions">
                  <button onClick={() => copyCode("flux-test")} title="Copy">
                    <Copy size={12} />
                  </button>
                  <button onClick={() => downloadCode("flux-test")} title="Download">
                    <Download size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="code-preview">
              <h4>Code Preview (Flux Test)</h4>
              <pre>{generateCode("flux-test")}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
