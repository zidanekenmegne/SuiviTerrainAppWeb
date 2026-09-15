import PlanningVisiteItem from './PlanningVisiteItem';
import styles from '../../styles/pages/PlanningPage.module.css';

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Planning mobile (navigation jour par jour)
 */
const MobilePlanning = ({
  visites,
  selectedDate,
  onPrevDay,
  onNextDay,
  onVisitClick
}) => {
  const formatDisplayDate = (date) => {
    const d = new Date(date);
    return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  const displayDate = formatDisplayDate(selectedDate);

  return (
    <div className={styles.planningMobile}>
      {/* Sélecteur de date */}
      <div className={styles.mobileDateSelector}>
        <button onClick={onPrevDay} aria-label="Jour précédent">
          <i className="bi bi-chevron-left"></i>
        </button>
        <span className={styles.mobileDateLabel}>{displayDate}</span>
        <button onClick={onNextDay} aria-label="Jour suivant">
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      {/* Liste des visites */}
      <div className={styles.mobileDayList}>
        <div className={styles.mobileDayHeader}>
          <i className="bi bi-calendar-event" aria-hidden="true"></i>{' '}
          Visites du jour ({visites.length})
        </div>

        {visites.length === 0 ? (
          <p className={styles.emptyMessage}>
            <i className="bi bi-inbox" aria-hidden="true"></i>
            Aucune visite prévue
          </p>
        ) : (
          visites.map(visite => (
            <div
              key={visite.id}
              className={styles.mobileVisiteItem}
              onClick={() => onVisitClick(visite.id)}
            >
              <div className={styles.mvInfo}>
                <p className={styles.mvTitre}>{visite.titre}</p>
                <p className={styles.mvDetail}>
                  <i className="bi bi-clock" aria-hidden="true"></i> {visite.heure}
                  {' • '}
                  <i className="bi bi-person" aria-hidden="true"></i> {visite.agent}
                </p>
              </div>
              <span className={`${styles.badgeStatus} ${styles[visite.statut]}`}>
                {visite.statut === 'realise' ? 'Réalisée' 
                  : visite.statut === 'attente' ? 'En attente'
                  : visite.statut === 'retard' ? 'En retard'
                  : 'En cours'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobilePlanning;