'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Rating,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';
import ProductImageFallback from './ProductImageFallback';
import ImageErrorBoundary from './ImageErrorBoundary';
import { extractCategoryFromProduct } from '@/utils/image-fallback';

interface ProductCardProps {
  product: Product;
  loading?: boolean;
  showQuickView?: boolean;
  aiMatch?: number; // AI recommendation match percentage
  fallbackStrategy?: 'skeleton' | 'placeholder' | 'text';
  enableImageRetry?: boolean;
}

export default function ProductCard({ 
  product, 
  loading = false,
  showQuickView = false,
  aiMatch,
  fallbackStrategy = 'placeholder',
  enableImageRetry = true,
}: ProductCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { addItem, isLoading: isAddingToCart } = useCartStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Extract category for fallback
  const productCategory = extractCategoryFromProduct(product);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addItem(product.id);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // You could show a toast notification here
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleViewProduct = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Open quick view modal
    console.log('Quick view:', product.slug);
  };

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
    : 0;

  const isOnSale = discountPercentage > 0;
  const isOutOfStock = !product.inventory || product.inventory === 0;

  if (loading) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: theme.shadows[2],
        }}
      >
        {/* Enhanced Skeleton Image */}
        <Box sx={{ position: 'relative' }}>
          <Skeleton 
            variant="rectangular" 
            height={200} 
            sx={{
              bgcolor: theme.palette.grey[100],
              '&::after': {
                background: `linear-gradient(90deg, transparent, ${theme.palette.common.white}40, transparent)`,
              },
              borderRadius: '8px 8px 0 0',
            }}
          />
          {/* Skeleton badges */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>

        <CardContent sx={{ flex: 1, p: 2 }}>
          {/* Brand skeleton */}
          <Skeleton variant="text" height={16} width="40%" sx={{ mb: 0.5 }} />
          
          {/* Product name skeleton */}
          <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={28} width="80%" sx={{ mb: 1.5 }} />
          
          {/* Rating skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Skeleton variant="rectangular" width={80} height={16} />
            <Skeleton variant="text" width={30} height={16} />
          </Box>
          
          {/* Price skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Skeleton variant="text" height={24} width="30%" />
            <Skeleton variant="text" height={20} width="25%" />
          </Box>
          
          {/* Benefits skeleton */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={90} height={20} sx={{ borderRadius: 1 }} />
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={40} 
            sx={{ borderRadius: 2 }}
          />
        </CardActions>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[8],
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
    >
      {/* Image Container */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <ImageErrorBoundary
          resetKeys={[product.id, product.images?.[0]]}
          resetOnPropsChange={true}
          onError={(error) => {
            console.error('Image error boundary triggered:', error);
            setImageError(true);
            setImageLoaded(false);
          }}
        >
          <ProductImageFallback
            src={product.images?.[0]}
            alt={product.name}
            category={productCategory}
            height={200}
            loading="lazy"
            fallbackStrategy={fallbackStrategy}
            showRetryButton={enableImageRetry}
            priority={product.featured}
            enableIntersectionObserver={!product.featured}
            maxRetries={2}
            retryDelay={1500}
            onError={(error) => {
              setImageError(true);
              setImageLoaded(false);
              console.warn('Product image failed to load:', error);
            }}
            onLoad={() => {
              setImageError(false);
              setImageLoaded(true);
            }}
            onRetry={() => {
              setImageError(false);
              setImageLoaded(false);
            }}
          />
        </ImageErrorBoundary>

        {/* Badges */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {isOnSale && (
            <Chip
              label={`-${discountPercentage}%`}
              color="secondary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
          {product.featured && (
            <Chip
              label="Featured"
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
          {aiMatch && aiMatch >= 90 && (
            <Chip
              label={`🤖 ${aiMatch}% Match`}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
              size="small"
            />
          )}
          {isOutOfStock && (
            <Chip
              label="Out of Stock"
              color="default"
              size="small"
              sx={{ backgroundColor: 'grey.400', color: 'white' }}
            />
          )}
        </Box>

        {/* Favorite Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
          onClick={handleToggleFavorite}
        >
          {isFavorite ? (
            <FavoriteIcon color="secondary" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>

        {/* Quick Actions Overlay */}
        {(isHovered || isMobile) && showQuickView && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              opacity: isHovered || isMobile ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          >
            <Button
              variant="contained"
              startIcon={<ViewIcon />}
              onClick={handleQuickView}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
            >
              Quick View
            </Button>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent 
        sx={{ 
          flex: 1, 
          pb: 1,
          // Adjust padding when image is missing to better utilize space
          pt: imageError && !imageLoaded ? 3 : 2,
        }}
      >
        {/* Brand */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', fontWeight: 500, letterSpacing: 1 }}
        >
          {product.vendorId?.replace('vendor-', '').replace(/-/g, ' ') || 'E-Commerce AI'}
        </Typography>

        {/* Product Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            lineHeight: 1.2,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            // Allow more lines when image is missing
            WebkitLineClamp: imageError && !imageLoaded ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            // Larger font size when no image
            fontSize: imageError && !imageLoaded ? '1.25rem' : undefined,
          }}
        >
          {product.name}
        </Typography>

        {/* Enhanced description when image is missing */}
        {imageError && !imageLoaded && product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Rating
            value={4.5} // TODO: Get from product reviews
            precision={0.1}
            size={imageError && !imageLoaded ? 'medium' : 'small'}
            readOnly
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              fontSize: imageError && !imageLoaded ? '0.875rem' : undefined,
            }}
          >
            (47) {/* TODO: Get review count */}
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography
            variant={imageError && !imageLoaded ? 'h5' : 'h6'}
            sx={{ 
              fontWeight: 600, 
              color: 'primary.main',
              fontSize: imageError && !imageLoaded ? '1.5rem' : undefined,
            }}
          >
            ${Number(product.price).toFixed(2)}
          </Typography>
          {product.compareAtPrice && (
            <Typography
              variant="body2"
              sx={{
                textDecoration: 'line-through',
                color: 'text.secondary',
                fontSize: imageError && !imageLoaded ? '1rem' : undefined,
              }}
            >
              ${Number(product.compareAtPrice).toFixed(2)}
            </Typography>
          )}
        </Box>

        {/* Benefits */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {Number(product.price) >= 49 && (
            <Chip
              label="Free Shipping"
              size={imageError && !imageLoaded ? 'medium' : 'small'}
              variant="outlined"
              color="success"
              sx={{ 
                fontSize: imageError && !imageLoaded ? '0.8rem' : '0.7rem', 
                height: imageError && !imageLoaded ? 28 : 20,
              }}
            />
          )}
          <Chip
            label="30-Day Returns"
            size={imageError && !imageLoaded ? 'medium' : 'small'}
            variant="outlined"
            sx={{ 
              fontSize: imageError && !imageLoaded ? '0.8rem' : '0.7rem', 
              height: imageError && !imageLoaded ? 28 : 20,
            }}
          />
          
          {/* Additional benefits when image is missing */}
          {imageError && !imageLoaded && (
            <>
              <Chip
                label="Quality Guarantee"
                size="medium"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.8rem', height: 28 }}
              />
              {product.vendorId && (
                <Chip
                  label={`By ${product.vendorId.replace('vendor-', '').replace(/-/g, ' ')}`}
                  size="medium"
                  variant="outlined"
                  sx={{ fontSize: '0.8rem', height: 28 }}
                />
              )}
            </>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<CartIcon />}
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            // Larger button when image is missing
            height: imageError && !imageLoaded ? 48 : 40,
            fontSize: imageError && !imageLoaded ? '1rem' : '0.875rem',
          }}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  );
}