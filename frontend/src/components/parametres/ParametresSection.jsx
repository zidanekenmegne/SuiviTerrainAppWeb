import styles from '../../styles/pages/ParametresPage.module.css';

/**
 * Section de paramètres (Compte, Préférences, Autres)
 */
const ParametresSection = ({ title, icon, children }) => {
  return (
    <div className={styles.settingsSection}>
      <div className={styles.sectionTitle}>
        <i className={icon} aria-hidden="true"></i> {title}
      </div>
      {children}
    </div>
  );
};

export default ParametresSection;