// src/api/product-api.ts
import axiosInstance from '../axios-config';
import { Product } from '@/types';

export const productAPI = {
  // Get all products for a workspace
  getProducts: async (workspaceId: string) => {
    try {
      const response = await axiosInstance.get(`/products/${workspaceId}`);
      return { data: { products: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Get a single product by ID
  getProductById: async (workspaceId: string, productId: string) => {
    try {
      const response = await axiosInstance.get(
        `/products/${workspaceId}/${productId}`
      );
      return { data: { product: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Create a new product
  createProduct: async (workspaceId: string, productData: Omit<any, 'id'>) => {
    try {
      const { categoryId, images, variants, ...rest } = productData;

      const formData = new FormData();

      // Append simple fields
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append variants as JSON string
      if (variants && Array.isArray(variants)) {
        formData.append('variants', JSON.stringify(variants));
      }

      // Append image files or URLs
      if (images && Array.isArray(images)) {
        images.forEach((image: any) => {
          if (typeof image === 'string' && image.startsWith('data:')) {
            // Convert base64 to File object
            const byteString = atob(image.split(',')[1]);
            const mimeType = image.split(';')[0].split(':')[1];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeType });
            const file = new File([blob], `product-image-${Date.now()}.jpg`, {
              type: mimeType,
            });
            formData.append('images', file);
          } else if (image instanceof File) {
            formData.append('images', image);
          } else if (typeof image === 'string') {
            formData.append('existingImages', image);
          }
        });
      }

      const response = await axiosInstance.post(
        `/products/${workspaceId}/${categoryId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        data: { product: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Update a product
  updateProduct: async (
    workspaceId: string,
    productId: string,
    productData: Partial<Product>
  ) => {
    try {
      const response = await axiosInstance.put(
        `/products/${workspaceId}/${productId}`,
        productData
      );
      return {
        data: { product: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (workspaceId: string, productId: string) => {
    try {
      await axiosInstance.delete(`/products/${workspaceId}/${productId}`);
      return { data: { success: true } };
    } catch (error) {
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (workspaceId: string, categoryId: string) => {
    try {
      const response = await axiosInstance.get(
        `/products/${workspaceId}/category/${categoryId}`
      );
      return { data: { products: response.data.data } };
    } catch (error) {
      throw error;
    }
  },
};
