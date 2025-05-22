'use client';

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
          <NotificationProvider>{children}</NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
