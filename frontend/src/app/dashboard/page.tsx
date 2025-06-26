import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">ScientiFlow Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visualize and analyze your scientific data
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample dashboard cards */}
        <DashboardCard 
          title="Data Visualization"
          description="Create interactive charts and graphs"
          icon="📊"
        />
        <DashboardCard 
          title="Reports" 
          description="Generate comprehensive scientific reports" 
          icon="📝"
        />
        <DashboardCard 
          title="Datasets" 
          description="Manage your uploaded datasets" 
          icon="🗃️"
        />
        <DashboardCard 
          title="Settings" 
          description="Configure your dashboard preferences" 
          icon="⚙️"
        />
      </main>
    </div>
  );
}

// Dashboard card component
function DashboardCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="text-4xl mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}