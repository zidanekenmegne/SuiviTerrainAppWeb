import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/pages/NotificationsPage.module.css';

/**
 * Item de notification
 */
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  // Icônes par type
  const iconMap = {
    'visite': 'bi bi-calendar-event',
    'rapport': 'bi bi-file-text',
    'alerte': 'bi bi-exclamation-triangle',
    'info': 'bi bi-info-circle',
    'systeme': 'bi bi-gear'
  };

  const icon = iconMap[notification.type] || 'bi bi-bell';

  /**
   * Formate la date relative
   */
  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      const diffH = Math.floor(diffMin / 60);
      const diffJ = Math.floor(diffH / 24);

      if (diffMin < 1) return 'À l\'instant';
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      if (diffH < 24) return `Il y a ${diffH}h`;
      if (diffJ < 7) return `Il y a ${diffJ}j`;
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  /**
   * Clic sur la notification
   */
  const handleClick = () => {
    // Marquer comme lue si non lue
    if (!notification.lu) {
      onMarkAsRead(notification.id);
    }
    // Naviguer vers le lien si présent
    if (notification.lien) {
      navigate(notification.lien);
    }
  };

  return (
    <div
      className={`${styles.notificationItem} ${!notification.lu ? styles.unread : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Icône */}
      <div className={`${styles.notifIcon} ${styles[notification.type]}`}>
        <i className={icon} aria-hidden="true"></i>
      </div>

      {/* Contenu */}
      <div className={styles.notifContent}>
        <div className={styles.notifTitle}>{notification.titre}</div>
        <div className={styles.notifText}>{notification.message}</div>
        <div className={styles.notifDate}>{formatRelativeDate(notification.date_creation)}</div>
      </div>

      {/* Actions */}
      <div className={styles.notifActions}>
        {!notification.lu && (
          <button
            className={styles.btnMarkRead}
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            title="Marquer comme lu"
          >
            <i className="bi bi-check-lg" aria-hidden="true"></i>
          </button>
        )}
        <button
          className={styles.btnDelete}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          title="Supprimer"
        >
          <i className="bi bi-trash" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;