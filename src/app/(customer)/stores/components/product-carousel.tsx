'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
}

interface ProductCarouselProps {
  products: Product[];
  title?: string;
}

export function ProductCarousel({
  products,
  title = 'Featured Products',
}: ProductCarouselProps) {
  if (!products.length) return null;

  return (
    <div className="mb-8">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="h-full">
                <CardContent className="p-0">
                  <div className="aspect-square relative bg-muted">
                    <Image
                      src="/placeholder.svg?height=200&width=200"
                      alt={product.name}
                      width={100}
                      height={100}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
                <div className="p-4">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                </div>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/product/${product.id}`}>View</Link>
                  </Button>
                  <Button size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
}
