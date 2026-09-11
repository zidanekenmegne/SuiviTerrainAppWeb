/**
 * SuiviTerrain - Application principale
 * Version 1.0
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. SERVICE WORKER (optionnel)
    // ==========================================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('Service Worker enregistre');
            })
            .catch(function(error) {
                console.log('Service Worker non disponible');
            });
    }

    // ==========================================================
    // 2. FONCTION TOAST (notification)
    // ==========================================================
    window.showToast = function(message, type) {
        type = type || 'info';
        
        var oldToast = document.querySelector('.custom-toast');
        if (oldToast) {
            oldToast.remove();
        }
        
        var toast = document.createElement('div');
        toast.className = 'custom-toast ' + type;
        toast.textContent = message;
        toast.style.cssText = [
            'position: fixed;',
            'bottom: 80px;',
            'left: 50%;',
            'transform: translateX(-50%);',
            'background: #1a1a1a;',
            'color: #ffffff;',
            'padding: 0.75rem 1.5rem;',
            'border-radius: 12px;',
            'font-family: Segoe UI, sans-serif;',
            'font-size: 0.85rem;',
            'font-weight: 600;',
            'box-shadow: 0 4px 20px rgba(0,0,0,0.2);',
            'z-index: 9999;',
            'opacity: 0;',
            'transition: opacity 0.3s ease;',
            'max-width: 90%;',
            'text-align: center;'
        ].join(' ');
        
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.style.opacity = '1';
        }, 50);
        
        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    };

    console.log('SuiviTerrain - Application initialisee');
});