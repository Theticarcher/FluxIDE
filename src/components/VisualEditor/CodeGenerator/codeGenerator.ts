import { CanvasNode } from '../../../types/visual-editor';
import { getComponentByName } from '../../../data/flux-components';

/**
 * Generates Flux code from a visual canvas tree
 */
export function generateFluxCode(
  nodes: CanvasNode[],
  pageOrComponentName: string = 'MyPage',
  isComponent: boolean = false
): string {
  if (nodes.length === 0) {
    // Return empty page/component template with valid Flux syntax
    if (isComponent) {
      return `component ${pageOrComponentName}() {\n  <div></div>\n}\n`;
    }
    return `page ${pageOrComponentName} {\n  <div></div>\n}\n`;
  }

  const lines: string[] = [];

  // Collect all state declarations from nodes
  const stateDeclarations = collectStateDeclarations(nodes);

  // Start page/component
  if (isComponent) {
    lines.push(`component ${pageOrComponentName}() {`);
  } else {
    lines.push(`page ${pageOrComponentName} {`);
  }

  // Add state declarations if any
  if (stateDeclarations.length > 0) {
    stateDeclarations.forEach(state => {
      lines.push(`  state ${state.name} = ${state.value}`);
    });
    lines.push('');
  }

  // Collect and generate styles BEFORE JSX (Flux requires style block before JSX)
  const styles = collectStyles(nodes);
  if (styles.length > 0) {
    lines.push('  style {');
    styles.forEach(style => {
      lines.push(`    .${style.className} {`);
      Object.entries(style.properties).forEach(([prop, value]) => {
        lines.push(`      ${prop}: ${value};`);
      });
      lines.push('    }');
    });
    lines.push('  }');
    lines.push('');
  }

  // Generate JSX for all root nodes
  if (nodes.length === 1) {
    // Single root node
    lines.push(generateJSXNode(nodes[0], 2));
  } else {
    // Multiple root nodes - wrap in a div (Flux doesn't support fragments)
    lines.push('  <div>');
    nodes.forEach(node => {
      lines.push(generateJSXNode(node, 4));
    });
    lines.push('  </div>');
  }

  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate JSX for a single node and its children
 */
function generateJSXNode(node: CanvasNode, indent: number): string {
  const spaces = ' '.repeat(indent);
  const componentDef = getComponentByName(node.componentName);
  const acceptsChildren = componentDef?.acceptsChildren ?? false;

  // Build props string
  const propsArray: string[] = [];

  // Text content props that should become children instead of attributes
  const textContentProps = ['content', 'text', 'message', 'title', 'label'];
  const textContent = getTextContent(node);

  // Add regular props
  Object.entries(node.props).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    // Skip text content props - they'll be rendered as children instead
    if (textContent && textContentProps.includes(key) && node.props[key] === textContent) {
      return;
    }

    // Skip default values
    const propDef = componentDef?.props.find(p => p.name === key);
    if (propDef && propDef.defaultValue === value) return;

    propsArray.push(formatProp(key, value));
  });

  // Always add a class to nodes for selection/editing in the visual editor
  // If the node has styles, they'll be in the style block
  // Use full node ID as class name to ensure uniqueness
  propsArray.push(`class="${node.id}"`);

  // Add event handlers
  Object.entries(node.events).forEach(([event, handler]) => {
    if (handler) {
      propsArray.push(`${event}={() => { ${handler} }}`);
    }
  });

  const propsString = propsArray.length > 0 ? ' ' + propsArray.join(' ') : '';
  const tagName = node.componentName;

  // Self-closing tag for components without children
  if (!acceptsChildren || node.children.length === 0) {
    // If component has text content, render as children instead of self-closing
    if (textContent) {
      return `${spaces}<${tagName}${propsString}>${escapeJSX(textContent)}</${tagName}>`;
    }
    return `${spaces}<${tagName}${propsString} />`;
  }

  // Tag with children
  const childrenLines = node.children.map(child =>
    generateJSXNode(child, indent + 2)
  );

  return [
    `${spaces}<${tagName}${propsString}>`,
    ...childrenLines,
    `${spaces}</${tagName}>`,
  ].join('\n');
}

