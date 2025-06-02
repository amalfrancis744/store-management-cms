'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StoreCard } from './components/store-card';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStores,
  selectFilteredStores,
  selectStoresStatus,
  selectStoresError,
} from '@/store/slices/customer/userStoresSlice';
import { AppDispatch } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProductStoreMainPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Get data from Redux store
  const filteredStores = useSelector(selectFilteredStores);
  const status = useSelector(selectStoresStatus);
  const error = useSelector(selectStoresError);

  // Calculate pagination values
  const totalItems = filteredStores.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Current page stores
  const currentStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch stores when dependencies change
  useEffect(() => {
    dispatch(
      fetchStores({
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
      })
    );
  }, [dispatch, currentPage, itemsPerPage, searchQuery]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Navigate to store detail page
  const handleStoreClick = (storeId: string | number) => {
    router.push(`/stores/${storeId}`);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Always show first page
    pages.push(1);

    // Show ellipsis if current page is far from start
    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page if different from first
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 px-3 gap-6 mb-8">
      {Array.from({ length: itemsPerPage }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <section className="max-w-8xl mx-auto">
        {/* Search Bar */}
        <div className="relative w-full my-4 md:my-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for stores..."
            className="pl-10 py-6 text-base border-muted"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Store count info */}
        {status === 'succeeded' && totalItems > 0 && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Showing {startItem} to {endItem} of {totalItems} stores
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {itemsPerPage}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {[10, 20, 50, 100].map((num) => (
                    <DropdownMenuItem
                      key={num}
                      onClick={() => handleItemsPerPageChange(num)}
                    >
                      {num}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Store listings */}
        {status === 'loading' && renderLoadingSkeleton()}

        {status === 'failed' && (
          <div className="text-center py-12 text-red-500">
            Error loading stores: {error || 'Something went wrong'}
          </div>
        )}

        {status === 'succeeded' && totalItems === 0 && (
          <div className="text-center py-12">
            No stores found {searchQuery ? `for "${searchQuery}"` : ''}
          </div>
        )}

        {status === 'succeeded' && totalItems > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 px-3 gap-6 mb-8">
              {currentStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={{
                    ...store,
                    id: String(store.id),
                    rating: store.rating || 4.5,
                    distance: store.distance || 'N/A',
                    deliveryTime: store.deliveryTime || 'N/A',
                    categories: store.categories || [],
                    description:
                      store.description || 'No description available',
                    featured: store.featured || false,
                  }}
                  onClick={() => handleStoreClick(store.id)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-8">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className="px-3 py-2 text-gray-500">...</span>
                        ) : (
                          <Button
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handlePageChange(page as number)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
