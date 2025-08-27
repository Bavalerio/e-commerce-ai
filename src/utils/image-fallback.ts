/**
 * Image Fallback Utilities
 * Provides helper functions for managing product image fallbacks
 * and category-specific placeholder logic
 */

export interface CategoryConfig {
  id: string;
  name: string;
  iconKey: string;
  colorScheme: {
    background: string;
    iconColor: string;
    textColor: string;
    borderColor: string;
  };
  fallbackImages?: string[];
}

export interface ImageFallbackOptions {
  category?: string;
  retryAttempts?: number;
  enableSkeleton?: boolean;
  enableProgressiveLoading?: boolean;
  customPlaceholder?: string;
}

export interface ImageLoadingState {
  status: 'idle' | 'loading' | 'loaded' | 'error' | 'empty';
  progress: number;
  retryCount: number;
  fallbackUsed: boolean;
  fallbackType?: 'category' | 'default' | 'custom';
  error?: Error;
}

// Category mapping configuration
export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  // Furniture & Home
  furniture: {
    id: 'furniture',
    name: 'Furniture',
    iconKey: 'chair',
    colorScheme: {
      background: 'linear-gradient(135deg, #f9f9f9, #f0f0f0)',
      iconColor: '#8b4513',
      textColor: '#5d4037',
      borderColor: '#d7ccc8',
    },
    fallbackImages: ['/images/placeholders/furniture-default.svg'],
  },
  'furniture-living-room': {
    id: 'furniture-living-room',
    name: 'Living Room Furniture',
    iconKey: 'sofa',
    colorScheme: {
      background: 'linear-gradient(135deg, #f9f9f9, #f0f0f0)',
      iconColor: '#8b4513',
      textColor: '#5d4037',
      borderColor: '#d7ccc8',
    },
    fallbackImages: ['/images/placeholders/sofa-placeholder.svg'],
  },
  'furniture-bedroom': {
    id: 'furniture-bedroom',
    name: 'Bedroom Furniture',
    iconKey: 'bed',
    colorScheme: {
      background: 'linear-gradient(135deg, #f9f9f9, #f0f0f0)',
      iconColor: '#8b4513',
      textColor: '#5d4037',
      borderColor: '#d7ccc8',
    },
    fallbackImages: ['/images/placeholders/bed-placeholder.svg'],
  },
  'furniture-office': {
    id: 'furniture-office',
    name: 'Office Furniture',
    iconKey: 'desk-chair',
    colorScheme: {
      background: 'linear-gradient(135deg, #f9f9f9, #f0f0f0)',
      iconColor: '#8b4513',
      textColor: '#5d4037',
      borderColor: '#d7ccc8',
    },
    fallbackImages: ['/images/placeholders/office-placeholder.svg'],
  },

  // Electronics & Technology
  electronics: {
    id: 'electronics',
    name: 'Electronics',
    iconKey: 'laptop',
    colorScheme: {
      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
      iconColor: '#1976d2',
      textColor: '#1565c0',
      borderColor: '#90caf9',
    },
    fallbackImages: ['/images/placeholders/electronics-default.svg'],
  },
  'electronics-computers': {
    id: 'electronics-computers',
    name: 'Computers',
    iconKey: 'computer',
    colorScheme: {
      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
      iconColor: '#1976d2',
      textColor: '#1565c0',
      borderColor: '#90caf9',
    },
    fallbackImages: ['/images/placeholders/computer-placeholder.svg'],
  },
  'electronics-phones': {
    id: 'electronics-phones',
    name: 'Mobile Phones',
    iconKey: 'phone',
    colorScheme: {
      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
      iconColor: '#1976d2',
      textColor: '#1565c0',
      borderColor: '#90caf9',
    },
    fallbackImages: ['/images/placeholders/phone-placeholder.svg'],
  },

  // Fashion & Apparel
  clothing: {
    id: 'clothing',
    name: 'Clothing',
    iconKey: 'shirt',
    colorScheme: {
      background: 'linear-gradient(135deg, #fce4ec, #f8bbd9)',
      iconColor: '#dc004e',
      textColor: '#c2185b',
      borderColor: '#f48fb1',
    },
    fallbackImages: ['/images/placeholders/clothing-default.svg'],
  },
  'clothing-mens': {
    id: 'clothing-mens',
    name: "Men's Clothing",
    iconKey: 'mens-shirt',
    colorScheme: {
      background: 'linear-gradient(135deg, #f5f5f5, #eeeeee)',
      iconColor: '#424242',
      textColor: '#212121',
      borderColor: '#bdbdbd',
    },
    fallbackImages: ['/images/placeholders/mens-clothing-placeholder.svg'],
  },
  'clothing-womens': {
    id: 'clothing-womens',
    name: "Women's Clothing",
    iconKey: 'womens-dress',
    colorScheme: {
      background: 'linear-gradient(135deg, #fce4ec, #f8bbd9)',
      iconColor: '#dc004e',
      textColor: '#c2185b',
      borderColor: '#f48fb1',
    },
    fallbackImages: ['/images/placeholders/womens-clothing-placeholder.svg'],
  },

  // Sports & Recreation
  sports: {
    id: 'sports',
    name: 'Sports & Recreation',
    iconKey: 'sports',
    colorScheme: {
      background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)',
      iconColor: '#00695c',
      textColor: '#004d40',
      borderColor: '#4db6ac',
    },
    fallbackImages: ['/images/placeholders/sports-default.svg'],
  },

  // Home & Garden
  'home-garden': {
    id: 'home-garden',
    name: 'Home & Garden',
    iconKey: 'garden',
    colorScheme: {
      background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
      iconColor: '#4caf50',
      textColor: '#2e7d32',
      borderColor: '#81c784',
    },
    fallbackImages: ['/images/placeholders/garden-default.svg'],
  },

  // Kitchen & Dining
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen & Dining',
    iconKey: 'kitchen',
    colorScheme: {
      background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
      iconColor: '#f57c00',
      textColor: '#e65100',
      borderColor: '#ffb74d',
    },
    fallbackImages: ['/images/placeholders/kitchen-default.svg'],
  },

  // Default fallback
  default: {
    id: 'default',
    name: 'Product',
    iconKey: 'package',
    colorScheme: {
      background: 'linear-gradient(135deg, #fafafa, #f5f5f5)',
      iconColor: '#757575',
      textColor: '#616161',
      borderColor: '#e0e0e0',
    },
    fallbackImages: ['/images/placeholders/default-product.svg'],
  },
};

