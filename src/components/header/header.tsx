'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  LogOut,
  Menu,
  PlusCircle,
  UserIcon,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/index';
import { setActiveWorkspace } from '@/store/slices/admin/workspaceSlice';
import { setActiveRole, validateUserData } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StoreModal } from '@/components/store/workspaceModal/createWorkSpaceForCutomerForm';
import { CartButton } from '@/components/cart/cartButton';
import Notifications from '../notifications/userNotification';

interface HeaderProps {
  user: User | null;
  toggleSidebar: () => void;
  logout: () => void;
}

export function Header({ user, toggleSidebar, logout }: HeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Initialize WebSocket connection -disconnect

  const handleLogout = () => {
    logout();

    console.log('User logged out and socket disconnected');
  };

  //getActive role
  const { activeRole } = useSelector((state: RootState) => state.auth);

  // Get workspace state from Reduxstore
  const { workspaces, activeWorkspace } = useSelector(
    (state: RootState) => state.workspace
  ) as unknown as {
    workspaces: { id: string; name: string }[];
    activeWorkspace: { id: string; name: string } | null;
  };

  // Initialize currentWorkspaceName based on activeWorkspace or fallback
  const [currentWorkspaceName, setCurrentWorkspaceName] = useState(
    activeWorkspace?.name || 'Select Workspace'
  );

  // Sync role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('activeRole');
    if (savedRole) {
      dispatch(setActiveRole(savedRole));
    }
  }, [dispatch]);

  // Sync currentWorkspaceName when activeWorkspace or workspaces change
  useEffect(() => {
    if (activeWorkspace?.name) {
      setCurrentWorkspaceName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const handleSwitchWorkspace = (id: string) => {
    if (isSwitching || activeWorkspace?.id === id) return; // Prevent redundant switches
    setIsSwitching(true);

    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      setCurrentWorkspaceName(workspace.name); // Update local state immediately
      dispatch(setActiveWorkspace(id)); // Update Redux state
      toast({
        title: 'Workspace Switched',
        description: `You are now working in ${workspace.name}.`,
      });
    } else {
      console.error('Workspace not found:', id);
      toast({
        title: 'Error',
        description: 'Selected workspace not found.',
        variant: 'destructive',
      });
    }

    // Re-enable switching after a short delay
    setTimeout(() => setIsSwitching(false), 500);
  };

  const handleRoleChange = (role: string) => {
    dispatch(setActiveRole(role));
    toast({
      title: 'Role Switched',
      description: `You are now working as ${role}.`,
    });
  };

  const handleModalClose = (success: boolean) => {
    setStoreModalOpen(false);
    if (success) {
      dispatch(validateUserData());
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <div className="hidden md:block">
            <span className="text-sm font-medium text-gray-700">WELCOME</span>
          </div>
        </div>

        {/* socket indicator */}

        {/* <div className="flex items-center gap-2">
  <div className={`h-2 w-2 rounded-full ${
    status.isConnected ? 'bg-green-500' : 
    status.isConnecting ? 'bg-yellow-500' : 
    'bg-red-500'
  }`} />
  <span className="text-xs text-gray-500">
    {status.isConnected ? 'Connected' : 
     status.isConnecting ? 'Connecting' : 'Disconnected'}
  </span> */}
        {/* </div> */}

        <div className="flex items-center gap-3">
          {activeRole === 'CUSTOMER' &&
            user &&
            !user?.roles?.includes('ADMIN') && (
              <Button
                className="flex gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-full px-5 py-2 shadow-sm transition-all duration-200 hover:shadow"
                onClick={() => setStoreModalOpen(true)}
              >
                <PlusCircle size={18} />
                <span>Add your own store</span>
              </Button>
            )}

          {user?.roles && user.roles.length <= 1 && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-gray-200 pr-1.5 rounded-full"
            >
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">
                {activeRole || 'Select Role'}
              </span>
            </Button>
          )}

          {user?.roles && user.roles.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border-gray-200 pr-1.5 rounded-full"
                >
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">
                    {activeRole || 'Select Role'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.roles?.includes('ADMIN') && (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('ADMIN')}
                    className="cursor-pointer"
                  >
                    ADMIN
                    {activeRole === 'ADMIN' && (
                      <Badge
                        variant="outline"
                        className="ml-auto h-5 bg-gray-100 px-1.5 text-xs font-normal"
                      >
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                )}
                {user?.roles?.includes('MANAGER') && (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('MANAGER')}
                    className="cursor-pointer"
                  >
                    MANAGER
                    {activeRole === 'MANAGER' && (
                      <Badge
                        variant="outline"
                        className="ml-auto h-5 bg-gray-100 px-1.5 text-xs font-normal"
                      >
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                )}
                {user?.roles?.includes('CUSTOMER') && (
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('CUSTOMER')}
                    className="cursor-pointer"
                  >
                    CUSTOMER
                    {activeRole === 'CUSTOMER' && (
                      <Badge
                        variant="outline"
                        className="ml-auto h-5 bg-gray-100 px-1.5 text-xs font-normal"
                      >
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {activeRole === 'ADMIN' && workspaces.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border-gray-200 pr-1.5 rounded-full"
                  disabled={isSwitching}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs">
                    {currentWorkspaceName
                      ? currentWorkspaceName.charAt(0)
                      : 'W'}
                  </div>
                  <span className="text-sm font-medium">
                    {currentWorkspaceName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => handleSwitchWorkspace(workspace.id)}
                    className="flex items-center gap-2 cursor-pointer"
                    disabled={
                      isSwitching || activeWorkspace?.id === workspace.id
                    }
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs">
                      {workspace.name.charAt(0)}
                    </div>
                    <span>{workspace.name}</span>
                    {activeWorkspace?.id === workspace.id && (
                      <Badge
                        variant="outline"
                        className="ml-auto h-5 bg-gray-100 px-1.5 text-xs font-normal"
                      >
                        Active
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Notifications />

          {activeRole === 'CUSTOMER' && <CartButton />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 rounded-full px-2 hover:bg-gray-100"
              >
                <Avatar className="h-8 w-8 border border-gray-200 ring-2 ring-primary/10">
                  <AvatarImage
                    src="/account.png"
                    alt={user?.name || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarImage
                    src="/account.png"
                    alt={user?.name || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name || 'User'}</span>
                  <span className="text-xs text-gray-500">
                    {activeRole || 'No Role'}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="default"
            size="sm"
            onClick={handleLogout}
            className="hidden max-sm:flex max-sm:h-8 max-sm:text-xs rounded-full"
          >
            Logout
          </Button>
        </div>
      </header>

      <StoreModal open={storeModalOpen} onOpenChange={handleModalClose} />
    </>
  );
}
