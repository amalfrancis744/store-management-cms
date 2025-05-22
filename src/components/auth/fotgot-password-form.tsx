'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SocialButtons } from '@/components/auth/social-buttons';
import { authAPI } from '@/api/auth-api';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Define the form data type
type ForgotPasswordFormData = {
  email: string;
};

export function ForgotPasswordForm() {
  const router = useRouter();
  const [resetSent, setResetSent] = useState(false);

  // Set up react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
  });

  // Get current email value for redirection
  const currentEmail = watch('email');

  // Set up react-query mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onSuccess: () => {
      toast.success(
        'OTP sent successfully. Please check your email and verify the OTP'
      );
      setResetSent(true);

      // Redirect with email as query parameter
      setTimeout(() => {
        router.push(`/verification?email=${encodeURIComponent(currentEmail)}`);
      }, 2000);
    },
    onError: (error) => {
      console.error('Error:', error);
      // Still show a success message to prevent email enumeration
      toast('Email id not registered with us, please check your email id');
    },
  });

  // Form submission handler
  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data.email);
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Forgot password?</CardTitle>
        <div className="text-center">
          <Link href="/login" className="text-sm text-blue-500 hover:underline">
            Back to login
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {resetSent ? (
          <div className="space-y-4 text-center">
            <p className="text-green-600">OTP sent successfully!</p>
            <p>Please check your email and verify the OTP.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending
                  ? 'Sending...'
                  : 'Reset Password'}
              </Button>
            </form>

            {/* <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or sign in with</span>
              </div>
              <ToastContainer/>
            </div> */}

            {/* <SocialButtons /> */}
          </>
        )}
      </CardContent>
    </Card>
  );
}
