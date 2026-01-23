import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface CompileResult {
  success: boolean;
  stdout: string;
  stderr: string;
  html: string | null;
  js: string | null;
  css: string | null;
}

export interface CompileError {
  line: number;
  column: number;
  message: string;
}

export function useCompiler() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastResult, setLastResult] = useState<CompileResult | null>(null);
  const [errors, setErrors] = useState<CompileError[]>([]);

  /**
   * Compile a Flux file
   */
  const compileFile = useCallback(async (filePath: string, outputDir: string): Promise<CompileResult> => {
    setIsCompiling(true);
    setErrors([]);

    try {
      const result: CompileResult = await invoke("compile_flux_file", {
        filePath,
        outputDir,
      });

      setLastResult(result);

      // Parse errors from stderr if compilation failed
      if (!result.success && result.stderr) {
        const parsedErrors = parseCompilerErrors(result.stderr);
        setErrors(parsedErrors);
      }

      return result;
    } catch (error) {
      const errorResult: CompileResult = {
        success: false,
        stdout: "",
        stderr: String(error),
        html: null,
        js: null,
        css: null,
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsCompiling(false);
    }
  }, []);

  /**
   * Generate preview HTML from compile result
   */
  const generatePreviewHtml = useCallback((result: CompileResult): string => {
    if (!result.success || !result.html) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 20px;
                color: #666;
                background: #1e1e1e;
              }
              .error {
                color: #f14c4c;
                background: #2d2020;
                padding: 16px;
                border-radius: 4px;
                font-family: monospace;
                white-space: pre-wrap;
              }
            </style>
          </head>
          <body>
            <div class="error">${escapeHtml(result.stderr || "Compilation failed")}</div>
          </body>
        </html>
      `;
    }

    // Combine HTML, CSS, and JS into a single preview document
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${result.css || ""}
          </style>
        </head>
        <body>
          ${result.html}
          <script>
            ${result.js || ""}
          </script>
        </body>
      </html>
    `;
  }, []);

  return {
    compileFile,
    generatePreviewHtml,
    isCompiling,
    lastResult,
    errors,
  };
}

/**
 * Parse compiler error messages to extract line/column info
 */
function parseCompilerErrors(stderr: string): CompileError[] {
  const errors: CompileError[] = [];

  // Match patterns like "Error at line 5, column 10: message"
  // or "line 5: message"
  const patterns = [
    /(?:error|Error)\s+at\s+line\s+(\d+),?\s*(?:column\s+)?(\d+)?[:\s]+(.+)/gi,
    /line\s+(\d+)(?:,\s*column\s+(\d+))?[:\s]+(.+)/gi,
    /(\d+):(\d+)[:\s]+(?:error[:\s]+)?(.+)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(stderr)) !== null) {
      errors.push({
        line: parseInt(match[1], 10),
        column: parseInt(match[2], 10) || 1,
        message: match[3].trim(),
      });
    }
  }

  // If no structured errors found, create a generic one
  if (errors.length === 0 && stderr.trim()) {
    errors.push({
      line: 1,
      column: 1,
      message: stderr.trim(),
    });
  }

  return errors;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
