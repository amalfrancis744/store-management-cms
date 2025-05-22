import axiosInstance from '@/api/axios-config';

export const verifyStripeSession = async (sessionId: string) => {
  try {
    const response = await axiosInstance.get(
      `/orders/payment-success?session_id=${sessionId}`
    );

    if (response.status !== 200) {
      const errorData = response.data || null;
      throw new Error(errorData?.message || `API error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Stripe verification error:', error);
    // Re-throw the error so it can be handled by the component
    throw error;
  }
};
