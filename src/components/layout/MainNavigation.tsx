'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Badge,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Container,
  Popper,
  Paper,
  Grid,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  PhotoCamera as CameraIcon,
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface NavCategory {
  id: string;
  label: string;
  href: string;
  children?: {
    id: string;
    title: string;
    items: Array<{
      id: string;
      label: string;
      href: string;
    }>;
  }[];
  featured?: {
    title: string;
    description: string;
    image: string;
    href: string;
  };
  trending?: string[];
  aiPicks?: string[];
}

const categories: NavCategory[] = [
  {
    id: 'living-room',
    label: 'Living Room',
    href: '/categories/living-room',
    children: [
      {
        id: 'seating',
        title: 'SEATING',
        items: [
          { id: 'sofas', label: 'Sofas & Sectionals', href: '/categories/sofas' },
          { id: 'chairs', label: 'Accent Chairs', href: '/categories/chairs' },
          { id: 'ottomans', label: 'Ottomans', href: '/categories/ottomans' },
          { id: 'recliners', label: 'Recliners', href: '/categories/recliners' },
        ],
      },
      {
        id: 'tables',
        title: 'TABLES',
        items: [
          { id: 'coffee-tables', label: 'Coffee Tables', href: '/categories/coffee-tables' },
          { id: 'side-tables', label: 'Side Tables', href: '/categories/side-tables' },
          { id: 'console-tables', label: 'Console Tables', href: '/categories/console-tables' },
        ],
      },
      {
        id: 'storage',
        title: 'STORAGE',
        items: [
          { id: 'tv-stands', label: 'TV Stands', href: '/categories/tv-stands' },
          { id: 'bookcases', label: 'Bookcases', href: '/categories/bookcases' },
          { id: 'storage-ottomans', label: 'Storage Ottomans', href: '/categories/storage-ottomans' },
        ],
      },
      {
        id: 'decor',
        title: 'DECOR',
        items: [
          { id: 'wall-art', label: 'Wall Art', href: '/categories/wall-art' },
          { id: 'mirrors', label: 'Mirrors', href: '/categories/mirrors' },
          { id: 'lamps', label: 'Lamps', href: '/categories/lamps' },
          { id: 'rugs', label: 'Rugs', href: '/categories/rugs' },
        ],
      },
    ],
    featured: {
      title: 'Mid-Century Modern Sale',
      description: 'Up to 40% Off',
      image: '/images/featured/mid-century-sale.jpg',
      href: '/sales/mid-century-modern',
    },
    trending: ['Modern Minimalist', 'Scandinavian Style', 'Industrial Chic', 'Boho Living'],
    aiPicks: ['Modern Sofas', 'Coffee Tables', 'Floor Lamps'],
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    href: '/categories/bedroom',
    children: [
      {
        id: 'beds',
        title: 'BEDS',
        items: [
          { id: 'bed-frames', label: 'Bed Frames', href: '/categories/bed-frames' },
          { id: 'headboards', label: 'Headboards', href: '/categories/headboards' },
          { id: 'platform-beds', label: 'Platform Beds', href: '/categories/platform-beds' },
        ],
      },
      {
        id: 'bedroom-storage',
        title: 'STORAGE',
        items: [
          { id: 'dressers', label: 'Dressers', href: '/categories/dressers' },
          { id: 'nightstands', label: 'Nightstands', href: '/categories/nightstands' },
          { id: 'wardrobes', label: 'Wardrobes', href: '/categories/wardrobes' },
        ],
      },
    ],
  },
  {
    id: 'dining',
    label: 'Dining',
    href: '/categories/dining',
    children: [
      {
        id: 'dining-tables',
        title: 'TABLES',
        items: [
          { id: 'dining-table-sets', label: 'Dining Table Sets', href: '/categories/dining-sets' },
          { id: 'dining-tables-only', label: 'Dining Tables', href: '/categories/dining-tables' },
          { id: 'bar-tables', label: 'Bar Tables', href: '/categories/bar-tables' },
        ],
      },
      {
        id: 'dining-chairs',
        title: 'SEATING',
        items: [
          { id: 'dining-chairs-only', label: 'Dining Chairs', href: '/categories/dining-chairs' },
          { id: 'bar-stools', label: 'Bar Stools', href: '/categories/bar-stools' },
        ],
      },
    ],
  },
  {
    id: 'office',
    label: 'Office',
    href: '/categories/office',
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    href: '/categories/kitchen',
  },
  {
    id: 'outdoor',
    label: 'Outdoor',
    href: '/categories/outdoor',
  },
];

export default function MainNavigation() {
  const theme = useTheme();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { itemCount } = useCartStore();
  const { 
    isMobileMenuOpen, 
    isSearchOpen, 
    setMobileMenuOpen, 
    setSearchOpen 
  } = useUIStore();
  
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [megaMenuAnchor, setMegaMenuAnchor] = useState<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleCategoryHover = (categoryId: string, event: React.MouseEvent<HTMLElement>) => {
    if (isMobile) return;
    
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.children) {
      setActiveCategory(categoryId);
      setMegaMenuAnchor(event.currentTarget);
    }
  };

  const handleCategoryLeave = () => {
    if (isMobile) return;
    
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
      setMegaMenuAnchor(null);
    }, 200);
  };

  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
  };

  const handleMegaMenuLeave = () => {
    setActiveCategory(null);
    setMegaMenuAnchor(null);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
      setSearchOpen(false);
    }
  };

  const activeCategoryData = categories.find(cat => cat.id === activeCategory);

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar sx={{ px: 0, minHeight: { xs: 56, md: 64 } }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: { xs: 1, md: 4 },
              }}
              onClick={() => router.push('/')}
            >
              <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                E-Commerce AI
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', mx: 2 }}>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    color="inherit"
                    endIcon={category.children ? <ArrowDownIcon /> : undefined}
                    sx={{
                      mx: 1,
                      minWidth: 'auto',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'primary.main',
                      },
                    }}
                    onMouseEnter={(e) => handleCategoryHover(category.id, e)}
                    onMouseLeave={handleCategoryLeave}
                    onClick={() => router.push(category.href)}
                  >
                    {category.label}
                  </Button>
                ))}
                <Button
                  color="inherit"
                  sx={{
                    mx: 1,
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    },
                  }}
                  onClick={() => router.push('/sale')}
                >
                  Sale 🏷️
                </Button>
              </Box>
            )}

            {/* Search Bar - Desktop */}
            {!isMobile && (
              <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{
                  position: 'relative',
                  borderRadius: 25,
                  backgroundColor: 'grey.100',
                  border: '2px solid',
                  borderColor: 'grey.300',
                  '&:hover': {
                    borderColor: 'grey.400',
                  },
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    boxShadow: 1,
                  },
                  ml: 2,
                  width: 400,
                  maxWidth: 400,
                }}
              >
                <InputBase
                  placeholder="Search products, brands, categories..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  sx={{
                    color: 'inherit',
                    width: '100%',
                    pl: 2,
                    pr: 8,
                    py: 1,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    pr: 1,
                  }}
                >
                  <IconButton size="small" type="submit">
                    <SearchIcon />
                  </IconButton>
                  <IconButton size="small" title="AI Visual Search">
                    <CameraIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Mobile Search Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setSearchOpen(true)}
                sx={{ ml: 'auto', mr: 1 }}
              >
                <SearchIcon />
              </IconButton>
            )}

            {/* User Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 0, md: 2 } }}>
              {/* Theme Toggle */}
              <ThemeToggle size="medium" />

              {isSignedIn ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: {
                        height: 32,
                        width: 32,
                      },
                    },
                  }}
                />
              ) : (
                <IconButton
                  color="inherit"
                  onClick={() => router.push('/sign-in')}
                  sx={{ mr: 1 }}
                >
                  <PersonIcon />
                </IconButton>
              )}

              <IconButton
                color="inherit"
                onClick={() => router.push('/cart')}
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={itemCount} color="secondary">
                  <CartIcon />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mega Menu */}
      <Popper
        open={Boolean(megaMenuAnchor && activeCategory)}
        anchorEl={megaMenuAnchor}
        placement="bottom-start"
        sx={{
          zIndex: theme.zIndex.modal,
          width: '100vw',
          left: '0 !important',
          transform: 'none !important',
        }}
        onMouseEnter={handleMegaMenuEnter}
        onMouseLeave={handleMegaMenuLeave}
      >
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: 1280,
            mx: 'auto',
            mt: 1,
            p: 4,
          }}
        >
          {activeCategoryData && activeCategoryData.children && (
            <Grid container spacing={4}>
              {/* Category Sections */}
              {activeCategoryData.children.map((section) => (
                <Grid item xs={12} sm={6} md={3} key={section.id}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    {section.title}
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    {section.items.map((item) => (
                      <ListItem
                        key={item.id}
                        button
                        sx={{
                          px: 0,
                          py: 0.5,
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        }}
                        onClick={() => router.push(item.href)}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: {
                              '&:hover': {
                                color: 'primary.main',
                              },
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              ))}

              {/* Featured Section */}
              {activeCategoryData.featured && (
                <Grid item xs={12} md={3}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    Featured Collection
                  </Typography>
                  <Paper
                    sx={{
                      position: 'relative',
                      height: 150,
                      backgroundImage: `url(${activeCategoryData.featured.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                      },
                    }}
                    onClick={() => router.push(activeCategoryData.featured!.href)}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16,
                        zIndex: 1,
                        color: 'white',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {activeCategoryData.featured.title}
                      </Typography>
                      <Typography variant="body2">
                        {activeCategoryData.featured.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* AI Picks Section */}
              {activeCategoryData.aiPicks && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'primary.50',
                      borderRadius: 1,
                      border: '2px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      🤖 AI PICKS
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Based on your browsing:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {activeCategoryData.aiPicks.map((pick, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{
                            color: 'primary.main',
                            '&:not(:last-child):after': {
                              content: '"•"',
                              mx: 1,
                              color: 'text.secondary',
                            },
                          }}
                        >
                          {pick}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>
      </Popper>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={isMobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            pt: 2,
          },
        }}
      >
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            👋 Hi, Welcome!
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem button onClick={() => router.push('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          {categories.map((category) => (
            <ListItem
              button
              key={category.id}
              onClick={() => router.push(category.href)}
            >
              <ListItemText primary={category.label} />
            </ListItem>
          ))}
          <ListItem button onClick={() => router.push('/sale')}>
            <ListItemText primary="🔥 Sale" />
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            Settings:
          </Typography>
          <ThemeToggle showLabel={true} />
        </Box>
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            🤖 AI Features:
          </Typography>
          <List dense>
            <ListItem button>
              <ListItemText primary="• Visual Search" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="• Smart Recommendations" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="• Style Quiz" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Mobile Search Overlay */}
      <Drawer
        anchor="top"
        open={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            height: 'auto',
            maxHeight: '100vh',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <InputBase
              ref={searchInputRef}
              placeholder="Search products, brands, categories..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                flex: 1,
                fontSize: '1.1rem',
                p: 1,
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                mr: 1,
              }}
            />
            <IconButton type="submit" color="primary" size="large">
              <SearchIcon />
            </IconButton>
            <IconButton
              onClick={() => setSearchOpen(false)}
              color="inherit"
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            startIcon={<CameraIcon />}
            fullWidth
            sx={{ mb: 1 }}
          >
            🤖 Try AI Visual Search
          </Button>
        </Box>
      </Drawer>
    </>
  );
}