// store/slices/staffSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axios-config';

// Interfaces
interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;
  termsAccepted: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  isAvailable: boolean;
  profileImageUrl?: string | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  locationId?: string | null;
  isDeleted: boolean;
  assignedOrders: Order[];
  password: string;
  role?: string;
}

interface Order {
  id: string;
  userId: string;
  shippingAddressId: string;
  billingAddressId: string;
  workspaceId: number;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  status: string;
  notes?: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  stripeSessionId?: string | null;
  paidAt?: string | null;
  assignedTo?: string | null;
}

interface InviteStaffPayload {
  workspaceId: string;
  email: string;
  role: string;
}

interface UpdateStaffPayload {
  targetUserId: string;
  workspaceId: string;
  data: Partial<StaffMember>;
}

interface DeleteStaffPayload {
  id: string;
  workspaceId: string;
}

interface StaffState {
  staff: StaffMember[];
  loading: boolean;
  error: string | null;
  inviteLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

const initialState: StaffState = {
  staff: [],
  loading: false,
  error: null,
  inviteLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

// Async Thunks
export const fetchStaff = createAsyncThunk(
  'staff/fetchStaff',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      console.log('Fetching staff members for workspace ID:', workspaceId);
      const response = await axiosInstance.get(
        `/orders/workspaces/${workspaceId}/staff`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch staff members'
      );
    }
  }
);

export const inviteStaff = createAsyncThunk(
  'staff/inviteStaff',
  async (payload: InviteStaffPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/workspaces/${payload.workspaceId}/invite`,
        {
          email: payload.email,
          role: payload.role,
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to invite staff member'
      );
    }
  }
);

export const updateStaff = createAsyncThunk(
  'staff/updateStaff',
  async (payload: UpdateStaffPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/auth/${payload.workspaceId}/user/${payload.targetUserId}`,
        payload.data
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update staff member'
      );
    }
  }
);

export const deleteStaff = createAsyncThunk(
  'staff/deleteStaff',
  async (
    payload: DeleteStaffPayload & { email: string },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.delete(
        `/workspaces/${payload.workspaceId}/removeUser`,
        { data: { email: payload.email } } // Note the 'data' property here
      );
      return payload.id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete staff member'
      );
    }
  }
);

// Staff Slice
const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStaff: (state) => {
      state.staff = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchStaff.fulfilled,
        (state, action: PayloadAction<StaffMember[]>) => {
          state.loading = false;
          state.staff = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Invite Staff
      .addCase(inviteStaff.pending, (state) => {
        state.inviteLoading = true;
        state.error = null;
      })
      .addCase(
        inviteStaff.fulfilled,
        (state, action: PayloadAction<StaffMember>) => {
          state.inviteLoading = false;
          state.staff.push(action.payload);
          state.error = null;
        }
      )
      .addCase(inviteStaff.rejected, (state, action) => {
        state.inviteLoading = false;
        state.error = action.payload as string;
      })

      // Update Staff
      .addCase(updateStaff.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(
        updateStaff.fulfilled,
        (state, action: PayloadAction<StaffMember>) => {
          state.updateLoading = false;
          const index = state.staff.findIndex(
            (staff) => staff.id === action.payload.id
          );
          if (index !== -1) {
            state.staff[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateStaff.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })

      // Delete Staff
      .addCase(deleteStaff.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(
        deleteStaff.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.deleteLoading = false;
          state.staff = state.staff.filter(
            (staff) => staff.id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(deleteStaff.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearStaff } = staffSlice.actions;
export default staffSlice.reducer;
