import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/myorders');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch user orders');
    }
  }
);

export const fetchPharmacyOrders = createAsyncThunk(
  'orders/fetchPharmacyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/pharmacy');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch pharmacy orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to create order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update order status');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    userOrders: [],
    pharmacyOrders: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userOrders = action.payload.data;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Pharmacy Orders
      .addCase(fetchPharmacyOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchPharmacyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacyOrders = action.payload.data;
      })
      .addCase(fetchPharmacyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Order Status locally (optimistic or after success)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.data;
        const index = state.pharmacyOrders.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          state.pharmacyOrders[index] = updatedOrder;
        }
      })
      // Create Order
      .addCase(createOrder.fulfilled, (state, action) => {
        state.userOrders.unshift(action.payload.data);
      });
  },
});

export default orderSlice.reducer;
