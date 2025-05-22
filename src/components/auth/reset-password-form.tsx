'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastContainer, toast } from 'react-toastify';
import { authAPI } from '@/api/auth-api';

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const resetToken = searchParams.get('token');

  const [resetComplete, setResetComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Password watch to compare with confirm password
  const password = watch('password');

  // React Query mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: { resetToken: string; password: string }) =>
      authAPI.resetPassword(data.resetToken, data.password),
    onSuccess: () => {
      toast.success('Password reset successful!');
      setResetComplete(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Failed to reset password. Please try again.');
    },
  });

  // Form submission handler
  const onSubmit = (data: ResetPasswordFormData) => {
    if (!resetToken) {
      toast.error('Invalid reset token. Please request a new password reset.');
      return;
    }

    resetPasswordMutation.mutate({ resetToken, password: data.password });
  };

  // If token or email is missing, show error
  if (!resetToken || !email) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Invalid Reset Link
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-red-500">
            The password reset link is invalid or expired.
          </p>
          <Button
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
            onClick={() => router.push('/forgot-password')}
          >
            Request New Reset Link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <ToastContainer />
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Reset Your Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resetComplete ? (
          <div className="space-y-4 text-center">
            <p className="text-green-600">Password reset successful!</p>
            <p>You can now log in with your new password.</p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending
                ? 'Processing...'
                : 'Reset Password'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
