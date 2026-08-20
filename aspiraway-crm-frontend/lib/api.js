import axios from 'axios';

// Get base host from env
const rawBaseUrl =
  process.env.NEXT_PUBLIC_CRM_API_URL ||
  process.env.NEXT_PUBLIC_MOCK_API_URL ||
  'https://aspiraway-crm.onrender.com';

// Clean trailing slashes and ensure /api prefix is present
const BASE_URL = rawBaseUrl.replace(/\/+$/, '') + '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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