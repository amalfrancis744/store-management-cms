import axiosInstance from '../axios-config';
import { AxiosError, AxiosResponse } from 'axios';
import { Category } from '@/types';

/**
 * Response interface for API calls that return a category
 */
interface CategoryResponse {
  data: Category;
  message: string;
}

/**
 * Response interface for API calls that return multiple categories
 */
interface CategoriesResponse {
  data: Category[];
  message: string;
}

/**
 * API client for category-related operations
 */
export const categoryAPI = {
  /**
   * Get all categories for a specific workspace
   * @param workspaceId - The ID of the workspace
   * @returns Promise with categories data
   */
  getCategories: async (
    workspaceId: string
  ): Promise<{ data: { categories: Category[] } }> => {
    try {
      const response: AxiosResponse<CategoriesResponse> =
        await axiosInstance.get(`/categories/${workspaceId}`);
      return { data: { categories: response.data.data } };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError;
    }
  },

  /**
   * Create a new category in a workspace
   * @param workspaceId - The ID of the workspace
   * @param categoryData - The category data without an ID
   * @returns Promise with the created category and success message
   */
  createCategory: async (
    workspaceId: string,
    categoryData: Omit<Category, 'id'>
  ): Promise<{ data: { category: Category; message: string } }> => {
    try {
      const response: AxiosResponse<CategoryResponse> =
        await axiosInstance.post(`/categories/${workspaceId}`, categoryData);
      return {
        data: { category: response.data.data, message: response.data.message },
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError;
    }
  },

  /**
   * Update an existing category
   * @param workspaceId - The ID of the workspace
   * @param categoryId - The ID of the category to update
   * @param categoryData - Partial category data to update
   * @returns Promise with the updated category and success message
   */
  updateCategory: async (
    workspaceId: string,
    categoryId: string,
    categoryData: Partial<Omit<Category, 'id'>>
  ): Promise<{ data: { category: Category; message: string } }> => {
    try {
      const response: AxiosResponse<CategoryResponse> = await axiosInstance.put(
        `/categories/${workspaceId}/${categoryId}`,
        categoryData
      );
      return {
        data: { category: response.data.data, message: response.data.message },
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError;
    }
  },

  /**
   * Delete a category
   * @param workspaceId - The ID of the workspace
   * @param categoryId - The ID of the category to delete
   * @returns Promise with success status
   */
  deleteCategory: async (
    workspaceId: string,
    categoryId: string
  ): Promise<{ data: { success: boolean; message?: string } }> => {
    try {
      const response: AxiosResponse<{ message: string }> =
        await axiosInstance.delete(`/categories/${workspaceId}/${categoryId}`);
      return {
        data: {
          success: true,
          message: response.data.message,
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError;
    }
  },
};
