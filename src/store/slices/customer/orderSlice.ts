import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axios-config';
import { RootState } from '@/store';

// Define the OrderItem interface
interface OrderItem {
  id?: string;
  orderId?: string;
  variantId: string;
  quantity: number;
  price: number;
  variant?: {
    id: string;
    title: string;
    sku: string;
    price: number;
    color?: string;
    size?: string;
    productId: string;
  };
}

// Define the Address interface
interface Address {
  id?: string;
  userId?: string;
  address: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define the User interface
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// Define the Order interface
interface Order {
  total: any;
  id: string;
  userId: string;
  workspaceId: number;
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: 'CASH' | 'STRIPE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  stripeSessionId?: string | null;
  paidAt?: string | null;
  paymentDetails?: any;
  items: OrderItem[];
  user?: User;
  shippingAddress?: Address;
  billingAddress?: Address;
}

// Define the state structure
interface OrderState {
  orders: Record<string | number, Order[]>;
  currentOrder: Order | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  stripeUrl: string | null;
  stripeSessionId: string | null;
}

// Initial state
const initialState: OrderState = {
  orders: {},
  currentOrder: null,
  status: 'idle',
  error: null,
  stripeUrl: null,
  stripeSessionId: null,
};

// Helper function to sort orders by createdAt in descending order
const sortOrdersByCreatedAt = (orders: Order[]): Order[] => {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Async thunk for creating an order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderPayload: {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/orders`, orderPayload);
      console.log('Create order response:===>', response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create order'
      );
    }
  }
);

// Async thunk for canceling an order
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
      console.log('Cancel order response:===>', response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel order'
      );
    }
  }
);

// Async thunk for getting all orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (workspaceId: string | number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/orders/workspaces/${workspaceId}`
      );
      console.log('Fetch orders response:===>', response.data);
      return { orders: response.data, workspaceId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

// Async thunk for getting user's orders
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders/users/${userId}`);
      console.log('Fetch user orders response:===>', response.data);
      return { orders: response.data.data, userId }; // Extract the `data` field
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user orders'
      );
    }
  }
);

// Create the slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderStatus: (state) => {
      state.status = 'idle';
      state.error = null;
      state.stripeUrl = null;
      state.stripeSessionId = null;
    },
    clearStripeUrl: (state) => {
      state.stripeUrl = null;
      state.stripeSessionId = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { orders, workspaceId } = action.payload;
        state.orders[workspaceId] = sortOrdersByCreatedAt(orders);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Handle fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { orders, userId } = action.payload;
        state.orders[userId] = sortOrdersByCreatedAt(orders);
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Handle createOrder
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        if (action.payload.order) {
          // Add to appropriate workspace orders if exists
          const workspaceId = action.payload.order.workspaceId;
          if (state.orders[workspaceId]) {
            state.orders[workspaceId] = sortOrdersByCreatedAt([
              action.payload.order,
              ...state.orders[workspaceId],
            ]);
          } else {
            state.orders[workspaceId] = [action.payload.order];
          }
          state.currentOrder = action.payload.order;
        }
        // Store Stripe URL and session ID if provided in the response
        if (action.payload.url) {
          state.stripeUrl = action.payload.url;
        }
        if (action.payload.session_id) {
          state.stripeSessionId = action.payload.session_id;
        }
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Handle cancelOrder
      .addCase(cancelOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const orderId = action.meta.arg; // Get the orderId from meta.arg
        const newStatus = action.payload.data.status; // Get the status from response

        // Update the currentOrder if it matches the canceled order
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = newStatus;
        }

        // Update the order status in all workspace/user order arrays
        Object.keys(state.orders).forEach((key) => {
          const index = state.orders[key].findIndex(
            (order) => order.id === orderId
          );
          if (index !== -1) {
            state.orders[key][index].status = newStatus;
            // Re-sort to maintain order after status update
            state.orders[key] = sortOrdersByCreatedAt(state.orders[key]);
          }
        });
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {
  resetOrderStatus,
  clearStripeUrl,
  setCurrentOrder,
  clearCurrentOrder,
} = orderSlice.actions;

// Export selectors
export const selectOrders = (state: RootState, workspaceId: string | number) =>
  state.orders.orders[workspaceId] || [];

export const selectCurrentOrder = (state: RootState) =>
  state.orders.currentOrder;
export const selectOrderStatus = (state: RootState) => state.orders.status;
export const selectOrderError = (state: RootState) => state.orders.error;
export const selectStripeUrl = (state: RootState) => state.orders.stripeUrl;
export const selectStripeSessionId = (state: RootState) =>
  state.orders.stripeSessionId;

export default orderSlice.reducer;
