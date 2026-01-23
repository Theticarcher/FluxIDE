import type * as monaco from "monaco-editor";

// Flux Monarch tokenizer for Monaco Editor
// Based on the Flux language lexer at /home/theticarcher38/code/Flux/src/compiler/lexer.ts

export const fluxLanguageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
    ["<", ">"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "`", close: "`" },
    { open: "<", close: ">" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "`", close: "`" },
    { open: "<", close: ">" },
  ],
  indentationRules: {
    increaseIndentPattern: /^.*\{[^}"']*$/,
    decreaseIndentPattern: /^\s*\}/,
  },
  folding: {
    markers: {
      start: /^\s*\/\/\s*#?region\b/,
      end: /^\s*\/\/\s*#?endregion\b/,
    },
  },
};

export const fluxMonarchTokenizer: monaco.languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".flux",

  // Keywords from Flux lexer
  keywords: [
    "component",
    "page",
    "import",
    "export",
    "from",
    "let",
    "const",
    "if",
    "else",
    "for",
    "while",
    "return",
    "true",
    "false",
    "null",
    "state",
    "effect",
    "style",
    "in",
    "of",
    "scoped",
    "function",
    "class",
    "new",
    "typeof",
    "instanceof",
    "this",
    "super",
    "async",
    "await",
  ],

  // Type keywords
  typeKeywords: ["string", "number", "boolean", "void", "any", "null", "undefined"],

  // Operators
  operators: [
    "=",
    ">",
    "<",
    "!",
    "~",
    "?",
    ":",
    "==",
    "===",
    "<=",
    ">=",
    "!=",
    "!==",
    "&&",
    "||",
    "??",
    "++",
    "--",
    "+",
    "-",
    "*",
    "/",
    "%",
    "**",
    "&",
    "|",
    "^",
    "<<",
    ">>",
    ">>>",
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",
    "=>",
    "...",
    "?.",
  ],

  // Symbols for lexing
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,

  // Main tokenizer
  tokenizer: {
    root: [
      // Doc comments
      [/\/\*\*(?!\/)/, "comment.doc", "@doccomment"],

      // Whitespace and comments
      { include: "@whitespace" },

      // JSX control flow - {#if}, {:else}, {/if}, {#for}, {/for}
      [/\{#(if|for)\b/, { token: "keyword.control.flux", next: "@jsxControlFlowCondition" }],
      [/\{:(else)\}/, "keyword.control.flux"],
      [/\{\/(if|for)\}/, "keyword.control.flux"],

      // JSX tags
      [/<\//, { token: "delimiter.tag", next: "@jsxCloseTag" }],
      [/<(?=[A-Z])/, { token: "delimiter.tag", next: "@jsxComponentTag" }],
      [/<(?=[a-z])/, { token: "delimiter.tag", next: "@jsxHtmlTag" }],

      // Style block
      [/(style)(\s+)(scoped)?(\s*)(\{)/, [
        "keyword.declaration",
        "white",
        "storage.modifier",
        "white",
        { token: "delimiter.bracket", next: "@styleBlock" }
      ]],
      [/(style)(\s*)(\{)/, [
        "keyword.declaration",
        "white",
        { token: "delimiter.bracket", next: "@styleBlock" }
      ]],

      // Component and page declarations
      [/(component|page)(\s+)([A-Z][a-zA-Z0-9]*)/, [
        "keyword.declaration",
        "white",
        "type.identifier.class"
      ]],

      // State declaration
      [/(state)(\s+)([a-z][a-zA-Z0-9]*)/, [
        "keyword.declaration",
        "white",
        "variable.state"
      ]],

      // Effect declaration
      [/\b(effect)\b/, "keyword.declaration"],

      // Numbers
      [/(@digits)[eE]([\-+]?(@digits))?/, "number.float"],
      [/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, "number.float"],
      [/0[xX][0-9a-fA-F]+/, "number.hex"],
      [/0[oO][0-7]+/, "number.octal"],
      [/0[bB][01]+/, "number.binary"],
      [/(@digits)/, "number"],

      // Delimiters and operators
      [/[{}()\[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [/@symbols/, {
        cases: {
          "@operators": "operator",
          "@default": "",
        },
      }],

      // Identifiers and keywords
      [/[A-Z][a-zA-Z0-9]*/, {
        cases: {
          "@typeKeywords": "type.keyword",
          "@default": "type.identifier",
        },
      }],
      [/[a-zA-Z_$][\w$]*/, {
        cases: {
          "@keywords": "keyword",
          "@typeKeywords": "type.keyword",
          "@default": "identifier",
        },
      }],

      // Delimiter
      [/[;,.]/, "delimiter"],

      // Strings
      [/"([^"\\]|\\.)*$/, "string.invalid"], // non-terminated
      [/'([^'\\]|\\.)*$/, "string.invalid"], // non-terminated
      [/"/, "string", "@string_double"],
      [/'/, "string", "@string_single"],
      [/`/, "string", "@string_backtick"],
    ],

    // JSX control flow condition
    jsxControlFlowCondition: [
      [/\}/, { token: "keyword.control.flux", next: "@pop" }],
      { include: "@root" },
    ],

    // JSX HTML tag (lowercase)
    jsxHtmlTag: [
      [/\s+/, "white"],
      [/\/?>/, { token: "delimiter.tag", next: "@pop" }],
      [/([a-z][a-zA-Z0-9\-]*)(\s*)(=)/, ["attribute.name.html", "white", "delimiter"]],
      [/([a-z][a-zA-Z0-9\-]*)/, "attribute.name.html"],
      [/"/, "string.attribute", "@jsxAttributeString"],
      [/\{/, { token: "delimiter.bracket", next: "@jsxExpression" }],
      [/[a-z][a-zA-Z0-9\-]*/, "tag.html"],
    ],

    // JSX Component tag (PascalCase)
    jsxComponentTag: [
      [/\s+/, "white"],
      [/\/?>/, { token: "delimiter.tag", next: "@pop" }],
      [/([a-z][a-zA-Z0-9]*)(\s*)(=)/, ["attribute.name", "white", "delimiter"]],
      [/([a-z][a-zA-Z0-9]*)/, "attribute.name"],
      [/"/, "string.attribute", "@jsxAttributeString"],
      [/\{/, { token: "delimiter.bracket", next: "@jsxExpression" }],
      [/[A-Z][a-zA-Z0-9]*/, "type.identifier.component"],
    ],

    // JSX close tag
    jsxCloseTag: [
      [/[A-Z][a-zA-Z0-9]*/, "type.identifier.component"],
      [/[a-z][a-zA-Z0-9\-]*/, "tag.html"],
      [/>/, { token: "delimiter.tag", next: "@pop" }],
    ],

    // JSX attribute string
    jsxAttributeString: [
      [/[^\\"]+/, "string.attribute"],
      [/@escapes/, "string.escape"],
      [/"/, "string.attribute", "@pop"],
    ],

    // JSX expression
    jsxExpression: [
      [/\}/, { token: "delimiter.bracket", next: "@pop" }],
      { include: "@root" },
    ],

    // Style block (CSS)
    styleBlock: [
      [/\}(?=\s*\n\s*<|\s*\n\s*component|\s*\n\s*page|\s*$)/, { token: "delimiter.bracket", next: "@pop" }],
      [/\{/, { token: "delimiter.bracket", next: "@cssNestedBlock" }],
      [/\/\*/, "comment.css", "@cssComment"],
      [/\.[a-zA-Z][a-zA-Z0-9_\-]*/, "attribute.name.class.css"],
      [/#[a-zA-Z][a-zA-Z0-9_\-]*/, "attribute.name.id.css"],
      [/:[a-zA-Z][a-zA-Z0-9\-]*/, "attribute.name.pseudo.css"],
      [/::[a-zA-Z][a-zA-Z0-9\-]*/, "attribute.name.pseudo-element.css"],
      [/[a-z][a-z0-9]*(?=\s*[{,:.#\[])/, "tag.css"],
      [/([a-z\-]+)(\s*)(:)/, ["attribute.name.css", "white", "delimiter.css"]],
      [/-?[0-9]+(\.[0-9]+)?(px|em|rem|%|vh|vw|s|ms|deg)?/, "number.css"],
      [/#[0-9a-fA-F]{3,8}/, "constant.color.css"],
      [/"([^"\\]|\\.)*"/, "string.css"],
      [/'([^'\\]|\\.)*'/, "string.css"],
      [/[;,]/, "delimiter.css"],
      [/\s+/, "white"],
    ],

    cssNestedBlock: [
      [/\}/, { token: "delimiter.bracket", next: "@pop" }],
      { include: "@styleBlock" },
    ],

    cssComment: [
      [/[^/*]+/, "comment.css"],
      [/\*\//, "comment.css", "@pop"],
      [/[/*]/, "comment.css"],
    ],

    // Whitespace and comments
    whitespace: [
      [/[ \t\r\n]+/, "white"],
      [/\/\/.*$/, "comment"],
      [/\/\*/, "comment", "@comment"],
    ],

    comment: [
      [/[^/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[/*]/, "comment"],
    ],

    doccomment: [
      [/@\w+/, "comment.doc.tag"],
      [/[^/*@]+/, "comment.doc"],
      [/\*\//, "comment.doc", "@pop"],
      [/[/*]/, "comment.doc"],
    ],

    // Strings
    string_double: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, "string", "@pop"],
    ],

    string_single: [
      [/[^\\']+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/'/, "string", "@pop"],
    ],

    string_backtick: [
      [/\$\{/, { token: "delimiter.bracket", next: "@templateExpression" }],
      [/[^\\`$]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/`/, "string", "@pop"],
    ],

    templateExpression: [
      [/\}/, { token: "delimiter.bracket", next: "@pop" }],
      { include: "@root" },
    ],
  },
};
