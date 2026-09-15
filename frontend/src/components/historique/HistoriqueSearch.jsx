import styles from '../../styles/pages/HistoriquePage.module.css';

/**
 * Barre de recherche de l'historique
 */
const HistoriqueSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className={styles.searchBar}>
      <div className={styles.searchBox}>
        <i className="bi bi-search" aria-hidden="true"></i>
        <input
          type="text"
          placeholder="Rechercher dans l'historique..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Rechercher dans l'historique"
        />
      </div>
    </div>
  );
};

export default HistoriqueSearch;