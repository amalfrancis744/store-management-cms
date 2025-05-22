'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentOrder } from '@/store/slices/customer/orderSlice';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { verifyStripeSession } from '@/service/orderService';

export default function OrderConfirmationPage() {
  const currentOrder = useSelector(selectCurrentOrder);
  const searchParams = useSearchParams();
  const fromStripe = searchParams.get('from') === 'stripe';
  const stripeSessionId =
    searchParams.get('session_id') ||
    sessionStorage.getItem('stripe_session_id');
  const [paymentVerified, setPaymentVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const verifyPayment = async () => {
      if (fromStripe && stripeSessionId) {
        setLoading(true);
        try {
          // Add timeout to prevent infinite loading if server is down
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 10000)
          );

          const fetchPromise = verifyStripeSession(stripeSessionId);

          // Race between the fetch and the timeout
          const result = await Promise.race([fetchPromise, timeoutPromise]);

          setPaymentVerified(result.status === 'paid');
          if (result.status === 'paid') {
            sessionStorage.removeItem('stripe_session_id');
          }
        } catch (error: any) {
          console.error('Payment verification failed:', error);
          setError(true);
          setErrorDetails(
            error.message || 'Failed to connect to payment server'
          );
          // Assume payment success if we can't verify - safer user experience
          // The backend will verify again through webhooks
          setPaymentVerified(true);
        } finally {
          setLoading(false);
        }
      }
    };

    verifyPayment();
  }, [fromStripe, stripeSessionId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="mt-4 text-lg">Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div
            className={`rounded-full ${error ? 'bg-yellow-100' : 'bg-green-100'} p-3`}
          >
            {error ? (
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            ) : (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          Thank You for Your Order!
        </h1>

        {fromStripe ? (
          error ? (
            <div className="mb-8">
              <p className="text-muted-foreground">
                We couldn&quot;t verify your payment status due to a connection
                issue, but your order has been recorded.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                If your payment was successful, you&quot;ll receive a
                confirmation email shortly.
              </p>
              {errorDetails && (
                <p className="text-xs text-red-500 mt-2">
                  Error: {errorDetails}
                </p>
              )}
            </div>
          ) : paymentVerified ? (
            <p className="text-muted-foreground mb-8">
              Your payment was successful and your order has been placed.
            </p>
          ) : (
            <p className="text-muted-foreground mb-8">
              We&quot;re having trouble verifying your payment. Please check
              your email for confirmation or contact support.
            </p>
          )
        ) : (
          <p className="text-muted-foreground mb-8">
            {currentOrder?.paymentMethod === 'CASH'
              ? "Your order has been placed successfully. You'll pay when your order is delivered."
              : "Your order has been placed successfully. We'll start processing it right away."}
          </p>
        )}

        {currentOrder && (
          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-lg mb-4">Order Details</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{currentOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">
                  {currentOrder.paymentMethod === 'CASH'
                    ? 'Cash on Delivery'
                    : 'Online Payment (Stripe)'}
                </span>
              </div>
              {currentOrder?.total && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">
                    ${currentOrder?.total?.toFixed(2)}
                  </span>
                </div>
              )}
              {fromStripe && paymentVerified && !error && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium text-green-600">Paid</span>
                </div>
              )}
              {fromStripe && error && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium text-yellow-600">
                    Verification Pending
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Shipping Address:</h3>
              <address className="not-italic text-sm text-muted-foreground">
                {currentOrder?.shippingAddress?.address}
                <br />
                {currentOrder?.shippingAddress?.city &&
                  `${currentOrder.shippingAddress.city}, `}
                {currentOrder?.shippingAddress?.region &&
                  `${currentOrder.shippingAddress.region}, `}
                {currentOrder?.shippingAddress?.postalCode &&
                  `${currentOrder.shippingAddress.postalCode}, `}
                {currentOrder?.shippingAddress?.country}
              </address>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/stores">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Your Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
