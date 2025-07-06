'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  Plus, 
  BarChart3, 
  FileText, 
  Settings, 
  Archive,
  MoreVertical,
  FolderOpen
} from "lucide-react";
import { Project, Visualization } from "@/types/project";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawProjectId = params.id as string;
  // Clean the project ID to remove any trailing colon and number
  const projectId = rawProjectId ? rawProjectId.split(':')[0] : '';
  
  console.log('Raw project ID from URL:', rawProjectId);
  console.log('Cleaned project ID:', projectId);
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) {
      setError('Project ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching all projects from:', `${backendUrl}/api/projects`);
      const response = await fetch(`${backendUrl}/api/projects`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch projects:', response.status, errorText);
        throw new Error(`Failed to fetch projects: ${response.status} ${errorText}`);
      }
      
      const projects = await response.json();
      console.log('Received projects:', projects);
      
      // Find the project with the matching ID
      const foundProject = projects.find((p: Project) => p.id === projectId);
      
      if (!foundProject) {
        console.error('Project not found in the list. Looking for ID:', projectId);
        console.log('Available project IDs:', projects.map((p: Project) => p.id));
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      console.log('Found project:', foundProject);
      // Fetch visualizations list for the project
      const vizRes = await fetch(`${backendUrl}/api/projects/${projectId}/visualizations`);
      let vizList: Visualization[] = [];
      if (vizRes.ok) {
        vizList = await vizRes.json();
      }
      foundProject.visualizations = vizList;
      setVisualizations(vizList);
      setProject(foundProject);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error in fetchProject:', errorMessage, err);
      setError(`Failed to load project: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'line': return '📈';
      case 'bar': return '📊';
      case 'scatter': return '🔵';
      case 'histogram': return '📊';
      case 'heatmap': return '🔥';
      case '3d': return '🎯';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested project could not be found.'}</p>
          <Link href="/dashboard/projects">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {project.description}
            </p>
            
            {/* Tags */}
            {(project.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(project.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Project Meta */}
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {new Date(project.createdDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Modified {new Date(project.lastModified).toLocaleDateString()}
              </div>
              <div>
                {(project.visualizations || []).length} visualization{(project.visualizations || []).length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visualizations */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Visualizations</CardTitle>
                  <CardDescription>
                    Charts and graphs created for this project
                  </CardDescription>
                </div>
                <Link href="/dashboard/visualizations/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Visualization
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {visualizations.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No visualizations yet</h3>
                  <p className="text-gray-500 mb-4">Create your first visualization to get started</p>
                  <Link href="/dashboard/visualizations/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Visualization
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visualizations.map((viz) => (
                    <Link key={viz.id} href={`/dashboard/projects/${projectId}/visualizations/${viz.id}`} className="block">
                      <VisualizationCard visualization={viz} projectId={projectId} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Preview */}
          {project.previewImage && (
            <Card>
              <CardHeader>
                <CardTitle>Project Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${project.previewImage})` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/projects/${projectId}/visualizations/create`} passHref legacyBehavior>
                <Button as="a" variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Visualization
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Archive className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Separator className="my-2" />
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <Archive className="h-4 w-4 mr-2" />
                Archive Project
              </Button>
            </CardContent>
          </Card>

          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Visualizations</span>
                <span className="font-medium">{visualizations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data Files</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Activity</span>
                <span className="font-medium">2 days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className={getStatusColor(project.status)} variant="secondary">
                  {project.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VisualizationCard({ visualization, projectId }: { visualization: Visualization; projectId: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            {getVisualizationIcon(visualization.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{visualization.title}</h4>
            <p className="text-sm text-gray-500 capitalize">{visualization.type} chart</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(visualization.createdDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function getVisualizationIcon(type: string): string {
  switch (type) {
    case 'line': return '📈';
    case 'bar': return '📊';
    case 'scatter': return '🔵';
    case 'histogram': return '📊';
    case 'heatmap': return '🔥';
    case '3d': return '🎯';
    default: return '📊';
  }
}