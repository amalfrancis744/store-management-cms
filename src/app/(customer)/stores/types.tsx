export interface Workspace {
  id: string;
  name: string;
  description: string;
  images: string[];
  openingTime: string;
  closingTime: string;
  rating?: number;
  categories?: string[];
  distance?: string;
  deliveryTime?: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
