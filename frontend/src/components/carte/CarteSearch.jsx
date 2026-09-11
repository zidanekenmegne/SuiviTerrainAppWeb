import styles from '../../styles/pages/CartePage.module.css';

/**
 * Barre de recherche pour la carte
 * - Version PC : affichée dans l'en-tête
 * - Version Mobile : affichée en dessous du bandeau
 */
const CarteSearch = ({ searchTerm, onSearchChange, variant = 'pc' }) => {
  const className = variant === 'pc' ? styles.searchBoxPC : styles.searchBoxMobile;

  return (
    <div className={className}>
      <i className="bi bi-search" aria-hidden="true"></i>
      <input
        type="text"
        placeholder="Rechercher un point de vente..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Rechercher un point de vente"
      />
    </div>
  );
};

export default CarteSearch;