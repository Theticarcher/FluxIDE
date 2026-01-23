import type * as monaco from "monaco-editor";

export const fluxDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    // Keywords
    { token: "keyword", foreground: "569cd6", fontStyle: "bold" },
    { token: "keyword.declaration", foreground: "569cd6", fontStyle: "bold" },
    { token: "keyword.control.flux", foreground: "c586c0" },
    { token: "storage.modifier", foreground: "569cd6" },

    // Types
    { token: "type.keyword", foreground: "4ec9b0" },
    { token: "type.identifier", foreground: "4ec9b0" },
    { token: "type.identifier.class", foreground: "4ec9b0", fontStyle: "bold" },
    { token: "type.identifier.component", foreground: "4ec9b0" },

    // Variables
    { token: "variable.state", foreground: "9cdcfe" },
    { token: "identifier", foreground: "9cdcfe" },

    // Strings
    { token: "string", foreground: "ce9178" },
    { token: "string.attribute", foreground: "ce9178" },
    { token: "string.escape", foreground: "d7ba7d" },
    { token: "string.invalid", foreground: "f44747" },
    { token: "string.css", foreground: "ce9178" },

    // Numbers
    { token: "number", foreground: "b5cea8" },
    { token: "number.float", foreground: "b5cea8" },
    { token: "number.hex", foreground: "b5cea8" },
    { token: "number.octal", foreground: "b5cea8" },
    { token: "number.binary", foreground: "b5cea8" },
    { token: "number.css", foreground: "b5cea8" },

    // Comments
    { token: "comment", foreground: "6a9955", fontStyle: "italic" },
    { token: "comment.doc", foreground: "608b4e", fontStyle: "italic" },
    { token: "comment.doc.tag", foreground: "569cd6" },
    { token: "comment.css", foreground: "6a9955", fontStyle: "italic" },

    // Operators
    { token: "operator", foreground: "d4d4d4" },
    { token: "delimiter", foreground: "d4d4d4" },
    { token: "delimiter.tag", foreground: "808080" },
    { token: "delimiter.bracket", foreground: "ffd700" },
    { token: "delimiter.css", foreground: "d4d4d4" },

    // JSX/HTML
    { token: "tag.html", foreground: "569cd6" },
    { token: "attribute.name", foreground: "9cdcfe" },
    { token: "attribute.name.html", foreground: "9cdcfe" },

    // CSS
    { token: "tag.css", foreground: "d7ba7d" },
    { token: "attribute.name.class.css", foreground: "d7ba7d" },
    { token: "attribute.name.id.css", foreground: "d7ba7d" },
    { token: "attribute.name.pseudo.css", foreground: "d7ba7d" },
    { token: "attribute.name.pseudo-element.css", foreground: "d7ba7d" },
    { token: "attribute.name.css", foreground: "9cdcfe" },
    { token: "constant.color.css", foreground: "ce9178" },
  ],
  colors: {
    "editor.background": "#1e1e1e",
    "editor.foreground": "#d4d4d4",
    "editorLineNumber.foreground": "#858585",
    "editorLineNumber.activeForeground": "#c6c6c6",
    "editorCursor.foreground": "#aeafad",
    "editor.selectionBackground": "#264f78",
    "editor.inactiveSelectionBackground": "#3a3d41",
    "editor.lineHighlightBackground": "#2a2d2e",
    "editorIndentGuide.background1": "#404040",
    "editorIndentGuide.activeBackground1": "#707070",
    "editorWhitespace.foreground": "#3b3b3b",
  },
};

export const fluxLightTheme: monaco.editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
  rules: [
    // Keywords
    { token: "keyword", foreground: "0000ff", fontStyle: "bold" },
    { token: "keyword.declaration", foreground: "0000ff", fontStyle: "bold" },
    { token: "keyword.control.flux", foreground: "af00db" },
    { token: "storage.modifier", foreground: "0000ff" },

    // Types
    { token: "type.keyword", foreground: "267f99" },
    { token: "type.identifier", foreground: "267f99" },
    { token: "type.identifier.class", foreground: "267f99", fontStyle: "bold" },
    { token: "type.identifier.component", foreground: "267f99" },

    // Variables
    { token: "variable.state", foreground: "001080" },
    { token: "identifier", foreground: "001080" },

    // Strings
    { token: "string", foreground: "a31515" },
    { token: "string.attribute", foreground: "a31515" },
    { token: "string.escape", foreground: "ee0000" },

    // Numbers
    { token: "number", foreground: "098658" },
    { token: "number.css", foreground: "098658" },

    // Comments
    { token: "comment", foreground: "008000", fontStyle: "italic" },
    { token: "comment.doc", foreground: "008000", fontStyle: "italic" },
    { token: "comment.doc.tag", foreground: "0000ff" },

    // JSX/HTML
    { token: "tag.html", foreground: "800000" },
    { token: "attribute.name", foreground: "ff0000" },
    { token: "attribute.name.html", foreground: "ff0000" },

    // CSS
    { token: "tag.css", foreground: "800000" },
    { token: "attribute.name.class.css", foreground: "800000" },
    { token: "attribute.name.css", foreground: "ff0000" },
  ],
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#000000",
  },
};
