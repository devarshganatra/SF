"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import Plot from '@/components/PlotlyClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCSVData } from '@/components/visualization/hooks/useCSVData';
import { LinePlotConfig } from '@/components/visualization/types';
import { generateXYCombinations, processDataForLinePlot, getPrimaryXAxis } from '@/components/visualization/utils/plotUtils';

import { UploadSection } from '@/app/dashboard/visualizations/create/components/UploadSection';
import { LinePlotFormWrapper } from '@/app/dashboard/visualizations/create/components/FormWrapper';
import { FrontendTab } from '@/app/dashboard/visualizations/create/tabs/FrontendTab';
import { PlotConfigPanel } from '@/app/dashboard/visualizations/create/components/PlotConfigPanel';

export default function CreateVisualization() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<string>("frontend");
  const [plotConfig, setPlotConfig] = useState<LinePlotConfig | null>(null);
  const [plotType, setPlotType] = useState<string>('line');
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

  const {
    csvData,
    csvColumns,
    csvFile,
    isUploading,
    handleFileUpload,
    fileType,
    imageUrl
  } = useCSVData();

  const handlePlotTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pt = e.target.value;
    setPlotType(pt);
    setConfig({ plot_type: pt });
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as 'static' | 'dynamic');
  };

  const handleGeneratePlot = async () => {
    if (!csvFile) return;
    setIsLoading(true);
    setPreviewUrl(null);
    setPreviewHtml(null);
    const formData = new FormData();
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
        // decodeColumn utility as in original
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
        const decodedData = (json.data || []).map((trace: any) => {
          return {
            ...trace,
            x: decodeColumn(trace.x),
            y: decodeColumn(trace.y),
          };
        });
        setDynamicPlotData(decodedData);
        setDynamicPlotLayout(json.layout || {});
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

  const handleSaveVisualization = async () => {
    setSaveStatus(null);
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
      router.push(`/dashboard/projects/${projectId}`);
    } else {
      setSaveStatus('Failed to save visualization.');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6 flex items-center gap-4">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="ghost" size="sm">Back to Project</Button>
        </Link>
        <h1 className="text-2xl font-bold">Create Visualization</h1>
      </header>
      {/* ...rest of your visualization creation UI using all the same logic/state as before... */}
      {/* You can copy the full JSX from the original create/page.tsx here */}
      {/* This is a placeholder for brevity */}
      <div className="mt-6">
        <Button onClick={handleSaveVisualization} disabled={isLoading || !config}>
          Save Visualization
        </Button>
        {saveStatus && <span className="ml-4 text-sm">{saveStatus}</span>}
      </div>
    </div>
  );
}
