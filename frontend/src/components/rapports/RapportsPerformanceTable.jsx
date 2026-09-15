import styles from '../../styles/pages/RapportsPage.module.css';

/**
 * Tableau des performances par agent
 */
const RapportsPerformanceTable = ({ data }) => {
  return (
    <div className={styles.tableauCard}>
      <div className={styles.tableauTitle}>
        <i className="bi bi-table" aria-hidden="true"></i> Détail des performances
      </div>

      <div className={styles.tableResponsive}>
        <table className={styles.tableCustom}>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Visites</th>
              <th>Réalisées</th>
              <th>En attente</th>
              <th>En retard</th>
              <th>Taux réussite</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem 0', color: '#6c757d' }}>
                  Aucune donnée disponible pour cette période
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr key={row.agent}>
                  <td><strong>{row.agent}</strong></td>
                  <td>{row.total}</td>
                  <td className={styles.textSuccess}>{row.realisees}</td>
                  <td className={styles.textWarning}>{row.attente}</td>
                  <td className={styles.textDanger}>{row.retard}</td>
                  <td><strong>{row.taux}%</strong></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RapportsPerformanceTable;