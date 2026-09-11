// ==========================================================
// TABLEAU DE BORD - SuiviTerrain
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // DATE DYNAMIQUE
    // ==========================================================
    var dateSpans = document.querySelectorAll('#date-actuelle, #date-actuelle-mobile');
    dateSpans.forEach(function(span) {
        if (span) {
            var aujourdhui = new Date();
            var options = { day: 'numeric', month: 'long', year: 'numeric' };
            span.textContent = aujourdhui.toLocaleDateString('fr-FR', options);
        }
    });

    // ==========================================================
    // MENU HAMBURGER (mobile)
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
    // NOTIFICATIONS (PC + Mobile)
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
    // BOUTON NOUVELLE VISITE (PC)
    // ==========================================================
    var btnNouvelleVisite = document.getElementById('btnNouvelleVisite');
    if (btnNouvelleVisite) {
        btnNouvelleVisite.addEventListener('click', function() {
            window.location.href = 'nouvelle-visite.html';
        });
    }

    // ==========================================================
    // BOUTON D'ACTION CONTEXTUEL (mobile) - GRISE
    // ==========================================================
    var btnAction = document.getElementById('btnActionMobile');

    function updateActionButton() {
        // Page Tableau de bord : AUCUNE ACTION D'AJOUT
        // Le bouton est grise
        btnAction.style.opacity = '0.4';
        btnAction.style.cursor = 'not-allowed';
        btnAction.style.pointerEvents = 'none';
        btnAction.setAttribute('aria-label', 'Aucune action disponible sur cette page');

        // Supprimer les anciens ecouteurs
        btnAction.replaceWith(btnAction.cloneNode(true));
        var newBtn = document.getElementById('btnActionMobile');

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Aucune action disponible sur cette page');
        });
    }

    // ==========================================================
    // DONNEES FACTICES DES VISITES
    // ==========================================================
    var visitesData = [
        { id: 1, titre: 'Visite commerciale - Magasin A', adresse: 'Centre-ville',
            date: '12 juin 2025 a 08:00', statut: 'realise' },
        { id: 2, titre: 'Collecte de commandes - Client B', adresse: 'Bonamoussadi',
            date: '12 juin 2025 a 10:30', statut: 'attente' },
        { id: 3, titre: 'Suivi des retours - Magasin C', adresse: 'Akwa',
            date: '12 juin 2025 a 13:00', statut: 'retard' },
        { id: 4, titre: 'Collecte de paiement - Client D', adresse: 'Bepanda',
            date: '12 juin 2025 a 09:00', statut: 'realise' }
    ];

    // ==========================================================
    // AFFICHER LES VISITES
    // ==========================================================
    function renderVisites() {
        var container = document.getElementById('visitesList');
        var html = '';

        visitesData.forEach(function(v) {
            var statutLabel = v.statut.charAt(0).toUpperCase() + v.statut.slice(1);
            html += '<div class="visite-item" onclick="window.location.href=\'detail-visite.html\'">' +
                '<div class="visite-info">' +
                '<p class="visite-titre">' + v.titre + '</p>' +
                '<p class="visite-adresse"><i class="bi bi-geo-alt" aria-hidden="true"></i> ' + v.adresse + '</p>' +
                '<p class="visite-date"><i class="bi bi-clock" aria-hidden="true"></i> ' + v.date + '</p>' +
                '</div>' +
                '<span class="badge-status ' + v.statut + '">' + statutLabel + '</span>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // ==========================================================
    // STATISTIQUES
    // ==========================================================
    function updateStats() {
        var total = visitesData.length;
        var realisees = visitesData.filter(function(v) { return v.statut === 'realise'; }).length;
        var encours = visitesData.filter(function(v) { return v.statut === 'encours'; }).length;
        var attente = visitesData.filter(function(v) { return v.statut === 'attente'; }).length;

        document.getElementById('totalVisites').textContent = total;
        document.getElementById('realiseesCount').textContent = realisees;
        document.getElementById('encoursCount').textContent = encours;
        document.getElementById('attenteCount').textContent = attente;
    }

    // ==========================================================
    // TOAST
    // ==========================================================
    function showToast(message) {
        var toast = document.createElement('div');
        toast.style.cssText =
            'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: #ffffff; padding: 0.75rem 1.5rem; border-radius: 12px; font-family: Segoe UI, sans-serif; font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; opacity: 0; transition: opacity 0.3s ease; max-width: 90%; text-align: center;';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function() { toast.style.opacity = '1'; }, 50);
        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    // ==========================================================
    // INITIALISATION
    // ==========================================================
    renderVisites();
    updateStats();
    updateActionButton();

    console.log('Tableau de bord charge');
    console.log('' + visitesData.length + ' visites affichees');
});