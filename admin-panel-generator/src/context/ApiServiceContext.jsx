import { createContext, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:4000';
const ApiServiceContext = createContext(null);

// The singleton instance of our ApiService
let apiServiceInstance = null;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken') || null;
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  async request(endpoint, { body, ...customOptions } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      method: customOptions.method || (body ? 'POST' : 'GET'),
      headers: {
        ...headers,
        ...customOptions.headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_HOST}${endpoint}`, config);

    if (response.status === 401 || response.status === 403) {
      // Unauthorized or Forbidden, clear token and trigger logout
      this.setAuthToken(null);
      // Use a custom event to signal logout to the App level
      window.dispatchEvent(new CustomEvent('logout'));
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(errorData.error.message || 'An API error occurred.');
    }

    if (response.status === 204) {
      return null; // No content
    }
    
    return response.json();
  }

  // --- Auth-specific methods ---
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  logout() {
    this.setAuthToken(null);
    window.dispatchEvent(new CustomEvent('logout'));
  }

  // --- Data-fetching methods ---
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }
  
  // Add put, patch, delete as needed...
  async put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }
}

export function ApiServiceProvider({ children }) {
  // Ensure the service is only created once
  const apiService = useMemo(() => {
    if (!apiServiceInstance) {
        apiServiceInstance = new ApiService();
    }
    return apiServiceInstance;
  }, []);

  return (
    <ApiServiceContext.Provider value={apiService}>
      {children}
    </ApiServiceContext.Provider>
  );
}

export const useApiService = () => {
  const context = useContext(ApiServiceContext);
  if (!context) {
    throw new Error('useApiService must be used within an ApiServiceProvider');
  }
  return context;
};