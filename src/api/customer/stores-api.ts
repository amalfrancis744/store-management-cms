// src/api/stores-api.ts
import axiosInstance from '../axios-config';
import { Store } from '@/types';

export const storesAPI = {
  // Get all stores with optional search params
  getStores: async (
    params: { search?: string; page?: number; limit?: number } = {}
  ) => {
    try {
      const { search = '', page = 1, limit = 50 } = params;

      const response = await axiosInstance.get(
        `/workspaces?search=${search}&page=${page}&limit=${limit}`
      );
      return { data: { stores: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Get a single store by ID
  getStoreById: async (storeId: number | string) => {
    try {
      const response = await axiosInstance.get(`/workspaces/${storeId}`);
      return { data: { store: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Create a new store
  createStore: async (storeData: Omit<Store, 'id'>) => {
    try {
      const response = await axiosInstance.post('/workspaces', storeData);
      return {
        data: { store: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Update a store
  updateStore: async (storeId: number | string, storeData: Partial<Store>) => {
    try {
      const response = await axiosInstance.put(
        `/workspaces/${storeId}`,
        storeData
      );
      return {
        data: { store: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete a store
  deleteStore: async (storeId: number | string) => {
    try {
      await axiosInstance.delete(`/workspaces/${storeId}`);
      return { data: { success: true } };
    } catch (error) {
      throw error;
    }
  },

  // Toggle store active status
  toggleStoreStatus: async (storeId: number | string, isActive: boolean) => {
    try {
      const response = await axiosInstance.patch(
        `/workspaces/${storeId}/status`,
        { isActive }
      );
      return {
        data: { store: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  getCurrentRoles: async () => {
    try {
      const response = await axiosInstance.get('/auth/userRoles');
      const newRoles = response.data.data; // <-- Move this outside the if block

      if (Array.isArray(newRoles) && newRoles.length > 0) {
        const userJSON = localStorage.getItem('user');
        if (!userJSON) throw new Error('User not found in localStorage');

        const user = JSON.parse(userJSON);

        // Update roles
        user.roles = newRoles;

        // Save back to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('activeRole', 'ADMIN');
      }

      return {
        data: {
          store: newRoles,
          message: response.data.message,
        },
      };
    } catch (error) {
      console.error('Error in getCurrentRoles:', error);
      throw error;
    }
  },
  // Become a store owner (upgrade customer to store owner)

  becomeStoreOwner: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post(
        '/workspaces/createWorkspace',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('dsadsadasdasd response==>', response.data.success);
      if (response.data.success === true) {
        await storesAPI.getCurrentRoles();
      }

      return {
        data: { store: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },
};
