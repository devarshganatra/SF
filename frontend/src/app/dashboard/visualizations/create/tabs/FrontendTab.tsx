import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { LinePlotConfig, XYCombination, ProcessedRow } from '@/components/visualization/types';
import { exportChartAsPNG } from '@/components/visualization/utils/plotUtils';
import { LineChartComponent } from '@/components/visualization/charts';

interface FrontendTabProps {
  config: LinePlotConfig;
  processedData: ProcessedRow[];
  primaryXAxis: string;
  combinations: XYCombination[];
}

export function FrontendTab({ config, processedData, primaryXAxis, combinations }: FrontendTabProps) {
  const chartRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const handleExport = () => {
    exportChartAsPNG(chartRef, `${config.title || 'chart'}.png`);
  };

  return (
    <div className="py-4">
      <div className="flex justify-end mb-2">
        <Button onClick={handleExport} variant="outline" size="sm">
          Export as PNG
        </Button>
      </div>
      
      <div ref={chartRef}>
        <LineChartComponent
          processedData={processedData}
          primaryXAxis={primaryXAxis}
          combinations={combinations}
          title={config.title || 'Chart'}
          xAxisLabel={config.xAxisLabel}
          yAxisLabel={config.yAxisLabel}
          hasMultipleXAxisAttributes={config.xAxisAttributes.length > 1}
          showMultipleXAxisNote={config.xAxisAttributes.length > 1}
        />
      </div>

      {/* Combination Summary */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm font-medium mb-2">Line Combinations ({combinations.length} total):</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {combinations.map(combo => (
            <div key={combo.lineKey} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: combo.color }}
              ></div>
              <span>{combo.lineName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}