// types/order.ts
export interface OrderItem {
  quantity: number;
  price: number;
  variant: {
    id: string;
    title: string;
    sku: string;
    price: number;
    stock: number;
    color: string;
    size: string;
    productName?: string;
  };
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  placedAt: string;
  items: OrderItem[];
  userId: string;
  paymentMethod?: 'CASH' | 'CARD' | 'ONLINE' | string;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | string;
  notes?: string;
  shippingAddress?: {
    address?: string;
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  shippingAddressId?: string;
  billingAddressId?: string;
  workspaceId?: number;
  createdAt?: string;
  updatedAt?: string;
  stripeSessionId?: string | null;
  paidAt?: string | null;
  paymentDetails?: any;
  billingAddress?: {};
}
