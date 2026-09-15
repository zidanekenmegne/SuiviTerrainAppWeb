import PlanningVisiteItem from './PlanningVisiteItem';
import styles from '../../styles/pages/PlanningPage.module.css';

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Liste des visites du jour sélectionné (PC)
 */
const DayVisitesList = ({ visites, selectedDate, onVisitClick }) => {
  const formatDisplayDate = (date) => {
    const d = new Date(date);
    return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className={styles.visitesDayList}>
      <div className={styles.dayHeader}>
        <h3>
          <i className="bi bi-calendar-event" aria-hidden="true"></i>{' '}
          Visites du {formatDisplayDate(selectedDate)}
        </h3>
        <span className={styles.dayDate}>
          {visites.length} visite{visites.length > 1 ? 's' : ''}
        </span>
      </div>

      {visites.length === 0 ? (
        <p className={styles.emptyMessage}>
          <i className="bi bi-inbox" aria-hidden="true"></i>
          Aucune visite prévue ce jour
        </p>
      ) : (
        <div>
          {visites.map(visite => (
            <PlanningVisiteItem
              key={visite.id}
              visite={visite}
              onClick={() => onVisitClick(visite.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DayVisitesList;