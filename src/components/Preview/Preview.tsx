import { useRef, useEffect, useState } from "react";
import { RefreshCw, ExternalLink, Play } from "lucide-react";
import "./Preview.css";

interface PreviewProps {
  html: string;
  isCompiling: boolean;
  onRefresh: () => void;
  onOpenInBrowser?: () => void;
}

export function Preview({ html, isCompiling, onRefresh, onOpenInBrowser }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

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

  const handleRefresh = () => {
    setKey((k) => k + 1);
    onRefresh();
  };

  return (
    <div className="preview-container">
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
      <div className="preview-content">
        {isCompiling ? (
          <div className="preview-loading">
            <Play size={24} className="spinning" />
            <span>Compiling...</span>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={key}
            className="preview-iframe"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        )}
      </div>
    </div>
  );
}
