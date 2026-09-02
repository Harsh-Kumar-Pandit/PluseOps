/**
 * Centralized API HTTP Client for PulseOps
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const TOKEN_KEY = 'pulseops_access_token';
const REFRESH_TOKEN_KEY = 'pulseops_refresh_token';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Standard API request wrapper
 */
export async function apiClient(endpoint, options = {}) {
  const { body, headers = {}, method = 'GET', _retry = false, ...customConfig } = options;

  const accessToken = getAccessToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  if (body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return data;
    }

    // 401 Unauthorized handling with token refresh
    if (response.status === 401 && !_retry) {
      const refreshToken = getRefreshToken();

      if (refreshToken && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/refresh') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              config.headers['Authorization'] = `Bearer ${token}`;
              return fetch(url, config).then((res) => res.json());
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const refreshRes = await fetch(
            `${BASE_URL}/api/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            setTokens(refreshData.access_token, refreshData.refresh_token);
            processQueue(null, refreshData.access_token);
            isRefreshing = false;

            // Retry original request with new access token
            config.headers['Authorization'] = `Bearer ${refreshData.access_token}`;
            config._retry = true;
            const retryRes = await fetch(url, config);
            return await retryRes.json();
          } else {
            clearTokens();
            processQueue(new Error('Refresh token expired'), null);
            isRefreshing = false;
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
        } catch (refreshErr) {
          clearTokens();
          processQueue(refreshErr, null);
          isRefreshing = false;
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      } else if (endpoint !== '/api/auth/login') {
        clearTokens();
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    // Format error message from FastAPI / Pydantic schema
    let errorMessage = 'An error occurred';
    if (data.detail) {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err) => `${err.loc?.join('.') || 'field'}: ${err.msg}`).join(', ');
      }
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  } catch (err) {
    if (!err.status) {
      err.message = err.message || 'Network error. Please check backend connection.';
    }
    throw err;
  }
}
