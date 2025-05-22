export type User = {
  id: string;
  name: string;
  email: string;
  roles: Array<'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'>;
  locationId: string | null;
  workspaceId: string | null;
};
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

export type NavItem = {
  name: string;
  href: string;
  allowedRoles: Array<'user' | 'admin'>;
};

export type Toast = {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
};

export type DashboardStat = {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
};

export interface Workspace {
  id: string;
  name: string;
  description: string;
  images: string[];
  openingTime: string;
  closingTime: string;
}

export interface Category {
  products: any;
  id: string;
  name: string;
  description: string;
  workspaceId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  title: string;
  sku: string;
  price: number;
  stock: number;
  color?: string;
  size?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  images: string[];
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  images: string[];
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  createdAt: string;
  description?: string;
  rating?: number;
  categories?: string[];
  distance?: string;
  deliveryTime?: string;
  featured?: boolean;
}
export interface Variant {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  weight: number | null;
  dimensions: string | null;
  color: string;
  size: string;
  isAvailable: boolean;
  product: string | {};
}
export interface CartItem {
  variantId: string;

  quantity: number;
}
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}
export interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  isOpen: boolean;
}

export interface Order {
  id: string;
  userId: string;
  shippingAddressId: string;
  billingAddressId: string;
  workspaceId: number;
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE' | string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | string;
  totalAmount: number;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | string;
  notes?: string;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  stripeSessionId?: string | null;
  paidAt?: string | null;
  paymentDetails?: any;

  items: OrderItem[];
  user: User;
  shippingAddress: Address;
  billingAddress: Address;
}

interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: number;
  variant: ProductVariant;
}

interface Address {
  id: string;
  userId: string;
  address: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceInfo {
  name?: string;
  images?: string[];
  isActive?: boolean;
  description?: string;
  createdAt?: string;
}

interface InventorySummary {
  totalProducts?: number;
  totalCategories?: number;
  lowStockProducts?: number;
}

interface Orders {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  totalAmount: number;
  placedAt: string;
  status: string;
}

interface PendingBill {
  id: string;
  user: {
    firstName: string;
  };
  totalAmount: number;
  createdAt: string;
}

interface OrdersSummary {
  recentOrdersCount?: number;
  recentOrders?: Orders[];
  pendingBills?: PendingBill[];
}

export interface CurrentWorkspace {
  workspaceInfo?: WorkspaceInfo;
  inventorySummary?: InventorySummary;
  ordersSummary?: OrdersSummary;
}
