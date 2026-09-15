import { useNavigate } from 'react-router-dom';
import { usePlanning } from '../hooks/usePlanning';
import CalendarControls from '../components/planning/CalendarControls';
import CalendarGrid from '../components/planning/CalendarGrid';
import DayVisitesList from '../components/planning/DayVisitesList';
import MobilePlanning from '../components/planning/MobilePlanning';
import styles from '../styles/pages/PlanningPage.module.css';

/**
 * Page Planning des visites
 * - Calendrier mensuel (PC) / Navigation jour par jour (Mobile)
 * - Liste des visites du jour sélectionné
 */
const PlanningPage = () => {
  const navigate = useNavigate();

  const {
    visitesDuJour,
    calendarData,
    currentDate,
    selectedDate,
    selectedDateKey,
    loading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    selectDate,
    refresh
  } = usePlanning();

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleVisitClick = (id) => {
    navigate(`/visites/${id}`);
  };

  // ==========================================================
  // RENDU : CHARGEMENT
  // ==========================================================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement du planning...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : ERREUR
  // ==========================================================
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
          <strong className="ms-2">Erreur :</strong> {error}
          <button
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={refresh}
          >
            <i className="bi bi-arrow-clockwise" aria-hidden="true"></i> Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : SUCCÈS
  // ==========================================================
  return (
    <div className={styles.planningContainer}>

      {/* En-tête PC */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-calendar-check" aria-hidden="true"></i> Planning des visites
        </h1>
      </div>

      {/* Contrôles calendrier (PC) */}
      <CalendarControls
        currentDate={currentDate}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        onSelectDate={selectDate}
      />

      {/* Calendrier grille (PC) */}
      <CalendarGrid
        calendarData={calendarData}
        onSelectDate={selectDate}
      />

      {/* Liste des visites du jour (PC) */}
      <DayVisitesList
        visites={visitesDuJour}
        selectedDate={selectedDate}
        onVisitClick={handleVisitClick}
      />

      {/* Planning mobile */}
      <MobilePlanning
        visites={visitesDuJour}
        selectedDate={selectedDate}
        onPrevDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onVisitClick={handleVisitClick}
      />

    </div>
  );
};

export default PlanningPage;