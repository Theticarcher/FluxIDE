import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Search, Copy, Eye } from "lucide-react";

interface DOMNode {
  tagName: string;
  attributes: Record<string, string>;
  children: DOMNode[];
  textContent?: string;
}

interface ElementsTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function ElementsTab({ iframeRef }: ElementsTabProps) {
  const [domTree, setDomTree] = useState<DOMNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["HTML", "BODY"]));
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [computedStyles, setComputedStyles] = useState<Record<string, string>>({});

  // Parse DOM tree from iframe
  const parseDOMTree = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const parseNode = (node: Element): DOMNode => {
      const attributes: Record<string, string> = {};
      for (const attr of Array.from(node.attributes)) {
        attributes[attr.name] = attr.value;
      }

      const children: DOMNode[] = [];
      for (const child of Array.from(node.children)) {
        children.push(parseNode(child));
      }

      let textContent: string | undefined;
      if (children.length === 0 && node.textContent?.trim()) {
        textContent = node.textContent.trim().slice(0, 100);
        if (node.textContent.trim().length > 100) {
          textContent += "...";
        }
      }

      return {
        tagName: node.tagName,
        attributes,
        children,
        textContent,
      };
    };

    if (doc.documentElement) {
      setDomTree(parseNode(doc.documentElement));
    }
  }, [iframeRef]);

  useEffect(() => {
    parseDOMTree();
    const interval = setInterval(parseDOMTree, 2000);
    return () => clearInterval(interval);
  }, [parseDOMTree]);

  // Get computed styles for selected element
  useEffect(() => {
    if (!selectedPath) {
      setComputedStyles({});
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) return;

    // Find element by path
    const parts = selectedPath.split("/").filter(Boolean);
    let element: Element | null = doc.documentElement;

    for (let i = 1; i < parts.length && element; i++) {
      const [tagName, indexStr] = parts[i].split("-");
      const index = parseInt(indexStr) || 0;
      const matchingChildren: Element[] = Array.from(element.children).filter(c => c.tagName === tagName);
      element = matchingChildren[index] || null;
    }

    if (element) {
      const styles = win.getComputedStyle(element);
      const importantProps = [
        "display", "position", "width", "height", "margin", "padding",
        "color", "background-color", "font-size", "font-family", "font-weight",
        "border", "border-radius", "flex", "grid", "gap", "z-index", "opacity"
      ];

      const computed: Record<string, string> = {};
      importantProps.forEach(prop => {
        const value = styles.getPropertyValue(prop);
        if (value && value !== "none" && value !== "normal" && value !== "auto") {
          computed[prop] = value;
        }
      });
      setComputedStyles(computed);
    }
  }, [selectedPath, iframeRef]);

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const copyHTML = () => {
    const iframe = iframeRef.current;
    if (iframe?.contentDocument) {
      navigator.clipboard.writeText(iframe.contentDocument.documentElement.outerHTML);
    }
  };

  const renderDOMNode = (node: DOMNode, path: string = "", depth: number = 0): JSX.Element => {
    const currentPath = path || node.tagName;
    const isExpanded = expandedNodes.has(currentPath);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedPath === currentPath;

    // Search filtering
    if (searchQuery) {
      const matchesSearch =
        node.tagName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.entries(node.attributes).some(([k, v]) =>
          k.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const childrenMatch = node.children.some(child => {
        const childMatches =
          child.tagName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          Object.entries(child.attributes).some(([k, v]) =>
            k.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.toLowerCase().includes(searchQuery.toLowerCase())
          );
        return childMatches;
      });

      if (!matchesSearch && !childrenMatch && !hasChildren) {
        return <></>;
      }
    }

    const attrs = Object.entries(node.attributes).map(([key, value]) => (
      <span key={key} className="dom-attr">
        {" "}
        <span className="attr-name">{key}</span>
        {value && (
          <>
            =<span className="attr-value">"{value}"</span>
          </>
        )}
      </span>
    ));

    return (
      <div key={currentPath} className="dom-node">
        <div
          className={`dom-node-line ${isSelected ? "selected" : ""}`}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
          onClick={() => setSelectedPath(currentPath)}
        >
          {hasChildren ? (
            <span className="dom-toggle" onClick={(e) => { e.stopPropagation(); toggleNode(currentPath); }}>
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          ) : (
            <span className="dom-toggle-placeholder" />
          )}
          <span className="dom-tag">
            &lt;<span className="tag-name">{node.tagName.toLowerCase()}</span>
            {attrs}
            {!hasChildren && !node.textContent && " /"}
            &gt;
          </span>
          {!hasChildren && node.textContent && (
            <>
              <span className="dom-text">{node.textContent}</span>
              <span className="dom-tag">
                &lt;/<span className="tag-name">{node.tagName.toLowerCase()}</span>&gt;
              </span>
            </>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="dom-children">
            {node.children.map((child, index) =>
              renderDOMNode(child, `${currentPath}/${child.tagName}-${index}`, depth + 1)
            )}
            <div
              className="dom-node-line dom-closing"
              style={{ paddingLeft: `${depth * 16 + 4}px` }}
            >
              <span className="dom-toggle-placeholder" />
              <span className="dom-tag">
                &lt;/<span className="tag-name">{node.tagName.toLowerCase()}</span>&gt;
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="elements-tab">
      <div className="elements-toolbar">
        <div className="search-box">
          <Search size={12} />
          <input
            type="text"
            placeholder="Search DOM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="toolbar-btn" onClick={copyHTML} title="Copy HTML">
          <Copy size={12} />
        </button>
        <button className="toolbar-btn" onClick={parseDOMTree} title="Refresh">
          <Eye size={12} />
        </button>
      </div>
      <div className="elements-content">
        <div className="dom-panel">
          {domTree ? (
            <div className="dom-tree">{renderDOMNode(domTree)}</div>
          ) : (
            <div className="empty-state">
              <p>No DOM content</p>
              <p className="hint">Load a preview to inspect elements</p>
            </div>
          )}
        </div>
        {selectedPath && Object.keys(computedStyles).length > 0 && (
          <div className="styles-panel">
            <div className="styles-header">Computed Styles</div>
            <div className="styles-list">
              {Object.entries(computedStyles).map(([prop, value]) => (
                <div key={prop} className="style-item">
                  <span className="style-prop">{prop}:</span>
                  <span className="style-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
