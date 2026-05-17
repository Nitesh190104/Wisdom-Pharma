import { create } from 'zustand';
import { cartService } from '../services';

const useCartStore = create((set) => ({
  cart: { items: [], item_count: 0, subtotal: 0, gst_total: 0, total: 0 },
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await cartService.get();
      set({ cart: data.data, loading: false });
    } catch { set({ loading: false }); }
  },

  addItem: async (medicineId, quantity) => {
    const { data } = await cartService.addItem({ medicine_id: medicineId, quantity });
    set({ cart: data.data });
    return data;
  },

  updateItem: async (medicineId, quantity) => {
    const { data } = await cartService.updateItem({ medicine_id: medicineId, quantity });
    set({ cart: data.data });
  },

  removeItem: async (medicineId) => {
    const { data } = await cartService.removeItem(medicineId);
    set({ cart: data.data });
  },

  clearCart: async () => {
    try {
      const { data } = await cartService.clear();
      set({ cart: data.data });
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  },
}));

export default useCartStore;
