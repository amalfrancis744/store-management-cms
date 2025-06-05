'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
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
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface VerificationFormProps {
  email: string;
}

export function VerificationForm({ email }: VerificationFormProps) {
  const router = useRouter();
  // Update to use 6 digits instead of 4
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(20); // 20 second countdown
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Set up react-query mutation for resending OTP
  const resendOTPMutation = useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onSuccess: () => {
      toast.success('OTP resent successfully. Please check your email.');
      // Reset timer when OTP is resent
      setTimer(20);
      setCanResend(false);
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
    if (canResend && !resendOTPMutation.isPending) {
      resendOTPMutation.mutate(email);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <Card className="gap-10 border shadow-sm">
      <ToastContainer />
      <CardHeader className="space-y-1">
        <div className="flex flex-col justify-center  items-center gap-3">
          <div className="flex items-center space-x-2">
            <Image
              src="/app_logo.png"
              alt="Shopventory Logo"
              width={38}
              height={34}
            />
            <h1 className=" text-md md:text-xl text-primary font-semibold uppercase font-heebo ">
              Shopventory
            </h1>
          </div>

          <div className="flex flex-col justify-center items-center">
            <h2 className="text-lg  md:text-2xl font-bold text-black mb-1 font-figtree ">
              Enter Your Code
            </h2>
            <p className="text-sm text-secondary font-figtree font-normal">
              We&apos;ve sent a code to{' '}
              {email.replace(/(.{2})(.*)(?=@)/, '$1***')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
          
          {/* Timer and Resend OTP Section */}
          <div className="flex justify-center items-center mt-6">
            <div className="text-center">
              {!canResend ? (
                <span 
                  className="font-figtree text-sm font-medium"
                  style={{ color: 'var(--Secondary-500, #999)' }}
                >
                  Resend OTP {formatTimer(timer)}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendOTPMutation.isPending}
                  className="font-figtree text-sm font-semibold cursor-pointer border-none bg-transparent p-0 hover:underline"
                  style={{ color: 'var(--Primary-L-1000, #008080)' }}
                >
                  {resendOTPMutation.isPending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>
          </div>

          <Button
            type="primary"
            size='large'
            disabled={
              verifyOTPMutation.isPending || resendOTPMutation.isPending
            }
          >
            {verifyOTPMutation.isPending ? 'Verifying...' : 'Verify with OTP'}
          </Button>
        </form>

        <div className="text-center flex flex-row justify-center items-center space-x-1 mt-8 ">
          <ArrowLeft className="w-4 h-4 text-sm text-secondary" />
          <Link
            href="/login"
            className="text-sm text-secondary font-semibold no-underline cursor-pointer"
          >
            Back to Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}