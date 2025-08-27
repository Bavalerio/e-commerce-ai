'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullHeight?: boolean;
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 40,
  fullHeight = true 
}: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
        ...(fullHeight && {
          minHeight: '50vh',
        }),
      }}
    >
      <CircularProgress 
        size={size} 
        sx={{ color: 'primary.main' }}
      />
      {message && (
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}