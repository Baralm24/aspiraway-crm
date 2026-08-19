import axios from 'axios';

export const crmApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CRM_API_URL || 'https://aspiraway-crm.onrender.com',
});

export const mockApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MOCK_API_URL || 'https://aspiraway-mock-backend.onrender.com',
});