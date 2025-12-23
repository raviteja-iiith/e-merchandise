import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const getNotifications = createAsyncThunk('notifications/getNotifications', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/notifications');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.data.notification;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
