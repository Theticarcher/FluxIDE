import type * as monaco from "monaco-editor";

// Built-in Flux keywords
const KEYWORDS = [
  "component", "page", "state", "effect", "style",
  "import", "export", "from", "let", "const",
  "if", "else", "for", "while", "return",
  "true", "false", "null", "in", "of", "scoped"
];

// Type keywords
const TYPES = ["string", "number", "boolean"];

// Common HTML tags
const HTML_TAGS = [
  "div", "span", "p", "a", "button", "input", "form",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "table", "tr", "td", "th",
  "header", "footer", "main", "nav", "section", "article",
  "img", "video", "audio", "canvas", "svg",
  "label", "select", "option", "textarea"
];

// Common HTML attributes
const HTML_ATTRIBUTES = [
  "class", "id", "style", "href", "src", "alt", "title",
  "type", "name", "value", "placeholder", "disabled", "readonly",
  "checked", "selected", "multiple", "required", "autofocus",
  "width", "height", "target", "rel"
];

// Event handlers
const EVENT_HANDLERS = [
  "onClick", "onChange", "onSubmit", "onInput", "onFocus", "onBlur",
  "onKeyDown", "onKeyUp", "onKeyPress", "onMouseEnter", "onMouseLeave",
  "onMouseDown", "onMouseUp", "onMouseMove", "onLoad", "onError"
];

// Doc comment tags
const DOC_TAGS = [
  "@flux", "@component", "@page", "@prop", "@param", "@returns",
  "@example", "@description", "@since", "@deprecated", "@see"
];

// Common CSS properties
const CSS_PROPERTIES = [
  "color", "background", "background-color", "font-size", "font-family",
  "font-weight", "margin", "padding", "border", "border-radius",
  "display", "flex", "grid", "position", "top", "right", "bottom", "left",
  "width", "height", "max-width", "max-height", "min-width", "min-height",
  "text-align", "line-height", "overflow", "z-index", "opacity",
  "transform", "transition", "animation", "box-shadow", "cursor",
  "flex-direction", "justify-content", "align-items", "gap"
];

export function createFluxCompletionProvider(
  monacoInstance: typeof monaco
): monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ["<", "@", "{", ":"],

    provideCompletionItems(
      model: monaco.editor.ITextModel,
      position: monaco.Position,
      _context: monaco.languages.CompletionContext,
      _token: monaco.CancellationToken
    ): monaco.languages.CompletionList {
      const lineContent = model.getLineContent(position.lineNumber);
      const linePrefix = lineContent.substring(0, position.column - 1);
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const suggestions: monaco.languages.CompletionItem[] = [];
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column,
        endColumn: position.column,
      };

      // Determine context
      const inStyleBlock = isInStyleBlock(textUntilPosition);
      const inDocComment = isInDocComment(textUntilPosition);
      const afterOpenTag = /<[a-zA-Z]*$/.test(linePrefix);
      const inAttribute = isInAttribute(linePrefix);

      // Doc comment completions
      if (inDocComment || linePrefix.includes("/**") || linePrefix.endsWith("@")) {
        return { suggestions: getDocCommentCompletions(monacoInstance, range) };
      }

      // CSS completions in style block
      if (inStyleBlock) {
        return { suggestions: getCSSCompletions(monacoInstance, range, linePrefix) };
      }

      // JSX tag completions
      if (afterOpenTag) {
        const components = extractComponents(model.getValue());
        return { suggestions: getTagCompletions(monacoInstance, range, components) };
      }

      // Attribute completions
      if (inAttribute) {
        return { suggestions: getAttributeCompletions(monacoInstance, range) };
      }

      // Control flow completions in JSX expressions
      if (linePrefix.endsWith("{")) {
        suggestions.push(
          createSnippet(monacoInstance, "#if", "#if ${1:condition}}\n  $0\n{/if}", "Conditional rendering", range),
          createSnippet(monacoInstance, "#for", "#for ${1:item} of ${2:items}}\n  $0\n{/for}", "Loop rendering", range),
          createSnippet(monacoInstance, "#for with index", "#for ${1:item}, ${2:index} of ${3:items}}\n  $0\n{/for}", "Loop with index", range)
        );
      }

      // Keyword and snippet completions
      suggestions.push(...getKeywordCompletions(monacoInstance, range));

      // Type completions after colon
      if (linePrefix.includes(":") && !inStyleBlock) {
        suggestions.push(...getTypeCompletions(monacoInstance, range));
      }

      // Component completions from document
      const components = extractComponents(model.getValue());
      components.forEach((comp) => {
        const item: monaco.languages.CompletionItem = {
          label: comp.name,
          kind: monacoInstance.languages.CompletionItemKind.Class,
          detail: "Component",
          insertText: comp.params.length > 0
            ? `${comp.name} ${comp.params.map((p, i) => `${p}={\${${i + 1}}}`).join(" ")} />`
            : `${comp.name} />`,
          insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        };
        suggestions.push(item);
      });

      return { suggestions };
    },
  };
}

function createSnippet(
  monacoInstance: typeof monaco,
  label: string,
  insertText: string,
  detail: string,
  range: monaco.IRange
): monaco.languages.CompletionItem {
  return {
    label,
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    detail,
    insertText,
    insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  };
}

