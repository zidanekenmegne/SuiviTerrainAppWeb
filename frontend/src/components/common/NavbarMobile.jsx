import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components/NavbarMobile.module.css';

/**
 * Bandeau haut mobile + Menu hamburger
 * - Affiché uniquement sur les écrans < 768px
 */
const NavbarMobile = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const notifCount = 3;

  const menuLinks = [
    { to: '/', label: 'Accueil', icon: 'bi bi-house-door' },
    { to: '/visites', label: 'Visites', icon: 'bi bi-list-ul' },
    { to: '/planning', label: 'Planning', icon: 'bi bi-calendar-check' },
    { to: '/historique', label: 'Historique', icon: 'bi bi-clock-history' },
    { to: '/points', label: 'Points de vente', icon: 'bi bi-shop' },
    { to: '/utilisateurs', label: 'Utilisateurs', icon: 'bi bi-people' },
    { to: '/carte', label: 'Carte', icon: 'bi bi-map' },
    { to: '/profil', label: 'Profil', icon: 'bi bi-person' },
    { to: '/parametres', label: 'Paramètres', icon: 'bi bi-gear' }
  ];

  const getPageTitle = () => {
    const titles = {
      '/': 'Tableau de bord',
      '/visites': 'Visites',
      '/planning': 'Planning',
      '/historique': 'Historique',
      '/points': 'Points de vente',
      '/utilisateurs': 'Utilisateurs',
      '/carte': 'Carte',
      '/profil': 'Profil',
      '/parametres': 'Paramètres'
    };
    return titles[location.pathname] || 'SuiviTerrain';
  };

  return (
    <header className={styles.topHeaderMobile}>
      <div className={styles.headerRow}>
        
        {/* Hamburger */}
        <button
          className={styles.menuHamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu de navigation"
        >
          <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true"></i>
        </button>

        {/* Titre */}
        <div className={styles.headerCenter}>
          <span className={styles.pageTitle}>{getPageTitle()}</span>
        </div>

        {/* Notifications */}
        <div className={styles.headerRight}>
          <button 
            className={styles.notificationBtn}
            aria-label="Notifications"
            onClick={() => window.location.href = '/notifications'}
          >
            <i className="bi bi-bell" aria-hidden="true"></i>
            {notifCount > 0 && (
              <span className={styles.badgeNotif}>{notifCount}</span>
            )}
          </button>
        </div>

      </div>

      {/* Menu déroulant */}
      <div className={`${styles.mobileMenuDropdown} ${menuOpen ? styles.open : ''}`}>
        {menuLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? styles.activeLink : ''}
            onClick={() => setMenuOpen(false)}
          >
            <i className={link.icon} aria-hidden="true"></i> {link.label}
          </Link>
        ))}
        <hr />
        <Link to="/login" className={styles.textDanger} onClick={() => setMenuOpen(false)}>
          <i className="bi bi-box-arrow-right" aria-hidden="true"></i> Déconnexion
        </Link>
      </div>
    </header>
  );
};

export default NavbarMobile;