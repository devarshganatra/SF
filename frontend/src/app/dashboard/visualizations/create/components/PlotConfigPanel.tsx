import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

interface PlotConfigPanelProps {
  plotType: string;
  csvColumns: string[];
  config: any;
  setConfig: (cfg: any) => void;
}

// Drag-and-drop column selector
function DnDColumnSelector({
  label,
  assigned,
  setAssigned,
  available,
  multiple = true,
}: {
  label: string;
  assigned: string[];
  setAssigned: (cols: string[]) => void;
  available: string[];
  multiple?: boolean;
}) {
  // Drag and drop logic
  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    if (over && over.id === label && !assigned.includes(active.id)) {
      setAssigned(multiple ? [...assigned, active.id] : [active.id]);
    }
  };
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="mb-2">
        <div className="font-semibold mb-1">{label}</div>
        <div className="flex gap-2">
          <div className="border rounded p-2 min-w-[120px] bg-gray-50">
            <div className="text-xs text-gray-500 mb-1">Available</div>
            {available.filter(col => !assigned.includes(col)).map(col => (
              <DraggableColumn key={col} id={col}>{col}</DraggableColumn>
            ))}
          </div>
          <DropZone id={label} label={label + ' Columns'} items={assigned} />
        </div>
      </div>
    </DndContext>
  );
}

function DraggableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        cursor: 'grab',
        padding: '4px 8px',
        margin: '2px',
        borderRadius: '6px',
        background: '#e0e7ff',
        display: 'inline-block',
      }}
    >
      {children}
    </div>
  );
}