/**
 * Format a prop for JSX output
 */
function formatProp(name: string, value: unknown): string {
  if (typeof value === 'string') {
    // Check if it looks like an expression (starts with variable name or contains operators)
    // But not for class/className props which should always be strings
    if (name !== 'class' && name !== 'className' && isExpression(value)) {
      return `${name}={${value}}`;
    }
    return `${name}="${escapeString(value)}"`;
  }

  if (typeof value === 'number') {
    return `${name}={${value}}`;
  }

  if (typeof value === 'boolean') {
    return value ? name : `${name}={false}`;
  }

  if (Array.isArray(value)) {
    return `${name}={${JSON.stringify(value)}}`;
  }

  if (typeof value === 'object' && value !== null) {
    return `${name}={${JSON.stringify(value)}}`;
  }

  return `${name}={${String(value)}}`;
}

/**
 * Check if a string value looks like a JavaScript expression
 * Be conservative - only treat it as an expression if it has clear expression syntax
 */
function isExpression(value: string): boolean {
  // Skip empty or whitespace-only values
  if (!value.trim()) return false;

  // Function calls or grouping
  if (value.includes('(') && value.includes(')')) return true;

  // Arithmetic/comparison operators (but not single minus which could be a class name like "my-class")
  if (value.includes('+') || value.includes('*') || value.includes('/')) return true;
  if (value.includes('===') || value.includes('!==') || value.includes('==') || value.includes('!=')) return true;
  if (value.includes('>=') || value.includes('<=') || value.includes('&&') || value.includes('||')) return true;

  // Ternary operator
  if (value.includes('?') && value.includes(':')) return true;

  // Property access (but be careful - could be a decimal number)
  if (value.includes('.') && !/^\d+\.\d+$/.test(value)) return true;

  // Array access
  if (value.includes('[') && value.includes(']')) return true;

  // Logical not
  if (value.startsWith('!')) return true;

  // Template literals
  if (value.includes('`') || value.includes('${')) return true;

  // Don't treat simple single words as expressions - they're likely string enum values
  // like "heading", "primary", "large", etc.
  return false;
}

/**
 * Escape special characters for JSX strings
 */
function escapeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape text content for JSX
 */
function escapeJSX(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');
}

/**
 * Get text content from a node (for components like Text, Heading, Button)
 */
function getTextContent(node: CanvasNode): string | null {
  const textProps = ['content', 'text', 'message', 'title', 'label'];
  for (const prop of textProps) {
    const value = node.props[prop];
    if (typeof value === 'string' && value) {
      return value;
    }
  }
  return null;
}

/**
 * Collect state declarations from nodes
 * (for nodes that have expression props referencing state)
 *
 * NOTE: State inference is disabled for now as it's too aggressive and creates
 * invalid state declarations. Users should add state manually in the code editor.
 */
function collectStateDeclarations(_nodes: CanvasNode[]): { name: string; value: string }[] {
  // Disabled - state inference was creating invalid declarations from CSS class names
  // and common prop values. Users should add state declarations manually.
  return [];
}

// Note: inferDefaultValue was previously used for state inference but is currently disabled.
// Keeping this comment for documentation purposes - state inference was too aggressive
// and created invalid declarations from CSS class names and common prop values.

/**
 * Collect styles from nodes that have inline styles
 */
function collectStyles(nodes: CanvasNode[]): { className: string; properties: Record<string, string> }[] {
  const styles: { className: string; properties: Record<string, string> }[] = [];

  function processNode(node: CanvasNode) {
    if (Object.keys(node.styles).length > 0) {
      // Use full node ID as class name to match generateJSXNode
      styles.push({
        className: node.id,
        properties: node.styles,
      });
    }
    node.children.forEach(processNode);
  }

  nodes.forEach(processNode);
  return styles;
}

/**
 * Generate code for inserting at a specific location in existing code
 */
export function generateInsertCode(node: CanvasNode): string {
  return generateJSXNode(node, 0);
}
