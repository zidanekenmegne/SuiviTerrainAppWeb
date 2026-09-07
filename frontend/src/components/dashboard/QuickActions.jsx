import { Link } from 'react-router-dom';
import styles from '../../styles/pages/DashboardPage.module.css';

/**
 * Actions rapides du tableau de bord
 * - Nouvelle visite
 * - Planning
 * - Points de vente
 * - Rapports
 */
const QuickActions = () => {
  const actions = [
    {
      id: 'visite',
      icon: 'bi bi-plus-circle',
      label: 'Nouvelle visite',
      to: '/visites/nouvelle'
    },
    {
      id: 'planning',
      icon: 'bi bi-calendar-range',
      label: 'Planning',
      to: '/planning'
    },
    {
      id: 'points',
      icon: 'bi bi-shop',
      label: 'Points de vente',
      to: '/points'
    },
    {
      id: 'rapports',
      icon: 'bi bi-file-text',
      label: 'Rapports',
      to: '/rapports'
    }
  ];

  return (
    <>
      <div className={styles.actionsHeader}>
        <span className={styles.actionsTitle}>Actions rapides</span>
      </div>

      <section className={styles.actionsGrid} aria-label="Actions rapides">
        <div className="row g-2">
          {actions.map((action) => (
            <div key={action.id} className="col-3">
              <Link to={action.to} className={styles.actionCard}>
                <i className={action.icon} aria-hidden="true"></i>
                <span className={styles.actionLabel}>{action.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default QuickActions;