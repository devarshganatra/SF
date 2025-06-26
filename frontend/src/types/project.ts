export interface Project {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  lastModified: string;
  status: 'active' | 'completed' | 'archived';
  tags: string[];
  previewImage?: string;
  visualizations: Visualization[];
}

export interface Visualization {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'scatter' | 'heatmap' | 'histogram' | '3d';
  createdDate: string;
  dataFile?: string;
  config: any;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  tags?: string[];
}

export interface ProjectFilters {
  status?: 'active' | 'completed' | 'archived' | 'all';
  search?: string;
  sortBy?: 'name' | 'date' | 'modified';
  sortOrder?: 'asc' | 'desc';
}