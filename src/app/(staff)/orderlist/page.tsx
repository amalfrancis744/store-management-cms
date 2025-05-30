'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchStaffDashboard,
  changeOrderStatus,
  setSelectedOrder,
  clearOrderStatusError,
  clearDashboardError,
  updateOrderStatusOptimistic,
  revertOrderStatusUpdate,
  selectStaffDashboardData,
  selectStaffOrders,
  selectStaffStats,
  selectWorkspaceDetails,
  selectSelectedOrder,
  selectDashboardLoading,
  selectOrderStatusLoading,
  selectStaffErrors,
  Order,
  OrderItem,
} from '@/store/slices/staff/staffSlice';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { themeQuartz, iconSetMaterial } from 'ag-grid-community';
import { format } from 'date-fns';
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToastContainer, toast } from 'react-toastify';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom theme
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

// Status color mappings
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  PROCESSING: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  DELIVERY: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  DELIVERED: 'bg-green-100 text-green-800 hover:bg-green-200',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200',
};

// Define which statuses staff can select
const STAFF_SELECTABLE_STATUSES = ['DELIVERY', 'DELIVERED', 'CANCELLED'];

// Define status transition rules
const getSelectableStatuses = (currentStatus: string): string[] => {
  switch (currentStatus) {
    case 'PENDING':
    case 'PROCESSING':
      return ['DELIVERY', 'DELIVERED', 'CANCELLED'];
    case 'DELIVERY':
      return ['DELIVERED', 'CANCELLED'];
    case 'DELIVERED':
    case 'CANCELLED':
      return []; // No further changes allowed
    default:
      return [];
  }
};

