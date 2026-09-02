import { apiClient } from './client';

/**
 * Health Checks API module connecting to PulseOps FastAPI backend
 */
export const healthApi = {
  /**
   * Fetch health check history for a monitor
   * GET /api/monitors/{monitorId}/health?limit={limit}&offset={offset}&hours={hours}
   */
  async getHealthChecks(monitorId, limit = 50, offset = 0, hours = null) {
    let url = `/api/monitors/${monitorId}/health?limit=${limit}&offset=${offset}`;
    if (hours) {
      url += `&hours=${hours}`;
    }
    return apiClient(url, {
      method: 'GET',
    });
  },

  /**
   * Fetch aggregate statistics for a monitor over period_days
   * GET /api/monitors/{monitorId}/stats?days={days}
   */
  async getStats(monitorId, days = 30) {
    return apiClient(`/api/monitors/${monitorId}/stats?days=${days}`, {
      method: 'GET',
    });
  },
};
