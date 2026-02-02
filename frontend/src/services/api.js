import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";

export const threatService = {
  getLogs: () => axios.get(`${API_BASE}/view-logs`),
  getAgentStatus: () => axios.get(`${API_BASE}/agent-status`)
};