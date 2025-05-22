'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { WorkspaceHeader } from './workspace/workspace-header';
import { WorkspaceList } from './workspace/workspace-list';
import { WorkspaceForm } from './workspace/workspace-form';
import { EmptyState } from './workspace/empty-state';
import { type Workspace, workspaceSchema } from './workspace/types';
import {
  fetchWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  setActiveWorkspace,
} from '@/store/slices/admin/workspaceSlice';
import { AppDispatch, RootState } from '@/store/index';

export function WorkSpacePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Get workspace state from Redux store
  const { workspaces, activeWorkspace, isLoading, error } = useSelector(
    (state: RootState) => state.workspace
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
    null
  );

  // Create a form with the correct type
  const form = useForm<Workspace>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      images: [],
      openingTime: '09:00',
      closingTime: '17:00',
    },
  });

  // Fetch workspaces when component mounts
  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  // Show error toast if there's an error from Redux
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleCreateWorkspace = (data: Omit<Workspace, 'id'>) => {
    console.log('Creating workspace with data:', data);
    // Dispatch the createWorkspace action with form data
    dispatch(createWorkspace(data))
      .unwrap() // Unwrap the Promise from the async thunk
      .then(() => {
        setIsCreateOpen(false);
        form.reset();
        toast({
          title: 'Workspace Created',
          description: `${data.name} has been created successfully.`,
        });
      })
      .catch((errorMsg) => {
        toast({
          title: 'Error Creating Workspace',
          description: errorMsg,
          variant: 'destructive',
        });
      });
  };

  const handleEditWorkspace = (data: Workspace) => {
    console.log('Editing workspace data:', data);
    if (!editingWorkspace?.id) {
      console.error('No editing workspace ID found');
      return;
    }

    // Include the ID from the editing workspace
    const workspaceToUpdate = {
      id: editingWorkspace.id,
      ...data,
    };

    console.log('Dispatching update with:', workspaceToUpdate);

    // Dispatch the updateWorkspace action with updated data
    dispatch(updateWorkspace(workspaceToUpdate))
      .unwrap()
      .then((result) => {
        console.log('Update successful:', result);
        setEditingWorkspace(null);
        form.reset();
        toast({
          title: 'Workspace Updated',
          description: `${data.name} has been updated successfully.`,
        });
      })
      .catch((errorMsg) => {
        console.error('Update failed:', errorMsg);
        toast({
          title: 'Error Updating Workspace',
          description: errorMsg,
          variant: 'destructive',
        });
      });
  };

  const handleDeleteWorkspace = (id: string) => {
    // Dispatch the deleteWorkspace action
    dispatch(deleteWorkspace(id))
      .unwrap()
      .then(() => {
        toast({
          title: 'Workspace Deleted',
          description: 'The workspace has been deleted successfully.',
          variant: 'destructive',
        });
      })
      .catch((errorMsg) => {
        toast({
          title: 'Error Deleting Workspace',
          description: errorMsg,
          variant: 'destructive',
        });
      });
  };

  const handleSwitchWorkspace = (id: string) => {
    // Dispatch the setActiveWorkspace action to update active workspace
    dispatch(setActiveWorkspace(id));

    const workspace = workspaces.find((w) => w.id === id);

    toast({
      title: 'Workspace Switched',
      description: `You are now working in ${workspace?.name}.`,
    });
  };

  const openEditDialog = (workspace: Workspace) => {
    console.log('Opening edit dialog for workspace:', workspace);
    setEditingWorkspace(workspace);
    // Reset form with the workspace data
    form.reset({
      name: workspace.name,
      description: workspace.description,
      images: workspace.images || [],
      openingTime: workspace.openingTime,
      closingTime: workspace.closingTime,
    });
  };

  const closeDialog = () => {
    setIsCreateOpen(false);
    setEditingWorkspace(null);
    form.reset();
  };

  return (
    <div className="space-y-6  max-w-screen overflow-y-auto mx-auto">
      <WorkspaceHeader onCreateClick={() => setIsCreateOpen(true)} />

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-10">Loading workspaces...</div>
      )}

      {/* Create Workspace Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) form.reset();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Set up a new bakery workspace.
            </DialogDescription>
          </DialogHeader>
          <WorkspaceForm
            form={form}
            onSubmit={handleCreateWorkspace}
            onCancel={closeDialog}
            submitLabel="Create Workspace"
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Workspace Dialog */}
      <Dialog
        open={!!editingWorkspace}
        onOpenChange={(open) => {
          if (!open) {
            setEditingWorkspace(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update your bakery workspace details.
            </DialogDescription>
          </DialogHeader>
          <WorkspaceForm
            form={form}
            onSubmit={handleEditWorkspace}
            onCancel={closeDialog}
            submitLabel="Save Changes"
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Show workspace list or empty state based on data */}
      {!isLoading && workspaces.length > 0 ? (
        <WorkspaceList
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onSwitchWorkspace={handleSwitchWorkspace}
          onEditWorkspace={openEditDialog}
          onDeleteWorkspace={handleDeleteWorkspace}
        />
      ) : !isLoading && workspaces.length === 0 ? (
        <EmptyState onCreateClick={() => setIsCreateOpen(true)} />
      ) : null}
    </div>
  );
}
