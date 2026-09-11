import styles from '../../styles/pages/VisitesPage.module.css';

/**
 * Carte d'une visite
 */
const VisiteCard = ({ visite, onClick }) => {
  // Retourne la classe CSS du badge selon le statut
  const getBadgeClass = (statut) => {
    const classes = {
      'realisee': 'realise',
      'attente': 'attente',
      'retard': 'retard',
      'encours': 'encours'
    };
    return classes[statut] || 'attente';
  };

  // Retourne le libellé du statut en français
  const getStatutLabel = (statut) => {
    const labels = {
      'realisee': 'Réalisée',
      'attente': 'En attente',
      'retard': 'En retard',
      'encours': 'En cours'
    };
    return labels[statut] || statut;
  };

  return (
    <div
      className={styles.visiteCard}
      data-statut={visite.statut}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick();
      }}
    >
      <div className={styles.visiteInfo}>
        <p className={styles.visiteTitre}>{visite.titre}</p>
        <p className={styles.visiteAdresse}>
          <i className="bi bi-geo-alt" aria-hidden="true"></i> {visite.adresse}
        </p>
        <p className={styles.visiteDate}>
          <i className="bi bi-clock" aria-hidden="true"></i> {visite.date}
        </p>
      </div>
      <span className={`${styles.badgeStatus} ${styles[getBadgeClass(visite.statut)]}`}>
        {getStatutLabel(visite.statut)}
      </span>
    </div>
  );
};

export default VisiteCard;