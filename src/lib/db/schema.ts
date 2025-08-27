import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  decimal, 
  integer, 
  boolean,
  jsonb,
  index,
  primaryKey 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (synced with Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  parentId: uuid('parent_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('categories_slug_idx').on(table.slug),
  parentIdx: index('categories_parent_idx').on(table.parentId),
}));

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sku: text('sku').unique(),
  barcode: text('barcode'),
  inventory: integer('inventory').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').default(5),
  trackInventory: boolean('track_inventory').default(true),
  continueSellingWhenOutOfStock: boolean('continue_selling_when_out_of_stock').default(false),
  weight: decimal('weight', { precision: 8, scale: 2 }),
  dimensions: jsonb('dimensions').$type<{
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  }>(),
  images: jsonb('images').$type<string[]>().default([]),
  tags: text('tags').array(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  status: text('status', { enum: ['draft', 'active', 'archived'] }).default('draft'),
  featured: boolean('featured').default(false),
  categoryId: uuid('category_id').references(() => categories.id),
  vendorId: text('vendor_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('products_slug_idx').on(table.slug),
  statusIdx: index('products_status_idx').on(table.status),
  categoryIdx: index('products_category_idx').on(table.categoryId),
  vendorIdx: index('products_vendor_idx').on(table.vendorId),
  featuredIdx: index('products_featured_idx').on(table.featured),
}));

// Product variants table
export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sku: text('sku').unique(),
  barcode: text('barcode'),
  inventory: integer('inventory').notNull().default(0),
  weight: decimal('weight', { precision: 8, scale: 2 }),
  image: text('image'),
  position: integer('position').default(0),
  options: jsonb('options').$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  productIdx: index('product_variants_product_idx').on(table.productId),
  skuIdx: index('product_variants_sku_idx').on(table.sku),
}));

// Carts table
export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('carts_user_idx').on(table.userId),
  sessionIdx: index('carts_session_idx').on(table.sessionId),
}));

// Cart items table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  cartIdx: index('cart_items_cart_idx').on(table.cartId),
  productIdx: index('cart_items_product_idx').on(table.productId),
}));

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => users.id).notNull(),
  email: text('email').notNull(),
  status: text('status', { 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] 
  }).default('pending'),
  financialStatus: text('financial_status', {
    enum: ['pending', 'paid', 'partially_paid', 'refunded', 'partially_refunded']
  }).default('pending'),
  fulfillmentStatus: text('fulfillment_status', {
    enum: ['unfulfilled', 'partial', 'fulfilled']
  }).default('unfulfilled'),
  currency: text('currency').default('USD'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb('shipping_address').$type<{
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
  }>(),
  billingAddress: jsonb('billing_address').$type<{
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
  }>(),
  notes: text('notes'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('orders_user_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
  orderNumberIdx: index('orders_number_idx').on(table.orderNumber),
}));

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id),
  title: text('title').notNull(),
  variantTitle: text('variant_title'),
  sku: text('sku'),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.orderId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  carts: many(carts),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  vendor: one(users, {
    fields: [products.vendorId],
    references: [users.id],
  }),
  variants: many(productVariants),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

// User preferences table for AI personalization
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  styleProfile: jsonb('style_profile').$type<{
    modern?: number;
    traditional?: number;
    minimalist?: number;
    bohemian?: number;
    industrial?: number;
    scandinavian?: number;
  }>(),
  budgetPreferences: jsonb('budget_preferences').$type<{
    min: number;
    max: number;
    categories: Record<string, { min: number; max: number }>;
  }>(),
  preferredCategories: text('preferred_categories').array(),
  colorPreferences: text('color_preferences').array(),
  roomTypes: text('room_types').array(),
  sizePreferences: jsonb('size_preferences').$type<{
    livingRoom?: string;
    bedroom?: string;
    dining?: string;
    office?: string;
  }>(),
  brandPreferences: text('brand_preferences').array(),
  notificationSettings: jsonb('notification_settings').$type<{
    priceDrops: boolean;
    restockAlerts: boolean;
    newArrivals: boolean;
    recommendations: boolean;
  }>().default({
    priceDrops: true,
    restockAlerts: true,
    newArrivals: false,
    recommendations: true,
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_preferences_user_idx').on(table.userId),
}));

// Product reviews table
export const productReviews = pgTable('product_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  pros: text('pros').array(),
  cons: text('cons').array(),
  images: text('images').array(),
  verified: boolean('verified').default(false),
  helpful: integer('helpful').default(0),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  aiSentiment: jsonb('ai_sentiment').$type<{
    score: number;
    label: 'positive' | 'neutral' | 'negative';
    aspects: Record<string, number>;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  productIdx: index('product_reviews_product_idx').on(table.productId),
  userIdx: index('product_reviews_user_idx').on(table.userId),
  ratingIdx: index('product_reviews_rating_idx').on(table.rating),
  statusIdx: index('product_reviews_status_idx').on(table.status),
}));

// Wishlist table
export const wishlists = pgTable('wishlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull().default('My Wishlist'),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('wishlists_user_idx').on(table.userId),
}));

// Wishlist items table
export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  wishlistId: uuid('wishlist_id').references(() => wishlists.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  priority: integer('priority').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  wishlistIdx: index('wishlist_items_wishlist_idx').on(table.wishlistId),
  productIdx: index('wishlist_items_product_idx').on(table.productId),
  uniqueItem: index('wishlist_items_unique_idx').on(table.wishlistId, table.productId, table.variantId),
}));

