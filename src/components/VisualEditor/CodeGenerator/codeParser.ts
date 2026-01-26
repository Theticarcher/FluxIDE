import { CanvasNode } from '../../../types/visual-editor';
import { generateNodeId } from '../../../stores/visual-editor-store';
import { getComponentByName } from '../../../data/flux-components';

/**
 * Simple regex-based parser to extract component tree from Flux code
 * This is a simplified parser - a full implementation would use the Flux compiler's AST
 */
export function parseFluxToTree(code: string): CanvasNode[] {
  try {
    // Find the opening brace of the page/component and extract body by counting braces
    const pageMatch = code.match(/page\s+\w+\s*\{/);
    const componentMatch = code.match(/component\s+\w+\s*\([^)]*\)\s*\{/);

    const match = pageMatch || componentMatch;
    if (!match) return [];

    // Find the position after the opening brace
    const startIndex = code.indexOf(match[0]) + match[0].length;

    // Count braces to find the matching closing brace
    let braceCount = 1;
    let endIndex = startIndex;
    for (let i = startIndex; i < code.length && braceCount > 0; i++) {
      if (code[i] === '{') braceCount++;
      if (code[i] === '}') braceCount--;
      endIndex = i;
    }

    const content = code.slice(startIndex, endIndex);
    if (!content) return [];

    // Extract style blocks and parse CSS rules for positioning
    const styleMap = new Map<string, Record<string, string>>();
    let jsxContent = content;
    const styleMatch = content.match(/style\s*(scoped)?\s*\{/);
    if (styleMatch) {
      // Find matching closing brace by counting
      const styleStart = content.indexOf(styleMatch[0]);
      let braceCount = 0;
      let styleEnd = styleStart;
      for (let i = styleStart; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          styleEnd = i + 1;
          break;
        }
      }

      // Extract and parse CSS rules
      const styleContent = content.slice(styleStart + styleMatch[0].length, styleEnd - 1);
      parseCSSRules(styleContent, styleMap);

      jsxContent = (content.slice(0, styleStart) + content.slice(styleEnd)).trim();
    }

    // Parse JSX elements and apply styles from style block
    return parseJSXElements(jsxContent, null, styleMap);
  } catch (error) {
    console.error('Failed to parse Flux code:', error);
    return [];
  }
}

/**
 * Parse CSS rules from style block content
 */
function parseCSSRules(cssContent: string, styleMap: Map<string, Record<string, string>>): void {
  // Match CSS rules like .classname { property: value; }
  const ruleRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
  let match;

  while ((match = ruleRegex.exec(cssContent)) !== null) {
    const className = match[1];
    const declarations = match[2];
    const styles: Record<string, string> = {};

    // Parse individual declarations
    const declRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);?/g;
    let declMatch;
    while ((declMatch = declRegex.exec(declarations)) !== null) {
      const prop = declMatch[1].trim();
      const value = declMatch[2].trim();
      styles[prop] = value;
    }

    // Store styles - later declarations override earlier ones
    if (Object.keys(styles).length > 0) {
      styleMap.set(className, { ...(styleMap.get(className) || {}), ...styles });
    }
  }
}

/**
 * Parse JSX elements from a string
 */
function parseJSXElements(
  content: string,
  parentId: string | null = null,
  styleMap: Map<string, Record<string, string>> = new Map()
): CanvasNode[] {
  const nodes: CanvasNode[] = [];

  // Skip state declarations and other non-JSX content
  // Match both capitalized components and lowercase HTML elements
  const jsxStart = content.search(/<[A-Za-z]/);
  if (jsxStart === -1) return nodes;

  let remaining = content.slice(jsxStart);

  while (remaining.length > 0) {
    const element = parseNextElement(remaining);
    if (!element) break;

    const node = createNodeFromElement(element, parentId, styleMap);
    if (node) {
      nodes.push(node);
    }

    // Move past this element
    const elementEnd = findElementEnd(remaining, element.tagName);
    if (elementEnd === -1) break;

    remaining = remaining.slice(elementEnd).trim();

    // Check for more sibling elements
    const nextStart = remaining.search(/<[A-Za-z]/);
    if (nextStart === -1) break;
    remaining = remaining.slice(nextStart);
  }

  return nodes;
}

