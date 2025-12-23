import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const getWishlist = createAsyncThunk('wishlist/getWishlist', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/wishlist');
    return response.data.data.wishlist;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const addToWishlist = createAsyncThunk('wishlist/addToWishlist', async (productId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/wishlist/add/${productId}`);
    toast.success(response.data.message);
    return response.data.data.wishlist;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    return rejectWithValue(error.response?.data);
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', async (productId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    toast.success(response.data.message);
    return response.data.data.wishlist;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // Extract product details from nested structure
        state.products = action.payload?.products?.map(item => item.product) || [];
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        // Extract product details from nested structure
        state.products = action.payload?.products?.map(item => item.product) || [];
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        // Extract product details from nested structure
        state.products = action.payload?.products?.map(item => item.product) || [];
      });
  },
});

export default wishlistSlice.reducer;
