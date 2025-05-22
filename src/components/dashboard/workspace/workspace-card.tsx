'use client';

import { Edit, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Workspace } from './types';

interface WorkspaceCardProps {
  workspace: Workspace;
  isActive: boolean;
  onSwitch: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkspaceCard({
  workspace,
  isActive,
  onSwitch,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isActive
          ? 'ring-2 ring-primary shadow-md shadow-primary/20'
          : 'hover:translate-y-[-4px]'
      }`}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted/30">
        <Image
          src={workspace.images?.[0] || '/placeholder.svg?height=200&width=300'}
          alt={workspace.name}
          // width={100}
          //     height={100}
          fill
          className="h-full w-full object-cover transition-all hover:scale-105 duration-500"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {workspace.name}
          </CardTitle>
          {isActive && (
            <Badge
              variant="outline"
              className="bg-primary/15 text-primary font-medium px-3 py-1"
            >
              Active
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2 line-clamp-2">
          {workspace.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
          <Clock className="h-4 w-4 text-primary/70" />
          <span>
            {workspace.openingTime} - {workspace.closingTime}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-4 px-6 border-t bg-muted/10">
        {!isActive ? (
          <Button
            variant="secondary"
            onClick={onSwitch}
            className="transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Switch to Workspace
          </Button>
        ) : (
          <Button variant="outline" disabled className="opacity-70">
            Current Workspace
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onEdit}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{workspace.name}"? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
