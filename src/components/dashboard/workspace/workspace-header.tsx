'use client';

import { Plus, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkspaceHeaderProps {
  onCreateClick: () => void;
}

export function WorkspaceHeader({ onCreateClick }: WorkspaceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-3 rounded-lg border border-primary/10 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="hidden md:flex bg-primary/10 p-2 rounded-full shadow-inner">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Bakery Workspaces
          </h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            Manage your bakery locations and switch between different store
            workspaces.
          </p>
        </div>
      </div>
      <Button
        className="gap-1 px-4 py-2 text-sm shadow-sm hover:shadow transition-all bg-primary hover:bg-primary/90"
        onClick={onCreateClick}
      >
        <Plus className="h-3.5 w-3.5" /> Create Workspace
      </Button>
    </div>
  );
}
