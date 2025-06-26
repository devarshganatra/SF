import React from 'react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Visualizations() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Visualizations</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage your scientific data visualizations
            </p>
          </div>
          <Link href="/dashboard/visualizations/create">
            <Button>New Visualization</Button>
          </Link>
        </div>
      </header>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search visualizations..."
            className="flex-1"
          />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="line">Line Charts</SelectItem>
              <SelectItem value="bar">Bar Charts</SelectItem>
              <SelectItem value="scatter">Scatter Plots</SelectItem>
              <SelectItem value="heatmap">Heatmaps</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample visualizations */}
        {sampleVisualizations.map((viz) => (
          <VisualizationCard key={viz.id} visualization={viz} />
        ))}
      </main>
    </div>
  );
}

// Visualization card component
function VisualizationCard({ visualization }: { visualization: Visualization }) {
  return (
    <Card>
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden">
        <div 
          className="w-full h-full"
          style={{ 
            backgroundImage: `url(${visualization.previewUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>
      <CardHeader>
        <CardTitle>{visualization.title}</CardTitle>
        <CardDescription>{visualization.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {visualization.type} • {visualization.date}
        </span>
        <Button variant="link" asChild>
          <Link href={`/dashboard/visualizations/${visualization.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Sample data
type Visualization = {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  previewUrl: string;
};

const sampleVisualizations: Visualization[] = [
  {
    id: '1',
    title: 'Temperature Distribution Analysis',
    description: 'Global temperature changes across different regions over time',
    type: 'Line Chart',
    date: 'May 21, 2025',
    previewUrl: 'https://placehold.co/600x400/e2e8f0/cccccc?text=Temperature+Chart'
  },
  {
    id: '2',
    title: 'Particle Size Distribution',
    description: 'Analysis of particle sizes in sample materials',
    type: 'Histogram',
    date: 'May 19, 2025',
    previewUrl: 'https://placehold.co/600x400/e2e8f0/cccccc?text=Histogram'
  },
  {
    id: '3',
    title: 'Reaction Rate Comparison',
    description: 'Comparing reaction rates under different catalyst conditions',
    type: 'Bar Chart',
    date: 'May 17, 2025',
    previewUrl: 'https://placehold.co/600x400/e2e8f0/cccccc?text=Bar+Chart'
  },
  {
    id: '4',
    title: 'Gene Expression Heatmap',
    description: 'Expression levels of selected genes across different tissue samples',
    type: 'Heatmap',
    date: 'May 15, 2025',
    previewUrl: 'https://placehold.co/600x400/e2e8f0/cccccc?text=Heatmap'
  },
  {
    id: '5',
    title: 'Neural Network Performance',
    description: 'Performance metrics of different neural network architectures',
    type: 'Scatter Plot',
    date: 'May 12, 2025',
    previewUrl: 'https://placehold.co/600x400/e2e8f0/cccccc?text=Scatter+Plot'
  },
  {
    id: '6',
    title: 'Protein Folding Simulation',
    description: 'Visualization of protein folding under different temperature conditions',
    type: 'Interactive 3D',
    date: 'May 10, 2025',
    previewUrl: 'https://placehold.co/600x400/e2e8f0/cccccc?text=3D+Visualization'
  }
];