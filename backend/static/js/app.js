// ==========================================================
// SUIVITERRAIN - Application JavaScript
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ SuiviTerrain JS chargé');

    // ==========================================================
    // MESSAGES FLASH AUTO-FERMANT (5 secondes)
    // ==========================================================
    const alerts = document.querySelectorAll('.flash-messages .alert');
    alerts.forEach(function(alert) {
        // Auto-fermeture après 5 secondes
        setTimeout(function() {
            if (alert && alert.parentNode) {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(function() {
                    if (alert && alert.parentNode) {
                        alert.remove();
                    }
                }, 500);
            }
        }, 5000);

        // Fermeture manuelle
        const closeBtn = alert.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                alert.style.transition = 'opacity 0.3s ease';
                alert.style.opacity = '0';
                setTimeout(function() {
                    if (alert && alert.parentNode) {
                        alert.remove();
                    }
                }, 300);
            });
        }
    });
});