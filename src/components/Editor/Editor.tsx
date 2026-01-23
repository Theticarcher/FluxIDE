import { useRef, useEffect, useCallback } from "react";
import MonacoEditor, { useMonaco, type OnMount } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { registerFluxLanguage, detectLanguage } from "./monaco-flux";
import "./Editor.css";

interface EditorProps {
  filePath: string;
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
}

export function Editor({ filePath, content, onChange, onSave }: EditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const languageRegistered = useRef(false);
  const monacoInstance = useMonaco();

  // Register Flux language once Monaco is available
  useEffect(() => {
    if (monacoInstance && !languageRegistered.current) {
      registerFluxLanguage(monacoInstance);
      languageRegistered.current = true;
    }
  }, [monacoInstance]);

  // Detect language from file path
  const language = detectLanguage(filePath);

  // Handle editor mount
  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Configure editor options
      editor.updateOptions({
        tabSize: 2,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: false,
        wordWrap: "on",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
        fontLigatures: true,
        renderWhitespace: "selection",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        lineNumbers: "on",
        lineDecorationsWidth: 10,
        folding: true,
        foldingStrategy: "indentation",
        showFoldingControls: "mouseover",
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
      });

      // Add save keyboard shortcut
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave?.();
      });

      // Focus the editor
      editor.focus();
    },
    [onSave]
  );

  // Handle content changes
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value);
      }
    },
    [onChange]
  );

  return (
    <div className="editor-container">
      <MonacoEditor
        height="100%"
        language={language}
        value={content}
        theme="flux-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={<div className="editor-loading">Loading editor...</div>}
        options={{
          automaticLayout: true,
        }}
      />
    </div>
  );
}
