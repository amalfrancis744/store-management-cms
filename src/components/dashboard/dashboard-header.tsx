// components/dashboard/dashboard-header.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700">
            <span>Welcome, </span>
            <span className="font-medium">{user?.role}</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {user?.role}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
