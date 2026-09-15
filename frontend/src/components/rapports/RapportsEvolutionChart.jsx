import styles from '../../styles/pages/RapportsPage.module.css';

/**
 * Graphique : Évolution mensuelle (barres horizontales rouges)
 */
const RapportsEvolutionChart = ({ data }) => {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartTitle}>
        <i className="bi bi-bar-chart" aria-hidden="true"></i> Évolution mensuelle
      </div>

      {data.length === 0 ? (
        <p className={styles.emptyMessage}>Aucune donnée disponible</p>
      ) : (
        data.map(item => (
          <div key={item.month} className={styles.chartBarItem}>
            <span className={styles.barLabel}>{item.label}</span>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${styles.rouge}`}
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

export default RapportsEvolutionChart;