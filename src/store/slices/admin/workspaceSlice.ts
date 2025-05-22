import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceAPI } from '@/api/admin/workspace-api';
import { Workspace } from '@/types';
import { CurrentWorkspace } from '@/types';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: string | null;
  currentWorkspace: CurrentWorkspace | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  error: null,
  currentWorkspace: null,
};

export const fetchWorkspaces = createAsyncThunk(
  'workspaces/admin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workspaceAPI.getWorkspaces();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch workspaces'
      );
    }
  }
);

export const fetchWorkspaceById = createAsyncThunk(
  'workspace/fetchById',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await workspaceAPI.getWorkspaceById(workspaceId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch workspace'
      );
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/create',
  async (workspaceData: Omit<Workspace, 'id'>, { rejectWithValue }) => {
    try {
      const response = await workspaceAPI.createWorkspace(workspaceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create workspace'
      );
    }
  }
);

// In workspaceSlice.ts
export const updateWorkspace = createAsyncThunk(
  'workspace/update',
  async (workspace: Workspace, { rejectWithValue }) => {
    try {
      const { id, ...workspaceData } = workspace;

      if (!id) {
        return rejectWithValue('Workspace ID is required');
      }

      const response = await workspaceAPI.updateWorkspace(id, workspaceData);
      console.log('Update responseddddd amalaaaaaaa:', response.data);

      // Return both the updated workspace and the full response
      return {
        ...response.data, // or response.data if the structure is different
        id, // Ensure ID is included
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update workspace'
      );
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/delete',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      await workspaceAPI.deleteWorkspace(workspaceId);
      return workspaceId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete workspace'
      );
    }
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = action.payload;
    },
    clearWorkspaceErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch workspaces
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workspaces = action.payload.workspaces;
      if (state.workspaces.length > 0 && !state.activeWorkspace) {
        state.activeWorkspace = state.workspaces[0].id;
      }
    });
    builder.addCase(fetchWorkspaces.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch workspace by ID
    builder.addCase(fetchWorkspaceById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkspaceById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentWorkspace = action.payload.workspace;
    });
    builder.addCase(fetchWorkspaceById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create workspace
    builder.addCase(createWorkspace.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createWorkspace.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workspaces.push(action.payload.workspace);
      if (!state.activeWorkspace) {
        state.activeWorkspace = action.payload.workspace.id;
      }
    });
    builder.addCase(createWorkspace.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update workspace
    builder
      .addCase(updateWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.isLoading = false;
        // Make sure action.payload has the expected format
        if (action.payload && action.payload.id) {
          const index = state.workspaces.findIndex(
            (w) => w.id === action.payload.id
          );
          if (index !== -1) {
            state.workspaces[index] = action.payload;
          }
        }
      })
      .addCase(updateWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete workspace
    builder.addCase(deleteWorkspace.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteWorkspace.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workspaces = state.workspaces.filter(
        (workspace) => workspace.id !== action.payload
      );

      // Update active workspace if deleted
      if (state.activeWorkspace === action.payload) {
        state.activeWorkspace =
          state.workspaces.length > 0 ? state.workspaces[0].id : null;
      }
    });
    builder.addCase(deleteWorkspace.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setActiveWorkspace, clearWorkspaceErrors } =
  workspaceSlice.actions;
export default workspaceSlice.reducer;
