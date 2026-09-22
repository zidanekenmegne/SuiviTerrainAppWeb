import styles from '../../styles/pages/NotificationsPage.module.css';

/**
 * Filtres de notifications
 */
const NotificationsFilters = ({ currentFilter, onFilterChange, stats }) => {
  const filters = [
    { key: 'all', label: 'Toutes', count: stats.total },
    { key: 'unread', label: 'Non lues', count: stats.nonLues },
    { key: 'read', label: 'Lues', count: stats.total - stats.nonLues }
  ];

  return (
    <div className={styles.filterBar}>
      {filters.map(f => (
        <button
          key={f.key}
          className={`${styles.filterBtn} ${currentFilter === f.key ? styles.active : ''}`}
          onClick={() => onFilterChange(f.key)}
        >
          {f.label}
          <span className={styles.filterCount}>({f.count})</span>
        </button>
      ))}
    </div>
  );
};

export default NotificationsFilters;