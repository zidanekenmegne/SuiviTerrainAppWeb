// ==========================================================
// CARTE - SuiviTerrain
// Version 1.0
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. MENU HAMBURGER (mobile)
    // ==========================================================
    var menuBtn = document.getElementById('menuHamburger');
    var mobileMenu = document.getElementById('mobileMenu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('open');
            var icon = menuBtn.querySelector('i');
            if (mobileMenu.classList.contains('open')) {
                icon.className = 'bi bi-x-lg';
            } else {
                icon.className = 'bi bi-list';
            }
        });
    }

    // ==========================================================
    // 2. NOTIFICATIONS (PC + Mobile)
    // ==========================================================
    var notifBtnPC = document.getElementById('notifBtnPC');
    var notifBtnMobile = document.getElementById('notifBtnMobile');

    function redirigerNotifications() {
        window.location.href = 'notifications.html';
    }

    if (notifBtnPC) {
        notifBtnPC.addEventListener('click', redirigerNotifications);
    }
    if (notifBtnMobile) {
        notifBtnMobile.addEventListener('click', redirigerNotifications);
    }

    // ==========================================================
    // 3. BOUTON D'ACTION CONTEXTUEL (mobile) - ACTIF
    // ==========================================================
    var btnAction = document.getElementById('btnActionMobile');

    function updateActionButton() {
        // Page Carte : Ajouter un point de vente
        btnAction.style.opacity = '1';
        btnAction.style.cursor = 'pointer';
        btnAction.style.pointerEvents = 'auto';
        btnAction.setAttribute('aria-label', 'Ajouter un point de vente');

        // Supprimer les anciens ecouteurs
        btnAction.replaceWith(btnAction.cloneNode(true));
        var newBtn = document.getElementById('btnActionMobile');

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Rediriger vers la page Points de vente
            window.location.href = 'points-vente.html';
        });
    }

    // ==========================================================
    // 4. DONNEES DES POINTS DE VENTE
    // ==========================================================
    var pointsData = [
        { id: 1, nom: 'Magasin A - Centre-ville', adresse: '123 Rue de Paris, Douala',
            lat: 4.051056, lng: 9.767869, categorie: 'Alimentation', couleur: '#28a745' },
        { id: 2, nom: 'Client B - Bonamoussadi', adresse: '45 Avenue de l\'Independance, Douala',
            lat: 4.058300, lng: 9.738600, categorie: 'Services', couleur: '#17a2b8' },
        { id: 3, nom: 'Magasin C - Akwa', adresse: '78 Rue Joss, Douala',
            lat: 4.045600, lng: 9.692300, categorie: 'Vetement', couleur: '#ffc107' },
        { id: 4, nom: 'Client D - Bepanda', adresse: '12 Avenue de la Gare, Douala',
            lat: 4.062100, lng: 9.713500, categorie: 'Alimentation', couleur: '#28a745' },
        { id: 5, nom: 'Magasin E - Total Logbaba', adresse: '234 Boulevard de l\'Ocean, Douala',
            lat: 4.040200, lng: 9.727800, categorie: 'Electronique', couleur: '#dc3545' },
        { id: 6, nom: 'Client F - Makape', adresse: '67 Rue des Cocotiers, Douala',
            lat: 4.075400, lng: 9.750100, categorie: 'Services', couleur: '#17a2b8' },
        { id: 7, nom: 'Magasin G - Bonapriso', adresse: '89 Avenue Charles de Gaulle, Douala',
            lat: 4.068900, lng: 9.771200, categorie: 'Alimentation', couleur: '#28a745' },
        { id: 8, nom: 'Client H - Makepe', adresse: '56 Rue des Palmiers, Douala',
            lat: 4.083000, lng: 9.729500, categorie: 'Services', couleur: '#17a2b8' },
        { id: 9, nom: 'Magasin I - Kotto', adresse: '123 Boulevard de la Liberte, Douala',
            lat: 4.052800, lng: 9.688400, categorie: 'Electronique', couleur: '#dc3545' },
        { id: 10, nom: 'Client J - Mbangue', adresse: '45 Rue des Ecoles, Douala',
            lat: 4.061700, lng: 9.698900, categorie: 'Vetement', couleur: '#ffc107' }
    ];

    // ==========================================================
    // 5. INITIALISATION DE LA CARTE
    // ==========================================================
    var map = L.map('map').setView([4.051056, 9.767869], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // ==========================================================
    // 6. VARIABLES GLOBALES
    // ==========================================================
    var markers = [];
    var userLat = null;
    var userLng = null;
    var userMarker = null;
    var isUserLocated = false;

    // ==========================================================
    // 7. FONCTION DE CALCUL DE DISTANCE (Haversine)
    // ==========================================================
    function haversineDistance(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ==========================================================
    // 8. AJOUT DES MARQUEURS
    // ==========================================================
    function addMarkers(points) {
        markers.forEach(function(m) { map.removeLayer(m); });
        markers = [];

        points.forEach(function(point) {
            var markerHtml =
                '<div style="background-color: ' + point.couleur + '; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 10px; font-weight: 700;"><i class="bi bi-shop" style="font-size: 12px;"></i></div>';

            var icon = L.divIcon({
                html: markerHtml,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            });

            var marker = L.marker([point.lat, point.lng], { icon: icon })
                .addTo(map)
                .bindPopup(
                    '<div style="font-family: Segoe UI, sans-serif; padding: 0.25rem;">' +
                    '<h6 style="font-weight: 700; color: #8B0000; margin-bottom: 0.25rem;">' + point.nom + '</h6>' +
                    '<p style="font-size: 0.85rem; color: #6c757d; margin-bottom: 0.25rem;"><i class="bi bi-geo-alt" aria-hidden="true"></i> ' +
                    point.adresse + '</p>' +
                    '<p style="font-size: 0.8rem; color: #1a1a1a; margin-bottom: 0;"><span style="background-color: ' +
                    point.couleur + '; color: #fff; padding: 0.1rem 0.6rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">' +
                    point.categorie + '</span></p>' +
                    '<a href="points-vente.html" style="font-size: 0.75rem; color: #8B0000; font-weight: 600; text-decoration: none; display: inline-block; margin-top: 0.3rem;">Voir les details <i class="bi bi-arrow-right" aria-hidden="true"></i></a>' +
                    '</div>'
                );

            marker.pointData = point;
            marker.on('click', function() {
                marker.openPopup();
            });

            markers.push(marker);
        });
    }

    // ==========================================================
    // 9. FILTRE PAR RECHERCHE
    // ==========================================================
    function filterPoints(searchTerm) {
        var term = searchTerm.toLowerCase().trim();
        var filtered = pointsData;

        if (term) {
            filtered = pointsData.filter(function(p) {
                return p.nom.toLowerCase().includes(term) ||
                    p.adresse.toLowerCase().includes(term);
            });
        }

        addMarkers(filtered);
        updateProximityList(filtered);
        return filtered;
    }

    // ==========================================================
    // 10. BARRES DE RECHERCHE (PC + Mobile)
    // ==========================================================
    var searchInputPC = document.getElementById('searchPointsPC');
    var searchInputMobile = document.getElementById('searchPointsMobile');

    function handleSearch(e) {
        var term = e.target.value;
        filterPoints(term);
    }

    if (searchInputPC) {
        searchInputPC.addEventListener('input', handleSearch);
    }
    if (searchInputMobile) {
        searchInputMobile.addEventListener('input', handleSearch);
    }

    // ==========================================================
    // 11. LISTE "POINTS DE VENTE A PROXIMITE"
    // ==========================================================
    function updateProximityList(points) {
        var container = document.getElementById('proximityList');

        if (!points || points.length === 0) {
            container.innerHTML = '<div class="proximity-empty">Aucun point de vente trouve</div>';
            return;
        }

        var pointsWithDistance = points.map(function(p) {
            var distance = null;
            if (userLat && userLng) {
                distance = haversineDistance(userLat, userLng, p.lat, p.lng);
            }
            return { id: p.id, nom: p.nom, adresse: p.adresse, lat: p.lat, lng: p.lng, distance: distance };
        });

        if (userLat && userLng) {
            pointsWithDistance.sort(function(a, b) {
                return (a.distance || Infinity) - (b.distance || Infinity);
            });
        }

        var html = '';
        pointsWithDistance.forEach(function(p) {
            var distanceText = p.distance !== null ?
                (p.distance < 1 ? (p.distance * 1000).toFixed(0) + ' m' : p.distance.toFixed(1) + ' km') :
                '--';
            html +=
                '<div class="proximity-item" data-lat="' + p.lat + '" data-lng="' + p.lng + '" data-id="' + p.id + '">' +
                '<div class="pi-info">' +
                '<div class="pi-nom">' + p.nom + '</div>' +
                '<div class="pi-adresse"><i class="bi bi-geo-alt" aria-hidden="true"></i> ' + p.adresse + '</div>' +
                '</div>' +
                '<div class="pi-distance">' + distanceText + '</div>' +
                '</div>';
        });

        container.innerHTML = html;

        container.querySelectorAll('.proximity-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var lat = parseFloat(this.dataset.lat);
                var lng = parseFloat(this.dataset.lng);
                var id = parseInt(this.dataset.id);

                map.setView([lat, lng], 16);

                var marker = markers.find(function(m) {
                    return m.pointData && m.pointData.id === id;
                });
                if (marker) {
                    marker.openPopup();
                }

                closePanel();
            });
        });
    }

    // ==========================================================
    // 12. PANEL ESCAMOTABLE
    // ==========================================================
    var panel = document.getElementById('proximityPanel');
    var panelHandle = document.getElementById('panelHandle');
    var isPanelOpen = false;

    function togglePanel() {
        isPanelOpen = !isPanelOpen;
        panel.classList.toggle('open', isPanelOpen);
    }

    function closePanel() {
        isPanelOpen = false;
        panel.classList.remove('open');
    }

    if (panelHandle) {
        panelHandle.addEventListener('click', function(e) {
            e.stopPropagation();
            togglePanel();
        });
    }

    document.addEventListener('click', function(e) {
        if (isPanelOpen && !panel.contains(e.target) && e.target.id !== 'panelHandle' && !e.target.closest('.panel-handle')) {
            closePanel();
        }
    });

    // ==========================================================
    // 13. GEOLOCALISATION AVEC BOUTON "MA POSITION"
    // ==========================================================
    var geoBtn = document.getElementById('geoBtn');

    function centerOnUser() {
        if (userLat && userLng) {
            map.setView([userLat, userLng], 15);
            if (userMarker) {
                userMarker.openPopup();
            }
            updateProximityList(pointsData);
            return;
        }

        if (navigator.geolocation) {
            geoBtn.classList.add('loading');

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    userLat = position.coords.latitude;
                    userLng = position.coords.longitude;
                    isUserLocated = true;

                    geoBtn.classList.remove('loading');

                    if (userMarker) {
                        map.removeLayer(userMarker);
                    }

                    var userIconHtml =
                        '<div style="background-color: #8B0000; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; margin: 6px auto;"></div></div>';

                    var userIcon = L.divIcon({
                        html: userIconHtml,
                        className: 'user-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    userMarker = L.marker([userLat, userLng], { icon: userIcon })
                        .addTo(map)
                        .bindPopup('Vous etes ici');

                    map.setView([userLat, userLng], 15);
                    userMarker.openPopup();

                    updateProximityList(pointsData);

                    console.log('Geolocalisation reussie');
                },
                function() {
                    geoBtn.classList.remove('loading');
                    alert('Impossible d\'obtenir votre position. Veuillez activer la geolocalisation.');
                    console.log('Geolocalisation refusee');
                }
            );
        } else {
            alert('La geolocalisation n\'est pas supportee par votre navigateur.');
        }
    }

    if (geoBtn) {
        geoBtn.addEventListener('click', centerOnUser);
    }

    // ==========================================================
    // 14. GEOLOCALISATION AUTOMATIQUE AU CHARGEMENT
    // ==========================================================
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLat = position.coords.latitude;
                userLng = position.coords.longitude;
                isUserLocated = true;

                var userIconHtml =
                    '<div style="background-color: #8B0000; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; margin: 6px auto;"></div></div>';

                var userIcon = L.divIcon({
                    html: userIconHtml,
                    className: 'user-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                userMarker = L.marker([userLat, userLng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('Vous etes ici');

                updateProximityList(pointsData);

                setTimeout(function() {
                    map.setView([userLat, userLng], 14);
                }, 500);

                console.log('Geolocalisation automatique reussie');
            },
            function() {
                console.log('Geolocalisation automatique non activee');
                map.setView([4.051056, 9.767869], 13);
            }
        );
    }

    // ==========================================================
    // 15. TOAST
    // ==========================================================
    function showToast(message) {
        var toast = document.createElement('div');
        toast.style.cssText =
            'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#ffffff;padding:0.75rem 1.5rem;border-radius:12px;font-family:Segoe UI,sans-serif;font-size:0.85rem;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:9999;opacity:0;transition:opacity 0.3s ease;max-width:90%;text-align:center;';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function() { toast.style.opacity = '1'; }, 50);
        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 2500);
    }

    // ==========================================================
    // 16. INITIALISATION
    // ==========================================================
    addMarkers(pointsData);
    updateProximityList(pointsData);
    updateActionButton();

    console.log('Page Carte chargee avec ' + pointsData.length + ' points de vente');
});