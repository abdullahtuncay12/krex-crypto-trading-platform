import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

// Cryptocurrency API endpoints
export const cryptoAPI = {
  getAll: () =>
    apiClient.get('/cryptocurrencies'),
  
  getBySymbol: (symbol: string) =>
    apiClient.get(`/cryptocurrencies/${symbol}`),
  
  getHistory: (symbol: string, days?: number) =>
    apiClient.get(`/cryptocurrencies/${symbol}/history`, { params: { days } }),
};

// Trading Signal API endpoints
export const signalAPI = {
  getSignal: (symbol: string) =>
    apiClient.get(`/signals/${symbol}`),
  
  getPerformance: () =>
    apiClient.get('/signals/performance'),
};

// Subscription API endpoints
export const subscriptionAPI = {
  upgrade: (data: { planId: string; paymentMethodId: string }) =>
    apiClient.post('/subscriptions/upgrade', data),
  
  cancel: () =>
    apiClient.post('/subscriptions/cancel'),
  
  getStatus: () =>
    apiClient.get('/subscriptions/status'),
};

// Alert API endpoints (Premium only)
export const alertAPI = {
  getAlerts: () =>
    apiClient.get('/alerts'),
  
  getPreferences: () =>
    apiClient.get('/alerts/preferences'),
  
  updatePreferences: (data: {
    priceMovementThreshold: number;
    enablePumpAlerts: boolean;
    cryptocurrencies: string[];
  }) =>
    apiClient.post('/alerts/preferences', data),
  
  markAsRead: (alertId: string) =>
    apiClient.patch(`/alerts/${alertId}/read`),
};

export default apiClient;


// Bot Trading API endpoints (Premium only)
export const botAPI = {
  // Configuration endpoints
  getSupportedCryptocurrencies: () =>
    apiClient.get('/bot/supported-cryptocurrencies'),
  
  getTradingPeriods: () =>
    apiClient.get('/bot/trading-periods'),
  
  getLimits: () =>
    apiClient.get('/bot/limits'),
  
  // Investment endpoints
  createInvestment: (data: {
    cryptocurrency: string;
    principalAmount: number;
    tradingPeriodHours: number;
    riskAcknowledgedAt: Date;
  }) =>
    apiClient.post('/bot/investments', data),
  
  getInvestments: (status?: 'active' | 'completed' | 'cancelled') =>
    apiClient.get('/bot/investments', { params: { status } }),
  
  getInvestmentById: (id: string) =>
    apiClient.get(`/bot/investments/${id}`),
  
  cancelInvestment: (id: string, reason?: string) =>
    apiClient.post(`/bot/investments/${id}/cancel`, { reason }),
  
  getValueHistory: (id: string) =>
    apiClient.get(`/bot/investments/${id}/value-history`),
  
  // Portfolio endpoint
  getPortfolioSummary: () =>
    apiClient.get('/bot/portfolio'),
};
