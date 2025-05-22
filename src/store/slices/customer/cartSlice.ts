import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { userCartAPI } from '@/api/customer/userCart-api';

interface Variant {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  weight: number | null;
  dimensions: string | null;
  color: string;
  size: string;
  isAvailable: boolean;
  productId: string;
  product: {
    name: string;
    images: string[];
  };
}

interface CartItem {
  id: string;
  userId: string;
  variantId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  variant: Variant;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userCartAPI.getUserCart();
      return response.data.cart;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart'
      );
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (
    { variantId, quantity = 1 }: { variantId: string; quantity?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await userCartAPI.addToCart({ variantId, quantity });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add item to cart'
      );
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItem',
  async (variantId: string, { rejectWithValue }) => {
    try {
      const response = await userCartAPI.removeFromCart({ variantId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item from cart'
      );
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async (
    { variantId, quantity }: { variantId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await userCartAPI.updateQuantity({
        variantId,
        quantity,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update item quantity'
      );
    }
  }
);

export const clearCartItems = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userCartAPI.clearCart();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear cart'
      );
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // state.items = action.payload.items || []
        state.items = action.payload || []; // Fixed to use action.payload directly
        console.log('Updated cart items:', state.items); // Debug state update
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add item to cart
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Check if item already exists in cart
        const existingItemIndex = state.items.findIndex(
          (item) => item.variantId === action.payload.cart.variantId
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          state.items[existingItemIndex].quantity =
            action.payload.cart.quantity;
        } else {
          // Add new item if it doesn't exist
          state.items.push(action.payload.cart);
        }
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove item from cart
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => item.variantId !== action.meta.arg
        );
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update cart item quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const item = state.items.find(
          (item) => item.variantId === action.meta.arg.variantId
        );
        if (item) {
          item.quantity = action.meta.arg.quantity;
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Clear cart
      .addCase(clearCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartItems.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      })
      .addCase(clearCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggleCart, openCart, closeCart, setError } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) =>
  state.cart.items.map((item) => ({
    productId: item.variant.productId,
    variantId: item.variant.id,
    name: item.variant.title,
    price: item.variant.price,
    quantity: item.quantity,
    color: item.variant.color,
    size: item.variant.size,
    isAvailable: item.variant.isAvailable,
    image: item?.variant?.product?.images[0],
  }));

export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce(
    (total, item) => total + item.variant.price * item.quantity,
    0
  );

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export const selectIsCartOpen = (state: RootState) => state.cart.isOpen;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;

export default cartSlice.reducer;
