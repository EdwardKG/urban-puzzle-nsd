import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Data service
export const dataService = {
  getAll: async () => {
    const response = await api.get('/data');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/data/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/data', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/data/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/data/${id}`);
    return response.data;
  }
};

// Python service
export const pythonService = {
  checkHealth: async () => {
    const response = await api.get('/python/health');
    return response.data;
  },

  analyze: async (data) => {
    const response = await api.post('/python/analyze', { data });
    return response.data;
  },

  process: async (input) => {
    const response = await api.post('/python/process', { input });
    return response.data;
  }
};

export default api;
