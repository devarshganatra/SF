export interface CSVData {
  [key: string]: string | number;
}

export interface ProcessedRow {
  [key: string]: string | number;
}

export interface XYCombination {
  xAttr: string;
  yAttr: string;
  lineKey: string;
  lineName: string;
  color: string;
}

// Base plot configuration that all plot types will extend
export interface BasePlotConfig {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

// Line plot specific configuration
export interface LinePlotConfig extends BasePlotConfig {
  xAxisAttributes: string[];
  yAxisAttributes: string[];
  yAxisColors?: { [key: string]: string };
  plotType: 'line';
}

// For future: Bar chart configuration
export interface BarPlotConfig extends BasePlotConfig {
  categories: string[];
  values: string[];
  groupBy?: string;
  plotType: 'bar';
}

// For future: Scatter plot configuration
export interface ScatterPlotConfig extends BasePlotConfig {
  xAttribute: string;
  yAttribute: string;
  sizeAttribute?: string;
  colorAttribute?: string;
  plotType: 'scatter';
}

// Union type for all plot configurations
export type PlotConfig = LinePlotConfig | BarPlotConfig | ScatterPlotConfig;

// Type guard to check if a plot config is a line plot config
export function isLinePlotConfig(config: PlotConfig): config is LinePlotConfig {
  return config.plotType === 'line';
}