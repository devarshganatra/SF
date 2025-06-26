import { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { CSVData } from '../types';

export function useCSVData() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Invalid file type. Please upload a CSV file.");
      return;
    }

    setIsUploading(true);
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error("Error parsing CSV file.");
          setIsUploading(false);
          return;
        }

        const data = results.data as CSVData[];
        const columns = Object.keys(data[0] || {});
        
        setCsvData(data);
        setCsvColumns(columns);
        setIsUploading(false);
        toast.success(`CSV uploaded successfully! Loaded ${data.length} rows with ${columns.length} columns.`);
      },
      error: () => {
        toast.error("Failed to upload the CSV file.");
        setIsUploading(false);
      }
    });
  };

  const resetCSVData = () => {
    setCsvData([]);
    setCsvColumns([]);
    setCsvFile(null);
  };

  return {
    csvData,
    csvColumns,
    csvFile,
    isUploading,
    handleFileUpload,
    resetCSVData
  };
}