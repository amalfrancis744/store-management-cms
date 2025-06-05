'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastContainer, toast } from 'react-toastify';
import { authAPI } from '@/api/auth-api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

type TokenCheckResponse = {
  success: boolean;
  message: string;
};

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const email = searchParams.get('email');
  const resetToken = searchParams.get('token');

  const [resetComplete, setResetComplete] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);

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

  const password = watch('password');

  const tokenValidationQuery = useQuery({
    queryKey: ['checkResetToken', resetToken],
    queryFn: async (): Promise<TokenCheckResponse> => {
      if (!resetToken) throw new Error('No token provided');
      const response = await authAPI.checkVerificationLink(resetToken);
      // Normalize the response to always have 'success' and 'message'
      if (
        typeof response.success !== 'undefined' &&
        typeof response.message !== 'undefined'
      ) {
        return {
          success: response.success,
          message: response.message,
        };
      } else {
        // fallback for unexpected response shape
        return {
          success: false,
          message: response.error || 'Invalid response from server',
        };
      }
    },
    enabled: !!resetToken,
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (tokenValidationQuery.isSuccess && tokenValidationQuery.data?.success) {
      setTokenValidated(true);
      toast.success('Reset link verified successfully!');
    } else if (
      tokenValidationQuery.isSuccess &&
      tokenValidationQuery.data &&
      !tokenValidationQuery.data.success
    ) {
      setTokenValidated(false);
      toast.error(tokenValidationQuery.data.message || 'Invalid reset link');
    } else if (tokenValidationQuery.isError) {
      setTokenValidated(false);
      toast.error('Failed to validate reset link');
    }
  }, [
    tokenValidationQuery.isSuccess,
    tokenValidationQuery.isError,
    tokenValidationQuery.data,
  ]);

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { resetToken: string; password: string }) =>
      authAPI.resetPassword(data.resetToken, data.password),
    onSuccess: () => {
      toast.success('Password reset successful!');
      setResetComplete(true);
      setTimeout(() => router.push('/login'), 3000);
    },
    onError: (error: any) => {
      console.error('Reset password error:', error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!resetToken) {
      toast.error('Invalid reset token. Please request a new one.');
      return;
    }
    if (!tokenValidated) {
      toast.error('Please wait for token validation.');
      return;
    }
    resetPasswordMutation.mutate({ resetToken, password: data.password });
  };

  if (tokenValidationQuery.isLoading) {
    return (
      <Card className="border-none shadow-lg mx-auto p-8 bg-white md:p-[50px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Verifying Reset Link
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-[#676766]">
            Please wait while we verify your reset link...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show error UI if token is invalid, expired, or API fails
  if (
    !resetToken ||
    tokenValidationQuery.isError ||
    (tokenValidationQuery.data && !tokenValidationQuery.data.success)
  ) {
    const errorMessage =
      tokenValidationQuery.data?.message ||
      'The password reset link is invalid or expired.';

    return (
      <Card className="border-none shadow-lg mx-auto p-8 bg-white md:p-[50px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-red-600">
            Invalid Reset Link
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-error">{errorMessage}</p>
          <Button
            onClick={() => router.push('/forgot-password')}
            type="primary"
          >
            Request New Reset Link
          </Button>
          <div className="text-center flex flex-row justify-center items-center space-x-1 mt-4">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <Link
              href="/login"
              className="text-sm text-gray-500 font-semibold no-underline cursor-pointer hover:text-gray-700"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg mx-auto p-8 bg-white md:p-[50px]">
      <ToastContainer />
      <CardHeader className="space-y-1">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-lg md:text-2xl font-bold text-black mb-1 font-figtree">
            Reset Password
          </h1>
          <p className="text-sm text-[#999999] font-figtree font-normal">
            Enter a new password to continue.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {resetComplete ? (
          <div className="rounded-xl border bg-white p-8 md:p-[50px]">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-success">
                Password Change Successful!
              </h3>
              <p className="text-gray-600">
                You can now log in with your new password.
              </p>
              <p className="text-sm text-[#676766]">
                Redirecting to login page in 3 seconds...
              </p>
              <Button onClick={() => router.push('/login')} type="primary">
                Go to Login Now
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium text-[#676766]" htmlFor="password">
                New Password
              </Label>
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
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                  },
                })}
                aria-invalid={errors.password ? 'true' : 'false'}
                disabled={resetPasswordMutation.isPending}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                className="font-medium text-[#676766]"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </Label>
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
                disabled={resetPasswordMutation.isPending}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="primary"
              disabled={resetPasswordMutation.isPending || !tokenValidated}
              className="w-full"
            >
              {resetPasswordMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center flex flex-row justify-center items-center space-x-1">
              <ArrowLeft className="w-4 h-4 text-sm text-gray-500" />
              <Link
                href="/login"
                className="text-sm text-gray-500 font-semibold no-underline cursor-pointer hover:text-gray-700"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
