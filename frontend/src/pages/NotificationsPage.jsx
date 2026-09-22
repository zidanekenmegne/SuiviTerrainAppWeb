import { useNotificationsList } from '../hooks/useNotificationsList';
import { useNotifications as useNotificationsContext } from '../contexts/NotificationsContext';
import { useToast } from '../contexts/ToastContext';
import NotificationsList from '../components/notifications/NotificationsList';
import NotificationsFilters from '../components/notifications/NotificationsFilters';
import styles from '../styles/pages/NotificationsPage.module.css';

/**
 * Page Notifications
 */
const NotificationsPage = () => {
  const { showToast } = useToast();
  const { refresh: refreshContext } = useNotificationsContext();

  const {
    notifications,
    stats,
    currentFilter,
    loading,
    error,
    setCurrentFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotificationsList();

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleMarkAsRead = async (id) => {
    const result = await markAsRead(id);
    if (result.success) {
      refreshContext();  // Sync le badge
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (stats.nonLues === 0) return;
    
    const result = await markAllAsRead();
    if (result.success) {
      showToast('Toutes les notifications sont lues');
      refreshContext();  // Sync le badge
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteNotification(id);
    if (result.success) {
      showToast('Notification supprimée');
      refreshContext();  // Sync le badge
    } else {
      showToast(result.message, 'error');
    }
  };

  // ==========================================================
  // RENDU : CHARGEMENT
  // ==========================================================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : ERREUR
  // ==========================================================
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
          <strong className="ms-2">Erreur :</strong> {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={refresh}
          >
            <i className="bi bi-arrow-clockwise" aria-hidden="true"></i> Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : SUCCÈS
  // ==========================================================
  return (
    <div className={styles.notificationsContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-bell" aria-hidden="true"></i> Notifications
          {stats.nonLues > 0 && (
            <span className={styles.badgeUnread}>{stats.nonLues}</span>
          )}
        </h1>
        <button 
          className={styles.markAllBtn}
          onClick={handleMarkAllAsRead}
          disabled={stats.nonLues === 0}
        >
          Tout marquer comme lu ({stats.nonLues})
        </button>
      </div>

      {/* Filtres */}
      <NotificationsFilters
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        stats={stats}
      />

      {/* Liste */}
      <NotificationsList
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

    </div>
  );
};

export default NotificationsPage;