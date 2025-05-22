'use client';

import { useStaffDashboard } from '@/api/staff/getStaffOrderById-api';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpRight, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StaffPageDashboard() {
  const dispatch = useDispatch();
  const workspaceId: any = useSelector(
    (state: RootState) => state.auth.workspaceId
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const [localWorkspaceId, setLocalWorkspaceId] = useState(workspaceId || '');

  // Use the user's workspaceId if available in the user object
  useEffect(() => {
    if (!workspaceId && user?.workspaceId) {
      // Update Redux store with the workspaceId from user object
      dispatch({
        type: 'auth/setWorkspaceId',
        payload: user.workspaceId,
      });
      setLocalWorkspaceId(user.workspaceId);
    } else if (workspaceId) {
      setLocalWorkspaceId(workspaceId);
    }
  }, [workspaceId, user, dispatch]);

  const { data, isLoading, error } = useStaffDashboard(localWorkspaceId, {
    // Only fetch when workspaceId is available
    enabled: Boolean(localWorkspaceId),
  });

  // Show loading state when waiting for workspaceId or data
  if (!localWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Preparing dashboard...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  if (!data?.stats) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-700 mb-2">
          No Stats Data Available
        </h3>
        <p className="text-yellow-600">
          The dashboard stats are currently unavailable.
        </p>
      </div>
    );
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  // Calculate today's orders if assignedOrders exists
  const todaysOrders =
    data.assignedOrders?.filter(
      (order: { placedAt: string }) => order.placedAt.split('T')[0] === today
    ).length || 0;

  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {data.stats.totalOrders}
              </h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <span>{todaysOrders} orders today</span>
          </div>
        </div>

        {/* Processing Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Processing</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {data.stats.processingOrders}
              </h3>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <span>Needs attention</span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {data.stats.completedOrders}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-green-500">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>{data.stats.successfulDeliveries} successful deliveries</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                ${data.stats.totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <svg
                className="h-6 w-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <span>From {data.stats.totalOrders} orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
