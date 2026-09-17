import styles from '../../styles/pages/VisiteDetailPage.module.css';

/**
 * Carte d'informations de la visite
 */
const VisiteInfoCard = ({ visite }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Non renseignée';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatutLabel = (statut) => {
    const labels = {
      'realisee': 'Réalisée',
      'planifiee': 'Planifiée',
      'retard': 'En retard',
      'encours': 'En cours'
    };
    return labels[statut] || statut;
  };

  const agentsNames = visite.agents?.map(a => a.nom).join(', ') || 'Non assigné';

  return (
    <div className={styles.infoCard}>
      <div className={styles.cardTitle}>
        <i className="bi bi-info-circle" aria-hidden="true"></i> Informations
      </div>

      <div className={styles.infoGrid}>
        {/* Titre */}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Titre</span>
          <span className={styles.infoValue}>{visite.titre}</span>
        </div>

        {/* Statut */}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Statut</span>
          <span className={styles.infoValue}>
            <span className={`${styles.statut} ${styles[visite.statut]}`}>
              {getStatutLabel(visite.statut)}
            </span>
          </span>
        </div>

        {/* Date prévue */}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Date prévue</span>
          <span className={styles.infoValue}>{formatDate(visite.datePrevue)}</span>
        </div>

        {/* Heure prévue */}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Heure prévue</span>
          <span className={styles.infoValue}>{visite.heurePrevue}</span>
        </div>

        {/* Date réelle */}
        {visite.dateReelle && (
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Date réelle</span>
            <span className={styles.infoValue}>
              {formatDate(visite.dateReelle)} {visite.heureReelle && `à ${visite.heureReelle}`}
            </span>
          </div>
        )}

        {/* Agent */}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Agent responsable</span>
          <span className={styles.infoValue}>{agentsNames}</span>
        </div>

        {/* Point de vente */}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Point de vente</span>
          <span className={styles.infoValue}>
            {visite.pointVente?.nom || 'Non renseigné'}
          </span>
        </div>

        {/* Adresse */}
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Adresse</span>
          <span className={styles.infoValue}>
            {visite.pointVente?.adresse || 'Non renseignée'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VisiteInfoCard;