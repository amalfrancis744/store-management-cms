'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUp,
  BarChart2,
  Users,
  ShoppingBag,
  DollarSign,
  Building,
  Clock,
  Activity,
} from 'lucide-react';
import { VisitorChart } from '@/components/dashboard/visitor-chart';
import { useAdminDashboard } from '@/api/admin/dashboard-api';
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from 'react';

export function DashboardContent() {
  const { data, isLoading, error, refetch } = useAdminDashboard();
  const [activeTab, setActiveTab] = useState<'month' | 'week'>('month');

  // Refetch data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Calculate derived data with proper fallbacks
  const totalUsers =
    data?.data?.usersByRole?.reduce(
      (sum: any, role: { _count: { role: any } }) =>
        sum + (role?._count?.role || 0),
      0
    ) || 0;

  const totalOrders = data?.data?.recentOrders?.count || 0;
  const totalRevenue = data?.data?.revenue?.total || 0;
  const activeWorkspaces = data?.data?.workspaceStatus?.active || 0;
  const inactiveWorkspaces = data?.data?.workspaceStatus?.inactive || 0;
  const workspaceCount = data?.data?.revenue?.byWorkspace?.length || 0;
  const recentOrderCount = data?.data?.recentOrders?.orders?.length || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-red-600">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!data) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-700 mb-2">
          No Dashboard Data Available
        </h3>
        <p className="text-yellow-600 mb-4">Please try refreshing the page.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-bold">{totalUsers}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {data?.data?.usersByRole?.map(
                    (role: {
                      role:
                        | boolean
                        | Key
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      _count: { role: any };
                    }) => (
                      <div key={String(role.role)}>
                        {role.role}: {role?._count?.role || 0}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-bold">{totalOrders}</div>
                <div className="mt-1 text-sm text-gray-500">
                  Recent orders: {recentOrderCount}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-bold">
                  ${totalRevenue.toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  From {workspaceCount} workspace(s)
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Workspaces Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-bold">{activeWorkspaces}</div>
                <div className="mt-1 text-sm text-gray-500">
                  Inactive: {inactiveWorkspaces}
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <Building className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* User Signups Chart */}
        {/* <Card className="col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Signups</CardTitle>
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as 'month' | 'week')
                }
                className="mt-2"
              >
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {data?.data?.userSignupsOverTime?.length > 0 ? (
              <div className="h-64">
                <VisitorChart
                  data={data.data.userSignupsOverTime}
                  timeframe={activeTab}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <BarChart2 className="h-12 w-12 mb-2" />
                <p>No signup data available</p>
              </div>
            )}
          </CardContent>
        </Card> */}

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Products Section */}
              <div>
                <div className="text-sm text-gray-500 mb-2">
                  Most Popular Items
                </div>
                {data?.data?.topSellingProducts?.length > 0 ? (
                  data.data.topSellingProducts.map(
                    (
                      product: {
                        variantId: any;
                        variantName: any;
                        quantity: any;
                        _sum: { quantity: any };
                      },
                      index: number
                    ) => (
                      <div
                        key={product?.variantId || index}
                        className="mt-3 p-3 border rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {product?.variantName || `Product ${index + 1}`}
                          </span>
                          <span className="text-blue-600 font-bold">
                            {product?.quantity || 0} sold
                          </span>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No product data available
                  </div>
                )}
              </div>

              {/* Workspaces Section */}
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">
                  Most Active Workspaces
                </div>
                {data?.data?.mostActiveWorkspaces?.length > 0 ? (
                  data.data.mostActiveWorkspaces.map(
                    (
                      workspace: {
                        workspaceId: any;
                        workspaceName: any;
                        orderCount: any;
                        _count: { workspaceId: any };
                      },
                      index: number
                    ) => (
                      <div
                        key={workspace?.workspaceId || index}
                        className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Workspace #{workspace.workspaceName || index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="text-blue-600 font-semibold">
                          {workspace?.orderCount || 0} orders
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No workspace data available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
