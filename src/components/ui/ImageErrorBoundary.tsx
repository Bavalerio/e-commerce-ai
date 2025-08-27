'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert, useTheme } from '@mui/material';
import { Refresh as RefreshIcon, ImageNotSupported as ImageIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ImageErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ImageErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary if resetKeys have changed
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, idx) => 
        key !== prevProps.resetKeys?.[idx]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleRetry = () => {
    // Add a small delay to prevent immediate re-error
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallbackComponent } = this.props;

    if (hasError) {
      // Custom fallback component provided
      if (fallbackComponent) {
        return fallbackComponent;
      }

      // Default error UI
      return (
        <ErrorFallback 
          error={error} 
          onRetry={this.handleRetry}
        />
      );
    }

    return children;
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center',
        minHeight: 200,
        bgcolor: 'grey.50',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'grey.300',
      }}
    >
      <ImageIcon
        sx={{
          fontSize: 48,
          color: 'grey.400',
          mb: 2,
        }}
      />
      
      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom
      >
        Image Loading Error
      </Typography>
      
      <Typography
        variant="body2"
        color="text.disabled"
        sx={{ mb: 2, maxWidth: 300 }}
      >
        There was a problem loading this image. Please try again.
      </Typography>

      {process.env.NODE_ENV === 'development' && error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, maxWidth: 400 }}
        >
          <Typography variant="caption">
            {error.message}
          </Typography>
        </Alert>
      )}
      
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRetry}
        size="small"
        sx={{
          textTransform: 'none',
        }}
      >
        Try Again
      </Button>
    </Box>
  );
};

// Hook for using error boundary programmatically
export const useImageErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError, hasError: !!error };
};

export default ImageErrorBoundary;