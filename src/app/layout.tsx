// app/layout.tsx
'use client';

import '@fontsource/figtree'; 


import NotificationProviderFirebase from '@/provider/FirebaseProvider';
import './globals.css';
import { Providers } from './providers';
import NotificationProvider from '@/provider/SocketTestingProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <NotificationProvider>
            <NotificationProviderFirebase>
              {children}
            </NotificationProviderFirebase>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
