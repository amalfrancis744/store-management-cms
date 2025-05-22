import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryAPI } from '@/api/admin/category-api';
import { Category } from '@/types';

interface CategoryState {
  categories: Record<string, Category[]>; // Key is workspaceId, value is array of categories
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: {},
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetch',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getCategories(workspaceId);

      return { workspaceId, categories: response.data.categories };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories'
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (
    {
      workspaceId,
      categoryData,
    }: { workspaceId: string; categoryData: Omit<Category, 'id'> },
    { rejectWithValue }
  ) => {
    try {
      const response = await categoryAPI.createCategory(
        workspaceId,
        categoryData
      );
      return { workspaceId, category: response.data.category };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create category'
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async (
    {
      workspaceId,
      categoryId,
      categoryData,
    }: {
      workspaceId: string;
      categoryId: string;
      categoryData: Partial<Category>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await categoryAPI.updateCategory(
        workspaceId,
        categoryId,
        categoryData
      );
      return { workspaceId, category: response.data.category };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update category'
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (
    { workspaceId, categoryId }: { workspaceId: string; categoryId: string },
    { rejectWithValue }
  ) => {
    try {
      await categoryAPI.deleteCategory(workspaceId, categoryId);
      return { workspaceId, categoryId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete category'
      );
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategoryErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      const { workspaceId, categories } = action.payload;
      state.categories[workspaceId] = categories;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create category
    builder.addCase(createCategory.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      const { workspaceId, category } = action.payload;
      if (!state.categories[workspaceId]) {
        state.categories[workspaceId] = [];
      }
      state.categories[workspaceId].push(category);
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update category
    builder.addCase(updateCategory.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      const { workspaceId, category } = action.payload;
      if (state.categories[workspaceId]) {
        const index = state.categories[workspaceId].findIndex(
          (c) => c.id === category.id
        );
        if (index !== -1) {
          state.categories[workspaceId][index] = category;
        }
      }
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete category
    builder.addCase(deleteCategory.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      const { workspaceId, categoryId } = action.payload;
      if (state.categories[workspaceId]) {
        state.categories[workspaceId] = state.categories[workspaceId].filter(
          (c) => c.id !== categoryId
        );
      }
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCategoryErrors } = categorySlice.actions;
export default categorySlice.reducer;
