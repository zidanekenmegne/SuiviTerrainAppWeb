import styles from '../../styles/pages/ParametresPage.module.css';

/**
 * Toggle switch pour les paramètres
 */
const ParametresToggle = ({ checked, onChange }) => {
  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.slider} aria-hidden="true"></span>
    </label>
  );
};

export default ParametresToggle;