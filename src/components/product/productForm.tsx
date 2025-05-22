'use client';

import type React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  createProduct,
  updateProduct,
  clearProductErrors,
} from '@/store/slices/admin/productSlice';
import { fetchCategories } from '@/store/slices/admin/categorySlice';
import type { Product, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X, ImageIcon, AlertCircle } from 'lucide-react';
import { ImageUpload } from '@/components/dashboard/workspace/image-upload';

interface ProductFormProps {
  workspaceId: string;
  product?: Product;
  onSuccess?: () => void;
}

export default function ProductForm({
  workspaceId,
  product,
  onSuccess,
}: ProductFormProps) {
  const dispatch = useAppDispatch();

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    categoryId: '',
    variants: [],
    images: [],
    ...product,
  });

  // Store uploaded images in state
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    product?.images || []
  );
  const [activeTab, setActiveTab] = useState('details');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Redux state
  const { error, isLoading } = useAppSelector((state) => state.product);
  const { categories } = useAppSelector((state) => ({
    categories: state.category.categories[workspaceId] || [],
  }));

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories(workspaceId));

    // Clear product errors when unmounting
    return () => {
      dispatch(clearProductErrors());
    };
  }, [dispatch, workspaceId]);

  // Sync uploaded images with form data
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      images: uploadedImages,
    }));
  }, [uploadedImages]);

  // Image handlers
  const handleImageUploaded = (imageUrl: string) => {
    setUploadedImages((prev) => [...prev, imageUrl]);
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }

    if (!formData.variants || formData.variants.length === 0) {
      errors.variants = 'At least one variant is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update formData with the latest images
    const updatedFormData = {
      ...formData,
      images: uploadedImages,
    };

    if (!validateForm()) {
      return;
    }

    if (product) {
      await dispatch(
        updateProduct({
          workspaceId,
          productId: product.id,
          productData: updatedFormData as Product,
        })
      );
    } else {
      await dispatch(
        createProduct({
          workspaceId,
          productData: updatedFormData as Product,
        })
      );
    }

    if (!error && onSuccess) {
      onSuccess();
    }
  };

  // Input change handler
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Variant handlers
  const addVariant = () => {
    const newVariant: ProductVariant = {
      title: '',
      sku: '',
      price: 0,
      stock: 0,
      color: '',
      size: '',
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));

    // Clear variants error if it exists
    if (formErrors.variants) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.variants;
        return newErrors;
      });
    }
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    setFormData((prev) => {
      const variants = [...(prev.variants || [])];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="variants">
            Variants
            {formData.variants && formData.variants.length > 0 && (
              <span className="ml-2 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                {formData.variants.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId || ''}
                onValueChange={(value) =>
                  handleSelectChange('categoryId', value)
                }
              >
                <SelectTrigger
                  className={formErrors.categoryId ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoryId && (
                <p className="text-sm text-red-500">{formErrors.categoryId}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div className="mb-4">
              <ImageUpload onImageUploaded={handleImageUploaded} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedImages.length > 0 ? (
                uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image || '/placeholder.svg'}
                      alt={`Product ${index}`}
                      width={100}
                      height={100}
                      className="h-32 w-full object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-32 border border-dashed rounded-md p-4 text-gray-400">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <p>No images added yet</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Product Variants</h3>
            <Button type="button" onClick={addVariant} className="gap-1">
              <Plus className="h-4 w-4" /> Add Variant
            </Button>
          </div>

          {formErrors.variants && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formErrors.variants}</AlertDescription>
            </Alert>
          )}

          {formData.variants && formData.variants.length > 0 ? (
            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Variant {index + 1}: {variant.title || 'Untitled'}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`variant-${index}-title`}>Title</Label>
                        <Input
                          id={`variant-${index}-title`}
                          value={variant.title || ''}
                          onChange={(e) =>
                            updateVariant(index, 'title', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`variant-${index}-sku`}>SKU</Label>
                        <Input
                          id={`variant-${index}-sku`}
                          value={variant.sku || ''}
                          onChange={(e) =>
                            updateVariant(index, 'sku', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`variant-${index}-price`}>Price</Label>
                        <Input
                          id={`variant-${index}-price`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price || 0}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'price',
                              Number.parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`variant-${index}-stock`}>Stock</Label>
                        <Input
                          id={`variant-${index}-stock`}
                          type="number"
                          min="0"
                          step="1"
                          value={variant.stock || 0}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'stock',
                              Number.parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`variant-${index}-color`}>Color</Label>
                        <Input
                          id={`variant-${index}-color`}
                          value={variant.color || ''}
                          onChange={(e) =>
                            updateVariant(index, 'color', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`variant-${index}-size`}>Size</Label>
                        <Input
                          id={`variant-${index}-size`}
                          value={variant.size || ''}
                          onChange={(e) =>
                            updateVariant(index, 'size', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md p-4 text-gray-400">
              <p>No variants added yet</p>
              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="mt-2 gap-1"
              >
                <Plus className="h-4 w-4" /> Add Your First Variant
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : product
              ? 'Update Product'
              : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
