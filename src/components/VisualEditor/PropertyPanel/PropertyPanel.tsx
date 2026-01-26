import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Plus, Settings, Palette, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useVisualEditorStore } from '../../../stores/visual-editor-store';
import { getComponentByName } from '../../../data/flux-components';
import { PropDefinition } from '../../../types/visual-editor';
import './PropertyPanel.css';

// Get icon component by name
function getIcon(name: string): React.ComponentType<{ size?: number }> {
  const iconName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[iconName] || Icons.Box;
}

// Individual prop editor based on type
function PropEditor({
  prop,
  value,
  onChange,
}: {
  prop: PropDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const currentValue = value ?? prop.defaultValue ?? '';

  switch (prop.type) {
    case 'string':
      return (
        <input
          type="text"
          className="prop-input"
          value={currentValue as string}
          placeholder={prop.placeholder || prop.name}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className="prop-input"
          value={currentValue as number}
          placeholder={prop.placeholder || prop.name}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      );

    case 'boolean':
      return (
        <label className="prop-checkbox">
          <input
            type="checkbox"
            checked={currentValue as boolean}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="checkbox-label">{currentValue ? 'Yes' : 'No'}</span>
        </label>
      );

    case 'select':
      return (
        <select
          className="prop-select"
          value={currentValue as string}
          onChange={(e) => onChange(e.target.value)}
        >
          {prop.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'color':
      return (
        <div className="prop-color">
          <input
            type="color"
            className="color-picker"
            value={currentValue as string || '#3b82f6'}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            type="text"
            className="prop-input color-text"
            value={currentValue as string}
            placeholder="#000000"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'expression':
      return (
        <input
          type="text"
          className="prop-input expression"
          value={currentValue as string}
          placeholder={prop.placeholder || 'expression'}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'array':
      return (
        <ArrayEditor
          value={(currentValue as unknown[]) || []}
          onChange={onChange}
        />
      );

    default:
      return (
        <input
          type="text"
          className="prop-input"
          value={String(currentValue)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

// Array editor component
function ArrayEditor({
  value,
  onChange,
}: {
  value: unknown[];
  onChange: (value: unknown[]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAdd = () => {
    onChange([...value, '']);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, newValue: string) => {
    const newArray = [...value];
    newArray[index] = newValue;
    onChange(newArray);
  };

  return (
    <div className="array-editor">
      <button className="array-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span>{value.length} items</span>
      </button>
      {isExpanded && (
        <div className="array-items">
          {value.map((item, index) => (
            <div key={index} className="array-item">
              <input
                type="text"
                className="prop-input"
                value={String(item)}
                onChange={(e) => handleChange(index, e.target.value)}
              />
              <button
                className="array-remove"
                onClick={() => handleRemove(index)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button className="array-add" onClick={handleAdd}>
            <Plus size={12} />
            Add item
          </button>
        </div>
      )}
    </div>
  );
}

// Style editor component
function StyleEditor({
  styles,
  onChange,
}: {
  styles: Record<string, string>;
  onChange: (styles: Record<string, string>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newProp, setNewProp] = useState('');

  const commonStyles = [
    'color',
    'background',
    'padding',
    'margin',
    'border',
    'border-radius',
    'font-size',
    'font-weight',
    'width',
    'height',
    'display',
    'flex-direction',
    'gap',
    'align-items',
    'justify-content',
  ];

  const handleChange = (prop: string, value: string) => {
    onChange({ ...styles, [prop]: value });
  };

  const handleRemove = (prop: string) => {
    const newStyles = { ...styles };
    delete newStyles[prop];
    onChange(newStyles);
  };

  const handleAdd = () => {
    if (newProp && !styles[newProp]) {
      onChange({ ...styles, [newProp]: '' });
      setNewProp('');
    }
  };

  return (
    <div className="style-editor">
      <button className="section-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Palette size={14} />
        <span>Styles</span>
        <span className="section-count">{Object.keys(styles).length}</span>
      </button>

      {isExpanded && (
        <div className="section-content">
          {Object.entries(styles).map(([prop, value]) => (
            <div key={prop} className="style-row">
              <span className="style-prop">{prop}</span>
              <input
                type="text"
                className="prop-input"
                value={value}
                onChange={(e) => handleChange(prop, e.target.value)}
              />
              <button
                className="style-remove"
                onClick={() => handleRemove(prop)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          <div className="style-add">
            <select
              className="prop-select"
              value={newProp}
              onChange={(e) => setNewProp(e.target.value)}
            >
              <option value="">Add style...</option>
              {commonStyles
                .filter((s) => !styles[s])
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
            <button className="style-add-btn" onClick={handleAdd} disabled={!newProp}>
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Event editor component
function EventEditor({
  events,
  componentEvents,
  onChange,
}: {
  events: Record<string, string>;
  componentEvents: { name: string; description: string }[];
  onChange: (events: Record<string, string>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (event: string, handler: string) => {
    onChange({ ...events, [event]: handler });
  };

  const handleRemove = (event: string) => {
    const newEvents = { ...events };
    delete newEvents[event];
    onChange(newEvents);
  };

  const handleAdd = (event: string) => {
    if (!events[event]) {
      onChange({ ...events, [event]: '' });
    }
  };

  const availableEvents = componentEvents.filter((e) => !events[e.name]);

  return (
    <div className="event-editor">
      <button className="section-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Zap size={14} />
        <span>Events</span>
        <span className="section-count">{Object.keys(events).length}</span>
      </button>

      {isExpanded && (
        <div className="section-content">
          {Object.entries(events).map(([event, handler]) => (
            <div key={event} className="event-row">
              <span className="event-name">{event}</span>
              <input
                type="text"
                className="prop-input expression"
                value={handler}
                placeholder="() => { ... }"
                onChange={(e) => handleChange(event, e.target.value)}
              />
              <button
                className="event-remove"
                onClick={() => handleRemove(event)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {availableEvents.length > 0 && (
            <div className="event-add">
              <select
                className="prop-select"
                onChange={(e) => {
                  if (e.target.value) {
                    handleAdd(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Add event...</option>
                {availableEvents.map((e) => (
                  <option key={e.name} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PropertyPanel() {
  const { selectedNodeId, updateNodeProps, updateNodeStyles, updateNodeEvents, findNodeById } =
    useVisualEditorStore();

  const selectedNode = selectedNodeId ? findNodeById(selectedNodeId) : null;
  const componentDef = selectedNode ? getComponentByName(selectedNode.componentName) : null;

  const [propsExpanded, setPropsExpanded] = useState(true);

  if (!selectedNode || !componentDef) {
    return (
      <div className="property-panel">
        <div className="panel-header">
          <Settings size={14} />
          <span>Properties</span>
        </div>
        <div className="panel-empty">
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const Icon = getIcon(componentDef.icon);

  const handlePropChange = (propName: string, value: unknown) => {
    updateNodeProps(selectedNode.id, { [propName]: value });
  };

  return (
    <div className="property-panel">
      <div className="panel-header">
        <Icon size={14} />
        <span>{selectedNode.componentName}</span>
      </div>

      <div className="panel-content">
        {/* Properties section */}
        <div className="panel-section">
          <button
            className="section-toggle"
            onClick={() => setPropsExpanded(!propsExpanded)}
          >
            {propsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Settings size={14} />
            <span>Properties</span>
            <span className="section-count">{componentDef.props.length}</span>
          </button>

          {propsExpanded && (
            <div className="section-content">
              {componentDef.props.map((prop) => (
                <div key={prop.name} className="prop-row">
                  <label className="prop-label">
                    {prop.name}
                    {prop.required && <span className="required">*</span>}
                  </label>
                  <PropEditor
                    prop={prop}
                    value={selectedNode.props[prop.name]}
                    onChange={(value) => handlePropChange(prop.name, value)}
                  />
                  {prop.description && (
                    <span className="prop-hint">{prop.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Styles section */}
        <StyleEditor
          styles={selectedNode.styles}
          onChange={(styles) => updateNodeStyles(selectedNode.id, styles)}
        />

        {/* Events section */}
        <EventEditor
          events={selectedNode.events}
          componentEvents={componentDef.events}
          onChange={(events) => updateNodeEvents(selectedNode.id, events)}
        />
      </div>
    </div>
  );
}
