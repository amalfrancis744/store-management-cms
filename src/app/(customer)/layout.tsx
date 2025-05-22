// app/(customer)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/header/header';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  ClipboardList,
  User,
  Settings,
  Home,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Cart } from '@/components/cart/cart';
import { Button } from '@/components/ui/button';

export default function CustomerLayout({
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
        !user.roles?.includes('CUSTOMER') ||
        activeRole !== 'CUSTOMER'
      ) {
        if (user.roles?.includes('ADMIN') && activeRole === 'ADMIN') {
          router.push('/dashboard');
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

  if (!user || !user.roles?.includes('CUSTOMER')) {
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { name: 'store', icon: Home, path: '/stores' },
    { name: 'cart', icon: ShoppingBag, path: '/cart' },
    { name: 'my-orders', icon: ClipboardList, path: '/orders' },
    { name: 'profile', icon: User, path: '/userprofile' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
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
          'fixed inset-y-0 left-0 z-50 w-64 sm:w-72 xl:w-80 transform flex-col border-r bg-white p-4 sm:p-6 transition-transform duration-300 md:static md:translate-x-0 md:flex',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Store logo"
              width={100}
              height={100}
              className="h-12 sm:h-14 xl:h-16 w-auto object-contain"
            />
          </div>
          <Button
            className="rounded-md p-1 hover:bg-gray-100 md:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
        <div className="h-px bg-gray-200 w-full mt-3 sm:mt-4"></div>

        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  href={item.path}
                  key={item.name}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 sm:py-2.5 text-sm  font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-4 xl:h-5 xl:w-6" />
                  {item.name.toUpperCase()}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Customer Header */}
        <Header user={user} toggleSidebar={toggleSidebar} logout={logout} />
        <main className="flex-1">{children}</main>
      </div>
      <Cart />
    </div>
  );
}
