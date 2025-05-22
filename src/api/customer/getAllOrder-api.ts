import axiosInstance from '../axios-config';
import { Order } from '@/types';

export const ordersAPI = {
  //   Get all orders for a user
  getUserAllOrders: async (userId: string) => {
    try {
      const response = await axiosInstance.get<Order[]>(
        `/orders/users/${userId}`
      );
      return { data: { orders: response.data } };
    } catch (error) {
      throw error;
    }
  },

  // cancel an order
  cancelOrder: async (orderId: string) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
      return { data: { order: response.data.data } };
    } catch (error) {
      throw error;
    }
  },
};
