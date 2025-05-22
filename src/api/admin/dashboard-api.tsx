import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../axios-config';

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get(`admin/dashboard`);
      return response.data;
    },
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
