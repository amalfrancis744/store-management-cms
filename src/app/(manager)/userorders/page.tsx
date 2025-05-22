'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCustomerOrders,
  selectAllOrders,
  selectOrderStatus,
  selectOrderError,
  assignStaffToOrder,
} from '@/store/slices/manager/customerOrderSlice';
import type { AppDispatch, RootState } from '@/store';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
import { format } from 'date-fns';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { themeQuartz, iconSetMaterial } from 'ag-grid-community';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import { Eye, User, Search, Filter, Calendar } from 'lucide-react';
import { useStaffMembers } from '@/api/manager/getAllStaff-api';
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

// Type definitions
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variant: {
    title?: string;
    sku?: string;
    color?: string;
    size?: string;
  };
}

interface Address {
  address: string;
  street?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  email: string;
}

interface Order {
  id: string;
  placedAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: Address;
  items: OrderItem[];
  assignedTo?: string;
}

// Status and payment color mappings
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  PROCESSING: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 hover:bg-green-200',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

const OrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectAllOrders);
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);
  const workspaceId = useSelector((state: RootState) => state.auth.workspaceId);

  const gridRef = useRef<AgGridReact>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('all');

  const { data: staffMembers = [] } = workspaceId
    ? useStaffMembers(workspaceId)
    : { data: [] };

  // Fetch orders when workspaceId changes or after staff assignment
  const fetchOrders = () => {
    if (workspaceId) {
      dispatch(fetchCustomerOrders(workspaceId));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dispatch, workspaceId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.user &&
          order.user.firstName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (order.user &&
          order.user.email?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(order.status);
      const matchesPaymentMethod =
        paymentMethodFilter.length === 0 ||
        paymentMethodFilter.includes(order.paymentMethod);

      let matchesDate = true;
      const orderDate = new Date(order.placedAt);
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

  // Status badge renderer
  const StatusBadgeRenderer = (props: any) => {
    const status = props.value;
    const badgeClass =
      statusColors[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';

    return <Badge className={badgeClass}>{status}</Badge>;
  };

  // Payment status renderer
  const PaymentRenderer = (props: any) => {
    const { paymentMethod, paymentStatus } = props.data;
    const statusClass =
      paymentStatusColors[paymentStatus] || 'bg-gray-100 text-gray-800';

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
  };

  // Staff assignment renderer
  const StaffRenderer = (props: any) => {
    const assignedStaffId = props.value;

    if (!assignedStaffId) {
      return <span className="text-gray-400">Not assigned</span>;
    }

    const staffMember = staffMembers.find(
      (staff) => staff.id === assignedStaffId
    );

    return (
      <div className="flex items-center">
        <div className="flex items-center justify-center mr-2">
          {staffMember?.email}
        </div>
      </div>
    );
  };

  // Action buttons renderer
  const ActionsRenderer = (props: any) => {
    const order = props.data;

    return (
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedOrder(order);
                  setIsDetailsDialogOpen(true);
                }}
              >
                <Eye className="h-4 w-4 text-blue-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedOrder(order);
                  setIsAssignDialogOpen(true);
                }}
              >
                <User className="h-4 w-4 text-purple-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assign Staff</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  // Currency renderer
  const CurrencyRenderer = (props: any) => {
    return (
      <div className="font-medium">
        ${Number.parseFloat(props.value).toFixed(2)}
      </div>
    );
  };

  // Order ID renderer
  const OrderIdRenderer = (props: any) => {
    return <div className="font-mono text-xs">{props.value}</div>;
  };

  // Setup the AG Grid column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Order ID',
        field: 'id',
        sort: 'desc',
        cellRenderer: OrderIdRenderer,
        width: 220,
        minWidth: 150,
        flex: 1,
      },
      {
        headerName: 'Date',
        field: 'placedAt',
        valueFormatter: (params: any) =>
          format(new Date(params.value), 'MMM dd, yyyy'),
        width: 150,
        minWidth: 120,
        flex: 1,
      },
      {
        headerName: 'Customer',
        field: 'user.firstName',
        width: 180,
        minWidth: 120,
        flex: 1.5,
      },
      {
        headerName: 'Total',
        field: 'totalAmount',
        cellRenderer: CurrencyRenderer,
        width: 120,
        minWidth: 100,
        flex: 1,
        sort: 'desc',
      },
      {
        headerName: 'Status',
        field: 'status',
        cellRenderer: StatusBadgeRenderer,
        width: 130,
        minWidth: 110,
        flex: 1,
        filter: true,
      },
      {
        headerName: 'Payment',
        cellRenderer: PaymentRenderer,
        width: 150,
        minWidth: 120,
        flex: 1,
      },
      {
        headerName: 'Staff',
        field: 'assignedTo',
        cellRenderer: StaffRenderer,
        width: 160,
        minWidth: 130,
        flex: 1.2,
      },
      {
        headerName: 'Actions',
        cellRenderer: ActionsRenderer,
        width: 120,
        minWidth: 100,
        sortable: false,
        filter: false,
      },
    ],
    [staffMembers]
  );

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: true,
    }),
    []
  );

  const handleAssignStaff = async () => {
    if (selectedOrder && selectedStaffId && workspaceId) {
      try {
        await dispatch(
          assignStaffToOrder({
            workspaceId,
            orderId: selectedOrder.id,
            userId: selectedStaffId,
          })
        ).unwrap();

        // Refresh orders after successful assignment
        fetchOrders();
        setIsAssignDialogOpen(false);
        setSelectedStaffId('');
      } catch (error) {
        console.error('Failed to assign staff:', error);
      }
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handlePaymentMethodFilterChange = (value: string) => {
    setPaymentMethodFilter((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen max-h-[650px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative m-4"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 py-2 md:px-5 md:py-2">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-end justify-between gap-4 mb-3">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row gap-3 flex-1">
            <div className="relative w-full md:max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search orders by ID or customer..."
                className="pl-10 bg-gray-50 border-gray-200 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Order Status</span>
                    <span className="sm:hidden">Status</span>
                    {statusFilter.length > 0 && (
                      <span className="ml-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                        {statusFilter.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {Object.keys(statusColors).map((status) => (
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
                  <Button variant="outline" className="gap-2 h-10">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Payment</span>
                    <span className="sm:hidden">Pay</span>
                    {paymentMethodFilter.length > 0 && (
                      <span className="ml-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                        {paymentMethodFilter.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {['CASH', 'STRIPE', 'CREDIT_CARD', 'PAYPAL'].map((method) => (
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
                <SelectTrigger className="w-[140px] sm:w-[180px] h-10">
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
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">Manage and track customer orders</p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium text-gray-600">
              No orders found
            </h3>
            <p className="text-gray-500 mt-2">
              There are no orders matching your current filters
            </p>
          </div>
        ) : (
          <div
            className="ag-theme-alpine rounded-lg overflow-hidden border border-gray-200"
            style={{ height: '650px', width: '100%' }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={filteredOrders}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              theme={myTheme}
              paginationPageSize={10}
              domLayout="normal"
              rowHeight={48}
              headerHeight={48}
              suppressCellFocus={true}
              suppressRowHoverHighlight={false}
              suppressMovableColumns={true}
              enableCellTextSelection={true}
              popupParent={document.body}
              rowClass="hover:bg-gray-50"
            />
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl">Order Details</DialogTitle>
            <DialogDescription>
              Order ID: <span className="font-mono">{selectedOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Order Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StatusBadgeRenderer value={selectedOrder.status} />
                      <p className="text-xs text-gray-500 mt-2">
                        Created at {formatDate(selectedOrder.placedAt)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={
                            paymentStatusColors[selectedOrder.paymentStatus] ||
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {selectedOrder.paymentStatus}
                        </Badge>
                        <p className="text-sm font-medium mt-1">
                          Method: {selectedOrder.paymentMethod}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p>{selectedOrder?.shippingAddress?.address}</p>
                        {selectedOrder?.shippingAddress?.street && (
                          <p>{selectedOrder?.shippingAddress?.street}</p>
                        )}
                        <p>
                          {selectedOrder?.shippingAddress?.city}
                          {selectedOrder?.shippingAddress?.region &&
                            `, ${selectedOrder?.shippingAddress?.region}`}
                          {selectedOrder?.shippingAddress?.postalCode &&
                            ` ${selectedOrder.shippingAddress?.postalCode}`}
                        </p>
                        <p>{selectedOrder?.shippingAddress?.country}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Assignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOrder.assignedTo ? (
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                            {staffMembers
                              .find((s) => s.id === selectedOrder.assignedTo)
                              ?.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {
                                staffMembers.find(
                                  (s) => s.id === selectedOrder.assignedTo
                                )?.firstName
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              {
                                staffMembers.find(
                                  (s) => s.id === selectedOrder.assignedTo
                                )?.email
                              }
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            No staff member assigned
                          </p>
                          <Button
                            size="sm"
                            onClick={() => {
                              setIsDetailsDialogOpen(false);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            Assign
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-lg">{item.quantity}x</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.variant?.title || 'Product Variant'}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                              {item.variant.sku && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                  SKU: {item.variant.sku}
                                </span>
                              )}
                              {item.variant.color && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                  Color: {item.variant.color}
                                </span>
                              )}
                              {item.variant.size && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                  Size: {item.variant.size}
                                </span>
                              )}
                            </div>
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

                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Subtotal</span>
                        <span className="font-medium">
                          ${(selectedOrder.totalAmount * 0.9).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="font-medium">Tax</span>
                        <span className="font-medium">
                          ${(selectedOrder.totalAmount * 0.1).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 text-lg">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">
                          ${selectedOrder.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Staff to Order</DialogTitle>
            <DialogDescription>
              Select a staff member to handle this order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Order #{selectedOrder?.id?.substring(0, 8).toUpperCase()}
              </h4>

              <Select
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center">
                        <span>{staff.firstName}</span>
                        <span className="text-gray-500 text-xs ml-2">
                          ({staff.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setSelectedStaffId('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignStaff} disabled={!selectedStaffId}>
              Assign Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
