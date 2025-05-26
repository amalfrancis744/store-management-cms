import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axios-config';

// Types
export interface OrderItem {
  quantity: number;
  price: number;
  variant: {
    id: string;
    title: string;
    sku: string;
    price: number;
    stock: number;
    color: string;
    size: string;
  };
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  placedAt: string;
  items: OrderItem[];
}

export interface WorkspaceDetails {
  id: number;
  name: string;
  images: string[];
  location: string | null;
  description: string;
  createdAt: string;
}

export interface StaffStats {
  totalOrders: number;
  ordersToday: number;
  processingOrders: number;
  completedOrders: number;
  successfulDeliveries: number;
  totalRevenue: number;
}

export interface StaffDashboardData {
  availabilityStatus: boolean;
  workspaceDetails: WorkspaceDetails;
  stats: StaffStats;
  assignedOrders: Order[];
}

export interface StaffState {
  dashboardData: StaffDashboardData | null;
  selectedOrder: Order | null;
  isLoading: boolean;
  isDashboardLoading: boolean;
  isUpdatingOrderStatus: boolean;
  error: string | null;
  dashboardError: string | null;
  orderStatusError: string | null;
  lastFetchedWorkspaceId: string | null;
}

// Initial state
const initialState: StaffState = {
  dashboardData: null,
  selectedOrder: null,
  isLoading: false,
  isDashboardLoading: false,
  isUpdatingOrderStatus: false,
  error: null,
  dashboardError: null,
  orderStatusError: null,
  lastFetchedWorkspaceId: null,
};

// Async thunks
export const fetchStaffDashboard = createAsyncThunk(
  'staff/fetchDashboard',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      if (!workspaceId) {
        throw new Error('Workspace ID is required');
      }
      
      const response = await axiosInstance.get(`staff/${workspaceId}/dashboard`);
      return { data: response.data, workspaceId };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch staff dashboard';
      return rejectWithValue(errorMessage);
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  'staff/changeOrderStatus',
  async (
    {
      workspaceId,
      orderId,
      status,
    }: {
      workspaceId: string;
      orderId: string;
      status: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      if (!workspaceId || !orderId || !status) {
        throw new Error('Workspace ID, Order ID, and Status are required');
      }

      const response = await axiosInstance.patch(
        `orders/workspaces/${workspaceId}/orders/${orderId}/status`,
        { status }
      );

      // Automatically refetch dashboard data after successful status update
      dispatch(fetchStaffDashboard(workspaceId));

      return {
        orderId,
        newStatus: status,
        message: response.data.message || 'Order status updated successfully',
        response: response.data,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice definition
const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    // Set selected order for detailed view
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },

    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.dashboardError = null;
      state.orderStatusError = null;
    },

    // Clear specific error types
    clearDashboardError: (state) => {
      state.dashboardError = null;
    },

    clearOrderStatusError: (state) => {
      state.orderStatusError = null;
    },

    // Reset staff state (useful for logout)
    resetStaffState: (state) => {
      return initialState;
    },

    // Update order status optimistically (for immediate UI feedback)
    updateOrderStatusOptimistic: (
      state,
      action: PayloadAction<{ orderId: string; newStatus: string }>
    ) => {
      const { orderId, newStatus } = action.payload;
      
      // Update in dashboard orders
      if (state.dashboardData?.assignedOrders) {
        const orderIndex = state.dashboardData.assignedOrders.findIndex(
          (order) => order.id === orderId
        );
        if (orderIndex !== -1) {
          state.dashboardData.assignedOrders[orderIndex].status = newStatus;
        }
      }

      // Update selected order if it matches
      if (state.selectedOrder?.id === orderId) {
        state.selectedOrder.status = newStatus;
      }
    },

    // Revert optimistic update (in case of error)
    revertOrderStatusUpdate: (
      state,
      action: PayloadAction<{ orderId: string; originalStatus: string }>
    ) => {
      const { orderId, originalStatus } = action.payload;
      
      // Revert in dashboard orders
      if (state.dashboardData?.assignedOrders) {
        const orderIndex = state.dashboardData.assignedOrders.findIndex(
          (order) => order.id === orderId
        );
        if (orderIndex !== -1) {
          state.dashboardData.assignedOrders[orderIndex].status = originalStatus;
        }
      }

      // Revert selected order if it matches
      if (state.selectedOrder?.id === orderId) {
        state.selectedOrder.status = originalStatus;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Staff Dashboard
    builder
      .addCase(fetchStaffDashboard.pending, (state) => {
        state.isDashboardLoading = true;
        state.dashboardError = null;
        state.isLoading = true;
      })
      .addCase(fetchStaffDashboard.fulfilled, (state, action) => {
        state.isDashboardLoading = false;
        state.isLoading = false;
        state.dashboardError = null;
        state.dashboardData = action.payload.data;
        state.lastFetchedWorkspaceId = action.payload.workspaceId;
      })
      .addCase(fetchStaffDashboard.rejected, (state, action) => {
        state.isDashboardLoading = false;
        state.isLoading = false;
        state.dashboardError = action.payload as string;
        state.error = action.payload as string;
      });

    // Change Order Status
    builder
      .addCase(changeOrderStatus.pending, (state) => {
        state.isUpdatingOrderStatus = true;
        state.orderStatusError = null;
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        state.isUpdatingOrderStatus = false;
        state.orderStatusError = null;
        
        const { orderId, newStatus } = action.payload;
        
        // Update the order status in the dashboard data
        if (state.dashboardData?.assignedOrders) {
          const orderIndex = state.dashboardData.assignedOrders.findIndex(
            (order) => order.id === orderId
          );
          if (orderIndex !== -1) {
            state.dashboardData.assignedOrders[orderIndex].status = newStatus;
          }
        }

        // Update selected order if it matches
        if (state.selectedOrder?.id === orderId) {
          state.selectedOrder.status = newStatus;
        }
      })
      .addCase(changeOrderStatus.rejected, (state, action) => {
        state.isUpdatingOrderStatus = false;
        state.orderStatusError = action.payload as string;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSelectedOrder,
  clearErrors,
  clearDashboardError,
  clearOrderStatusError,
  resetStaffState,
  updateOrderStatusOptimistic,
  revertOrderStatusUpdate,
} = staffSlice.actions;

// Selectors
export const selectStaffDashboardData = (state: { staff: StaffState }) => state.staff.dashboardData;
export const selectStaffOrders = (state: { staff: StaffState }) => state.staff.dashboardData?.assignedOrders || [];
export const selectStaffStats = (state: { staff: StaffState }) => state.staff.dashboardData?.stats;
export const selectWorkspaceDetails = (state: { staff: StaffState }) => state.staff.dashboardData?.workspaceDetails;
export const selectSelectedOrder = (state: { staff: StaffState }) => state.staff.selectedOrder;
export const selectStaffLoading = (state: { staff: StaffState }) => state.staff.isLoading;
export const selectDashboardLoading = (state: { staff: StaffState }) => state.staff.isDashboardLoading;
export const selectOrderStatusLoading = (state: { staff: StaffState }) => state.staff.isUpdatingOrderStatus;
export const selectStaffErrors = (state: { staff: StaffState }) => ({
  general: state.staff.error,
  dashboard: state.staff.dashboardError,
  orderStatus: state.staff.orderStatusError,
});

// Export reducer
export default staffSlice.reducer;