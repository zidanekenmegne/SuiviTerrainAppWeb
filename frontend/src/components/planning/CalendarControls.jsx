import { useRef } from 'react';
import styles from '../../styles/pages/PlanningPage.module.css';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Contrôles du calendrier (navigation mois + sélection date)
 */
const CalendarControls = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSelectDate
}) => {
  const datePickerRef = useRef(null);

  const monthYear = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const handleDatePickerChange = (e) => {
    if (e.target.value) {
      onSelectDate(e.target.value);
    }
  };

  const openDatePicker = () => {
    if (datePickerRef.current) {
      if (datePickerRef.current.showPicker) {
        datePickerRef.current.showPicker();
      } else {
        datePickerRef.current.click();
      }
    }
  };

  return (
    <div className={styles.calendarControls}>
      <span className={styles.monthYear}>{monthYear}</span>

      <div className={styles.navButtons}>
        <button
          onClick={onPrevMonth}
          aria-label="Mois précédent"
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <button
          className={styles.datePickerBtn}
          onClick={onToday}
        >
          Aujourd'hui
        </button>

        <button
          onClick={onNextMonth}
          aria-label="Mois suivant"
        >
          <i className="bi bi-chevron-right"></i>
        </button>

        <input
          ref={datePickerRef}
          type="date"
          onChange={handleDatePickerChange}
          style={{ display: 'none' }}
        />

        <button
          className={styles.datePickerBtn}
          onClick={openDatePicker}
          aria-label="Sélectionner une date"
        >
          <i className="bi bi-calendar3"></i>
        </button>
      </div>
    </div>
  );
};

export default CalendarControls;