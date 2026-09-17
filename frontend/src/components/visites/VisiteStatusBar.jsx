import { useState, useRef, useEffect } from 'react';
import styles from '../../styles/pages/VisiteDetailPage.module.css';

/**
 * Barre de statut (mobile uniquement)
 * Permet de changer rapidement le statut de la visite
 */
const VisiteStatusBar = ({ currentStatut, onStatutChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Fermer au clic extérieur
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

  const statuts = [
    { key: 'planifiee', label: 'Planifiée' },
    { key: 'encours', label: 'En cours' },
    { key: 'realisee', label: 'Réalisée' },
    { key: 'retard', label: 'En retard' }
  ];

  return (
    <div className={styles.statusBar} ref={menuRef}>
      <div className={styles.statusCurrent}>
        <span className={styles.statusCurrentLabel}>Statut actuel :</span>
        <span className={`${styles.statut} ${styles[currentStatut]}`}>
          {statuts.find(s => s.key === currentStatut)?.label || currentStatut}
        </span>
      </div>

      <button
        className={styles.statusDropdownBtn}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        Mettre à jour le statut
        <i className="bi bi-chevron-down" aria-hidden="true"></i>
      </button>

      {menuOpen && (
        <ul className={styles.statusDropdownMenu}>
          {statuts.map(s => (
            <li key={s.key}>
              <button
                className={`${styles.statusDropdownItem} ${currentStatut === s.key ? styles.active : ''}`}
                onClick={() => {
                  setMenuOpen(false);
                  if (s.key !== currentStatut) {
                    onStatutChange(s.key);
                  }
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VisiteStatusBar;