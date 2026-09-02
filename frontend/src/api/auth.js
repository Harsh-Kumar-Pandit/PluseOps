import { apiClient } from './client';

/**
 * Authentication API module connecting to PulseOps FastAPI backend
 */
export const authApi = {
  /**
   * Register a new user account
   * POST /api/auth/register
   * Body: { name, email, password }
   * Response: { id, name, email }
   */
  async register({ name, email, password }) {
    return apiClient('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
  },

  /**
   * Login user with email & password
   * POST /api/auth/login
   * Body: { email, password }
   * Response: { access_token, refresh_token, token_type }
   */
  async login({ email, password }) {
    return apiClient('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  /**
   * Get current authenticated user profile
   * GET /api/auth/me
   * Headers: Authorization: Bearer <access_token>
   * Response: { id, name, email }
   */
  async getCurrentUser() {
    return apiClient('/api/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh?refresh_token=<token>
   * Response: { access_token, refresh_token, token_type }
   */
  async refresh(refreshToken) {
    return apiClient(`/api/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`, {
      method: 'POST',
    });
  },

  /**
   * Logout user and revoke refresh token
   * POST /api/auth/logout?refresh_token=<token>
   * Response: { message: "Logged out successfully" }
   */
  async logout(refreshToken) {
    if (!refreshToken) return null;
    return apiClient(`/api/auth/logout?refresh_token=${encodeURIComponent(refreshToken)}`, {
      method: 'POST',
    });
  },
};
