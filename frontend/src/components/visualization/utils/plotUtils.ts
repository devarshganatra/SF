import { XYCombination, CSVData, ProcessedRow, LinePlotConfig } from '../types';
import { getColor } from './colorPalette';

// Generate all X-Y combinations with colors and labels for line charts
export function generateXYCombinations(config: LinePlotConfig, yAxisColors?: { [key: string]: string }): XYCombination[] {
  const { xAxisAttributes, yAxisAttributes } = config;
  const combinations: XYCombination[] = [];
  
  let colorIndex = 0;
  
  xAxisAttributes.forEach(xAttr => {
    yAxisAttributes.forEach(yAttr => {
      const lineKey = `${xAttr}_vs_${yAttr}`;
      const lineName = `${yAttr} vs ${xAttr}`;
      const color = yAxisColors && yAxisColors[yAttr] ? yAxisColors[yAttr] : getColor(colorIndex);
      
      combinations.push({
        xAttr,
        yAttr,
        lineKey,
        lineName,
        color
      });
      
      colorIndex++;
    });
  });

  return combinations;
}

// Process data for all X-Y combinations in line charts
export function processDataForLinePlot(
  config: LinePlotConfig, 
  csvData: CSVData[], 
  combinations: XYCombination[]
): ProcessedRow[] {
  if (csvData.length === 0) return [];
  
  return csvData.map((row, index) => {
    const processedRow: ProcessedRow = {
      index // Add an index for consistent ordering
    };
    
    // Add all X attributes as potential axis values
    config.xAxisAttributes.forEach(xAttr => {
      processedRow[xAttr] = Number(row[xAttr]) || row[xAttr];
    });
    
    // Add all Y values for each X-Y combination
    combinations.forEach(combo => {
      processedRow[combo.lineKey] = Number(row[combo.yAttr]) || 0;
    });
    
    return processedRow;
  });
}

// Determine primary X-axis for chart display
export function getPrimaryXAxis(config: LinePlotConfig): string {
  if (config.xAxisAttributes.length === 0) return 'index';
  
  // Use the first X attribute as primary axis, or index if multiple X attributes
  if (config.xAxisAttributes.length === 1) {
    return config.xAxisAttributes[0];
  }
  
  // For multiple X attributes, we'll use index and show a note
  return 'index';
}

// Export chart as PNG
export function exportChartAsPNG(chartRef: React.RefObject<HTMLDivElement>, fileName: string): void {
  if (!chartRef.current) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const svgElement = chartRef.current.querySelector('svg');
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();

    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// Download backend plot
export function downloadBackendPlot(backendPlotUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = backendPlotUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}