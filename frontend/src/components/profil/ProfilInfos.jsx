import styles from '../../styles/pages/ProfilPage.module.css';

/**
 * Informations personnelles de l'utilisateur
 */
const ProfilInfos = ({ profil }) => {
  const roleLabel = profil?.role === 'admin' ? 'Administrateur' : 'Agent';

  return (
    <div className={styles.infoCard}>
      <div className={styles.cardTitle}>
        <i className="bi bi-person" aria-hidden="true"></i> Informations personnelles
      </div>

      {/* Nom */}
      <div className={styles.infoItem}>
        <span className={styles.infoIcon}>
          <i className="bi bi-person" aria-hidden="true"></i>
        </span>
        <span className={styles.infoLabel}>Nom complet</span>
        <span className={styles.infoValue}>{profil?.nom || 'Non renseigné'}</span>
      </div>

      {/* Email */}
      <div className={styles.infoItem}>
        <span className={styles.infoIcon}>
          <i className="bi bi-envelope" aria-hidden="true"></i>
        </span>
        <span className={styles.infoLabel}>Email</span>
        <span className={styles.infoValue}>{profil?.email || 'Non renseigné'}</span>
      </div>

      {/* Téléphone */}
      <div className={styles.infoItem}>
        <span className={styles.infoIcon}>
          <i className="bi bi-phone" aria-hidden="true"></i>
        </span>
        <span className={styles.infoLabel}>Téléphone</span>
        <span className={styles.infoValue}>
          {profil?.telephone || 'Non renseigné'}
        </span>
      </div>

      {/* Rôle */}
      <div className={styles.infoItem}>
        <span className={styles.infoIcon}>
          <i className="bi bi-briefcase" aria-hidden="true"></i>
        </span>
        <span className={styles.infoLabel}>Rôle</span>
        <span className={styles.infoValue}>{roleLabel}</span>
      </div>

      {/* Zone d'intervention */}
      <div className={styles.infoItem}>
        <span className={styles.infoIcon}>
          <i className="bi bi-geo-alt" aria-hidden="true"></i>
        </span>
        <span className={styles.infoLabel}>Zone</span>
        <span className={styles.infoValue}>
          {profil?.zone_intervention || 'Non renseignée'}
        </span>
      </div>

      {/* Date d'inscription */}
      <div className={styles.infoItem}>
        <span className={styles.infoIcon}>
          <i className="bi bi-calendar-check" aria-hidden="true"></i>
        </span>
        <span className={styles.infoLabel}>Inscrit le</span>
        <span className={styles.infoValue}>
          {profil?.date_creation 
            ? new Date(profil.date_creation).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : 'Non renseigné'
          }
        </span>
      </div>
    </div>
  );
};

export default ProfilInfos;