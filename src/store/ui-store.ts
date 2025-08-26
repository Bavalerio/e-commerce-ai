import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UIStore, BeforeInstallPromptEvent } from '@/types';

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      isMobileMenuOpen: false,
      isCartDrawerOpen: false,
      isSearchOpen: false,
      theme: 'light',
      installPrompt: null,

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
        
        // Update document class for theme switching
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
        
        set({ theme: newTheme });
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
      }),
    }
  )
);