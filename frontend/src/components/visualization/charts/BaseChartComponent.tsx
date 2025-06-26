import React from 'react';
import { ProcessedRow } from '../types';

// Base props that all chart components should have
export interface BaseChartProps {
  processedData: ProcessedRow[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// This is a placeholder component that real chart components will extend
// It doesn't render anything by itself but defines the common interface
export function BaseChartComponent(_props: BaseChartProps) {
  return null; // This component is not meant to be used directly
}