function getKeywordCompletions(
  monacoInstance: typeof monaco,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  // Snippets for common declarations
  items.push(
    createSnippet(monacoInstance, "component", "component ${1:Name}(${2:props}) {\n  $0\n}", "Create a component", range),
    createSnippet(monacoInstance, "page", "page ${1:Name} {\n  $0\n}", "Create a page", range),
    createSnippet(monacoInstance, "state", "state ${1:name} = ${2:initialValue}", "Create reactive state", range),
    createSnippet(monacoInstance, "effect", "effect {\n  $0\n}", "Create an effect", range),
    createSnippet(monacoInstance, "effect with deps", "effect {\n  $0\n} [${1:dependency}]", "Effect with dependencies", range),
    createSnippet(monacoInstance, "style", "style {\n  $0\n}", "Create style block", range),
    createSnippet(monacoInstance, "style scoped", "style scoped {\n  $0\n}", "Create scoped style block", range),
    createSnippet(monacoInstance, "import", 'import { ${1:Component} } from "${2:./module.flux}"', "Import statement", range)
  );

  // Keywords
  KEYWORDS.forEach((kw) => {
    items.push({
      label: kw,
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      insertText: kw,
      range,
    });
  });

  return items;
}

function getTypeCompletions(
  monacoInstance: typeof monaco,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return TYPES.map((type) => ({
    label: type,
    kind: monacoInstance.languages.CompletionItemKind.TypeParameter,
    detail: "Type",
    insertText: type,
    range,
  }));
}

function getTagCompletions(
  monacoInstance: typeof monaco,
  range: monaco.IRange,
  components: Array<{ name: string; params: string[] }>
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  // HTML tags
  HTML_TAGS.forEach((tag) => {
    items.push({
      label: tag,
      kind: monacoInstance.languages.CompletionItemKind.Property,
      detail: "HTML element",
      insertText: `${tag}>$0</${tag}>`,
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    });
  });

  // Components
  components.forEach((comp) => {
    const insertText = comp.params.length > 0
      ? `${comp.name} ${comp.params.map((p, i) => `${p}={\${${i + 1}}}`).join(" ")} />`
      : `${comp.name} />`;

    items.push({
      label: comp.name,
      kind: monacoInstance.languages.CompletionItemKind.Class,
      detail: "Component",
      insertText,
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    });
  });

  return items;
}

function getAttributeCompletions(
  monacoInstance: typeof monaco,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  HTML_ATTRIBUTES.forEach((attr) => {
    items.push({
      label: attr,
      kind: monacoInstance.languages.CompletionItemKind.Property,
      detail: "Attribute",
      insertText: `${attr}="\${1}"`,
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    });
  });

  EVENT_HANDLERS.forEach((handler) => {
    items.push({
      label: handler,
      kind: monacoInstance.languages.CompletionItemKind.Event,
      detail: "Event handler",
      insertText: `${handler}={() => \${1}}`,
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    });
  });

  return items;
}

function getCSSCompletions(
  monacoInstance: typeof monaco,
  range: monaco.IRange,
  linePrefix: string
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  if (linePrefix.includes(":")) {
    // Value completions
    const values = ["auto", "none", "inherit", "initial", "0", "100%", "flex", "block", "inline-block", "grid"];
    values.forEach((val) => {
      items.push({
        label: val,
        kind: monacoInstance.languages.CompletionItemKind.Value,
        insertText: val,
        range,
      });
    });
  } else {
    // Property completions
    CSS_PROPERTIES.forEach((prop) => {
      items.push({
        label: prop,
        kind: monacoInstance.languages.CompletionItemKind.Property,
        detail: "CSS property",
        insertText: `${prop}: \${1};`,
        insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      });
    });
  }

  return items;
}

function getDocCommentCompletions(
  monacoInstance: typeof monaco,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  // Doc comment template
  items.push(
    createSnippet(
      monacoInstance,
      "doc comment",
      "* @flux\n * @component ${1:Name} - ${2:Description}\n * @prop ${3:name}: ${4:type} - ${5:description}\n * @example\n * ${6:<Component />}\n ",
      "Documentation comment template",
      range
    )
  );

  // Individual tags
  DOC_TAGS.forEach((tag) => {
    let insertText = tag;
    switch (tag) {
      case "@prop":
        insertText = "@prop ${1:name}: ${2:type} - ${3:description}";
        break;
      case "@component":
      case "@page":
        insertText = `${tag} \${1:Name} - \${2:description}`;
        break;
      case "@example":
        insertText = "@example\n * ${1:code}";
        break;
    }

    items.push({
      label: tag,
      kind: monacoInstance.languages.CompletionItemKind.Keyword,
      detail: "Documentation tag",
      insertText,
      insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    });
  });

  return items;
}

function isInStyleBlock(text: string): boolean {
  const styleMatches = text.match(/style\s*(scoped)?\s*\{/g);
  if (!styleMatches) return false;

  let depth = 0;
  let inStyle = false;

  for (let i = 0; i < text.length; i++) {
    const remaining = text.substring(i);
    if (remaining.match(/^style\s*(scoped)?\s*\{/)) {
      inStyle = true;
      depth = 1;
    } else if (inStyle) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) inStyle = false;
      }
    }
  }

  return inStyle;
}

function isInDocComment(text: string): boolean {
  const lastDocStart = text.lastIndexOf("/**");
  const lastDocEnd = text.lastIndexOf("*/");
  return lastDocStart > lastDocEnd;
}

function isInAttribute(linePrefix: string): boolean {
  const tagMatch = linePrefix.match(/<[a-zA-Z][a-zA-Z0-9]*\s+[^>]*$/);
  return !!tagMatch;
}

function extractComponents(text: string): Array<{ name: string; params: string[] }> {
  const components: Array<{ name: string; params: string[] }> = [];
  const regex = /component\s+([A-Z][a-zA-Z0-9]*)\s*\(([^)]*)\)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    const paramsStr = match[2];
    const params = paramsStr
      .split(",")
      .map((p) => p.trim().split(":")[0].trim())
      .filter((p) => p.length > 0);

    components.push({ name, params });
  }

  return components;
}
