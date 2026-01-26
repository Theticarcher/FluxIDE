import { useState, useEffect } from "react";
import { FileCode, FileType, Braces, ChevronRight, ChevronDown, Copy, Download } from "lucide-react";

interface SourceFile {
  name: string;
  type: "html" | "css" | "js";
  content: string;
}

interface SourcesTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  compiledHtml?: string | null;
  compiledCss?: string | null;
  compiledJs?: string | null;
}

export function SourcesTab({ iframeRef, compiledHtml, compiledCss, compiledJs }: SourcesTabProps) {
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Page"]));

  useEffect(() => {
    const newFiles: SourceFile[] = [];

    // Add compiled sources
    if (compiledHtml) {
      newFiles.push({ name: "index.html", type: "html", content: compiledHtml });
    }
    if (compiledCss) {
      newFiles.push({ name: "styles.css", type: "css", content: compiledCss });
    }
    if (compiledJs) {
      newFiles.push({ name: "script.js", type: "js", content: compiledJs });
    }

    // Extract from iframe if no compiled sources
    if (newFiles.length === 0) {
      const iframe = iframeRef.current;
      if (iframe?.contentDocument) {
        const doc = iframe.contentDocument;

        // Get HTML
        newFiles.push({
          name: "document.html",
          type: "html",
          content: doc.documentElement.outerHTML,
        });

        // Get inline styles
        const styles = Array.from(doc.querySelectorAll("style"))
          .map(s => s.textContent)
          .filter(Boolean)
          .join("\n\n");
        if (styles) {
          newFiles.push({ name: "inline-styles.css", type: "css", content: styles });
        }

        // Get inline scripts
        const scripts = Array.from(doc.querySelectorAll("script"))
          .map(s => s.textContent)
          .filter(Boolean)
          .join("\n\n");
        if (scripts) {
          newFiles.push({ name: "inline-scripts.js", type: "js", content: scripts });
        }
      }
    }

    setFiles(newFiles);
    if (newFiles.length > 0 && !selectedFile) {
      setSelectedFile(newFiles[0].name);
    }
  }, [iframeRef, compiledHtml, compiledCss, compiledJs, selectedFile]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "html": return <FileCode size={14} className="file-icon html" />;
      case "css": return <FileType size={14} className="file-icon css" />;
      case "js": return <Braces size={14} className="file-icon js" />;
      default: return <FileCode size={14} />;
    }
  };

  const selectedContent = files.find(f => f.name === selectedFile)?.content || "";
  const selectedType = files.find(f => f.name === selectedFile)?.type || "html";

  const copyContent = () => {
    navigator.clipboard.writeText(selectedContent);
  };

  const downloadContent = () => {
    const blob = new Blob([selectedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile || "source";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatLineNumbers = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => (
      <div key={i} className="source-line">
        <span className="line-number">{i + 1}</span>
        <span className="line-content">{line || " "}</span>
      </div>
    ));
  };

  return (
    <div className="sources-tab">
      <div className="sources-sidebar">
        <div className="sources-section">
          <div
            className="section-header"
            onClick={() => toggleSection("Page")}
          >
            {expandedSections.has("Page") ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Page</span>
          </div>
          {expandedSections.has("Page") && (
            <div className="file-list">
              {files.map(file => (
                <div
                  key={file.name}
                  className={`file-item ${selectedFile === file.name ? "selected" : ""}`}
                  onClick={() => setSelectedFile(file.name)}
                >
                  {getFileIcon(file.type)}
                  <span>{file.name}</span>
                </div>
              ))}
              {files.length === 0 && (
                <div className="empty-hint">No sources available</div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="sources-editor">
        {selectedFile ? (
          <>
            <div className="editor-toolbar">
              <span className="file-name">
                {getFileIcon(selectedType)}
                {selectedFile}
              </span>
              <div className="editor-actions">
                <button className="toolbar-btn" onClick={copyContent} title="Copy">
                  <Copy size={12} />
                </button>
                <button className="toolbar-btn" onClick={downloadContent} title="Download">
                  <Download size={12} />
                </button>
              </div>
            </div>
            <div className={`source-content ${selectedType}`}>
              <pre>{formatLineNumbers(selectedContent)}</pre>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Select a file to view its source</p>
          </div>
        )}
      </div>
    </div>
  );
}
