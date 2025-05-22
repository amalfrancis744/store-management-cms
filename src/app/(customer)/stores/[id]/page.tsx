'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Grid,
  List,
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Info,
  Weight,
  Ruler,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';

import type { RootState, AppDispatch } from '@/store/index';
import { fetchCategories } from '@/store/slices/admin/categorySlice';
import { addItemToCart } from '@/store/slices/customer/cartSlice';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ToastContainer, toast } from 'react-toastify';

// Types based on the provided data structure
interface Variant {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  weight: number | null;
  dimensions: string | null;
  color: string;
  size: string;
  isAvailable?: boolean;
}

interface Product {
  id: string;
  name: string;
  images?: string[];
  variants?: Variant[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string | null;
  workspaceId: number;
  children?: Category[];
  products: Product[];
}

export default function StorePage() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams<{
    [x: string]: any;
    tag: string;
    item: string;
  }>();

  // const unwrappedParams = params
  const workspaceId = params.id;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantForModal, setSelectedVariantForModal] =
    useState<Variant | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Increased from 6 to show more products

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchCategories(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const { categories, isLoading } = useSelector((state: RootState) => {
    return {
      categories: state.category.categories[workspaceId] || [],
      isLoading: state.category.isLoading,
    };
  });

  // Initialize all categories as expanded by default
  useEffect(() => {
    if (categories.length > 0) {
      const initialExpandedState: Record<string, boolean> = {};
      categories.forEach((category) => {
        initialExpandedState[category.id] = true;
      });
      setExpandedCategories(initialExpandedState);
    }
  }, [categories]);

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleAddToCart = async (product: Product, defaultVariant: Variant) => {
    // Use selected variant if available, otherwise use the default
    const variantId = selectedVariants[product.id];
    const variant = variantId
      ? product.variants?.find((v) => v.id === variantId) || defaultVariant
      : defaultVariant;

    if (!variant?.isAvailable) {
      toast.error('This variant is not available for purchase');
      return;
    }

    try {
      await dispatch(
        addItemToCart({
          variantId: variant.id,
          quantity: 1, // Default quantity is 1
        })
      ).unwrap();

      toast.success('Product added to cart!');
    } catch (error: any) {
      // toast.error(error)
      toast.error(error || 'Failed to add product to cart');
    }
  };

  const handleVariantSelect = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  };

  const openVariantModal = (product: Product, variant: Variant) => {
    setSelectedProduct(product);
    setSelectedVariantForModal(variant);
    setIsModalOpen(true);
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.products.some((product: { name: string }) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Get all products from all categories if no active category is selected
  const getAllProducts = () => {
    if (activeCategory) {
      const category = categories.find((cat) => cat.id === activeCategory);
      return category?.products || [];
    } else {
      // When no category is selected, show all products from all categories
      return categories.flatMap((category) => category.products || []);
    }
  };

  const allProducts = getAllProducts();

  // Filter products by search query
  const filteredProducts = allProducts.filter((product: { name: string }) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get products for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get lowest price from variants for a product
  const getLowestPrice = (variants?: Variant[], productId?: string) => {
    if (!variants || variants.length === 0) return null;

    // If we have a selected variant for this product, return its price
    if (productId && selectedVariants[productId]) {
      const selectedVariant = variants.find(
        (v) => v.id === selectedVariants[productId]
      );
      if (selectedVariant) return selectedVariant.price;
    }

    // Otherwise return the lowest price
    return Math.min(...variants.map((variant) => variant.price));
  };

  // Get best image for a product
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder.svg?height=200&width=200';
  };

  // Get the title for products section
  const getProductsTitle = () => {
    if (activeCategory) {
      const category = categories.find((cat) => cat.id === activeCategory);
      return category?.name || 'Products';
    }
    return 'All Products';
  };

  // Get the description for products section
  const getProductsDescription = () => {
    if (activeCategory) {
      const category = categories.find((cat) => cat.id === activeCategory);
      return category?.description || '';
    }
    return '';
  };

  // Get the selected variant for a product
  const getSelectedVariant = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return null;

    const variantId = selectedVariants[product.id];
    if (variantId) {
      return (
        product.variants.find((v) => v.id === variantId) || product.variants[0]
      );
    }
    return product.variants[0];
  };

  // Categories component for reuse
  const CategoriesList = () => (
    <div className="p-2">
      <button
        className={`w-full text-left p-2 rounded-md transition-colors ${
          activeCategory === null
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-muted'
        }`}
        onClick={() => {
          setActiveCategory(null);
          setCurrentPage(1); // Reset to first page when showing all products
          setIsMobileFilterOpen(false); // Close mobile filter when selecting a category
        }}
      >
        <div className="flex items-center justify-between">
          <span>All Products</span>
          <Badge variant="outline" className="ml-2">
            {categories.flatMap((c) => c.products || []).length}
          </Badge>
        </div>
      </button>

      {filteredCategories.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">
          No categories found
        </p>
      ) : (
        filteredCategories.map((category) => (
          <button
            key={category.id}
            className={`w-full text-left p-2 rounded-md transition-colors ${
              activeCategory === category.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-muted'
            }`}
            onClick={() => {
              setActiveCategory(category.id);
              setCurrentPage(1); // Reset to first page when changing category
              setIsMobileFilterOpen(false); // Close mobile filter when selecting a category
            }}
          >
            <div className="flex items-center justify-between">
              <span>{category.name}</span>
              <Badge variant="outline" className="ml-2">
                {category.products?.length || 0}
              </Badge>
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ToastContainer />

      {/* Variant Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedProduct && selectedVariantForModal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {selectedProduct.name}
                  <Badge
                    variant={
                      selectedVariantForModal.isAvailable
                        ? 'default'
                        : 'destructive'
                    }
                    className="ml-2"
                  >
                    {selectedVariantForModal.isAvailable
                      ? 'Available'
                      : 'Unavailable'}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-lg font-semibold text-primary">
                  {selectedVariantForModal.title}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={getProductImage(selectedProduct) || '/placeholder.svg'}
                    alt={selectedProduct.name}
                    //       width={100}
                    // height={100}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-xl font-bold">
                        ${selectedVariantForModal.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">SKU</p>
                      <p className="font-medium">
                        {selectedVariantForModal.sku}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Color</p>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border"
                          style={{
                            backgroundColor:
                              selectedVariantForModal.color.toLowerCase(),
                          }}
                        ></div>
                        <p className="font-medium">
                          {selectedVariantForModal.color}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-medium">
                        {selectedVariantForModal.size}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Stock</p>
                      <p
                        className={`font-medium ${selectedVariantForModal.stock < 10 ? 'text-amber-600' : ''}`}
                      >
                        {selectedVariantForModal.stock} units
                      </p>
                    </div>

                    {selectedVariantForModal.weight !== null && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Weight className="h-3 w-3" /> Weight
                        </p>
                        <p className="font-medium">
                          {selectedVariantForModal.weight} kg
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedVariantForModal.dimensions && (
                    <div className="space-y-1 pt-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Ruler className="h-3 w-3" /> Dimensions
                      </p>
                      <p className="font-medium">
                        {selectedVariantForModal.dimensions}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" /> Availability
                    </p>
                    <p
                      className={`font-medium ${selectedVariantForModal.isAvailable ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {selectedVariantForModal.isAvailable
                        ? 'This item is available for purchase'
                        : 'This item is currently unavailable'}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="sm:flex-1"
                >
                  Close
                </Button>
                <Button
                  className="sm:flex-1"
                  disabled={!selectedVariantForModal.isAvailable}
                  onClick={() => {
                    handleAddToCart(selectedProduct, selectedVariantForModal);
                    setIsModalOpen(false);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Search and Filter Bar - Fixed at top */}
      <div className="sticky top-0 z-10 bg-background border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile Filter Button */}
            <div className="flex gap-2 md:hidden">
              <Sheet
                open={isMobileFilterOpen}
                onOpenChange={setIsMobileFilterOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Categories</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Categories</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="rounded-full h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                    <CategoriesList />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-10 w-10"
                >
                  <Grid className="h-4 w-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10"
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">List view</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Takes full remaining height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Categories (Hidden on Mobile) */}
        <div className="hidden md:block w-64 lg:w-72 border-r border-border/40 overflow-y-auto">
          <div className="p-4 border-b sticky top-0 bg-background z-10">
            <h2 className="font-semibold text-lg">Categories</h2>
          </div>
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse h-4 bg-muted rounded mb-2"></div>
              <div className="animate-pulse h-4 bg-muted rounded mb-2 w-3/4"></div>
              <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : (
            <CategoriesList />
          )}
        </div>

        {/* Right Content - Products */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-4">
            {/* View Controls (Desktop) */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{getProductsTitle()}</h2>
                {getProductsDescription() && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {getProductsDescription()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-9 w-9"
                >
                  <Grid className="h-4 w-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-9 w-9"
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">List view</span>
                </Button>
              </div>
            </div>

            {/* Mobile Title */}
            <div className="md:hidden mb-4">
              <h2 className="text-xl font-semibold">{getProductsTitle()}</h2>
              {getProductsDescription() && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getProductsDescription()}
                </p>
              )}
            </div>

            {/* Products Display */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden shadow">
                    <div className="aspect-square relative bg-muted animate-pulse"></div>
                    <CardHeader className="p-3 md:p-4">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </CardHeader>
                    <CardFooter className="p-3 md:p-4 pt-0 flex justify-between">
                      <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : !paginatedProducts || paginatedProducts.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border shadow overflow-hidden">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground/70" />
                </div>
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery
                    ? 'Try adjusting your search or filter criteria'
                    : 'No products available in this selection'}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
                  {paginatedProducts.map((product: Product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden shadow hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                      <div className="aspect-square relative bg-muted">
                        <Image
                          src={getProductImage(product) || '/placeholder.svg'}
                          alt={product.name}
                          //             width={100}
                          // height={100}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardHeader className="p-3 md:p-4 flex-grow">
                        <CardTitle className="text-sm md:text-base line-clamp-2">
                          {product.name}
                        </CardTitle>
                        {product.variants && product.variants.length > 0 && (
                          <div className="text-base md:text-lg font-bold text-primary whitespace-nowrap mt-1">
                            $
                            {getLowestPrice(
                              product.variants,
                              product.id
                            )?.toFixed(2)}
                          </div>
                        )}
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <select
                              className="w-full text-xs p-1 border rounded"
                              value={selectedVariants[product.id] || ''}
                              onChange={(e) =>
                                handleVariantSelect(product.id, e.target.value)
                              }
                            >
                              <option value="">Select variant</option>
                              {product.variants.map((variant) => (
                                <option
                                  key={variant.id}
                                  value={variant.id}
                                  disabled={!variant.isAvailable}
                                >
                                  {variant.title} - ${variant.price.toFixed(2)}{' '}
                                  - {variant.color}
                                  {!variant.isAvailable && ' (Unavailable)'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </CardHeader>
                      <CardFooter className="p-3 md:p-4 pt-0 flex justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs md:text-sm"
                          onClick={() => {
                            const variant = getSelectedVariant(product);
                            if (variant) {
                              openVariantModal(product, variant);
                            }
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs md:text-sm"
                          onClick={() => {
                            const variant = getSelectedVariant(product);
                            if (variant) {
                              handleAddToCart(product, variant);
                            } else {
                              product.variants?.[0] &&
                                handleAddToCart(product, product.variants[0]);
                            }
                          }}
                          disabled={
                            !!product.variants?.length &&
                            getSelectedVariant(product)?.isAvailable === false
                          }
                        >
                          <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          Add
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3 bg-card rounded-lg border shadow overflow-hidden">
                {paginatedProducts.map((product: Product, index: number) => (
                  <div key={product.id}>
                    {index > 0 && <Separator />}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="h-20 w-20 relative bg-muted rounded-md overflow-hidden shadow flex-shrink-0">
                        <Image
                          src={getProductImage(product) || '/placeholder.svg'}
                          alt={product.name}
                          //             width={100}
                          // height={100}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-1">
                          {product.name}
                        </h3>
                        {product.variants && product.variants.length > 0 && (
                          <div className="text-lg font-bold text-primary whitespace-nowrap mt-1">
                            $
                            {getLowestPrice(
                              product.variants,
                              product.id
                            )?.toFixed(2)}
                          </div>
                        )}
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <select
                              className="w-full text-xs p-1 border rounded"
                              value={selectedVariants[product.id] || ''}
                              onChange={(e) =>
                                handleVariantSelect(product.id, e.target.value)
                              }
                            >
                              <option value="">Select variant</option>
                              {product.variants.map((variant) => (
                                <option
                                  key={variant.id}
                                  value={variant.id}
                                  disabled={!variant.isAvailable}
                                >
                                  {variant.title} - ${variant.price.toFixed(2)}{' '}
                                  - {variant.color}
                                  {!variant.isAvailable && ' (Unavailable)'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial"
                          onClick={() => {
                            const variant = getSelectedVariant(product);
                            if (variant) {
                              openVariantModal(product, variant);
                            }
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-initial"
                          onClick={() => {
                            const variant = getSelectedVariant(product);
                            if (variant) {
                              handleAddToCart(product, variant);
                            } else {
                              product.variants?.[0] &&
                                handleAddToCart(product, product.variants[0]);
                            }
                          }}
                          disabled={
                            !!product.variants?.length &&
                            getSelectedVariant(product)?.isAvailable === false
                          }
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6 mb-4 gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          className="w-9 h-9 mx-0.5"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
