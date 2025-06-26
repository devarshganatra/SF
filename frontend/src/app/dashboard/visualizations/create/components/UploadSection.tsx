import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UploadSectionProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  csvData: any[];
  csvColumns: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function UploadSection({ 
  handleFileUpload, 
  isUploading, 
  csvData, 
  csvColumns,
  fileInputRef 
}: UploadSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Dataset</CardTitle>
        <CardDescription>Select a CSV file to visualize your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              ref={fileInputRef}
              className="mt-1"
            />
          </div>
          {isUploading && <p className="text-sm text-muted-foreground">Uploading and parsing CSV...</p>}
          {csvData.length > 0 && (
            <p className="text-sm text-green-600">
              ✓ Successfully loaded {csvData.length} rows with columns: {csvColumns.join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}