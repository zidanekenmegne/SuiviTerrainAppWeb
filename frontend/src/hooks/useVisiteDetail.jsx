import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook pour la page Détail de visite
 * - Charge une visite par son ID (GET /visites/:id)
 * - Modifie une visite (PUT /visites/:id)
 * - Supprime une visite (DELETE /visites/:id)
 * - Met à jour le statut (PUT /visites/:id)
 */
export const useVisiteDetail = (id) => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [visite, setVisite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT DE LA VISITE
  // ==========================================================
  const fetchVisite = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/visites/${id}`);
      const data = response.data?.data;

      if (!data) {
        throw new Error('Visite introuvable');
      }

      setVisite({
        id: data.id,
        titre: data.point_vente?.nom
          ? `Visite - ${data.point_vente.nom}`
          : 'Visite commerciale',
        datePrevue: data.date_prevue,
        heurePrevue: data.heure_prevue ? data.heure_prevue.substring(0, 5) : '--:--',
        dateReelle: data.date_reelle,
        heureReelle: data.heure_reelle ? data.heure_reelle.substring(0, 5) : null,
        statut: normalizeStatut(data.statut),
        compteRendu: data.compte_rendu || '',
        pointVente: data.point_vente,
        agents: data.agents || []
      });
    } catch (err) {
      console.error('Erreur chargement visite:', err);
      const message = err.response?.data?.message 
        || err.message 
        || 'Impossible de charger la visite';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVisite();
  }, [fetchVisite]);

  // ==========================================================
  // UTILITAIRES
  // ==========================================================
  function normalizeStatut(statut) {
    const mapping = {
      'realisee': 'realisee',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours',
      'planifiee': 'planifiee'
    };
    return mapping[statut] || 'planifiee';
  }

  // ==========================================================
  // MODIFICATION
  // ==========================================================
  const updateVisite = useCallback(async (data) => {
    try {
      const payload = {
        date_prevue: data.datePrevue,
        heure_prevue: data.heurePrevue,
        point_vente_id: data.pointVenteId,
        statut: data.statut,
        compte_rendu: data.compteRendu
      };

      await apiClient.put(`/visites/${id}`, payload);
      await fetchVisite();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la modification';
      return { success: false, message };
    }
  }, [id, fetchVisite]);

  // ==========================================================
  // CHANGEMENT DE STATUT
  // ==========================================================
  const updateStatut = useCallback(async (newStatut) => {
    try {
      const payload = { statut: newStatut };
      
      // Si on passe à "réalisée", on peut enregistrer la date/heure réelle
      if (newStatut === 'realisee') {
        const now = new Date();
        payload.date_reelle = now.toISOString().split('T')[0];
        payload.heure_reelle = now.toTimeString().substring(0, 5);
      }

      await apiClient.put(`/visites/${id}`, payload);
      await fetchVisite();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du changement de statut';
      return { success: false, message };
    }
  }, [id, fetchVisite]);

  // ==========================================================
  // SUPPRESSION
  // ==========================================================
  const deleteVisite = useCallback(async () => {
    try {
      await apiClient.delete(`/visites/${id}`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression';
      return { success: false, message };
    }
  }, [id]);

  // ==========================================================
  // RETOUR
  // ==========================================================
  return {
    visite,
    loading,
    error,
    updateVisite,
    updateStatut,
    deleteVisite,
    refresh: fetchVisite
  };
};

export default useVisiteDetail;