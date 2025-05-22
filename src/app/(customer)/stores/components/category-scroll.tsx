'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { Category } from '../types';

interface CategoryScrollProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

export function CategoryScroll({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryScrollProps) {
  return (
    <div className="relative my-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategory === category.name ? 'default' : 'outline'
              }
              className="flex-shrink-0 rounded-full px-6 py-6"
              onClick={() => onSelectCategory(category.name)}
            >
              <span className="mr-2 text-xl">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
