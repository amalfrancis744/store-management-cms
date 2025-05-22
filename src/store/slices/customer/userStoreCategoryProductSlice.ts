import { categoryAPI } from '@/api/admin/category-api';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types based on the provided data structure
export interface Variant {
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
}

export interface Product {
  id: string;
  name: string;
  images?: string[];
  variants?: Variant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string | null;
  workspaceId: number;
  children?: Category[];
  products: Product[];
}

// State interface
interface CategoryState {
  categories: Record<string, Category[]>; // Indexed by workspaceId
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
}

// Initial state
const initialState: CategoryState = {
  categories: {},
  isLoading: false,
  error: null,
  selectedCategory: null,
};

// API call to fetch categories with their products
const fetchCategoriesFromAPI = async (
  workspaceId: string
): Promise<Category[]> => {
  try {
    const response = await fetch(
      `/api/workspaces/${workspaceId}/categories?include=products`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

// Async thunk for fetching categories
export const fetchAllCategories = createAsyncThunk(
  'categories/user/fetchCategories',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getCategories(workspaceId);
      return { workspaceId, categories: response.data.categories };
    } catch (error) {
      return rejectWithValue(
        'Failed to fetch categories. Please try again later.'
      );
    }
  }
);

// Async thunk for fetching a single category's details
export const fetchCategoryDetails = createAsyncThunk(
  'categories/user/fetchCategoryDetails',
  async (
    { workspaceId, categoryId }: { workspaceId: string; categoryId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/categories/${categoryId}?include=products`
      );

      if (!response.ok) {
        return rejectWithValue(`Failed to fetch category: ${response.status}`);
      }

      const category = await response.json();

      if (!category) {
        return rejectWithValue('Category not found');
      }

      return { workspaceId, category };
    } catch (error) {
      return rejectWithValue(
        'Failed to fetch category details. Please try again later.'
      );
    }
  }
);

// Create the category slice
const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    resetCategoryState: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchCategories
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        const { workspaceId, categories } = action.payload;
        state.categories[workspaceId] = categories;
        state.isLoading = false;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Handle fetchCategoryDetails
      .addCase(fetchCategoryDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryDetails.fulfilled, (state, action) => {
        const { workspaceId, category } = action.payload;

        // Find and update the specific category within the workspace's categories
        if (state.categories[workspaceId]) {
          const index = state.categories[workspaceId].findIndex(
            (cat) => cat.id === category.id
          );
          if (index !== -1) {
            state.categories[workspaceId][index] = category;
          } else {
            // If it doesn't exist yet, add it
            state.categories[workspaceId].push(category);
          }
        } else {
          // If no categories exist for this workspace yet, initialize with this category
          state.categories[workspaceId] = [category];
        }

        state.isLoading = false;
      })
      .addCase(fetchCategoryDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setSelectedCategory, resetCategoryState } =
  categorySlice.actions;

// Export reducer
export default categorySlice.reducer;