/**
 * Gets the category configuration for a given category string
 */
export function getCategoryConfig(category?: string): CategoryConfig {
  if (!category) return CATEGORY_CONFIGS.default;
  
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
  
  // Try exact match first
  if (CATEGORY_CONFIGS[normalizedCategory]) {
    return CATEGORY_CONFIGS[normalizedCategory];
  }
  
  // Try partial matches for subcategories
  const matchingKey = Object.keys(CATEGORY_CONFIGS).find(key => 
    key.startsWith(normalizedCategory) || normalizedCategory.startsWith(key)
  );
  
  return matchingKey ? CATEGORY_CONFIGS[matchingKey] : CATEGORY_CONFIGS.default;
}

/**
 * Determines the best fallback strategy based on context
 */
export function determineFallbackStrategy(
  category?: string,
  hasRetryOption?: boolean,
  isLoading?: boolean
): 'skeleton' | 'placeholder' | 'text' {
  if (isLoading) return 'skeleton';
  
  const config = getCategoryConfig(category);
  
  // Use placeholder for categories with good visual representations
  if (config.fallbackImages && config.fallbackImages.length > 0) {
    return 'placeholder';
  }
  
  // Use text fallback for categories without good visual placeholders
  return 'text';
}

/**
 * Creates a fallback image URL based on category
 */
export function getFallbackImageUrl(
  category?: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  const config = getCategoryConfig(category);
  
  if (config.fallbackImages && config.fallbackImages.length > 0) {
    return config.fallbackImages[0];
  }
  
  // Generate a dynamic SVG placeholder
  return generateSVGPlaceholder(config, size);
}

/**
 * Generates an SVG placeholder for a category
 */
export function generateSVGPlaceholder(
  config: CategoryConfig,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  const dimensions = {
    small: { width: 200, height: 200, iconSize: 32 },
    medium: { width: 400, height: 400, iconSize: 48 },
    large: { width: 800, height: 800, iconSize: 64 },
  };
  
  const { width, height, iconSize } = dimensions[size];
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f9f9f9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-gradient)" rx="8" ry="8"/>
      <rect x="10" y="10" width="${width - 20}" height="${height - 20}" 
            fill="none" stroke="${config.colorScheme.borderColor}" 
            stroke-width="2" stroke-dasharray="10,5" rx="4" ry="4"/>
      <circle cx="${width / 2}" cy="${height / 2 - 20}" r="${iconSize / 2}" 
              fill="${config.colorScheme.iconColor}" opacity="0.7"/>
      <text x="${width / 2}" y="${height / 2 + 40}" 
            text-anchor="middle" fill="${config.colorScheme.textColor}" 
            font-family="Arial, sans-serif" font-size="14" font-weight="500">
        ${config.name} Product
      </text>
      <text x="${width / 2}" y="${height - 20}" 
            text-anchor="middle" fill="${config.colorScheme.textColor}" 
            font-family="Arial, sans-serif" font-size="10" opacity="0.5">
        E-Commerce AI
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Preloads category-specific placeholder images
 */
export function preloadCategoryPlaceholders(categories: string[]): Promise<void[]> {
  const promises = categories.map(category => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload placeholder for ${category}`));
      img.src = getFallbackImageUrl(category);
    });
  });
  
  return Promise.all(promises);
}

/**
 * Hook for managing image loading state
 */
export function createImageLoadingState(): ImageLoadingState {
  return {
    status: 'idle',
    progress: 0,
    retryCount: 0,
    fallbackUsed: false,
  };
}

/**
 * Validates if an image URL is accessible
 */
export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Gets responsive image sizes based on container width
 */
export function getResponsiveImageSizes(containerWidth: number): string {
  if (containerWidth <= 320) return 'small';
  if (containerWidth <= 768) return 'medium';
  return 'large';
}

/**
 * Calculates optimal placeholder dimensions based on aspect ratio
 */
export function calculatePlaceholderDimensions(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number = 1
): { width: number; height: number } {
  const calculatedHeight = containerWidth / aspectRatio;
  
  if (calculatedHeight <= containerHeight) {
    return { width: containerWidth, height: calculatedHeight };
  } else {
    return { width: containerHeight * aspectRatio, height: containerHeight };
  }
}

/**
 * Extracts category from product data or URL
 */
export function extractCategoryFromProduct(product: any): string {
  // Try various possible category fields
  if (product.category) return product.category;
  if (product.categoryId) return product.categoryId;
  if (product.productType) return product.productType;
  if (product.tags && product.tags.length > 0) return product.tags[0];
  
  // Try to extract from URL or slug
  if (product.handle || product.slug) {
    const slug = product.handle || product.slug;
    const parts = slug.split('-');
    if (parts.length > 1) {
      return parts[0];
    }
  }
  
  return 'default';
}

/**
 * Performance monitoring for image loading
 */
export function measureImageLoadingPerformance(
  imageUrl: string,
  startTime: number = Date.now()
): Promise<{ duration: number; success: boolean }> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        duration: Date.now() - startTime,
        success: true,
      });
    };
    
    img.onerror = () => {
      resolve({
        duration: Date.now() - startTime,
        success: false,
      });
    };
    
    img.src = imageUrl;
  });
}

/**
 * Accessibility helpers for image fallbacks
 */
export function generateAccessibleAltText(
  productName?: string,
  category?: string,
  state: 'loading' | 'error' | 'placeholder' = 'placeholder'
): string {
  const categoryName = getCategoryConfig(category).name;
  
  switch (state) {
    case 'loading':
      return `Loading image for ${productName || categoryName.toLowerCase()} product`;
    case 'error':
      return `Image unavailable for ${productName || categoryName.toLowerCase()} product`;
    case 'placeholder':
    default:
      return `${categoryName} product placeholder${productName ? ` for ${productName}` : ''}`;
  }
}

/**
 * SEO-friendly structured data for placeholder images
 */
export function generatePlaceholderStructuredData(
  category: string,
  placeholderUrl: string
): object {
  const config = getCategoryConfig(category);
  
  return {
    '@type': 'ImageObject',
    url: placeholderUrl,
    name: `${config.name} Product Placeholder`,
    description: `Placeholder image for ${config.name.toLowerCase()} products`,
    width: 400,
    height: 400,
    encodingFormat: 'image/svg+xml',
  };
}