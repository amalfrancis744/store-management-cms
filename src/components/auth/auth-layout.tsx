import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-row">
      <main className="flex-1 flex items-center bg-[#a1b4b4] justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
