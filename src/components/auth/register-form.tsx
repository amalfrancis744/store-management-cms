'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { Eye, EyeOff, Mail } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { registerUser, clearErrors } from '@/store/slices/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { Label } from '../ui/label';
import { PhoneInput } from './phone_input';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(13, 'Phone number must be at least 10 digits'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER']),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms & Conditions',
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    'poor' | 'medium' | 'strong'
  >('poor');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'CUSTOMER',
      acceptTerms: false,
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
        toast.success(
          'Registration successful! Redirecting to verify your email...'
        );

        // Redirect to OTP verification page with email parameter
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
        }, 1500);
      }
    } catch (err) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration failed:', err);
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
      <Card className="border-none shadow-lg mx-auto p-8 bg-white md:p-[50px]">
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
                Welcome Back !
              </h2>
              <p className="text-sm text-[#999999] font-figtree font-normal">
                Smart tools for your bakery journey.
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
                <div className="text-error text-sm text-center p-2 bg-red-50 rounded border border-error">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-2 font-figtree font-medium">
                      <FormLabel className="font-medium text-[#676766]">
                        First name
                      </FormLabel>
                      <FormControl>
                        <Input
                          variant={
                            form.formState.errors.firstName
                              ? 'error'
                              : 'default'
                          }
                          placeholder="Enter your first name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-error font-medium text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium text-[#676766]">
                        Last name
                      </FormLabel>
                      <FormControl>
                        <Input
                          variant={
                            form.formState.errors.lastName ? 'error' : 'default'
                          }
                          placeholder="Enter your last name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-error font-medium text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-[#676766]">
                      Email address
                    </FormLabel>
                    <FormControl>
                      <Input
                        variant={
                          form.formState.errors.email ? 'error' : 'default'
                        }
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error font-medium text-xs" />
                  </FormItem>
                )}
              />
              <div className=" grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium text-[#676766]">
                          Phone number
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            placeholder="Enter phone number"
                            value={field.value}
                            onChange={(value) => field.onChange(value || '')}
                            defaultCountry="IN"
                            international
                          />
                        </FormControl>
                        <FormMessage className="text-error font-medium text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium text-[#676766]">
                          Role
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={`h-12 border border-gray-300`}
                            >
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-error font-medium text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium text-[#676766]">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pr-10 ${form.formState.errors.password ? 'border-error' : ''}`}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePasswordChange(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-error font-medium text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center gap-1">
                      <FormControl>
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label
                        htmlFor="terms"
                        className="font-figtree font-medium text-black text-sm"
                      >
                        I agree to the Terms & Conditions and Privacy Policy
                      </Label>
                    </div>
                    <FormMessage className="text-error font-medium text-xs" />
                  </FormItem>
                )}
              />

              <Button size="large" type="primary" disabled={isLoading}>
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </Button>
              <div className="flex justify-center">
                <p
                  className="text-sm text-[#999999] font-normal"
                  style={{ fontFamily: 'Manrope' }}
                >
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:underline"
                    style={{ fontFamily: 'Figtree' }}
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
