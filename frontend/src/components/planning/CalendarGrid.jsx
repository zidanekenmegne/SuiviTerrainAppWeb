import styles from '../../styles/pages/PlanningPage.module.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/**
 * Grille du calendrier mensuel (PC)
 */
const CalendarGrid = ({ calendarData, onSelectDate }) => {
  const { cells } = calendarData;

  /**
   * Groupe les visites par statut unique pour les points colorés
   */
  const getUniqueStatuts = (visites) => {
    const statuts = visites.map(v => v.statut);
    return [...new Set(statuts)];
  };

  return (
    <div className={styles.calendarGrid}>
      {/* Jours de la semaine */}
      <div className={styles.weekdays}>
        {WEEKDAYS.map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>

      {/* Grille des jours */}
      <div className={styles.days}>
        {cells.map((cell, index) => {
          if (cell.isOtherMonth) {
            return (
              <div key={index} className={styles.dayCell}>
                <span className={`${styles.dayNumber} ${styles.otherMonth}`}>
                  {cell.day}
                </span>
              </div>
            );
          }

          const uniqueStatuts = getUniqueStatuts(cell.visites);

          return (
            <div
              key={index}
              className={styles.dayCell}
              onClick={() => onSelectDate(cell.dateKey)}
            >
              <span
                className={`${styles.dayNumber} 
                  ${cell.isToday ? styles.today : ''} 
                  ${cell.isSelected ? styles.selected : ''}`}
              >
                {cell.day}
              </span>

              {cell.visites.length > 0 && (
                <>
                  <div className={styles.dayEvents}>
                    {uniqueStatuts.map((statut, i) => (
                      <span
                        key={i}
                        className={`${styles.eventDot} ${styles[statut]}`}
                      />
                    ))}
                  </div>
                  <span className={styles.dayEventCount}>
                    {cell.visites.length}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;