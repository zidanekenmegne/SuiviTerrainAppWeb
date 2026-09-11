import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatsCards from '../components/dashboard/StatsCards';
import RecentVisits from '../components/dashboard/RecentVisits';
import QuickActions from '../components/dashboard/QuickActions';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/client';
import styles from '../styles/pages/DashboardPage.module.css';

/**
 * Page Tableau de bord
 * - Statistiques depuis /api/v1/stats
 * - Visites récentes depuis /api/v1/visites?limit=4
 * - Actions rapides
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [stats, setStats] = useState({
    total: 0,
    realisees: 0,
    encours: 0,
    attente: 0
  });
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date actuelle
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // ==========================================================
  // CHARGEMENT DES DONNÉES (API RÉELLE)
  // ==========================================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Appels API en parallèle pour optimiser
        const [statsRes, visitesRes] = await Promise.all([
          apiClient.get('/stats'),
          apiClient.get('/visites', { params: { limit: 4 } })
        ]);

        // ==========================================================
        // Traitement des statistiques
        // ==========================================================
        const statsData = statsRes.data?.data?.visites || {};
        setStats({
          total: statsData.total || 0,
          realisees: statsData.realisees || 0,
          encours: statsData.en_cours || 0,
          attente: statsData.en_attente || 0
        });

        // ==========================================================
        // Traitement des visites récentes
        // ==========================================================
        const visitesData = visitesRes.data?.data?.visites || [];
        
        // Transformation des données API vers le format attendu par RecentVisits
        const formattedVisits = visitesData.map(v => ({
          id: v.id,
          titre: v.point_vente?.nom 
            ? `Visite - ${v.point_vente.nom}` 
            : 'Visite commerciale',
          adresse: v.point_vente?.adresse || 'Adresse non renseignée',
          date: formatDate(v.date_prevue, v.heure_prevue),
          statut: normalizeStatut(v.statut)
        }));

        setVisits(formattedVisits);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        const message = err.response?.data?.message || 'Impossible de charger les données';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
        // Si l'heure est au format "HH:MM:SS", on garde seulement HH:MM
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
   * API : 'realisee', 'attente', 'retard', 'encours'
   * Affichage : 'realise', 'attente', 'retard', 'encours'
   */
  const normalizeStatut = (statut) => {
    const mapping = {
      'realisee': 'realise',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours'
    };
    return mapping[statut] || 'attente';
  };

  // ==========================================================
  // GESTIONNAIRES
  // ==========================================================
  
  /**
   * Redirection vers la création d'une nouvelle visite
   */
  const handleNewVisit = () => {
    navigate('/visites/nouvelle');
  };

  /**
   * Redirection vers le détail d'une visite
   */
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
          <p className="mt-3 text-muted">Chargement du tableau de bord...</p>
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
    <div className={styles.dashboardContainer}>
      
      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <div className={styles.greeting}>
          <h2>
            Bonjour, <span>{user?.nom || 'Utilisateur'}</span>
          </h2>
          <p>
            <i className="bi bi-calendar3" aria-hidden="true"></i>
            <span className="ms-1">{today}</span>
          </p>
        </div>
        <button 
          className={styles.btnNouvelleVisite}
          onClick={handleNewVisit}
        >
          <i className="bi bi-plus-circle" aria-hidden="true"></i>
          Nouvelle visite
        </button>
      </div>

      {/* Résumé du jour (mobile) */}
      <div className={styles.resumeRow}>
        <span className={styles.resumeTitle}>Résumé du jour</span>
        <span className={styles.resumeDate}>{today}</span>
      </div>

      {/* Cartes statistiques */}
      <StatsCards stats={stats} />

      {/* Titre Visites récentes (PC) */}
      <div className={styles.visitesHeaderPC}>
        <span className={styles.visitesTitle}>Visites récentes</span>
        <a href="/visites" className={styles.voirTout}>
          Voir tout
        </a>
      </div>

      {/* Titre Visites récentes (Mobile) */}
      <div className={styles.visitesHeader}>
        <span className={styles.visitesTitle}>Visites récentes</span>
        <a href="/visites" className={styles.voirTout}>
          Voir tout
        </a>
      </div>

      {/* Liste des visites */}
      <RecentVisits 
        visits={visits} 
        onVisitClick={handleVisitClick}
      />

      {/* Actions rapides */}
      <QuickActions />

    </div>
  );
};

export default DashboardPage;