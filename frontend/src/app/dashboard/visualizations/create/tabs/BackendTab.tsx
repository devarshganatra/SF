import React from 'react';
import { Button } from "@/components/ui/button";
import { LinePlotConfig } from '@/components/visualization/types';
import { downloadBackendPlot } from '@/components/visualization/utils/plotUtils';

interface BackendTabProps {
  config: LinePlotConfig | null;
  backendPlotUrl: string | null;
  isLoading: boolean;
  onGenerateBackendPlot: () => void;
}

export function BackendTab({ 
  config, 
  backendPlotUrl, 
  isLoading, 
  onGenerateBackendPlot 
}: BackendTabProps) {
  const handleDownload = () => {
    if (backendPlotUrl && config) {
      downloadBackendPlot(backendPlotUrl, `${config.title || 'backend_plot'}.png`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-primary border-r-transparent rounded-full animate-spin mb-4"></div>
          <p>Generating plot with Flask backend...</p>
        </div>
      </div>
    );
  }

  if (backendPlotUrl) {
    return (
      <div className="flex flex-col py-4">
        <div className="flex justify-end mb-2">
          <Button onClick={handleDownload} variant="outline" size="sm">
            Download Matplotlib Plot
          </Button>
        </div>
        
        <div className="border rounded-lg overflow-hidden bg-gray-50 flex justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={backendPlotUrl} 
            alt="Backend generated plot" 
            className="max-w-full max-h-[600px] object-contain"
          />
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>This plot was generated server-side using Matplotlib via Flask.</p>
          <p>It provides publication-quality rendering that might be preferred for scientific papers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-96 bg-gray-50 border border-dashed border-gray-300 rounded-md">
      <div className="text-center">
        <p className="text-gray-500 mb-2">Backend plot not generated yet</p>
        <Button onClick={onGenerateBackendPlot} variant="secondary">
          Generate Matplotlib Plot
        </Button>
      </div>
    </div>
  );
}