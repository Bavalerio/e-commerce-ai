export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  category: string;
  brand: string;
  description: string;
  features?: string[];
  inStock: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
  subcategories?: Category[];
  featured?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    categories: string[];
    priceRange: {
      min: number;
      max: number;
    };
    brands: string[];
  };
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  createdAt: Date;
  verified: boolean;
  helpful: number;
  images?: string[];
}

export interface Filter {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select' | 'color';
  values: FilterValue[];
  selected?: string[];
}

export interface FilterValue {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand';
  image?: string;
  count?: number;
}

export interface AIRecommendation {
  id: string;
  type: 'similar' | 'frequently_bought' | 'trending' | 'personalized';
  title: string;
  description: string;
  products: Product[];
  confidence: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  ctaText?: string;
  ctaUrl?: string;
  type: 'hero' | 'promotional' | 'category';
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  content: string;
  location?: string;
  verified: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  children?: NavigationItem[];
  featured?: boolean;
  image?: string;
}

export interface MockupProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}