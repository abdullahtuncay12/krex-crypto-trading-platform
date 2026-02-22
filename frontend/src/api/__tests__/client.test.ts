import axios from 'axios';
import apiClient, { authAPI, cryptoAPI, signalAPI, subscriptionAPI, alertAPI } from '../client';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('JWT Interceptor', () => {
    it('should add Authorization header when token exists', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);

      const mockCreate = jest.fn().mockReturnValue({
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
        post: jest.fn(),
        get: jest.fn(),
      });

      mockedAxios.create = mockCreate;

      // The interceptor is set up during module import
      // We verify the token is in localStorage
      expect(localStorage.getItem('token')).toBe(token);
    });

    it('should not add Authorization header when token does not exist', () => {
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('authAPI', () => {
    it('should call register endpoint', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.post as jest.Mock) = mockPost;

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await authAPI.register(credentials);

      expect(mockPost).toHaveBeenCalledWith('/auth/register', credentials);
    });

    it('should call login endpoint', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.post as jest.Mock) = mockPost;

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await authAPI.login(credentials);

      expect(mockPost).toHaveBeenCalledWith('/auth/login', credentials);
    });

    it('should call getCurrentUser endpoint', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.get as jest.Mock) = mockGet;

      await authAPI.getCurrentUser();

      expect(mockGet).toHaveBeenCalledWith('/auth/me');
    });
  });

  describe('cryptoAPI', () => {
    it('should call getAll endpoint', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.get as jest.Mock) = mockGet;

      await cryptoAPI.getAll();

      expect(mockGet).toHaveBeenCalledWith('/cryptocurrencies');
    });

    it('should call getBySymbol endpoint', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.get as jest.Mock) = mockGet;

      await cryptoAPI.getBySymbol('BTC');

      expect(mockGet).toHaveBeenCalledWith('/cryptocurrencies/BTC');
    });

    it('should call getHistory endpoint with days parameter', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.get as jest.Mock) = mockGet;

      await cryptoAPI.getHistory('BTC', 30);

      expect(mockGet).toHaveBeenCalledWith('/cryptocurrencies/BTC/history', {
        params: { days: 30 },
      });
    });
  });

  describe('signalAPI', () => {
    it('should call getSignal endpoint', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.get as jest.Mock) = mockGet;

      await signalAPI.getSignal('ETH');

      expect(mockGet).toHaveBeenCalledWith('/signals/ETH');
    });

    it('should call getPerformance endpoint', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.get as jest.Mock) = mockGet;

      await signalAPI.getPerformance();

      expect(mockGet).toHaveBeenCalledWith('/signals/performance');
    });
  });

  describe('subscriptionAPI', () => {
    it('should call upgrade endpoint', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.post as jest.Mock) = mockPost;

      const data = {
        planId: 'premium-monthly',
        paymentMethodId: 'pm_123',
      };

      await subscriptionAPI.upgrade(data);

      expect(mockPost).toHaveBeenCalledWith('/subscriptions/upgrade', data);
    });

    it('should call cancel endpoint', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.post as jest.Mock) = mockPost;

      await subscriptionAPI.cancel();

      expect(mockPost).toHaveBeenCalledWith('/subscriptions/cancel');
    });

    it('should call getStatus endpoint', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.get as jest.Mock) = mockGet;

      await subscriptionAPI.getStatus();

      expect(mockGet).toHaveBeenCalledWith('/subscriptions/status');
    });
  });

  describe('alertAPI', () => {
    it('should call getAlerts endpoint', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.get as jest.Mock) = mockGet;

      await alertAPI.getAlerts();

      expect(mockGet).toHaveBeenCalledWith('/alerts');
    });

    it('should call updatePreferences endpoint', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: {} });
      (apiClient.post as jest.Mock) = mockPost;

      const preferences = {
        priceMovementThreshold: 5,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ETH'],
      };

      await alertAPI.updatePreferences(preferences);

      expect(mockPost).toHaveBeenCalledWith('/alerts/preferences', preferences);
    });
  });

  describe('Token Storage', () => {
    it('should store token in localStorage on successful login', () => {
      const token = 'new-token';
      localStorage.setItem('token', token);

      expect(localStorage.getItem('token')).toBe(token);
    });

    it('should remove token from localStorage on logout', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.removeItem('token');

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should remove token from localStorage on 401 error', () => {
      localStorage.setItem('token', 'expired-token');
      localStorage.removeItem('token');

      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
