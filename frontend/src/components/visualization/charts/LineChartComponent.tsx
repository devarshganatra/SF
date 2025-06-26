import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { XYCombination } from '../types';
import { BaseChartProps } from './BaseChartComponent';

interface LineChartComponentProps extends BaseChartProps {
  primaryXAxis: string;
  combinations: XYCombination[];
  showMultipleXAxisNote?: boolean;
  hasMultipleXAxisAttributes?: boolean;
}

export function LineChartComponent({
  processedData,
  primaryXAxis,
  combinations,
  title = 'Chart',
  xAxisLabel = 'X Axis',
  yAxisLabel = 'Y Axis',
  showMultipleXAxisNote = false,
  hasMultipleXAxisAttributes = false,
}: LineChartComponentProps) {
  return (
    <div className="w-full">
      {/* Title Section */}
      {title && (
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
      )}
      
      {/* Chart Info for Multiple X-axis */}
      {showMultipleXAxisNote && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Multiple X-axis attributes selected. Chart uses row index as X-axis. 
            Each line represents a different X-Y combination.
          </p>
        </div>
      )}

      {/* Chart Container */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={processedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={primaryXAxis}
              label={{ 
                value: hasMultipleXAxisAttributes ? 'Row Index' : xAxisLabel, 
                position: 'insideBottom', 
                offset: -10 
              }}
            />
            <YAxis 
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip 
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => 
                hasMultipleXAxisAttributes
                  ? `Row: ${label}`
                  : `${xAxisLabel}: ${label}`
              }
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ paddingTop: '30px' }} 
            />
            {combinations.map(combo => (
              <Line
                key={combo.lineKey}
                type="monotone"
                dataKey={combo.lineKey}
                stroke={combo.color}
                strokeWidth={2}
                dot={false}
                name={combo.lineName}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
