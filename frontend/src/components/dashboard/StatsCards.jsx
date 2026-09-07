import styles from '../../styles/pages/DashboardPage.module.css';

/**
 * Cartes de statistiques du tableau de bord
 * - Total des visites
 * - Visites réalisées
 * - Visites en cours
 * - Visites en attente
 */
const StatsCards = ({ stats }) => {
  const cards = [
    {
      id: 'total',
      icon: 'bi bi-calendar-event',
      iconClass: styles.iconTotal,
      number: stats.total || 0,
      label: 'Visites'
    },
    {
      id: 'realisees',
      icon: 'bi bi-check-circle',
      iconClass: styles.iconRealise,
      number: stats.realisees || 0,
      label: 'Réalisées'
    },
    {
      id: 'encours',
      icon: 'bi bi-play-circle',
      iconClass: styles.iconEncours,
      number: stats.encours || 0,
      label: 'En cours'
    },
    {
      id: 'attente',
      icon: 'bi bi-clock-history',
      iconClass: styles.iconAttente,
      number: stats.attente || 0,
      label: 'En attente'
    }
  ];

  return (
    <section className={styles.statsRow} aria-label="Indicateurs statistiques">
      <div className="row g-2">
        {cards.map((card) => (
          <div key={card.id} className="col-3">
            <div className={styles.statCard}>
              <i className={`${card.icon} ${card.iconClass}`} aria-hidden="true"></i>
              <span className={styles.statNumber}>{card.number}</span>
              <span className={styles.statLabel}>{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsCards;