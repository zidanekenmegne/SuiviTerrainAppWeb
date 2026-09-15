import styles from '../../styles/pages/RapportsPage.module.css';

/**
 * Cartes KPI (4 indicateurs clés)
 */
const RapportsKPI = ({ kpi }) => {
  const cards = [
    {
      key: 'total',
      value: kpi.total,
      label: 'Visites totales',
      icon: 'bi bi-calendar-event',
      color: 'rouge'
    },
    {
      key: 'realisees',
      value: kpi.realisees,
      label: 'Réalisées',
      icon: 'bi bi-check-circle',
      color: 'vert'
    },
    {
      key: 'attente',
      value: kpi.attente,
      label: 'En attente',
      icon: 'bi bi-clock-history',
      color: 'orange'
    },
    {
      key: 'taux',
      value: `${kpi.taux}%`,
      label: 'Taux de réussite',
      icon: 'bi bi-graph-up-arrow',
      color: 'bleu'
    }
  ];

  return (
    <div className={styles.kpiRow}>
      {cards.map(card => (
        <div key={card.key} className={styles.kpiCard}>
          <i className={`${card.icon} ${styles.kpiIcon} ${styles[card.color]}`} aria-hidden="true"></i>
          <div className={styles.kpiNumber}>{card.value}</div>
          <div className={styles.kpiLabel}>{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default RapportsKPI;