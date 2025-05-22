'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import {
  fetchCart,
  removeItemFromCart,
  updateCartItemQuantity,
  selectCartItems,
  selectCartTotal,
  selectCartLoading,
  selectCartError,
} from '@/store/slices/customer/cartSlice';
import { useEffect } from 'react';

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const isLoading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);

  // Fetch cart data when the component mounts
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  console.log('Cart items:', items);

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
    <div className="min-h-screen w-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8">
      <div className="flex-1 w-full">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <p className="text-lg text-muted-foreground">Loading cart...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button asChild size="lg" className="w-full sm:w-auto px-4 sm:px-6">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 border rounded-lg">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-medium mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Start shopping to add items to your cart
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto px-4 sm:px-6">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex flex-col sm:flex-row gap-4 border-b pb-6 last:border-b-0"
                  >
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        //           width={100}
                        // height={100}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg leading-tight">
                            {item.name}
                          </h3>
                          {(item.color || item.size) && (
                            <p className="text-sm text-muted-foreground">
                              {[item.color, item.size]
                                .filter(Boolean)
                                .join(' • ')}
                            </p>
                          )}
                          <p className="font-medium text-base text-primary">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/80 sm:self-start"
                          onClick={() => handleRemove(item.variantId)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8"
                            onClick={() =>
                              handleDecrement(item.variantId, item.quantity)
                            }
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-base font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8"
                            onClick={() =>
                              handleIncrement(item.variantId, item.quantity)
                            }
                          >
                            +
                          </Button>
                        </div>
                        <p className="font-semibold text-base">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <Button
                    asChild
                    className="w-full mt-4 bg-primary hover:bg-primary/90 transition-colors"
                    size="lg"
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-muted-foreground/30 hover:bg-muted/50"
                    size="lg"
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
