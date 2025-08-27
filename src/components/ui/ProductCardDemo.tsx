'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import ProductCard from './ProductCard';
import { Product } from '@/types';

const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Modern Ergonomic Office Chair',
    slug: 'modern-ergonomic-office-chair',
    description: 'Premium office chair with lumbar support and adjustable height.',
    price: '299.99',
    compareAtPrice: '399.99',
    images: ['https://example.com/valid-image.jpg'], // Valid image URL
    vendor: 'Office Pro',
    inventory: 15,
    featured: true,
    tags: ['furniture', 'office'],
  },
  {
    id: '2',
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description: 'High-quality wireless headphones with active noise cancellation.',
    price: '199.99',
    compareAtPrice: '249.99',
    images: ['https://broken-url-that-will-fail.jpg'], // Broken image URL
    vendor: 'AudioTech',
    inventory: 8,
    featured: false,
    tags: ['electronics', 'audio'],
  },
  {
    id: '3',
    name: 'Vintage Leather Jacket',
    slug: 'vintage-leather-jacket',
    description: 'Genuine leather jacket with vintage styling and premium craftsmanship.',
    price: '189.99',
    images: [], // No images
    vendor: 'Fashion House',
    inventory: 3,
    featured: false,
    tags: ['clothing', 'fashion'],
  },
  {
    id: '4',
    name: 'Smart Fitness Tracker',
    slug: 'smart-fitness-tracker',
    description: 'Advanced fitness tracker with heart rate monitoring and GPS.',
    price: '149.99',
    compareAtPrice: '199.99',
    images: ['https://invalid-domain-12345.xyz/image.jpg'], // Invalid domain
    vendor: 'FitTech',
    inventory: 0, // Out of stock
    featured: false,
    tags: ['electronics', 'fitness'],
  },
  {
    id: '5',
    name: 'Ceramic Coffee Mug Set',
    slug: 'ceramic-coffee-mug-set',
    description: 'Set of 4 handcrafted ceramic coffee mugs with unique designs.',
    price: '34.99',
    compareAtPrice: '49.99',
    images: [''], // Empty image URL
    vendor: 'Home Essentials',
    inventory: 25,
    featured: true,
    tags: ['kitchen', 'home'],
  },
];

const ProductCardDemo: React.FC = () => {
  return (
    <Box sx={{ p: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        ProductCard Image Fallback Demo
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Demonstrating robust image handling across different scenarios
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Features Demonstrated
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="🖼️ Image Loading States" color="primary" />
              <Chip label="🔄 Auto-retry with Exponential Backoff" color="secondary" />
              <Chip label="👁️ Intersection Observer" color="success" />
              <Chip label="🎨 Category-based Placeholders" color="warning" />
              <Chip label="💡 Adaptive Layout Adjustments" color="info" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="🛠️ Error Boundaries" color="primary" />
              <Chip label="♿ Accessibility Compliant" color="secondary" />
              <Chip label="📱 Responsive Design" color="success" />
              <Chip label="🏃‍♂️ Performance Optimized" color="warning" />
              <Chip label="🧪 Comprehensive Testing" color="info" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h4" gutterBottom>
        Test Scenarios
      </Typography>

      {/* Skeleton Loading Demo */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          1. Skeleton Loading State
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Shows animated skeleton while components are loading
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <ProductCard product={demoProducts[0]} loading={true} />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Successful Image Loading */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          2. Successful Image Loading
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Featured product with proper image loading (simulated with placeholder)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <ProductCard 
              product={demoProducts[0]} 
              aiMatch={95}
              fallbackStrategy="adaptive" 
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Fallback Strategies */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          3. Image Fallback Strategies
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Different approaches to handling missing or broken images
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Placeholder Strategy
              </Typography>
              <ProductCard 
                product={demoProducts[1]} 
                fallbackStrategy="placeholder"
                enableImageRetry={true}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Text Strategy
              </Typography>
              <ProductCard 
                product={demoProducts[2]} 
                fallbackStrategy="text"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Adaptive Strategy
              </Typography>
              <ProductCard 
                product={demoProducts[3]} 
                fallbackStrategy="adaptive"
                enableImageRetry={true}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Layout Adjustments */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          4. Layout Adjustments for Missing Images
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cards adapt their layout when images are unavailable, showing enhanced content
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <ProductCard 
              product={demoProducts[4]} 
              fallbackStrategy="placeholder"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ProductCard 
              product={{
                ...demoProducts[2],
                description: 'This product shows how the card layout adapts when images are missing. Notice the larger text, additional benefits chips, and enhanced spacing.'
              }} 
              fallbackStrategy="adaptive"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Performance Features */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          5. Performance & Accessibility Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">
                🚀 Performance Optimizations
              </Typography>
              <ul>
                <li>Intersection Observer for lazy loading</li>
                <li>Priority loading for featured products</li>
                <li>Exponential backoff for retry attempts</li>
                <li>Image preloading and caching</li>
                <li>Optimized re-renders with React.memo</li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="secondary">
                ♿ Accessibility Features
              </Typography>
              <ul>
                <li>Proper ARIA labels and roles</li>
                <li>Screen reader friendly alt text</li>
                <li>Keyboard navigation support</li>
                <li>High contrast fallback designs</li>
                <li>Focus management and indicators</li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Error Handling */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          6. Error Handling & Recovery
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Robust error boundaries and graceful degradation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <ProductCard 
              product={demoProducts[3]} 
              fallbackStrategy="adaptive"
              enableImageRetry={true}
            />
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          Implementation Highlights
        </Typography>
        <Typography variant="body1">
          ✅ Comprehensive fallback system with multiple strategies<br />
          ✅ Performance optimized with lazy loading and intersection observers<br />
          ✅ Accessibility compliant with proper ARIA attributes<br />
          ✅ Responsive design that works across all screen sizes<br />
          ✅ Error boundaries for graceful error handling<br />
          ✅ Extensive test coverage for reliability<br />
          ✅ Category-specific placeholders with themed designs
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProductCardDemo;