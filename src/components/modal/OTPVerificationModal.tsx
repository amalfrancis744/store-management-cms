// components/modals/OTPVerificationModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { verifySignupOTP } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface OTPVerificationModalProps {
  email: string;
  onVerifySuccess: (userRoles: string[]) => void;
  onResendOTP: () => void;
  onClose: () => void;
}

export function OTPVerificationModal({
  email,
  onVerifySuccess,
  onResendOTP,
  onClose,
}: OTPVerificationModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(20); // 20 second countdown
  const [canResend, setCanResend] = useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();

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

  const handleVerify = async () => {
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
        onVerifySuccess(userRoles);
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
        await onResendOTP();
        toast.success('OTP resent successfully. Please check your email.');
        // Reset timer when OTP is resent
        setTimer(20);
        setCanResend(false);
        // Clear the current code
        setCode(['', '', '', '', '', '']);
        // Focus first input
        inputRefs[0].current?.focus();
      } catch (error) {
        toast.error('Failed to resend OTP. Please try again.');
      }
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1">
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
              <DialogTitle className="text-lg md:text-2xl font-bold text-black mb-1 font-figtree">
                Enter Your Code
              </DialogTitle>
              <p className="text-sm text-secondary font-figtree font-normal">
                We&apos;ve sent a code to{' '}
                {email.replace(/(.{2})(.*)(?=@)/, '$1***')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
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
          <div className="flex justify-center items-center">
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
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify with OTP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}