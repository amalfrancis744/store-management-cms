// app/(auth)/layout.tsx

import NotificationPermissionBanner from '@/components/notifications/NotificationPermissionBanner';


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}
    <NotificationPermissionBanner/>
  </div>;
}
