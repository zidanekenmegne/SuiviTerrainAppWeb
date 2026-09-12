import styles from '../../styles/pages/UtilisateursPage.module.css';

/**
 * Onglets de la page Utilisateurs
 */
const UtilisateurTabs = ({ activeTab, onTabChange, stats }) => {
  return (
    <div className={styles.tabsContainer}>
      <button
        className={`${styles.tabBtn} ${activeTab === 'liste' ? styles.active : ''}`}
        onClick={() => onTabChange('liste')}
      >
        <i className="bi bi-list-ul" aria-hidden="true"></i> 
        Utilisateurs
        {stats && <span className={styles.tabCount}>({stats.total})</span>}
      </button>
      <button
        className={`${styles.tabBtn} ${activeTab === 'ajout' ? styles.active : ''}`}
        onClick={() => onTabChange('ajout')}
      >
        <i className="bi bi-person-plus" aria-hidden="true"></i> 
        Ajouter un utilisateur
      </button>
    </div>
  );
};

export default UtilisateurTabs;