function DropZone({ id, label, items }: { id: string; label: string; items: string[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 40,
        border: `2px dashed ${isOver ? '#6366f1' : '#cbd5e1'}`,
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        background: isOver ? '#f1f5f9' : '#fff',
        minWidth: 120,
      }}
    >
      <div style={{ fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {items.map((item) => (
          <DraggableColumn key={item} id={item}>{item}</DraggableColumn>
        ))}
      </div>
    </div>
  );
}

export const PlotConfigPanel: React.FC<PlotConfigPanelProps> = ({ plotType, csvColumns, config, setConfig }) => {
  // State for drag-and-drop assignments
  const [xCols, setXCols] = useState<string[]>(config.x_column_names || []);
  const [yCols, setYCols] = useState<string[]>(config.y_column_names || []);
  const [zCols, setZCols] = useState<string[]>(config.z_column_names || []);
  const [colorCols, setColorCols] = useState<string[]>(config.color_columns || []);
  // Color pickers for y columns
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>(config.color || {});

  // Update config on change
  React.useEffect(() => {
    let plot_properties: any = {};
    // Chart-type-specific properties
    if (plotType === 'line') {
      plot_properties = {
        color: colorMap,
        line_style: config.line_style || 'solid',
        marker: config.marker || false,
      };
    } else if (plotType === 'bar') {
      plot_properties = {
        color: colorMap,
        orientation: config.orientation || 'v',
        bar_mode: config.bar_mode || 'group',
      };
    } else if (plotType === 'scatter') {
      plot_properties = {
        color: colorMap,
        size: config.size || '',
        symbol: config.symbol || '',
        mode: config.mode || 'markers',
      };
    } else if (plotType === 'box') {
      plot_properties = {
        color: colorMap,
        boxpoints: config.boxpoints || 'all',
      };
    } else if (plotType === 'violin') {
      plot_properties = {
        color: colorMap,
        points: config.points || 'all',
        box: config.box || false,
        meanline: config.meanline || false,
      };
    } else if (plotType === 'histogram') {
      plot_properties = {
        color: colorMap,
        nbins: config.nbins || 20,
        cumulative: config.cumulative || false,
        histnorm: config.histnorm || false,
      };
    } else if (plotType === 'heatmap') {
      plot_properties = {
        color_scale: config.color_scale || 'Viridis',
      };
    } else if (plotType === 'pie') {
      plot_properties = {
        color: config.color || '',
        hole: config.hole || 0.0,
      };
    } else if (plotType === 'area') {
      plot_properties = {
        color: config.color || '',
        stackgroup: config.stackgroup || '',
        mode: config.mode || 'lines',
      };
    }
    setConfig({
      plot_type: plotType,
      x_column_names: xCols,
      y_column_names: yCols,
      z_column_names: zCols,
      color_columns: colorCols,
      plot_properties,
      title: config.title || '',
      x_label: config.x_label || '',
      y_label: config.y_label || '',
    });
    // eslint-disable-next-line
  }, [plotType, xCols, yCols, zCols, colorCols, colorMap, config.line_style, config.marker, config.orientation, config.bar_mode, config.size, config.symbol, config.mode, config.boxpoints, config.points, config.box, config.meanline, config.nbins, config.cumulative, config.histnorm, config.color_scale, config.hole, config.stackgroup, config.title, config.x_label, config.y_label]);

  // Render color pickers for y columns
  const renderColorPickers = (yCols: string[]) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {yCols.map(yCol => (
        <div key={yCol} className="flex items-center gap-2">
          <span>{yCol}</span>
          <input
            type="color"
            value={colorMap?.[yCol] || '#6366f1'}
            onChange={e => setColorMap({ ...colorMap, [yCol]: e.target.value })}
            style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
          />
        </div>
      ))}
    </div>
  );

  // Render plot-type-specific controls
  let extraControls = null;
  if (plotType === 'line') {
    extraControls = (
      <>
        <div>
          <label>Line Style</label>
          <select value={config.line_style || 'solid'} onChange={e => setConfig({ ...config, line_style: e.target.value })}>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
        <div>
          <label>Show Marker</label>
          <input type="checkbox" checked={!!config.marker} onChange={e => setConfig({ ...config, marker: e.target.checked })} />
        </div>
      </>
    );
  } else if (plotType === 'bar') {
    extraControls = (
      <>
        <div>
          <label>Orientation</label>
          <select value={config.orientation || 'v'} onChange={e => setConfig({ ...config, orientation: e.target.value })}>
            <option value="v">Vertical</option>
            <option value="h">Horizontal</option>
          </select>
        </div>
        <div>
          <label>Bar Mode</label>
          <select value={config.bar_mode || 'group'} onChange={e => setConfig({ ...config, bar_mode: e.target.value })}>
            <option value="group">Group</option>
            <option value="stack">Stack</option>
          </select>
        </div>
      </>
    );
  } else if (plotType === 'scatter') {
    extraControls = (
      <>
        <div>
          <label>Size</label>
          <select value={config.size || ''} onChange={e => setConfig({ ...config, size: e.target.value })}>
            <option value="">None</option>
            {csvColumns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>
        <div>
          <label>Symbol</label>
          <select value={config.symbol || ''} onChange={e => setConfig({ ...config, symbol: e.target.value })}>
            <option value="">None</option>
            {csvColumns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>
        <div>
          <label>Mode</label>
          <select value={config.mode || 'markers'} onChange={e => setConfig({ ...config, mode: e.target.value })}>
            <option value="markers">Markers</option>
            <option value="lines+markers">Lines+Markers</option>
          </select>
        </div>
      </>
    );
  } // Add more plot types as needed

  return (
    <div className="space-y-4">
      <DnDColumnSelector label="X Columns" assigned={xCols} setAssigned={setXCols} available={csvColumns} multiple={true} />
      <DnDColumnSelector label="Y Columns" assigned={yCols} setAssigned={setYCols} available={csvColumns} multiple={true} />
      {/* Add Z, Color, etc. as needed for other plot types */}
      {yCols.length > 0 && renderColorPickers(yCols)}
      <div>
        <label>Plot Title</label>
        <input className="border rounded px-2 py-1 w-full" value={config.title || ''} onChange={e => setConfig({ ...config, title: e.target.value })} />
      </div>
      <div>
        <label>X Axis Label</label>
        <input className="border rounded px-2 py-1 w-full" value={config.x_label || ''} onChange={e => setConfig({ ...config, x_label: e.target.value })} />
      </div>
      <div>
        <label>Y Axis Label</label>
        <input className="border rounded px-2 py-1 w-full" value={config.y_label || ''} onChange={e => setConfig({ ...config, y_label: e.target.value })} />
      </div>
      {extraControls}
    </div>
  );
}; 