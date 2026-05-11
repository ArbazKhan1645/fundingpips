import type { User } from '@/types';
import { mockUser } from '@/mock/dashboard';

interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  title: string;
  dob: string;
  country: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay(1200);
    if (payload.email && payload.password) {
      const token = 'mock_jwt_token_' + Date.now();
      return { user: mockUser, token, refreshToken: 'mock_refresh_token' };
    }
    throw new Error('Invalid credentials');
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay(1500);
    const user: User = {
      ...mockUser,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      country: payload.country,
    };
    const token = 'mock_jwt_token_' + Date.now();
    return { user, token, refreshToken: 'mock_refresh_token' };
  },

  async logout(): Promise<void> {
    await delay(300);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fp_token');
    }
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    await delay(500);
    return { token: 'new_mock_jwt_token_' + Date.now() };
  },

  async getProfile(): Promise<User> {
    await delay(500);
    return mockUser;
  },

  async googleLogin(): Promise<AuthResponse> {
    await delay(1000);
    const token = 'mock_google_jwt_token_' + Date.now();
    return { user: mockUser, token, refreshToken: 'mock_refresh_token' };
  },
};
