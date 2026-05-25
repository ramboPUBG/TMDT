import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';
import { Book } from '@/types';
import { User } from './authStore';

interface CartItem {
  _id: string; // the cart item id
  bookId: Book; // the actual book object with details
  quantity: number;
  selected?: boolean;
}

interface CartSellerGroup {
  sellerId: Pick<User, '_id' | 'fullName'> | null;
  items: CartItem[];
}

interface CartResponse {
  data?: {
    itemsGroups?: CartSellerGroup[];
  };
  itemsGroups?: CartSellerGroup[];
}

interface CartState {
  itemCount: number;
  items: CartSellerGroup[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (bookId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleItemSelection: (itemId: string, selected: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      itemCount: 0,
      items: [],
      isLoading: false,

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const res = await api.get('/cart') as CartResponse;
          const itemsData: CartSellerGroup[] = res.data?.itemsGroups || res.itemsGroups || [];
          const count = itemsData.reduce((acc, group) => acc + group.items.reduce((sum, item) => sum + item.quantity, 0), 0);
          set({ items: itemsData, itemCount: count, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error("Failed to fetch cart", error);
        }
      },

      addItem: async (bookId: string, quantity = 1) => {
        try {
          await api.post('/cart/items', { bookId, quantity });
          await get().fetchCart();
        } catch (error) {
          console.error("Failed to add to cart", error);
        }
      },

      updateItemQuantity: async (itemId: string, quantity: number) => {
        try {
         // Using local first for UI responsiveness could be done
          await api.patch('/cart/items/' + itemId, { quantity });
          await get().fetchCart();
        } catch (error) {
          console.error("Failed to update cart item", error);
        }
      },

      removeItem: async (itemId: string) => {
        try {
          await api.delete('/cart/items/' + itemId);
          await get().fetchCart();
        } catch (error) {
          console.error("Failed to remove cart item", error);
        }
      },
      
      toggleItemSelection: (itemId: string, selected: boolean) => {
        set((state) => {
           const newItems = state.items.map(group => ({
             ...group,
             items: group.items.map(item => item._id === itemId ? { ...item, selected } : item)
           }));
           return { items: newItems };
        });
      },

      clearCart: () => set({ itemCount: 0, items: [] }),
    }),
    {
      name: 'cart-storage',
      // Only keep some local fallback for non-sensitive parts if needed, but since backend is source of truth:
      // storage: createJSONStorage(() => localStorage),
    }
  )
);
