import React from 'react';

interface PreviewSectionProps {
  xAttributes: string[];
  yAttributes: string[];
}

export function PreviewSection({ xAttributes, yAttributes }: PreviewSectionProps) {
  if (xAttributes.length === 0 || yAttributes.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <p className="text-sm text-blue-800 font-medium mb-2">
        <strong>Chart Preview:</strong> {xAttributes.length} × {yAttributes.length} = {xAttributes.length * yAttributes.length} lines
      </p>
      <div className="text-xs text-blue-700 space-y-1">
        <p><strong>X-axis attributes:</strong> {xAttributes.join(', ')}</p>
        <p><strong>Y-axis attributes:</strong> {yAttributes.join(', ')}</p>
        <p><strong>Combinations:</strong></p>
        <div className="ml-2 grid grid-cols-2 gap-1">
          {xAttributes.slice(0, 4).map(x => 
            yAttributes.slice(0, 3).map(y => (
              <span key={`${x}-${y}`} className="text-xs">• {y} vs {x}</span>
            ))
          )}
          {xAttributes.length * yAttributes.length > 12 && (
            <span className="text-xs font-medium">... and {(xAttributes.length * yAttributes.length) - 12} more</span>
          )}
        </div>
      </div>
    </div>
  );
}