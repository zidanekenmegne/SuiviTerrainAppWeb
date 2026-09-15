import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook pour la gestion du profil utilisateur
 * - Chargement des infos (/auth/me)
 * - Chargement des stats (/stats/user)
 * - Modification du profil (/auth/me PUT)
 * - Changement de mot de passe (/auth/password PUT)
 */
export const useProfil = () => {
  const [profil, setProfil] = useState(null);
  const [stats, setStats] = useState({
    visites_realisees: 0,
    visites_attente: 0,
    points_vente: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT DES DONNÉES
  // ==========================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Appels API en parallèle
      const [profilRes, statsRes] = await Promise.allSettled([
        apiClient.get('/auth/me'),
        apiClient.get('/stats/user')
      ]);

      // ----- Profil -----
      if (profilRes.status === 'fulfilled') {
        setProfil(profilRes.value.data?.data || null);
      } else {
        throw new Error(
          profilRes.reason?.response?.data?.message 
          || 'Impossible de charger le profil'
        );
      }

      // ----- Stats -----
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || {
          visites_realisees: 0,
          visites_attente: 0,
          points_vente: 0
        });
      }
      // Si les stats échouent, on continue sans bloquer

    } catch (err) {
      console.error('Erreur useProfil:', err);
      const message = err.response?.data?.message 
        || err.message 
        || 'Impossible de charger le profil';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================================
  // MISE À JOUR DU PROFIL
  // ==========================================================
  const updateProfil = useCallback(async (data) => {
    try {
      const response = await apiClient.put('/auth/me', data);
      
      // Mettre à jour l'état local avec les nouvelles données
      if (response.data?.data) {
        setProfil(prev => ({ ...prev, ...response.data.data }));
      } else {
        // Si l'API ne renvoie pas les données, recharger
        await fetchData();
      }
      
      // Mettre à jour le localStorage (nom utilisé dans la navbar)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la modification';
      return { success: false, message };
    }
  }, [fetchData]);

  // ==========================================================
  // CHANGEMENT DE MOT DE PASSE
  // ==========================================================
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/auth/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return { success: true, message: response.data?.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      return { success: false, message };
    }
  }, []);
// ==========================================================
// UPLOAD DE PHOTO
// ==========================================================
const uploadPhoto = useCallback(async (file) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await apiClient.post('/auth/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Mettre à jour le profil avec la nouvelle photo
    if (response.data?.data?.photo) {
      setProfil(prev => ({ ...prev, photo: response.data.data.photo }));
    }
    
    return { success: true, photo: response.data?.data?.photo };
  } catch (err) {
    const message = err.response?.data?.message || 'Erreur lors de l\'upload';
    return { success: false, message };
  }
}, []);

// ==========================================================
// SUPPRESSION DE PHOTO
// ==========================================================
const deletePhoto = useCallback(async () => {
  try {
    await apiClient.delete('/auth/photo');
    setProfil(prev => ({ ...prev, photo: null }));
    return { success: true };
  } catch (err) {
    const message = err.response?.data?.message || 'Erreur lors de la suppression';
    return { success: false, message };
  }
}, []);
  // ==========================================================
  // RETOUR
  // ==========================================================
  return {
    profil,
    stats,
    loading,
    error,
    updateProfil,
    changePassword,
    uploadPhoto,      
    deletePhoto,
    refresh: fetchData
  };
};

export default useProfil;