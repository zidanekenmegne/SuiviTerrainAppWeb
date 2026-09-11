import { useState, useEffect } from 'react';
import styles from '../../styles/pages/CartePage.module.css';

/**
 * Panel des points à proximité (escamotable)
 * - Affichage des points triés par distance
 * - Clique sur un point pour centrer la carte
 */
const ProximityPanel = ({ points, userLocation, onPointClick, isUserLocated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortedPoints, setSortedPoints] = useState([]);

  // Calcul de la distance (formule de Haversine)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Trier les points par distance
  useEffect(() => {
    if (!isUserLocated || !userLocation) {
      setSortedPoints(points);
      return;
    }

    const sorted = [...points].map(p => ({
      ...p,
      distance: calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
    })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

    setSortedPoints(sorted);
  }, [points, userLocation, isUserLocated]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return '--';
    return distance < 1 ? (distance * 1000).toFixed(0) + ' m' : distance.toFixed(1) + ' km';
  };

  return (
    <div className={`${styles.proximityPanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.panelHandle} onClick={togglePanel}>
        <span className={styles.handleBar}></span>
        <span className={styles.panelTitle}>
          Points de vente à proximité
          {isUserLocated && sortedPoints.length > 0 && (
            <span className={styles.panelCount}>({sortedPoints.length})</span>
          )}
        </span>
      </div>

      <div className={styles.panelContent}>
        {sortedPoints.length === 0 ? (
          <div className={styles.proximityEmpty}>
            <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem', color: '#ced4da' }}></i>
            Aucun point de vente trouvé
          </div>
        ) : (
          sortedPoints.map((point) => (
            <div
              key={point.id}
              className={styles.proximityItem}
              onClick={() => {
                onPointClick(point.id);
                closePanel();
              }}
            >
              <div className={styles.piInfo}>
                <div className={styles.piNom}>{point.nom}</div>
                <div className={styles.piAdresse}>
                  <i className="bi bi-geo-alt" aria-hidden="true"></i> {point.adresse}
                </div>
              </div>
              <div className={styles.piDistance}>
                {isUserLocated ? formatDistance(point.distance) : '--'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProximityPanel;