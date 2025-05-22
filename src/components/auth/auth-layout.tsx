import type { ReactNode } from 'react';
import { Logo } from '@/components/auth/logo';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-row p-8">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-blue-300 to-green-200 opacity-70 -z-10" />
      <header className="p-2">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
