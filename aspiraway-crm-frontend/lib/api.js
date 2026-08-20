import axios from "axios";

// Grab raw base URL or fallback to production
const rawBaseUrl =
  process.env.NEXT_PUBLIC_CRM_API_URL ||
  process.env.NEXT_PUBLIC_MOCK_API_URL ||
  "https://aspiraway-crm.onrender.com";

// Ensure protocol exists (prevents Next.js relative routing errors)
const formattedUrl = rawBaseUrl.startsWith("http")
  ? rawBaseUrl
  : `https://${rawBaseUrl}`;

// Strip trailing slashes and ensure exactly ONE '/api' at the end
const cleanUrl = formattedUrl.replace(/\/+$/, "");
const BASE_URL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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