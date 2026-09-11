import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VisitesList from '../components/visites/VisitesList';
import VisiteFilters from '../components/visites/VisiteFilters';
import VisiteSearch from '../components/visites/VisiteSearch';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/client';
import styles from '../styles/pages/VisitesPage.module.css';

/**
 * Page Liste des visites
 * - Consomme l'API réelle (/visites)
 * - Filtrage par statut et recherche multi-mots
 * - Bouton pour ajouter une nouvelle visite
 */
const VisitesPage = () => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [visites, setVisites] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // ==========================================================
  // CHARGEMENT DES DONNÉES (API RÉELLE)
  // ==========================================================
  useEffect(() => {
    const fetchVisites = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/visites', {
          params: { limit: 100 }
        });

        const visitesData = response.data?.data?.visites || [];

        // Transformation des données API vers le format attendu par les composants
        const formattedVisites = visitesData.map(v => ({
          id: v.id,
          titre: v.point_vente?.nom
            ? `Visite - ${v.point_vente.nom}`
            : 'Visite commerciale',
          adresse: v.point_vente?.adresse || 'Adresse non renseignée',
          date: formatDate(v.date_prevue, v.heure_prevue),
          dateRaw: v.date_prevue,
          heureRaw: v.heure_prevue,
          statut: normalizeStatut(v.statut),
          compte_rendu: v.compte_rendu,
          pointVente: v.point_vente
        }));

        setVisites(formattedVisites);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement visites:', err);
        const message = err.response?.data?.message || 'Impossible de charger les visites';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchVisites();
  }, []);

  // ==========================================================
  // FONCTIONS UTILITAIRES
  // ==========================================================
  
  /**
   * Formate la date et l'heure pour l'affichage
   */
  const formatDate = (dateStr, heureStr) => {
    if (!dateStr) return 'Date non renseignée';

    try {
      const date = new Date(dateStr);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const dateFormatted = date.toLocaleDateString('fr-FR', options);

      if (heureStr) {
        const heure = heureStr.substring(0, 5);
        return `${dateFormatted} à ${heure}`;
      }

      return dateFormatted;
    } catch {
      return dateStr;
    }
  };

  /**
   * Normalise le statut pour l'affichage
   */
  const normalizeStatut = (statut) => {
    const mapping = {
      'realisee': 'realisee',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours',
      'planifiee': 'attente'
    };
    return mapping[statut] || 'attente';
  };

  // ==========================================================
  // FILTRAGE (mémoïsé pour la performance)
  // ==========================================================
  const filteredVisites = useMemo(() => {
    let result = visites;

    // ----- Filtre par statut -----
    if (activeFilter !== 'Toutes') {
      const statutMap = {
        'En cours': 'encours',
        'Realisees': 'realisee',
        'En attente': 'attente',
        'En retard': 'retard'
      };
      const statutValue = statutMap[activeFilter];
      result = result.filter(v => v.statut === statutValue);
    }

    // ----- Filtre multi-mots -----
    if (searchTerm.trim()) {
      const words = searchTerm
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0);

      result = result.filter(v => {
        const searchText = `${v.titre || ''} ${v.adresse || ''}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return words.every(word => {
          const normalizedWord = word
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          return searchText.includes(normalizedWord);
        });
      });
    }

    return result;
  }, [visites, activeFilter, searchTerm]);

  // ==========================================================
  // GESTIONNAIRES
  // ==========================================================
  const handleNewVisit = useCallback(() => {
    navigate('/visites/nouvelle');
  }, [navigate]);

  const handleVisitClick = useCallback((id) => {
    navigate(`/visites/${id}`);
  }, [navigate]);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

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
          <p className="mt-3 text-muted">Chargement des visites...</p>
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
            onClick={() => window.location.reload()}
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
    <div className={styles.visitesContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-list-ul" aria-hidden="true"></i> Mes visites
          {filteredVisites.length > 0 && (
            <span className={styles.visitesCount}>({filteredVisites.length})</span>
          )}
        </h1>
        <button className={styles.btnAjouter} onClick={handleNewVisit}>
          <i className="bi bi-plus-circle" aria-hidden="true"></i> Nouvelle visite
        </button>
      </div>

      {/* Filtres + Recherche */}
      <div className={styles.filterSearchRow}>
        <VisiteFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        <VisiteSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Liste des visites */}
      <VisitesList
        visites={filteredVisites}
        onVisitClick={handleVisitClick}
      />

      {/* Message si aucune visite */}
      {filteredVisites.length === 0 && (
        <div className="text-center py-5">
          <i
            className="bi bi-inbox"
            style={{ fontSize: '3rem', color: '#ced4da', display: 'block', marginBottom: '1rem' }}
          ></i>
          <p className="text-muted">
            {visites.length === 0
              ? 'Aucune visite enregistrée'
              : 'Aucune visite ne correspond à votre recherche'}
          </p>
          <button className="btn btn-danger" onClick={handleNewVisit}>
            <i className="bi bi-plus-circle" aria-hidden="true"></i> Créer une visite
          </button>
        </div>
      )}

    </div>
  );
};

export default VisitesPage;