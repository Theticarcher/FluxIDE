import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useVisualEditorStore } from '../../../stores/visual-editor-store';
import { FLUX_COMPONENTS, getAllCategories } from '../../../data/flux-components';
import { ComponentDefinition, ComponentCategory } from '../../../types/visual-editor';
import * as Icons from 'lucide-react';
import './ComponentPalette.css';

// Get icon component by name
function getIcon(name: string): React.ComponentType<{ size?: number }> {
  const iconName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[iconName] || Icons.Box;
}

// Draggable component item
function DraggableComponent({ component }: { component: ComponentDefinition }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${component.name}`,
    data: {
      type: 'palette',
      componentDef: component,
    },
  });

  const Icon = getIcon(component.icon);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className="palette-component"
      style={style}
      {...listeners}
      {...attributes}
      title={component.description}
    >
      <Icon size={14} />
      <span className="component-name">{component.name}</span>
    </div>
  );
}

// Category section with collapsible items
function CategorySection({
  category,
  components,
  expanded,
  onToggle,
}: {
  category: ComponentCategory;
  components: ComponentDefinition[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="palette-category">
      <button className="category-header" onClick={onToggle}>
        <Icons.ChevronRight
          size={14}
          className={`category-chevron ${expanded ? 'expanded' : ''}`}
        />
        <span className="category-name">{category}</span>
        <span className="category-count">{components.length}</span>
      </button>
      {expanded && (
        <div className="category-components">
          {components.map((component) => (
            <DraggableComponent key={component.name} component={component} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ComponentPalette() {
  const { searchQuery, setSearchQuery, expandedCategories, toggleCategory } =
    useVisualEditorStore();

  // Filter components by search query
  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return FLUX_COMPONENTS;
    const q = searchQuery.toLowerCase();
    return FLUX_COMPONENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group by category
  const groupedComponents = useMemo(() => {
    const groups: Record<ComponentCategory, ComponentDefinition[]> = {} as Record<
      ComponentCategory,
      ComponentDefinition[]
    >;
    getAllCategories().forEach((cat) => {
      groups[cat] = [];
    });
    filteredComponents.forEach((comp) => {
      if (!groups[comp.category]) {
        groups[comp.category] = [];
      }
      groups[comp.category].push(comp);
    });
    return groups;
  }, [filteredComponents]);

  const categories = getAllCategories();

  return (
    <div className="component-palette">
      <div className="palette-header">
        <span className="palette-title">Components</span>
      </div>

      <div className="palette-search">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="palette-content">
        {categories.map((category) => {
          const components = groupedComponents[category];
          if (components.length === 0) return null;
          return (
            <CategorySection
              key={category}
              category={category}
              components={components}
              expanded={expandedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
            />
          );
        })}
      </div>
    </div>
  );
}
