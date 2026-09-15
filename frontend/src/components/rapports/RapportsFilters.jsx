import styles from '../../styles/pages/RapportsPage.module.css';

/**
 * Filtres de la page Rapports
 * - Période (Mois, Trimestre, Année)
 * - Agent (dropdown)
 * - Statut (dropdown)
 */
const RapportsFilters = ({
  currentFilter,
  currentAgent,
  currentStatut,
  agents,
  onFilterChange,
  onAgentChange,
  onStatutChange
}) => {
  const periods = [
    { key: 'month', label: 'Ce mois' },
    { key: 'quarter', label: 'Ce trimestre' },
    { key: 'year', label: 'Cette année' }
  ];

  const statuts = [
    { key: 'all', label: 'Tous les statuts' },
    { key: 'realisee', label: 'Réalisées' },
    { key: 'encours', label: 'En cours' },
    { key: 'attente', label: 'En attente' },
    { key: 'retard', label: 'En retard' }
  ];

  return (
    <div className={styles.filterBar}>
      {/* Filtres période */}
      <div className={styles.filterGroup}>
        {periods.map(period => (
          <button
            key={period.key}
            className={`${styles.filterBtn} ${currentFilter === period.key ? styles.active : ''}`}
            onClick={() => onFilterChange(period.key)}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Filtre agent */}
      <select
        className={styles.filterSelect}
        value={currentAgent}
        onChange={(e) => onAgentChange(e.target.value)}
      >
        <option value="all">Tous les agents</option>
        {agents.map(agent => (
          <option key={agent} value={agent}>{agent}</option>
        ))}
      </select>

      {/* Filtre statut */}
      <select
        className={styles.filterSelect}
        value={currentStatut}
        onChange={(e) => onStatutChange(e.target.value)}
      >
        {statuts.map(statut => (
          <option key={statut.key} value={statut.key}>{statut.label}</option>
        ))}
      </select>
    </div>
  );
};

export default RapportsFilters;