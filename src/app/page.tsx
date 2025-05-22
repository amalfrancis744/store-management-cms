'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  console.log('my own check', { user, isLoading });

  useEffect(() => {
    if (!isLoading) {
      if (user?.roles?.includes('ADMIN')) {
        router.push('/dashboard');
      } else if (user?.roles?.includes('CUSTOMER')) {
        router.push('/stores');
      } else if (user?.roles?.includes('STAFF')) {
        router.push('/staff');
      } else if (user?.roles?.includes('MANAGER')) {
        router.push('/manager');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
