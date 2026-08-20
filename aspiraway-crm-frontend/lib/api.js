import axios from "axios";

// Fallback cleans up leading/trailing spaces or protocol typos
const rawBaseUrl = (
  process.env.NEXT_PUBLIC_CRM_API_URL ||
  "https://aspiraway-crm.onrender.com"
).trim();

// Enforce clean protocol
const formattedUrl = rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
  ? rawBaseUrl
  : `https://${rawBaseUrl.replace(/^https?:?\/*/, "")}`;

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