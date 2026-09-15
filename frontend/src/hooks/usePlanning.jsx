import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook pour la page Planning
 * - Charge toutes les visites (GET /visites)
 * - Charge les agents (GET /utilisateurs/agents)
 * - Gère la navigation calendrier (mois, jour)
 * - Filtre les visites par date sélectionnée
 */
export const usePlanning = () => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [visites, setVisites] = useState([]);
  const [agents, setAgents] = useState([]);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT DES DONNÉES
  // ==========================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [visitesRes, agentsRes] = await Promise.allSettled([
        apiClient.get('/visites', { params: { limit: 500 } }),
        apiClient.get('/utilisateurs/agents')
      ]);

      // ----- Visites -----
      if (visitesRes.status === 'fulfilled') {
        const data = visitesRes.value.data?.data?.visites || [];
        const formatted = data.map(v => ({
          id: v.id,
          titre: v.point_vente?.nom
            ? `Visite - ${v.point_vente.nom}`
            : 'Visite commerciale',
          adresse: v.point_vente?.adresse || 'Adresse non renseignée',
          date: v.date_prevue,      // format YYYY-MM-DD
          heure: v.heure_prevue ? v.heure_prevue.substring(0, 5) : '--:--',
          statut: normalizeStatut(v.statut),
          agent: v.agents?.map(a => a.nom).join(', ') || 'Non assigné',
          agentIds: v.agents?.map(a => a.id) || [],
          compteRendu: v.compte_rendu,
          pointVente: v.point_vente
        }));
        setVisites(formatted);
      } else {
        throw new Error(
          visitesRes.reason?.response?.data?.message
          || 'Impossible de charger les visites'
        );
      }

      // ----- Agents (non bloquant) -----
      if (agentsRes.status === 'fulfilled') {
        setAgents(agentsRes.value.data?.data || []);
      }

    } catch (err) {
      console.error('Erreur usePlanning:', err);
      const message = err.response?.data?.message
        || err.message
        || 'Impossible de charger le planning';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================================
  // FONCTIONS UTILITAIRES
  // ==========================================================
  function normalizeStatut(statut) {
    const mapping = {
      'realisee': 'realise',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours',
      'planifiee': 'attente'
    };
    return mapping[statut] || 'attente';
  }

  /**
   * Formate une date au format YYYY-MM-DD
   */
  function formatDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Retourne les visites pour une date donnée (YYYY-MM-DD)
   */
  function getVisitesForDate(dateKey) {
    return visites.filter(v => v.date === dateKey);
  }

  // ==========================================================
  // VISITES DU JOUR SÉLECTIONNÉ
  // ==========================================================
  const selectedDateKey = useMemo(
    () => formatDateKey(selectedDate),
    [selectedDate]
  );

  const visitesDuJour = useMemo(
    () => getVisitesForDate(selectedDateKey).sort((a, b) => 
      a.heure.localeCompare(b.heure)
    ),
    [visites, selectedDateKey]
  );

  // ==========================================================
  // NAVIGATION CALENDRIER
  // ==========================================================
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }, []);

  const selectDate = useCallback((dateKey) => {
    // dateKey au format YYYY-MM-DD
    const parts = dateKey.split('-');
    const newDate = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    );
    setSelectedDate(newDate);
    
    // Si on change de mois, mettre à jour currentDate
    if (newDate.getMonth() !== currentDate.getMonth() 
        || newDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  }, [currentDate]);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);

  // ==========================================================
  // DONNÉES POUR LE CALENDRIER
  // ==========================================================
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayKey = formatDateKey(new Date());
    const selectedKey = formatDateKey(selectedDate);

    const cells = [];

    // Jours du mois précédent
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        dateKey: null,
        isOtherMonth: true,
        isToday: false,
        isSelected: false,
        visites: []
      });
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateKey = formatDateKey(dateObj);
      const dayVisites = getVisitesForDate(dateKey);

      cells.push({
        day: i,
        dateKey,
        isOtherMonth: false,
        isToday: dateKey === todayKey,
        isSelected: dateKey === selectedKey,
        visites: dayVisites
      });
    }

    // Jours du mois suivant
    const totalCells = startDay + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        cells.push({
          day: i,
          dateKey: null,
          isOtherMonth: true,
          isToday: false,
          isSelected: false,
          visites: []
        });
      }
    }

    return { cells, year, month };
  }, [currentDate, selectedDate, visites]);

  // ==========================================================
  // RETOUR
  // ==========================================================
  return {
    visites,
    agents,
    visitesDuJour,
    calendarData,
    currentDate,
    selectedDate,
    selectedDateKey,
    loading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    selectDate,
    refresh: fetchData
  };
};

export default usePlanning;