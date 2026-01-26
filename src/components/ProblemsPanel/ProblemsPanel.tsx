import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import "./ProblemsPanel.css";

export interface Problem {
  line: number;
  column: number;
  message: string;
  severity?: "error" | "warning" | "info";
  file?: string;
}

interface ProblemsPanelProps {
  problems: Problem[];
  onProblemClick?: (problem: Problem) => void;
}

export function ProblemsPanel({ problems, onProblemClick }: ProblemsPanelProps) {
  if (problems.length === 0) {
    return (
      <div className="problems-panel">
        <div className="problems-empty">
          <AlertCircle size={24} />
          <p>No problems detected</p>
          <p className="hint">Compiler errors and warnings will appear here</p>
        </div>
      </div>
    );
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case "warning":
        return <AlertTriangle size={14} className="severity-warning" />;
      case "info":
        return <Info size={14} className="severity-info" />;
      default:
        return <AlertCircle size={14} className="severity-error" />;
    }
  };

  const errorCount = problems.filter(p => p.severity !== "warning" && p.severity !== "info").length;
  const warningCount = problems.filter(p => p.severity === "warning").length;

  return (
    <div className="problems-panel">
      <div className="problems-summary">
        {errorCount > 0 && (
          <span className="summary-item errors">
            <AlertCircle size={12} />
            {errorCount} {errorCount === 1 ? "Error" : "Errors"}
          </span>
        )}
        {warningCount > 0 && (
          <span className="summary-item warnings">
            <AlertTriangle size={12} />
            {warningCount} {warningCount === 1 ? "Warning" : "Warnings"}
          </span>
        )}
      </div>
      <div className="problems-list">
        {problems.map((problem, index) => (
          <div
            key={index}
            className={`problem-item ${problem.severity || "error"}`}
            onClick={() => onProblemClick?.(problem)}
          >
            {getSeverityIcon(problem.severity)}
            <span className="problem-message">{problem.message}</span>
            <span className="problem-location">
              {problem.file && <span className="problem-file">{problem.file}</span>}
              <span className="problem-line">Ln {problem.line}, Col {problem.column}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
