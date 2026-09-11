import { useState } from 'react';
import CarteMap from '../components/carte/CarteMap';
import CarteSearch from '../components/carte/CarteSearch';
import ProximityPanel from '../components/carte/ProximityPanel';
import GeoButton from '../components/carte/GeoButton';
import CarteLegend from '../components/carte/CarteLegend';
import { useCarte } from '../hooks/useCarte';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/pages/CartePage.module.css';

/**
 * Page Carte des points de vente
 * - Utilise le hook useCarte pour la logique
 * - Affiche les points sur une carte Leaflet
 * - Filtrage par catégorie (légende)
 * - Itinéraire du jour (ligne rouge)
 * - Recherche multi-mots
 */
const CartePage = () => {
  // ==========================================================
  // HOOK PERSONNALISÉ (toute la logique)
  // ==========================================================
  const {
    points,
    categories,
    itinerary,
    searchTerm,
    selectedCategory,
    loading,
    error,
    stats,
    handleSearchChange,
    handleCategoryChange
  } = useCarte();

  // ==========================================================
  // ÉTATS LOCAUX (UI uniquement)
  // ==========================================================
  const [userLocation, setUserLocation] = useState(null);
  const [isUserLocated, setIsUserLocated] = useState(false);
  const [mapRef, setMapRef] = useState(null);
  const [showItinerary, setShowItinerary] = useState(true);

  const { showToast } = useToast();

  // ==========================================================
  // GESTIONNAIRES
  // ==========================================================
  
  /**
   * Callback quand la géolocalisation est trouvée
   */
  const handleUserLocation = (lat, lng) => {
    setUserLocation({ lat, lng });
    setIsUserLocated(true);
  };

  /**
   * Callback quand l'utilisateur clique sur un point dans la liste
   */
  const handlePointClick = (id) => {
    const point = points.find(p => p.id === id);
    if (point && mapRef) {
      mapRef.setView([point.lat, point.lng], 16);
      // Ouvrir le popup du marqueur correspondant
      const marker = mapRef._markers?.find(m => m.pointData?.id === id);
      if (marker) marker.openPopup();
    }
  };

  /**
   * Basculer l'affichage de l'itinéraire
   */
  const toggleItinerary = () => {
    setShowItinerary(!showItinerary);
  };

  // ==========================================================
  // RENDU : CHARGEMENT
  // ==========================================================
  if (loading) {
    return (
      <div className={styles.carteContainer}>
        <div className={styles.loaderContainer}>
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : ERREUR
  // ==========================================================
  if (error) {
    return (
      <div className={styles.carteContainer}>
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            <strong className="ms-2">Erreur :</strong> {error}
            <button
              className="btn btn-outline-danger btn-sm ms-3"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise" aria-hidden="true"></i> Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDU : SUCCÈS
  // ==========================================================
  return (
    <div className={styles.carteContainer}>

      {/* ========== EN-TÊTE PC ========== */}
      <div className={styles.headerPC}>
        <h1>
          <i className="bi bi-map" aria-hidden="true"></i> Carte des points de vente
        </h1>
        <div className={styles.headerActions}>
          {/* Bouton Itinéraire */}
          <button
            className={`${styles.itineraryToggle} ${showItinerary ? styles.active : ''}`}
            onClick={toggleItinerary}
            title="Afficher/Masquer l'itinéraire du jour"
            disabled={itinerary.length === 0}
          >
            <i className="bi bi-signpost-split" aria-hidden="true"></i>
            Itinéraire
            {itinerary.length > 0 && (
              <span className={styles.itineraryCount}>({itinerary.length})</span>
            )}
          </button>

          {/* Barre de recherche PC */}
          <CarteSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            variant="pc"
          />
        </div>
      </div>

      {/* ========== BARRE DE RECHERCHE MOBILE ========== */}
      <div className={styles.searchBarMobile}>
        <CarteSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          variant="mobile"
        />
      </div>

      {/* ========== CONTENEUR DE LA CARTE ========== */}
      <div className={styles.mapContainer}>
        <CarteMap
          points={points}
          itinerary={itinerary}
          userLocation={userLocation}
          showItinerary={showItinerary}
          onMapReady={setMapRef}
        />

        {/* Légende des catégories */}
        <CarteLegend
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          stats={stats}
        />

        {/* Bouton de géolocalisation */}
        <GeoButton onLocationFound={handleUserLocation} />
      </div>

      {/* ========== PANEL DES POINTS À PROXIMITÉ ========== */}
      <ProximityPanel
        points={points}
        itinerary={itinerary}
        userLocation={userLocation}
        onPointClick={handlePointClick}
        isUserLocated={isUserLocated}
      />

    </div>
  );
};

export default CartePage;