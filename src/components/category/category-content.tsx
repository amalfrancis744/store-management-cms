'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { themeQuartz, iconSetMaterial } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Search, ArrowLeft } from 'lucide-react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/store/slices/admin/categorySlice';
import { RootState, AppDispatch } from '@/store/index';
import { AddCategory } from '@/components/category/leads/addCategory';
import { Category } from '@/types';

// Register modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom theme
const myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  accentColor: '#245E4C',
  borderRadius: 4,
  cellTextColor: '#040B09',
  fontFamily: 'inherit',
  fontSize: 14,
  headerBackgroundColor: '#F1F2F2',
  headerFontWeight: 600,
  wrapperBorderRadius: 8,
});

export default function WorkspaceCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Get active workspace from Redux store
  const { activeWorkspace } = useSelector(
    (state: RootState) => state.workspace
  );
  const workspaceId: any = activeWorkspace;

  // Get categories for the active workspace
  const { categories, isLoading } = useSelector((state: RootState) => {
    return {
      categories: state.category.categories[workspaceId] || [],
      isLoading: state.category.isLoading,
    };
  });

  // Get workspace details
  const workspace = useSelector((state: RootState) =>
    state.workspace.workspaces.find((w) => w.id === workspaceId)
  );

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const gridRef = useRef<AgGridReact>(null);

  // Redirect if no active workspace
  useEffect(() => {
    if (!workspaceId) {
      router.push('/workspace');
    }
  }, [workspaceId, router]);

  // Fetch categories when component mounts or active workspace changes
  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchCategories(workspaceId));
    }
  }, [dispatch, workspaceId]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Column definitions
  const columnDefs = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Category Name',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 2,
        minWidth: 200,
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
    []
  );

  // Default column definitions
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  // Handle adding a new category
  const handleAddCategory = (newCategory: {
    name: string;
    description: string;
  }) => {
    if (!workspaceId) return;

    dispatch(
      createCategory({
        workspaceId,
        categoryData: {
          name: newCategory.name,
          description: newCategory.description,
          workspaceId,
          products: undefined,
        },
      })
    );
  };

  // Handle editing a category
  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  // Save edited category
  const saveEditedCategory = () => {
    if (!currentCategory || !workspaceId) return;

    dispatch(
      updateCategory({
        workspaceId,
        categoryId: currentCategory.id,
        categoryData: {
          name: currentCategory.name,
          description: currentCategory.description,
        },
      })
    );

    setIsEditDialogOpen(false);
    setCurrentCategory(null);
  };

  // Handle deleting a category
  const handleDelete = (categoryId: string) => {
    if (!workspaceId) return;

    if (confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory({ workspaceId, categoryId }));
    }
  };

  // Show loading state if no active workspace is selected
  if (!workspaceId) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No workspace selected. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBackToWorkspaces} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-semibold text-gray-800">
            {workspace?.name || 'Workspace'} - Categories
          </h2>
        </div> */}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <AddCategory onAddCategory={handleAddCategory} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div
            className="ag-theme-quartz"
            style={{ height: '400px', width: '100%' }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={filteredCategories}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
              theme={myTheme}
            />
          </div>
        )}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <Pencil className="h-4 w-4 text-blue-600" />
              </div>
              Edit Category
            </DialogTitle>
          </DialogHeader>
          {currentCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={currentCategory.name}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentCategory.description}
                  onChange={(e) =>
                    setCurrentCategory({
                      ...currentCategory,
                      description: e.target.value,
                    })
                  }
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveEditedCategory}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
