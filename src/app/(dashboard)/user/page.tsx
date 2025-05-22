'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Send, UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToastContainer, toast } from 'react-toastify';
import { invitationAPI } from '@/api/admin/invitation-api'; // Adjust the import path as needed
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// Form validation schema
const inviteFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.string({
    required_error: 'Please select a role',
  }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

// Default values for the form
const defaultValues: InviteFormValues = {
  email: '', // Add an empty string default value
  role: 'MANAGER',
};

export default function UserInvitePage() {
  const { activeWorkspace } = useSelector(
    (state: RootState) => state.workspace
  );
  const workspaceId = activeWorkspace;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<InviteFormValues>({
    resolver: (data) => {
      try {
        const parsed = inviteFormSchema.parse(data);
        return { values: parsed, errors: {} };
      } catch (error: any) {
        return {
          values: {},
          errors: error.format
            ? error.format()
            : { root: { message: 'Validation failed' } },
        };
      }
    },
    defaultValues,
  });

  // Handle form submission
  async function onSubmit(data: InviteFormValues) {
    setIsSubmitting(true);

    try {
      // Format the payload according to your API requirements
      const invitationPayload = {
        email: data.email,
        role: data.role.toLowerCase(), // Converting to lowercase as your API expects "manager" instead of "MANAGER"
      };

      console.log('Sending invitation payload:', invitationPayload);

      // Check if workspace ID is available
      if (!workspaceId) {
        toast.error(
          'No active workspace selected. Please select a workspace first.'
        );
        setIsSubmitting(false);
        return;
      }

      // Call the API to create invitation
      const response = await invitationAPI.createInvitation(
        workspaceId.toString(),
        invitationPayload
      );

      // Show success message using the message from API or a default one
      toast.success(
        response?.data?.message ||
          `An invitation has been sent to ${data.email}`
      );

      // Reset the form
      form.reset(defaultValues);
    } catch (error) {
      // Handle error - show appropriate message
      const errorMessage =
        (error as any)?.response?.data?.message || 'Failed to send invitation';
      toast.error(errorMessage);
      console.error('Invitation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Invite Team Members
            </CardTitle>
            <CardDescription className="text-center">
              Invite managers to collaborate in your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="colleague@company.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        The invitation will be sent to this email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This determines what permissions they will have
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help with user permissions?</p>
          <Button variant="link" className="p-0 h-auto font-normal">
            View our documentation on roles and permissions
          </Button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
