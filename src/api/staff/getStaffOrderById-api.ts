import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axios-config';

/**
 * @param {string} workspaceId
 * @param {string} userId
 * @param {object} options
 * @returns {object}
 */

export const useStaffDashboard = (workspaceId: string, options = {}) => {
  return useQuery({
    queryKey: ['staffDashboard', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return null;
      }
      const response = await axiosInstance.get(
        `staff/${workspaceId}/dashboard`
      );
      return response.data;
    },
    // Disable automatic fetching until workspaceId is available
    enabled: Boolean(workspaceId),
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// change the status of the order

export const useChangeOrderStatus = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      workspaceId,
      orderId,
      status,
    }: {
      workspaceId: string;
      orderId: string;
      status: string;
    }) => {
      if (!workspaceId || !orderId || !status) {
        throw new Error('Workspace ID, Order ID, and Status are required');
      }
      try {
        const response = await axiosInstance.patch(
          `orders/workspaces/${workspaceId}/orders/${orderId}/status`,
          { status }
        );
        return response.data;
      } catch (error: any) {
        throw new Error(`Failed to update order status: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate the staff dashboard query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['staffDashboard', variables.workspaceId],
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};
