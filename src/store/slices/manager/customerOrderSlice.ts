import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axios-config';
import { RootState } from '@/store';

// Define types for the order state
interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
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
    isAvailable: boolean;
    productId: string;
  };
}

interface Address {
  id: string;
  userId: string;
  address: string;
  street: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  termsAccepted: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  profileImageUrl: string | null;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  locationId: string | null;
  isDeleted: boolean;
}

interface Order {
  id: string;
  userId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  workspaceId?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  totalAmount: number;
  status: string;
  notes?: string | null;
  placedAt: string;
  createdAt?: string;
  updatedAt?: string;
  stripeSessionId?: string | null;
  paidAt?: string | null;
  paymentDetails?: any | null;
  items: OrderItem[];
  user: User;
  shippingAddress: Address;
  billingAddress: Address;
  assignedStaff?: StaffMember | string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  status: 'idle',
  error: null,
};

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  isActive: boolean;
  isAvailable: boolean;
  profileImageUrl: string | null;
  assignedOrders: any[];
  // Add other properties as needed
}

// Socket notification data interface
interface SocketNotificationData {
  title: string;
  message: string;
  data: {
    id: string;
    status: string;
    userId: string;
    workspaceId: number;
    notificationId: string;
    type: string;
    createdAt: string;
  };
  id: string;
  read: boolean;
}

