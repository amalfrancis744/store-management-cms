// src/store/slices/storesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storesAPI } from '@/api/customer/stores-api';
import { RootState } from '@/store';

// Define the Store interface
export interface Store {
  id: number;
  name: string;
  slug: string;
  images: string[];
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  createdAt: string;
  description?: string;
  rating?: number;
  categories?: string[];
  distance?: string;
  deliveryTime?: string;
  featured?: boolean;
}

// Define the state structure
interface StoresState {
  stores: Store[];
  activeStore: Store | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    search: string;
    category: string | null;
    sortBy: 'rating' | 'distance' | 'deliveryTime' | null;
  };
}

// Initial state
const initialState: StoresState = {
  stores: [],
  activeStore: null,
  status: 'idle',
  error: null,
  filters: {
    search: '',
    category: null,
    sortBy: null,
  },
};

// Async thunks for API operations
export const fetchStores = createAsyncThunk(
  'stores/fetchStores',
  async (
    params: { search?: string; page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await storesAPI.getStores(params);
      return response.data.stores;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stores'
      );
    }
  }
);

export const fetchStoreById = createAsyncThunk(
  'stores/fetchStoreById',
  async (storeId: number | string, { rejectWithValue }) => {
    try {
      const response = await storesAPI.getStoreById(storeId);
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch store details'
      );
    }
  }
);

export const createStore = createAsyncThunk(
  'stores/createStore',
  async (storeData: Omit<Store, 'id'>, { rejectWithValue }) => {
    try {
      const response = await storesAPI.createStore(storeData);
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create store'
      );
    }
  }
);

export const updateStore = createAsyncThunk(
  'stores/updateStore',
  async (
    {
      storeId,
      storeData,
    }: { storeId: number | string; storeData: Partial<Store> },
    { rejectWithValue }
  ) => {
    try {
      const response = await storesAPI.updateStore(storeId, storeData);
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update store'
      );
    }
  }
);

export const deleteStore = createAsyncThunk(
  'stores/deleteStore',
  async (storeId: number | string, { rejectWithValue }) => {
    try {
      await storesAPI.deleteStore(storeId);
      return storeId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete store'
      );
    }
  }
);

export const toggleStoreStatus = createAsyncThunk(
  'stores/toggleStoreStatus',
  async (
    { storeId, isActive }: { storeId: number | string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await storesAPI.toggleStoreStatus(storeId, isActive);
      return response.data.store;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update store status'
      );
    }
  }
);

// Create the slice
const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<'rating' | 'distance' | 'deliveryTime' | null>
    ) => {
      state.filters.sortBy = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        category: null,
        sortBy: null,
      };
    },
    setActiveStore: (state, action: PayloadAction<Store | null>) => {
      state.activeStore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchStores
      .addCase(fetchStores.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stores = action.payload;
        state.error = null;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Handle fetchStoreById
      .addCase(fetchStoreById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activeStore = action.payload;
        state.error = null;
      })
      .addCase(fetchStoreById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Handle createStore
      .addCase(createStore.fulfilled, (state, action) => {
        state.stores.push(action.payload);
      })

      // Handle updateStore
      .addCase(updateStore.fulfilled, (state, action) => {
        const index = state.stores.findIndex(
          (store) => store.id === action.payload.id
        );
        if (index !== -1) {
          state.stores[index] = action.payload;
        }
        if (state.activeStore?.id === action.payload.id) {
          state.activeStore = action.payload;
        }
      })

      // Handle deleteStore
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.stores = state.stores.filter(
          (store) => store.id !== action.payload
        );
        if (state.activeStore?.id === action.payload) {
          state.activeStore = null;
        }
      })

      // Handle toggleStoreStatus
      .addCase(toggleStoreStatus.fulfilled, (state, action) => {
        const index = state.stores.findIndex(
          (store) => store.id === action.payload.id
        );
        if (index !== -1) {
          state.stores[index] = action.payload;
        }
        if (state.activeStore?.id === action.payload.id) {
          state.activeStore = action.payload;
        }
      });
  },
});

// Export actions and reducer
export const {
  setSearchFilter,
  setCategoryFilter,
  setSortBy,
  clearFilters,
  setActiveStore,
} = storesSlice.actions;

// Export selectors
export const selectAllStores = (state: RootState) => state.stores.stores;
export const selectActiveStore = (state: RootState) => state.stores.activeStore;
export const selectStoresStatus = (state: RootState) => state.stores.status;
export const selectStoresError = (state: RootState) => state.stores.error;
export const selectStoresFilters = (state: RootState) => state.stores.filters;

// Filter stores based on current filters
export const selectFilteredStores = (state: RootState) => {
  const { stores } = state.stores;
  const { search, category, sortBy } = state.stores.filters;

  let filteredStores = [...stores];

  // Apply search filter
  if (search) {
    filteredStores = filteredStores.filter(
      (store) =>
        store.name.toLowerCase().includes(search.toLowerCase()) ||
        store.description?.toLowerCase().includes(search.toLowerCase()) ||
        false
    );
  }

  // Apply category filter
  if (category) {
    filteredStores = filteredStores.filter((store) =>
      store.categories?.some(
        (cat) => cat.toLowerCase() === category.toLowerCase()
      )
    );
  }

  // Apply sorting
  if (sortBy) {
    switch (sortBy) {
      case 'rating':
        filteredStores.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'distance':
        filteredStores.sort((a, b) => {
          const aDistance = parseFloat(
            a.distance?.replace('km', '').trim() || '999'
          );
          const bDistance = parseFloat(
            b.distance?.replace('km', '').trim() || '999'
          );
          return aDistance - bDistance;
        });
        break;
      case 'deliveryTime':
        filteredStores.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime?.split('-')[0] || '999');
          const bTime = parseInt(b.deliveryTime?.split('-')[0] || '999');
          return aTime - bTime;
        });
        break;
    }
  }

  return filteredStores;
};

export default storesSlice.reducer;
