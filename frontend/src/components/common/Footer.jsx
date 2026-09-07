import styles from '../../styles/components/Footer.module.css';

/**
 * Footer PC
 * - Affiché uniquement sur les écrans > 768px
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footerPC} role="contentinfo">
      <p>&copy; {currentYear} SuiviTerrain - Tous droits réservés</p>
    </footer>
  );
};

export default Footer;