// Async thunks
export const fetchCustomerOrders = createAsyncThunk(
  'orders/fetchCustomerOrders',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/orders/workspaces/${workspaceId}/orders`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order'
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/orders', orderData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create order'
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async (
    { orderId, status }: { orderId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(`/orders/${orderId}/status`, {
        status,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  }
);

export const assignStaffToOrder = createAsyncThunk(
  'customerOrders/assignStaffToOrder',
  async ({
    workspaceId,
    orderId,
    userId,
  }: {
    workspaceId: string;
    orderId: string;
    userId: string;
  }) => {
    console.log('Assigning staff member to order:', {
      workspaceId,
      orderId,
      userId,
    });
    const response = await axiosInstance.post(
      `/orders/workspaces/${workspaceId}/orders/assign-order`,
      {
        userId: userId,
        orderId: orderId,
      }
    );
    return { orderId, userId, response: response.data };
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    // updateOrders: (state, action: PayloadAction<Order[]>) => {
    //   state.orders = action.payload;{...state.orders, ...action.payload};
    // },
    resetOrderStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },

    // add a new order to the orders array

    addNewOrderBySocket: (state, action: PayloadAction<Order>) => {
      const newOrder = action.payload;

      // Check if order already exists to prevent duplicates
      const existingOrderIndex = state.orders.findIndex(
        (order) => order.id === newOrder.id
      );

      if (existingOrderIndex === -1) {
        // Add new order to the beginning of the list (most recent first)
        state.orders.unshift(newOrder);
        console.log(`New order ${newOrder.id} added to order list via socket`);
      } else {
        console.log(
          `Order ${newOrder.id} already exists in the list, skipping duplicate`
        );
      }
    },
    // In your orderSlice.ts
    updateOrderStatesBySocket: (state, action: PayloadAction<any[]>) => {
      const notifications = action.payload;

      notifications.forEach((notification) => {
        // Check if this is an ORDER_UPDATE notification
        if (notification.data?.type === 'ORDER_UPDATE') {
          console.log(
            'Processing ORDER_UPDATE notification:',
            notification.data
          );

          // Extract order data from notification
          const { id: orderId, status: newStatus } = notification.data;
          const updatedAt =
            notification.data.createdAt || new Date().toISOString();

          // Update the order in the orders array
          const orderIndex = state.orders.findIndex(
            (order) => order.id === orderId
          );
          if (orderIndex !== -1) {
            console.log(
              `Updating order ${orderId} status from ${state.orders[orderIndex].status} to ${newStatus}`
            );

            // Prepare updated order object
            const updatedOrder = {
              ...state.orders[orderIndex],
              status: newStatus,
              updatedAt: updatedAt,
            };

            // If status is delivered, update paymentStatus to COMPLETED
            if (newStatus?.toLowerCase() === 'delivered') {
              updatedOrder.paymentStatus = 'COMPLETED';
              console.log(
                `Order ${orderId} delivered - setting paymentStatus to COMPLETED`
              );
            }

            state.orders[orderIndex] = updatedOrder;
          } else {
            console.log(`Order ${orderId} not found in current orders list`);
          }

          // Update current order if it matches
          if (state.currentOrder && state.currentOrder.id === orderId) {
            console.log(
              `Updating current order ${orderId} status to ${newStatus}`
            );

            const updatedCurrentOrder = {
              ...state.currentOrder,
              status: newStatus,
              updatedAt: updatedAt,
            };

            // If status is delivered, update paymentStatus to COMPLETED
            if (newStatus?.toLowerCase() === 'delivered') {
              updatedCurrentOrder.paymentStatus = 'COMPLETED';
              console.log(
                `Current order ${orderId} delivered - setting paymentStatus to COMPLETED`
              );
            }

            state.currentOrder = updatedCurrentOrder;
          }
        }

        // Handle other notification types for orders if needed
        else if (
          notification.title?.includes('Order') ||
          notification.message?.includes('order')
        ) {
          console.log('Processing order-related notification:', notification);

          // Try to extract order ID from message or notification data
          let orderId = null;
          let newStatus = null;

          // Extract from message patterns
          if (
            notification.message?.includes('Order ') &&
            notification.message?.includes(' updated to ')
          ) {
            const orderIdMatch = notification.message.match(
              /Order (\w+) updated to (\w+)/
            );
            if (orderIdMatch) {
              orderId = orderIdMatch[1];
              newStatus = orderIdMatch[2];
            }
          }

          // If we extracted valid data, update the order
          if (orderId && newStatus) {
            const orderIndex = state.orders.findIndex(
              (order) => order.id === orderId
            );
            if (orderIndex !== -1) {
              console.log(
                `Updating order ${orderId} status from pattern match to ${newStatus}`
              );

              const updatedOrder = {
                ...state.orders[orderIndex],
                status: newStatus,
                updatedAt: notification.createdAt || new Date().toISOString(),
              };

              // If status is delivered, update paymentStatus to COMPLETED
              if (newStatus?.toLowerCase() === 'delivered') {
                updatedOrder.paymentStatus = 'COMPLETED';
                console.log(
                  `Order ${orderId} delivered via pattern match - setting paymentStatus to COMPLETED`
                );
              }

              state.orders[orderIndex] = updatedOrder;
            }

            // Update current order if it matches
            if (state.currentOrder && state.currentOrder.id === orderId) {
              const updatedCurrentOrder = {
                ...state.currentOrder,
                status: newStatus,
                updatedAt: notification.createdAt || new Date().toISOString(),
              };

              // If status is delivered, update paymentStatus to COMPLETED
              if (newStatus?.toLowerCase() === 'delivered') {
                updatedCurrentOrder.paymentStatus = 'COMPLETED';
                console.log(
                  `Current order ${orderId} delivered via pattern match - setting paymentStatus to COMPLETED`
                );
              }

              state.currentOrder = updatedCurrentOrder;
            }
          }
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customer orders
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        fetchCustomerOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.status = 'succeeded';
          state.orders = action.payload;
        }
      )
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        fetchOrderById.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.status = 'succeeded';
          state.currentOrder = action.payload;
        }
      )
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Create order
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
        state.orders = [action.payload, ...state.orders];
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        updateOrderStatus.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.status = 'succeeded';
          const updatedOrder = action.payload;
          state.orders = state.orders.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order
          );
          if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
            state.currentOrder = updatedOrder;
          }
        }
      )
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(assignStaffToOrder.fulfilled, (state, action) => {
        const { orderId, userId } = action.payload;
        const orderIndex = state.orders.findIndex(
          (order) => order.id === orderId
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex].assignedStaff = userId; // Assign userId as a string
        }
      });
  },
});

// Export actions
export const {
  clearCurrentOrder,
  resetOrderStatus,
  updateOrderStatesBySocket,
  addNewOrderBySocket,
} = orderSlice.actions;

// Selectors
export const selectAllOrders = (state: RootState) => state.customerOrder.orders;
export const selectCurrentOrder = (state: RootState) =>
  state.customerOrder.currentOrder;
export const selectOrderStatus = (state: RootState) =>
  state.customerOrder.status;
export const selectOrderError = (state: RootState) => state.customerOrder.error;

export default orderSlice.reducer;
