import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // CHARGER LE NOMBRE DE NOTIFICATIONS NON LUES
  // ==========================================================
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifications', {
        params: { unread: true }
      });
      const data = response.data?.data;
      setUnreadCount(data?.non_lues || 0);
    } catch (err) {
      // Silencieux : pas grave si les notifs ne chargent pas
      console.debug('Erreur chargement notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUnreadCount();
    } else {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  // Rafraîchir toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        fetchUnreadCount();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ==========================================================
  // VALEUR
  // ==========================================================
  return (
    <NotificationsContext.Provider value={{
      unreadCount,
      loading,
      refresh: fetchUnreadCount
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;