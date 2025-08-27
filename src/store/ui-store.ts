import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UIStore, BeforeInstallPromptEvent } from '@/types';

// Helper function to detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper function to apply theme to document
const applyThemeToDocument = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  
  // Update meta theme-color for mobile browsers
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'light' ? '#1976d2' : '#90caf9');
  }
};

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      isMobileMenuOpen: false,
      isCartDrawerOpen: false,
      isSearchOpen: false,
      theme: 'light',
      systemTheme: getSystemTheme(),
      themePreference: 'system', // 'light' | 'dark' | 'system'
      installPrompt: null,
      locale: 'en', // Default locale

      setMobileMenuOpen: (open: boolean) => {
        set({ isMobileMenuOpen: open });
      },

      setCartDrawerOpen: (open: boolean) => {
        set({ isCartDrawerOpen: open });
      },

      setSearchOpen: (open: boolean) => {
        set({ isSearchOpen: open });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        set({ 
          theme: newTheme, 
          themePreference: newTheme 
        });
        
        applyThemeToDocument(newTheme);
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ 
          theme, 
          themePreference: theme 
        });
        applyThemeToDocument(theme);
      },

      setThemePreference: (preference: 'light' | 'dark' | 'system') => {
        const newTheme = preference === 'system' ? get().systemTheme : preference;
        
        set({ 
          themePreference: preference,
          theme: newTheme 
        });
        
        applyThemeToDocument(newTheme);
      },

      updateSystemTheme: (systemTheme: 'light' | 'dark') => {
        const state = get();
        set({ systemTheme });
        
        // If user prefers system theme, update current theme
        if (state.themePreference === 'system') {
          set({ theme: systemTheme });
          applyThemeToDocument(systemTheme);
        }
      },

      setLocale: (locale: string) => {
        set({ locale });
      },

      setInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => {
        set({ installPrompt: prompt });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        themePreference: state.themePreference,
        locale: state.locale,
      }),
    }
  )
);

// Initialize system theme detection on client side
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Listen for system theme changes
  mediaQuery.addEventListener('change', (e) => {
    const systemTheme = e.matches ? 'dark' : 'light';
    useUIStore.getState().updateSystemTheme(systemTheme);
  });

  // Apply initial theme to document
  const initialState = useUIStore.getState();
  applyThemeToDocument(initialState.theme);
}