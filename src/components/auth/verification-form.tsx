'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { authAPI } from '@/api/auth-api';

interface VerificationFormProps {
  email: string;
}

export function VerificationForm({ email }: VerificationFormProps) {
  const router = useRouter();
  // Update to use 6 digits instead of 4
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Set up react-query mutation for resending OTP
  const resendOTPMutation = useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onSuccess: () => {
      toast.success('OTP resent successfully. Please check your email.');
    },
    onError: (error) => {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    },
  });

  // Set up react-query mutation for verifying OTP
  const verifyOTPMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authAPI.verifyOTP(email, otp),
    onSuccess: (response) => {
      toast.success('OTP verified successfully!');

      // Extract resetToken from the response
      const resetToken = response.data.resetToken;

      console.log('Reset Token:', resetToken);
      //   router.push(`/reset-password?email=${encodeURIComponent(email)}`)

      if (resetToken) {
        //    router.push(`/reset-password?email=${encodeURIComponent(email)}`)
        // Redirect to reset password page with email and resetToken
        setTimeout(() => {
          router.push(
            `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`
          );
        }, 1000);
      } else {
        toast.error('Failed to get reset token. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Error verifying OTP:', error);
      toast.error('Invalid OTP. Please try again.');
    },
  });

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      // Updated to account for 6 digits
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join('');

    // Validate OTP - it must be 6 digits
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    // Submit OTP for verification
    verifyOTPMutation.mutate({ email, otp });
  };

  const handleResend = () => {
    resendOTPMutation.mutate(email);
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <Card className="border-none shadow-lg">
      <ToastContainer />
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Enter Verification Code
        </CardTitle>
        <CardDescription className="text-center">
          We sent you a code via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-center mb-6">
          We&apos;ve sent a code to {email.replace(/(.{2})(.*)(?=@)/, '$1***')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="w-12 h-12 text-center text-lg"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={verifyOTPMutation.isPending}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={
              verifyOTPMutation.isPending || resendOTPMutation.isPending
            }
          >
            {verifyOTPMutation.isPending ? 'Verifying...' : 'Verify with OTP'}
          </Button>
        </form>

        <div className="flex justify-between items-center mt-6">
          <p className="text-sm">Didn&apos;t receive the code?</p>
          <Button
            variant="link"
            className="p-0 h-auto text-blue-500"
            onClick={handleResend}
            disabled={resendOTPMutation.isPending}
          >
            {resendOTPMutation.isPending ? 'Sending...' : 'Resend code'}
          </Button>
        </div>

        <div className="text-center mt-4">
          <Button
            variant="outline"
            className="text-blue-500"
            onClick={handleBackToLogin}
          >
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
