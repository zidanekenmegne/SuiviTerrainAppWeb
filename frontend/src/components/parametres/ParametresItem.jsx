import styles from '../../styles/pages/ParametresPage.module.css';

/**
 * Item de paramètre
 */
const ParametresItem = ({ 
  icon, 
  iconColor = 'rouge', 
  title, 
  subtitle, 
  value,
  right,
  danger = false,
  onClick 
}) => {
  return (
    <div 
      className={`${styles.settingsItem} ${danger ? styles.danger : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && e.key === 'Enter') onClick();
      }}
    >
      <div className={styles.itemLeft}>
        <div className={`${styles.itemIcon} ${styles[iconColor]}`}>
          <i className={icon} aria-hidden="true"></i>
        </div>
        <div className={styles.itemText}>
          <div className={styles.itemTitle}>{title}</div>
          {subtitle && <div className={styles.itemSubtitle}>{subtitle}</div>}
        </div>
      </div>

      <div className={styles.itemRight}>
        {right ? (
          right
        ) : (
          <>
            {value && <span className={styles.itemValue}>{value}</span>}
            <span className={styles.itemArrow}>
              <i className="bi bi-chevron-right" aria-hidden="true"></i>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ParametresItem;