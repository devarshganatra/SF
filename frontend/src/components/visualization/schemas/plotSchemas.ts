import * as z from 'zod';

// Base plot configuration schema that all plot types will extend
const basePlotSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  xAxisLabel: z.string().min(1, 'X-axis label is required'),
  yAxisLabel: z.string().min(1, 'Y-axis label is required'),
});

// Line plot specific schema
export const linePlotSchema = basePlotSchema.extend({
  xAxisAttributes: z.array(z.string()).min(1, 'At least one X-axis attribute is required'),
  yAxisAttributes: z.array(z.string()).min(1, 'At least one Y-axis attribute is required'),
  plotType: z.literal('line'),
});

// For future: Bar chart schema
export const barPlotSchema = basePlotSchema.extend({
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  values: z.array(z.string()).min(1, 'At least one value column is required'),
  groupBy: z.string().optional(),
  plotType: z.literal('bar'),
});

// For future: Scatter plot schema
export const scatterPlotSchema = basePlotSchema.extend({
  xAttribute: z.string().min(1, 'X attribute is required'),
  yAttribute: z.string().min(1, 'Y attribute is required'),
  sizeAttribute: z.string().optional(),
  colorAttribute: z.string().optional(),
  plotType: z.literal('scatter'),
});

// Export types from the schemas
export type LinePlotForm = z.infer<typeof linePlotSchema>;
export type BarPlotForm = z.infer<typeof barPlotSchema>;
export type ScatterPlotForm = z.infer<typeof scatterPlotSchema>;
export type PlotForm = LinePlotForm | BarPlotForm | ScatterPlotForm;