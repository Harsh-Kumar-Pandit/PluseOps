import { apiClient } from './client';

/**
 * Incidents API module connecting to PulseOps FastAPI backend
 */
export const incidentsApi = {
  /**
   * Retrieve all incidents for monitors owned by authenticated user
   * GET /api/incidents/
   */
  async getIncidents() {
    return apiClient('/api/incidents/', {
      method: 'GET',
    });
  },

  /**
   * Retrieve a single incident by ID
   * GET /api/incidents/{id}
   */
  async getIncident(id) {
    return apiClient(`/api/incidents/${id}`, {
      method: 'GET',
    });
  },
};
