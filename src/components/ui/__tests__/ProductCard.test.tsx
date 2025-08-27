import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductCard from '../ProductCard';
import { Product } from '@/types';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock cart store
jest.mock('@/store/cart-store', () => ({
  useCartStore: () => ({
    addItem: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock Image constructor
const mockImage = {
  onload: null as ((this: GlobalEventHandlers, ev: Event) => any) | null,
  onerror: null as ((this: GlobalEventHandlers, ev: Event | string) => any) | null,
  src: '',
};

Object.defineProperty(window, 'Image', {
  writable: true,
  value: jest.fn(() => mockImage),
});

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'This is a test product description for testing purposes.',
  price: '99.99',
  compareAtPrice: '149.99',
  images: ['https://example.com/image.jpg'],
  vendor: 'Test Vendor',
  inventory: 10,
  featured: false,
  tags: ['test', 'product'],
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImage.onload = null;
    mockImage.onerror = null;
    mockImage.src = '';
  });

  it('renders product information correctly', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('TEST VENDOR')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$149.99')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading prop is true', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} loading={true} />
      </TestWrapper>
    );

    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(
      expect.any(Number)
    );
  });

  it('displays discount percentage for sale items', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('-33%')).toBeInTheDocument();
  });

  it('shows AI match indicator when provided', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} aiMatch={95} />
      </TestWrapper>
    );

    expect(screen.getByText('🤖 95% Match')).toBeInTheDocument();
  });

  it('shows featured badge when product is featured', () => {
    const featuredProduct = { ...mockProduct, featured: true };
    
    render(
      <TestWrapper>
        <ProductCard product={featuredProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('shows out of stock state correctly', () => {
    const outOfStockProduct = { ...mockProduct, inventory: 0 };
    
    render(
      <TestWrapper>
        <ProductCard product={outOfStockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    const addToCartButton = screen.getByRole('button', { name: /out of stock/i });
    expect(addToCartButton).toBeDisabled();
  });

  it('shows free shipping badge for eligible products', () => {
    const eligibleProduct = { ...mockProduct, price: '50.00' };
    
    render(
      <TestWrapper>
        <ProductCard product={eligibleProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
  });

  it('handles image error and shows enhanced layout', async () => {
    render(
      <TestWrapper>
        <ProductCard 
          product={mockProduct} 
          fallbackStrategy="placeholder" 
        />
      </TestWrapper>
    );

    // Simulate image error
    setTimeout(() => {
      if (mockImage.onerror) {
        mockImage.onerror({} as Event);
      }
    }, 100);

    await waitFor(() => {
      // Should show additional benefits when image fails
      expect(screen.getByText('Quality Guarantee')).toBeInTheDocument();
      expect(screen.getByText('By Test Vendor')).toBeInTheDocument();
      
      // Should show product description
      expect(screen.getByText(/This is a test product description/)).toBeInTheDocument();
    });
  });

  it('navigates to product page when clicked', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Test Product'));
    expect(mockPush).toHaveBeenCalledWith('/products/test-product');
  });

  it('toggles favorite state when favorite button is clicked', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);

    // Should change from FavoriteBorderIcon to FavoriteIcon
    expect(favoriteButton.querySelector('[data-testid="FavoriteIcon"]')).toBeInTheDocument();
  });

  it('shows quick view overlay on hover when enabled', async () => {
    render(
      <TestWrapper>
        <ProductCard 
          product={mockProduct} 
          showQuickView={true} 
        />
      </TestWrapper>
    );

    const card = screen.getByRole('button', { name: /test product/i });
    fireEvent.mouseEnter(card);

    await waitFor(() => {
      expect(screen.getByText('Quick View')).toBeInTheDocument();
    });
  });

  it('handles add to cart action', async () => {
    const mockAddItem = jest.fn().mockResolvedValue(undefined);
    
    // Update the mock to return our mock function
    jest.mocked(require('@/store/cart-store').useCartStore).mockReturnValue({
      addItem: mockAddItem,
      isLoading: false,
    });

    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith('1');
    });
  });

  it('shows larger elements when image fails to load', async () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    // Simulate image error
    setTimeout(() => {
      if (mockImage.onerror) {
        mockImage.onerror({} as Event);
      }
    }, 100);

    await waitFor(() => {
      const productName = screen.getByText('Test Product');
      const styles = window.getComputedStyle(productName);
      
      // Should have larger font size when image is missing
      expect(styles.fontSize).toBe('1.25rem');
    });
  });

  it('adapts fallback strategy based on props', () => {
    render(
      <TestWrapper>
        <ProductCard 
          product={mockProduct} 
          fallbackStrategy="adaptive" 
        />
      </TestWrapper>
    );

    // Should use adaptive strategy and show appropriate fallback
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('shows retry functionality for failed images', async () => {
    render(
      <TestWrapper>
        <ProductCard 
          product={mockProduct}
          enableImageRetry={true} 
        />
      </TestWrapper>
    );

    // Simulate image error
    setTimeout(() => {
      if (mockImage.onerror) {
        mockImage.onerror({} as Event);
      }
    }, 100);

    await waitFor(() => {
      const retryButton = screen.getByLabelText(/retry loading image/i);
      expect(retryButton).toBeInTheDocument();
    });
  });

  it('prioritizes featured products for image loading', () => {
    const featuredProduct = { ...mockProduct, featured: true };
    
    render(
      <TestWrapper>
        <ProductCard product={featuredProduct} />
      </TestWrapper>
    );

    // Featured products should not use intersection observer
    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });
});