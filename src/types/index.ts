import { 
  users, 
  categories, 
  products, 
  productVariants, 
  carts, 
  cartItems, 
  orders, 
  orderItems,
  userPreferences,
  productReviews,
  wishlists,
  wishlistItems,
  searchHistory,
  chatConversations,
  chatMessages,
  productRecommendations,
  productAnalytics
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

// AI Feature types
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;

export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;

export type ChatConversation = typeof chatConversations.$inferSelect;
export type NewChatConversation = typeof chatConversations.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type ProductRecommendation = typeof productRecommendations.$inferSelect;
export type NewProductRecommendation = typeof productRecommendations.$inferInsert;

export type ProductAnalytics = typeof productAnalytics.$inferSelect;
export type NewProductAnalytics = typeof productAnalytics.$inferInsert;

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
  systemTheme: 'light' | 'dark';
  themePreference: 'light' | 'dark' | 'system';
  locale: string;
  installPrompt: BeforeInstallPromptEvent | null;
  setMobileMenuOpen: (open: boolean) => void;
  setCartDrawerOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setThemePreference: (preference: 'light' | 'dark' | 'system') => void;
  updateSystemTheme: (systemTheme: 'light' | 'dark') => void;
  setLocale: (locale: string) => void;
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

// AI Feature Types
export interface VisualSearchRequest {
  imageUrl?: string;
  imageBase64?: string;
  description?: string;
  filters?: Record<string, any>;
  confidence?: number;
}

export interface VisualSearchResponse {
  query: {
    type: string;
    description?: string;
    imageUrl?: string;
    confidence: number;
    filters: Record<string, any>;
  };
  results: ProductMatch[];
  analytics: {
    totalResults: number;
    exactMatches: number;
    similarMatches: number;
    avgConfidence: number;
    processingTime: number;
  };
  suggestions: {
    refineSearch: SearchRefinement[];
    relatedQueries: string[];
  };
}

export interface ProductMatch extends Product {
  matchConfidence: number;
  matchReason: string;
  similarity: {
    visual?: number;
    color?: number;
    shape?: number;
    texture?: number;
  };
}

export interface SearchRefinement {
  type: string;
  label: string;
  filters: Record<string, any>;
}

export interface ChatMessageRequest {
  message: string;
  conversationId?: string;
  context?: Record<string, any>;
}

export interface ChatMessageResponse {
  conversationId: string;
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    messageType: 'text' | 'product_recommendation' | 'image' | 'quick_reply';
    metadata?: {
      products?: Array<{
        id: string;
        reason?: string;
        confidence?: number;
      }>;
      images?: string[];
      quickReplies?: string[];
      aiModel?: string;
      processingTime?: number;
    };
    createdAt: string;
  };
  context: Record<string, any>;
  suggestions: string[];
}

export interface RecommendationRequest {
  type: 'personalized' | 'similar' | 'complementary' | 'trending' | 'cross_sell' | 'up_sell' | 'recently_viewed';
  productId?: string;
  categoryId?: string;
  limit?: number;
  includeReasons?: boolean;
}

export interface RecommendationResponse {
  type: string;
  recommendations: ProductWithRecommendationData[];
  metadata: {
    totalResults: number;
    generatedAt: string;
    algorithm: string;
    personalized: boolean;
  };
}

export interface ProductWithRecommendationData extends Product {
  reason?: string;
  score?: number;
  recommendationScore?: number;
}

export interface EnhancedSearchRequest {
  query?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  colors?: string[];
  sizes?: string[];
  brands?: string[];
  minRating?: string;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  aiEnhanced?: boolean;
  includeFilters?: boolean;
}

export interface EnhancedSearchResponse {
  query: {
    text: string;
    filters: Record<string, any>;
    aiEnhanced: boolean;
    sortBy: string;
    sortOrder: string;
  };
  results: ProductWithRelevance[];
  pagination: PaginatedResponse<any>['pagination'];
  aiInsights?: {
    searchIntent: string;
    resultsSummary: {
      totalProducts: number;
      avgPrice: number;
      topCategories: Array<{ name: string; count: number }>;
      priceRange: { min: number; max: number };
    };
    recommendations: string[];
    trendsInsights: string[];
  };
  dynamicFilters?: {
    categories: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ range: string; label: string; count: number }>;
    colors: Array<{ name: string; hex: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    ratings: Array<{ stars: number; count: number }>;
  };
  suggestions: {
    autoComplete?: string[];
    related?: string[];
    refinements?: string[];
    trending?: string[];
    categories?: string[];
  };
  metadata: {
    searchTime: number;
    algorithm: string;
    personalized: boolean;
  };
}

export interface ProductWithRelevance extends Product {
  relevanceScore?: number;
  categoryName?: string;
  categorySlug?: string;
}

export interface StyleProfile {
  modern?: number;
  traditional?: number;
  minimalist?: number;
  bohemian?: number;
  industrial?: number;
  scandinavian?: number;
}

export interface StyleQuizAnswer {
  questionId: number;
  selectedOption: string;
}

export interface StyleQuizResult {
  styleProfile: {
    primaryStyle: {
      name: string;
      score: number;
      percentage: number;
    };
    secondaryStyles: Array<{
      name: string;
      score: number;
      percentage: number;
    }>;
    confidence: number;
    allScores: StyleProfile;
  };
  styleScores: StyleProfile;
  preferences: UserPreferences;
  recommendations: {
    primaryStyle: {
      name: string;
      recommendations: {
        colors?: string[];
        materials?: string[];
        furniture?: string[];
        tips?: string[];
      };
    };
    blendedRecommendations: {
      colors: string[];
      materials: string[];
      furniture: string[];
      tips: string[];
    };
  };
  analysis: {
    primaryStyle: string;
    secondaryStyles: string[];
    confidence: number;
    description: string;
  };
}

export interface WishlistWithItems extends Wishlist {
  items: Array<WishlistItem & {
    product: Product;
    variant?: ProductVariant;
  }>;
}

export interface ReviewWithUser extends ProductReview {
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'imageUrl'>;
}