/**
 * Parse the next JSX element from a string
 */
function parseNextElement(content: string): ParsedElement | null {
  // Match opening tag: <ComponentName ...props...> or <htmlelement ...props...>
  const openTagMatch = content.match(/^<([A-Za-z][a-zA-Z0-9]*)((?:\s+[^>]*)?)(\/?>)/);
  if (!openTagMatch) return null;

  const tagName = openTagMatch[1];
  const propsString = openTagMatch[2].trim();
  const isSelfClosing = openTagMatch[3] === '/>';

  const props = parseProps(propsString);

  if (isSelfClosing) {
    return {
      tagName,
      props,
      children: '',
      isSelfClosing: true,
    };
  }

  // Find children and closing tag
  const openTagEnd = openTagMatch[0].length;
  const children = extractChildren(content.slice(openTagEnd), tagName);

  return {
    tagName,
    props,
    children,
    isSelfClosing: false,
  };
}

interface ParsedElement {
  tagName: string;
  props: Record<string, unknown>;
  children: string;
  isSelfClosing: boolean;
}

/**
 * Parse props from a string like: prop1="value" prop2={expression} prop3
 */
function parseProps(propsString: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (!propsString) return props;

  // String props with double quotes
  let match;
  const regex1 = /(\w+)="([^"]*)"/g;
  while ((match = regex1.exec(propsString)) !== null) {
    props[match[1]] = match[2];
  }

  // String props with single quotes
  const regex2 = /(\w+)='([^']*)'/g;
  while ((match = regex2.exec(propsString)) !== null) {
    props[match[1]] = match[2];
  }

  // Expression props
  const regex3 = /(\w+)=\{([^}]+)\}/g;
  while ((match = regex3.exec(propsString)) !== null) {
    const value = match[2].trim();
    // Try to parse as JSON (for arrays, objects, numbers, booleans)
    try {
      props[match[1]] = JSON.parse(value);
    } catch {
      // Keep as string (expression)
      props[match[1]] = value;
    }
  }

  // Boolean props (just the prop name without value)
  const booleanRegex = /(?:^|\s)(\w+)(?=\s|$)/g;
  const cleanedProps = propsString.replace(/\w+="[^"]*"/g, '').replace(/\w+=\{[^}]+\}/g, '');
  while ((match = booleanRegex.exec(cleanedProps)) !== null) {
    if (!props[match[1]]) {
      props[match[1]] = true;
    }
  }

  return props;
}

/**
 * Extract children content between opening and closing tags
 */
function extractChildren(content: string, tagName: string): string {
  let depth = 1;
  let i = 0;

  while (i < content.length && depth > 0) {
    // Look for opening tags of the same type
    const openMatch = content.slice(i).match(new RegExp(`^<${tagName}(?:\\s|>|/)`));
    if (openMatch) {
      depth++;
      i += openMatch[0].length;
      continue;
    }

    // Look for closing tag
    const closeMatch = content.slice(i).match(new RegExp(`^</${tagName}>`));
    if (closeMatch) {
      depth--;
      if (depth === 0) {
        return content.slice(0, i).trim();
      }
      i += closeMatch[0].length;
      continue;
    }

    i++;
  }

  return content.trim();
}

/**
 * Find the end position of an element in the content string
 */
