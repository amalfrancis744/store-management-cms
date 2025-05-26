'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { registerUser, clearErrors, resendSignupOTP } from '@/store/slices/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { OTPVerificationModal } from '../modal/OTPVerificationModal';


const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    'poor' | 'medium' | 'strong'
  >('poor');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, pendingVerification } = useAppSelector((state) => state.auth);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'CUSTOMER',
    },
  });

  const handlePasswordChange = (value: string) => {
    if (value.length < 6) {
      setPasswordStrength('poor');
    } else if (value.length < 10) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
    return value;
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        roles: [values.role],
        phone: values.phone,
      };

      const resultAction = await dispatch(registerUser(payload));
      
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success('Registration successful! Please verify your email with OTP.');
        setRegisteredEmail(values.email);
        setShowOTPModal(true);
      }
    } catch (err) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration failed:', err);
    }
  };

  const handleOTPVerificationSuccess = (userRoles: string[]) => {
    setShowOTPModal(false);
    // Redirect based on role
    if (userRoles.includes('ADMIN')) {
      router.push('/dashboard');
    } else if (userRoles.includes('CUSTOMER')) {
      router.push('/stores');
    } else {
      router.push('/login');
    }
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(resendSignupOTP(registeredEmail));
      toast.success('OTP resent successfully!');
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  const handleFormChange = () => {
    if (error) {
      dispatch(clearErrors());
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Card className="border-none shadow-lg sm:w-full md:w-full lg:w-[600px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign up</CardTitle>
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-blue-500 hover:underline"
            >
              Already have an account?
            </Link>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePasswordChange(e.target.value);
                          }}
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
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          passwordStrength === 'poor'
                            ? 'w-1/4 bg-red-500'
                            : passwordStrength === 'medium'
                              ? 'w-2/4 bg-yellow-500'
                              : 'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {passwordStrength}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <OTPVerificationModal
          email={registeredEmail}
          onVerifySuccess={handleOTPVerificationSuccess}
          onResendOTP={handleResendOTP}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </>
  );
}