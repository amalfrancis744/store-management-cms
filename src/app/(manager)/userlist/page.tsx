'use client';
import { useState, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useStaffMembers } from '@/api/manager/getAllStaff-api';
import { themeQuartz, iconSetMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { format } from 'date-fns';

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

// Interface definitions based on provided response
interface Address {
  id: string;
  address: string;
  street?: string | null;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  country: string;
}

interface PaymentDetails {
  currency: string;
  amountPaid: number;
  paymentIntentId: string;
  stripeSessionId: string;
}

interface Order {
  id: string;
  userId: string;
  shippingAddressId: string;
  billingAddressId: string;
  workspaceId: number;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  status: string;
  notes?: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  stripeSessionId?: string | null;
  paidAt?: string | null;
  paymentDetails?: PaymentDetails | null;
  assignedTo?: string | null;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;
  termsAccepted: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  isAvailable: boolean;
  profileImageUrl?: string | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  locationId?: string | null;
  isDeleted: boolean;
  assignedOrders: Order[];
  password: string;
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

export default function UserListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const workspaceId = useSelector((state: RootState) => state.auth.workspaceId);
  const {
    data: staffMembers = [],
    isLoading,
    error,
  } = workspaceId
    ? useStaffMembers(workspaceId)
    : { data: [], isLoading: false, error: null };

  console.log('Staff Members:', staffMembers);

  const gridRef = useRef<AgGridReact>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Available status options
  const statusOptions = ['ACTIVE', 'INACTIVE'];

  // Get all orders (for assignment purposes)
  const allOrders = useMemo(() => {
    return staffMembers.flatMap((staff) => staff.assignedOrders);
  }, [staffMembers]);

  // Filter staff members
  const filteredStaffMembers = useMemo(() => {
    return staffMembers.filter((staff: any) => {
      const matchesSearch =
        staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(staff.status);

      return matchesSearch && matchesStatus;
    });
  }, [staffMembers, searchQuery, statusFilter]);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return 'Invalid Date';
    }
  }, []);

  // Column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Name',
        flex: 2,
        minWidth: 200,
        valueGetter: (params: any) =>
          `${params.data.firstName} ${params.data.lastName}`,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center gap-3">
              {params.data.profileImageUrl ? (
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={params.data.profileImageUrl}
                    alt={`${params.data.firstName} ${params.data.lastName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <span className="text-xs">
                    {params.data.firstName[0]}
                    {params.data.lastName[0]}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium">{`${params.data.firstName} ${params.data.lastName}`}</div>
                <div className="text-xs text-gray-500">{params.data.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => {
          const status = params.value;
          const badgeClass =
            status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800';
          return (
            <span className={`px-2 py-1 rounded-full text-xs ${badgeClass}`}>
              {status}
            </span>
          );
        },
      },
      {
        headerName: 'Assigned Orders',
        flex: 1,
        minWidth: 150,
        valueGetter: (params: any) =>
          params.data.assignedOrders.length.toString(),
      },

      {
        headerName: 'Joined',
        field: 'createdAt',
        flex: 1,
        minWidth: 150,
        valueFormatter: (params: any) =>
          new Date(params.value).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
      },
      {
        headerName: 'Actions',
        width: 150,
        cellRenderer: (params: any) => {
          const staff = params.data;
          return (
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedStaff(staff);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Orders</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(staff)}
                    >
                      {staff.status === 'ACTIVE' ? (
                        <ToggleLeft className="h-4 w-4 text-red-500" />
                      ) : (
                        <ToggleRight className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {staff.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },
    ],
    []
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

  // Mock toggle status action (replace with actual API call)
  const handleToggleStatus = useCallback(
    async (staff: StaffMember) => {
      if (
        !window.confirm(
          `Are you sure you want to ${
            staff.status === 'ACTIVE' ? 'deactivate' : 'activate'
          } ${staff.firstName} ${staff.lastName}?`
        )
      ) {
        return;
      }

      try {
        // Replace with actual API call
        console.log(
          `Toggling status for ${staff.id} to ${
            staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
          }`
        );
      } catch (error) {
        setErrorMessage('Failed to toggle staff status');
      }
    },
    [workspaceId]
  );

  // Mock assign order action (replace with actual API call)
  const handleAssignOrder = useCallback(
    async (orderId: string) => {
      if (!selectedStaff || !orderId || !workspaceId) return;

      try {
        setIsAssignDialogOpen(false);
        setSelectedOrderId('');
        setSelectedStaff(null);
        // Refresh staff members
        // Note: Implement actual Redux action or refetch
      } catch (error) {
        setErrorMessage('Failed to assign order');
      }
    },
    [selectedStaff, workspaceId]
  );

  // Handle status filter changes
  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  // Status badge renderer for orders
  const StatusBadgeRenderer = useCallback(({ value }: { value: string }) => {
    const badgeClass =
      statusColors[value] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    return <Badge className={badgeClass}>{value}</Badge>;
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || errorMessage) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative m-4"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">
          {' '}
          {error?.message || errorMessage}
        </span>
        <Button
          className="mt-2"
          onClick={() => {
            setErrorMessage('');
            // Refetch staff members if needed
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 py-2 md:px-5 md:py-2">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Staff Management
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search staff members..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by Status
                  {statusFilter.length > 0 && (
                    <span className="ml-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                      {statusFilter.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {statusOptions.map((status) => (
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
          </div>
        </div>

        {filteredStaffMembers.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-medium text-gray-600">
              No staff members found
            </h3>
            <p className="text-gray-500 mt-2">
              There are no staff members matching your current filters
            </p>
          </div>
        ) : (
          <div
            className="ag-theme-quartz rounded-lg overflow-hidden border border-gray-200"
            style={{ height: '500px', width: '100%' }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={filteredStaffMembers}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
              theme={myTheme}
              domLayout="normal"
              rowHeight={60}
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

      {/* Staff Orders Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl">
              Orders Assigned to {selectedStaff?.firstName}{' '}
              {selectedStaff?.lastName}
            </DialogTitle>
            <DialogDescription>
              Email: <span className="font-mono">{selectedStaff?.email}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
              <div className="space-y-6">
                {selectedStaff.assignedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No orders assigned to this staff member.
                    </p>
                  </div>
                ) : (
                  selectedStaff.assignedOrders.map((order) => (
                    <Card key={order.id} className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Order #{order.id.substring(0, 8).toUpperCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium">Status</p>
                            <StatusBadgeRenderer value={order.status} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Total</p>
                            <p className="font-medium">
                              ${order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Placed At</p>
                            <p className="text-sm">
                              {formatDate(order.placedAt)}
                            </p>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">Notes</p>
                            <p className="text-sm text-gray-500">
                              {order.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
                <div className="flex justify-end">
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

      {/* Assign Order Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Order to Staff</DialogTitle>
            <DialogDescription>
              Select an order to assign to {selectedStaff?.firstName}{' '}
              {selectedStaff?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Select
                value={selectedOrderId}
                onValueChange={setSelectedOrderId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {allOrders
                    .filter((order) => !order.assignedTo) // Show only unassigned orders
                    .map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        <div className="flex items-center">
                          <span>
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className="text-gray-500 text-xs ml-2">
                            (${order.totalAmount.toFixed(2)})
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
                setSelectedOrderId('');
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedOrderId}
              onClick={() => handleAssignOrder(selectedOrderId)}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
