'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading chart...</div>
});

// Types for props
interface ScatterPlotProps {
  data: any[]; // Array of data objects (parsed from CSV/JSON)
  config: ScatterPlotConfig;
  className?: string;
  renderMode?: 'dynamic' | 'static';
  onDownload?: () => void;
}

// Types for config (can be imported from types/index.ts if available)
export interface ScatterPlotConfig {
  plot_type: 'scatter';
  data_file?: string;
  plot_properties: {
    x_column_names: string[];
    y_column_names: string[];
    color?: Record<string, string>;
    size?: string;
    symbol?: string;
    mode?: 'markers' | 'lines+markers';
  };
  title?: string;
  x_label?: string;
  y_label?: string;
}

function computeRegressionLine(x: number[], y: number[]) {
  const n = x.length;
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  const num = x.map((xi, i) => (xi - xMean) * (y[i] - yMean)).reduce((a, b) => a + b, 0);
  const den = x.map((xi) => (xi - xMean) ** 2).reduce((a, b) => a + b, 0);
  const slope = num / den;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, config, className, renderMode = 'dynamic', onDownload }) => {
  const [error, setError] = useState<string | null>(null);
  const [plotData, setPlotData] = useState<any[]>([]);
  const [layout, setLayout] = useState<any>({});
  const [selectedPoints, setSelectedPoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Validate and process data for Plotly
  useEffect(() => {
    try {
      if (!data || !config?.plot_properties?.x_column_names?.length || !config?.plot_properties?.y_column_names?.length) return;

      const xKey = config.plot_properties.x_column_names[0];
      const yKey = config.plot_properties.y_column_names[0];
      const x = data.map((row) => Number(row[xKey]));
      const y = data.map((row) => Number(row[yKey]));

      // Determine colors based on config
      let markerColor: string | string[] = '#174A7C';
      if (config.plot_properties.color) {
        if (typeof config.plot_properties.color === 'string') {
          markerColor = config.plot_properties.color;
        } else if (typeof config.plot_properties.color === 'object') {
          if ('category_column' in config.plot_properties.color) {
            const categoryColumn = config.plot_properties.color.category_column;
            markerColor = data.map((row) => {
              const category = row[categoryColumn];
              return config.plot_properties.color![category] || '#174A7C';
            });
          }
        }
      }

      // Main scatter points
      const scatterTrace = {
        x,
        y,
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: markerColor,
          size: 8,
          opacity: 0.85,
        },
        hoverinfo: 'x+y',
        showlegend: false,
      };

      // Regression line
      const { slope, intercept } = computeRegressionLine(x, y);
      const xMin = Math.min(...x);
      const xMax = Math.max(...x);
      const regLine = {
        x: [xMin, xMax],
        y: [slope * xMin + intercept, slope * xMax + intercept],
        mode: 'lines',
        type: 'scatter',
        line: { color: '#A23C3C', width: 2 },
        hoverinfo: 'none',
        showlegend: false,
      };

      setPlotData([scatterTrace, regLine]);
      setLayout({
        title: config.title || '',
        xaxis: {
          title: config.x_label || xKey,
          gridcolor: '#e5ecf6',
          zeroline: false,
          showline: true,
          linecolor: '#444',
          linewidth: 1,
          tickfont: { size: 14 },
          titlefont: { size: 16 },
        },
        yaxis: {
          title: config.y_label || yKey,
          gridcolor: '#e5ecf6',
          zeroline: false,
          showline: true,
          linecolor: '#444',
          linewidth: 1,
          tickfont: { size: 14 },
          titlefont: { size: 16 },
        },
        plot_bgcolor: '#fff',
        paper_bgcolor: '#fff',
        font: { family: 'Inter, Arial, sans-serif', size: 16 },
        margin: { l: 60, r: 30, t: 60, b: 60 },
        autosize: true,
        hovermode: renderMode === 'dynamic' ? 'closest' : false,
        showlegend: false,
      });
      setError(null);
    } catch (e: any) {
      setError('Error processing data: ' + e.message);
    }
  }, [data, config, renderMode]);

  // Handle selection (brush)
  const handleSelected = (event: any) => {
    if (event && event.points) {
      setSelectedPoints(event.points);
    } else {
      setSelectedPoints([]);
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      setIsLoading(true);
      try {
        await onDownload();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (renderMode === 'static') {
    return (
      <div className={`w-full h-full ${className || ''}`}>
        <div className="relative">
          <div className="bg-gray-100 p-4 rounded border">
            <p className="text-gray-600 text-center">
              Static Matplotlib version will be generated by backend
            </p>
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Download Static Image'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className || ''}`}>
      {error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
      ) : (
        <Plot
          data={plotData}
          layout={layout}
          useResizeHandler
          style={{ width: '100%', height: '100%', minHeight: 400 }}
          className="rounded shadow border bg-white"
          config={{
            responsive: true,
            displayModeBar: true,
            toImageButtonOptions: {
              format: 'png',
              filename: config.title || 'scatter-plot',
              height: 600,
              width: 900,
              scale: 2,
            },
          }}
          onSelected={handleSelected}
        />
      )}
      {/* Selected points info (optional) */}
      {selectedPoints.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          Selected {selectedPoints.length} point(s)
        </div>
      )}
    </div>
  );
};

export default ScatterPlot; 