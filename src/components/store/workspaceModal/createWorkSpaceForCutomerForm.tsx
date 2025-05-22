'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { storesAPI } from '@/api/customer/stores-api';
import { X } from 'lucide-react';
import { TimePicker } from '@/components/store/workspaceModal/timePiker';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Store name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  openingTime: z.string().min(1, {
    message: 'Opening time is required.',
  }),
  closingTime: z.string().min(1, {
    message: 'Closing time is required.',
  }),
  images: z.any(),
});

export function StoreModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (success: boolean) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      openingTime: '09:00',
      closingTime: '18:00',
      images: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Create preview URLs
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviewUrls = [...previewUrls];

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);

    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('openingTime', values.openingTime);
      formData.append('closingTime', values.closingTime);

      // Append all selected files
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Call API to become store owner
      await storesAPI.becomeStoreOwner(formData);

      toast({
        title: 'Success!',
        description: 'Your store has been created successfully.',
      });

      // Reset form
      form.reset();
      setSelectedFiles([]);
      setPreviewUrls([]);

      // Close modal with success = true to trigger user data validation
      onOpenChange(true);
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: 'Error creating store',
        description:
          'There was a problem creating your store. Please try again.',
        variant: 'destructive',
      });

      // Close modal with success = false
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create Your Store
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to set up your own store.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your store name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your store"
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="openingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Time</FormLabel>
                    <FormControl>
                      <TimePicker
                        onTimeChange={(time) => field.onChange(time)}
                        defaultValue={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closing Time</FormLabel>
                    <FormControl>
                      <TimePicker
                        onTimeChange={(time) => field.onChange(time)}
                        defaultValue={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Store Images</FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    multiple
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-sm text-gray-500">
                        Drag and drop your images here or click to browse
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Support for JPG, PNG, WebP. Max size: 5MB each.
                      </p>
                    </div>
                  </label>
                </div>
              </FormControl>
              <FormMessage />

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="h-24 w-24 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Store'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
