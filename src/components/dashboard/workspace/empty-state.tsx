'use client';

import { Plus, Store, CakeSlice } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/20 p-16 text-center bg-gradient-to-b from-muted/5 to-muted/20 my-12 shadow-sm">
      <div className="bg-primary/10 p-6 rounded-full shadow-inner">
        <div className="relative">
          <Store className="h-16 w-16 text-primary/80" />
          <CakeSlice className="h-6 w-6 text-primary absolute -right-1 -bottom-1" />
        </div>
      </div>
      <h3 className="mt-8 text-2xl font-semibold">No workspaces found</h3>
      <p className="mt-3 text-muted-foreground max-w-md">
        You haven't created any bakery workspaces yet. Create your first
        workspace to start managing your stores.
      </p>
      <Button
        className="mt-8 gap-2 px-8 py-6 shadow-md hover:shadow-lg bg-primary hover:bg-primary/90 transition-all text-lg"
        onClick={onCreateClick}
      >
        <Plus className="h-5 w-5" /> Create Your First Workspace
      </Button>
    </div>
  );
}
