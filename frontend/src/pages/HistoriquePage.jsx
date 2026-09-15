import { useNavigate } from 'react-router-dom';
import { useHistorique } from '../hooks/useHistorique';
import HistoriqueList from '../components/historique/HistoriqueList';
import HistoriqueFilters from '../components/historique/HistoriqueFilters';
import HistoriqueSearch from '../components/historique/HistoriqueSearch';
import styles from '../styles/pages/HistoriquePage.module.css';

/**
 * Page Historique des visites
 * - Liste toutes les visites passées
 * - Filtres par période (Aujourd'hui, Semaine, Mois)
 * - Recherche multi-mots
 */
const HistoriquePage = () => {
  const navigate = useNavigate();

  const {
    visites,
    stats,
    activeFilter,
    searchTerm,
    loading,
    error,
    handleFilterChange,
    handleSearchChange,
    refresh
  } = useHistorique();

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleVisitClick = (id) => {
    navigate(`/visites/${id}`);
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
          <p className="mt-3 text-muted">Chargement de l'historique...</p>
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
    <div className={styles.historiqueContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-clock-history" aria-hidden="true"></i> Historique des visites
          {stats.filtered > 0 && (
            <span className={styles.count}>({stats.filtered})</span>
          )}
        </h1>
      </div>

      {/* Filtres */}
      <HistoriqueFilters 
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Recherche */}
      <HistoriqueSearch
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Liste de l'historique */}
      <HistoriqueList
        visites={visites}
        onVisitClick={handleVisitClick}
      />

      {/* Message si vide */}
      {visites.length === 0 && (
        <div className="text-center py-5">
          <i 
            className="bi bi-inbox" 
            style={{ fontSize: '3rem', color: '#ced4da', display: 'block', marginBottom: '1rem' }}
          ></i>
          <p className="text-muted">
            {stats.total === 0 
              ? 'Aucune visite enregistrée dans l\'historique'
              : 'Aucune visite ne correspond à votre recherche'}
          </p>
        </div>
      )}

    </div>
  );
};

export default HistoriquePage;