import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Async thunks
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    toast.success(response.data.message);
    
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Registration failed');
    return rejectWithValue(error.response?.data);
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { email, password, rememberMe } = credentials;
    const response = await api.post('/auth/login', { email, password });
    
    // Store tokens based on Remember Me preference
    if (rememberMe) {
      // Store in localStorage for persistent login
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    } else {
      // Store in sessionStorage for session-only login
      sessionStorage.setItem('accessToken', response.data.data.accessToken);
      sessionStorage.setItem('refreshToken', response.data.data.refreshToken);
      // Clear localStorage in case it had old tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    
    toast.success('Login successful');
    
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Login failed');
    return rejectWithValue(error.response?.data);
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    // Clear from both localStorage and sessionStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    toast.success('Logged out successfully');
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/update-profile', userData);
    toast.success('Profile updated successfully');
    return response.data.data.user;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update profile');
    return rejectWithValue(error.response?.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken'),
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Me
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
