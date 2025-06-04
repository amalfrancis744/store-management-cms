'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Search,
  User,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SocialButtons } from '@/components/auth/social-buttons';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  loginUser,
  clearErrors,
  setWorkspaceId,
} from '@/store/slices/authSlice';
import { ToastContainer, toast } from 'react-toastify';
import Image from 'next/image';

// Define the schema for form validation
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      // Start the login process
      const resultAction = await dispatch(
        loginUser({ email: values.email, password: values.password })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        // Show success message
        toast.success(resultAction.payload.message || 'Login successful!');

        // Set workspace ID if available
        if (resultAction.payload.user?.workspaceId) {
          dispatch(setWorkspaceId(resultAction.payload.user.workspaceId));
        }

        setTimeout(async () => {
          // Get the user's roles from the response
          const userRoles = resultAction.payload.user?.roles || [];

          // Redirect based on role
          if (userRoles.includes('ADMIN')) {
            await router.push('/dashboard');
          } else if (userRoles.includes('CUSTOMER')) {
            await router.push('/stores');
          } else if (userRoles.includes('MANAGER')) {
            await router.push('/manager');
          } else if (userRoles.includes('STAFF')) {
            await router.push('/staff');
          } else {
            // Fallback route
            await router.push('/login');
          }
        }, 300); // Small delay to ensure state updates
      }
    } catch (err) {
      toast.error('Login failed. Please check your credentials.');
      console.error('Login failed:', err);
    }
  };

  // Clear any errors when form changes
  const handleFormChange = () => {
    if (error) {
      dispatch(clearErrors());
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white p-8 md:p-[50px]">
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
              Welcome Back !
            </h2>
            <p className="text-sm text-[#999999] font-figtree font-normal">
              Log in to manage orders, inventory, and more.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onChange={handleFormChange}
            className="space-y-4"
          >
            {error && (
              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className='font-medium text-[#676766]'>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      leftIcon={Mail}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className='font-medium text-[#676766]'>Password</FormLabel>
                  </div>
                  <FormControl>
                    <div>
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-semibold font-figtree"
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex justify-center">
              <Button type="primary" disabled={isLoading} size="large">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  or with email
                </span>
              </div>
            </div>

            <SocialButtons />
            <div className="flex justify-center">
              <p
                className="text-sm  text-[#999999] font-normal"
                style={{ fontFamily: 'Manrope' }}
              >
                Don’t have an account?{' '}
                <Link
                  href="/register"
                  className="font-semibold
                   text-primary hover:underline"
                  style={{ fontFamily: 'Figtree' }}
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
