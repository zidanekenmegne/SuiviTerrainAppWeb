import NotificationItem from './NotificationItem';
import styles from '../../styles/pages/NotificationsPage.module.css';

/**
 * Liste des notifications
 */
const NotificationsList = ({ notifications, onMarkAsRead, onDelete }) => {
  if (notifications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className="bi bi-inbox" aria-hidden="true"></i>
        <p>Aucune notification</p>
      </div>
    );
  }

  return (
    <div className={styles.notificationsList}>
      {notifications.map(notif => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationsList;