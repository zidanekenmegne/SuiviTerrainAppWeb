import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatsCards from '../components/dashboard/StatsCards';
import RecentVisits from '../components/dashboard/RecentVisits';
import QuickActions from '../components/dashboard/QuickActions';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/pages/DashboardPage.module.css';

/**
 * Page Tableau de bord
 * - Affichage des statistiques
 * - Liste des visites récentes
 * - Actions rapides
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // États
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

  // Chargement des données
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulation de données (à remplacer par l'API)
        const mockStats = {
          total: 12,
          realisees: 7,
          encours: 3,
          attente: 2
        };
        
        const mockVisits = [
          {
            id: 1,
            titre: 'Visite commerciale - Magasin A',
            adresse: 'Centre-ville',
            date: '12 juin 2025 à 08:00',
            statut: 'realise'
          },
          {
            id: 2,
            titre: 'Collecte de commandes - Client B',
            adresse: 'Bonamoussadi',
            date: '12 juin 2025 à 10:30',
            statut: 'attente'
          },
          {
            id: 3,
            titre: 'Suivi des retours - Magasin C',
            adresse: 'Akwa',
            date: '12 juin 2025 à 13:00',
            statut: 'retard'
          },
          {
            id: 4,
            titre: 'Collecte de paiement - Client D',
            adresse: 'Bepanda',
            date: '12 juin 2025 à 09:00',
            statut: 'realise'
          }
        ];

        setStats(mockStats);
        setVisits(mockVisits);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        setError('Impossible de charger les données');
        showToast('Erreur de chargement du tableau de bord', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Gestionnaire pour le bouton "Nouvelle visite"
  const handleNewVisit = () => {
    showToast('Redirection vers la création d\'une visite...');
    // TODO: Naviguer vers /visites/nouvelle
  };

  // Gestionnaire pour le clic sur une visite
  const handleVisitClick = (id) => {
    showToast(`Affichage du détail de la visite ${id}...`);
    // TODO: Naviguer vers /visites/${id}
  };

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

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
          {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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