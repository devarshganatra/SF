"use client"

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import Plot from '@/components/PlotlyClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCSVData } from '@/components/visualization/hooks/useCSVData';
import { LinePlotConfig } from '@/components/visualization/types';
import { generateXYCombinations, processDataForLinePlot, getPrimaryXAxis } from '@/components/visualization/utils/plotUtils';

import { UploadSection } from './components/UploadSection';
import { LinePlotFormWrapper } from './components/FormWrapper';
import { FrontendTab } from './tabs/FrontendTab';
import { PlotConfigPanel } from './components/PlotConfigPanel';

export default function CreateVisualization() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>("frontend");
  const [plotConfig, setPlotConfig] = useState<LinePlotConfig | null>(null);
  const [plotType, setPlotType] = useState<string>('line');
  // States for dynamic Plotly JSON rendering
  const [dynamicPlotData, setDynamicPlotData] = useState<any[]>([]);
  const [dynamicPlotLayout, setDynamicPlotLayout] = useState<any>({});
  const [staticImgUrl, setStaticImgUrl] = useState<string | null>(null);
  const [isBackendPlotLoading, setIsBackendPlotLoading] = useState(false);
  const [config, setConfig] = useState<any>({ plot_type: 'line' });
  const [mode, setMode] = useState<'static' | 'dynamic'>('static');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Use our custom hooks
  const { 
    csvData, 
    csvColumns, 
    csvFile, 
    isUploading, 
    handleFileUpload, 
    fileType, 
    imageUrl 
  } = useCSVData();

  // Handle plot type change
  const handlePlotTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pt = e.target.value;
    setPlotType(pt);
    setConfig({ plot_type: pt });
  };

  // Handle mode change
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as 'static' | 'dynamic');
  };

  // Generate plot
  const handleGeneratePlot = async () => {
    if (!csvFile) return;
    setIsLoading(true);
    setPreviewUrl(null);
    setPreviewHtml(null);
    const formData = new FormData();
    // For dynamic plots use new backend mode that returns JSON
    formData.append('mode', mode === 'dynamic' ? 'dynamic-json' : mode);
    formData.append('config', JSON.stringify(config));
    formData.append('file', csvFile);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/api/plot`, {
      method: 'POST',
      body: formData,
    });
    if (mode === 'static') {
      if (res.ok) {
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        setPreviewUrl(null);
        toast.error('Failed to generate static plot.');
      }
    } else {
      if (res.ok) {
        const json = await res.json();
        console.log('Plotly JSON received:', json);
        if (!json.data || json.data.length === 0) {
          toast.error('Backend returned empty plot data.');
        }
        // Utility to decode backend's binary columns
        function decodeColumn(col: any) {
          if (typeof col !== 'object' || !col.bdata || !col.dtype) return col;
          const raw = atob(col.bdata);
          let arr;
          switch (col.dtype) {
            case 'i2': // int16
              arr = new Int16Array(raw.length / 2);
              for (let i = 0; i < arr.length; i++) {
                arr[i] = (raw.charCodeAt(2*i+1) << 8) | raw.charCodeAt(2*i);
              }
              return Array.from(arr);
            case 'f8': // float64
              arr = new Float64Array(raw.length / 8);
              const dv = new DataView(new ArrayBuffer(8));
              for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < 8; j++) dv.setUint8(j, raw.charCodeAt(i*8 + j));
                arr[i] = dv.getFloat64(0, true);
              }
              return Array.from(arr);
            default:
              return col;
          }
        }
        // Transform all traces
        const decodedData = (json.data || []).map((trace: any) => ({
          ...trace,
          type: trace.type || 'scatter',
          x: decodeColumn(trace.x),
          y: decodeColumn(trace.y),
        }));
        console.log('Decoded Plotly data', decodedData);
        if (decodedData.length > 0) {
          console.log('Sample x:', decodedData[0].x?.slice?.(0, 10));
          console.log('Sample y:', decodedData[0].y?.slice?.(0, 10));
          if (decodedData[0].y && decodedData[0].y.some((v: any) => Number.isNaN(v))) {
            console.warn('Warning: decoded y contains NaN values');
          }
        }
        setDynamicPlotData(decodedData);
        setDynamicPlotLayout(json.layout || {});
        // Switch to backend tab so user sees the generated Plotly graph immediately
        setActiveTab('backend');
      } else {
        setDynamicPlotData([]);
        setDynamicPlotLayout({});
        const errText = await res.text();
        toast.error('Failed to generate dynamic plot: ' + errText);
      }
    }
    setIsLoading(false);
  };

  // Save visualization
  const handleSaveVisualization = async () => {
    setSaveStatus(null);
    const projectId = 'demo-project'; // Replace with actual project ID logic
    const meta = {
      name: plotConfig?.title || 'Untitled',
      config: config,
    };
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/api/projects/${projectId}/visualizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta),
    });
    if (res.ok) {
      setSaveStatus('Visualization saved!');
    } else {
      setSaveStatus('Failed to save visualization.');
    }
  };

  // Pre-compute data for visualization
  const combinations = plotConfig ? generateXYCombinations(plotConfig, plotConfig.yAxisColors) : [];
  const processedData = plotConfig ? processDataForLinePlot(plotConfig, csvData, combinations) : [];
  const primaryXAxis = plotConfig ? getPrimaryXAxis(plotConfig) : 'index';



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
          fileType={fileType}
          imageUrl={imageUrl}
        />

        {/* Plot Type Selector */}
        {fileType === 'csv' && (
          <div className="flex items-center gap-4">
            <label htmlFor="plotType">Plot Type:</label>
            <select id="plotType" value={plotType} onChange={handlePlotTypeChange} className="border rounded px-2 py-1">
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="scatter">Scatter</option>
              {/* Add more plot types as needed */}
            </select>
            <label htmlFor="mode">Mode:</label>
            <select id="mode" value={mode} onChange={handleModeChange} className="border rounded px-2 py-1">
              <option value="static">Static (Matplotlib)</option>
              <option value="dynamic">Dynamic (Plotly)</option>
            </select>
          </div>
        )}

        {/* Plot Configuration Form */}
        {fileType === 'csv' && csvData.length > 0 && (
          <PlotConfigPanel plotType={plotType} csvColumns={csvColumns} config={config} setConfig={setConfig} />
        )}

        {/* Chart Display with Tabs for Frontend/Backend Plots */}
        {fileType === 'csv' && plotConfig && csvData.length > 0 && (processedData.length > 0 || dynamicPlotData.length > 0 || staticImgUrl) && (          <Card>
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
                    disabled={!(dynamicPlotData.length > 0 || staticImgUrl) && !isBackendPlotLoading}
                  >
                    Backend {mode === 'dynamic' ? 'Plotly' : 'Matplotlib'}
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
                  {mode === 'dynamic' && dynamicPlotData.length > 0 ? (
                    <div style={{ width: '100%', minHeight: 400 }}>
                      {(() => {
                        try {
                          console.log('Rendering Plotly:', dynamicPlotData, dynamicPlotLayout);
                          return (
                            <Plot
                              data={dynamicPlotData}
                              layout={{ autosize: false, width: 700, height: 400, ...dynamicPlotLayout }}
                              config={{ responsive: true, displaylogo: false }}
                              style={{ width: '100%', height: 400 }}
                              onInitialized={(fig: any) => console.log('Plotly initialized:', fig)}
                              onUpdate={(fig: any) => console.log('Plotly updated:', fig)}
                            />
                          );
                        } catch (err) {
                          console.error('Plotly render error:', err);
                          return <div style={{ color: 'red' }}>Plotly failed to render: {String(err as any)}</div>;
                        }
                      })()}
                    </div>
                  ) : mode === 'static' && staticImgUrl ? (
                    <div className="flex flex-col py-4">
                      <div className="flex justify-end mb-2">
                        <a href={staticImgUrl} download="matplotlib_plot.png">
                          <Button variant="outline" size="sm">Download Static Plot (Matplotlib)</Button>
                        </a>
                      </div>
                      <div className="border rounded-lg overflow-hidden bg-gray-50 flex justify-center p-4">
                        <img src={staticImgUrl} alt="Matplotlib Preview" className="max-w-full max-h-[600px] object-contain" />
                      </div>
                      <div className="mt-4 text-center text-sm text-gray-600">
                        <p>This plot was generated server-side using Matplotlib via Flask.</p>
                        <p>It provides publication-quality rendering that might be preferred for scientific papers.</p>
                      </div>
                    </div>
                  ) : isBackendPlotLoading ? (
                    <div className="flex justify-center items-center h-96">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 border-4 border-primary border-r-transparent rounded-full animate-spin mb-4"></div>
                        <p>Generating plot with Flask backend...</p>
                      </div>
                    </div>
                  ) : null}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* DEBUG: always render plot below for visibility */}
        {mode === 'dynamic' && dynamicPlotData.length > 0 && (
          <div style={{ border: '2px dashed red', marginTop: 20 }}>
            <h4>Debug Plot (outside Tabs)</h4>
            <Plot
              data={dynamicPlotData}
              layout={{ width: 700, height: 400, ...dynamicPlotLayout }}
              config={{ responsive: true, displaylogo: false }}
              onInitialized={(fig: any) => console.log('Plotly DEBUG initialized:', fig)}
            />
          </div>
        )}

        {/* Generate Plot Button */}
        {fileType === 'csv' && (
          <div className="flex gap-4 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleGeneratePlot} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Plot'}
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSaveVisualization}>
              Save Visualization
            </button>
            {saveStatus && <span className="text-sm ml-2">{saveStatus}</span>}
          </div>
        )}

        {/* Preview Section */}
        {mode === 'static' && previewUrl && (
          <div className="mt-8">
            <img src={previewUrl} alt="Plot Preview" className="max-w-full max-h-[600px] object-contain border" />
            <a href={previewUrl} download="plot.png" className="block mt-2 text-blue-700 underline">Download PNG</a>
          </div>
        )}
        {mode === 'dynamic' && previewHtml && (
          <div className="mt-8" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        )}
      </div>
    </div>
  );
}