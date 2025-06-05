// app/verify-otp/page.tsx or components/OTPVerificationPage.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { verifySignupOTP, resendSignupOTP } from '@/store/slices/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function OTPVerificationPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(20); // 20 second countdown
  const [canResend, setCanResend] = useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get email from URL params
  const email = searchParams.get('email') || '';

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('No email provided. Redirecting to registration.');
      router.push('/register');
    }
  }, [email, router]);

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

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join('');

    // Validate OTP - it must be 6 digits
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const resultAction = await dispatch(verifySignupOTP({ email, otp }));

      if (verifySignupOTP.fulfilled.match(resultAction)) {
        toast.success('OTP verified successfully!');
        const userRoles = resultAction.payload.user?.roles || [];
        
        // Redirect based on role
        setTimeout(() => {
          if (userRoles.includes('ADMIN')) {
            router.push('/dashboard');
          } else if (userRoles.includes('CUSTOMER')) {
            router.push('/stores');
          } else {
            router.push('/login');
          }
        }, 1000);
      }
    } catch (error) {
      toast.error('OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (canResend && !isLoading) {
      try {
        const response = await dispatch(resendSignupOTP(email));
        if (resendSignupOTP.fulfilled.match(response)) {
          const message =
            typeof response.payload.message === 'string'
              ? response.payload.message
              : response.payload.message?.message;
          toast.success(message || 'OTP resent successfully!');
          
          // Reset timer when OTP is resent
          setTimer(20);
          setCanResend(false);
          // Clear the current code
          setCode(['', '', '', '', '', '']);
          // Focus first input
          inputRefs[0].current?.focus();
        }
      } catch (error) {
        toast.error('Failed to resend OTP. Please try again.');
      }
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      
      <Card className="gap-10 border shadow-sm max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex flex-col justify-center items-center gap-3">
            <div className="flex items-center space-x-2">
              <Image
                src="/app_logo.png"
                alt="Shopventory Logo"
                width={38}
                height={34}
              />
              <h1 className="text-md md:text-xl text-primary font-semibold uppercase font-heebo">
                Shopventory
              </h1>
            </div>

            <div className="flex flex-col justify-center items-center">
              <h2 className="text-lg md:text-2xl font-bold text-black mb-1 font-figtree">
                Enter Your Code
              </h2>
              <p className="text-sm text-secondary font-figtree font-normal text-center">
                We&apos;ve sent a code to{' '}
                {email.replace(/(.{2})(.*)(?=@)/, '$1***')}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Input Fields */}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
                    className="font-figtree text-sm font-semibold cursor-pointer border-none bg-transparent p-0 hover:underline"
                    style={{ color: 'var(--Primary-L-1000, #008080)' }}
                  >
                    {isLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>

            {/* Verify Button */}
            <Button
              type="primary"
              size="large"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify with OTP'}
            </Button>
          </form>

          {/* Back to Registration Link */}
          <div className="text-center flex flex-row justify-center items-center space-x-1 mt-8">
            <ArrowLeft className="w-4 h-4 text-sm text-secondary" />
            <Link
              href="/register"
              className="text-sm text-secondary font-semibold no-underline cursor-pointer"
            >
              Back to Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}