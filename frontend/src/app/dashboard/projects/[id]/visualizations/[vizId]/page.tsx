"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Plot from "@/components/PlotlyClient";

interface VizResponse {
  id: string;
  name: string;
  config: any;
  createdDate: string;
}

export default function VisualizationDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const vizId = params.vizId as string;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const [viz, setViz] = useState<VizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViz = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/projects/${projectId}/visualizations/${vizId}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setViz(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchViz();
  }, [projectId, vizId]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error || !viz) return <p className="p-8 text-red-600">{error || "Visualization not found"}</p>;

  // If the stored config already follows plotly format
  if (viz.config?.data && viz.config?.layout) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>{viz.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Plot data={viz.config.data} layout={{ width: 700, height: 400, ...viz.config.layout }} config={{ responsive: true }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback: show raw JSON
  return (
    <div className="p-8">
      <pre className="bg-gray-100 p-4 overflow-auto text-xs rounded-md">
        {JSON.stringify(viz.config, null, 2)}
      </pre>
    </div>
  );
}
