import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  itemCount: number;
  addItem: () => void;
  removeItem: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      itemCount: 0,
      addItem: () => set((state) => ({ itemCount: state.itemCount + 1 })),
      removeItem: () => set((state) => ({ itemCount: Math.max(0, state.itemCount - 1) })),
      clearCart: () => set({ itemCount: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
