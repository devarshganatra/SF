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
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError('Failed to load project');
      console.error('Error fetching project:', err);
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
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
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
                {project.visualizations.length} visualization{project.visualizations.length !== 1 ? 's' : ''}
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
              {project.visualizations.length === 0 ? (
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
                  {project.visualizations.map((viz) => (
                    <VisualizationCard key={viz.id} visualization={viz} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest changes and updates to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem 
                  action="Created visualization"
                  item="pH Distribution Analysis"
                  date="2025-01-19"
                  icon="📊"
                />
                <ActivityItem 
                  action="Updated visualization"
                  item="Temperature vs Stability"
                  date="2025-01-18"
                  icon="📈"
                />
                <ActivityItem 
                  action="Added visualization"
                  item="Protein Structure Comparison"
                  date="2025-01-16"
                  icon="📊"
                />
                <ActivityItem 
                  action="Created project"
                  item="Protein Analysis Study"
                  date="2025-01-15"
                  icon="📁"
                />
              </div>
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
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add Visualization
              </Button>
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
                <span className="font-medium">{project.visualizations.length}</span>
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

function VisualizationCard({ visualization }: { visualization: Visualization }) {
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
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ action, item, date, icon }: { 
  action: string; 
  item: string; 
  date: string; 
  icon: string; 
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-lg">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{action}</span> "{item}"
        </p>
        <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</p>
      </div>
    </div>
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