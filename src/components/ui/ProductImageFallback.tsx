'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Skeleton,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RetryIcon,
  Chair as ChairIcon,
  Laptop as LaptopIcon,
  Checkroom as ClothingIcon,
  Home as HomeIcon,
  SportsEsports as SportsIcon,
  LocalFlorist as GardenIcon,
  Kitchen as KitchenIcon,
  DirectionsCar as AutoIcon,
  LibraryBooks as BooksIcon,
  Pets as PetsIcon,
  ChildCare as ToysIcon,
  FitnessCenter as FitnessIcon,
  MusicNote as MusicIcon,
  Palette as ArtsIcon,
  Build as ToolsIcon,
  ImageNotSupported as NoImageIcon,
} from '@mui/icons-material';

// Category to icon mapping
const categoryIconMap = {
  // Furniture & Home
  furniture: ChairIcon,
  'home-decor': HomeIcon,
  'home-garden': GardenIcon,
  kitchen: KitchenIcon,
  
  // Electronics & Technology
  electronics: LaptopIcon,
  computers: LaptopIcon,
  'tech-gadgets': LaptopIcon,
  
  // Fashion & Apparel
  clothing: ClothingIcon,
  fashion: ClothingIcon,
  apparel: ClothingIcon,
  
  // Sports & Recreation
  sports: SportsIcon,
  fitness: FitnessIcon,
  outdoor: SportsIcon,
  
  // Automotive
  automotive: AutoIcon,
  'auto-parts': AutoIcon,
  
  // Entertainment & Media
  books: BooksIcon,
  music: MusicIcon,
  'arts-crafts': ArtsIcon,
  
  // Family & Kids
  toys: ToysIcon,
  'baby-kids': ToysIcon,
  pets: PetsIcon,
  
  // Tools & Hardware
  tools: ToolsIcon,
  hardware: ToolsIcon,
  
  // Default fallback
  default: HomeIcon,
} as const;

// Category color schemes
const categoryColorSchemes = {
  furniture: {
    background: 'linear-gradient(135deg, #f9f9f9, #f0f0f0)',
    iconColor: '#8b4513',
    textColor: '#5d4037',
    borderColor: '#d7ccc8',
  },
  'home-decor': {
    background: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
    iconColor: '#ff8f00',
    textColor: '#e65100',
    borderColor: '#ffcc02',
  },
  electronics: {
    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
    iconColor: '#1976d2',
    textColor: '#1565c0',
    borderColor: '#90caf9',
  },
  clothing: {
    background: 'linear-gradient(135deg, #fce4ec, #f8bbd9)',
    iconColor: '#dc004e',
    textColor: '#c2185b',
    borderColor: '#f48fb1',
  },
  fashion: {
    background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
    iconColor: '#7b1fa2',
    textColor: '#6a1b9a',
    borderColor: '#ce93d8',
  },
  sports: {
    background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)',
    iconColor: '#00695c',
    textColor: '#004d40',
    borderColor: '#4db6ac',
  },
  'home-garden': {
    background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
    iconColor: '#4caf50',
    textColor: '#2e7d32',
    borderColor: '#81c784',
  },
  automotive: {
    background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
    iconColor: '#673ab7',
    textColor: '#512da8',
    borderColor: '#b39ddb',
  },
  default: {
    background: 'linear-gradient(135deg, #fafafa, #f5f5f5)',
    iconColor: '#757575',
    textColor: '#616161',
    borderColor: '#e0e0e0',
  },
} as const;

export type ImageFallbackState = 'loading' | 'loaded' | 'error' | 'empty' | 'retrying';
export type FallbackStrategy = 'skeleton' | 'placeholder' | 'text' | 'adaptive';

interface ProductImageFallbackProps {
  src?: string;
  alt: string;
  category?: string;
  size?: 'small' | 'medium' | 'large';
  loading?: 'lazy' | 'eager';
  fallbackStrategy?: FallbackStrategy;
  showRetryButton?: boolean;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  onRetry?: () => void;
  height?: number | string;
  width?: number | string;
  borderRadius?: number | string;
  priority?: boolean;
  enableIntersectionObserver?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

const ProductImageFallback: React.FC<ProductImageFallbackProps> = ({
  src,
  alt,
  category = 'default',
  size = 'medium',
  loading = 'lazy',
  fallbackStrategy = 'adaptive',
  showRetryButton = true,
  onError,
  onLoad,
  onRetry,
  height = 200,
  width = '100%',
  borderRadius = 2,
  priority = false,
  enableIntersectionObserver = true,
  retryDelay = 1000,
  maxRetries = 3,
}) => {
  const theme = useTheme();
  const [state, setState] = useState<ImageFallbackState>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [isInView, setIsInView] = useState(!enableIntersectionObserver || priority);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Get category configuration
  const categoryKey = category.toLowerCase() as keyof typeof categoryColorSchemes;
  const colorScheme = categoryColorSchemes[categoryKey] || categoryColorSchemes.default;
  const IconComponent = categoryIconMap[categoryKey] || categoryIconMap.default;

  // Size configurations
  const sizeConfig = {
    small: { iconSize: 32, fontSize: '0.75rem', padding: 12 },
    medium: { iconSize: 48, fontSize: '0.875rem', padding: 16 },
    large: { iconSize: 64, fontSize: '1rem', padding: 20 },
  };
  const { iconSize, fontSize, padding } = sizeConfig[size];

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableIntersectionObserver || priority || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [enableIntersectionObserver, priority]);

