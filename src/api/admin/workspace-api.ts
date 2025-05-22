import axiosInstance from '../axios-config';
import { Workspace } from '@/types';

function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}

export const workspaceAPI = {
  // Get all workspaces
  getWorkspaces: async () => {
    try {
      const response = await axiosInstance.get('/workspaces/admin');
      return { data: { workspaces: response.data.data } };
    } catch (error) {
      throw error;
    }
  },

  // Create a new workspace with image upload support
  createWorkspace: async (workspaceData: Omit<Workspace, 'id'>) => {
    try {
      // Create FormData object for multipart/form-data request
      const formData = new FormData();

      // Add text fields
      formData.append('name', workspaceData.name);
      formData.append('description', workspaceData.description || '');
      formData.append('openingTime', workspaceData.openingTime);
      formData.append('closingTime', workspaceData.closingTime);

      // Handle images
      if (workspaceData.images && workspaceData.images.length > 0) {
        workspaceData.images.forEach((image: any) => {
          // If the image is a base64 string from the ImageUpload component
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
            const file = new File([blob], `workspace-image-${Date.now()}.jpg`, {
              type: mimeType,
            });
            formData.append('images', file);
          }
          // If it's already a File object
          else if (image instanceof File) {
            formData.append('images', image);
          }
          // If it's a URL string from an existing record
          else if (typeof image === 'string') {
            formData.append('existingImages', image);
          }
        });
      }

      const response = await axiosInstance.post('/workspaces', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        data: { workspace: response.data.data, message: response.data.message },
      };
    } catch (error) {
      throw error;
    }
  },

  // Update an existing workspace with image upload support
  updateWorkspace: async (
    workspaceId: string,
    workspaceData: Partial<Workspace>
  ) => {
    try {
      const formData = new FormData();

      // Always include these fields
      formData.append('name', workspaceData.name || '');
      formData.append('description', workspaceData.description || '');
      formData.append('openingTime', workspaceData.openingTime || '09:00');
      formData.append('closingTime', workspaceData.closingTime || '17:00');

      // Handle images - separate existing images from new uploads
      if (workspaceData.images) {
        workspaceData.images.forEach((image: any, index) => {
          if (typeof image === 'string' && image.startsWith('data:')) {
            // Convert base64 to File
            const blob = dataURItoBlob(image);
            const file = new File([blob], `image-${index}.jpg`, {
              type: blob.type,
            });
            formData.append('images', file);
          } else if (typeof image === 'string') {
            formData.append('existingImages', image);
          } else if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }

      const response = await axiosInstance.put(
        `/workspaces/${workspaceId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data; // Return the entire response data
    } catch (error) {
      throw error;
    }
  },

  // Delete a workspace
  deleteWorkspace: async (workspaceId: string) => {
    try {
      await axiosInstance.delete(`/workspaces/${workspaceId}`);
      return { data: { success: true } };
    } catch (error) {
      throw error;
    }
  },

  // Get a single workspace by ID
  getWorkspaceById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/workspaces/${id}`);
      return { data: { workspace: response.data.data } };
    } catch (error) {
      throw error;
    }
  },
};
