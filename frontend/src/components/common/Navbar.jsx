import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import styles from '../../styles/components/Navbar.module.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ==========================================================
  // ÉTATS
  // ==========================================================
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // ==========================================================
  // LIENS DE NAVIGATION
  // ==========================================================
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

  // ==========================================================
  // RECHERCHE GLOBALE (API RÉELLE)
  // ==========================================================
  
  /**
   * Effectue la recherche via l'API
   */
  const performSearch = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setSearchLoading(true);

    try {
      // Appels API en parallèle
      const [pointsRes, visitesRes] = await Promise.allSettled([
        apiClient.get('/points', { params: { search: query, limit: 5 } }),
        apiClient.get('/visites', { params: { limit: 5 } })
      ]);

      const results = [];

      // ----- Points de vente -----
      if (pointsRes.status === 'fulfilled') {
        const pointsData = pointsRes.value.data?.data?.points || [];
        pointsData.forEach(p => {
          results.push({
            id: `point-${p.id}`,
            type: 'point',
            label: p.nom,
            subtitle: p.adresse,
            badge: p.categorie,
            url: '/points',
            icon: 'bi bi-shop'
          });
        });
      }

      // ----- Visites (filtrage côté client car l'API ne supporte pas la recherche) -----
      if (visitesRes.status === 'fulfilled') {
        const visitesData = visitesRes.value.data?.data?.visites || [];
        const lowerQuery = query.toLowerCase();

        visitesData
          .filter(v => 
            v.point_vente?.nom?.toLowerCase().includes(lowerQuery) ||
            v.point_vente?.adresse?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 5)
          .forEach(v => {
            results.push({
              id: `visite-${v.id}`,
              type: 'visit',
              label: v.point_vente?.nom || 'Visite',
              subtitle: `${v.point_vente?.adresse || ''} • ${v.date_prevue || ''}`,
              badge: v.statut,
              url: `/visites/${v.id}`,
              icon: 'bi bi-calendar-event'
            });
          });
      }

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (err) {
      console.error('Erreur recherche globale:', err);
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  /**
   * Debounce de la recherche (300ms)
   */
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Annuler le précédent timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Lancer la recherche après 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSuggestionClick = (url) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setSuggestions([]);
    navigate(url);
  };

  // ==========================================================
  // DÉCONNEXION
  // ==========================================================
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ==========================================================
  // FERMETURE DU DROPDOWN AU CLIC EXTÉRIEUR
  // ==========================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================================
  // RENDU
  // ==========================================================
  return (
    <nav className={styles.navbarPC} aria-label="Navigation principale">
      <div className={styles.navbarInner}>

        {/* ===== BRAND + LIENS ===== */}
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

        {/* ===== RECHERCHE + NOTIFS + PROFIL ===== */}
        <div className={styles.navRight}>

          {/* Recherche globale */}
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
              {searchLoading && (
                <span className={styles.searchLoading}>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </span>
              )}
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.searchSuggestions}>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className={styles.suggestionItem}
                    onMouseDown={() => handleSuggestionClick(item.url)}
                  >
                    <div className={styles.suggestionIcon}>
                      <i className={item.icon} aria-hidden="true" />
                    </div>
                    <div className={styles.suggestionInfo}>
                      <div className={styles.suggestionTitle}>{item.label}</div>
                      <div className={styles.suggestionSubtitle}>
                        {item.subtitle}
                      </div>
                    </div>
                    {item.badge && (
                      <span className={styles.suggestionBadge}>{item.badge}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Aucun résultat */}
            {showSuggestions && suggestions.length === 0 && searchQuery.length >= 2 && !searchLoading && (
              <div className={styles.searchSuggestions}>
                <div className={styles.suggestionEmpty}>
                  <i className="bi bi-search" aria-hidden="true"></i>
                  Aucun résultat trouvé
                </div>
              </div>
            )}
          </div>

          {/* Notifications (désactivé temporairement) */}
          <button
            className={styles.notificationBtn}
            aria-label="Notifications"
            title="Notifications (à venir)"
            onClick={() => navigate('/notifications')}
          >
            <i className="bi bi-bell" aria-hidden="true"></i>
            {/* Pas de compteur tant que le système de notifications n'est pas en place */}
          </button>

          {/* Dropdown profil */}
          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              className={styles.dropdownToggle}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <i className="bi bi-person-circle" aria-hidden="true"></i>
              {user?.nom || 'Utilisateur'}
              <i className="bi bi-chevron-down" aria-hidden="true" />
            </button>

            {dropdownOpen && (
              <ul className={styles.dropdownMenu}>
                <li className={styles.dropdownHeader}>
                  <div className={styles.dropdownUserInfo}>
                    <i className="bi bi-person-circle" aria-hidden="true"></i>
                    <div>
                      <div className={styles.dropdownUserName}>{user?.nom || 'Utilisateur'}</div>
                      <div className={styles.dropdownUserRole}>
                        {user?.role === 'admin' ? 'Administrateur' : 'Agent'}
                      </div>
                    </div>
                  </div>
                </li>
                <li><hr className={styles.dropdownDivider} /></li>
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
                  <button
                    onClick={handleLogout}
                    className={`${styles.dropdownItem} ${styles.textDanger} ${styles.dropdownLogout}`}
                  >
                    <i className="bi bi-box-arrow-right" aria-hidden="true"></i> Déconnexion
                  </button>
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