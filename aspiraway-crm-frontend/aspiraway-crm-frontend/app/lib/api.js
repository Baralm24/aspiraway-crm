import axios from "axios";

// Automatically fall back to Render if ENV is missing
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://aspiraway-crm.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
});

// Auto-attach JWT Token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;