import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductImageFallback from '../ProductImageFallback';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

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

describe('ProductImageFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImage.onload = null;
    mockImage.onerror = null;
    mockImage.src = '';
  });

  it('renders skeleton loading state by default', () => {
    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src="test-image.jpg"
          fallbackStrategy="skeleton"
        />
      </TestWrapper>
    );

    // Should show skeleton while loading
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('shows placeholder when image fails to load', async () => {
    const onError = jest.fn();
    
    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src="broken-image.jpg"
          category="electronics"
          fallbackStrategy="placeholder"
          onError={onError}
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
      expect(screen.getByText('Electronics Product')).toBeInTheDocument();
      expect(onError).toHaveBeenCalled();
    });
  });

  it('shows text fallback when strategy is text', async () => {
    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product Name" 
          src="broken-image.jpg"
          fallbackStrategy="text"
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
      expect(screen.getByText('Image Unavailable')).toBeInTheDocument();
      expect(screen.getByText('Test Product Name')).toBeInTheDocument();
    });
  });

  it('shows retry button on error when enabled', async () => {
    const onRetry = jest.fn();
    
    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src="broken-image.jpg"
          category="furniture"
          showRetryButton={true}
          onRetry={onRetry}
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

    // Click retry button
    const retryButton = screen.getByLabelText(/retry loading image/i);
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it('loads image successfully when src is valid', async () => {
    const onLoad = jest.fn();
    
    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src="valid-image.jpg"
          onLoad={onLoad}
        />
      </TestWrapper>
    );

    // Simulate successful image load
    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as Event);
      }
    }, 100);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('handles empty src by showing empty state', () => {
    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src=""
          fallbackStrategy="placeholder"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Product Product')).toBeInTheDocument();
  });

  it('uses adaptive fallback strategy correctly', async () => {
    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src="broken-image.jpg"
          category="clothing"
          fallbackStrategy="adaptive"
        />
      </TestWrapper>
    );

    // Should start with skeleton for loading
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();

    // Simulate image error
    setTimeout(() => {
      if (mockImage.onerror) {
        mockImage.onerror({} as Event);
      }
    }, 100);

    // Should switch to placeholder after error
    await waitFor(() => {
      expect(screen.getByText('Clothing Product')).toBeInTheDocument();
    });
  });

  it('respects maxRetries limit', async () => {
    const onError = jest.fn();
    
    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src="broken-image.jpg"
          maxRetries={1}
          showRetryButton={true}
          onError={onError}
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
      const retryButton = screen.getByLabelText(/retry loading image \(1\/1\)/i);
      expect(retryButton).toBeInTheDocument();
    });

    // Click retry button
    fireEvent.click(screen.getByLabelText(/retry loading image \(1\/1\)/i));

    // Simulate error again
    setTimeout(() => {
      if (mockImage.onerror) {
        mockImage.onerror({} as Event);
      }
    }, 100);

    // Retry button should be gone after max retries
    await waitFor(() => {
      expect(screen.queryByLabelText(/retry loading image/i)).not.toBeInTheDocument();
    });
  });

  it('shows different category icons for different categories', () => {
    const categories = ['furniture', 'electronics', 'clothing', 'sports'];
    
    categories.forEach((category) => {
      const { unmount } = render(
        <TestWrapper>
          <ProductImageFallback 
            alt={`${category} Product`} 
            src=""
            category={category}
            fallbackStrategy="placeholder"
          />
        </TestWrapper>
      );

      expect(screen.getByText(`${category.charAt(0).toUpperCase() + category.slice(1)} Product`)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles intersection observer correctly', () => {
    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();
    
    mockIntersectionObserver.mockImplementation((callback) => ({
      observe: mockObserve,
      unobserve: jest.fn(),
      disconnect: mockDisconnect,
    }));

    const { unmount } = render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src="test-image.jpg"
          enableIntersectionObserver={true}
          priority={false}
        />
      </TestWrapper>
    );

    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalled();

    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('skips intersection observer when priority is true', () => {
    const mockObserve = jest.fn();
    
    mockIntersectionObserver.mockImplementation(() => ({
      observe: mockObserve,
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    render(
      <TestWrapper>
        <ProductImageFallback 
          alt="Test Product" 
          src="test-image.jpg"
          enableIntersectionObserver={true}
          priority={true}
        />
      </TestWrapper>
    );

    // Should not observe when priority is true
    expect(mockObserve).not.toHaveBeenCalled();
  });
});