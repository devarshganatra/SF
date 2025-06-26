"use client"

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCSVData } from '@/components/visualization/hooks/useCSVData';
import { useBackendPlot } from '@/components/visualization/hooks/useBackendPlot';
import { LinePlotConfig } from '@/components/visualization/types';
import { generateXYCombinations, processDataForLinePlot, getPrimaryXAxis } from '@/components/visualization/utils/plotUtils';

import { UploadSection } from './components/UploadSection';
import { LinePlotFormWrapper } from './components/FormWrapper';
import { FrontendTab } from './tabs/FrontendTab';
import { BackendTab } from './tabs/BackendTab';

export default function CreateVisualization() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>("frontend");
  const [plotConfig, setPlotConfig] = useState<LinePlotConfig | null>(null);
  const [plotType, setPlotType] = useState<'static' | 'dynamic'>('static');
  const [dynamicPlotHtml, setDynamicPlotHtml] = useState<string | null>(null);

  // Use our custom hooks
  const { 
    csvData, 
    csvColumns, 
    csvFile, 
    isUploading, 
    handleFileUpload 
  } = useCSVData();

  const { 
    backendPlotUrl, 
    isBackendPlotLoading, 
    generateBackendPlot 
  } = useBackendPlot();

  const onSubmit = async (data: any) => {
    setPlotConfig(data);
    setDynamicPlotHtml(null);
    // Prepare x, y, and colors arrays for backend
    const x = csvData.map(row => row[data.xAxisAttributes[0]]);
    const yList = data.yAxisAttributes.map((yAttr: string) => csvData.map(row => row[yAttr]));
    const colors = data.yAxisAttributes.map((yAttr: string) => data.yAxisColors?.[yAttr] || '#6366f1');
    if (plotType === 'dynamic') {
      // Call backend for plotly
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/plot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotType: 'dynamic',
          x,
          y: yList,
          colors,
          title: data.title || 'Dynamic Plot',
        }),
      });
      const result = await res.json();
      setDynamicPlotHtml(result.plotly_html);
      setActiveTab('backend');
    } else {
      // Use existing backendPlot logic for static
      await generateBackendPlot({ ...data, x, y: yList, colors }, csvFile);
      setActiveTab('backend');
    }
    const totalLines = data.xAxisAttributes.length * data.yAxisAttributes.length;
    toast.success(`Plot generated successfully! Created ${totalLines} lines from ${data.xAxisAttributes.length} X-axis and ${data.yAxisAttributes.length} Y-axis attributes.`);
  };

  // Pre-compute data for visualization
  const combinations = plotConfig ? generateXYCombinations(plotConfig, plotConfig.yAxisColors) : [];
  const processedData = plotConfig ? processDataForLinePlot(plotConfig, csvData, combinations) : [];
  const primaryXAxis = plotConfig ? getPrimaryXAxis(plotConfig) : 'index';

  // Update: Live update for dynamic plotly
  useEffect(() => {
    if (plotType === 'dynamic' && plotConfig && csvData.length > 0) {
      // Prepare x and y data arrays from selected columns
      const x = csvData.map(row => row[plotConfig.xAxisAttributes[0]]);
      const y = csvData.map(row => row[plotConfig.yAxisAttributes[0]]);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      fetch(`${backendUrl}/api/plot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotType: 'dynamic',
          x,
          y,
          title: plotConfig.title || 'Dynamic Plot',
        }),
      })
        .then(res => res.json())
        .then(result => setDynamicPlotHtml(result.plotly_html));
    }
  }, [plotType, plotConfig, csvData]);

  return (
    <div className="min-h-screen p-8">
      <div className="mb-6">
        <Button variant="link" className="p-0" asChild>
          <Link href="/dashboard/visualizations">
            ← Back to Visualizations
          </Link>
        </Button>
      </div>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Create New Visualization</h1>
      </header>
      
      <div className="space-y-8">
        {/* File Upload Section */}
        <UploadSection
          handleFileUpload={handleFileUpload}
          isUploading={isUploading}
          csvData={csvData}
          csvColumns={csvColumns}
          fileInputRef={fileInputRef}
        />

        {/* Plot Type Selector */}
        <div className="flex items-center gap-4">
          <label htmlFor="plotType">Plot Type:</label>
          <select
            id="plotType"
            value={plotType}
            onChange={e => setPlotType(e.target.value as 'static' | 'dynamic')}
            className="border rounded px-2 py-1"
          >
            <option value="static">Static (Matplotlib)</option>
            <option value="dynamic">Dynamic (Plotly)</option>
          </select>
        </div>

        {/* Plot Configuration Form */}
        {csvData.length > 0 && (
          <LinePlotFormWrapper
            csvColumns={csvColumns}
            onSubmit={onSubmit}
            isBackendPlotLoading={isBackendPlotLoading}
          />
        )}

        {/* Chart Display with Tabs for Frontend/Backend Plots */}
        {plotConfig && csvData.length > 0 && (processedData.length > 0 || backendPlotUrl || dynamicPlotHtml) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{plotConfig.title}</CardTitle>
                <CardDescription>
                  Visualization with {combinations.length} lines 
                  ({plotConfig.xAxisAttributes.length} X-axis × {plotConfig.yAxisAttributes.length} Y-axis attributes)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 w-[400px]">
                  <TabsTrigger value="frontend">Interactive Frontend</TabsTrigger>
                  <TabsTrigger 
                    value="backend" 
                    disabled={!(backendPlotUrl || dynamicPlotHtml) && !isBackendPlotLoading}
                  >
                    Backend {plotType === 'dynamic' ? 'Plotly' : 'Matplotlib'}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="frontend">
                  <FrontendTab 
                    config={plotConfig}
                    processedData={processedData}
                    primaryXAxis={primaryXAxis}
                    combinations={combinations}
                  />
                </TabsContent>
                <TabsContent value="backend">
                  {plotType === 'dynamic' && dynamicPlotHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: dynamicPlotHtml }} />
                  ) : plotType === 'static' && backendPlotUrl ? (
                    <a href={backendPlotUrl} download target="_blank" rel="noopener noreferrer">
                      <Button>Download Static Plot (Matplotlib)</Button>
                    </a>
                  ) : null}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}