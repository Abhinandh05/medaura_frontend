import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const searchMedicines = createAsyncThunk(
  'medicine/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/medicines/search?name=${query}`);
      return response.data;
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

export const fetchPharmacyMedicines = createAsyncThunk(
  'medicine/fetchPharmacyMedicines',
  async (pharmacyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/medicines/pharmacy/${pharmacyId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch medicines');
    }
  }
);

export const addMedicine = createAsyncThunk(
  'medicine/addMedicine',
  async (medicineData, { rejectWithValue }) => {
    try {
      const response = await api.post('/medicines', medicineData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add medicine');
    }
  }
);

export const updateMedicine = createAsyncThunk(
  'medicine/updateMedicine',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/medicines/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update medicine');
    }
  }
);

export const deleteMedicine = createAsyncThunk(
  'medicine/deleteMedicine',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/medicines/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete medicine');
    }
  }
);

const medicineSlice = createSlice({
  name: 'medicine',
  initialState: {
    searchResults: [],
    pharmacyMedicines: [],
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
      // Search
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
      })
      // Fetch pharmacy medicines
      .addCase(fetchPharmacyMedicines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPharmacyMedicines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacyMedicines = action.payload.data || [];
      })
      .addCase(fetchPharmacyMedicines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add medicine
      .addCase(addMedicine.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMedicine.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacyMedicines.unshift(action.payload.data);
      })
      .addCase(addMedicine.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update medicine
      .addCase(updateMedicine.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const idx = state.pharmacyMedicines.findIndex(m => m._id === updated._id);
        if (idx !== -1) state.pharmacyMedicines[idx] = updated;
      })
      // Delete medicine
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.pharmacyMedicines = state.pharmacyMedicines.filter(
          m => m._id !== action.payload
        );
      });
  },
});

export const { clearSearchResults } = medicineSlice.actions;
export default medicineSlice.reducer;
