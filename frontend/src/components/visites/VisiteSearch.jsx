import styles from '../../styles/pages/VisitesPage.module.css';

/**
 * Barre de recherche des visites
 */
const VisiteSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className={styles.searchBox}>
      <i className="bi bi-search" aria-hidden="true"></i>
      <input
        type="text"
        placeholder="Rechercher une visite..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Rechercher une visite"
      />
    </div>
  );
};

export default VisiteSearch;