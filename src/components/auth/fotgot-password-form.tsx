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
import { ArrowLeft } from 'lucide-react';

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
        'Reset url sent. Please check your email and verify the OTP'
      );
      setResetSent(true);

      // Redirect with email as query parameter
      // setTimeout(() => {
      //   router.push(`/verification?email=${encodeURIComponent(currentEmail)}`);
      // }, 2000);
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
    <Card className="shadow-sm gap-10 border ">
      <ToastContainer />
      <CardHeader className="space-y-1">

         <div className="flex flex-col justify-center items-center ">
          <h1 className="text-lg  md:text-2xl font-bold text-black mb-1 font-figtree">
            Forgot password?
          </h1>

          <p className="text-sm text-[#999999] font-figtree font-normal">
             Don’t worry, we’ll help you reset it.
          </p>
        </div>
      
     
      </CardHeader>

      <CardContent>
       
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className='font-medium font-figtree text-[#676766]'  htmlFor="email">Email address</Label>
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
                  <p className="text-sm text-error mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="primary"
                className="w-full  font-figtree font-semibold  text-sm md:text-base text-white"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending
                  ? 'Sending...'
                  : 'Reset Password'}
              </Button>
              <div className="text-center flex flex-row justify-center items-center space-x-1">
                <ArrowLeft className="w-4 h-4 text-sm text-secondary" />
                <Link
                  href="/login"
                  className="text-sm text-secondary font-semibold no-underline cursor-pointer"
                >
                  Back to Sign Up
                </Link>
              </div>
            </form>
          </>
        
      </CardContent>
    </Card>
  );
}
