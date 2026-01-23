import type * as monaco from "monaco-editor";

// Keyword documentation
const KEYWORD_DOCS: Record<string, string> = {
  component: `**component**

Declares a reusable UI component.

\`\`\`flux
component Button(text: string) {
  <button>{text}</button>
}
\`\`\``,

  page: `**page**

Declares a page component that serves as an entry point.

\`\`\`flux
page Home {
  <div>Welcome!</div>
}
\`\`\``,

  state: `**state**

Declares reactive state that automatically updates the UI when changed.

\`\`\`flux
state count = 0
state name: string = "Hello"
\`\`\``,

  effect: `**effect**

Declares a side effect that runs after rendering.

\`\`\`flux
effect {
  console.log("Component mounted")
}

effect {
  console.log(count)
} [count]
\`\`\``,

  style: `**style**

Declares CSS styles for the component.

\`\`\`flux
style {
  .button { color: blue; }
}

style scoped {
  .button { color: blue; }
}
\`\`\``,

  scoped: `**scoped**

Modifier for style blocks that scopes CSS to the current component only.`,

  import: `**import**

Imports components or values from other Flux files.

\`\`\`flux
import { Button, Card } from "./components.flux"
\`\`\``,

  export: `**export**

Exports a component or value for use in other files.

\`\`\`flux
export component Button(text: string) {
  <button>{text}</button>
}
\`\`\``,
};

// HTML tag documentation
const HTML_TAG_DOCS: Record<string, string> = {
  div: "Generic container element",
  span: "Inline container element",
  p: "Paragraph element",
  a: "Anchor/link element. Use `href` attribute for URL.",
  button: "Clickable button element",
  input: "Form input element. Use `type` attribute.",
  form: "Form container element",
  h1: "Heading level 1 (largest)",
  h2: "Heading level 2",
  h3: "Heading level 3",
  ul: "Unordered list container",
  ol: "Ordered list container",
  li: "List item element",
  img: "Image element. Use `src` and `alt` attributes.",
  section: "Semantic section element",
  header: "Header section element",
  footer: "Footer section element",
  nav: "Navigation section element",
  main: "Main content element",
};

// Event handler documentation
const EVENT_HANDLER_DOCS: Record<string, string> = {
  onClick: `Fired when the element is clicked.

\`\`\`flux
onClick={() => handleClick()}
onClick={(e) => console.log(e)}
\`\`\``,

  onChange: `Fired when input value changes.

\`\`\`flux
onChange={(e) => setValue(e.target.value)}
\`\`\``,

  onSubmit: `Fired when a form is submitted.

\`\`\`flux
onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
\`\`\``,

  onInput: "Fired on every input change (more frequent than onChange).",
  onFocus: "Fired when element receives focus.",
  onBlur: "Fired when element loses focus.",
  onKeyDown: "Fired when a key is pressed down.",
  onKeyUp: "Fired when a key is released.",
  onMouseEnter: "Fired when mouse enters the element.",
  onMouseLeave: "Fired when mouse leaves the element.",
};

interface ParsedDocComment {
  description?: string;
  props: Array<{ name: string; type?: string; description?: string }>;
  example?: string;
}

interface ComponentInfo {
  name: string;
  params: Array<{ name: string; type?: string }>;
  docComment?: ParsedDocComment;
  line: number;
}

export function createFluxHoverProvider(
  _monacoInstance: typeof monaco
): monaco.languages.HoverProvider {
  return {
    provideHover(
      model: monaco.editor.ITextModel,
      position: monaco.Position,
      _token: monaco.CancellationToken
    ): monaco.languages.Hover | null {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const lineContent = model.getLineContent(position.lineNumber);
      const wordText = word.word;

      // Check if hovering over a keyword
      if (KEYWORD_DOCS[wordText]) {
        return {
          contents: [{ value: KEYWORD_DOCS[wordText] }],
          range: {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: word.endColumn,
          },
        };
      }

      // Check if hovering over a component reference (PascalCase)
      if (/^[A-Z][a-zA-Z0-9]*$/.test(wordText)) {
        const componentInfo = findComponentDefinition(model.getValue(), wordText);
        if (componentInfo) {
          return createComponentHover(componentInfo, position, word);
        }
      }

      // Check if hovering over an HTML tag
      if (/<[a-z]/.test(lineContent) && /^[a-z]+$/.test(wordText)) {
        if (HTML_TAG_DOCS[wordText]) {
          return {
            contents: [{ value: `**<${wordText}>**\n\n${HTML_TAG_DOCS[wordText]}` }],
            range: {
              startLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endLineNumber: position.lineNumber,
              endColumn: word.endColumn,
            },
          };
        }
      }

      // Check if hovering over an event handler
      if (/^on[A-Z]/.test(wordText) && EVENT_HANDLER_DOCS[wordText]) {
        return {
          contents: [{ value: `**${wordText}**\n\n${EVENT_HANDLER_DOCS[wordText]}` }],
          range: {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: word.endColumn,
          },
        };
      }

      return null;
    },
  };
}

