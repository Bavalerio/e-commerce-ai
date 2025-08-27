/**
 * DummyJSON API integration service
 * Provides functions to fetch product data from the DummyJSON API
 * https://dummyjson.com/docs/products
 */

import { Product, ProductFilterOptions, PaginatedResponse, ApiResponse } from '@/types';
import { 
  getFallbackProducts, 
  getFallbackProduct, 
  searchFallbackProducts, 
  getFallbackCategories 
} from './fallback-data';

const DUMMYJSON_BASE_URL = 'https://dummyjson.com';

// Simple in-memory cache to prevent duplicate requests
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedRequest(url: string) {
  const cached = requestCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  requestCache.delete(url);
  return null;
}

function setCachedRequest(url: string, data: any) {
  requestCache.set(url, { data, timestamp: Date.now() });
}

// DummyJSON API response types
export interface DummyJSONProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus: string;
  reviews?: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }>;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface DummyJSONResponse {
  products: DummyJSONProduct[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Transform a DummyJSON product to our Product type
 */
export function transformDummyJSONProduct(dummyProduct: DummyJSONProduct): Product {
  const discountedPrice = dummyProduct.price * (1 - dummyProduct.discountPercentage / 100);
  
  return {
    id: dummyProduct.id.toString(),
    name: dummyProduct.title,
    slug: dummyProduct.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    description: dummyProduct.description,
    shortDescription: dummyProduct.description.length > 100 
      ? dummyProduct.description.substring(0, 97) + '...' 
      : dummyProduct.description,
    price: discountedPrice.toFixed(2),
    compareAtPrice: dummyProduct.discountPercentage > 0 ? dummyProduct.price.toFixed(2) : null,
    costPrice: (discountedPrice * 0.6).toFixed(2), // Estimated cost price
    sku: dummyProduct.sku,
    barcode: dummyProduct.meta?.barcode || '',
    inventory: dummyProduct.stock,
    lowStockThreshold: 5,
    trackInventory: true,
    continueSellingWhenOutOfStock: false,
    weight: dummyProduct.weight?.toString() || '0.00',
    dimensions: {
      length: dummyProduct.dimensions?.depth || 0,
      width: dummyProduct.dimensions?.width || 0,
      height: dummyProduct.dimensions?.height || 0,
      unit: 'cm' as const,
    },
    images: dummyProduct.images || [dummyProduct.thumbnail],
    tags: dummyProduct.tags || [],
    metaTitle: `${dummyProduct.title} | E-Commerce AI`,
    metaDescription: dummyProduct.description,
    status: 'active' as const,
    featured: dummyProduct.rating >= 4.0,
    categoryId: `cat-${dummyProduct.category.toLowerCase().replace(/\s+/g, '-')}`,
    vendorId: `vendor-${dummyProduct.brand?.toLowerCase().replace(/\s+/g, '-') || 'default'}`,
    createdAt: new Date(dummyProduct.meta?.createdAt || new Date()),
    updatedAt: new Date(dummyProduct.meta?.updatedAt || new Date()),
  };
}

/**
 * Fetch all products with pagination and filtering
 */
export async function fetchDummyJSONProducts(options: {
  limit?: number;
  skip?: number;
  category?: string;
  search?: string;
} = {}): Promise<DummyJSONResponse> {
  const { limit = 20, skip = 0, category, search } = options;
  
  let url: string;
  
  if (search) {
    // Search products
    url = `${DUMMYJSON_BASE_URL}/products/search?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`;
  } else if (category) {
    // Get products by category
    url = `${DUMMYJSON_BASE_URL}/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`;
  } else {
    // Get all products
    url = `${DUMMYJSON_BASE_URL}/products?limit=${limit}&skip=${skip}`;
  }
  
  // Check cache first
  const cached = getCachedRequest(url);
  if (cached) {
    return cached;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`DummyJSON API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  setCachedRequest(url, data);
  
  return data;
}

/**
 * Fetch a single product by ID
 */
export async function fetchDummyJSONProduct(id: string | number): Promise<DummyJSONProduct> {
  const url = `${DUMMYJSON_BASE_URL}/products/${id}`;
  
  // Check cache first
  const cached = getCachedRequest(url);
  if (cached) {
    return cached;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error(`DummyJSON API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  setCachedRequest(url, data);
  
  return data;
}

/**
 * Fetch product categories
 */
export async function fetchDummyJSONCategories(): Promise<string[]> {
  const response = await fetch(`${DUMMYJSON_BASE_URL}/products/categories`);
  
  if (!response.ok) {
    throw new Error(`DummyJSON API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Convert our ProductFilterOptions to DummyJSON API parameters
 */
export function convertFiltersToDummyJSONParams(filters: ProductFilterOptions) {
  return {
    limit: filters.limit || 20,
    skip: filters.offset || 0,
    category: filters.categories?.[0], // DummyJSON only supports single category
    search: undefined, // Will be handled separately
  };
}

/**
 * Fetch products with our standard ProductFilterOptions
 * Includes automatic fallback to local data if API fails
 */
export async function getProducts(filters: ProductFilterOptions = {}): Promise<PaginatedResponse<Product>> {
  try {
    const dummyJSONParams = convertFiltersToDummyJSONParams(filters);
    const response = await fetchDummyJSONProducts(dummyJSONParams);
    
    // Transform all products to our format
    const transformedProducts = response.products.map(transformDummyJSONProduct);
    
    // Apply client-side filters that DummyJSON doesn't support
    let filteredProducts = transformedProducts;
    
    // Price range filtering
    if (filters.priceRange) {
      filteredProducts = filteredProducts.filter(product => {
        const price = parseFloat(product.price);
        return price >= (filters.priceRange?.min || 0) && 
               price <= (filters.priceRange?.max || Infinity);
      });
    }
    
    // Stock filtering
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(product => product.inventory > 0);
    }
    
    // Featured filtering
    if (filters.featured) {
      filteredProducts = filteredProducts.filter(product => product.featured);
    }
    
    // Tag filtering
    if (filters.tags && filters.tags.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        filters.tags!.some(tag => product.tags?.includes(tag))
      );
    }
    
    // Client-side sorting since DummyJSON doesn't support it
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        let aValue: string | number | Date, bValue: string | number | Date;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = parseFloat(a.price);
            bValue = parseFloat(b.price);
            break;
          case 'created':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'updated':
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    const total = Math.min(response.total, filteredProducts.length);
    const limit = filters.limit || 20;
    const skip = filters.offset || 0;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(skip / limit) + 1;
    
    return {
      success: true,
      data: filteredProducts,
      pagination: {
        page: currentPage,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.warn('DummyJSON API failed, falling back to local data:', error);
    
    // Use fallback data when API is unavailable
    return getFallbackProducts({
      limit: filters.limit,
      offset: filters.offset,
      featured: filters.featured,
      category: filters.categories?.[0],
    });
  }
}

/**
 * Search products using DummyJSON search endpoint
 * Includes automatic fallback to local data search if API fails
 */
export async function searchProducts(query: string, options: {
  limit?: number;
  skip?: number;
} = {}): Promise<PaginatedResponse<Product>> {
  try {
    const { limit = 20, skip = 0 } = options;
    const response = await fetchDummyJSONProducts({ search: query, limit, skip });
    
    const transformedProducts = response.products.map(transformDummyJSONProduct);
    
    return {
      success: true,
      data: transformedProducts,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total: response.total,
        totalPages: Math.ceil(response.total / limit),
      },
    };
  } catch (error) {
    console.warn('DummyJSON search API failed, falling back to local search:', error);
    
    // Use fallback search when API is unavailable
    return searchFallbackProducts(query, {
      limit,
      offset: skip,
    });
  }
}

/**
 * Get a single product by ID or slug
 * Includes automatic fallback to local data if API fails
 */
export async function getProduct(idOrSlug: string): Promise<Product> {
  try {
    // If it's a number, use it as ID directly
    if (/^\d+$/.test(idOrSlug)) {
      const response = await fetchDummyJSONProduct(idOrSlug);
      return transformDummyJSONProduct(response);
    }
    
    // If it's a slug, we need to search for it
    // This is a limitation of DummyJSON - no slug-based lookup
    // We'll search by the slug and find the best match
    const searchResponse = await fetchDummyJSONProducts({ search: idOrSlug.replace(/-/g, ' '), limit: 100 });
    
    // Find exact slug match
    for (const product of searchResponse.products) {
      const transformedProduct = transformDummyJSONProduct(product);
      if (transformedProduct.slug === idOrSlug) {
        return transformedProduct;
      }
    }
    
    // If no exact match, throw error
    throw new Error('Product not found');
  } catch (error) {
    console.warn('DummyJSON product API failed, trying fallback data:', error);
    
    // Try fallback data
    const fallbackProduct = getFallbackProduct(idOrSlug);
    if (fallbackProduct) {
      return fallbackProduct;
    }
    
    // If still not found, throw the original error
    throw new Error('Product not found');
  }
}

/**
 * Get available categories from DummyJSON
 * Includes automatic fallback to local categories if API fails
 */
export async function getCategories(): Promise<string[]> {
  try {
    return await fetchDummyJSONCategories();
  } catch (error) {
    console.warn('DummyJSON categories API failed, falling back to local categories:', error);
    return getFallbackCategories();
  }
}