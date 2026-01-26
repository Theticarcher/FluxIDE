import { FileText, CheckCircle, XCircle } from "lucide-react";
import "./OutputPanel.css";

interface OutputPanelProps {
  stdout: string | null;
  stderr: string | null;
  success: boolean | null;
  fileName?: string;
}

export function OutputPanel({ stdout, stderr, success, fileName }: OutputPanelProps) {
  const hasOutput = stdout || stderr;

  if (!hasOutput) {
    return (
      <div className="output-panel">
        <div className="output-empty">
          <FileText size={24} />
          <p>No compiler output</p>
          <p className="hint">Compiler output will appear here when you compile a .flux file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="output-panel">
      <div className="output-header">
        {success !== null && (
          <span className={`output-status ${success ? "success" : "failed"}`}>
            {success ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {success ? "Compilation successful" : "Compilation failed"}
          </span>
        )}
        {fileName && <span className="output-file">{fileName}</span>}
      </div>
      <div className="output-content">
        {stderr && (
          <div className="output-section stderr">
            <div className="output-section-header">stderr</div>
            <pre className="output-text">{stderr}</pre>
          </div>
        )}
        {stdout && (
          <div className="output-section stdout">
            <div className="output-section-header">stdout</div>
            <pre className="output-text">{stdout}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
