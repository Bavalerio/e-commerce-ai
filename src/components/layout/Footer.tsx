'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const footerSections = [
  {
    title: 'Shop',
    links: [
      { label: 'Living Room', href: '/categories/living-room' },
      { label: 'Bedroom', href: '/categories/bedroom' },
      { label: 'Dining Room', href: '/categories/dining' },
      { label: 'Office', href: '/categories/office' },
      { label: 'Kitchen', href: '/categories/kitchen' },
      { label: 'Outdoor', href: '/categories/outdoor' },
      { label: 'Sale', href: '/sale' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'Contact Us', href: '/support' },
      { label: 'Help Center', href: '/help' },
      { label: 'Shipping & Returns', href: '/help/shipping' },
      { label: 'Size Guide', href: '/help/size-guide' },
      { label: 'Track Your Order', href: '/orders/track' },
      { label: 'Product Care', href: '/help/care' },
      { label: 'Warranty', href: '/help/warranty' },
    ],
  },
  {
    title: 'AI Features',
    links: [
      { label: 'Visual Search', href: '/ai/visual-search' },
      { label: 'Style Quiz', href: '/ai/style-quiz' },
      { label: 'Room Designer', href: '/ai/room-designer' },
      { label: 'Smart Recommendations', href: '/ai/recommendations' },
      { label: 'Personal Shopping Assistant', href: '/ai/assistant' },
      { label: 'About Our AI', href: '/ai/about' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Accessibility', href: '/accessibility' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

const socialLinks = [
  { icon: FacebookIcon, href: 'https://facebook.com/ecommerceai', label: 'Facebook' },
  { icon: TwitterIcon, href: 'https://twitter.com/ecommerceai', label: 'Twitter' },
  { icon: InstagramIcon, href: 'https://instagram.com/ecommerceai', label: 'Instagram' },
  { icon: YouTubeIcon, href: 'https://youtube.com/ecommerceai', label: 'YouTube' },
];

export default function Footer() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        {/* Newsletter Signup */}
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Stay Connected with E-Commerce AI
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Get the latest deals, AI-powered recommendations, and home design inspiration
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            <Box
              component="input"
              type="email"
              placeholder="Enter your email address"
              sx={{
                flex: 1,
                minWidth: { xs: '100%', sm: 300 },
                px: 2,
                py: 1.5,
                border: '2px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                fontSize: '1rem',
                outline: 'none',
                '&:focus': {
                  borderColor: 'primary.main',
                },
              }}
            />
            <Box
              component="button"
              sx={{
                px: 3,
                py: 1.5,
                backgroundColor: 'primary.main',
                color: 'white',
                border: 'none',
                borderRadius: 1,
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                minWidth: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Subscribe
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Main Footer Content */}
        <Box sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* Footer Links */}
            {footerSections.map((section) => (
              <Grid item xs={12} sm={6} md={3} key={section.title}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {section.title}
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {section.links.map((link) => (
                    <ListItem
                      key={link.label}
                      component="button"
                      sx={{
                        px: 0,
                        py: 0.5,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }}
                      onClick={() => router.push(link.href)}
                    >
                      <ListItemText
                        primary={
                          <Link
                            component="span"
                            color="text.secondary"
                            sx={{
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              '&:hover': {
                                color: 'primary.main',
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {link.label}
                          </Link>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider />

        {/* Contact & Social */}
        <Box sx={{ py: 4 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Contact Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Get in Touch
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    1-800-ECOM-AI (1-800-326-624)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    support@ecommerce-ai.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    123 Innovation Street, Tech City, TC 12345
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Social Links */}
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'primary.50',
                      },
                    }}
                  >
                    <social.icon />
                  </IconButton>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Bottom Bar */}
        <Box
          sx={{
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2024 E-Commerce AI. All rights reserved. Powered by AI innovation.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="/privacy"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="/accessibility"
              color="text.secondary"
              sx={{
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Accessibility
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}