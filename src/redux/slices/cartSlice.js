import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const exists = state.items.find(i => i.id === action.payload.id);
      if (!exists) {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    updateItemQty: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        if (qty === 0) {
          state.items = state.items.filter(i => i.id !== id);
        } else {
          item.qty = qty;
        }
      }
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateItemQty } = cartSlice.actions;
export default cartSlice.reducer;
