'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GetServerSidePropsContext } from 'next';
import ScatterPlot, { ScatterPlotConfig } from '@/components/visualization/charts/ScatterPlot';
import ScatterPlotControlPanel from '@/components/visualization/charts/ScatterPlotControlPanel';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const sampleData = [
  { Income: 18000, Health: 0.18, Region: 'North' },
  { Income: 19500, Health: 0.22, Region: 'North' },
  { Income: 21000, Health: 0.25, Region: 'South' },
  { Income: 22000, Health: 0.28, Region: 'South' },
  { Income: 23000, Health: 0.32, Region: 'East' },
  { Income: 24000, Health: 0.35, Region: 'East' },
  { Income: 25000, Health: 0.38, Region: 'West' },
  { Income: 26000, Health: 0.42, Region: 'West' },
  { Income: 27000, Health: 0.45, Region: 'North' },
  { Income: 28000, Health: 0.48, Region: 'South' },
  { Income: 29000, Health: 0.52, Region: 'East' },
  { Income: 30000, Health: 0.55, Region: 'West' },
  { Income: 31000, Health: 0.58, Region: 'North' },
  { Income: 32000, Health: 0.62, Region: 'South' },
  { Income: 33000, Health: 0.65, Region: 'East' },
  { Income: 34000, Health: 0.68, Region: 'West' },
  { Income: 35000, Health: 0.72, Region: 'North' },
  { Income: 36000, Health: 0.75, Region: 'South' },
  { Income: 37000, Health: 0.78, Region: 'East' },
  { Income: 38000, Health: 0.82, Region: 'West' },
  { Income: 39000, Health: 0.85, Region: 'North' },
  { Income: 40000, Health: 0.88, Region: 'South' },
  { Income: 41000, Health: 0.92, Region: 'East' },
];

export default function ScatterPlotDemoPage() {
  const [renderMode, setRenderMode] = useState<'dynamic' | 'static'>('dynamic');
  const [colorMode, setColorMode] = useState<'single' | 'categorical'>('single');
  const [singleColor, setSingleColor] = useState('#174A7C');
  const [isLoading, setIsLoading] = useState(false);

  const getConfig = (): ScatterPlotConfig => {
    const baseConfig: ScatterPlotConfig = {
      plot_type: 'scatter',
      plot_properties: {
        x_column_names: ['Income'],
        y_column_names: ['Health'],
      },
      title: '',
      x_label: 'Income',
      y_label: 'Metro Health Index',
    };

    if (colorMode === 'categorical') {
      baseConfig.plot_properties.color = {
        category_column: 'Region',
        North: '#174A7C',
        South: '#A23C3C',
        East: '#2E8B57',
        West: '#FF8C00',
      };
    } else {
      baseConfig.plot_properties.color = singleColor;
    }

    return baseConfig;
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Simulate backend call for static image generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call your FastAPI backend
      // const response = await fetch('/api/charts/scatter/download', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ data: sampleData, config: getConfig() })
      // });
      
      console.log('Static image would be generated with config:', getConfig());
      alert('Static image download simulated! In production, this would download a high-quality Matplotlib image.');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Scatter Plot Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-4">
          <ScatterPlotControlPanel
            renderMode={renderMode}
            onRenderModeChange={setRenderMode}
            onDownload={handleDownload}
            isLoading={isLoading}
          />

          {/* Color Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Color Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Color Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={colorMode === 'single' ? 'default' : 'outline'}
                    onClick={() => setColorMode('single')}
                    size="sm"
                  >
                    Single Color
                  </Button>
                  <Button
                    variant={colorMode === 'categorical' ? 'default' : 'outline'}
                    onClick={() => setColorMode('categorical')}
                    size="sm"
                  >
                    By Region
                  </Button>
                </div>
              </div>

              {colorMode === 'single' && (
                <div className="space-y-2">
                  <Label htmlFor="color-picker">Point Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      id="color-picker"
                      type="color"
                      value={singleColor}
                      onChange={(e) => setSingleColor(e.target.value)}
                      className="w-12 h-12 rounded border shadow"
                      style={{ padding: 0, border: 'none', background: 'none' }}
                    />
                    <span className="font-mono text-base">{singleColor}</span>
                  </div>
                </div>
              )}

              {colorMode === 'categorical' && (
                <div className="text-sm text-gray-600">
                  <p>Points colored by Region:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• North: <span className="text-blue-600">Blue</span></li>
                    <li>• South: <span className="text-red-600">Red</span></li>
                    <li>• East: <span className="text-green-600">Green</span></li>
                    <li>• West: <span className="text-orange-600">Orange</span></li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart Display */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {renderMode === 'dynamic' ? 'Interactive Scatter Plot' : 'Static Scatter Plot'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ScatterPlot
                  data={sampleData}
                  config={getConfig()}
                  renderMode={renderMode}
                  onDownload={handleDownload}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}