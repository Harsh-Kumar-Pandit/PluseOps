import { apiClient } from './client';

/**
 * Monitors API module connecting to PulseOps FastAPI backend
 */
export const monitorsApi = {
  /**
   * Retrieve all monitors owned by authenticated user
   * GET /api/monitors
   */
  async getMonitors() {
    return apiClient('/api/monitors', {
      method: 'GET',
    });
  },

  /**
   * Retrieve a single monitor by ID
   * GET /api/monitors/{id}
   */
  async getMonitor(id) {
    return apiClient(`/api/monitors/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new monitor
   * POST /api/monitors
   * Body: MonitorCreate
   */
  async createMonitor(data) {
    return apiClient('/api/monitors', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Update an existing monitor
   * PATCH /api/monitors/{id}
   * Body: MonitorUpdate
   */
  async updateMonitor(id, data) {
    return apiClient(`/api/monitors/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  /**
   * Pause a monitor
   * POST /api/monitors/{id}/pause
   */
  async pauseMonitor(id) {
    return apiClient(`/api/monitors/${id}/pause`, {
      method: 'POST',
    });
  },

  /**
   * Resume a monitor
   * POST /api/monitors/{id}/resume
   */
  async resumeMonitor(id) {
    return apiClient(`/api/monitors/${id}/resume`, {
      method: 'POST',
    });
  },

  /**
   * Delete a monitor
   * DELETE /api/monitors/{id}
   */
  async deleteMonitor(id) {
    return apiClient(`/api/monitors/${id}`, {
      method: 'DELETE',
    });
  },
};
