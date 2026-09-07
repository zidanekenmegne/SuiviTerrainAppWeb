import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components/BottomNav.module.css';

const BottomNav = () => {
  const location = useLocation();

  // Ordre : Accueil → Visites → [+]/Action → Points → Profil
  const navItems = [
    { to: '/', label: 'Accueil', icon: 'bi bi-house-door' },
    { to: '/visites', label: 'Visites', icon: 'bi bi-list-ul' },
    // Le bouton '+' sera inséré ici (entre Visites et Points)
    { to: '/points', label: 'Points', icon: 'bi bi-shop' },
    { to: '/profil', label: 'Profil', icon: 'bi bi-person' }
  ];

  const isActive = (path) => {
    return location.pathname === path ? styles.active : '';
  };

  // ==========================================================
  // BOUTON CENTRAL : ACTION CONTEXTUELLE
  // ==========================================================
  // Retourne l'URL de redirection et le label selon la page
  const getCenterAction = () => {
    const actions = {
      '/': { url: '/points/ajouter', label: 'Ajouter un point' },
      '/visites': { url: '/visites/nouvelle', label: 'Nouvelle visite' },
      '/planning': { url: '/visites/nouvelle', label: 'Nouvelle visite' },
      '/historique': { url: '/visites/nouvelle', label: 'Nouvelle visite' },
      '/points': { url: '/points/ajouter', label: 'Ajouter un point' },
      '/carte': { url: '/points/ajouter', label: 'Ajouter un point' },
      '/profil': { url: '/parametres', label: 'Paramètres' },
      '/utilisateurs': { url: '/utilisateurs/ajouter', label: 'Ajouter un utilisateur' },
      '/rapports': { url: '/rapports/nouveau', label: 'Nouveau rapport' }
    };
    
    const defaultAction = { url: '/points/ajouter', label: 'Action' };
    return actions[location.pathname] || defaultAction;
  };

  const centerAction = getCenterAction();

  return (
    <nav className={styles.bottomNavMobile} aria-label="Navigation principale mobile">
      
      {/* Éléments avant le bouton central (Accueil + Visites) */}
      {navItems.slice(0, 2).map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`${styles.navItem} ${isActive(item.to)}`}
        >
          <i className={item.icon} aria-hidden="true"></i>
          <span>{item.label}</span>
        </Link>
      ))}

      {/* Bouton central '+' (contextuel) */}
      <Link
        to={centerAction.url}
        className={styles.navItemCenter}
        aria-label={centerAction.label}
        title={centerAction.label}
      >
        <i className="bi bi-plus-lg" aria-hidden="true"></i>
      </Link>

      {/* Éléments après le bouton central (Points + Profil) */}
      {navItems.slice(2).map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`${styles.navItem} ${isActive(item.to)}`}
        >
          <i className={item.icon} aria-hidden="true"></i>
          <span>{item.label}</span>
        </Link>
      ))}

    </nav>
  );
};

export default BottomNav;