import { useState, useRef, useEffect } from 'react';
import styles from '../../styles/pages/UtilisateursPage.module.css';

/**
 * Ligne d'un utilisateur avec menu d'actions
 */
const UtilisateurRow = ({ user, onToggleRole, onToggleActif, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const roleLabel = user.role === 'admin' ? 'Administrateur' : 'Agent';
  const statutLabel = user.actif ? 'Actif' : 'Inactif';

  return (
    <tr>
      {/* Nom */}
      <td>
        <strong>{user.nom}</strong>
        {user.zone_intervention && (
          <div className={styles.zoneInfo}>
            <i className="bi bi-geo-alt" aria-hidden="true"></i> 
            {user.zone_intervention}
          </div>
        )}
      </td>

      {/* Email */}
      <td>
        <a href={`mailto:${user.email}`} className={styles.emailLink}>
          {user.email}
        </a>
      </td>

      {/* Rôle */}
      <td>
        <span className={`${styles.badgeRole} ${styles[user.role]}`}>
          {roleLabel}
        </span>
      </td>

      {/* Statut */}
      <td>
        <span className={`${styles.badgeStatut} ${user.actif ? styles.actif : styles.inactif}`}>
          {statutLabel}
        </span>
      </td>

      {/* Actions */}
      <td style={{ textAlign: 'center' }}>
        <div className={styles.actionsDropdown} ref={menuRef}>
          <button
            className={styles.dropdownToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Actions"
            aria-expanded={menuOpen}
          >
            <i className="bi bi-three-dots-vertical" aria-hidden="true"></i>
          </button>

          {menuOpen && (
            <ul className={styles.dropdownMenu}>
              <li>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleRole(user);
                  }}
                >
                  <i className="bi bi-shield-check" aria-hidden="true"></i>
                  {user.role === 'admin' ? 'Passer en Agent' : 'Passer en Admin'}
                </button>
              </li>
              <li>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleActif(user);
                  }}
                >
                  <i 
                    className={`bi ${user.actif ? 'bi-pause-circle' : 'bi-play-circle'}`} 
                    aria-hidden="true"
                  ></i>
                  {user.actif ? 'Désactiver' : 'Activer'}
                </button>
              </li>
              <li><hr className={styles.dropdownDivider} /></li>
              <li>
                <button
                  className={`${styles.dropdownItem} ${styles.textDanger}`}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(user);
                  }}
                >
                  <i className="bi bi-trash" aria-hidden="true"></i>
                  Supprimer
                </button>
              </li>
            </ul>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UtilisateurRow;