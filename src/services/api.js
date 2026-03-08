import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout to prevent infinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Implement global error handling here (e.g., token expiration logic)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g. dispatching logout
      console.log('Unauthorized accessed denied, clearing token.');
      await AsyncStorage.removeItem('userToken');
    }
    return Promise.reject(error);
  }
);

export default api;
