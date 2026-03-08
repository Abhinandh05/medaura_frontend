import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Dashboard stats
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/stats');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// All users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (search = '', { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/users?search=${search}&limit=100`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
    }
  }
);

// All pharmacies
export const fetchAllPharmacies = createAsyncThunk(
  'admin/fetchAllPharmacies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/pharmacies?limit=100');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pharmacies');
    }
  }
);

// Delete pharmacy (admin)
export const deletePharmacyAdmin = createAsyncThunk(
  'admin/deletePharmacy',
  async (pharmacyId, { rejectWithValue }) => {
    try {
      await api.delete(`/pharmacies/${pharmacyId}`);
      return pharmacyId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete pharmacy');
    }
  }
);

// Create pharmacy with owner (admin)
export const createPharmacyAdmin = createAsyncThunk(
  'admin/createPharmacy',
  async (pharmacyData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/create-pharmacy', pharmacyData);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create pharmacy');
    }
  }
);

// Analytics
export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/analytics');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: {
      totalUsers: 0,
      totalPharmacies: 0,
      totalOrders: 0,
      totalMedicines: 0,
    },
    users: [],
    pharmacies: [],
    analytics: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.stats.totalUsers = Math.max(0, state.stats.totalUsers - 1);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Pharmacies
      .addCase(fetchAllPharmacies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPharmacies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacies = action.payload.data || [];
      })
      .addCase(fetchAllPharmacies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create pharmacy
      .addCase(createPharmacyAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPharmacyAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacies.unshift(action.payload);
        state.stats.totalPharmacies += 1;
      })
      .addCase(createPharmacyAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete pharmacy
      .addCase(deletePharmacyAdmin.fulfilled, (state, action) => {
        state.pharmacies = state.pharmacies.filter((p) => p._id !== action.payload);
        state.stats.totalPharmacies = Math.max(0, state.stats.totalPharmacies - 1);
      })
      .addCase(deletePharmacyAdmin.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