function findElementEnd(content: string, tagName: string): number {
  // Check for self-closing
  const selfCloseMatch = content.match(new RegExp(`^<${tagName}[^>]*/>`));
  if (selfCloseMatch) {
    return selfCloseMatch[0].length;
  }

  // Find closing tag
  let depth = 0;
  let i = 0;

  while (i < content.length) {
    // Opening tag
    const openMatch = content.slice(i).match(new RegExp(`^<${tagName}(?:\\s|>)`));
    if (openMatch) {
      depth++;
      i += openMatch[0].length;
      continue;
    }

    // Self-closing tag
    const selfMatch = content.slice(i).match(new RegExp(`^<${tagName}[^>]*/>`));
    if (selfMatch) {
      if (depth === 0) {
        return i + selfMatch[0].length;
      }
      i += selfMatch[0].length;
      continue;
    }

    // Closing tag
    const closeMatch = content.slice(i).match(new RegExp(`^</${tagName}>`));
    if (closeMatch) {
      depth--;
      if (depth === 0) {
        return i + closeMatch[0].length;
      }
      i += closeMatch[0].length;
      continue;
    }

    i++;
  }

  return -1;
}

/**
 * Create a CanvasNode from a parsed element
 */
function createNodeFromElement(
  element: ParsedElement,
  parentId: string | null,
  styleMap: Map<string, Record<string, string>> = new Map()
): CanvasNode | null {
  const componentDef = getComponentByName(element.tagName);

  // Extract styles from style prop (inline styles)
  const styles: Record<string, string> = {};
  if (typeof element.props.style === 'string') {
    element.props.style.split(';').forEach(pair => {
      const [prop, value] = pair.split(':').map(s => s.trim());
      if (prop && value) {
        styles[prop] = value;
      }
    });
    delete element.props.style;
  }

  // Look up styles from style block by class name
  const className = element.props.class as string | undefined;
  if (className && styleMap.has(className)) {
    const classStyles = styleMap.get(className)!;
    Object.assign(styles, classStyles);
  }
  // Remove class prop as it's auto-generated
  delete element.props.class;

  // Extract events from props
  const events: Record<string, string> = {};
  Object.keys(element.props).forEach(key => {
    if (key.startsWith('on') && key[2] === key[2].toUpperCase()) {
      const handler = element.props[key];
      if (typeof handler === 'string') {
        // Extract handler body from () => { ... } or () => ...
        const match = handler.match(/\(\)\s*=>\s*\{?\s*([\s\S]*?)\s*\}?$/);
        events[key] = match ? match[1].trim() : handler;
      }
      delete element.props[key];
    }
  });

  const nodeId = generateNodeId();
  const node: CanvasNode = {
    id: nodeId,
    componentName: element.tagName,
    props: element.props,
    styles,
    events,
    children: [],
    parentId,
  };

  // Parse children if the component accepts them
  if (!element.isSelfClosing && element.children) {
    // Check if children is just text content (check for both capital and lowercase tags)
    const hasChildElements = /<[A-Z]/.test(element.children);

    if (hasChildElements || /<[a-z]/.test(element.children)) {
      node.children = parseJSXElements(element.children, nodeId, styleMap);
    } else {
      // Text content - might be the value of a text prop
      const textContent = element.children.trim();
      if (textContent && !textContent.startsWith('{')) {
        // Determine which prop should hold text content
        const textProps = ['content', 'text', 'message', 'title', 'label'];
        const textProp = textProps.find(p =>
          componentDef?.props.some(cp => cp.name === p)
        );
        if (textProp && !node.props[textProp]) {
          node.props[textProp] = textContent;
        }
      }
    }
  }

  return node;
}

/**
 * Check if code can be parsed for visual editing
 */
export function canParseForVisualEditing(code: string): boolean {
  // Check if it's a valid page or component
  const hasPage = /page\s+\w+\s*\{/.test(code);
  const hasComponent = /component\s+\w+\s*\([^)]*\)\s*\{/.test(code);

  return hasPage || hasComponent;
}

/**
 * Extract page/component name from code
 */
export function extractName(code: string): string {
  const pageMatch = code.match(/page\s+(\w+)\s*\{/);
  if (pageMatch) return pageMatch[1];

  const componentMatch = code.match(/component\s+(\w+)\s*\(/);
  if (componentMatch) return componentMatch[1];

  return 'MyPage';
}
