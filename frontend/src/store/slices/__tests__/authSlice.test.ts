import authReducer, { logout, clearError, register, login, fetchCurrentUser } from '../authSlice';
import { authAPI } from '../../../api/client';

// Mock the API client
jest.mock('../../../api/client', () => ({
  authAPI: {
    register: jest.fn(),
    login: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('reducers', () => {
    it('should handle logout', () => {
      const state = {
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'normal' as const },
        token: 'test-token',
        loading: false,
        error: null,
      };

      const newState = authReducer(state, logout());

      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
      expect(newState.error).toBeNull();
    });

    it('should handle clearError', () => {
      const state = {
        ...initialState,
        error: 'Some error',
      };

      const newState = authReducer(state, clearError());

      expect(newState.error).toBeNull();
    });
  });

  describe('register async thunk', () => {
    it('should handle successful registration', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test', role: 'normal' },
          token: 'test-token',
        },
      };

      (authAPI.register as jest.Mock).mockResolvedValue(mockResponse);

      const action = await register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe('test-token');
      expect(state.error).toBeNull();
    });

    it('should handle registration failure', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              message: 'Email already registered',
            },
          },
        },
      };

      (authAPI.register as jest.Mock).mockRejectedValue(mockError);

      const action = await register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('Email already registered');
    });
  });

  describe('login async thunk', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test', role: 'premium' },
          token: 'test-token',
        },
      };

      (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);

      const action = await login({
        email: 'test@example.com',
        password: 'password123',
      });

      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe('test-token');
      expect(state.error).toBeNull();
    });

    it('should handle login failure', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              message: 'Invalid email or password',
            },
          },
        },
      };

      (authAPI.login as jest.Mock).mockRejectedValue(mockError);

      const action = await login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('Invalid email or password');
    });
  });

  describe('fetchCurrentUser async thunk', () => {
    it('should handle successful user fetch', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test', role: 'normal' },
        },
      };

      (authAPI.getCurrentUser as jest.Mock).mockResolvedValue(mockResponse);

      const action = await fetchCurrentUser();

      const state = authReducer(
        { ...initialState, token: 'existing-token' },
        action
      );

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.error).toBeNull();
    });

    it('should handle user fetch failure and clear token', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              message: 'Token expired',
            },
          },
        },
      };

      (authAPI.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      const action = await fetchCurrentUser();

      const state = authReducer(
        { ...initialState, token: 'expired-token' },
        action
      );

      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.error).toBe('Token expired');
    });
  });

  describe('loading states', () => {
    it('should set loading to true when register is pending', () => {
      const action = { type: register.pending.type };
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set loading to true when login is pending', () => {
      const action = { type: login.pending.type };
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set loading to true when fetchCurrentUser is pending', () => {
      const action = { type: fetchCurrentUser.pending.type };
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });
});
