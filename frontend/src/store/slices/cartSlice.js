import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/cart');
    return response.data.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const updateCartItemQuantity = createAsyncThunk('cart/updateCartItemQuantity', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data.data.cart;
  } catch (error) {
    toast.error('Failed to update cart');
    return rejectWithValue(error.response?.data);
  }
});

export const getCart = createAsyncThunk('cart/getCart', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/cart');
    return response.data.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (item, { rejectWithValue }) => {
  try {
    const response = await api.post('/cart/add', item);
    toast.success(response.data.message);
    return response.data.data.cart;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add to cart');
    return rejectWithValue(error.response?.data);
  }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data.data.cart;
  } catch (error) {
    toast.error('Failed to update cart');
    return rejectWithValue(error.response?.data);
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (itemId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    toast.success('Item removed from cart');
    return response.data.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart');
    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    totals: {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0,
    },
    coupon: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems || 0;
          state.totalPrice = action.payload.totalPrice || 0;
          state.coupon = action.payload.coupon;
          // Calculate totals
          const subtotal = action.payload.totalPrice || 0;
          const shipping = subtotal > 50 ? 0 : 5;
          const tax = subtotal * 0.08;
          const discount = 0;
          const total = subtotal + shipping + tax - discount;
          state.totals = { subtotal, shipping, tax, discount, total };
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items;
          state.totalItems = action.payload.totalItems;
          state.totalPrice = action.payload.totalPrice;
          // Recalculate totals
          const subtotal = action.payload.totalPrice || 0;
          const shipping = subtotal > 50 ? 0 : 5;
          const tax = subtotal * 0.08;
          const discount = 0;
          const total = subtotal + shipping + tax - discount;
          state.totals = { subtotal, shipping, tax, discount, total };
        }
      })
      .addCase(getCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems || 0;
          state.totalPrice = action.payload.totalPrice || 0;
          state.coupon = action.payload.coupon;
        }
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items;
          state.totalItems = action.payload.totalItems;
          state.totalPrice = action.payload.totalPrice;
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items;
          state.totalItems = action.payload.totalItems;
          state.totalPrice = action.payload.totalPrice;
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items;
          state.totalItems = action.payload.totalItems;
          state.totalPrice = action.payload.totalPrice;
          // Recalculate totals
          const subtotal = action.payload.totalPrice || 0;
          const shipping = subtotal > 50 ? 0 : 5;
          const tax = subtotal * 0.08;
          const discount = 0;
          const total = subtotal + shipping + tax - discount;
          state.totals = { subtotal, shipping, tax, discount, total };
        }
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.coupon = null;
        state.totals = { subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0 };
      });
  },
});

export default cartSlice.reducer;
