import { apiClient } from './client';

/**
 * Notifications API module connecting to PulseOps FastAPI backend
 */
export const notificationsApi = {
  /**
   * Get notifications for authenticated user
   * GET /api/notifications?limit=50&offset=0&unread_only=false
   */
  async getNotifications(options = {}) {
    const { limit = 50, offset = 0, unread_only = false } = options;
    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      unread_only: String(unread_only),
    });

    return apiClient(`/api/notifications?${query.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Mark a single notification as read
   * POST /api/notifications/{id}/read
   */
  async markAsRead(notificationId) {
    return apiClient(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  /**
   * Mark all notifications as read
   * POST /api/notifications/read-all
   */
  async markAllAsRead() {
    return apiClient('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  /**
   * Get current notification preferences
   * GET /api/notifications/preferences
   */
  async getPreferences() {
    return apiClient('/api/notifications/preferences', {
      method: 'GET',
    });
  },

  /**
   * Update notification preferences
   * PATCH /api/notifications/preferences
   */
  async updatePreferences(preferences) {
    return apiClient('/api/notifications/preferences', {
      method: 'PATCH',
      body: preferences,
    });
  },

  /**
   * Delete a single notification
   * DELETE /api/notifications/{id}
   */
  async deleteNotification(notificationId) {
    return apiClient(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Clear/delete all notifications for authenticated user
   * DELETE /api/notifications/clear-all
   */
  async clearAll() {
    return apiClient('/api/notifications/clear-all', {
      method: 'DELETE',
    });
  },
};
