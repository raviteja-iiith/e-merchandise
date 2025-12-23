import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for token
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check both storages for refresh token
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        
        // Store new token in the same storage as the refresh token
        if (localStorage.getItem('refreshToken')) {
          localStorage.setItem('accessToken', accessToken);
        } else {
          sessionStorage.setItem('accessToken', accessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Clear both storages
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
