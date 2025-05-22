'use client';

import { Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Workspace } from '../types';
import Image from 'next/image';

interface StoreCardProps {
  store: Workspace;
  onClick: () => void;
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <Image
            src={store.images[0] || '/placeholder.svg?height=300&width=400'}
            alt={store.name}
            // width={100}
            //   height={100}
            fill
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {store.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}

        <div className="absolute bottom-3 left-3 flex gap-1">
          {store.categories?.slice(0, 3).map((category, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-black/70 text-white text-xs"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{store.name}</h3>
          <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md">
            <Star className="fill-yellow-400 stroke-yellow-400 h-4 w-4" />
            <span className="text-sm font-medium">{store.rating}</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {store.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-primary/70" />
            <span>{store.distance}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary/70" />
            <span>
              {store.openingTime} - {store.closingTime}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-3">
        {/* <div className="text-sm font-medium text-primary">{store.deliveryTime} delivery</div> */}
        <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
          View Store
          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </CardFooter>
    </Card>
  );
}
