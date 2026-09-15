import { useRapports } from '../hooks/useRapports';
import { useToast } from '../contexts/ToastContext';
import RapportsFilters from '../components/rapports/RapportsFilters';
import RapportsKPI from '../components/rapports/RapportsKPI';
import RapportsStatutChart from '../components/rapports/RapportsStatutChart';
import RapportsEvolutionChart from '../components/rapports/RapportsEvolutionChart';
import RapportsPerformanceTable from '../components/rapports/RapportsPerformanceTable';
import styles from '../styles/pages/RapportsPage.module.css';

/**
 * Page Rapports
 * - KPI (visites totales, réalisées, en attente, taux)
 * - Graphiques (répartition par statut, évolution mensuelle)
 * - Tableau de performances par agent
 */
const RapportsPage = () => {
  const { showToast } = useToast();

  const {
    kpi,
    statutChart,
    evolutionChart,
    performanceTable,
    agents,
    currentFilter,
    currentAgent,
    currentStatut,
    setCurrentFilter,
    setCurrentAgent,
    setCurrentStatut,
    loading,
    error,
    refresh
  } = useRapports();

  // ==========================================================
  // HANDLER EXPORT
  // ==========================================================
  const handleExport = () => {
    showToast('Export en cours...');
    
    // Simulation d'export (à implémenter avec jsPDF ou ExcelJS)
    setTimeout(() => {
      showToast('Export terminé ! (simulation)');
    }, 1500);
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
          <p className="mt-3 text-muted">Chargement des rapports...</p>
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
            onClick={refresh}
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
    <div className={styles.rapportsContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-file-earmark-text" aria-hidden="true"></i> Rapports
        </h1>
        <button className={styles.exportBtn} onClick={handleExport}>
          <i className="bi bi-download" aria-hidden="true"></i> Exporter
        </button>
      </div>

      {/* Filtres */}
      <RapportsFilters
        currentFilter={currentFilter}
        currentAgent={currentAgent}
        currentStatut={currentStatut}
        agents={agents}
        onFilterChange={setCurrentFilter}
        onAgentChange={setCurrentAgent}
        onStatutChange={setCurrentStatut}
      />

      {/* KPI */}
      <RapportsKPI kpi={kpi} />

      {/* Graphiques */}
      <div className={styles.chartsRow}>
        <RapportsStatutChart data={statutChart} />
        <RapportsEvolutionChart data={evolutionChart} />
      </div>

      {/* Tableau de performances */}
      <RapportsPerformanceTable data={performanceTable} />

    </div>
  );
};

export default RapportsPage;