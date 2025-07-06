'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScatterPlotControlPanelProps {
  renderMode: 'dynamic' | 'static';
  onRenderModeChange: (mode: 'dynamic' | 'static') => void;
  onDownload?: () => void;
  isLoading?: boolean;
}

const ScatterPlotControlPanel: React.FC<ScatterPlotControlPanelProps> = ({
  renderMode,
  onRenderModeChange,
  onDownload,
  isLoading = false,
}) => {
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>Scatter Plot Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="render-mode">Render Mode</Label>
          <Select value={renderMode} onValueChange={(value: 'dynamic' | 'static') => onRenderModeChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select render mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dynamic">Dynamic (Plotly)</SelectItem>
              <SelectItem value="static">Static (Matplotlib)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderMode === 'static' && onDownload && (
          <Button
            onClick={onDownload}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Download Static Image'}
          </Button>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Dynamic Mode:</strong> Interactive Plotly chart with zoom, pan, and hover</p>
          <p><strong>Static Mode:</strong> High-quality Matplotlib image for publications</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScatterPlotControlPanel; 