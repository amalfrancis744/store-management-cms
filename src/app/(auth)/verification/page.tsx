'use client';

import { AuthLayout } from '@/components/auth/auth-layout';
import { VerificationForm } from '@/components/auth/verification-form';
import { useSearchParams } from 'next/navigation';

export default function VerificationPage() {
  const searchParams = useSearchParams();
  // Get the email from URL query parameters
  const email = searchParams.get('email') || '';

  return (
    <AuthLayout>
      <VerificationForm email={email} />
    </AuthLayout>
  );
}
