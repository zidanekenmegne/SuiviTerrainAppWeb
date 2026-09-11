import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Composant de la carte Leaflet
 * - Affiche les marqueurs des points de vente
 * - Trace l'itinéraire du jour (ligne rouge pointillée)
 * - Affiche la position de l'utilisateur
 * - Optimisé avec Canvas rendering
 */
const CarteMap = ({ 
  points, 
  itinerary = [], 
  userLocation, 
  showItinerary = true, 
  onMapReady 
}) => {
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const itineraryLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const [map, setMap] = useState(null);

  // ==========================================================
  // INITIALISATION DE LA CARTE
  // ==========================================================
  useEffect(() => {
    if (mapRef.current) return;

    const defaultLat = 4.051056;
    const defaultLng = 9.767869;

    const mapInstance = L.map('map', {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: true,
      fadeAnimation: true,
      preferCanvas: true,          // Optimisation : utilise Canvas
      renderer: L.canvas({ padding: 0.5 }),
      attributionControl: true
    });

    // Fond de carte OpenStreetMap optimisé
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      crossOrigin: true,
      updateWhenIdle: true,        // Optimisation : pas de rechargement pendant le scroll
      keepBuffer: 4,               // Optimisation : garde plus de tuiles en mémoire
      tileSize: 256
    }).addTo(mapInstance);

    // Couches séparées pour optimisation
    markersLayerRef.current = L.layerGroup().addTo(mapInstance);
    itineraryLayerRef.current = L.layerGroup().addTo(mapInstance);

    mapRef.current = mapInstance;
    setMap(mapInstance);
    onMapReady(mapInstance);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ==========================================================
  // MARQUEURS DES POINTS DE VENTE
  // ==========================================================
  useEffect(() => {
    if (!map || !markersLayerRef.current) return;

    // Vider la couche
    markersLayerRef.current.clearLayers();

    points.forEach(point => {
      const isToday = point.isToday;
      
      // Taille différente si c'est un point du jour (contour jaune)
      const size = isToday ? 32 : 28;
      const border = isToday ? '3px solid #ffc107' : '3px solid #ffffff';
      const boxShadow = isToday 
        ? '0 0 0 4px rgba(255, 193, 7, 0.4), 0 2px 8px rgba(0,0,0,0.3)' 
        : '0 2px 8px rgba(0,0,0,0.2)';

      const markerHtml = `
        <div style="
          background-color: ${point.couleur || '#8B0000'};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${border};
          box-shadow: ${boxShadow};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: ${isToday ? '14px' : '12px'};
          font-weight: 700;
          transition: transform 0.2s;
        ">
          <i class="bi bi-shop"></i>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
      });

      const marker = L.marker([point.lat, point.lng], { icon })
        .bindPopup(`
          <div style="font-family: Segoe UI, sans-serif; padding: 0.25rem; max-width: 240px;">
            ${isToday ? '<div style="background:#ffc107;color:#1a1a1a;font-size:0.65rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:12px;display:inline-block;margin-bottom:0.3rem;">📅 AUJOURD\'HUI</div>' : ''}
            <h6 style="font-weight: 700; color: #8B0000; margin-bottom: 0.25rem;">${point.nom}</h6>
            <p style="font-size: 0.85rem; color: #6c757d; margin-bottom: 0.25rem;">
              <i class="bi bi-geo-alt" aria-hidden="true"></i> ${point.adresse}
            </p>
            ${point.telephone ? `
              <p style="font-size: 0.8rem; color: #6c757d; margin-bottom: 0.25rem;">
                <i class="bi bi-telephone" aria-hidden="true"></i> ${point.telephone}
              </p>
            ` : ''}
            <p style="font-size: 0.8rem; color: #1a1a1a; margin-bottom: 0;">
              <span style="background-color: ${point.couleur || '#8B0000'}; color: #fff; padding: 0.1rem 0.6rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                ${point.categorie || 'Non catégorisé'}
              </span>
            </p>
          </div>
        `);

      marker.pointData = point;
      markersLayerRef.current.addLayer(marker);
    });
  }, [map, points]);

  // ==========================================================
  // ITINÉRAIRE DU JOUR (ligne rouge pointillée)
  // ==========================================================
  useEffect(() => {
    if (!map || !itineraryLayerRef.current) return;

    // Vider la couche
    itineraryLayerRef.current.clearLayers();

    if (!showItinerary || itinerary.length < 2) return;

    // Coordonnées de l'itinéraire (déjà triées par heure dans useCarte)
    const coords = itinerary.map(p => [p.lat, p.lng]);

    // Ombre blanche (pour la visibilité sur les tuiles)
    const shadow = L.polyline(coords, {
      color: '#ffffff',
      weight: 8,
      opacity: 0.4,
      lineJoin: 'round',
      lineCap: 'round'
    });

    // Ligne rouge principale (couleur SuiviTerrain)
    const polyline = L.polyline(coords, {
      color: '#8B0000',
      weight: 4,
      opacity: 0.85,
      lineJoin: 'round',
      lineCap: 'round',
      dashArray: '10, 6',       // Pointillés pour distinguer
      smoothFactor: 1.5
    });

    itineraryLayerRef.current.addLayer(shadow);
    itineraryLayerRef.current.addLayer(polyline);

    // Ajout des numéros d'étape
    itinerary.forEach((point, index) => {
      const stepNumber = index + 1;
      const stepIcon = L.divIcon({
        html: `
          <div style="
            background-color: #8B0000;
            color: #ffffff;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            font-family: Segoe UI, sans-serif;
          ">${stepNumber}</div>
        `,
        className: 'step-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Décalage léger pour ne pas cacher le marqueur principal
      const stepMarker = L.marker(
        [point.lat + 0.0003, point.lng + 0.0003],
        { icon: stepIcon, interactive: false }
      );
      itineraryLayerRef.current.addLayer(stepMarker);
    });

    // Ajuster la vue pour englober l'itinéraire
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

  }, [map, itinerary, showItinerary]);

  // ==========================================================
  // POSITION DE L'UTILISATEUR
  // ==========================================================
  useEffect(() => {
    if (!map || !userLocation) return;

    // Nettoyage
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userCircleRef.current) {
      map.removeLayer(userCircleRef.current);
      userCircleRef.current = null;
    }

    const userIconHtml = `
      <div style="
        background-color: #8B0000;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: #ffffff;
          border-radius: 50%;
          margin: 6px auto;
        "></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userIconHtml,
      className: 'user-marker',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    userMarkerRef.current = L.marker(
      [userLocation.lat, userLocation.lng],
      { icon: userIcon }
    )
      .addTo(map)
      .bindPopup('📍 Vous êtes ici');

    // Cercle de précision
    userCircleRef.current = L.circle(
      [userLocation.lat, userLocation.lng],
      {
        radius: 50,
        color: '#8B0000',
        fillColor: '#8B0000',
        fillOpacity: 0.1,
        weight: 1
      }
    ).addTo(map);

    map.setView([userLocation.lat, userLocation.lng], 15);
    userMarkerRef.current.openPopup();

    return () => {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        map.removeLayer(userCircleRef.current);
        userCircleRef.current = null;
      }
    };
  }, [map, userLocation]);

  return <div id="map" style={{ width: '100%', height: '100%', minHeight: '400px' }} />;
};

export default CarteMap;