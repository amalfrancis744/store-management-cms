// src/api/customer/userCart-api.ts
import axiosInstance from '@/api/axios-config';

export const userCartAPI = {
  // Get user cart
  getUserCart: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      return { data: { cart: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (cartItem: { variantId: string; quantity: number }) => {
    try {
      const response = await axiosInstance.post('/cart', cartItem);
      return {
        data: { cart: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async ({ variantId }: { variantId: string }) => {
    try {
      const response = await axiosInstance.delete(`/cart/${variantId}`);
      return {
        data: { cart: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Update item quantity
  updateQuantity: async ({
    variantId,
    quantity,
  }: {
    variantId: string;
    quantity: number;
  }) => {
    try {
      const response = await axiosInstance.put(`/cart/${variantId}`, {
        quantity,
      });
      return {
        data: { cart: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await axiosInstance.delete('/cart');
      return { data: { message: response.data.message } };
    } catch (error) {
      throw error;
    }
  },
};
