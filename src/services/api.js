import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const menuService = {
  getAll: () => api.get('/menu'),
  getById: (id) => api.get(`/menu/${id}`),
  getByCategory: (category) => api.get(`/menu/category/${category}`),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export const billingService = {
  create: (data) => api.post('/billing', data),
  getAll: () => api.get('/billing'),
  getById: (id) => api.get(`/billing/${id}`),
};

export const feedbackService = {
  submit: (data) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
  getByCategory: (category) => api.get(`/feedback/category/${category}`),
};

export default api;
