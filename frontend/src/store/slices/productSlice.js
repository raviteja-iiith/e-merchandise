import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
  }
});

export const getProducts = createAsyncThunk('products/getProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const getProduct = createAsyncThunk('products/getProduct', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const searchProducts = createAsyncThunk('products/searchProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/search', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    products: [],
    currentProduct: null,
    total: 0,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data?.products || [];
        state.pagination = action.payload.pagination || null;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.products;
        state.total = action.payload.total;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.items = action.payload.data.products;
        state.total = action.payload.total;
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
