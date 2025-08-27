/**
 * Fallback data for when the DummyJSON API is unavailable
 * This ensures the application continues to work even when the API is down
 */

import { Product, PaginatedResponse } from '@/types';

// Fallback product data - similar to original mock data but structured for our system
export const fallbackProducts: Product[] = [
  {
    id: 'fallback-1',
    name: 'Modern Sectional Sofa - Gray Fabric',
    slug: 'modern-sectional-sofa-gray',
    description: 'Comfortable and stylish sectional sofa perfect for modern living rooms. Features premium gray fabric upholstery with sturdy frame construction.',
    shortDescription: 'Modern sectional sofa in premium gray fabric',
    price: '1299.99',
    compareAtPrice: '1599.99',
    costPrice: '800.00',
    sku: 'SOFA-SECT-GRY-001',
    barcode: '123456789012',
    inventory: 15,
    lowStockThreshold: 5,
    trackInventory: true,
    continueSellingWhenOutOfStock: false,
    weight: '120.00',
    dimensions: {
      length: 240,
      width: 165,
      height: 90,
      unit: 'cm' as const,
    },
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop'],
    tags: ['living room', 'sofa', 'modern', 'gray', 'sectional'],
    metaTitle: 'Modern Gray Sectional Sofa | E-Commerce AI',
    metaDescription: 'Shop the perfect modern sectional sofa in gray fabric. Premium quality with fast shipping.',
    status: 'active' as const,
    featured: true,
    categoryId: 'cat-furniture',
    vendorId: 'vendor-comfort-home',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'fallback-2',
    name: 'Ergonomic Office Chair - Black Mesh',
    slug: 'ergonomic-office-chair-black',
    description: 'Professional ergonomic office chair with lumbar support, breathable mesh back, and adjustable height. Perfect for long work sessions.',
    shortDescription: 'Ergonomic office chair with mesh back and lumbar support',
    price: '449.99',
    compareAtPrice: '549.99',
    costPrice: '250.00',
    sku: 'CHAIR-OFF-BLK-001',
    barcode: '123456789013',
    inventory: 25,
    lowStockThreshold: 5,
    trackInventory: true,
    continueSellingWhenOutOfStock: false,
    weight: '18.00',
    dimensions: {
      length: 66,
      width: 66,
      height: 120,
      unit: 'cm' as const,
    },
    images: ['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=500&fit=crop'],
    tags: ['office', 'chair', 'ergonomic', 'black', 'mesh'],
    metaTitle: 'Ergonomic Office Chair | E-Commerce AI',
    metaDescription: 'Professional ergonomic office chair with premium mesh back and lumbar support.',
    status: 'active' as const,
    featured: false,
    categoryId: 'cat-furniture',
    vendorId: 'vendor-office-pro',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'fallback-3',
    name: 'Smart Coffee Maker - Stainless Steel',
    slug: 'smart-coffee-maker-steel',
    description: 'WiFi-enabled coffee maker with app control, programmable scheduling, and premium stainless steel construction. Brew perfect coffee every time.',
    shortDescription: 'WiFi-enabled smart coffee maker with app control',
    price: '199.99',
    compareAtPrice: null,
    costPrice: '120.00',
    sku: 'COFFEE-SMART-SS-001',
    barcode: '123456789014',
    inventory: 8,
    lowStockThreshold: 5,
    trackInventory: true,
    continueSellingWhenOutOfStock: false,
    weight: '5.50',
    dimensions: {
      length: 35,
      width: 25,
      height: 40,
      unit: 'cm' as const,
    },
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop'],
    tags: ['kitchen', 'coffee', 'smart', 'stainless steel', 'wifi'],
    metaTitle: 'Smart Coffee Maker | E-Commerce AI',
    metaDescription: 'WiFi-enabled smart coffee maker with advanced brewing technology and app control.',
    status: 'active' as const,
    featured: true,
    categoryId: 'cat-appliances',
    vendorId: 'vendor-smart-kitchen',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'fallback-4',
    name: 'Minimalist Coffee Table - Walnut Wood',
    slug: 'minimalist-coffee-table-walnut',
    description: 'Beautiful walnut wood coffee table with clean lines and minimalist design. Sustainable materials and expert craftsmanship.',
    shortDescription: 'Minimalist walnut coffee table with clean lines',
    price: '399.99',
    compareAtPrice: '499.99',
    costPrice: '200.00',
    sku: 'TABLE-COFFEE-WAL-001',
    barcode: '123456789015',
    inventory: 12,
    lowStockThreshold: 5,
    trackInventory: true,
    continueSellingWhenOutOfStock: false,
    weight: '25.00',
    dimensions: {
      length: 120,
      width: 60,
      height: 45,
      unit: 'cm' as const,
    },
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'],
    tags: ['living room', 'table', 'walnut', 'minimalist', 'wood'],
    metaTitle: 'Walnut Coffee Table | E-Commerce AI',
    metaDescription: 'Beautiful minimalist coffee table in premium walnut wood with clean modern lines.',
    status: 'active' as const,
    featured: false,
    categoryId: 'cat-furniture',
    vendorId: 'vendor-wood-craft',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'fallback-5',
    name: 'Wireless Bluetooth Speaker - Premium Sound',
    slug: 'wireless-bluetooth-speaker-premium',
    description: 'High-quality wireless Bluetooth speaker with 360-degree sound, waterproof design, and 24-hour battery life.',
    shortDescription: 'Premium wireless Bluetooth speaker with 360-degree sound',
    price: '149.99',
    compareAtPrice: '199.99',
    costPrice: '90.00',
    sku: 'SPEAK-BT-PREM-001',
    barcode: '123456789016',
    inventory: 20,
    lowStockThreshold: 5,
    trackInventory: true,
    continueSellingWhenOutOfStock: false,
    weight: '1.20',
    dimensions: {
      length: 20,
      width: 20,
      height: 8,
      unit: 'cm' as const,
    },
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop'],
    tags: ['electronics', 'bluetooth', 'speaker', 'wireless', 'waterproof'],
    metaTitle: 'Premium Bluetooth Speaker | E-Commerce AI',
    metaDescription: 'High-quality wireless Bluetooth speaker with superior sound and waterproof design.',
    status: 'active' as const,
    featured: true,
    categoryId: 'cat-electronics',
    vendorId: 'vendor-audio-tech',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: 'fallback-6',
    name: 'Ceramic Dinner Plate Set - White',
    slug: 'ceramic-dinner-plate-set-white',
    description: 'Elegant white ceramic dinner plate set for 4 people. Dishwasher and microwave safe with timeless design.',
    shortDescription: 'Elegant white ceramic dinner plates - Set of 4',
    price: '89.99',
    compareAtPrice: null,
    costPrice: '45.00',
    sku: 'PLATE-CER-WHT-004',
    barcode: '123456789017',
    inventory: 30,
    lowStockThreshold: 5,
    trackInventory: true,
    continueSellingWhenOutOfStock: false,
    weight: '3.20',
    dimensions: {
      length: 27,
      width: 27,
      height: 2,
      unit: 'cm' as const,
    },
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop'],
    tags: ['kitchen', 'ceramic', 'plates', 'dinnerware', 'white'],
    metaTitle: 'Ceramic Dinner Plate Set | E-Commerce AI',
    metaDescription: 'Elegant white ceramic dinner plate set. Perfect for everyday dining and special occasions.',
    status: 'active' as const,
    featured: false,
    categoryId: 'cat-home-kitchen',
    vendorId: 'vendor-kitchen-essentials',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

/**
 * Get fallback products with pagination
 */
export function getFallbackProducts(options: {
  limit?: number;
  offset?: number;
  featured?: boolean;
  category?: string;
} = {}): PaginatedResponse<Product> {
  const { limit = 20, offset = 0, featured, category } = options;
  
  let filteredProducts = [...fallbackProducts];
  
  // Apply featured filter
  if (featured !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.featured === featured);
  }
  
  // Apply category filter
  if (category) {
    filteredProducts = filteredProducts.filter(product => product.categoryId === category);
  }
  
  // Apply pagination
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);
  
  return {
    success: true,
    data: paginatedProducts,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
    },
  };
}

/**
 * Get a fallback product by ID or slug
 */
export function getFallbackProduct(idOrSlug: string): Product | null {
  return fallbackProducts.find(product => 
    product.id === idOrSlug || product.slug === idOrSlug
  ) || null;
}

/**
 * Search fallback products
 */
export function searchFallbackProducts(query: string, options: {
  limit?: number;
  offset?: number;
} = {}): PaginatedResponse<Product> {
  const { limit = 20, offset = 0 } = options;
  const searchQuery = query.toLowerCase();
  
  const filteredProducts = fallbackProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery) ||
    product.description.toLowerCase().includes(searchQuery) ||
    product.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
  );
  
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);
  
  return {
    success: true,
    data: paginatedProducts,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
    },
  };
}

/**
 * Get fallback categories
 */
export function getFallbackCategories(): string[] {
  return [
    'furniture',
    'appliances',
    'electronics',
    'home-kitchen',
  ];
}