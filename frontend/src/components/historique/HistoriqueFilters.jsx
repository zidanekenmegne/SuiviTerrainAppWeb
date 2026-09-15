import styles from '../../styles/pages/HistoriquePage.module.css';

/**
 * Filtres par période
 */
const HistoriqueFilters = ({ activeFilter, onFilterChange }) => {
  const filters = ['Toutes', 'Aujourd\'hui', 'Cette semaine', 'Ce mois'];

  return (
    <div className={styles.filterBar}>
      {filters.map((filter) => (
        <button
          key={filter}
          className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default HistoriqueFilters;