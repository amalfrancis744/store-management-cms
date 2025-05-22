// src/components/cart/CartButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  toggleCart,
  selectCartItemCount,
} from '@/store/slices/customer/cartSlice';
import { Badge } from '@/components/ui/badge';

export function CartButton() {
  const dispatch = useDispatch<AppDispatch>();
  const itemCount = useSelector(selectCartItemCount);

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative"
      onClick={() => dispatch(toggleCart())}
    >
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <Badge
          variant="secondary"
          className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
}
