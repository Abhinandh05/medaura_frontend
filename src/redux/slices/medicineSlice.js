import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const searchMedicines = createAsyncThunk(
  'medicine/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/medicines/search?name=${query}`);
      return response.data; // This returns { success, count, data: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to search medicines');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'medicine/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/medicines/categories');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const medicineSlice = createSlice({
  name: 'medicine',
  initialState: {
    searchResults: [],
    categories: ['All', 'Fever', 'Pain Relief', 'Cold', 'Vitamins', 'First Aid', 'Chronic'],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMedicines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMedicines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data || [];
      })
      .addCase(searchMedicines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearSearchResults } = medicineSlice.actions;
export default medicineSlice.reducer;