function findComponentDefinition(text: string, name: string): ComponentInfo | null {
  const lines = text.split("\n");
  const componentRegex = new RegExp(`component\\s+${name}\\s*\\(([^)]*)\\)`, "g");
  const match = componentRegex.exec(text);

  if (!match) return null;

  // Find the line number
  const beforeMatch = text.substring(0, match.index);
  const lineNumber = beforeMatch.split("\n").length - 1;

  // Parse parameters
  const paramsStr = match[1];
  const params: Array<{ name: string; type?: string }> = [];

  if (paramsStr.trim()) {
    paramsStr.split(",").forEach((param) => {
      const parts = param.trim().split(":");
      params.push({
        name: parts[0].trim(),
        type: parts[1]?.trim(),
      });
    });
  }

  // Look for doc comment above
  let docComment: ParsedDocComment | undefined;

  // Search backwards from the component line for a doc comment
  for (let i = lineNumber - 1; i >= 0; i--) {
    const line = lines[i].trim();

    if (line === "" || line.startsWith("//")) continue;

    if (line.endsWith("*/")) {
      // Found end of doc comment, now find the start
      let docContent = "";
      for (let j = i; j >= 0; j--) {
        docContent = lines[j] + "\n" + docContent;
        if (lines[j].includes("/**")) {
          docComment = parseDocComment(docContent);
          break;
        }
      }
      break;
    } else {
      // No doc comment found
      break;
    }
  }

  return {
    name,
    params,
    docComment,
    line: lineNumber,
  };
}

function parseDocComment(content: string): ParsedDocComment {
  const result: ParsedDocComment = { props: [] };

  // Clean up the content
  const lines = content
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*\*\s?/, "")
        .replace(/^\/\*\*\s*/, "")
        .replace(/\s*\*\/$/, "")
    )
    .filter((line) => !line.includes("@flux"))
    .map((line) => line.trim());

  let inExample = false;
  let exampleContent = "";

  for (const line of lines) {
    if (line.startsWith("@component") || line.startsWith("@page")) {
      const match = line.match(/@(?:component|page)\s+\w+\s*-?\s*(.*)/);
      if (match && match[1]) {
        result.description = match[1];
      }
    } else if (line.startsWith("@prop")) {
      const match = line.match(/@prop\s+(\w+)(?:\s*:\s*(\w+(?:\[\])?))?(?:\s*-\s*(.*))?/);
      if (match) {
        result.props.push({
          name: match[1],
          type: match[2],
          description: match[3],
        });
      }
    } else if (line.startsWith("@example")) {
      inExample = true;
      const restOfLine = line.replace("@example", "").trim();
      if (restOfLine) exampleContent = restOfLine + "\n";
    } else if (inExample) {
      exampleContent += line + "\n";
    } else if (line.startsWith("@")) {
      // Skip other tags
      inExample = false;
    } else if (!result.description && line) {
      result.description = line;
    }
  }

  if (exampleContent.trim()) {
    result.example = exampleContent.trim();
  }

  return result;
}

function createComponentHover(
  info: ComponentInfo,
  position: monaco.Position,
  word: monaco.editor.IWordAtPosition
): monaco.languages.Hover {
  let markdown = `**${info.name}** (component)\n\n`;

  if (info.docComment?.description) {
    markdown += `${info.docComment.description}\n\n`;
  }

  // Parameters
  if (info.params.length > 0) {
    markdown += "**Props:**\n";
    info.params.forEach((param) => {
      const docProp = info.docComment?.props.find((p) => p.name === param.name);
      const type = param.type || docProp?.type || "any";
      const description = docProp?.description || "";
      markdown += `- \`${param.name}: ${type}\`${description ? ` - ${description}` : ""}\n`;
    });
    markdown += "\n";
  }

  // Example
  if (info.docComment?.example) {
    markdown += "**Example:**\n```flux\n" + info.docComment.example + "\n```\n";
  }

  return {
    contents: [{ value: markdown }],
    range: {
      startLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endLineNumber: position.lineNumber,
      endColumn: word.endColumn,
    },
  };
}
