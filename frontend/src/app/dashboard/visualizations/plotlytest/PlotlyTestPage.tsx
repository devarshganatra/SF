"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function PlotlyTestPage() {
  const [plotData, setPlotData] = useState<any[]>([]);
  const [plotLayout, setPlotLayout] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
    setPlotData([]);
    setPlotLayout({});
    setError("");
  };

  const handleFetchPlot = async () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }
    setLoading(true);
    setError("");
    const config = {
      plot_type: "scatter",
      x_column_names: ["serial"],
      y_column_names: ["tempmax", "feelslikemax"],
      plot_properties: { color: {} },
    };
    const formData = new FormData();
    formData.append("mode", "dynamic-json");
    formData.append("config", JSON.stringify(config));
    formData.append("file", file);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${backendUrl}/api/plot`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPlotData(data.data);
        setPlotLayout(data.layout);
      } else {
        const err = await res.text();
        setError("Failed to fetch plot JSON: " + err);
      }
    } catch (e: any) {
      setError("Request failed: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Plotly React Test (Safe)</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />
      <Button onClick={handleFetchPlot} disabled={loading || !file}>
        {loading ? "Loading..." : "Fetch Plotly Plot (JSON)"}
      </Button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <div className="mt-8">
        {plotData.length > 0 && <Plot data={plotData} layout={plotLayout} />}
      </div>
    </div>
  );
}
