/**
 * SuiviTerrain - Application principale
 * Version 1.0
 * 
 * Ce fichier contient l'initialisation globale :
 * - Service Worker
 * - Gestion des toasts
 * - Fonctions partagees entre toutes les pages
 * - Chargement des donnees
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. SERVICE WORKER (cache hors ligne)
    // ==========================================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker enregistre avec succes');
            })
            .catch(function(error) {
                console.warn('Erreur lors de l\'enregistrement du Service Worker:', error);
            });
    }

    // ==========================================================
    // 2. FONCTION TOAST (notification simple)
    // ==========================================================
    window.showToast = function(message, type) {
        type = type || 'info';
        
        var toast = document.querySelector('.custom-toast');
        if (toast) {
            toast.remove();
        }
        
        toast = document.createElement('div');
        toast.className = 'custom-toast ' + type;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.classList.add('visible');
        }, 50);
        
        setTimeout(function() {
            toast.classList.remove('visible');
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, 3000);
    };

    // ==========================================================
    // 3. FONCTION DE CHARGEMENT DES DONNEES
    // ==========================================================
    window.chargerDonnees = function(url, callback) {
        fetch(url)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Erreur reseau : ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                callback(null, data);
            })
            .catch(function(error) {
                callback(error, null);
            });
    };

    console.log('SuiviTerrain - Application initialisee avec succes');
});