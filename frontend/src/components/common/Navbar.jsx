import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components/Navbar.module.css';

const Navbar = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navLinks = [
    { to: '/', label: 'Accueil', icon: 'bi bi-house-door' },
    { to: '/visites', label: 'Visites', icon: 'bi bi-list-ul' },
    { to: '/planning', label: 'Planning', icon: 'bi bi-calendar-check' },
    { to: '/historique', label: 'Historique', icon: 'bi bi-clock-history' },
    { to: '/points', label: 'Points', icon: 'bi bi-shop' },
    { to: '/utilisateurs', label: 'Utilisateurs', icon: 'bi bi-people' },
    { to: '/carte', label: 'Carte', icon: 'bi bi-map' }
  ];

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = [
        { label: 'Visite - Magasin A', type: 'visit', url: '/visites' },
        { label: 'Point - Client B', type: 'point', url: '/points' }
      ].filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (url) => {
    setShowSuggestions(false);
    setSearchQuery('');
    window.location.href = url;
  };

  const notifCount = 3;

  return (
    <nav className={styles.navbarPC} aria-label="Navigation principale">
      <div className={styles.navbarInner}>
        
        <div className={styles.navbarBrandWrapper}>
          <Link to="/" className={styles.navbarBrand}>
            <img src="/favicon.svg" alt="SuiviTerrain" width="28" height="28" />
            <span>Suivi</span><span className={styles.brandGold}>Terrain</span>
          </Link>
          
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={isActive(link.to)}>
                  <i className={link.icon} aria-hidden="true"></i>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.navRight}>
          
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <i className="bi bi-search" aria-hidden="true"></i>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                aria-label="Recherche globale"
              />
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.searchSuggestions}>
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    className={styles.suggestionItem}
                    onMouseDown={() => handleSuggestionClick(item.url)}
                  >
                    <div className={styles.suggestionIcon}>
                      <i className={item.type === 'visit' ? 'bi bi-calendar-event' : 'bi bi-shop'} />
                    </div>
                    <div className={styles.suggestionInfo}>
                      <div className={styles.suggestionTitle}>{item.label}</div>
                      <div className={styles.suggestionSubtitle}>
                        {item.type === 'visit' ? 'Visite' : 'Point de vente'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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

          <div className={styles.dropdown}>
            <button
              className={styles.dropdownToggle}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <i className="bi bi-person-circle" aria-hidden="true"></i>
              Zidane
              <i className="bi bi-chevron-down" aria-hidden="true" />
            </button>
            
            {dropdownOpen && (
              <ul className={styles.dropdownMenu}>
                <li>
                  <Link to="/profil" className={styles.dropdownItem}>
                    <i className="bi bi-person" aria-hidden="true"></i> Mon profil
                  </Link>
                </li>
                <li>
                  <Link to="/parametres" className={styles.dropdownItem}>
                    <i className="bi bi-gear" aria-hidden="true"></i> Paramètres
                  </Link>
                </li>
                <li><hr className={styles.dropdownDivider} /></li>
                <li>
                  <Link to="/login" className={`${styles.dropdownItem} ${styles.textDanger}`}>
                    <i className="bi bi-box-arrow-right" aria-hidden="true"></i> Déconnexion
                  </Link>
                </li>
              </ul>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;