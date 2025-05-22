'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronDown, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreCard } from './components/store-card';
import { StoreFilters } from './components/store-filters';
import { CategoryScroll } from './components/category-scroll';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStores,
  setSearchFilter,
  setCategoryFilter,
  setSortBy,
  selectFilteredStores,
  selectStoresStatus,
  selectStoresError,
} from '@/store/slices/customer/userStoresSlice';
import { AppDispatch } from '@/store';
import { Cart } from '@/components/cart/cart';

// Categories for the horizontal scroll (could be moved to Redux state or API later)
const categories = [
  { id: '1', name: 'Cakes', icon: '🎂' },
  { id: '2', name: 'Bread', icon: '🍞' },
  { id: '3', name: 'Pastries', icon: '🥐' },
  { id: '4', name: 'Cookies', icon: '🍪' },
  { id: '5', name: 'Donuts', icon: '🍩' },
  { id: '6', name: 'Coffee', icon: '☕' },
  { id: '7', name: 'Sandwiches', icon: '🥪' },
  { id: '8', name: 'Desserts', icon: '🍰' },
  { id: '9', name: 'Vegan', icon: '🌱' },
  { id: '10', name: 'Gluten-Free', icon: '🌾' },
];

export default function ProductStoreMainPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get data from Redux store with updated selector names
  const filteredStores = useSelector(selectFilteredStores);
  const status = useSelector(selectStoresStatus);
  const error = useSelector(selectStoresError);

  // Fetch stores on component mount
  useEffect(() => {
    dispatch(fetchStores({}));
  }, [dispatch]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    dispatch(setSearchFilter(value));
  };

  // Navigate to store detail page
  const handleStoreClick = (storeId: string | number) => {
    router.push(`/stores/${storeId}`);
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    const newCategory = category === selectedCategory ? null : category;
    setSelectedCategory(newCategory);
    dispatch(setCategoryFilter(newCategory));
  };

  // Handle sort selection
  const handleSortSelect = (
    sortOption: 'rating' | 'distance' | 'deliveryTime'
  ) => {
    dispatch(setSortBy(sortOption));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <section className="max-w-8xl mx-auto">
        {/* Search Bar */}
        <div className="relative w-full my-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for stores..."
            className="pl-10 py-6 text-base border-muted"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Category Scroll */}
        {/* <CategoryScroll
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        /> */}

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {selectedCategory ? `${selectedCategory} Stores` : 'All Stores'}
            </h2>
            <Badge variant="outline" className="text-xs">
              {filteredStores.length} stores
            </Badge>
          </div>

          {/* <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  Sort By
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSortSelect('rating')}>Rating: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortSelect('distance')}>Distance: Near to Far</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortSelect('deliveryTime')}>Delivery Time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </div>

        {/* Filters Panel (conditionally rendered) */}
        {isFilterOpen && (
          <StoreFilters onClose={() => setIsFilterOpen(false)} />
        )}

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="mt-6 ">
          <TabsContent value="all" className="mt-0">
            {status === 'loading' && (
              <div className="text-center py-12">Loading stores...</div>
            )}

            {status === 'failed' && (
              <div className="text-center py-12 text-red-500">
                Error loading stores: {error || 'Something went wrong'}
              </div>
            )}

            {status === 'succeeded' && filteredStores.length === 0 && (
              <div className="text-center py-12">
                No stores found matching your criteria.
              </div>
            )}

            {status === 'succeeded' && filteredStores.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 px-3 gap-6">
                {filteredStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={{
                      ...store,
                      // Provide default values for properties that might be missing
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
            )}
          </TabsContent>

          <TabsContent value="featured" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores
                .filter((store) => store.featured)
                .map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onClick={() => handleStoreClick(store.id)}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="nearest" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores
                .filter((store) => store.distance)
                .sort((a, b) => {
                  const aDistance = parseFloat(
                    a.distance?.replace('km', '').trim() || '999'
                  );
                  const bDistance = parseFloat(
                    b.distance?.replace('km', '').trim() || '999'
                  );
                  return aDistance - bDistance;
                })
                .map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onClick={() => handleStoreClick(store.id)}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="fastest" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores
                .filter((store) => store.deliveryTime)
                .sort((a, b) => {
                  const aTime = parseInt(
                    a.deliveryTime?.split('-')[0] || '999'
                  );
                  const bTime = parseInt(
                    b.deliveryTime?.split('-')[0] || '999'
                  );
                  return aTime - bTime;
                })
                .map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onClick={() => handleStoreClick(store.id)}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
