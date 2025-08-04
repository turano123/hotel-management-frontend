// 📁 src/api/axiosInstance.js
import axios from 'axios';

// ✅ API için temel ayar – .env'den alınan URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api',  // Örn: https://backend.com/api
  withCredentials: true, // Token ile birlikte cookie gönderimi için
});

// ✅ İstek öncesi token ekleyen interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
