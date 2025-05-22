// components/dashboard/dashboard-sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      allowedRoles: ['user', 'admin'],
    },
    {
      name: 'User Area',
      href: '/user',
      allowedRoles: ['user', 'admin'],
    },
    {
      name: 'Admin Area',
      href: '/admin',
      allowedRoles: ['admin'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => user?.role && item.allowedRoles.includes(user.role)
  );

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">My Dashboard</h2>
      </div>
      <nav>
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 rounded hover:bg-gray-700 transition-colors ${
                    isActive ? 'bg-gray-700 font-medium' : ''
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
