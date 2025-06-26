"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Plus, FolderOpen } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-6">
        <div className="mb-8">
          <h2 className="font-bold text-xl">ScientiFlow</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Project Management</p>
        </div>
        
        <Separator className="my-4" />
        
        <nav>
          <ul className="space-y-2">
            <NavItem href="/dashboard" label="Dashboard" />
            {/* Projects Modal Trigger */}
            <li>
              <Dialog.Root open={isProjectsModalOpen} onOpenChange={setIsProjectsModalOpen}>
                <Dialog.Trigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Projects
                    </span>
                  </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg">
                    <Dialog.Title className="text-lg font-semibold mb-4">Projects</Dialog.Title>
                    <div className="flex flex-col gap-4">
                      <Button variant="outline" asChild onClick={() => setIsProjectsModalOpen(false)}>
                        <Link href="/dashboard/projects/create">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Project
                        </Link>
                      </Button>
                      <Button variant="outline" asChild onClick={() => setIsProjectsModalOpen(false)}>
                        <Link href="/dashboard/projects">
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open Existing Project
                        </Link>
                      </Button>
                    </div>
                    <Dialog.Close asChild>
                      <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </li>
            <NavItem href="/dashboard/visualizations" label="Visualizations" />
            <NavItem href="/dashboard/datasets" label="Datasets" />
            <NavItem href="/dashboard/reports" label="Reports" />
            <NavItem href="/dashboard/settings" label="Settings" />
            <Separator className="my-4" />
            <NavItem href="/" label="Home" />
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 bg-white dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Button variant="ghost" className="w-full justify-start" asChild>
        <Link href={href}>{label}</Link>
      </Button>
    </li>
  );
}