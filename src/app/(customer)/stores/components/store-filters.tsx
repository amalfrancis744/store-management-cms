'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StoreFiltersProps {
  onClose: () => void;
}

export function StoreFilters({ onClose }: StoreFiltersProps) {
  return (
    <Card className="mb-6 animate-in fade-in-0 zoom-in-95 duration-200">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>Filter Stores</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Dietary Options</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="vegan" />
                <Label htmlFor="vegan">Vegan Options</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="vegetarian" />
                <Label htmlFor="vegetarian">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="gluten-free" />
                <Label htmlFor="gluten-free">Gluten Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="dairy-free" />
                <Label htmlFor="dairy-free">Dairy Free</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Distance</h3>
            <div className="px-2">
              <Slider defaultValue={[5]} max={10} step={0.5} />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>0 km</span>
                <span>5 km</span>
                <span>10 km</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Price Range</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="price-1" />
                <Label htmlFor="price-1">$</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="price-2" />
                <Label htmlFor="price-2">$$</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="price-3" />
                <Label htmlFor="price-3">$$$</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="price-4" />
                <Label htmlFor="price-4">$$$$</Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          Clear All
        </Button>
        <Button>Apply Filters</Button>
      </CardFooter>
    </Card>
  );
}
