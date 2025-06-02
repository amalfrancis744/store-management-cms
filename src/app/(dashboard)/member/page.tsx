'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAllMembers,
  removeMember,
  updateMember,
  selectMembers,
  selectMembersLoading,
  selectMembersError,
  selectUpdateLoading,
  selectRemoveLoading,
  clearError,
} from '@/store/slices/admin/memberSlice';
import type { AppDispatch, RootState } from '@/store';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Icons
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  UserPlus,
  Users,
} from 'lucide-react';
import Image from 'next/image';

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
interface Member {
  role: string;
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: number;
  profileImageUrl: string;
}

// Role color mappings
const roleColors: Record<string, string> = {
  MANAGER: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  STAFF: 'bg-green-100 text-green-800 hover:bg-green-200',
};

const MembersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const members = useSelector(selectMembers);
  const loading = useSelector(selectMembersLoading);
  const error = useSelector(selectMembersError);
  const updateLoading = useSelector(selectUpdateLoading);
  const removeLoading = useSelector(selectRemoveLoading);

  // Get workspaceId from Redux store
  const { activeWorkspace: workspaceId } = useSelector(
    (state: RootState) => state.workspace
  );

  const gridRef = useRef<AgGridReact>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit form states
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  // Filter members based on search and filters
  const filteredMembers = useMemo(() => {
    return members.filter((member: Member) => {
      const matchesSearch =
        member.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter.length === 0 || roleFilter.includes(member.role);

      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  // Fetch members when workspaceId changes
  const fetchMembers = () => {
    if (workspaceId) {
      dispatch(getAllMembers(workspaceId));
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [dispatch, workspaceId]);

  // Refresh grid when filteredMembers change
  useEffect(() => {
    if (gridRef.current && filteredMembers.length > 0) {
      console.log('Refreshing AG Grid with filteredMembers:', filteredMembers);
    }
  }, [filteredMembers]);

  // Log members for debugging
  useEffect(() => {
    console.log('Members state updated:', members);
  }, [members]);

  // Role badge renderer
  const RoleBadgeRenderer = (props: any) => {
    const role = props.value;
    const badgeClass =
      roleColors[role] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';

    return <Badge className={badgeClass}>{role}</Badge>;
  };

  // Name renderer with avatar
  const NameRenderer = (props: any) => {
    console.log('Rendering Name for:', props.data);
    const { name, email } = props.data;

    return (
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{email}</div>
        </div>
      </div>
    );
  };

  // Member ID renderer
  const MemberIdRenderer = (props: any) => {
    return (
      <div className="font-mono text-xs">
        {props.value.substring(0, 8).toUpperCase()}
      </div>
    );
  };

  // Action buttons renderer
  const ActionsRenderer = (props: any) => {
    const member = props.data;

    return (
      <div className="flex space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedMember(member);
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
                  setSelectedMember(member);
                  setEditFirstName(member.firstName);
                  setEditLastName(member.lastName);
                  setEditEmail(member.email);
                  setEditRole(member.role);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 text-green-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Member</p>
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
                  setSelectedMember(member);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove Member</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  // Setup the AG Grid column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Member ID',
        field: 'id',
        cellRenderer: MemberIdRenderer,
        width: 150,
        minWidth: 120,
        flex: 1,
      },
      {
        headerName: 'Member',
        field: 'name',
        cellRenderer: NameRenderer,
        width: 300,
        minWidth: 250,
        flex: 2,
      },
      {
        headerName: 'Role',
        field: 'role',
        cellRenderer: RoleBadgeRenderer,
        width: 130,
        minWidth: 110,
        flex: 1,
        filter: true,
      },
      {
        headerName: 'Actions',
        cellRenderer: ActionsRenderer,
        width: 150,
        minWidth: 130,
        sortable: false,
        filter: false,
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
      suppressMovable: true,
    }),
    []
  );

  const handleUpdateMember = async () => {
    if (selectedMember && workspaceId) {
      try {
        await dispatch(
          updateMember({
            workspaceId,
            memberId: selectedMember.id,
            memberData: {
              firstName: editFirstName,
              lastName: editLastName,

              role: editRole,
            },
          })
        ).unwrap();

        // Refresh members after successful update
        fetchMembers();
        setIsEditDialogOpen(false);
        resetEditForm();
      } catch (error) {
        console.error('Failed to update member:', error);
      }
    }
  };

  const handleRemoveMember = async () => {
    if (selectedMember && workspaceId) {
      try {
        await dispatch(
          removeMember({
            workspaceId,
            memberId: selectedMember.id,
          })
        ).unwrap();

        // Refresh members after successful removal
        fetchMembers();
        setIsDeleteDialogOpen(false);
        setSelectedMember(null);
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  const resetEditForm = () => {
    setEditFirstName('');
    setEditLastName('');
    setEditEmail('');
    setEditRole('');
    setSelectedMember(null);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen max-h-[650px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative m-4"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(clearError())}
          className="mt-2"
        >
          Dismiss
        </Button>
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
                placeholder="Search members by name, email or ID..."
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
                    <span className="hidden sm:inline">Role</span>
                    <span className="sm:hidden">Role</span>
                    {roleFilter.length > 0 && (
                      <span className="ml-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                        {roleFilter.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {Object.keys(roleColors).map((role) => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={roleFilter.includes(role)}
                      onCheckedChange={() => handleRoleFilterChange(role)}
                    >
                      {role}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* <div className="mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
          </div>
          <p className="text-gray-500 mt-1">Manage workspace members and their roles</p>
        </div> */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Members
                  </p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Managers</p>
                  <p className="text-2xl font-bold">
                    {members.filter((m) => m.role === 'MANAGER').length}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">MANAGER</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Staff</p>
                  <p className="text-2xl font-bold">
                    {members.filter((m) => m.role === 'STAFF').length}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">STAFF</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">
              No members found
            </h3>
            <p className="text-gray-500 mt-2">
              There are no members matching your current filters
            </p>
          </div>
        ) : (
          <div
            className="ag-theme-alpine rounded-lg overflow-hidden border border-gray-200"
            style={{ height: '630px', width: '100%' }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={filteredMembers}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              theme={myTheme}
              paginationPageSize={10}
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

      {/* Member Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Member Details</DialogTitle>
            <DialogDescription>
              Member ID:{' '}
              <span className="font-mono">
                {selectedMember?.id.substring(0, 8).toUpperCase()}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {selectedMember.profileImageUrl ? (
                    <Image
                      src={selectedMember.profileImageUrl}
                      alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                  <span
                    className={`${selectedMember.profileImageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
                  >
                    {selectedMember.firstName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {' '}
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedMember.email}</p>
                  <RoleBadgeRenderer value={selectedMember.role} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Member ID
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono text-sm">{selectedMember.id}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RoleBadgeRenderer value={selectedMember.role} />
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setEditFirstName(selectedMember.firstName);
                    setEditLastName(selectedMember.lastName);
                    setEditEmail(selectedMember.email);
                    setEditRole(selectedMember.role);
                    setIsDetailsDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                >
                  Edit Member
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member information and role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                placeholder="Enter member name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>

              <Input
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                placeholder="Enter member name"
              />
            </div>

            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(roleColors).map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Badge className={roleColors[role]}>{role}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetEditForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMember}
              disabled={updateLoading || !editFirstName || !editLastName}
            >
              {updateLoading ? 'Updating...' : 'Update Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{selectedMember?.name}</strong> from the workspace? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removeLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeLoading ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MembersPage;
