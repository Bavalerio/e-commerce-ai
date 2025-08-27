'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import { usePathname } from 'next/navigation';
import MainNavigation from './MainNavigation';
import Footer from './Footer';

interface RootLayoutProps {
  children: React.ReactNode;
}

// Pages that should have full-width layout (no container)
const FULL_WIDTH_PAGES = [
  '/',
  '/categories',
  '/search',
  '/checkout',
];

// Pages that should hide navigation/footer
const MINIMAL_LAYOUT_PAGES = [
  '/sign-in',
  '/sign-up',
  '/checkout/success',
];

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  
  const isFullWidth = FULL_WIDTH_PAGES.some(page => pathname === page || pathname.startsWith(page));
  const isMinimalLayout = MINIMAL_LAYOUT_PAGES.some(page => pathname.startsWith(page));
  const isCheckoutPage = pathname.startsWith('/checkout');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Navigation - hidden on minimal layout pages */}
      {!isMinimalLayout && <MainNavigation />}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isFullWidth ? (
          children
        ) : (
          <Container
            maxWidth="xl"
            sx={{
              py: { xs: 2, md: 3 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Container>
        )}
      </Box>

      {/* Footer - hidden on minimal layout and checkout pages */}
      {!isMinimalLayout && !isCheckoutPage && <Footer />}
    </Box>
  );
}