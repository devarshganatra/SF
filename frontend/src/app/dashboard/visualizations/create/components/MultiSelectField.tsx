import React from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

interface MultiSelectFieldProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  axisLabel: string;
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

function DropZone({ id, label, items, onDrop }: { id: string; label: string; items: string[]; onDrop: (item: string) => void }) {
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

export function MultiSelectField({ options, value, onChange, placeholder, axisLabel }: MultiSelectFieldProps) {
  // Items not yet selected
  const available = options.filter((opt) => !value.includes(opt));

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
    if (over && over.id === axisLabel && !value.includes(active.id)) {
      onChange([...value, active.id]);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ marginBottom: 8 }}>
        <DropZone id={axisLabel} label={axisLabel + ' Columns'} items={value} onDrop={() => {}} />
      </div>
      <div style={{ fontWeight: 500, marginBottom: 4 }}>Available Columns</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {available.length === 0 ? (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        ) : (
          available.map((opt) => (
            <DraggableColumn key={opt} id={opt}>{opt}</DraggableColumn>
          ))
        )}
      </div>
    </DndContext>
  );
}