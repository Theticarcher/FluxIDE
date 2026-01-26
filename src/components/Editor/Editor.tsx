import { useRef, useEffect, useCallback } from "react";
import MonacoEditor, { useMonaco, type OnMount } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { registerFluxLanguage, detectLanguage } from "./monaco-flux";
import { useThemeStore } from "../../stores/theme-store";
import { themes, themeNames } from "../../themes";
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
  const themesRegistered = useRef(false);
  const monacoInstance = useMonaco();

  // Get theme settings from store
  const {
    themeName,
    editorFontSize,
    editorFontFamily,
    editorLineHeight,
    editorTabSize,
    editorWordWrap,
    editorMinimap,
    editorFontLigatures,
  } = useThemeStore();

  // Register Flux language and all themes once Monaco is available
  useEffect(() => {
    if (monacoInstance && !languageRegistered.current) {
      registerFluxLanguage(monacoInstance);
      languageRegistered.current = true;
    }

    // Register all themes from our theme system
    if (monacoInstance && !themesRegistered.current) {
      for (const name of themeNames) {
        const theme = themes[name];
        monacoInstance.editor.defineTheme(name, theme.monacoTheme);
      }
      themesRegistered.current = true;
    }

    // Set the current theme
    if (monacoInstance && themesRegistered.current) {
      monacoInstance.editor.setTheme(themeName);
    }
  }, [monacoInstance, themeName]);

  // Detect language from file path
  const language = detectLanguage(filePath);

  // Handle editor mount
  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Configure editor options from theme store
      editor.updateOptions({
        tabSize: editorTabSize,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: false,
        wordWrap: editorWordWrap ? "on" : "off",
        minimap: { enabled: editorMinimap },
        scrollBeyondLastLine: false,
        fontSize: editorFontSize,
        fontFamily: editorFontFamily,
        fontLigatures: editorFontLigatures,
        lineHeight: editorFontSize * editorLineHeight,
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
    [onSave, editorFontSize, editorFontFamily, editorLineHeight, editorTabSize, editorWordWrap, editorMinimap, editorFontLigatures]
  );

  // Update editor options when settings change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: editorFontSize,
        fontFamily: editorFontFamily,
        fontLigatures: editorFontLigatures,
        lineHeight: editorFontSize * editorLineHeight,
        tabSize: editorTabSize,
        wordWrap: editorWordWrap ? "on" : "off",
        minimap: { enabled: editorMinimap },
      });
    }
  }, [editorFontSize, editorFontFamily, editorLineHeight, editorTabSize, editorWordWrap, editorMinimap, editorFontLigatures]);

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
        theme={themeName}
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
