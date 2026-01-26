import { useState } from "react";
import { ChevronDown, ChevronRight, FileCode, FileType, Braces } from "lucide-react";
import "./ElementsPanel.css";

interface ElementsPanelProps {
  html: string | null;
  css: string | null;
  js: string | null;
}

type TabType = "html" | "css" | "js";

export function ElementsPanel({ html, css, js }: ElementsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("html");
  const [isHtmlExpanded, setIsHtmlExpanded] = useState(true);
  const [isCssExpanded, setIsCssExpanded] = useState(true);
  const [isJsExpanded, setIsJsExpanded] = useState(true);

  const tabs: { id: TabType; label: string; icon: typeof FileCode }[] = [
    { id: "html", label: "HTML", icon: FileCode },
    { id: "css", label: "CSS", icon: FileType },
    { id: "js", label: "JS", icon: Braces },
  ];

  // Check if each tab has content (for showing indicator dot)
  const hasContent = (tabId: TabType): boolean => {
    switch (tabId) {
      case "html": return !!html;
      case "css": return !!css;
      case "js": return !!js;
    }
  };

  // Parse HTML into a simple tree structure for display
  const renderHtmlTree = (htmlContent: string | null) => {
    if (!htmlContent) {
      return <div className="elements-empty">No HTML content</div>;
    }

    // Simple parsing to show structure
    const lines = htmlContent.split('\n').filter(line => line.trim());

    return (
      <div className="elements-tree">
        {lines.map((line, index) => {
          const trimmed = line.trim();
          const indent = line.search(/\S|$/);
          const isTag = trimmed.startsWith('<');
          const isClosingTag = trimmed.startsWith('</');
          // isSelfClosing can be used for future styling enhancements
          // const isSelfClosing = trimmed.endsWith('/>');

          let className = "tree-line";
          if (isTag && !isClosingTag) className += " tree-tag-open";
          if (isClosingTag) className += " tree-tag-close";
          if (!isTag) className += " tree-text";

          return (
            <div
              key={index}
              className={className}
              style={{ paddingLeft: `${Math.min(indent, 40)}px` }}
            >
              <span className="tree-content">{trimmed}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="elements-panel">
      <div className="elements-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`elements-tab ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={12} />
            <span>{label}</span>
            {hasContent(id) && (
              <span className="tab-indicator" />
            )}
          </button>
        ))}
      </div>

      <div className="elements-content">
        {activeTab === "html" && (
          html ? (
            <div className="elements-section">
              <button
                className="section-header"
                onClick={() => setIsHtmlExpanded(!isHtmlExpanded)}
              >
                {isHtmlExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Document</span>
              </button>
              {isHtmlExpanded && renderHtmlTree(html)}
            </div>
          ) : (
            <div className="elements-empty">
              <p>No compiled HTML content</p>
              <p className="hint">Open a .flux file and compile to see output</p>
            </div>
          )
        )}

        {activeTab === "css" && (
          css ? (
            <div className="elements-section">
              <button
                className="section-header"
                onClick={() => setIsCssExpanded(!isCssExpanded)}
              >
                {isCssExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Styles</span>
              </button>
              {isCssExpanded && (
                <pre className="elements-code css-code">
                  {css}
                </pre>
              )}
            </div>
          ) : (
            <div className="elements-empty">
              <p>No compiled CSS content</p>
              <p className="hint">Open a .flux file and compile to see output</p>
            </div>
          )
        )}

        {activeTab === "js" && (
          js ? (
            <div className="elements-section">
              <button
                className="section-header"
                onClick={() => setIsJsExpanded(!isJsExpanded)}
              >
                {isJsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Scripts</span>
              </button>
              {isJsExpanded && (
                <pre className="elements-code js-code">
                  {js}
                </pre>
              )}
            </div>
          ) : (
            <div className="elements-empty">
              <p>No compiled JS content</p>
              <p className="hint">Open a .flux file and compile to see output</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
