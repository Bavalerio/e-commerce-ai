'use client';

import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const router = useRouter();

  const handleClick = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  const allItems = showHome 
    ? [{ label: 'Home', href: '/' }, ...items]
    : items;

  return (
    <Box sx={{ py: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
          },
        }}
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = item.href === '/';

          if (isLast) {
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {isHome && <HomeIcon fontSize="small" />}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              underline="hover"
              color="text.secondary"
              onClick={() => handleClick(item.href)}
              sx={{
                cursor: item.href ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.875rem',
                '&:hover': {
                  color: item.href ? 'primary.main' : 'text.secondary',
                },
              }}
            >
              {isHome && <HomeIcon fontSize="small" />}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}