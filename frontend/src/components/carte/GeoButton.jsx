import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import styles from '../../styles/pages/CartePage.module.css';

/**
 * Bouton de géolocalisation
 * - Récupère la position de l'utilisateur
 * - Centrage automatique sur la position
 */
const GeoButton = ({ onLocationFound }) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      showToast('La géolocalisation n\'est pas supportée par votre navigateur', 'error');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationFound(latitude, longitude);
        setLoading(false);
        showToast('Position trouvée !');
      },
      (error) => {
        setLoading(false);
        let message = 'Impossible d\'obtenir votre position.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Veuillez activer la géolocalisation dans les paramètres de votre navigateur.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position non disponible. Vérifiez votre connexion GPS.';
            break;
          case error.TIMEOUT:
            message = 'Délai d\'attente dépassé. Réessayez.';
            break;
          default:
            message = 'Erreur de géolocalisation.';
        }
        
        showToast(message, 'error');
        console.error('Erreur géolocalisation:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <button
      className={`${styles.geoBtn} ${loading ? styles.loading : ''}`}
      onClick={handleGeolocation}
      disabled={loading}
      aria-label="Voir ma position"
    >
      <i className="bi bi-crosshair" aria-hidden="true"></i>
      <span className={styles.btnText}>Ma position</span>
      <span className={styles.spinner}></span>
    </button>
  );
};

export default GeoButton;