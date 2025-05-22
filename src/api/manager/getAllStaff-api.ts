import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../axios-config';

interface StaffMember {
  assignedOrders: any;
  id: string;
  firstName: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export const staffAPI = {
  // Get all staff for a workspace
  getAllStaff: async (
    workspaceId: string
  ): Promise<ApiResponse<StaffMember[]>> => {
    try {
      console.log('Fetching staff members for workspace ID:', workspaceId);
      const response = await axiosInstance.get(
        `/orders/workspaces/${workspaceId}/staff`
      );
      return { data: response.data.data };
    } catch (error: any) {
      return {
        data: [],
        error: error.message || 'Failed to fetch staff members',
      };
    }
  },
};

// React Query hook
export const useStaffMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ['staff', workspaceId],
    queryFn: () => staffAPI.getAllStaff(workspaceId),
    select: (response) => response.data,
    enabled: !!workspaceId,
  });
};
