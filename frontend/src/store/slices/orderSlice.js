import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const createOrder = createAsyncThunk('orders/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post('/orders', orderData);
    toast.success(response.data.message);
    return response.data.data.order;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Order failed');
    return rejectWithValue(error.response?.data);
  }
});

export const getOrders = createAsyncThunk('orders/getOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders');
    return response.data.data.orders;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const getOrder = createAsyncThunk('orders/getOrder', async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data.order;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      });
  },
});

export default orderSlice.reducer;
