import axios from 'axios';

const api = axios.create({
  // Use 127.0.0.1 instead of localhost to avoid IPv6 resolution issues
  baseURL: 'http://127.0.0.1:8000',
});

export const threatService = {
  getLogs: () => api.get('/view-logs'),
  getAudit: () => api.get('/view-audit'),
  getAgentStatus: () => api.get('/agent-status'),
};

export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
};