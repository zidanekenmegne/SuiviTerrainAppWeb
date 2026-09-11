import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook personnalisé pour la page Carte
 * 
 * Centralise :
 * - Le chargement des points de vente (/points)
 * - Le chargement des catégories (/categories)
 * - Le chargement des visites du jour (/visites/jour)
 * - Le filtrage multi-mots
 * - Le filtrage par catégorie
 * - L'état de chargement et d'erreur
 */
export const useCarte = () => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [points, setPoints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT DES DONNÉES (API RÉELLE)
  // ==========================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Appels API en parallèle
      const [pointsRes, categoriesRes, itineraryRes] = await Promise.allSettled([
        apiClient.get('/points', { params: { limit: 500 } }),
        apiClient.get('/categories'),
        apiClient.get('/visites/jour')
      ]);

      // ==========================================================
      // 1. TRAITEMENT DES POINTS DE VENTE
      // ==========================================================
      if (pointsRes.status === 'fulfilled') {
        const pointsData = pointsRes.value.data?.data?.points || [];
        
        // Filtrer les points sans coordonnées GPS
        const pointsWithCoords = pointsData
          .filter(p => p.latitude !== null && p.longitude !== null)
          .map(p => ({
            id: p.id,
            nom: p.nom,
            adresse: p.adresse,
            lat: parseFloat(p.latitude),
            lng: parseFloat(p.longitude),
            telephone: p.telephone,
            photo: p.photo,
            categorie: p.categorie,
            couleur: p.couleur || '#8B0000',
            isToday: false // Sera mis à jour après
          }));

        // ==========================================================
        // 2. MARQUER LES POINTS DU JOUR
        // ==========================================================
        if (itineraryRes.status === 'fulfilled') {
          const todayVisits = itineraryRes.value.data?.data || [];
          const todayPointIds = new Set(
            todayVisits
              .map(v => v.point_vente?.id)
              .filter(id => id !== undefined && id !== null)
          );

          pointsWithCoords.forEach(p => {
            p.isToday = todayPointIds.has(p.id);
          });

          // ==========================================================
          // 3. CONSTRUIRE L'ITINÉRAIRE ORDONNÉ
          // ==========================================================
          const itineraryPoints = todayVisits
            .filter(v => v.point_vente?.latitude && v.point_vente?.longitude)
            .map(v => ({
              id: v.point_vente.id,
              nom: v.point_vente.nom,
              adresse: v.point_vente.adresse,
              lat: parseFloat(v.point_vente.latitude),
              lng: parseFloat(v.point_vente.longitude),
              heure_prevue: v.heure_prevue,
              statut: v.statut,
              categorie: v.point_vente.categorie,
              couleur: v.point_vente.couleur
            }))
            .sort((a, b) => {
              // Tri par heure prévue
              const heureA = a.heure_prevue || '00:00';
              const heureB = b.heure_prevue || '00:00';
              return heureA.localeCompare(heureB);
            });

          setItinerary(itineraryPoints);
        }

        setPoints(pointsWithCoords);
      } else {
        throw new Error(
          pointsRes.reason?.response?.data?.message || 
          'Erreur lors du chargement des points de vente'
        );
      }

      // ==========================================================
      // 4. TRAITEMENT DES CATÉGORIES
      // ==========================================================
      if (categoriesRes.status === 'fulfilled') {
        const categoriesData = categoriesRes.value.data?.data || [];
        setCategories(categoriesData);
      } else {
        console.warn('Erreur chargement catégories:', categoriesRes.reason);
        // Pas bloquant : on continue sans les catégories
      }

    } catch (err) {
      console.error('Erreur useCarte:', err);
      const message = err.response?.data?.message 
        || err.message 
        || 'Impossible de charger les données de la carte';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================================
  // FILTRAGE MULTI-MOTS ET PAR CATÉGORIE
  // ==========================================================
  const filteredPoints = useMemo(() => {
    let result = points;

    // ----- Filtre par catégorie -----
    if (selectedCategory !== 'Toutes') {
      result = result.filter(p => p.categorie === selectedCategory);
    }

    // ----- Filtre multi-mots -----
    if (searchTerm.trim()) {
      const words = searchTerm
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0);

      result = result.filter(p => {
        const searchText = `${p.nom || ''} ${p.adresse || ''} ${p.categorie || ''}`
          .toLowerCase()
          // Retire les accents pour améliorer la recherche
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
  }, [points, selectedCategory, searchTerm]);

  // ==========================================================
  // GESTIONNAIRES
  // ==========================================================
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryChange = useCallback((categorie) => {
    setSelectedCategory(categorie);
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================================
  // VALEUR RETOURNÉE
  // ==========================================================
  return {
    // Données
    points: filteredPoints,
    allPoints: points,
    categories,
    itinerary,
    
    // Filtres
    searchTerm,
    selectedCategory,
    
    // États
    loading,
    error,
    
    // Statistiques
    stats: {
      total: points.length,
      filtered: filteredPoints.length,
      today: itinerary.length
    },
    
    // Actions
    handleSearchChange,
    handleCategoryChange,
    refresh
  };
};

export default useCarte;