import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fg_token');
      localStorage.removeItem('fg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  getSummary: () => api.get('/transactions/summary'),
};

export const loanAPI = {
  getAll: () => api.get('/loans'),
  create: (data) => api.post('/loans', data),
  payEMI: (id) => api.put(`/loans/${id}/pay-emi`),
  delete: (id) => api.delete(`/loans/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRecommendations: () => api.get('/analytics/recommendations'),
  getSavingsPlan: () => api.get('/analytics/savings-plan'),
  getMonthlyTrend: () => api.get('/analytics/monthly-trend'),
  getCibil: () => api.get('/analytics/cibil'),
};

export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put('/alerts/read-all'),
  dismiss: (id) => api.delete(`/alerts/${id}`),
};

export default api;
