import styles from '../../styles/pages/ProfilPage.module.css';

/**
 * Statistiques de l'utilisateur (3 cartes)
 */
const ProfilStats = ({ stats }) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.cardTitle}>
        <i className="bi bi-graph-up-arrow" aria-hidden="true"></i> Statistiques
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {stats?.visites_realisees || 0}
          </div>
          <div className={styles.statLabel}>Visites réalisées</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {stats?.visites_attente || 0}
          </div>
          <div className={styles.statLabel}>En attente</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {stats?.points_vente || 0}
          </div>
          <div className={styles.statLabel}>Points de vente</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilStats;