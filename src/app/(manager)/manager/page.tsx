'use client';

import { BarChart3, Package, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useEffect, useState } from 'react';
import { fetchWorkspaceById } from '@/store/slices/admin/workspaceSlice';
import { format } from 'date-fns';

export default function Manager() {
  const [isMounted, setIsMounted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const workspaceId = useSelector((state: RootState) => state.auth.workspaceId);
  const { currentWorkspace, isLoading, error } = useSelector(
    (state: RootState) => state.workspace
  );

  useEffect(() => {
    setIsMounted(true);
    if (workspaceId && !currentWorkspace && !isLoading) {
      dispatch(fetchWorkspaceById(workspaceId));
    }
  }, [dispatch, workspaceId, currentWorkspace, isLoading]);

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        Error: {error}
      </div>
    );
  }

  // Show loading state while waiting for data
  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading workspace data...
      </div>
    );
  }

  const { workspaceInfo, inventorySummary, ordersSummary } = currentWorkspace;

  const stats = {
    totalOrders: ordersSummary?.recentOrdersCount ?? 0,
    totalProducts: inventorySummary?.totalProducts ?? 0,
    totalCategories: inventorySummary?.totalCategories ?? 0,
    revenue:
      ordersSummary?.recentOrders?.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      ) ?? 0,
  };

  const storeInfo = {
    name: workspaceInfo?.name ?? 'Workspace',
    image: workspaceInfo?.images?.[0] ?? '/placeholder.svg?height=80&width=80',
    status: workspaceInfo?.isActive ? 'Active' : 'Inactive',
    description: workspaceInfo?.description ?? 'No description available',
    createdAt: workspaceInfo?.createdAt
      ? format(new Date(workspaceInfo.createdAt), 'MMM dd, yyyy')
      : 'Unknown',
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Recent orders this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {inventorySummary?.lowStockProducts ?? 0} items low in stock
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categories
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCategories}
                </div>
                <p className="text-xs text-muted-foreground">
                  Product categories
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.revenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From recent orders
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Overview</CardTitle>
                  <CardDescription>
                    View your workspace performance and information at a glance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="flex items-center gap-4">
                    {storeInfo.image && (
                      <div className="h-24 w-24 overflow-hidden rounded-md">
                        <Image
                          src={storeInfo.image}
                          alt={storeInfo.name}
                          width={1200}
                          height={96}
                          className="h-full w-full rounded-md border object-cover"
                        />
                      </div>
                    )}
                    <div className="grid gap-1">
                      <h3 className="font-semibold">{storeInfo.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {storeInfo.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge
                          variant={
                            storeInfo.status === 'Active'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {storeInfo.status}
                        </Badge>
                        <span
                          className="text-muted-foreground"
                          suppressHydrationWarning
                        >
                          Created: {storeInfo.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Products
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {inventorySummary?.totalProducts ?? 0} total
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Categories
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {inventorySummary?.totalCategories ?? 0} total
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Low Stock
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {inventorySummary?.lowStockProducts ?? 0} items
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Status
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {storeInfo.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    You have {ordersSummary?.recentOrdersCount ?? 0} recent
                    orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ordersSummary &&
                    ordersSummary.recentOrders &&
                    ordersSummary?.recentOrders?.length > 0 ? (
                      ordersSummary.recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center gap-4 rounded-md border p-2"
                        >
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {order.user.firstName} {order.user.lastName}
                            </p>
                            <p
                              className="text-xs text-muted-foreground"
                              suppressHydrationWarning
                            >
                              ${order.totalAmount} •{' '}
                              {format(new Date(order.placedAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Badge
                            variant={
                              order.status === 'PENDING' ? 'outline' : 'default'
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No recent orders available.
                      </p>
                    )}

                    {ordersSummary &&
                    ordersSummary.pendingBills &&
                    ordersSummary?.pendingBills?.length > 0 ? (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="text-sm font-medium mb-2">
                          Pending Bills
                        </h3>
                        {ordersSummary.pendingBills.map((bill) => (
                          <div
                            key={bill.id}
                            className="flex items-center gap-4 rounded-md border p-2 mb-2"
                          >
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {bill.user.firstName}
                              </p>
                              <p
                                className="text-xs text-muted-foreground"
                                suppressHydrationWarning
                              >
                                ${bill.totalAmount} •{' '}
                                {format(
                                  new Date(bill.createdAt),
                                  'MMM dd, yyyy'
                                )}
                              </p>
                            </div>
                            <Badge variant="secondary">PENDING</Badge>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
