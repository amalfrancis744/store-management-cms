// components/modals/OTPVerificationModal.tsx
'use client';

import { useState } from 'react';
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
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setIsLoading(true);
    try {
      const resultAction = await dispatch(verifySignupOTP({ email, otp }));
      
      if (verifySignupOTP.fulfilled.match(resultAction)) {
        const userRoles = resultAction.payload.user?.roles || [];
        onVerifySuccess(userRoles);
      }
    } catch (error) {
      toast.error('OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            We've sent a 6-digit verification code to {email}
          </p>
          
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onResendOTP}
              disabled={isLoading}
            >
              Resend OTP
            </Button>
            
            <Button
              onClick={handleVerify}
              disabled={isLoading || !otp}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}