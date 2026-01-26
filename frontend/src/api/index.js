import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (email, password, role) => {
    const { data } = await API.post('/auth/login', { email, password, role });
    return data;
  },

  register: async (name, email, password, role) => {
    const { data } = await API.post('/auth/register', { name, email, password, role });
    return data;
  },

  // Items
  getItems: async () => {
    const { data } = await API.get('/items');
    return data;
  },

  createItem: async (item) => {
    const { data } = await API.post('/items', item);
    return data;
  },

  getMyListings: async () => {
    const { data } = await API.get('/items/my-listings');
    return data;
  },

  updateItem: async (id, updates) => {
    const { data } = await API.put(`/items/${id}`, updates);
    return data;
  },

  deleteItem: async (id) => {
    const { data } = await API.delete(`/items/${id}`);
    return data;
  },

  // Requests
  getRequests: async () => {
    const { data } = await API.get('/requests');
    return data;
  },

  createRequest: async (itemId) => {
    const { data } = await API.post('/requests', { itemId });
    return data;
  },

  updateRequest: async (id, status) => {
    const { data } = await API.put(`/requests/${id}`, { status });
    return data;
  },

  // Messages - One-on-one chat
  getConversations: async () => {
    const { data } = await API.get('/messages/conversations');
    return data;
  },

  getMessages: async (userEmail) => {
    const { data } = await API.get(`/messages/${userEmail}`);
    return data;
  },

  sendMessage: async (receiverEmail, text) => {
    const { data } = await API.post('/messages', { receiverEmail, text });
    return data;
  },

  searchUsers: async (email) => {
    const { data } = await API.get('/users/search', { params: { email } });
    return data;
  },

  // Users
  getUser: async (id) => {
    const { data } = await API.get(`/users/${id}`);
    return data;
  },

  updateUser: async (id, updates) => {
    const { data } = await API.put(`/users/${id}`, updates);
    return data;
  },

  // Stats
  getStats: async () => {
    const { data } = await API.get('/stats');
    return data;
  }
  
};

export default api;