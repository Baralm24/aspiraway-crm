import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_MOCK_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://aspiraway-mock-backend.onrender.com';

// Ensure 'const' is present here
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;