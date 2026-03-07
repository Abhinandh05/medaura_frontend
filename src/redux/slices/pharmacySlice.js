import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNearbyPharmacies = createAsyncThunk(
  'pharmacy/fetchNearby',
  async ({ lat, lng, maxDistance }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pharmacies/nearby?lat=${lat}&lng=${lng}&distance=${maxDistance}`);
      return response.data; // This will return { success, count, data: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch nearby pharmacies');
    }
  }
);

export const fetchPharmacyDetails = createAsyncThunk(
  'pharmacy/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pharmacies/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch pharmacy details');
    }
  }
);

export const fetchMyPharmacy = createAsyncThunk(
  'pharmacy/fetchMyPharmacy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/pharmacies/my-pharmacy');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch my pharmacy');
    }
  }
);

export const updateMyPharmacy = createAsyncThunk(
  'pharmacy/updateMyPharmacy',
  async ({ id, pharmacyData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pharmacies/${id}`, pharmacyData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update pharmacy');
    }
  }
);

export const fetchPharmacyStats = createAsyncThunk(
  'pharmacy/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/pharmacies/stats');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState: {
    nearbyPharmacies: [],
    selectedPharmacy: null,
    myPharmacy: null,
    stats: {
      totalMedicines: 0,
      lowStock: 0,
      dailyViews: 0,
      activity: []
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedPharmacy: (state) => {
      state.selectedPharmacy = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyPharmacies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyPharmacies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyPharmacies = action.payload.data || [];
      })
      .addCase(fetchNearbyPharmacies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPharmacyDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPharmacyDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPharmacy = action.payload;
      })
      .addCase(fetchPharmacyDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyPharmacy.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyPharmacy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myPharmacy = action.payload.data;
      })
      .addCase(fetchMyPharmacy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateMyPharmacy.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMyPharmacy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myPharmacy = action.payload.data;
      })
      .addCase(updateMyPharmacy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPharmacyStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearSelectedPharmacy } = pharmacySlice.actions;
export default pharmacySlice.reducer;
