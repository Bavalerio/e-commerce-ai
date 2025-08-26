import { 
  users, 
  categories, 
  products, 
  productVariants, 
  carts, 
  cartItems, 
  orders, 
  orderItems 
} from '@/lib/db/schema';

// Database types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// Extended types with relations
export type ProductWithDetails = Product & {
  category?: Category;
  variants?: ProductVariant[];
  images: string[];
};

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product;
    variant?: ProductVariant;
  })[];
};

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
    variant?: ProductVariant;
  })[];
};

// Form types
export interface CheckoutFormData {
  email: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  sameAsBilling: boolean;
  notes?: string;
}

export interface ProductFilterOptions {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Store types
export interface CartStore {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

export interface UIStore {
  isMobileMenuOpen: boolean;
  isCartDrawerOpen: boolean;
  isSearchOpen: boolean;
  theme: 'light' | 'dark';
  installPrompt: BeforeInstallPromptEvent | null;
  setMobileMenuOpen: (open: boolean) => void;
  setCartDrawerOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
}

// PWA types
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}