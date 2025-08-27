'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ShoppingBag as ShoppingIcon,
  Psychology as AIIcon,
  PhotoCamera as CameraIcon,
  ChatBubbleOutline as ChatIcon,
} from '@mui/icons-material';
// import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ui/ProductCard';
import { Product, PaginatedResponse } from '@/types';

export default function Homepage() {
  // const t = useTranslations('homepage');
  // const tCommon = useTranslations('common');
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [complementaryProducts, setComplementaryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch featured products (products with high rating become featured)
        const featuredResponse = await fetch('/api/products?featured=true&limit=8');
        if (!featuredResponse.ok) {
          throw new Error('Failed to fetch featured products');
        }
        const featuredData: PaginatedResponse<Product> = await featuredResponse.json();
        
        if (featuredData.success) {
          setFeaturedProducts(featuredData.data);
        }

        // If we don't have enough featured products, get some regular products
        if (!featuredData.success || featuredData.data.length < 4) {
          const allProductsResponse = await fetch('/api/products?limit=12');
          if (allProductsResponse.ok) {
            const allProductsData: PaginatedResponse<Product> = await allProductsResponse.json();
            if (allProductsData.success) {
              // Take first 8 as featured if we don't have enough featured products
              if (!featuredData.success || featuredData.data.length < 4) {
                setFeaturedProducts(allProductsData.data.slice(0, 8));
              }
              // Set trending and complementary products
              setTrendingProducts(allProductsData.data.slice(0, 4));
              setComplementaryProducts(allProductsData.data.slice(4, 8));
            }
          }
        } else {
          // Set trending and complementary from featured products
          setTrendingProducts(featuredData.data.slice(0, 4));
          setComplementaryProducts(featuredData.data.slice(4, 8));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 300,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Welcome to{' '}
                <Box component="span" sx={{ fontWeight: 600 }}>
                  E-Commerce AI
                </Box>
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 300,
                }}
              >
                Discover furniture and home goods with the power of AI. 
                Get personalized recommendations, visual search, and smart shopping assistance.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                  startIcon={<ShoppingIcon />}
                >
                  Shop Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white',
                    },
                  }}
                  startIcon={<AIIcon />}
                >
                  Try AI Features
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  textAlign: 'center',
                }}
              >
                <Typography variant="h2" sx={{ opacity: 0.3 }}>
                  🤖✨🛋️
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7, mt: 2 }}>
                  AI-Powered Shopping Experience
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* AI Features Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 600 }}>
            🤖 AI-Powered Features
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Experience the future of online shopping
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.100',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 4,
                },
              }}
            >
              <CameraIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Visual Search
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a photo to find similar products instantly with our AI-powered visual search
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.100',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 4,
                },
              }}
            >
              <ChatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get personalized shopping advice from our intelligent assistant
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.100',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 4,
                },
              }}
            >
              <AIIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Smart Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover products tailored to your style and preferences
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.100',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 4,
                },
              }}
            >
              <Typography variant="h3" sx={{ mb: 2 }}>🎨</Typography>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Style Quiz
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Take our style quiz to get curated product collections just for you
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Products */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Featured Products
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Handpicked by our AI for you
              </Typography>
            </Box>
            <Button variant="outlined">View All</Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}. Using fallback mode - some features may be limited.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard 
                    product={product} 
                    showQuickView 
                    aiMatch={product.featured ? 94 : Math.floor(Math.random() * 20) + 80}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* AI Recommendations Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Paper
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mr: 2 }}>
              🤖 AI Recommendations
            </Typography>
            <Chip
              label="92% Match Rate"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Based on your browsing history and preferences
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    💡 Trending Now
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Popular items in your style category
                  </Typography>
                  <Grid container spacing={2}>
                    {trendingProducts.slice(0, 2).map((product) => (
                      <Grid item xs={6} key={product.id}>
                        <ProductCard product={product} />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    🏠 Complete the Look
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Items that pair well with your recent views
                  </Typography>
                  <Grid container spacing={2}>
                    {complementaryProducts.slice(0, 2).map((product) => (
                      <Grid item xs={6} key={product.id}>
                        <ProductCard product={product} />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              }}
            >
              Explore All AI Recommendations
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Experience AI Shopping?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied customers who have transformed their shopping experience
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              Start Shopping
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}