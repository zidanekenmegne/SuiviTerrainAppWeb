/**
 * Toasts - Gestion des notifications
 * Version 1.0
 * 
 * Ce fichier contient les fonctions pour afficher
 * des notifications temporaires (toasts)
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. FONCTION D'AFFICHAGE DE TOAST
    // ==========================================================
    window.showToast = function(message, type) {
        // Cette fonction est deja definie dans app.js
        // On la surcharge avec des options supplementaires
        var toast = document.querySelector('.custom-toast');
        if (toast) {
            toast.remove();
        }
        
        toast = document.createElement('div');
        toast.className = 'custom-toast ' + (type || 'info');
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
    // 2. TOAST SUCCES
    // ==========================================================
    window.showSuccessToast = function(message) {
        window.showToast(message, 'success');
    };

    // ==========================================================
    // 3. TOAST ERREUR
    // ==========================================================
    window.showErrorToast = function(message) {
        window.showToast(message, 'error');
    };

    // ==========================================================
    // 4. TOAST INFORMATION
    // ==========================================================
    window.showInfoToast = function(message) {
        window.showToast(message, 'info');
    };

    console.log('Toasts - Gestion des notifications initialisee');
});