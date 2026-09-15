import styles from '../../styles/pages/RapportsPage.module.css';

/**
 * Graphique : Répartition par statut (barres horizontales)
 */
const RapportsStatutChart = ({ data }) => {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        <i className="bi bi-pie-chart" aria-hidden="true"></i> Répartition par statut
      </div>

      {data.length === 0 ? (
        <p className={styles.emptyMessage}>Aucune donnée disponible</p>
      ) : (
        data.map(item => (
          <div key={item.key} className={styles.chartBarItem}>
            <span className={styles.barLabel}>{item.label}</span>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${styles[item.color]}`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <span className={styles.barValue}>{item.count}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default RapportsStatutChart;