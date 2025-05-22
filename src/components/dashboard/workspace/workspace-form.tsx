'use client';

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import { ImageUpload } from './image-upload';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Workspace } from './types';
import Image from 'next/image';

interface WorkspaceFormProps {
  form: UseFormReturn<Workspace>;
  onSubmit: (data: Workspace) => void;
  onCancel: () => void;
  submitLabel: string;
  isLoading: boolean;
}

export function WorkspaceForm({
  form,
  onSubmit,
  onCancel,
  submitLabel,
  isLoading,
}: WorkspaceFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Sync uploaded images with form values when the component mounts or form changes
  useEffect(() => {
    const images = form.getValues().images || [];
    setUploadedImages(images);
  }, [form]);

  const handleImageUploaded = (imageUrl: string) => {
    const newImages = [...uploadedImages, imageUrl];
    setUploadedImages(newImages);
    form.setValue('images', newImages, { shouldValidate: true });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = uploadedImages.filter(
      (_, index) => index !== indexToRemove
    );
    setUploadedImages(newImages);
    form.setValue('images', newImages, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <ScrollArea className="max-h-[58vh]  pr-4">
        <form
          onSubmit={form.handleSubmit((data) => {
            console.log('Form submitted with data:', data);
            onSubmit({
              ...data,
              images: uploadedImages,
            });
          })}
          className="space-y-5 p-3"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Workspace Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Bakery Workspace"
                    {...field}
                    className="h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A workspace for managing bakery operations..."
                    className="resize-none h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <div className="space-y-2 pt-1">
            <FormLabel className="text-sm font-medium">
              Workspace Image
            </FormLabel>
            <ImageUpload onImageUploaded={handleImageUploaded} />

            {/* Display uploaded images */}
            {uploadedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {uploadedImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group rounded-md overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`Uploaded ${index + 1}`}
                      className="h-20 w-full object-cover"
                      width={100}
                      height={100}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <FormField
              control={form.control}
              name="openingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Opening Time
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="h-10" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="closingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Closing Time
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="h-10" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <div className="h-4"></div> {/* Spacer */}
        </form>
      </ScrollArea>

      {/* Fixed footer with action buttons - outside the ScrollArea */}
      <div className="flex justify-end gap-2 pt-6 border-t mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={() =>
            form.handleSubmit((data) => {
              onSubmit({
                ...data,
                images: uploadedImages,
              });
            })()
          }
          disabled={isLoading}
          className="h-10"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
