import { useState } from 'react';
import { toast } from 'sonner';
import { LinePlotConfig } from '../types';

export function useBackendPlot() {
  const [backendPlotUrl, setBackendPlotUrl] = useState<string | null>(null);
  const [isBackendPlotLoading, setIsBackendPlotLoading] = useState(false);

  const generateBackendPlot = async (config: LinePlotConfig, csvFile: File | null) => {
    if (!csvFile) {
      toast.error("No CSV file available for backend plotting.");
      return;
    }

    setIsBackendPlotLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("title", config.title);
      formData.append("xlabel", config.xAxisLabel);
      formData.append("ylabel", config.yAxisLabel);
      
      const backendUrl = process.env.BACKEND_URL;
      const response = await fetch(`${backendUrl}/rmsd-plot`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend plotting failed: ${errorText}`);
      }

      // Create a URL for the blob response
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBackendPlotUrl(url);
      return true;
    } catch (error) {
      toast.error(`Failed to generate backend plot: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Backend plotting error:", error);
      return false;
    } finally {
      setIsBackendPlotLoading(false);
    }
  };

  const resetBackendPlot = () => {
    if (backendPlotUrl) {
      URL.revokeObjectURL(backendPlotUrl);
    }
    setBackendPlotUrl(null);
  };

  return {
    backendPlotUrl,
    isBackendPlotLoading,
    generateBackendPlot,
    resetBackendPlot
  };
}