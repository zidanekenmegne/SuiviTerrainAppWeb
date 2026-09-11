import styles from '../../styles/pages/VisitesPage.module.css';

/**
 * Composant des filtres de statut
 * - Toutes, En cours, Réalisées, En attente, En retard
 */
const VisiteFilters = ({ activeFilter, onFilterChange }) => {
  const filters = ['Toutes', 'En cours', 'Realisees', 'En attente', 'En retard'];

  return (
    <div className={styles.filterGroup}>
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

export default VisiteFilters;