  // Image loading effect
  useEffect(() => {
    if (!src || !isInView) {
      if (!src) setState('empty');
      return;
    }

    // Avoid reloading if already loaded
    if (state === 'loaded') return;

    setState('loading');
    setLoadStartTime(Date.now());
    
    // Create new image for loading
    const img = new Image();
    
    const handleLoad = () => {
      const loadTime = Date.now() - loadStartTime;
      setState('loaded');
      onLoad?.();
      
      // Performance logging (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Image loaded in ${loadTime}ms:`, src);
      }
    };
    
    const handleError = () => {
      setState('error');
      const errorObj = new Error(`Image failed to load: ${src}`);
      onError?.(errorObj);
      
      // Auto-retry with exponential backoff (only if not already at max retries)
      if (retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCount);
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setState('retrying');
        }, delay);
      }
    };
    
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [src, isInView]); // Removed problematic dependencies

  // Separate effect for handling retries to avoid infinite loops
  useEffect(() => {
    if (state === 'retrying' && src && isInView) {
      const timer = setTimeout(() => {
        setState('loading');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [state, src, isInView]);

  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      setState('retrying');
      onRetry?.();
      
      // Clear any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    }
  }, [retryCount, maxRetries, onRetry]);

  const renderSkeleton = () => (
    <Box
      sx={{
        width,
        height,
        borderRadius,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        sx={{
          bgcolor: alpha(theme.palette.grey[300], 0.3),
          '&::after': {
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.8)}, transparent)`,
          },
        }}
      />
      {state === 'retrying' && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <CircularProgress size={24} thickness={4} />
        </Box>
      )}
    </Box>
  );

  const renderPlaceholder = () => (
    <Box
      sx={{
        width,
        height,
        borderRadius,
        background: colorScheme.background,
        border: `2px dashed ${colorScheme.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          borderColor: colorScheme.iconColor,
        },
      }}
    >
      <IconComponent
        sx={{
          fontSize: iconSize,
          color: colorScheme.iconColor,
          mb: 1,
          opacity: 0.7,
        }}
      />
      
      <Typography
        variant="caption"
        sx={{
          color: colorScheme.textColor,
          fontSize,
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: '80%',
          textTransform: 'capitalize',
        }}
      >
        {category.replace('-', ' ')} Product
      </Typography>
      
      {state === 'error' && showRetryButton && retryCount < maxRetries && (
        <IconButton
          onClick={handleRetry}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: alpha(colorScheme.iconColor, 0.1),
            color: colorScheme.iconColor,
            '&:hover': {
              backgroundColor: alpha(colorScheme.iconColor, 0.2),
            },
          }}
          aria-label={`Retry loading image (${retryCount + 1}/${maxRetries})`}
          title={`Retry ${retryCount + 1}/${maxRetries}`}
        >
          <RetryIcon fontSize="small" />
        </IconButton>
      )}
      
      {state === 'retrying' && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderRadius: '50%',
            p: 1,
          }}
        >
          <CircularProgress size={24} thickness={4} />
        </Box>
      )}
      
      {/* Brand watermark */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          opacity: 0.3,
          fontSize: '0.7rem',
          fontWeight: 500,
          color: colorScheme.textColor,
        }}
      >
        E-Commerce AI
      </Box>
    </Box>
  );

  const renderTextFallback = () => (
    <Box
      sx={{
        width,
        height,
        borderRadius,
        bgcolor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[300]}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: padding,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.text.secondary,
          fontWeight: 600,
          textAlign: 'center',
          mb: 1,
        }}
      >
        Image Unavailable
      </Typography>
      
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.disabled,
          textAlign: 'center',
        }}
      >
        {alt}
      </Typography>
    </Box>
  );

  // Determine fallback strategy adaptively
  const getAdaptiveFallbackStrategy = (): FallbackStrategy => {
    if (fallbackStrategy !== 'adaptive') return fallbackStrategy;
    
    // Use skeleton for initial loading and retrying
    if (state === 'loading' || state === 'retrying') return 'skeleton';
    
    // Use placeholder for categories with good visual representation
    const categoryKey = category.toLowerCase() as keyof typeof categoryColorSchemes;
    if (categoryColorSchemes[categoryKey]) return 'placeholder';
    
    // Default to text fallback
    return 'text';
  };

  const activeFallbackStrategy = getAdaptiveFallbackStrategy();

  // Render based on state and strategy
  if (state === 'loaded' && src) {
    return (
      <Box
        ref={containerRef}
        component="img"
        src={src}
        alt={alt}
        loading={loading}
        sx={{
          width,
          height,
          borderRadius,
          objectFit: 'cover',
          display: 'block',
          transition: 'opacity 0.3s ease-in-out',
          opacity: state === 'loaded' ? 1 : 0,
        }}
        onLoad={() => {
          setState('loaded');
          onLoad?.();
        }}
        onError={() => {
          setState('error');
          onError?.(new Error('Image failed to load'));
        }}
      />
    );
  }

  // Container wrapper for intersection observer
  const content = (() => {
    // Loading state
    if ((state === 'loading' || state === 'retrying') && activeFallbackStrategy === 'skeleton') {
      return renderSkeleton();
    }

    // Error or empty state
    if (state === 'error' || state === 'empty') {
      switch (activeFallbackStrategy) {
        case 'skeleton':
          return renderSkeleton();
        case 'text':
          return renderTextFallback();
        case 'placeholder':
        default:
          return renderPlaceholder();
      }
    }

    // Default loading state (non-skeleton)
    return renderPlaceholder();
  })();

  return (
    <Box
      ref={containerRef}
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {content}
    </Box>
  );
};

export default ProductImageFallback;