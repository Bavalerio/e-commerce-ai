'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material/styles';
import { useUIStore } from '@/store/ui-store';
import { createAppTheme } from '@/lib/theme-factory';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setThemePreference: (preference: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: ThemeProviderProps) {
  const {
    theme,
    themePreference,
    systemTheme,
    toggleTheme,
    setTheme,
    setThemePreference,
    updateSystemTheme,
  } = useUIStore();

  // Initialize theme on mount and handle system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize system theme detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      updateSystemTheme(newSystemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Set initial system theme if needed
    const currentSystemTheme = mediaQuery.matches ? 'dark' : 'light';
    if (currentSystemTheme !== systemTheme) {
      updateSystemTheme(currentSystemTheme);
    }

    // Apply initial theme preference if it's system
    if (themePreference === 'system' && theme !== currentSystemTheme) {
      setTheme(currentSystemTheme);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, themePreference, systemTheme, setTheme, updateSystemTheme]);

  // Create the theme based on current mode
  const muiTheme = createAppTheme({ mode: theme });

  const themeContextValue: ThemeContextType = {
    mode: theme,
    toggleTheme,
    setTheme,
    setThemePreference,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <MUIThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}

export default AppThemeProvider;