import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components/BottomNav.module.css';

/**
 * Barre de navigation mobile (bas de page)
 * - Affichée uniquement sur les écrans < 768px
 * - 5 onglets avec bouton d'action central
 */
const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Accueil', icon: 'bi bi-house-door' },
    { to: '/visites', label: 'Visites', icon: 'bi bi-list-ul' },
    { to: '/points', label: 'Points', icon: 'bi bi-shop' },
    { to: '/carte', label: 'Carte', icon: 'bi bi-map' },
    { to: '/profil', label: 'Profil', icon: 'bi bi-person' }
  ];

  const isActive = (path) => {
    return location.pathname === path ? styles.active : '';
  };

  // Déterminer l'action du bouton central selon la page
  const getCenterAction = () => {
    const actions = {
      '/': '/points', // Sur Dashboard → Ajouter un point
      '/visites': '/visites/nouvelle',
      '/points': '/points/ajouter',
      '/carte': '/points/ajouter',
      '/profil': '/parametres'
    };
    return actions[location.pathname] || '/points/ajouter';
  };

  const getCenterLabel = () => {
    const labels = {
      '/': 'Ajouter un point',
      '/visites': 'Nouvelle visite',
      '/points': 'Ajouter un point',
      '/carte': 'Ajouter un point',
      '/profil': 'Paramètres'
    };
    return labels[location.pathname] || 'Action';
  };

  return (
    <nav className={styles.bottomNavMobile} aria-label="Navigation principale mobile">
      
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`${styles.navItem} ${isActive(item.to)}`}
        >
          <i className={item.icon} aria-hidden="true"></i>
          <span>{item.label}</span>
        </Link>
      ))}

      {/* Bouton central */}
      <Link
        to={getCenterAction()}
        className={styles.navItemCenter}
        aria-label={getCenterLabel()}
        title={getCenterLabel()}
      >
        <i className="bi bi-plus-lg" aria-hidden="true"></i>
      </Link>

    </nav>
  );
};

export default BottomNav;