'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchUserOrders,
  cancelOrder,
  setCurrentOrder,
  clearCurrentOrder,
} from '@/store/slices/customer/orderSlice';
import { themeQuartz, iconSetMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Eye, Search, Filter, Ban, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  accentColor: '#6366f1',
  borderRadius: 4,
  cellTextColor: '#040B09',
  fontFamily: 'inherit',
  fontSize: 14,
  headerBackgroundColor: '#F1F2F2',
  headerFontWeight: 600,
  wrapperBorderRadius: 8,
});

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-orange-100 text-orange-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

// Utility function to check if order is at least 8 hours old . the user can cancel it before 8 hours
const isOrderCancellable = (createdAt: string) => {
  const orderDate = new Date(createdAt);
  const now = new Date();
  const hoursDifference =
    (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60); // Convert to hours
  return hoursDifference <= 8; // True if 8 or more hours have passed
};

export default function OrderManagement() {
  const { activeWorkspace } = useSelector(
    (state: RootState) => state.workspace
  );
  const workspaceId: any = activeWorkspace;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);

  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id;

  const { orders, isLoading } = useAppSelector((state) => {
    const userOrders = userId ? state.orders.orders[userId] : null;
    return {
      orders: Array.isArray(userOrders) ? userOrders : [],
      isLoading: state.orders.status === 'loading',
    };
  });

  const { currentOrder } = useAppSelector((state) => state.orders);

  const [showViewDialog, setShowViewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserOrders(userId));
    }
  }, [userId, dispatch]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.user &&
          order.user.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (order.user &&
          order.user.lastName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (order.user &&
          order.user.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(order.status);
      const matchesPaymentMethod =
        paymentMethodFilter.length === 0 ||
        paymentMethodFilter.includes(order.paymentMethod);

      let matchesDate = true;
      const orderDate = new Date(order.createdAt);
      const now = new Date();

      if (dateFilter === 'today') {
        matchesDate =
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === 'month') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = orderDate >= thirtyDaysAgo;
      }

      return (
        matchesSearch && matchesStatus && matchesPaymentMethod && matchesDate
      );
    });
  }, [orders, searchQuery, statusFilter, paymentMethodFilter, dateFilter]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Order ID',
        field: 'id',
        width: 240,
        cellRenderer: (params: any) => {
          return <div className="font-mono text-xs">{params.value}</div>;
        },
      },
      {
        headerName: 'Date',
        field: 'createdAt',
        flex: 1,
        minWidth: 130,
        cellRenderer: (params: any) => {
          return format(new Date(params.value), 'MMM dd, yyyy');
        },
      },
      {
        headerName: 'Total',
        field: 'totalAmount',
        flex: 1,
        minWidth: 100,
        cellRenderer: (params: any) => {
          return <div className="font-medium">${params.value.toFixed(2)}</div>;
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => {
          const statusClass =
            statusColors[params.value as keyof typeof statusColors] ||
            'bg-gray-100 text-gray-800';
          return (
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${statusClass}`}
            >
              {params.value}
            </div>
          );
        },
      },
      {
        headerName: 'Payment',
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => {
          const { paymentMethod, paymentStatus } = params.data;
          const statusClass =
            paymentStatusColors[
              paymentStatus as keyof typeof paymentStatusColors
            ] || 'bg-gray-100 text-gray-800';
          return (
            <div>
              <div className="text-xs text-gray-500">{paymentMethod}</div>
              <div
                className={`mt-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${statusClass}`}
              >
                {paymentStatus}
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Actions',
        width: 120,
        cellRenderer: (params: any) => {
          const isCancellable = isOrderCancellable(params.data.createdAt);
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleView(params.data)}
              >
                <Eye className="h-4 w-4 text-blue-500" />
              </Button>
              {params.data.status !== 'CANCELLED' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCancel(params.data.id)}
                  disabled={!isCancellable} // Disable button if not cancellable
                >
                  <Ban className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const handleView = (order: any) => {
    dispatch(setCurrentOrder(order));
    setShowViewDialog(true);
  };

  const handleCancel = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      alert('Order not found.');
      return;
    }

    if (!isOrderCancellable(order.createdAt)) {
      alert(
        'This order cannot be cancelled as it was created less than 8 hours ago.'
      );
      return;
    }

    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder(orderId));
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handlePaymentMethodFilterChange = (method: string) => {
    setPaymentMethodFilter((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const handleCloseViewDialog = () => {
    setShowViewDialog(false);
    dispatch(clearCurrentOrder());
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  if (!userId) {
    return (
      <div className="flex justify-center p-12">
        <p>Please log in to view your orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search orders by ID..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Order Status
                  {statusFilter.length > 0 && (
                    <span className="ml-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                      {statusFilter.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {[
                  'PENDING',
                  'PROCESSING',
                  'CONFIRMED',
                  'SHIPPED',
                  'DELIVERED',
                  'CANCELLED',
                ].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Payment
                  {paymentMethodFilter.length > 0 && (
                    <span className="ml-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                      {paymentMethodFilter.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {['CASH', 'STRIPE'].map((method) => (
                  <DropdownMenuCheckboxItem
                    key={method}
                    checked={paymentMethodFilter.includes(method)}
                    onCheckedChange={() =>
                      handlePaymentMethodFilterChange(method)
                    }
                  >
                    {method}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by date" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-gray-500">View and manage your order history</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">
              No orders found
            </h3>
            <p className="text-gray-500 mt-2">
              You haven't placed any orders yet
            </p>
            <Button className="mt-4" onClick={() => router.push('/products')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div
            className="ag-theme-quartz"
            style={{ height: '650px', width: '100%' }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={filteredOrders}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
              theme={myTheme}
              domLayout="normal"
            />
          </div>
        )}
      </div>

      <Dialog open={showViewDialog} onOpenChange={handleCloseViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Order Details</DialogTitle>
            <DialogDescription>
              Order ID: <span className="font-mono">{currentOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>

          {currentOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      className={
                        statusColors[
                          currentOrder.status as keyof typeof statusColors
                        ]
                      }
                    >
                      {currentOrder.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">
                      Created at {formatDate(currentOrder.createdAt)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={
                          paymentStatusColors[
                            currentOrder.paymentStatus as keyof typeof paymentStatusColors
                          ]
                        }
                      >
                        {currentOrder.paymentStatus}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        Method: {currentOrder.paymentMethod}
                      </p>
                      {currentOrder.paidAt && (
                        <p className="text-xs text-gray-500">
                          Paid at {formatDate(currentOrder.paidAt)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${currentOrder.totalAmount.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentOrder.shippingAddress ? (
                      <div className="text-sm">
                        <p>{currentOrder.shippingAddress.address}</p>
                        {currentOrder.shippingAddress.street && (
                          <p>{currentOrder.shippingAddress.street}</p>
                        )}
                        <p>
                          {currentOrder.shippingAddress.city}
                          {currentOrder.shippingAddress.region &&
                            `, ${currentOrder.shippingAddress.region}`}
                          {currentOrder.shippingAddress.postalCode &&
                            ` ${currentOrder.shippingAddress.postalCode}`}
                        </p>
                        <p>{currentOrder.shippingAddress.country}</p>
                      </div>
                    ) : (
                      <p className="text-sm">No shipping address provided</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {currentOrder.notes || 'No notes provided'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {currentOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 border rounded-md"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-lg">{item.quantity}x</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.variant?.title || 'Product Variant'}
                            </p>
                            {item.variant && (
                              <div className="flex gap-2 text-xs text-gray-500">
                                {item.variant.sku && (
                                  <span>SKU: {item.variant.sku}</span>
                                )}
                                {item.variant.color && (
                                  <span>Color: {item.variant.color}</span>
                                )}
                                {item.variant.size && (
                                  <span>Size: {item.variant.size}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${item.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">
                        ${currentOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseViewDialog}>
                  Close
                </Button>
                {currentOrder.status !== 'CANCELLED' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleCancel(currentOrder.id);
                      handleCloseViewDialog();
                    }}
                    disabled={!isOrderCancellable(currentOrder.createdAt)} // Disable button if not cancellable
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
