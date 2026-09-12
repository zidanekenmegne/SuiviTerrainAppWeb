import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook personnalisé pour la gestion des utilisateurs
 * - Chargement depuis /utilisateurs
 * - CRUD (créer, modifier, supprimer)
 * - Recherche multi-mots
 * - Tri par colonnes
 */
export const useUtilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('nom');
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT DES UTILISATEURS
  // ==========================================================
  const fetchUtilisateurs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/utilisateurs');
      const data = response.data?.data || [];

      setUtilisateurs(data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      const message = err.response?.data?.message 
        || err.message 
        || 'Impossible de charger les utilisateurs';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUtilisateurs();
  }, [fetchUtilisateurs]);

  // ==========================================================
  // CRUD
  // ==========================================================
  
  const createUtilisateur = useCallback(async (userData) => {
    try {
      const response = await apiClient.post('/utilisateurs', userData);
      await fetchUtilisateurs();
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la création';
      return { success: false, message };
    }
  }, [fetchUtilisateurs]);

  const updateUtilisateur = useCallback(async (id, userData) => {
    try {
      const response = await apiClient.put(`/utilisateurs/${id}`, userData);
      await fetchUtilisateurs();
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la modification';
      return { success: false, message };
    }
  }, [fetchUtilisateurs]);

  const deleteUtilisateur = useCallback(async (id) => {
    try {
      const response = await apiClient.delete(`/utilisateurs/${id}`);
      await fetchUtilisateurs();
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression';
      return { success: false, message };
    }
  }, [fetchUtilisateurs]);

  const toggleRole = useCallback(async (user) => {
    const newRole = user.role === 'admin' ? 'agent' : 'admin';
    return await updateUtilisateur(user.id, { role: newRole });
  }, [updateUtilisateur]);

  const toggleActif = useCallback(async (user) => {
    return await updateUtilisateur(user.id, { actif: !user.actif });
  }, [updateUtilisateur]);

  // ==========================================================
  // FILTRAGE + TRI
  // ==========================================================
  const filteredAndSorted = useMemo(() => {
    let result = [...utilisateurs];

    // ----- Filtre multi-mots -----
    if (searchTerm.trim()) {
      const words = searchTerm
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0);

      result = result.filter(u => {
        const searchText = `${u.nom || ''} ${u.email || ''} ${u.role || ''}`
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

    // ----- Tri -----
    result.sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'statut') {
        valA = a.actif ? 'actif' : 'inactif';
        valB = b.actif ? 'actif' : 'inactif';
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [utilisateurs, searchTerm, sortColumn, sortAsc]);

  // ==========================================================
  // GESTIONNAIRES
  // ==========================================================
  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  }, [sortColumn, sortAsc]);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // ==========================================================
  // STATISTIQUES
  // ==========================================================
  const stats = useMemo(() => ({
    total: utilisateurs.length,
    filtered: filteredAndSorted.length,
    admins: utilisateurs.filter(u => u.role === 'admin').length,
    agents: utilisateurs.filter(u => u.role === 'agent').length,
    actifs: utilisateurs.filter(u => u.actif).length
  }), [utilisateurs, filteredAndSorted]);

  // ==========================================================
  // RETOUR
  // ==========================================================
  return {
    utilisateurs: filteredAndSorted,
    allUtilisateurs: utilisateurs,
    stats,
    searchTerm,
    sortColumn,
    sortAsc,
    loading,
    error,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
    toggleRole,
    toggleActif,
    handleSearchChange,
    handleSort,
    refresh: fetchUtilisateurs
  };
};

export default useUtilisateurs;