'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  clearCartItems,
  selectCartItems,
  selectCartTotal,
} from '@/store/slices/customer/cartSlice';
import {
  createOrder,
  selectOrderStatus,
  selectOrderError,
  resetOrderStatus,
  selectStripeUrl,
  selectStripeSessionId,
  clearStripeUrl,
} from '@/store/slices/customer/orderSlice';
import { CheckoutForm } from '@/components/checkout/checkoutForm';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserDeatilesApi } from '@/api/customer/getUser-api';

export default function CheckoutPage() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const orderStatus = useSelector(selectOrderStatus);
  const orderError = useSelector(selectOrderError);
  const stripeUrl = useSelector(selectStripeUrl);
  const stripeSessionId = useSelector(selectStripeSessionId);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'STRIPE' | ''>(
    ''
  );
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState<boolean>(false);
  interface Address {
    id: string;
    address: string;
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  }

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [error, setError] = useState('');
  const [newAddress, setNewAddress] = useState({
    address: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
  });
  const [notes, setNotes] = useState<string>('');
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);

  // Fetch user addresses when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const response = await UserDeatilesApi.getUserAddress();
        if (response.data && response.data.stores) {
          setSavedAddresses(response.data.stores);
          // If addresses exist, select the first one by default
          if (response.data.stores.length > 0) {
            setSelectedAddress(response.data.stores[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
        setError('Failed to load saved addresses');
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
    dispatch(resetOrderStatus());
  }, [dispatch]);

  // Handle order creation status and Stripe redirect
  useEffect(() => {
    if (orderStatus === 'succeeded') {
      if (paymentMethod === 'CASH') {
        // For cash payments, clear cart and redirect to confirmation
        dispatch(clearCartItems());
        router.push('/order-confirmation');
      } else if (paymentMethod === 'STRIPE' && stripeUrl) {
        // For Stripe payments, redirect to Stripe checkout
        setPaymentProcessing(true);
        // Store stripe session ID in sessionStorage for later verification if needed
        if (stripeSessionId) {
          sessionStorage.setItem('stripe_session_id', stripeSessionId);
        }
        window.location.href = stripeUrl;
      }
    } else if (orderStatus === 'failed' && orderError) {
      alert(`Order creation failed: ${orderError}`);
    }
  }, [
    orderStatus,
    orderError,
    stripeUrl,
    stripeSessionId,
    paymentMethod,
    router,
    dispatch,
  ]);

  // Check for success or cancel query params when returning from Stripe
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const paymentStatus = queryParams.get('payment');
    if (paymentStatus === 'success') {
      dispatch(clearCartItems());
      dispatch(clearStripeUrl());
      router.push('/order-confirmation?from=stripe&status=success');
    } else if (paymentStatus === 'cancel') {
      dispatch(clearStripeUrl());
    }
  }, [router, dispatch]);

  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    if (!selectedAddress && !useNewAddress) {
      alert('Please select an address or choose to add a new one');
      return;
    }
    if (useNewAddress && !newAddress.address) {
      alert('Please fill in the new address details');
      return;
    }

    // Create the order payload based on whether using saved address or new address
    const orderPayload = {
      paymentMethod,
      notes: notes || 'dont knock',
      // For new addresses, include full address details
      // For saved addresses, use addressId fields instead
      ...(useNewAddress
        ? {
            shippingAddress: newAddress,
            billingAddress: newAddress,
          }
        : {
            shippingAddressId: selectedAddress,
            billingAddressId: selectedAddress,
          }),
      items: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      // Add success and cancel URLs for Stripe
      successUrl: `${window.location.origin}/checkout?payment=success`,
      cancelUrl: `${window.location.origin}/checkout?payment=cancel`,
    };

    dispatch(createOrder(orderPayload));
  };

  const handleNewAddressChange = (field: any, value: any) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate final total
  const shippingCost = 0.0;
  const taxAmount = total * 0.0;
  const finalTotal = total + shippingCost + taxAmount;

  // Format address for display
  const formatAddressDisplay = (address: Address) => {
    const parts = [];
    if (address.address) parts.push(address.address);
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);

    return parts.join(', ');
  };

  if (paymentProcessing) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirecting to Payment...</h2>
          <p className="text-muted-foreground mb-6">
            Please wait while we redirect you to our secure payment page.
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8">
      <div className="flex-1 w-full">
        {items.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div>
              {/* Check if returning from a cancelled payment */}
              {new URLSearchParams(window.location.search).get('payment') ===
                'cancel' && (
                <Alert className="mb-6" variant="destructive">
                  <AlertTitle>Payment Cancelled</AlertTitle>
                  <AlertDescription>
                    Your payment was cancelled. You can try again or choose a
                    different payment method.
                  </AlertDescription>
                </Alert>
              )}

              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
                Shipping Information
              </h2>

              {/* Display loading state for addresses */}
              {isLoadingAddresses ? (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">
                    Loading your saved addresses...
                  </p>
                </div>
              ) : error ? (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="mb-4">
                  {savedAddresses.length > 0 ? (
                    <>
                      <Label
                        htmlFor="address-select"
                        className="text-sm font-medium"
                      >
                        Select Address
                      </Label>
                      <Select
                        value={selectedAddress}
                        onValueChange={(value) => {
                          setSelectedAddress(value);
                          setUseNewAddress(false);
                        }}
                        disabled={useNewAddress || isLoadingAddresses}
                      >
                        <SelectTrigger id="address-select" className="mt-1">
                          <SelectValue placeholder="Choose an address" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedAddresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {formatAddressDisplay(address)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : !useNewAddress ? (
                    <p className="text-sm text-muted-foreground mb-2">
                      No saved addresses found.
                    </p>
                  ) : null}

                  <Button
                    variant="link"
                    className="mt-2 text-sm"
                    onClick={() => {
                      setUseNewAddress(!useNewAddress);
                      if (!useNewAddress) {
                        setSelectedAddress('');
                      } else if (savedAddresses.length > 0) {
                        setSelectedAddress(savedAddresses[0].id);
                      }
                    }}
                  >
                    {useNewAddress ? 'Use Saved Address' : 'Add New Address'}
                  </Button>
                </div>
              )}

              {useNewAddress && (
                <CheckoutForm
                  onChange={handleNewAddressChange}
                  values={newAddress}
                />
              )}

              <div className="mt-4">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Order Notes
                </Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full p-2 border rounded"
                  placeholder="E.g., dont knock"
                />
              </div>
            </div>

            <div>
              <div className="border rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {item.name} × {item.quantity}
                        </p>
                        {(item.color || item.size) && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {[item.color, item.size]
                              .filter(Boolean)
                              .join(' • ')}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-sm sm:text-base">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}

                  <Separator className="my-2" />

                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      ${shippingCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>

                  <div className="mt-3">
                    <Label
                      htmlFor="payment-method"
                      className="text-sm font-medium"
                    >
                      Payment Method
                    </Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(value as 'CASH' | 'STRIPE')
                      }
                    >
                      <SelectTrigger id="payment-method" className="mt-1">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash on Delivery</SelectItem>
                        <SelectItem value="STRIPE">
                          Online Payment (Stripe)
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {paymentMethod === 'STRIPE' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        You will be redirected to Stripe's secure payment page
                        after placing your order.
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full mt-3 sm:mt-4"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={
                      !paymentMethod ||
                      (!selectedAddress && !useNewAddress) ||
                      (useNewAddress && !newAddress.address) ||
                      orderStatus === 'loading'
                    }
                  >
                    {orderStatus === 'loading'
                      ? 'Processing...'
                      : 'Place Order'}
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
