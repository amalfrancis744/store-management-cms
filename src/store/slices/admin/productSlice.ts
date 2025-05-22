// src/store/productSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '@/api/admin/product-api';
import { Product } from '@/types';

interface ProductState {
  products: Record<string, Product[]>; // Key is workspaceId, value is array of products
  productsByCategory: Record<string, Product[]>; // Key is categoryId, value is array of products
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: {},
  productsByCategory: {},
  currentProduct: null,
  isLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProducts(workspaceId);
      return { workspaceId, products: response.data.products };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (
    { workspaceId, productId }: { workspaceId: string; productId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await productAPI.getProductById(workspaceId, productId);
      return { product: response.data.product };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product'
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (
    {
      workspaceId,
      productData,
    }: { workspaceId: string; productData: Omit<Product, 'id'> },
    { rejectWithValue }
  ) => {
    try {
      const response = await productAPI.createProduct(workspaceId, productData);
      return { workspaceId, product: response.data.product };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create product'
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async (
    {
      workspaceId,
      productId,
      productData,
    }: {
      workspaceId: string;
      productId: string;
      productData: Partial<Product>;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await productAPI.updateProduct(
        workspaceId,
        productId,
        productData
      );
      return { workspaceId, product: response.data.product };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update product'
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (
    { workspaceId, productId }: { workspaceId: string; productId: string },
    { rejectWithValue }
  ) => {
    try {
      await productAPI.deleteProduct(workspaceId, productId);
      return { workspaceId, productId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete product'
      );
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchByCategory',
  async (
    { workspaceId, categoryId }: { workspaceId: string; categoryId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await productAPI.getProductsByCategory(
        workspaceId,
        categoryId
      );
      return { categoryId, products: response.data.products };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products by category'
      );
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductErrors: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder.addCase(fetchProducts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      const { workspaceId, products } = action.payload;
      state.products[workspaceId] = products;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch product by ID
    builder.addCase(fetchProductById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProduct = action.payload.product;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create product
    builder.addCase(createProduct.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      const { workspaceId, product } = action.payload;
      if (!state.products[workspaceId]) {
        state.products[workspaceId] = [];
      }
      state.products[workspaceId].push(product);
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update product
    builder.addCase(updateProduct.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      const { workspaceId, product } = action.payload;
      if (state.products[workspaceId]) {
        const index = state.products[workspaceId].findIndex(
          (p) => p.id === product.id
        );
        if (index !== -1) {
          state.products[workspaceId][index] = product;
        }
      }
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete product
    builder.addCase(deleteProduct.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      const { workspaceId, productId } = action.payload;
      if (state.products[workspaceId]) {
        state.products[workspaceId] = state.products[workspaceId].filter(
          (p) => p.id !== productId
        );
      }
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch products by category
    builder.addCase(fetchProductsByCategory.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProductsByCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      const { categoryId, products } = action.payload;
      state.productsByCategory[categoryId] = products;
    });
    builder.addCase(fetchProductsByCategory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearProductErrors, setCurrentProduct, clearCurrentProduct } =
  productSlice.actions;
export default productSlice.reducer;
