import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axios-config';

// Define types for dashboard data
interface UsersByRole {
  role: string;
  _count: {
    role: number;
  };
}

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  placedAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface RecentOrders {
  count: number;
  orders: RecentOrder[];
}

interface Revenue {
  total: number;
  byWorkspace: Array<{
    workspaceId: string;
    workspaceName: string;
    revenue: number;
  }>;
}

interface WorkspaceStatus {
  active: number;
  inactive: number;
}

interface TopSellingProduct {
  variantId: string;
  variantName: string;
  quantity: number;
  _sum: {
    quantity: number;
  };
}

interface MostActiveWorkspace {
  workspaceId: string;
  workspaceName: string;
  orderCount: number;
  _count: {
    workspaceId: number;
  };
}

interface UserSignupData {
  date: string;
  count: number;
}

interface DashboardData {
  usersByRole: UsersByRole[];
  recentOrders: RecentOrders;
  revenue: Revenue;
  workspaceStatus: WorkspaceStatus;
  topSellingProducts: TopSellingProduct[];
  mostActiveWorkspaces: MostActiveWorkspace[];
  userSignupsOverTime: UserSignupData[];
}

interface AdminDashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
}

const initialState: AdminDashboardState = {
  data: null,
  isLoading: false,
  error: null,
  lastFetchTime: null,
};

// Async thunk for fetching dashboard data
export const fetchAdminDashboard = createAsyncThunk(
  'adminDashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('admin/dashboard');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

// Async thunk for refreshing dashboard data
export const refreshAdminDashboard = createAsyncThunk(
  'adminDashboard/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('admin/dashboard');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to refresh dashboard data'
      );
    }
  }
);

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    // Clear dashboard errors
    clearDashboardErrors: (state) => {
      state.error = null;
    },

    // Update specific dashboard metrics (for real-time updates)
    updateAdminDashboardMetrics: (state, action) => {
      if (state.data) {
        const { type, payload } = action.payload;

        switch (type) {
          case 'NEW_USER':
            // Update user count when new user registers
            const userRole = state.data.usersByRole.find(
              (role) => role.role === payload.role
            );
            if (userRole) {
              userRole._count.role += 1;
            } else {
              state.data.usersByRole.push({
                role: payload.role,
                _count: { role: 1 },
              });
            }
            break;

          case 'NEW_ORDER':
            // Update order metrics when new order is placed
            state.data.recentOrders.count += 1;
            state.data.recentOrders.orders.unshift({
              id: payload.orderId,
              totalAmount: payload.totalAmount,
              status: payload.status,
              placedAt: payload.createdAt,
              user: {
                firstName: payload.user.firstName,
                lastName: payload.user.lastName,
              },
            });

            // Keep only recent orders (limit to 10)
            if (state.data.recentOrders.orders.length > 10) {
              state.data.recentOrders.orders =
                state.data.recentOrders.orders.slice(0, 10);
            }
            break;

          case 'ORDER_COMPLETED':
            // Update revenue when order is completed
            if (
              payload.status === 'DELIVERED' ||
              payload.paymentStatus === 'COMPLETED'
            ) {
              state.data.revenue.total += payload.totalAmount;

              // Update workspace revenue
              const workspaceRevenue = state.data.revenue.byWorkspace.find(
                (ws) => ws.workspaceId === payload.workspaceId
              );
              if (workspaceRevenue) {
                workspaceRevenue.revenue += payload.totalAmount;
              }
            }
            break;

          case 'WORKSPACE_STATUS_CHANGE':
            // Update workspace status
            if (payload.oldStatus !== payload.newStatus) {
              if (payload.oldStatus === 'active') {
                state.data.workspaceStatus.active -= 1;
                state.data.workspaceStatus.inactive += 1;
              } else {
                state.data.workspaceStatus.inactive -= 1;
                state.data.workspaceStatus.active += 1;
              }
            }
            break;
        }
      }
    },

    // Reset dashboard data
    resetDashboardData: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetchTime = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard data
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data;
        state.lastFetchTime = Date.now();
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh dashboard data
    builder
      .addCase(refreshAdminDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAdminDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data;
        state.lastFetchTime = Date.now();
      })
      .addCase(refreshAdminDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearDashboardErrors,
  updateAdminDashboardMetrics,
  resetDashboardData,
} = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
