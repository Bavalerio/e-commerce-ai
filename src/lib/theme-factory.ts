'use client';

import { createTheme, responsiveFontSizes, PaletteMode } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

export interface ThemeConfig {
  mode: PaletteMode;
}

const getDesignTokens = (mode: PaletteMode) => ({
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light theme colors
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#fff',
          },
          secondary: {
            main: '#dc004e',
            light: '#ff5983',
            dark: '#9a0036',
            contrastText: '#fff',
          },
          background: {
            default: '#fafafa',
            paper: '#fff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
          action: {
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
          },
          success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
            contrastText: '#fff',
          },
          warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
            contrastText: '#fff',
          },
          error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
            contrastText: '#fff',
          },
          info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
            contrastText: '#fff',
          },
        }
      : {
          // Dark theme colors
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: '#000',
          },
          secondary: {
            main: '#f48fb1',
            light: '#ffc1cc',
            dark: '#c2185b',
            contrastText: '#000',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
          action: {
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(255, 255, 255, 0.12)',
            disabled: 'rgba(255, 255, 255, 0.3)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
          },
          success: {
            main: '#66bb6a',
            light: '#a5d6a7',
            dark: '#388e3c',
            contrastText: '#000',
          },
          warning: {
            main: '#ffa726',
            light: '#ffcc02',
            dark: '#f57c00',
            contrastText: '#000',
          },
          error: {
            main: '#ef5350',
            light: '#ffcdd2',
            dark: '#c62828',
            contrastText: '#000',
          },
          info: {
            main: '#29b6f6',
            light: '#81d4fa',
            dark: '#0277bd',
            contrastText: '#000',
          },
        }),
  },
  typography: {
    fontFamily: 'var(--font-roboto), "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 300,
      lineHeight: 1.167,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.167,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.235,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.334,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'none' as const,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      textTransform: 'uppercase' as const,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
});

const getComponentOverrides = (mode: PaletteMode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        fontSize: '16px',
        '@media (max-width: 640px)': {
          fontSize: '14px',
        },
        // Smooth theme transitions
        transition: 'color 0.3s ease, background-color 0.3s ease',
      },
      body: {
        backgroundColor: mode === 'light' ? '#fafafa' : '#121212',
        fontFamily: 'var(--font-roboto), "Roboto", "Helvetica", "Arial", sans-serif',
        transition: 'color 0.3s ease, background-color 0.3s ease',
      },
      '*': {
        boxSizing: 'border-box',
      },
      '*::before, *::after': {
        boxSizing: 'border-box',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        minHeight: '44px',
        borderRadius: '8px',
        textTransform: 'none' as const,
        fontWeight: 500,
        transition: 'all 0.3s ease',
        '@media (max-width: 640px)': {
          minHeight: '48px',
          fontSize: '1rem',
        },
      },
      contained: {
        boxShadow: mode === 'light' 
          ? '0 2px 4px rgba(0,0,0,0.1)' 
          : '0 2px 4px rgba(0,0,0,0.3)',
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0 4px 8px rgba(0,0,0,0.15)' 
            : '0 4px 8px rgba(0,0,0,0.4)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        boxShadow: mode === 'light' 
          ? '0 2px 8px rgba(0,0,0,0.1)' 
          : '0 2px 8px rgba(0,0,0,0.4)',
        border: mode === 'light' 
          ? '1px solid rgba(0,0,0,0.05)' 
          : '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          minHeight: '44px',
          transition: 'all 0.3s ease',
          '@media (max-width: 640px)': {
            minHeight: '48px',
          },
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
        color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
        boxShadow: mode === 'light' 
          ? '0 1px 3px rgba(0,0,0,0.1)' 
          : '0 1px 3px rgba(0,0,0,0.4)',
        borderBottom: mode === 'light' 
          ? '1px solid rgba(0,0,0,0.05)' 
          : '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
        borderRight: mode === 'light' 
          ? '1px solid rgba(0,0,0,0.05)' 
          : '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
      },
    },
  },
  MuiBottomNavigation: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
        borderTop: mode === 'light' 
          ? '1px solid rgba(0,0,0,0.05)' 
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: mode === 'light' 
          ? '0 -1px 3px rgba(0,0,0,0.1)' 
          : '0 -1px 3px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none', // Remove Material-UI default overlay
        transition: 'all 0.3s ease',
      },
      elevation1: {
        boxShadow: mode === 'light' 
          ? '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)' 
          : '0px 2px 1px -1px rgba(0,0,0,0.5), 0px 1px 1px 0px rgba(0,0,0,0.3), 0px 1px 3px 0px rgba(0,0,0,0.2)',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.04)' 
            : 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});

export const createAppTheme = (config: ThemeConfig) => {
  const { mode } = config;
  
  const themeOptions = {
    ...getDesignTokens(mode),
    components: getComponentOverrides(mode),
  };

  const baseTheme = createTheme(themeOptions);
  return responsiveFontSizes(baseTheme);
};

// Helper function to get theme based on mode
export const getTheme = (mode: PaletteMode = 'light') => {
  return createAppTheme({ mode });
};

// Default themes for quick access
export const lightTheme = createAppTheme({ mode: 'light' });
export const darkTheme = createAppTheme({ mode: 'dark' });