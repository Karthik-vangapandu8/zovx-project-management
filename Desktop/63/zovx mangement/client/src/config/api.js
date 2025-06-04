// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    profile: `${API_BASE_URL}/api/auth/profile`,
  },
  projects: `${API_BASE_URL}/api/projects`,
  tasks: `${API_BASE_URL}/api/tasks`,
  team: `${API_BASE_URL}/api/team`,
  dashboard: `${API_BASE_URL}/api/dashboard`,
};

export default API_BASE_URL; 