import { apiClient } from './client';

/**
 * Monitors API module connecting to PulseOps FastAPI backend
 */
export const monitorsApi = {
  /**
   * Retrieve all monitors owned by the authenticated user
   * GET /api/monitors
   * Headers: Authorization: Bearer <access_token>
   * Response: Array of MonitorResponse objects
   */
  async getMonitors() {
    return apiClient('/api/monitors', {
      method: 'GET',
    });
  },
};
