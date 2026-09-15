import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook pour la page Historique
 * - Charge toutes les visites depuis /visites
 * - Filtre par période (aujourd'hui, semaine, mois)
 * - Recherche multi-mots (titre, adresse, agent)
 */
export const useHistorique = () => {
  const [visites, setVisites] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT DES DONNÉES
  // ==========================================================
  const fetchVisites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/visites', {
        params: { limit: 500 }
      });

      const data = response.data?.data?.visites || [];

      // Transformation vers un format unifié
      const formatted = data.map(v => ({
        id: v.id,
        titre: v.point_vente?.nom
          ? `Visite - ${v.point_vente.nom}`
          : 'Visite commerciale',
        adresse: v.point_vente?.adresse || 'Adresse non renseignée',
        agent: v.agents?.map(a => a.nom).join(', ') || 'Non assigné',
        date: formatDate(v.date_prevue, v.heure_prevue),
        dateRaw: v.date_prevue,
        heureRaw: v.heure_prevue,
        statut: normalizeStatut(v.statut),
        compteRendu: v.compte_rendu,
        pointVente: v.point_vente
      }));

      setVisites(formatted);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      const message = err.response?.data?.message 
        || err.message 
        || 'Impossible de charger l\'historique';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisites();
  }, [fetchVisites]);

  // ==========================================================
  // FONCTIONS UTILITAIRES
  // ==========================================================
  
  function formatDate(dateStr, heureStr) {
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
  }

  function normalizeStatut(statut) {
    const mapping = {
      'realisee': 'realisee',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours',
      'planifiee': 'planifie'
    };
    return mapping[statut] || 'planifie';
  }

  /**
   * Vérifie si une date est aujourd'hui
   */
  function isToday(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    const date = new Date(dateStr);
    return date.toDateString() === today.toDateString();
  }

  /**
   * Vérifie si une date est dans la semaine courante
   */
  function isThisWeek(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    const date = new Date(dateStr);
    
    // Lundi de la semaine courante
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Dimanche de la semaine courante
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return date >= startOfWeek && date <= endOfWeek;
  }

  /**
   * Vérifie si une date est dans le mois courant
   */
  function isThisMonth(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    const date = new Date(dateStr);
    return date.getMonth() === today.getMonth() 
      && date.getFullYear() === today.getFullYear();
  }

  // ==========================================================
  // FILTRAGE
  // ==========================================================
  const filteredVisites = useMemo(() => {
    let result = [...visites];

    // ----- Filtre par période -----
    switch (activeFilter) {
      case 'Aujourd\'hui':
        result = result.filter(v => isToday(v.dateRaw));
        break;
      case 'Cette semaine':
        result = result.filter(v => isThisWeek(v.dateRaw));
        break;
      case 'Ce mois':
        result = result.filter(v => isThisMonth(v.dateRaw));
        break;
      default:
        // 'Toutes' : pas de filtre
        break;
    }

    // ----- Filtre multi-mots -----
    if (searchTerm.trim()) {
      const words = searchTerm
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0);

      result = result.filter(v => {
        const searchText = `${v.titre} ${v.adresse} ${v.agent}`
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

    // ----- Tri par date (plus récent en premier) -----
    result.sort((a, b) => {
      const dateA = new Date(a.dateRaw || 0);
      const dateB = new Date(b.dateRaw || 0);
      return dateB - dateA;
    });

    return result;
  }, [visites, activeFilter, searchTerm]);

  // ==========================================================
  // GESTIONNAIRES
  // ==========================================================
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================
  const stats = useMemo(() => ({
    total: visites.length,
    filtered: filteredVisites.length
  }), [visites, filteredVisites]);

  // ==========================================================
  // RETOUR
  // ==========================================================
  return {
    visites: filteredVisites,
    allVisites: visites,
    stats,
    activeFilter,
    searchTerm,
    loading,
    error,
    handleFilterChange,
    handleSearchChange,
    refresh: fetchVisites
  };
};

export default useHistorique;