// AI search history table
export const searchHistory = pgTable('search_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  query: text('query').notNull(),
  searchType: text('search_type', { enum: ['text', 'visual', 'voice', 'ai_chat'] }).notNull(),
  imageUrl: text('image_url'),
  filters: jsonb('filters').$type<Record<string, any>>(),
  resultsCount: integer('results_count'),
  clickedProducts: text('clicked_products').array(),
  resultsSatisfaction: integer('results_satisfaction'),
  aiConfidence: decimal('ai_confidence', { precision: 5, scale: 4 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('search_history_user_idx').on(table.userId),
  sessionIdx: index('search_history_session_idx').on(table.sessionId),
  typeIdx: index('search_history_type_idx').on(table.searchType),
  createdIdx: index('search_history_created_idx').on(table.createdAt),
}));

// AI chat conversations table
export const chatConversations = pgTable('chat_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  title: text('title'),
  context: jsonb('context').$type<{
    intent?: string;
    products?: string[];
    budget?: { min: number; max: number };
    preferences?: Record<string, any>;
  }>(),
  status: text('status', { enum: ['active', 'resolved', 'abandoned'] }).default('active'),
  satisfaction: integer('satisfaction'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('chat_conversations_user_idx').on(table.userId),
  sessionIdx: index('chat_conversations_session_idx').on(table.sessionId),
  statusIdx: index('chat_conversations_status_idx').on(table.status),
}));

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => chatConversations.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  messageType: text('message_type', { enum: ['text', 'product_recommendation', 'image', 'quick_reply'] }).default('text'),
  metadata: jsonb('metadata').$type<{
    products?: Array<{
      id: string;
      reason?: string;
      confidence?: number;
    }>;
    images?: string[];
    quickReplies?: string[];
    aiModel?: string;
    processingTime?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('chat_messages_conversation_idx').on(table.conversationId),
  roleIdx: index('chat_messages_role_idx').on(table.role),
  createdIdx: index('chat_messages_created_idx').on(table.createdAt),
}));

// Product recommendations table (for caching and analytics)
export const productRecommendations = pgTable('product_recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  sourceProductId: uuid('source_product_id').references(() => products.id),
  recommendedProductId: uuid('recommended_product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  recommendationType: text('recommendation_type', { 
    enum: ['similar', 'complementary', 'trending', 'personalized', 'visual_match', 'cross_sell', 'up_sell'] 
  }).notNull(),
  score: decimal('score', { precision: 5, scale: 4 }).notNull(),
  reason: text('reason'),
  algorithm: text('algorithm').notNull(),
  context: jsonb('context').$type<Record<string, any>>(),
  clicked: boolean('clicked').default(false),
  converted: boolean('converted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  userIdx: index('product_recommendations_user_idx').on(table.userId),
  sessionIdx: index('product_recommendations_session_idx').on(table.sessionId),
  sourceIdx: index('product_recommendations_source_idx').on(table.sourceProductId),
  recommendedIdx: index('product_recommendations_recommended_idx').on(table.recommendedProductId),
  typeIdx: index('product_recommendations_type_idx').on(table.recommendationType),
  scoreIdx: index('product_recommendations_score_idx').on(table.score),
  expiresIdx: index('product_recommendations_expires_idx').on(table.expiresAt),
}));

// Product analytics table for AI insights
export const productAnalytics = pgTable('product_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  views: integer('views').default(0),
  clicks: integer('clicks').default(0),
  addToCarts: integer('add_to_carts').default(0),
  purchases: integer('purchases').default(0),
  wishlistAdds: integer('wishlist_adds').default(0),
  searchRanking: decimal('search_ranking', { precision: 5, scale: 4 }),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }),
  reviewCount: integer('review_count').default(0),
  returnRate: decimal('return_rate', { precision: 5, scale: 4 }),
  profitMargin: decimal('profit_margin', { precision: 5, scale: 4 }),
}, (table) => ({
  productIdx: index('product_analytics_product_idx').on(table.productId),
  dateIdx: index('product_analytics_date_idx').on(table.date),
  uniqueProductDate: primaryKey({ columns: [table.productId, table.date] }),
}));

// Enhanced relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [productReviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [productReviews.orderId],
    references: [orders.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [wishlistItems.variantId],
    references: [productVariants.id],
  }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

export const productRecommendationsRelations = relations(productRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [productRecommendations.userId],
    references: [users.id],
  }),
  sourceProduct: one(products, {
    fields: [productRecommendations.sourceProductId],
    references: [products.id],
  }),
  recommendedProduct: one(products, {
    fields: [productRecommendations.recommendedProductId],
    references: [products.id],
  }),
}));

export const productAnalyticsRelations = relations(productAnalytics, ({ one }) => ({
  product: one(products, {
    fields: [productAnalytics.productId],
    references: [products.id],
  }),
}));

// Update existing relations to include new tables
export const usersRelationsEnhanced = relations(users, ({ many }) => ({
  products: many(products),
  carts: many(carts),
  orders: many(orders),
  preferences: many(userPreferences),
  reviews: many(productReviews),
  wishlists: many(wishlists),
  searchHistory: many(searchHistory),
  chatConversations: many(chatConversations),
  recommendations: many(productRecommendations),
}));

export const productsRelationsEnhanced = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  vendor: one(users, {
    fields: [products.vendorId],
    references: [users.id],
  }),
  variants: many(productVariants),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(productReviews),
  wishlistItems: many(wishlistItems),
  sourceRecommendations: many(productRecommendations, {
    relationName: 'sourceProduct',
  }),
  targetRecommendations: many(productRecommendations, {
    relationName: 'recommendedProduct',
  }),
  analytics: many(productAnalytics),
}));