import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook pour la page Notifications
 * - Charge la liste des notifications
 * - Filtre (Toutes / Non lues / Lues)
 * - Marque une notification comme lue
 * - Marque tout comme lu
 * - Supprime une notification
 */
export const useNotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT
  // ==========================================================
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/notifications');
      const data = response.data?.data;

      setNotifications(data?.notifications || []);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
      const message = err.response?.data?.message 
        || err.message 
        || 'Impossible de charger les notifications';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ==========================================================
  // FILTRAGE
  // ==========================================================
  const filteredNotifications = useMemo(() => {
    if (currentFilter === 'unread') {
      return notifications.filter(n => !n.lu);
    }
    if (currentFilter === 'read') {
      return notifications.filter(n => n.lu);
    }
    return notifications;
  }, [notifications, currentFilter]);

  // ==========================================================
  // STATS
  // ==========================================================
  const stats = useMemo(() => ({
    total: notifications.length,
    nonLues: notifications.filter(n => !n.lu).length,
    filtered: filteredNotifications.length
  }), [notifications, filteredNotifications]);

  // ==========================================================
  // ACTIONS
  // ==========================================================
  const markAsRead = useCallback(async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/lu`);
      // Mise à jour locale immédiate (optimistic update)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lu: true } : n)
      );
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur';
      return { success: false, message };
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put('/notifications/tout-lu');
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur';
      return { success: false, message };
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur';
      return { success: false, message };
    }
  }, []);

  // ==========================================================
  // RETOUR
  // ==========================================================
  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    stats,
    currentFilter,
    loading,
    error,
    setCurrentFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications
  };
};

export default useNotificationsList;