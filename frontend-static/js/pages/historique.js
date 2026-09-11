// ==========================================================
// HISTORIQUE - SuiviTerrain
// Version 1.0
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // 1. DATE DYNAMIQUE
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
    // 2. MENU HAMBURGER (mobile)
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
    // 3. NOTIFICATIONS (PC + Mobile) → redirection vers notifications.html
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
    // 4. BOUTON D'ACTION CONTEXTUEL (mobile) - GRISÉ
    // ==========================================================
    var btnAction = document.getElementById('btnActionMobile');

    function updateActionButton() {
        // Page Historique : AUCUNE ACTION D'AJOUT
        btnAction.style.opacity = '0.4';
        btnAction.style.cursor = 'not-allowed';
        btnAction.style.pointerEvents = 'none';
        btnAction.setAttribute('aria-label', 'Aucune action disponible sur cette page');

        // Supprimer les anciens écouteurs
        btnAction.replaceWith(btnAction.cloneNode(true));
        var newBtn = document.getElementById('btnActionMobile');

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Aucune action disponible sur cette page');
        });
    }

    // ==========================================================
    // 5. TOAST (notification simple)
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
    // 6. DONNÉES FACTICES (exemple pour l'historique)
    // ==========================================================
    var historiqueData = [
        { id: 1, titre: 'Visite de prospection - Client K', adresse: 'Bassa', agent: 'Zidane Fredy', date: '30 mai 2025', statut: 'planifie' },
        { id: 2, titre: 'Collecte de données - Client L', adresse: 'Akwa', agent: 'Marie Claire', date: '28 mai 2025', statut: 'realisee' },
        { id: 3, titre: 'Visite de suivi - Magasin G', adresse: 'Bonapriso', agent: 'Marie Claire', date: '05 juin 2025', statut: 'realisee' },
        { id: 4, titre: 'Collecte de commandes - Client H', adresse: 'Makepe', agent: 'Jean Dupont', date: '04 juin 2025', statut: 'retard' },
        { id: 5, titre: 'Visite commerciale - Magasin I', adresse: 'Kotto', agent: 'Zidane Fredy', date: '02 juin 2025', statut: 'realisee' },
        { id: 6, titre: 'Collecte de paiement - Client J', adresse: 'Mbangue', agent: 'Sarah Niong', date: '01 juin 2025', statut: 'retard' }
    ];

    // ==========================================================
    // 7. AFFICHAGE DE L'HISTORIQUE
    // ==========================================================
    function renderHistorique(data) {
        var container = document.getElementById('historiqueList');
        if (!container) return;

        var html = '';
        data.forEach(function(item) {
            var statutLabel = item.statut.charAt(0).toUpperCase() + item.statut.slice(1);
            html += '<div class="historique-item" onclick="window.location.href=\'detail-visite.html\'">' +
                '<div class="hi-info">' +
                '<p class="hi-titre">' + item.titre + '</p>' +
                '<p class="hi-detail"><i class="bi bi-geo-alt" aria-hidden="true"></i> ' + item.adresse + ' • ' + item.agent + '</p>' +
                '</div>' +
                '<div class="hi-actions">' +
                '<span class="badge-status ' + item.statut + '">' + statutLabel + '</span>' +
                '<span class="hi-date">' + item.date + '</span>' +
                '</div>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // ==========================================================
    // 8. FILTRES
    // ==========================================================
    var filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');

                var filtre = this.textContent.trim();
                var data = historiqueData;

                if (filtre === 'Toutes') {
                    renderHistorique(data);
                } else if (filtre === 'Aujourd\'hui') {
                    var aujourdhui = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                    var filtered = data.filter(function(item) { return item.date === aujourdhui; });
                    renderHistorique(filtered);
                } else if (filtre === 'Cette semaine') {
                    // Simulé : on garde tout pour l'exemple
                    renderHistorique(data);
                } else if (filtre === 'Ce mois') {
                    renderHistorique(data);
                }
            });
        });
    }

    // ==========================================================
    // 9. RECHERCHE
    // ==========================================================
    var searchInput = document.getElementById('searchHistorique');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var terme = this.value.toLowerCase().trim();
            var filtered = historiqueData.filter(function(item) {
                return item.titre.toLowerCase().includes(terme) ||
                       item.adresse.toLowerCase().includes(terme) ||
                       item.agent.toLowerCase().includes(terme);
            });
            renderHistorique(filtered);
        });
    }

    // ==========================================================
    // 10. INITIALISATION
    // ==========================================================
    renderHistorique(historiqueData);
    updateActionButton();

    console.log('📋 Page Historique chargée');
    console.log('📌 ' + historiqueData.length + ' éléments affichés');
});