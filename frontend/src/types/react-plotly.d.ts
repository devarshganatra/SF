declare module 'react-plotly.js' {
  import { Component } from 'react';
  
  interface PlotProps {
    data: any[];
    layout?: any;
    config?: any;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onSelected?: (event: any) => void;
    [key: string]: any;
  }
  
  class Plot extends Component<PlotProps> {}
  
  export default Plot;
} 