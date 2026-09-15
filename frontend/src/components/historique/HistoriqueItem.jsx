import styles from '../../styles/pages/HistoriquePage.module.css';

/**
 * Item d'une visite dans l'historique
 */
const HistoriqueItem = ({ visite, onClick }) => {
  // Retourne la classe CSS du badge
  const getBadgeClass = (statut) => {
    const classes = {
      'realisee': 'realisee',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours',
      'planifie': 'planifie'
    };
    return classes[statut] || 'planifie';
  };

  // Retourne le libellé du statut
  const getStatutLabel = (statut) => {
    const labels = {
      'realisee': 'Réalisée',
      'attente': 'En attente',
      'retard': 'En retard',
      'encours': 'En cours',
      'planifie': 'Planifiée'
    };
    return labels[statut] || statut;
  };

  return (
    <div
      className={styles.historiqueItem}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick();
      }}
    >
      <div className={styles.hiInfo}>
        <p className={styles.hiTitre}>{visite.titre}</p>
        <p className={styles.hiDetail}>
          <i className="bi bi-geo-alt" aria-hidden="true"></i> {visite.adresse}
          {visite.agent && visite.agent !== 'Non assigné' && (
            <> • <i className="bi bi-person" aria-hidden="true"></i> {visite.agent}</>
          )}
        </p>
      </div>
      <div className={styles.hiActions}>
        <span className={`${styles.badgeStatus} ${styles[getBadgeClass(visite.statut)]}`}>
          {getStatutLabel(visite.statut)}
        </span>
        <span className={styles.hiDate}>{visite.date}</span>
      </div>
    </div>
  );
};

export default HistoriqueItem;