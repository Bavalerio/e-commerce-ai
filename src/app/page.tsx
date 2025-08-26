'use client';

import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid2 as Grid, 
  Card, 
  CardContent, 
  CardActions,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
  Fab
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ShoppingCart, 
  Search, 
  Home, 
  Category, 
  Person,
  Favorite,
  GetApp
} from '@mui/icons-material';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useUIStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setMobileMenuOpen, installPrompt, setInstallPrompt } = useUIStore();
  const { itemCount } = useCartStore();
  const [showInstallButton, setShowInstallButton] = useState(false);

  // PWA Install handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [setInstallPrompt]);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
        setInstallPrompt(null);
      }
    }
  };

  return (
    <>
      {/* Mobile-First AppBar */}
      <AppBar position="fixed" className="bg-white shadow-sm">
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileMenuOpen(true)}
            className="mr-2 md:hidden"
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" className="flex-grow font-bold text-primary">
            E-Commerce AI
          </Typography>

          <div className="flex items-center gap-2">
            <IconButton>
              <Search />
            </IconButton>
            
            <IconButton className="relative">
              <ShoppingCart />
              {itemCount > 0 && (
                <Chip 
                  label={itemCount} 
                  size="small" 
                  color="error"
                  className="absolute -top-1 -right-1 h-5 min-w-5 text-xs"
                />
              )}
            </IconButton>

            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="contained" size="small" className="ml-2">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" className="pt-20 pb-20 md:pb-8">
        {/* Hero Section */}
        <Box className="text-center py-12 md:py-16">
          <Typography 
            variant="h2" 
            component="h1" 
            className="font-bold text-gray-800 mb-4"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Welcome to E-Commerce AI
          </Typography>
          <Typography 
            variant="h6" 
            className="text-gray-600 mb-8 max-w-2xl mx-auto"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Your modern mobile-first PWA e-commerce experience powered by the latest React stack
          </Typography>
          <Box className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="contained" 
              size="large" 
              className="text-lg px-8 py-3"
            >
              Shop Now
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              className="text-lg px-8 py-3"
            >
              Browse Categories
            </Button>
          </Box>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={3} className="my-8">
          <Grid xs={12} sm={6} md={3}>
            <Card className="h-full text-center p-4">
              <CardContent>
                <Box className="text-primary mb-3">
                  <ShoppingCart fontSize="large" />
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  Mobile-First Design
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Optimized for mobile devices with responsive design
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <Card className="h-full text-center p-4">
              <CardContent>
                <Box className="text-primary mb-3">
                  <GetApp fontSize="large" />
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  PWA Ready
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Install as an app on your device for offline access
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <Card className="h-full text-center p-4">
              <CardContent>
                <Box className="text-primary mb-3">
                  <Favorite fontSize="large" />
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  Latest Stack
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Built with Next.js 15, React 19, and TypeScript
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <Card className="h-full text-center p-4">
              <CardContent>
                <Box className="text-primary mb-3">
                  <Person fontSize="large" />
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  Secure Auth
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Powered by Clerk with modern authentication
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tech Stack Section */}
        <Box className="text-center py-12 bg-gray-50 rounded-lg my-8">
          <Typography variant="h4" className="font-bold mb-6 text-gray-800">
            Built with Modern Tech
          </Typography>
          <Box className="flex flex-wrap justify-center gap-3">
            {[
              'Next.js 15', 'React 19', 'TypeScript', 'Material UI v7', 
              'Tailwind CSS 4', 'Clerk Auth', 'NeonDB', 'Drizzle ORM',
              'Zustand', 'PWA Ready'
            ].map((tech) => (
              <Chip 
                key={tech} 
                label={tech} 
                variant="outlined" 
                className="text-sm font-medium"
              />
            ))}
          </Box>
        </Box>
      </Container>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          className="fixed bottom-0 left-0 right-0 border-t safe-area-bottom"
          showLabels
        >
          <BottomNavigationAction label="Home" icon={<Home />} />
          <BottomNavigationAction label="Categories" icon={<Category />} />
          <BottomNavigationAction 
            label="Cart" 
            icon={
              <Box className="relative">
                <ShoppingCart />
                {itemCount > 0 && (
                  <Chip 
                    label={itemCount} 
                    size="small" 
                    color="error"
                    className="absolute -top-2 -right-2 h-4 min-w-4 text-xs"
                  />
                )}
              </Box>
            } 
          />
          <BottomNavigationAction label="Profile" icon={<Person />} />
        </BottomNavigation>
      )}

      {/* PWA Install Button */}
      {showInstallButton && (
        <Fab
          color="primary"
          className="fixed bottom-20 right-4 z-50"
          onClick={handleInstallClick}
        >
          <GetApp />
        </Fab>
      )}
    </>
  );
}
