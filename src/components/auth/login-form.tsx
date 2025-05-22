'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
    <Card className="border-none shadow-lg">
      <ToastContainer />
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <div className="text-center">
          <Link
            href="/register"
            className="text-sm text-blue-500 hover:underline"
          >
            I don&apos;t have an account
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <SocialButtons />

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">or with email</span>
          </div>
        </div>

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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
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
                    <FormLabel>Password</FormLabel>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
