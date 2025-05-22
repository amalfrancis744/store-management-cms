'use client';

import { Badge } from '@/components/ui/badge';
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
import { Workspace } from '@/types';
import { Clock, Edit, Trash2, Info } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WorkspaceListProps {
  workspaces: Workspace[];
  activeWorkspace: string | null;
  onSwitchWorkspace: (id: string) => void;
  onEditWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (id: string) => void;
}

export function WorkspaceList({
  workspaces,
  activeWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
}: WorkspaceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {workspaces.map((workspace) => (
        <Card
          key={workspace.id}
          className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
            activeWorkspace === workspace.id
              ? 'ring-2 ring-green-500 border-green-200  bg-green-50/30 shadow-sm shadow-green-100 '
              : 'hover:translate-y-[-2px]'
          }`}
        >
          <div className="aspect-video w-full overflow-hidden bg-muted/20">
            <Image
              src={
                workspace.images && workspace.images.length > 0
                  ? workspace.images[0].startsWith('http')
                    ? workspace.images[0]
                    : `/api/placeholder/400/150`
                  : `/api/placeholder/400/150`
              }
              width={1200}
              height={100}
              alt={workspace.name}
              className="h-full w-full object-cover transition-all hover:scale-103 duration-300"
            />
          </div>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                {workspace.name}
              </CardTitle>
              {activeWorkspace === workspace.id && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 font-medium text-xs px-2 py-0.5"
                >
                  Active
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1 text-xs line-clamp-2">
              {workspace.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 p-1.5 rounded">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              <span>
                {workspace.openingTime} - {workspace.closingTime}
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between py-3 px-4 border-t bg-muted/5">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs transition-all hover:bg-blue-600 hover:text-white flex gap-1 items-center"
                >
                  <Info className="h-3.5 w-3.5" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{workspace.name}</DialogTitle>
                  <DialogDescription>Workspace Details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {workspace.images && workspace.images.length > 0 && (
                    <div className="overflow-hidden rounded-md">
                      <Image
                        src={
                          workspace.images[0].startsWith('http')
                            ? workspace.images[0]
                            : `/api/placeholder/600/300`
                        }
                        width={100}
                        height={100}
                        alt={workspace.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {workspace.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Opening Hours</h4>
                      <p className="text-sm text-muted-foreground">
                        {workspace.openingTime} - {workspace.closingTime}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Status</h4>
                      <div className="flex items-center gap-2">
                        {activeWorkspace === workspace.id ? (
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Add any additional workspace details you want to show here */}
                </div>
                {/* <div className="flex justify-end">
                  {activeWorkspace !== workspace.id && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onSwitchWorkspace(workspace.id)}
                      className="mr-2"
                    >
                      Switch to this Workspace
                    </Button>
                  )}
                </div> */}
              </DialogContent>
            </Dialog>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                onClick={() => onEditWorkspace(workspace)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-xs">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base">
                      Delete Workspace
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                      Are you sure you want to delete {workspace.name}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="text-xs h-8">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteWorkspace(workspace.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
