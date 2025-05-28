import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';

import {
  fetchAdminDashboard,
  refreshAdminDashboard,
  clearDashboardErrors,
} from '@/store/slices/admin/adminDashboardSlice';

export const useAdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error, lastFetchTime } = useAppSelector(
    (state) => state.adminDashboard
  );

  // Auto-fetch data on mount if not already loaded or stale
  useEffect(() => {
    const STALE_TIME = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    if (!data || !lastFetchTime || now - lastFetchTime > STALE_TIME) {
      dispatch(fetchAdminDashboard());
    }
  }, [dispatch, data, lastFetchTime]);

  // Refetch function
  const refetch = useCallback(() => {
    dispatch(refreshAdminDashboard());
  }, [dispatch]);

  // Clear errors function
  const clearErrors = useCallback(() => {
    dispatch(clearDashboardErrors());
  }, [dispatch]);

  // Check if data is stale
  const isDataStale = useCallback(() => {
    const STALE_TIME = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    return !lastFetchTime || now - lastFetchTime > STALE_TIME;
  }, [lastFetchTime]);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearErrors,
    isDataStale: isDataStale(),
    lastFetchTime,
  };
};
