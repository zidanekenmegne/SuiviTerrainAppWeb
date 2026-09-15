import styles from '../../styles/pages/PlanningPage.module.css';

/**
 * Item d'une visite dans la liste (PC)
 */
const PlanningVisiteItem = ({ visite, onClick }) => {
  const getStatutLabel = (statut) => {
    const labels = {
      'realise': 'Réalisée',
      'attente': 'En attente',
      'retard': 'En retard',
      'encours': 'En cours'
    };
    return labels[statut] || statut;
  };

  return (
    <div
      className={styles.visiteItem}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.visiteInfo}>
        <p className={styles.visiteTitre}>{visite.titre}</p>
        <p className={styles.visiteDetail}>
          <i className="bi bi-geo-alt" aria-hidden="true"></i> {visite.adresse}
          {' • '}
          <i className="bi bi-clock" aria-hidden="true"></i> {visite.heure}
          {' • '}
          <i className="bi bi-person" aria-hidden="true"></i> {visite.agent}
        </p>
      </div>
      <span className={`${styles.badgeStatus} ${styles[visite.statut]}`}>
        {getStatutLabel(visite.statut)}
      </span>
    </div>
  );
};

export default PlanningVisiteItem;