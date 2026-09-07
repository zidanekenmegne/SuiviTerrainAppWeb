import styles from '../../styles/pages/DashboardPage.module.css';

/**
 * Liste des visites récentes
 * - Affiche jusqu'à 4 visites
 * - Chaque visite est cliquable
 */
const RecentVisits = ({ visits, onVisitClick }) => {
  // Limiter à 4 visites
  const displayVisits = visits.slice(0, 4);

  /**
   * Retourne la classe CSS du badge selon le statut
   */
  const getBadgeClass = (statut) => {
    const classes = {
      'realise': 'realise',
      'realisee': 'realise',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours',
      'planifiee': 'attente'
    };
    return classes[statut] || 'attente';
  };

  /**
   * Retourne le libellé du statut en français
   */
  const getStatutLabel = (statut) => {
    const labels = {
      'realise': 'Réalisée',
      'realisee': 'Réalisée',
      'attente': 'En attente',
      'retard': 'En retard',
      'encours': 'En cours',
      'planifiee': 'Planifiée'
    };
    return labels[statut] || statut;
  };

  if (displayVisits.length === 0) {
    return (
      <div className={styles.visitesList}>
        <div className="text-center py-4 text-muted">
          <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
          Aucune visite récente
        </div>
      </div>
    );
  }

  return (
    <section className={styles.visitesList} aria-label="Liste des visites récentes">
      {displayVisits.map((visit) => (
        <div
          key={visit.id}
          className={styles.visiteItem}
          onClick={() => onVisitClick(visit.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onVisitClick(visit.id);
          }}
        >
          <div className={styles.visiteInfo}>
            <p className={styles.visiteTitre}>{visit.titre}</p>
            <p className={styles.visiteAdresse}>
              <i className="bi bi-geo-alt" aria-hidden="true"></i> {visit.adresse}
            </p>
            <p className={styles.visiteDate}>
              <i className="bi bi-clock" aria-hidden="true"></i> {visit.date}
            </p>
          </div>
          <span className={`${styles.badgeStatus} ${styles[getBadgeClass(visit.statut)]}`}>
            {getStatutLabel(visit.statut)}
          </span>
        </div>
      ))}
    </section>
  );
};

export default RecentVisits;