import { Link } from 'react-router-dom';
import styles from '../styles/pages/ErrorPage.module.css';

/**
 * Page 404 personnalisée (React)
 */
const NotFoundPage = () => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <div className={styles.brand}>
          <span className={styles.brandSuivi}>Suivi</span>
          <span className={styles.brandTerrain}>Terrain</span>
        </div>

        <div className={styles.errorIcon}>
          <i className="bi bi-compass" aria-hidden="true"></i>
        </div>

        <div className={styles.errorCode}>404</div>
        <h1 className={styles.errorTitle}>Page introuvable</h1>
        <p className={styles.errorMessage}>
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <Link to="/" className={styles.btnHome}>
          <i className="bi bi-house-door" aria-hidden="true"></i>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;