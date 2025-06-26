"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectField } from './MultiSelectField';
import { PreviewSection } from './PreviewSection';

interface LinePlotFormState {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  xAxisAttributes: string[];
  yAxisAttributes: string[];
  yAxisColors: { [key: string]: string };
  plotType: string;
}

interface LinePlotFormProps {
  csvColumns: string[];
  onSubmit: (data: LinePlotFormState) => void;
  isBackendPlotLoading: boolean;
}

export function LinePlotFormWrapper({ csvColumns, onSubmit, isBackendPlotLoading }: LinePlotFormProps) {
  const [formState, setFormState] = useState<LinePlotFormState>({
    title: '',
    xAxisLabel: '',
    yAxisLabel: '',
    xAxisAttributes: [],
    yAxisAttributes: [],
    yAxisColors: {},
    plotType: "line"
  });

  const handleChange = (field: keyof LinePlotFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (yAttr: string, color: string) => {
    setFormState((prev) => ({
      ...prev,
      yAxisColors: { ...prev.yAxisColors, [yAttr]: color },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plot Configuration</CardTitle>
        <CardDescription>Configure your multi-combination chart settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Plot Title</label>
              <Input
                placeholder="Enter plot title"
                value={formState.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div>
              <label>X-axis Label</label>
              <Input
                placeholder="Enter X-axis label"
                value={formState.xAxisLabel}
                onChange={(e) => handleChange('xAxisLabel', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Y-axis Label</label>
            <Input
              placeholder="Enter Y-axis label"
              value={formState.yAxisLabel}
              onChange={(e) => handleChange('yAxisLabel', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>X-axis Attributes</label>
              <MultiSelectField
                options={csvColumns}
                value={formState.xAxisAttributes}
                onChange={(value) => handleChange('xAxisAttributes', value)}
                placeholder="Drag columns here for X-axis"
                axisLabel="X-axis"
              />
              <p className="text-xs text-muted-foreground">
                Selected: {formState.xAxisAttributes.length} column(s)
              </p>
            </div>
            <div>
              <label>Y-axis Attributes</label>
              <MultiSelectField
                options={csvColumns}
                value={formState.yAxisAttributes}
                onChange={(value) => handleChange('yAxisAttributes', value)}
                placeholder="Drag columns here for Y-axis"
                axisLabel="Y-axis"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formState.yAxisAttributes.map((yAttr) => (
                  <div key={yAttr} className="flex items-center gap-2">
                    <span>{yAttr}</span>
                    <input
                      type="color"
                      value={formState.yAxisColors[yAttr] || '#6366f1'}
                      onChange={e => handleColorChange(yAttr, e.target.value)}
                      style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {formState.yAxisAttributes.length} column(s)
              </p>
            </div>
          </div>

          <PreviewSection 
            xAttributes={formState.xAxisAttributes} 
            yAttributes={formState.yAxisAttributes} 
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isBackendPlotLoading}
          >
            {isBackendPlotLoading ? (
              <>
                <span className="mr-2">Generating Plots...</span>
                <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              </>
            ) : (
              'Generate Plots'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}