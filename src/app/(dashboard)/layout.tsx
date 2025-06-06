'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Layout,
  PackageSearch,
  PackagePlus,
  Users,
  UserPlus,
  Network,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header/header';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import NotificationPermissionBanner from '@/components/notifications/NotificationPermissionBanner';

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
      } else if (!user.roles?.includes('ADMIN') || activeRole !== 'ADMIN') {
        // Redirect based on the active role or available roles
        if (user.roles?.includes('CUSTOMER') && activeRole === 'CUSTOMER') {
          router.push('/stores');
        } else {
          router.push('/unauthorized');
        }
      }
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

  if (!user || !user.roles?.includes('ADMIN')) {
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigation items with their paths - using absolute URLs
  const navItems = [
    { name: 'dashboard', icon: Layout, path: '/dashboard' },
    { name: 'workspace', icon: Network, path: '/workspace' },
    { name: 'category', icon: PackageSearch, path: '/category' },
    { name: 'product', icon: PackagePlus, path: '/product' },
    { name: 'member', icon: Users, path: '/member' },
    { name: 'invite', icon: UserPlus, path: '/invite' },
  ];

  return (
    <div className="flex min-h-screen bg-background mx-2 p-3">
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
          'fixed inset-y-0 left-0 z-50 w-64 transform flex-col border-r bg-white rounded-lg px-5 transition-transform duration-200 md:static md:translate-x-0 md:flex',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-2 ">
          <div className="flex items-center gap-2 pt-7 pb-9">
            <div className="flex justify-end ">
              <Image
                src="/app_logo.png"
                alt="Mantis logo"
                width={100}
                height={100}
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className='font-inria font-bold text-xl uppercase leading-[100%] text-black'>
              <h1>Shopventory</h1>
            </div>
          </div>

          <Button
            className="rounded-md p-1 hover:bg-gray-100 md:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* <div className="h-px bg-gray-300 w-full mt-2"></div> */}

        <div className="space-y-6">
          <div className="space-y-1 ">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  href={item.path}
                  key={item.name}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-4 py-2 font-figtree font-semibold text-base text-secondary-medium',
                    isActive ? 'text-black' : ' text-secondary-medium'
                  )}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    router.push(item.path);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
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

        <main className="p-4 md:p-6">
          <NotificationPermissionBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