export default function OrderListPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const workspaceId = useSelector((state: RootState) => state.auth.workspaceId);
  const dashboardData = useSelector(selectStaffDashboardData);
  const orders = useSelector(selectStaffOrders);
  const stats = useSelector(selectStaffStats);
  const workspaceDetails = useSelector(selectWorkspaceDetails);
  const selectedOrder = useSelector(selectSelectedOrder);
  const isDashboardLoading = useSelector(selectDashboardLoading);
  const isUpdatingOrderStatus = useSelector(selectOrderStatusLoading);
  const errors = useSelector(selectStaffErrors);

  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  // Fetch dashboard data on component mount or when workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchStaffDashboard(workspaceId));
    }
  }, [dispatch, workspaceId]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (errors.dashboard) {
      toast.error(errors.dashboard);
      dispatch(clearDashboardError());
    }
    if (errors.orderStatus) {
      toast.error(errors.orderStatus);
      dispatch(clearOrderStatusError());
    }
  }, [errors, dispatch]);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return 'Invalid Date';
    }
  }, []);

  // Handle back to dashboard
  const handleBackToDashboard = useCallback(() => {
    router.push('/staff');
  }, [router]);

  // Handle view order details
  const handleViewOrderDetails = useCallback(
    (order: Order) => {
      dispatch(setSelectedOrder(order));
      setIsOrderDetailsOpen(true);
    },
    [dispatch]
  );

  // Handle update order status
  const handleUpdateOrderStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      if (!workspaceId) {
        toast.error('Workspace ID is missing');
        return;
      }

      // Get current order to store original status for potential revert
      const currentOrder = orders.find((order) => order.id === orderId);
      const originalStatus = currentOrder?.status;

      if (!originalStatus) {
        toast.error('Unable to find order');
        return;
      }

      try {
        // Optimistic update
        dispatch(updateOrderStatusOptimistic({ orderId, newStatus }));

        // Dispatch the async action
        const result = await dispatch(
          changeOrderStatus({
            workspaceId,
            orderId,
            status: newStatus,
          })
        );

        if (changeOrderStatus.fulfilled.match(result)) {
          toast.success(result.payload.message);
          setIsOrderDetailsOpen(false);
        } else if (changeOrderStatus.rejected.match(result)) {
          // Revert optimistic update on error
          dispatch(revertOrderStatusUpdate({ orderId, originalStatus }));
          throw new Error(result.payload as string);
        }
      } catch (error: any) {
        // Revert optimistic update on error
        dispatch(revertOrderStatusUpdate({ orderId, originalStatus }));

        const errorMessage = error.message?.includes('CORS')
          ? 'CORS error: Unable to connect to the server. Please contact support.'
          : error.message || 'Failed to update order status';
        toast.error(errorMessage);
      }
    },
    [dispatch, workspaceId, orders]
  );

  // Close order details dialog
  const handleCloseOrderDetails = useCallback(() => {
    setIsOrderDetailsOpen(false);
    dispatch(setSelectedOrder(null));
  }, [dispatch]);

  // Refresh dashboard data
  const handleRefreshData = useCallback(() => {
    if (workspaceId) {
      dispatch(fetchStaffDashboard(workspaceId));
      toast.info('Refreshing data...');
    }
  }, [dispatch, workspaceId]);

  // Check if order status can be updated further
  const isStatusFinal = useCallback((status: string) => {
    return status === 'DELIVERED' || status === 'CANCELLED';
  }, []);

  // Get selectable statuses for the current order
  const getSelectableStatusesForOrder = useCallback((order: Order) => {
    return getSelectableStatuses(order.status);
  }, []);

  // Action cell renderer
  const ActionCellRenderer = useCallback(
    (props: any) => {
      const order = props.data;
      const selectableStatuses = getSelectableStatusesForOrder(order);
      const canUpdateStatus = selectableStatuses.length > 0;

      return (
        <div className="flex gap-2 items-center h-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewOrderDetails(order)}
                >
                  <Eye className="h-4 w-4 text-blue-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Order Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!canUpdateStatus ? (
            <div className="w-[120px] h-8 px-3 py-1 text-xs border rounded bg-gray-50 flex items-center">
              <span className="text-gray-500 truncate">{order.status}</span>
              <span className="ml-1 text-xs text-gray-400">(Final)</span>
            </div>
          ) : (
            <Select
              onValueChange={(value) =>
                handleUpdateOrderStatus(order.id, value)
              }
              value={order.status}
              disabled={isUpdatingOrderStatus}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(statusColors).map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    disabled={!selectableStatuses.includes(status)}
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      );
    },
    [
      handleViewOrderDetails,
      handleUpdateOrderStatus,
      isUpdatingOrderStatus,
      getSelectableStatusesForOrder,
    ]
  );

  // Column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Order ID',
        field: 'id',
        minWidth: 220,
        flex: 2,
        cellRenderer: (params: any) => {
          return (
            <div className="font-medium truncate" title={params.value}>
              #{params.value.substring(0, 8).toUpperCase()}
              <div className="text-xs text-gray-500">{params.value}</div>
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: any) => {
          const status = params.value;
          const badgeClass =
            statusColors[status] ||
            'bg-gray-100 text-gray-800 hover:bg-gray-200';
          return <Badge className={badgeClass}>{status}</Badge>;
        },
      },
      {
        headerName: 'Amount',
        field: 'totalAmount',
        minWidth: 120,
        flex: 1,
        valueFormatter: (params: any) => {
          return `$${params.value.toFixed(2)}`;
        },
      },
      {
        headerName: 'Date',
        field: 'placedAt',
        minWidth: 180,
        flex: 1.5,
        valueFormatter: (params: any) => {
          return formatDate(params.value);
        },
      },
      {
        headerName: 'Actions',
        minWidth: 220,
        flex: 1,
        cellRenderer: ActionCellRenderer,
      },
    ],
    [ActionCellRenderer, formatDate]
  );

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Order Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isDashboardLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isDashboardLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          {workspaceDetails?.name && (
            <div className="text-sm text-gray-500">
              Workspace: {workspaceDetails.name}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.ordersToday || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.processingOrders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.completedOrders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">
              Successful Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.successfulDeliveries || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${(stats?.totalRevenue || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {isDashboardLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : errors.dashboard ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading orders: {errors.dashboard}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 rounded-md p-6 text-center">
          <p className="text-gray-600">No orders found for this workspace.</p>
        </div>
      ) : (
        <div className="ag-theme-alpine w-full h-[600px]">
          <AgGridReact
            ref={gridRef}
            theme={myTheme}
            rowData={orders}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            rowSelection="single"
            animateRows={true}
          />
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={handleCloseOrderDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-6">
                {/* Order header info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Order ID</h3>
                    <p className="text-sm">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Date Placed</h3>
                    <p className="text-sm">
                      {formatDate(selectedOrder.placedAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Status</h3>
                    <Badge
                      className={
                        statusColors[selectedOrder.status] || 'bg-gray-100'
                      }
                    >
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Total Amount</h3>
                    <p className="text-sm font-medium">
                      ${selectedOrder.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order items */}
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Item
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.variant.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                SKU: {item.variant.sku}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.variant.color} / {item.variant.size}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${(item.quantity * item.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Status Update */}
                <div>
                  <h3 className="font-semibold mb-2">Update Status</h3>
                  {isStatusFinal(selectedOrder.status) ? (
                    <div className="p-3 bg-gray-50 border rounded text-gray-600 text-sm">
                      This order has reached the final status{' '}
                      <span className="font-medium">
                        {selectedOrder.status}
                      </span>
                      . No further status updates are allowed.
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(statusColors).map((status) => {
                        const selectableStatuses = getSelectableStatuses(
                          selectedOrder.status
                        );
                        const isCurrentStatus = selectedOrder.status === status;
                        const isSelectable =
                          selectableStatuses.includes(status);

                        return (
                          <Button
                            key={status}
                            variant={isCurrentStatus ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              handleUpdateOrderStatus(selectedOrder.id, status)
                            }
                            className={
                              isCurrentStatus ? '' : 'hover:bg-gray-100'
                            }
                            disabled={
                              isUpdatingOrderStatus ||
                              !isSelectable ||
                              isCurrentStatus
                            }
                          >
                            {status}
                            {isCurrentStatus && ' (Current)'}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseOrderDetails}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
