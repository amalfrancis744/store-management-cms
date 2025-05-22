'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchProducts,
  deleteProduct,
  setCurrentProduct,
  clearCurrentProduct,
} from '@/store/slices/admin/productSlice';
import { fetchCategories } from '@/store/slices/admin/categorySlice';
import { themeQuartz, iconSetMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { Product } from '@/types';
import type { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Trash2, Search, Plus, ArrowLeft, Filter } from 'lucide-react';
import ProductForm from '@/components/product/productForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Register modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom theme
const myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  accentColor: '#6366f1',
  borderRadius: 4,
  cellTextColor: '#040B09',
  fontFamily: 'inherit',
  fontSize: 14,
  headerBackgroundColor: '#F1F2F2',
  headerFontWeight: 600,
  wrapperBorderRadius: 8,
});

export default function ProductManagement() {
  const { activeWorkspace } = useSelector(
    (state: RootState) => state.workspace
  );
  const workspaceId: any = activeWorkspace;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);

  const { products, isLoading } = useAppSelector((state) => ({
    products: state.product.products[workspaceId] || [],
    isLoading: state.product.isLoading,
  }));

  const { categories } = useAppSelector((state) => ({
    categories: state.category.categories[workspaceId] || [],
  }));

  const { currentProduct } = useAppSelector((state) => state.product);

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchProducts(workspaceId));
      dispatch(fetchCategories(workspaceId));
    }
  }, [workspaceId, dispatch]);

  // Filter products based on search query and selected categories
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by search query
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Filter by selected categories
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.categoryId);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategories]);

  // Column definitions for AG Grid
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Product',
        field: 'name',
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center gap-3">
              {params.data.images?.length > 0 ? (
                <div className="h-10 w-10 rounded-md overflow-hidden">
                  <Image
                    src={params.data.images[0] || '/placeholder.svg'}
                    alt={params.data.name}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                  <span className="text-xs">No img</span>
                </div>
              )}
              <div>
                <div className="font-medium">{params.data.name}</div>
                {params.data.description && (
                  <div className="text-xs text-gray-500 truncate max-w-[250px]">
                    {params.data.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Category',
        field: 'categoryId',
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: any) => {
          const category = categories.find((c) => c.id === params.value);
          return category ? category.name : params.value;
        },
      },
      {
        headerName: 'Variants',
        field: 'variants',
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => {
          const variants = params.value || [];
          const minPrice =
            variants.length > 0
              ? Math.min(...variants.map((v: any) => v.price))
              : 0;

          return (
            <div>
              <div className="font-medium">{variants.length} variants</div>
              {variants.length > 0 && (
                <div className="text-xs text-gray-500">
                  From ${minPrice.toFixed(2)}
                </div>
              )}
            </div>
          );
        },
      },
      {
        headerName: 'Actions',
        width: 120,
        cellRenderer: (params: any) => {
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(params.data)}
              >
                <Pencil className="h-4 w-4 text-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(params.data.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [categories]
  );

  // Default column definitions
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const handleEdit = (product: Product) => {
    dispatch(setCurrentProduct(product));
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct({ workspaceId: workspaceId!, productId }));
    }
  };

  const handleCreate = () => {
    dispatch(clearCurrentProduct());
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    if (workspaceId) {
      dispatch(fetchProducts(workspaceId));
    }
  };

  const handleCategoryFilterChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBackToDashboard} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-semibold text-gray-800">Product Management</h2>
        </div> */}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by Category
                  {selectedCategories.length > 0 && (
                    <span className="ml-1 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                      {selectedCategories.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() =>
                      handleCategoryFilterChange(category.id)
                    }
                  >
                    {category.name}
                  </DropdownMenuCheckboxItem>
                ))}
                {categories.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    No categories found
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Product
          </Button>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div
            className="ag-theme-quartz"
            style={{ height: '400px', width: '100%' }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={filteredProducts}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
              theme={myTheme}
              domLayout="normal"
            />
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              {currentProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>

          <ProductForm
            workspaceId={workspaceId!}
            product={currentProduct || undefined}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
