import { create } from 'zustand';
import { authService } from '../services';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  token: localStorage.getItem('auth_token') || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authService.login(credentials);
      const { user, token } = data.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ loading: false, error: msg });
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authService.register(userData);
      const { user, token } = data.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ loading: false, error: msg });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout request failed', error);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    try {
      const { data } = await authService.getProfile();
      const user = data.data;
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  },

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin',
  isStore: () => get().user?.role === 'store',
  isConsumer: () => get().user?.role === 'consumer',
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
