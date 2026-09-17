import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook pour la page Nouvelle visite
 * - Charge la liste des points de vente
 * - Charge la liste des agents
 * - Crée une nouvelle visite (POST /visites)
 */
export const useNouvelleVisite = () => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [pointsVente, setPointsVente] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT DES DONNÉES
  // ==========================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pointsRes, agentsRes] = await Promise.allSettled([
        apiClient.get('/points', { params: { limit: 500 } }),
        apiClient.get('/utilisateurs/agents')
      ]);

      // ----- Points de vente -----
      if (pointsRes.status === 'fulfilled') {
        const data = pointsRes.value.data?.data?.points || [];
        setPointsVente(data.map(p => ({
          id: p.id,
          nom: p.nom,
          adresse: p.adresse,
          categorie: p.categorie
        })));
      } else {
        throw new Error('Impossible de charger les points de vente');
      }

      // ----- Agents -----
      if (agentsRes.status === 'fulfilled') {
        const data = agentsRes.value.data?.data || [];
        setAgents(data.map(a => ({
          id: a.id,
          nom: a.nom,
          email: a.email
        })));
      }
      // Si erreur sur les agents, on continue quand même

    } catch (err) {
      console.error('Erreur useNouvelleVisite:', err);
      const message = err.response?.data?.message 
        || err.message 
        || 'Impossible de charger les données';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================================
  // CRÉATION DE LA VISITE
  // ==========================================================
  const createVisite = useCallback(async (data) => {
    try {
      const payload = {
        date_prevue: data.date,
        heure_prevue: data.heure,
        point_vente_id: parseInt(data.pointVenteId),
        agent_id: data.agentId ? parseInt(data.agentId) : null,
        statut: data.statut || 'planifiee',
        compte_rendu: data.description || null
      };

      const response = await apiClient.post('/visites', payload);
      return { 
        success: true, 
        id: response.data?.data?.id 
      };
    } catch (err) {
      const message = err.response?.data?.message 
        || 'Erreur lors de la création de la visite';
      return { success: false, message };
    }
  }, []);

  // ==========================================================
  // RETOUR
  // ==========================================================
  return {
    pointsVente,
    agents,
    loading,
    error,
    createVisite,
    refresh: fetchData
  };
};

export default useNouvelleVisite;