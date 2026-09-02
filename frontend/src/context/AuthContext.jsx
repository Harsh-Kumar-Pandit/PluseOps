import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAccessToken());
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    async function initAuth() {
      const storedToken = getAccessToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
        setToken(storedToken);
      } catch (err) {
        console.error('Failed to restore user session:', err.message);
        clearTokens();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  // Listen for unauthorized events emitted by API client
  useEffect(() => {
    const handleUnauthorized = () => {
      clearTokens();
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  /**
   * Login user with email & password
   */
  const login = useCallback(async ({ email, password }) => {
    const tokenRes = await authApi.login({ email, password });
    setTokens(tokenRes.access_token, tokenRes.refresh_token);
    setToken(tokenRes.access_token);

    // Retrieve current user details using new access token
    const userData = await authApi.getCurrentUser();
    setUser(userData);
    return userData;
  }, []);

  /**
   * Register a new user account
   */
  const register = useCallback(async ({ name, email, password }) => {
    const userRes = await authApi.register({ name, email, password });
    return userRes;
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.warn('Backend logout notification error:', err.message);
    } finally {
      clearTokens();
      setUser(null);
      setToken(null);
    }
  }, []);

  const value = {
    user,
    setUser,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
