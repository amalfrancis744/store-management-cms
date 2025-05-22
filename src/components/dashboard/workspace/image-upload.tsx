'use client';

import type React from 'react';

import { useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}

export function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);

    // Simulate file upload with a delay
    // In a real app, you would upload to a server or cloud storage
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUploaded(e.target.result.toString());
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50',
        isUploading && 'opacity-50 pointer-events-none'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Uploading image...</p>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-muted p-3">
              {isDragging ? (
                <ImageIcon className="h-6 w-6 text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragging ? 'Drop image here' : 'Drag and drop image here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                asChild
              >
                <span>Select Image</span>
              </Button>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
