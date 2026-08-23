/**
 * Modals - Gestion des popups
 * Version 1.0
 * 
 * Ce fichier contient les fonctions partagees
 * pour l'ouverture et la fermeture des modales
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. INITIALISATION DES MODALES BOOTSTRAP
    // ==========================================================
    // Les modales Bootstrap sont initialisees automatiquement
    // via les attributs data-bs-toggle et data-bs-target
    
    // Fonction d'ouverture de modale par ID
    window.openModal = function(modalId) {
        var modalElement = document.getElementById(modalId);
        if (modalElement) {
            var modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    };
    
    // Fonction de fermeture de modale par ID
    window.closeModal = function(modalId) {
        var modalElement = document.getElementById(modalId);
        if (modalElement) {
            var modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    };

    // ==========================================================
    // 2. FERMETURE DES MODALES PAR CLIC EXTERIEUR
    // ==========================================================
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('hidden.bs.modal', function() {
            // Reinitialiser les champs si necessaire
            var form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
            // Supprimer les classes d'erreur
            modal.querySelectorAll('.is-invalid').forEach(function(el) {
                el.classList.remove('is-invalid');
            });
        });
    });

    console.log('Modals - Gestion des popups initialisee');
});