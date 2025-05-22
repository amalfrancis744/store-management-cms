'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The store you're looking for doesn't exist or has been removed.
      </p>
      <Button onClick={() => router.push('/stores')}>Return to Stores</Button>
    </div>
  );
}
