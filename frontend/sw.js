/**
 * Service Worker - SuiviTerrain
 * Version 1.0
 * 
 * Permet le cache des pages pour une utilisation hors ligne
 */

var CACHE_NAME = 'suiviterrain-v1';
var OFFLINE_URL = 'pages/hors-ligne.html';

var ASSETS = [
    'pages/connexion.html',
    'pages/inscription.html',
    'pages/tableau-bord.html',
    'pages/liste-points.html',
    'pages/planning-visites.html',
    'pages/carte.html',
    'pages/profil.html',
    'pages/gestion-utilisateurs.html',
    'pages/notifications.html',
    'pages/parametres.html',
    'pages/detail-visite.html',
    'pages/nouvelle-visite.html',
    'pages/historique.html',
    'pages/rapports.html',
    'css/style.css',
    'css/components/navbar.css',
    'css/components/footer.css',
    'css/components/modals.css',
    'css/components/toasts.css',
    'js/app.js',
    'js/components/navbar.js',
    'js/components/modals.js',
    'js/components/toasts.js'
];

// ==========================================================
// INSTALLATION
// ==========================================================
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache ouvert - Installation en cours...');
                return cache.addAll(ASSETS);
            })
            .catch(function(err) {
                console.warn('Erreur lors du cache de certaines ressources:', err);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

// ==========================================================
// ACTIVATION
// ==========================================================
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Suppression de l\'ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                return self.clients.claim();
            })
    );
});

// ==========================================================
// INTERCEPTION DES REQUETES
// ==========================================================
self.addEventListener('fetch', function(event) {
    var request = event.request;

    // Ignorer les requetes vers les CDN
    var url = new URL(request.url);
    if (url.hostname.includes('cdn.jsdelivr.net') ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('unpkg.com') ||
        url.hostname.includes('tile.openstreetmap.org')) {
        event.respondWith(
            caches.match(request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(function(networkResponse) {
                            var responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(function(cache) {
                                    cache.put(request, responseClone);
                                });
                            return networkResponse;
                        })
                        .catch(function() {
                            if (request.mode === 'navigate') {
                                return caches.match(OFFLINE_URL);
                            }
                        });
                })
        );
        return;
    }

    // Ressources locales
    event.respondWith(
        caches.match(request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(request)
                    .then(function(networkResponse) {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        var responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(request, responseClone);
                            });
                        return networkResponse;
                    })
                    .catch(function() {
                        if (request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        if (request.destination === 'image') {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0ece6"/><text x="100" y="110" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#6c757d">Image indisponible</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                        return new Response('Ressource indisponible hors ligne', { status: 503 });
                    });
            })
    );
});