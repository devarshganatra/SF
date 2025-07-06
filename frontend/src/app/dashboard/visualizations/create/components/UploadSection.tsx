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
  fileType: 'csv' | 'image' | null;
  imageUrl: string | null;
}

export function UploadSection({ 
  handleFileUpload, 
  isUploading, 
  csvData, 
  csvColumns,
  fileInputRef,
  fileType,
  imageUrl
}: UploadSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Dataset</CardTitle>
        <CardDescription>Select a CSV or image file</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file">CSV or Image File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              ref={fileInputRef}
              className="mt-1"
            />
          </div>
          {isUploading && <p className="text-sm text-muted-foreground">Uploading and parsing file...</p>}
          {fileType === 'csv' && csvData.length > 0 && (
            <p className="text-sm text-green-600">
              ✓ Successfully loaded {csvData.length} rows with columns: {csvColumns.join(', ')}
            </p>
          )}
          {fileType === 'image' && imageUrl && (
            <div className="flex flex-col items-start gap-2">
              <span className="text-sm text-green-600">✓ Image uploaded</span>
              <img src={imageUrl} alt="Uploaded preview" className="max-w-xs max-h-48 border rounded" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}