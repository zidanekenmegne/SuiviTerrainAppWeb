import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook pour la page Rapports
 * - Charge toutes les visites et utilisateurs
 * - Calcule les KPI, graphiques et performances
 * - Filtre par période, agent, statut
 */
export const useRapports = () => {
  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [visites, setVisites] = useState([]);
  const [agents, setAgents] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('month'); // month, quarter, year
  const [currentAgent, setCurrentAgent] = useState('all');
  const [currentStatut, setCurrentStatut] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // CHARGEMENT DES DONNÉES
  // ==========================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [visitesRes, usersRes] = await Promise.allSettled([
        apiClient.get('/visites', { params: { limit: 1000 } }),
        apiClient.get('/utilisateurs')
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
          date: v.date_prevue,
          statut: normalizeStatut(v.statut),
          agents: v.agents?.map(a => a.nom) || [],
          agent: v.agents?.[0]?.nom || 'Non assigné'
        }));
        setVisites(formatted);
      } else {
        throw new Error(
          visitesRes.reason?.response?.data?.message
          || 'Impossible de charger les visites'
        );
      }

      // ----- Utilisateurs (agents) -----
      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value.data?.data || [];
        setAgents(data.map(u => u.nom));
      }

    } catch (err) {
      console.error('Erreur useRapports:', err);
      setError(err.message || 'Impossible de charger les rapports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================================
  // UTILITAIRES
  // ==========================================================
  function normalizeStatut(statut) {
    const mapping = {
      'realisee': 'realisee',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours',
      'planifiee': 'attente'
    };
    return mapping[statut] || 'attente';
  }

  // ==========================================================
  // FILTRAGE
  // ==========================================================
  const filteredData = useMemo(() => {
    let data = [...visites];
    const now = new Date();

    // ----- Filtre par période -----
    if (currentFilter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      data = data.filter(v => new Date(v.date) >= monthStart);
    } else if (currentFilter === 'quarter') {
      const quarterStart = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      data = data.filter(v => new Date(v.date) >= quarterStart);
    } else if (currentFilter === 'year') {
      const yearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      data = data.filter(v => new Date(v.date) >= yearStart);
    }

    // ----- Filtre par agent -----
    if (currentAgent !== 'all') {
      data = data.filter(v => v.agents.includes(currentAgent));
    }

    // ----- Filtre par statut -----
    if (currentStatut !== 'all') {
      data = data.filter(v => v.statut === currentStatut);
    }

    return data;
  }, [visites, currentFilter, currentAgent, currentStatut]);

  // ==========================================================
  // KPI
  // ==========================================================
  const kpi = useMemo(() => {
    const total = filteredData.length;
    const realisees = filteredData.filter(v => v.statut === 'realisee').length;
    const attente = filteredData.filter(
      v => v.statut === 'attente' || v.statut === 'encours'
    ).length;
    const taux = total > 0 ? Math.round((realisees / total) * 100) : 0;

    return { total, realisees, attente, taux };
  }, [filteredData]);

  // ==========================================================
  // GRAPHIQUE : RÉPARTITION PAR STATUT
  // ==========================================================
  const statutChart = useMemo(() => {
    const statuts = {
      'realisee': { label: 'Réalisées', color: 'vert', count: 0 },
      'encours': { label: 'En cours', color: 'bleu', count: 0 },
      'attente': { label: 'En attente', color: 'orange', count: 0 },
      'retard': { label: 'En retard', color: 'rouge', count: 0 }
    };

    filteredData.forEach(v => {
      if (statuts[v.statut]) statuts[v.statut].count++;
    });

    const maxCount = Math.max(...Object.values(statuts).map(s => s.count), 1);

    return Object.entries(statuts).map(([key, s]) => ({
      key,
      label: s.label,
      color: s.color,
      count: s.count,
      percent: Math.round((s.count / maxCount) * 100)
    }));
  }, [filteredData]);

  // ==========================================================
  // GRAPHIQUE : ÉVOLUTION MENSUELLE
  // ==========================================================
  const evolutionChart = useMemo(() => {
    const months = {};
    filteredData.forEach(v => {
      if (!v.date) return;
      const month = v.date.substring(0, 7); // YYYY-MM
      if (!months[month]) months[month] = 0;
      months[month]++;
    });

    const sortedMonths = Object.keys(months).sort();
    const maxCount = Math.max(...Object.values(months), 1);

    return sortedMonths.map(month => ({
      month,
      label: `${month.substring(5, 7)}/${month.substring(2, 4)}`,
      count: months[month],
      percent: Math.round((months[month] / maxCount) * 100)
    }));
  }, [filteredData]);

  // ==========================================================
  // TABLEAU DE PERFORMANCES PAR AGENT
  // ==========================================================
  const performanceTable = useMemo(() => {
    const agentsMap = {};
    filteredData.forEach(v => {
      const agentNames = v.agents.length > 0 ? v.agents : ['Non assigné'];
      agentNames.forEach(name => {
        if (!agentsMap[name]) {
          agentsMap[name] = { total: 0, realisees: 0, attente: 0, retard: 0 };
        }
        agentsMap[name].total++;
        if (v.statut === 'realisee') agentsMap[name].realisees++;
        else if (v.statut === 'attente' || v.statut === 'encours') agentsMap[name].attente++;
        else if (v.statut === 'retard') agentsMap[name].retard++;
      });
    });

    return Object.entries(agentsMap).map(([agent, stats]) => ({
      agent,
      ...stats,
      taux: stats.total > 0 ? Math.round((stats.realisees / stats.total) * 100) : 0
    }));
  }, [filteredData]);

  // ==========================================================
  // RETOUR
  // ==========================================================
  return {
    // Données
    kpi,
    statutChart,
    evolutionChart,
    performanceTable,
    agents,

    // Filtres
    currentFilter,
    currentAgent,
    currentStatut,
    setCurrentFilter,
    setCurrentAgent,
    setCurrentStatut,

    // États
    loading,
    error,

    // Actions
    refresh: fetchData
  };
};

export default useRapports;