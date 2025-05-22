'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchCart,
  removeItemFromCart,
  updateCartItemQuantity,
  closeCart,
  selectCartItems,
  selectCartTotal,
  selectIsCartOpen,
  selectCartLoading,
  selectCartError,
} from '@/store/slices/customer/cartSlice';
import { useEffect } from 'react';

export function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const isOpen = useSelector(selectIsCartOpen);
  const isLoading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);

  // Fetch cart data when the cart is opened
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCart());
    }
  }, [dispatch, isOpen]);

  console.log('Cart items (sidebar):', items);

  const handleDecrement = (variantId: string, quantity: number) => {
    if (quantity > 1) {
      dispatch(updateCartItemQuantity({ variantId, quantity: quantity - 1 }));
    } else {
      dispatch(removeItemFromCart(variantId));
    }
  };

  const handleIncrement = (variantId: string, quantity: number) => {
    dispatch(updateCartItemQuantity({ variantId, quantity: quantity + 1 }));
  };

  const handleRemove = (variantId: string) => {
    dispatch(removeItemFromCart(variantId));
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) =>
        open ? dispatch(fetchCart()) : dispatch(closeCart())
      }
    >
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-6 w-6" />
            Shopping Cart (
            {items.reduce((count, item) => count + item.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-lg text-muted-foreground">Loading cart...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/" onClick={() => dispatch(closeCart())}>
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Your cart is empty
            </p>
            <p className="text-sm text-muted-foreground">
              Start shopping to add items to your cart
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[68vh] pr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      {(item.color || item.size) && (
                        <p className="text-sm text-muted-foreground">
                          {[item.color, item.size].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDecrement(item.variantId, item.quantity)
                          }
                        >
                          -
                        </Button>
                        <span className="text-sm w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleIncrement(item.variantId, item.quantity)
                          }
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-destructive"
                          onClick={() => handleRemove(item.variantId)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout" onClick={() => dispatch(closeCart())}>
                  Proceed to Checkout
                </Link>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/cart" onClick={() => dispatch(closeCart())}>
                  View Full Cart
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
