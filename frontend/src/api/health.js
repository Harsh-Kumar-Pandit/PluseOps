import { apiClient } from './client';

/**
 * Health Checks API module connecting to PulseOps FastAPI backend
 */
export const healthApi = {
  /**
   * Fetch health check history for a monitor
   * GET /api/monitors/{monitorId}/health?limit={limit}&offset={offset}
   */
  async getHealthChecks(monitorId, limit = 10, offset = 0) {
    return apiClient(`/api/monitors/${monitorId}/health?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  },
};
