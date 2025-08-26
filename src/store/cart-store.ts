import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartStore, CartItem } from '@/types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,

      addItem: async (productId: string, variantId?: string, quantity = 1) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId,
              variantId,
              quantity,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to add item to cart');
          }

          const { data } = await response.json();
          
          // Update local state
          const currentItems = get().items;
          const existingItemIndex = currentItems.findIndex(
            item => item.productId === productId && item.variantId === variantId
          );

          let newItems: CartItem[];
          if (existingItemIndex >= 0) {
            newItems = currentItems.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...currentItems, data];
          }

          const newTotal = newItems.reduce(
            (sum, item) => sum + (Number(item.price) * item.quantity),
            0
          );
          const newItemCount = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error adding item to cart:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        set({ isLoading: true });

        try {
          if (quantity <= 0) {
            await get().removeItem(itemId);
            return;
          }

          const response = await fetch('/api/cart/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              itemId,
              quantity,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update cart item');
          }

          const currentItems = get().items;
          const newItems = currentItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          );

          const newTotal = newItems.reduce(
            (sum, item) => sum + (Number(item.price) * item.quantity),
            0
          );
          const newItemCount = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error updating cart item:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (itemId: string) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`/api/cart/remove/${itemId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to remove item from cart');
          }

          const currentItems = get().items;
          const newItems = currentItems.filter(item => item.id !== itemId);

          const newTotal = newItems.reduce(
            (sum, item) => sum + (Number(item.price) * item.quantity),
            0
          );
          const newItemCount = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          set({
            items: newItems,
            total: newTotal,
            itemCount: newItemCount,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error removing item from cart:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/cart/clear', {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to clear cart');
          }

          set({
            items: [],
            total: 0,
            itemCount: 0,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error clearing cart:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      fetchCart: async () => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/cart');
          
          if (!response.ok) {
            throw new Error('Failed to fetch cart');
          }

          const { data } = await response.json();
          
          const total = data.items?.reduce(
            (sum: number, item: CartItem) => sum + (Number(item.price) * item.quantity),
            0
          ) || 0;
          
          const itemCount = data.items?.reduce(
            (sum: number, item: CartItem) => sum + item.quantity,
            0
          ) || 0;

          set({
            items: data.items || [],
            total,
            itemCount,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error fetching cart:', error);
          set({ 
            items: [],
            total: 0,
            itemCount: 0,
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);