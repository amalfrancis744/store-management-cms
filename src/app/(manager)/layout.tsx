'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Layout, PackageSearch, Users, Network, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header/header';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeRole = useSelector((state: RootState) => state.auth.activeRole);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (
        (!user.roles?.includes('ADMIN') || activeRole !== 'ADMIN') &&
        (!user.roles?.includes('CUSTOMER') || activeRole !== 'CUSTOMER')
      ) {
        // Redirect based on the active role or available roles
        if (user?.roles?.includes('MANAGER') && activeRole === 'MANAGER') {
          router.push('/manager');
        } else {
          router.push('/unauthorized');
        }
      }
      // If user has ADMIN role and activeRole is ADMIN, they can access the admin layout
    }
  }, [user, isLoading, router, activeRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.roles?.includes('MANAGER')) {
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigation items with their paths - using absolute URLs
  const navItems = [
    { name: 'manager', icon: Layout, path: '/manager' },
    { name: 'staff', icon: PackageSearch, path: '/userlist' },
    { name: 'userorders', icon: Network, path: '/userorders' },
    // { name: 'stock', icon: Users, path: '/stock' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform flex-col border-r bg-white p-4 transition-transform duration-200 md:static md:translate-x-0 md:flex',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-2 ">
          <div className="flex items-center gap-2">
            <div className="flex justify-end ">
              <Image
                src="/logo.svg"
                alt="Mantis logo"
                width={100}
                height={100}
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>

          <Button
            className="rounded-md p-1 hover:bg-gray-100 md:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="h-px bg-gray-300 w-full mt-2"></div>

        <div className="mt-8 space-y-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  href={item.path}
                  key={item.name}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium',
                    isActive ? 'bg-gray-100' : 'text-gray-700 hover:bg-gray-100'
                  )}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    // Force navigation to the absolute path
                    router.push(item.path);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.name.toUpperCase()}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Use the Header component */}
        <Header user={user} toggleSidebar={toggleSidebar} logout={logout} />

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
