import styles from '../../styles/pages/ProfilPage.module.css';

/**
 * Boutons d'action du profil
 */
const ProfilActions = ({ onEdit, onChangePassword, onLogout }) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.cardTitle}>
        <i className="bi bi-gear" aria-hidden="true"></i> Actions
      </div>
      <div className={styles.actionButtons}>
        <button
          className={`${styles.btnAction} ${styles.btnPrimaryRed}`}
          onClick={onEdit}
        >
          <i className="bi bi-pencil" aria-hidden="true"></i> Modifier le profil
        </button>

        <button
          className={`${styles.btnAction} ${styles.btnOutline}`}
          onClick={onChangePassword}
        >
          <i className="bi bi-key" aria-hidden="true"></i> Changer le mot de passe
        </button>

        <button
          className={`${styles.btnAction} ${styles.btnDanger}`}
          onClick={onLogout}
        >
          <i className="bi bi-box-arrow-right" aria-hidden="true"></i> Déconnexion
        </button>
      </div>
    </div>
  );
};

export default ProfilActions;